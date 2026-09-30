/**
 * The gate every rebuilt PPL subject has to pass.
 *
 * One script rather than six, because the checks are the same for every
 * subject and a check that only exists for one of them is a check nobody will
 * run on the next. Each section answers a question that, answered wrongly,
 * would mean a student is reading something they should not be:
 *
 *   source      — is every slide of the deck either taught or skipped with a
 *                 written reason, exactly once?
 *   diagrams    — does the number of figures on screen reconcile, from the
 *                 extractor's output through the rejections to the database?
 *   provenance  — is every block labelled source or authored, does every
 *                 source block cite a slide its words are actually on, and does
 *                 no authored block carry a citation at all?
 *   content     — are there hollow lessons, duplicate slugs, repeated
 *                 paragraphs, headings that are not headings?
 *   leakage     — can a student see a CAA requirement code, an objective, an
 *                 academy's name, or the deck's own furniture?
 *
 * Read-only.
 *
 *   node scripts/ppl-validate.mjs [--subject <slug>] [--verbose]
 */
import path from "node:path";
import { PrismaClient } from "@prisma/client";

import { loadManifest } from "./deck-index.mjs";
import { DECKS_ROOT } from "./media-assets.mjs";
import { SUBJECTS } from "../content/ppl/index.mjs";
import { isRejectedImage as atkRejectsImage } from "../content/ppl/diagram-decisions.mjs";

/**
 * The diagram decisions belong to the subject. Aircraft Technical Knowledge
 * was finished before the other five were started and keeps its own module;
 * every subject written since carries the function on the curriculum object.
 */
function rejectsFor(subject) {
  if (subject.slug === "aircraft-technical-knowledge") return atkRejectsImage;
  return subject.isRejectedImage ?? (() => false);
}

/**
 * Lessons that are short on purpose and were accepted as such in review.
 *
 * A signpost topic — "the other controls are flaps and trim tabs, each of
 * which has its own topic below" — is doing its job in one line. Listing them
 * here with the reason keeps the gate strict for everything else rather than
 * loosening the rule until nothing trips it.
 */
const ACCEPTED_THIN = {
  "associated-controls":
    "Names the two controls the rest of the chapter then teaches; a longer version would only preview them twice.",
  "range-and-endurance":
    "Draws the distinction between flying for distance and flying for time; the two topics under it do the work.",
  "climb-performance":
    "Names the three things climb performance is made of, each of which is a topic of its own immediately below.",
};

const db = new PrismaClient();
const COURSE = "ppl-theory";

const flat = (s) => String(s ?? "").replace(/\s+/g, " ").trim();
const key = (s) => flat(s).toLowerCase().replace(/[^a-z0-9]+/g, "");
const slugify = (t) =>
  t.toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);

/** What must never reach a student, and the name to report it under. */
const LEAK_RULES = [
  ["an objective block", /What you need to know/i],
  ["checklist wording", /\b(State|Describe|Explain|Define|Name|List) the (following|purpose|function)\b/],
  ["another academy", /\b(academy|flight school|flying school|aeroclub|aero club)\b/i],
  ["a named third party", /\b(nzicpa|fly8ma|alamy|kotwicki|ontheflightline|shutterstock|getty|vasaviation)\b/i],
  ["deck furniture", /\bSlide No\.?\s*\d|^\s*slide\s*\d+\s*$/im],
  ["a build artefact", /\[object Object\]|(^|[^A-Za-z])NaN([^A-Za-z]|$)|origin"?\s*:\s*"?(source|authored)/],
  ["an authoring note", /\bTODO\b|\bFIXME\b|\bXXX\b/],
  ["a private-use glyph", /[-]/],
];

