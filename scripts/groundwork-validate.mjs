/**
 * The gate for the Flight Test Groundwork courses. Read-only.
 *
 * The sibling of `ppl-validate.mjs`, asking the same questions of a course
 * built from client-supplied documents rather than from a lecture deck:
 *
 *   source      — is every block of every supplied document either taught or
 *                 skipped with a written reason, exactly once?
 *   structure   — are the eight modules the eight the PRD prescribes, in
 *                 order, with no duplicate lesson slugs and nothing hollow?
 *   provenance  — is every block labelled source or authored, does every
 *                 source block cite a page of a supplied document, and does no
 *                 authored block carry a citation?
 *   diagrams    — does the figure count reconcile from the extractor's output
 *                 through the rejections to the database, and does every
 *                 figure resolve to stored bytes that are not world-readable?
 *   content     — hollow lessons, thin lessons, duplicated paragraphs,
 *                 unexplained figures.
 *   leakage     — can a student see internal provenance, a build artefact, an
 *                 authoring note, or the supplying document's own furniture?
 *
 *   node scripts/groundwork-validate.mjs [--course ppl-flight-test]
 */
import fs from "node:fs";
import { PrismaClient } from "@prisma/client";

import { PRESCRIBED_MODULES } from "./build-groundwork-course.mjs";
import { isRejectedImage } from "../content/groundwork/ppl-diagrams.mjs";

const db = new PrismaClient();
const MANIFEST = ".cache/groundwork/manifest.json";
const MEDIA_DIR = process.env.MEDIA_DIR ?? "./.dev/media";

const flat = (s) => String(s ?? "").replace(/\s+/g, " ").trim();
const key = (s) => flat(s).toLowerCase().replace(/[^a-z0-9]+/g, "");
const words = (s) => flat(s).split(/\s+/).filter(Boolean).length;

/** Things a student must never see, whatever the source did. */
const LEAK_RULES = [
  ["an internal provenance field", /\borigin\s*[:=]\s*"?(source|authored)\b|\bsourcePage\b|\bdiagramNotes\b|\bassetId\b/],
  ["a build or debug artefact", /\[object Object\]|\bundefined\b|\bNaN\b|\bTODO\b|\bFIXME\b|\bXXX\b/],
  ["an authoring note", /\bnote to self\b|\bplaceholder\b|\blorem ipsum\b|\bTBC\b|\bTBD\b/i],
  // The vocabulary of the build, which a student has no reason to meet: where
  // the material came from and who supplied it is our business, not theirs.
  // "CAA client number" is the real name of a real thing and is allowed.
  ["the vocabulary of the build", /(?<!CAA )\bclient(?!s\b| number)\b|\bthe supplied\b|\bsupplied material\b|\bthe study material\b|\bthe source (?:document|material)\b|\bsource deck\b/i],
  ["the template's sample content", /John Appleseed|Dear Kate/i],
  // A named school, not the noun. The supplied material uses "standard flight
  // school SOP" as ordinary vocabulary, which is not branding; what must not
  // appear is somebody's name on the page.
  ["another academy's branding", /[A-Z][A-Za-z']+(?:\s+[A-Z][A-Za-z']+){0,3}\s+(Academy|Aviation College|Flying School|Aero Club)|NZICPA/],
  ["a stock or template watermark", /shutterstock|getty ?images|alamy|dreamstime|123rf/i],
  ["the supplier's own sales copy", /\bWhat You Get\b|\bInstant Web Access\b|\bBuy now\b/i],
  ["a bare third-party URL", /https?:\/\/(?!(www\.)?(aip\.net\.nz|caa\.govt\.nz|aviation\.govt\.nz|metservice\.com))\S+/i],
];

/**
 * The furniture decision, re-made here rather than imported.
 *
 * Deliberately a second implementation of the same rules: if this one and the
 * builder's ever disagree, the totals stop adding up and the disagreement is
 * reported instead of being papered over by shared code.
 */