async function validate(subject, verbose) {
  const row = await db.subject.findFirst({
    where: { slug: subject.slug, course: { slug: COURSE } },
    select: { id: true, title: true, status: true },
  });
  if (!row) throw new Error(`no subject ${subject.slug} in ${COURSE}`);

  const manifest = loadManifest(path.join(DECKS_ROOT, subject.deck));
  const problems = [];
  const note = (what, detail) => problems.push({ what, detail });

  /* ================================================== 1. source coverage */
  const owner = new Map();
  let duplicate = 0;
  for (const c of subject.chapters) {
    for (const t of c.topics) {
      for (const n of t.pages) {
        if (owner.has(n)) {
          duplicate += 1;
          note("a slide claimed twice", `${n}: "${owner.get(n)}" and "${t.title}"`);
        }
        owner.set(n, t.title);
      }
    }
  }
  const skipped = Object.entries(subject.skip ?? {});
  for (const [n, reason] of skipped) {
    if (owner.has(Number(n))) {
      duplicate += 1;
      note("a slide both claimed and skipped", `${n}`);
    }
    if (!reason || flat(reason).length < 12) note("a skip with no usable reason", `${n}`);
    owner.set(Number(n), "(skipped)");
  }
  const unclaimed = [];
  for (let n = 1; n <= manifest.total_slides; n += 1) if (!owner.has(n)) unclaimed.push(n);
  if (unclaimed.length) note("unclaimed slides", unclaimed.join(", "));
  const outOfRange = [...owner.keys()].filter((n) => n < 1 || n > manifest.total_slides);
  if (outOfRange.length) note("slides outside the deck", outOfRange.join(", "));

  /* ================================================== 2. the database */
  const modules = await db.courseModule.findMany({
    where: { subjectId: row.id },
    orderBy: { displayOrder: "asc" },
    select: {
      title: true, summary: true, status: true,
      lessons: {
        orderBy: { displayOrder: "asc" },
        select: {
          slug: true, title: true, status: true, sourceFrom: true, sourceTo: true,
          content: { select: { blocks: true } },
          _count: { select: { mappings: true } },
        },
      },
    },
  });
  const lessons = modules.flatMap((m) => m.lessons.map((l) => ({ ...l, chapter: m.title })));
  const blocksOf = (l) => l.content?.blocks ?? [];

  const wantChapters = subject.chapters.length;
  const wantTopics = subject.chapters.reduce((n, c) => n + c.topics.length, 0);
  if (modules.length !== wantChapters || lessons.length !== wantTopics) {
    note(
      "the database does not match the curriculum",
      `${modules.length}/${lessons.length} in the database, ${wantChapters}/${wantTopics} declared`,
    );
  }

  /* ================================================== 3. diagrams */
  const claimedSlides = new Set(
    subject.chapters.flatMap((c) => c.topics.flatMap((t) => t.pages)),
  );
  const placements = [];
  for (const slide of manifest.slides) {
    for (const pic of slide.pictures ?? []) placements.push({ slide: slide.n, sha1: pic.sha1 });
  }
  const distinct = new Set(placements.map((p) => p.sha1));
  const onClaimed = placements.filter((p) => claimedSlides.has(p.slide));
  const claimedShas = new Set(onClaimed.map((p) => p.sha1));
  const rejects = rejectsFor(subject);
  const expectedDistinct = [...claimedShas].filter((s) => !rejects(s)).length;
  const rejectedOnClaimed = [...claimedShas].filter((s) => rejects(s)).length;

  const renderedIds = new Set();
  let renderedPlacements = 0;
  for (const l of lessons) {
    for (const b of blocksOf(l)) {
      if (b.type !== "figure") continue;
      renderedPlacements += 1;
      renderedIds.add(b.assetId);
    }
  }
  if (renderedIds.size !== expectedDistinct) {
    note(
      "the diagram count does not reconcile",
      `${expectedDistinct} expected on screen, ${renderedIds.size} in the database`,
    );
  }
  const assets = await db.mediaAsset.findMany({
    where: { id: { in: [...renderedIds] } },
    select: { id: true, filename: true, mimeType: true },
  });
  const shaOf = (filename) => filename.replace(/(-r180)?\.[^.]+$/, "");
  const renderedRejects = assets.filter((a) => rejects(shaOf(a.filename)));
  if (renderedRejects.length) note("a rejected figure is on screen", `${renderedRejects.length}`);
  if (assets.length !== renderedIds.size) note("a figure block points at no asset", "");

  /* ================================================== 4. provenance */
  const allowed = new Map();
  const authoredOnly = new Set();
  for (const c of subject.chapters) {
    for (const t of c.topics) {
      allowed.set(slugify(t.title), new Set(t.pages));
      if (!t.pages.length) authoredOnly.add(slugify(t.title));
    }
  }
  const AUTHORED_TYPES = new Set(["keypoints", "context", "misconception", "takeaway", "example", "definition"]);
  const SOURCE_TYPES = new Set(["subheading", "formula"]);
  let sourceBlocks = 0;
  let authoredBlocks = 0;
  for (const l of lessons) {
    const pages = allowed.get(l.slug);
    if (!pages) {
      note("a lesson the curriculum does not declare", l.slug);
      continue;
    }
    for (const b of blocksOf(l)) {
      if (b.origin === "source") {
        sourceBlocks += 1;
        if (!Number.isInteger(b.sourcePage)) note("a source block with no slide", l.slug);
        else if (!pages.has(b.sourcePage)) note("a source block citing another topic's slide", `${l.slug} → ${b.sourcePage}`);
        if (AUTHORED_TYPES.has(b.type)) note("an authored form labelled source", `${l.slug} ${b.type}`);
      } else if (b.origin === "authored") {
        authoredBlocks += 1;
        if (b.sourcePage !== undefined) note("an authored block with a citation", `${l.slug} ${b.type}`);
        if (SOURCE_TYPES.has(b.type)) note("a source form labelled authored", `${l.slug} ${b.type}`);
      } else {
        note("a block with no origin", `${l.slug} ${b.type}`);
      }
    }
    if (authoredOnly.has(l.slug) && (l.sourceFrom !== null || l.sourceTo !== null)) {
      note("an authored-only lesson recording a source range", l.slug);
    }
  }

  /* ================================================== 5. content quality */
  const hollow = lessons.filter((l) => blocksOf(l).length === 0);
  for (const l of hollow) note("a hollow lesson", l.slug);
  // What a student actually gets on the page, source and authored together. A
  // lesson can be short because the slide was short and the point is small;
  // what it may not be is short with nothing to read and nothing to look at.
  const allWordsOf = (l) =>
    blocksOf(l).reduce(
      (n, b) =>
        n +
        flat([b.text, b.title, b.term, ...(b.items ?? []), ...((b.rows ?? []).flat())].filter(Boolean).join(" "))
          .split(/\s+/)
          .filter(Boolean).length,
      0,
    );
  // Two different faults, and they need different tests. A lesson with almost
  // no words and no picture either has nothing on it. A lesson that is all
  // pictures is fine — a chart can be the teaching — unless nobody has said
  // what the student is looking at.
  const FLOOR = 25;
  const thin = lessons.filter(
    (l) => allWordsOf(l) < FLOOR && !blocksOf(l).some((b) => b.type === "figure"),
  );
  const unexplained = lessons.filter((l) => {
    const bs = blocksOf(l);
    const figures = bs.filter((b) => b.type === "figure");
    if (!figures.length) return false;
    const words = bs
      .filter((b) => b.type !== "figure")
      .reduce(
        (n, b) =>
          n +
          flat([b.text, b.title, b.term, ...(b.items ?? []), ...((b.rows ?? []).flat())].filter(Boolean).join(" "))
            .split(/\s+/)
            .filter(Boolean).length,
        0,
      );
    const captioned = figures.filter((b) => flat(b.caption)).length;
    // A picture and almost nothing else. Where there are words around it, or a
    // caption on every figure, the student has been told what they are looking
    // at and the lesson is doing its job however short it is.
    return words < 15 && captioned < figures.length;
  });
  for (const l of unexplained) note("figures with nothing explaining them", l.slug);
  for (const l of thin) {
    if (ACCEPTED_THIN[l.slug]) continue;
    note("a thin lesson with no enrichment", l.slug);
  }

  const slugs = lessons.map((l) => l.slug);
  const dupeSlugs = [...new Set(slugs.filter((s, i) => slugs.indexOf(s) !== i))];
  for (const s of dupeSlugs) note("a duplicate lesson slug", s);
  // A paragraph in two lessons is a fault when the build put it there and a
  // fact when the deck did. The emergency chapter of Flight Radiotelephony says
  // "transmit on the frequency you are currently using" on the MAYDAY slide and
  // again on the PAN-PAN slide, because it is true of both calls. So the check
  // asks the manifest: if each lesson's own slides carry the words, the source
  // repeated itself and the lessons are right to.
  const saidOnSlide = (slideNumber, k) => {
    const slide = manifest.slides[slideNumber - 1];
    if (!slide) return false;
    return (slide.blocks ?? []).some((b) => b.kind === "text" && key(b.text).includes(k));
  };
  const seen = new Map();
  for (const l of lessons) {
    for (const b of blocksOf(l)) {
      if (b.origin !== "source" || !["paragraph", "subitem"].includes(b.type)) continue;
      const k = key(b.text);
      if (k.length < 60) continue;
      const first = seen.get(k);
      if (first && first.slug !== l.slug) {
        const bothInSource = saidOnSlide(first.page, k) && saidOnSlide(b.sourcePage, k);
        if (bothInSource) {
          if (verbose) console.log(`      (the deck says this on both slides: ${first.slug} ↔ ${l.slug})`);
        } else {
          note("a paragraph duplicated across lessons", `${first.slug} ↔ ${l.slug}`);
        }
      } else if (!first) seen.set(k, { slug: l.slug, page: b.sourcePage });
    }
  }
  const noSummary = modules.filter((m) => !flat(m.summary)).length;
  if (noSummary) note("chapters with no summary", `${noSummary}`);

  /* ================================================== 6. leakage */
  const codes = (
    await db.syllabusItem.findMany({
      where: { topic: { subjectId: row.id } },
      select: { code: true },
    })
  ).map((i) => i.code);
  const publishedTopics = await db.syllabusTopic.count({
    where: { subjectId: row.id, status: "PUBLISHED" },
  });
  if (publishedTopics) note("the CAA syllabus is published to students", `${publishedTopics} topics`);

  let leaks = 0;
  for (const l of lessons) {
    const strings = [
      l.title,
      ...blocksOf(l).flatMap((b) => [
        b.text ?? "", b.title ?? "", b.term ?? "", b.caption ?? "",
        ...(b.items ?? []), ...(b.headers ?? []), ...((b.rows ?? []).flat()),
      ]),
    ].filter((x) => typeof x === "string" && x);
    for (const [what, re] of LEAK_RULES) {
      for (const one of strings) {
        const hit = re.exec(one);
        if (!hit) continue;
        leaks += 1;
        note(what, `${l.slug}: "${flat(hit[0]).slice(0, 40)}"`);
        break;
      }
    }
    for (const code of codes) {
      if (strings.some((s) => s.includes(code))) {
        leaks += 1;
        note("a CAA requirement code", `${l.slug}: ${code}`);
        break;
      }
    }
  }

  const mappings = lessons.reduce((n, l) => n + l._count.mappings, 0);

  return {
    slug: subject.slug,
    title: row.title,
    slides: manifest.total_slides,
    claimed: manifest.total_slides - skipped.length,
    skipped: skipped.length,
    duplicate,
    unclaimed: unclaimed.length,
    outOfRange: outOfRange.length,
    chapters: modules.length,
    lessons: lessons.length,
    sourceBlocks,
    authoredBlocks,
    figuresInDeck: distinct.size,
    figuresRejected: rejectedOnClaimed,
    figuresRendered: renderedIds.size,
    placements: renderedPlacements,
    mappings,
    leaks,
    problems,
  };
}