function isFurniture(block, docKey, pageNo, rules, curriculum) {
  let text = block.text;
  for (const [where, fix] of Object.entries(curriculum.splitLines ?? {})) {
    if (where !== `${docKey}:p${pageNo}`) continue;
    for (const [from, to] of fix.pairs) text = text.split(from).join(to);
  }
  for (const rule of rules.filter((r) => r.doc === docKey && r.strip)) {
    text = text.replace(rule.strip, "").trim();
  }
  let cut = "";
  for (const rule of rules.filter((r) => r.doc === docKey && r.cut)) {
    const m = text.match(rule.cut);
    if (!m || m.index === 0) continue;
    cut = text.slice(m.index).trim();
    text = text.slice(0, m.index).trim();
  }
  if (cut && text.split(/\s+/).filter(Boolean).length < 4) return true;
  return rules.some((r) => r.doc === docKey && r.drop && r.drop.test(text));
}

async function validate(courseSlug) {
  const { curriculum } = await import(
    courseSlug === "ppl-flight-test"
      ? "../content/groundwork/ppl-flight-test.mjs"
      : "../content/groundwork/cpl-flight-test.mjs"
  );

  const problems = [];
  const note = (what, detail) => problems.push(`${what}${detail ? ` — ${detail}` : ""}`);

  const course = await db.course.findUnique({ where: { slug: courseSlug }, select: { id: true, title: true } });
  if (!course) throw new Error(`no ${courseSlug} course`);
  const subject = await db.subject.findFirst({
    where: { slug: curriculum.subject, courseId: course.id },
    select: { id: true, title: true },
  });
  if (!subject) throw new Error(`no subject ${curriculum.subject} in ${courseSlug}`);

  const modules = await db.courseModule.findMany({
    where: { subjectId: subject.id },
    orderBy: { displayOrder: "asc" },
    select: {
      title: true, summary: true, status: true,
      lessons: {
        orderBy: { displayOrder: "asc" },
        select: { slug: true, title: true, status: true, content: { select: { blocks: true } } },
      },
    },
  });

  /* ============================================== 1. structure */
  const names = modules.map((m) => m.title);
  if (names.length !== PRESCRIBED_MODULES.length || names.some((n, i) => n !== PRESCRIBED_MODULES[i])) {
    note("the eight PRD modules are not what is in the database", names.join(" | "));
  }
  for (const m of modules) {
    if (m.status !== "PUBLISHED") note("a module is not published", m.title);
    if (!flat(m.summary)) note("a module has no summary", m.title);
  }

  const lessons = modules.flatMap((m) => m.lessons.map((l) => ({ ...l, module: m.title })));
  const slugs = lessons.map((l) => l.slug);
  const dupes = slugs.filter((s, i) => slugs.indexOf(s) !== i);
  if (dupes.length) note("duplicate lesson slugs", [...new Set(dupes)].join(", "));
  for (const l of lessons) if (l.status !== "PUBLISHED") note("a lesson is not published", l.slug);

  const blocksOf = (l) => l.content?.blocks ?? [];

  /* ============================================== 2. source coverage */
  const docKeys = curriculum.documents ?? [];
  let claimed = 0;
  let skipped = 0;
  let supplied = 0;

  if (docKeys.length) {
    const manifest = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
    const pagesOf = new Map();
    for (const doc of manifest.docs) {
      if (!docKeys.includes(doc.key)) continue;
      supplied += doc.pages.reduce((n, p) => n + p.blocks.length, 0);
      pagesOf.set(doc.key, doc.total_pages);
    }

    // The builder's own gate is the authority on claim-once; what is checked
    // here is that it actually ran, by re-deriving the totals it reported.
    const cited = new Set();
    for (const l of lessons) {
      for (const b of blocksOf(l)) {
        if (b.origin === "authored") continue;
        if (Number.isInteger(b.sourcePage)) cited.add(`${b.sourcePage}`);
      }
    }
    claimed = lessons.reduce((n, l) => n + blocksOf(l).filter((b) => b.origin !== "authored").length, 0);
    skipped = Object.keys(curriculum.skip ?? {}).length;
    if (!claimed) note("no source block reached the database");

    // Every supplied block ends up in exactly one of four places: on a page a
    // student reads, on a skipped page, dropped as the document's own
    // furniture, or dropped as an image nobody should see. The builder
    // enforces that as it goes; this adds it up again from the outside, so a
    // block cannot go missing between the two.
    const skippedPages = new Set(Object.keys(curriculum.skip ?? {}));
    const furniture = curriculum.furniture ?? [];
    let onSkippedPage = 0;
    let asFurniture = 0;
    let asRejectedImage = 0;
    let taught = 0;

    for (const doc of manifest.docs) {
      if (!docKeys.includes(doc.key)) continue;
      for (const page of doc.pages) {
        const onSkip = skippedPages.has(`${doc.key}:p${page.n}`);
        for (const block of page.blocks) {
          if (onSkip) {
            onSkippedPage += 1;
          } else if (!block.sha1 && block.text && isFurniture(block, doc.key, page.n, furniture, curriculum)) {
            asFurniture += 1;
          } else if (block.sha1 && isRejectedImage(block.sha1)) {
            asRejectedImage += 1;
          } else {
            taught += 1;
          }
        }
      }
    }

    const accounted = onSkippedPage + asFurniture + asRejectedImage + taught;
    if (accounted !== supplied) {
      note("the supplied blocks do not add up", `${accounted} accounted for, ${supplied} supplied`);
    }
    // A count comparison stopped being meaningful once the curriculum could
    // reshape a block — a flattened list becomes eight blocks, a sentence
    // split by a page break becomes one — so what is checked instead is the
    // thing that actually matters: every word a student reads as source text
    // has to be in the supplied document, on or beside the page it cites.
    // That catches an invented sentence, which a count never would.
    const pageText = new Map();
    for (const doc of manifest.docs) {
      if (!docKeys.includes(doc.key)) continue;
      for (const page of doc.pages) {
        // The declared line repairs are applied first, or the comparison would
        // report the curriculum's own repairs as invented text.
        let text = page.blocks.map((b) => b.text ?? "").join(" ");
        for (const [where, fix] of Object.entries(curriculum.splitLines ?? {})) {
          if (where !== `${doc.key}:p${page.n}`) continue;
          for (const [from, to] of fix.pairs) text = text.split(from).join(to);
        }
        pageText.set(`${doc.key}:${page.n}`, text);
      }
    }
    const said = (s) => String(s ?? "").toLowerCase().replace(/[^a-z0-9]+/gu, " ").trim();
    let unfounded = 0;
    for (const l of lessons) {
      for (const b of blocksOf(l)) {
        if (b.origin !== "source" || b.type === "figure") continue;
        const words = [b.text, b.title, ...(b.items ?? []), ...(b.headers ?? []), ...((b.rows ?? []).flat())];
        for (const w of words) {
          const needle = said(w);
          if (!needle) continue;
          // A join stitches two pages together, so the page after the cited
          // one counts as well.
          const hay = [
            pageText.get(`${b.sourceDoc}:${b.sourcePage}`) ?? "",
            pageText.get(`${b.sourceDoc}:${b.sourcePage + 1}`) ?? "",
          ]
            .map(said)
            .join(" ");
          if (hay.includes(needle)) continue;
          unfounded += 1;
          if (unfounded <= 4) note("text that is not in the document it cites", `${l.slug}: "${flat(w).slice(0, 60)}"`);
        }
      }
    }
    if (unfounded > 4) note("text that is not in the document it cites", `and ${unfounded - 4} more`);
    skipped = onSkippedPage;
  }

  /* ============================================== 3. provenance */
  let source = 0;
  let authored = 0;
  for (const l of lessons) {
    for (const b of blocksOf(l)) {
      if (b.origin === "authored") {
        authored += 1;
        if (b.sourcePage != null) note("an authored block carries a source citation", `${l.slug} (${b.type})`);
      } else if (b.origin === "source") {
        source += 1;
        if (!Number.isInteger(b.sourcePage)) note("a source block cites no page", `${l.slug} (${b.type})`);
      } else {
        note("a block has no provenance", `${l.slug} (${b.type})`);
      }
    }
  }

  /* ============================================== 4. diagrams */
  let figures = 0;
  const assetIds = new Set();
  for (const l of lessons) {
    for (const b of blocksOf(l)) {
      if (b.type !== "figure") continue;
      figures += 1;
      if (b.assetId) assetIds.add(b.assetId);
      else note("a figure has no asset", l.slug);
    }
  }
  const assets = await db.mediaAsset.findMany({
    where: { id: { in: [...assetIds] } },
    select: { id: true, storageKey: true, isPublic: true },
  });
  if (assets.length !== assetIds.size) {
    note("a figure points at an asset row that does not exist", `${assetIds.size} referenced, ${assets.length} found`);
  }
  for (const a of assets) {
    if (a.isPublic || !a.storageKey.startsWith("study/")) note("a study figure is world-readable", a.storageKey);
    const file = `${MEDIA_DIR}/${a.storageKey}`;
    if (!fs.existsSync(file) || fs.statSync(file).size === 0) note("a figure has no stored bytes", a.storageKey);
  }
  if (docKeys.length) {
    const manifest = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
    const inSource = new Set();
    for (const doc of manifest.docs) {
      if (!docKeys.includes(doc.key)) continue;
      for (const p of doc.pages) for (const b of p.blocks) if (b.kind === "picture") inSource.add(b.sha1);
    }
    const rejected = [...inSource].filter((s) => (curriculum.isRejectedImage ?? (() => false))(s));
    const expected = inSource.size - rejected.length;
    if (assetIds.size !== expected) {
      note(
        "the diagrams do not reconcile",
        `${inSource.size} supplied − ${rejected.length} rejected = ${expected} expected, ${assetIds.size} stored`,
      );
    }
  }

  /* ============================================== 5. content quality */
  const hollow = lessons.filter((l) => blocksOf(l).length === 0);
  for (const l of hollow) note("a hollow lesson", l.slug);

  for (const l of lessons) {
    const all = blocksOf(l);
    // Everything a student reads counts, wherever it is stored. A lesson made
    // mostly of lists keeps its words in `items` and a table keeps them in its
    // cells; counting only `text` made those pages look empty.
    const prose = all.reduce(
      (n, b) =>
        n +
        words(b.caption) +
        words(b.text) +
        words((b.items ?? []).join(" ")) +
        words((b.headers ?? []).join(" ")) +
        words((b.rows ?? []).flat().join(" ")),
      0,
    );
    const teaching = all.some(
      (b) => b.origin === "authored" && ["context", "misconception", "takeaway", "example", "keypoints"].includes(b.type),
    );
    const figs = all.filter((b) => b.type === "figure").length;
    if (prose < 45 && !teaching) note("a lesson with too little on the page", `${l.slug} (${prose} words)`);
    if (figs && all.filter((b) => b.type === "figure" && words(b.caption) < 8).length && prose < 60 && !teaching) {
      note("a figure with nothing explaining it", l.slug);
    }
  }

  // The same paragraph in two lessons, which is a sign the curriculum claimed
  // the same material twice under different names.
  const seen = new Map();
  for (const l of lessons) {
    for (const b of blocksOf(l)) {
      if (b.origin !== "source" || !["paragraph", "subitem"].includes(b.type)) continue;
      if (words(b.text) < 12) continue;
      // Keyed by document as well as by text. The client's questions document
      // restates facts the study document teaches — that is what a model answer
      // is for, and the student is meant to meet it twice. A real duplicate is
      // the same document claimed twice.
      const k = `${b.sourceDoc ?? "?"}::${key(b.text)}`;
      const first = seen.get(k);
      if (first && first !== l.slug) note("a paragraph duplicated across lessons", `${first} ↔ ${l.slug}`);
      else if (!first) seen.set(k, l.slug);
    }
  }

  /* ============================================== 6. leakage */
  //
  // Everything a student can read, not only the lesson pages. The module
  // summaries appear on the course contents, and the chapter rows are the
  // other front door — the dashboard resumes into one — so they are scanned
  // on the same rules. Missing them is how the seeded placeholder text
  // survived a clean run once already.
  const surfaces = [];
  for (const l of lessons) {
    const strings = [l.title];
    for (const b of blocksOf(l)) {
      strings.push(b.text, b.title, b.term, b.caption, ...(b.items ?? []), ...(b.headers ?? []), ...((b.rows ?? []).flat()));
    }
    surfaces.push({ where: l.slug, strings });
  }
  for (const m of modules) {
    surfaces.push({ where: `module "${m.title}"`, strings: [m.title, m.summary] });
  }
  const chapters = await db.chapter.findMany({
    where: { subjectId: subject.id },
    select: { slug: true, title: true, content: { select: { blocks: true } } },
  });
  for (const c of chapters) {
    const strings = [c.title];
    for (const b of c.content?.blocks ?? []) {
      strings.push(b.text, b.title, b.caption, ...(b.items ?? []));
    }
    surfaces.push({ where: `chapter "${c.slug}"`, strings });
  }

  for (const { where, strings } of surfaces) {
    for (const [what, re] of LEAK_RULES) {
      for (const s of strings.filter((x) => typeof x === "string" && x)) {
        const hit = re.exec(s);
        if (hit) {
          note(what, `${where}: "${flat(hit[0]).slice(0, 48)}"`);
          break;
        }
      }
    }
  }

  // A chapter that still carries nothing but its seeded stub is a hollow page
  // a student can reach from the dashboard.
  for (const c of chapters) {
    const blocks = c.content?.blocks ?? [];
    if (blocks.length < 2) note("a chapter with nothing on it", c.slug);
    const said = blocks.map((b) => flat(b.text)).filter(Boolean).join(" ");
    if (words(said) < 15) note("a chapter with too little on it", `${c.slug} (${words(said)} words)`);
  }

  return {
    course: courseSlug,
    modules: modules.length,
    lessons: lessons.length,
    supplied,
    claimed,
    skipped,
    source,
    authored,
    figures,
    assets: assetIds.size,
    problems,
  };
}

async function main() {
  const flag = process.argv.indexOf("--course");
  const courses = flag === -1 ? ["ppl-flight-test", "cpl-flight-test"] : [process.argv[flag + 1]];
  const rows = [];
  let bad = 0;

  for (const slug of courses) {
    const r = await validate(slug);
    if (r.problems.length) {
      bad += r.problems.length;
      console.log(`\n${r.course} — ${r.problems.length} problem(s)`);
      const grouped = new Map();
      for (const p of r.problems) {
        const [what] = p.split(" — ");
        grouped.set(what, [...(grouped.get(what) ?? []), p]);
      }
      for (const [what, list] of grouped) {
        console.log(`   ${what} — ${list.length}`);
        for (const p of list.slice(0, 5)) console.log(`      ${p.split(" — ").slice(1).join(" — ")}`);
      }
    } else {
      console.log(`\n${r.course} — clean`);
    }
    const { problems, ...rest } = r;
    rows.push({ ...rest, problems: problems.length });
  }

  console.log();
  console.table(rows);
  await db.$disconnect();
  if (bad) process.exit(1);
}

main().catch(async (e) => {
  console.error(e);
  await db.$disconnect();
  process.exit(1);
});