async function main() {
  const only = process.argv.includes("--subject")
    ? process.argv[process.argv.indexOf("--subject") + 1]
    : null;
  const verbose = process.argv.includes("--verbose");
  const chosen = only ? SUBJECTS.filter((s) => s.slug === only) : SUBJECTS;

  const rows = [];
  let failed = 0;
  for (const subject of chosen) {
    const r = await validate(subject, verbose);
    rows.push(r);
    if (r.problems.length) {
      failed += 1;
      console.log(`\n${r.title} — ${r.problems.length} problem(s)`);
      const grouped = new Map();
      for (const p of r.problems) grouped.set(p.what, [...(grouped.get(p.what) ?? []), p.detail]);
      for (const [what, details] of grouped) {
        console.log(`   ${what} — ${details.length}`);
        for (const d of details.slice(0, verbose ? 99 : 4)) if (d) console.log(`      ${d}`);
        if (!verbose && details.length > 4) console.log(`      … and ${details.length - 4} more`);
      }
    } else {
      console.log(`\n${r.title} — clean`);
    }
  }

  console.log();
  console.table(
    rows.map((r) => ({
      subject: r.slug,
      slides: r.slides,
      claimed: r.claimed,
      skipped: r.skipped,
      dup: r.duplicate,
      unclaimed: r.unclaimed,
      chapters: r.chapters,
      lessons: r.lessons,
      source: r.sourceBlocks,
      authored: r.authoredBlocks,
      figures: `${r.figuresRendered}/${r.figuresInDeck}`,
      rejected: r.figuresRejected,
      mappings: r.mappings,
      problems: r.problems.length,
    })),
  );
  await db.$disconnect();
  process.exit(failed ? 1 : 0);
}

main().catch(async (e) => {
  console.error(e);
  await db.$disconnect();
  process.exit(1);
});
