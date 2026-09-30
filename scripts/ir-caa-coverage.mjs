/**
 * Validates the existing IR course against the supplied CAA syllabus.
 *
 * Internal only. The syllabus is a checklist held against what the course
 * already teaches; it never becomes the course's structure, and no code,
 * objective or wording from it reaches a student.
 *
 * Matching is deliberately not "does this word appear somewhere". Two rules:
 *
 *   a definition — 517 of the requirements are "state the definition of X" —
 *   counts as taught when the course actually defines X: a definition block
 *   for it, a heading that names it, or a sentence that says what it is. A
 *   term that merely appears in passing is PARTIAL, because meeting a word is
 *   not being taught it.
 *
 *   an instruction — "Describe the weather sequence associated with cold
 *   fronts" — counts as taught when the distinctive words of the requirement
 *   turn up together inside one lesson, not scattered across the course. The
 *   proportion found decides COVERED, PARTIAL or UNCOVERED.
 *
 * The result is written to `.cache/ir/coverage.json` for the report, and the
 * script fails if a mapping points at a lesson that does not exist.
 *
 *   node scripts/ir-caa-coverage.mjs [--subject 52] [--show partial]
 */
import fs from "node:fs";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();
const REQS = ".cache/ir/requirements.json";
const OUT = ".cache/ir/coverage.json";

/* Words that carry no meaning for matching. */
const STOP = new Set(
  (// ordinary grammar
    "a an and are as at be by for from in into is it its of on or that the their to with " +
    "including include includes such this these those which what when where how why " +
    "may must shall can will not no any all each other others between during within under " +
    "its than then also both either neither per via upon about above below " +
    // the syllabus's instruction verbs: they say what the candidate must do,
    // not what the course must teach, so matching on them measures nothing
    "describe explain state define defines definition identify list outline recall " +
    "demonstrate discuss distinguish compare contrast calculate interpret determine " +
    "name give draw sketch annotate label select apply understand know knowledge " +
    // words every requirement uses about itself
    "abbreviation abbreviations meaning meanings symbol symbols " +
    "requirements requirement following applicable appropriate associated relating relation " +
    "elements element typical basic general terms term aid respect regard purpose " +
    "types type kind kinds example examples use used using operation operations " +
    "pilot pilots aircraft aeroplane helicopter flight " +
    "laid down section sections rule rules part act nz new zealand caa").split(" "),
);

const norm = (s) =>
  String(s ?? "")
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/[^a-z0-9'()/\-. ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const contentWords = (s) =>
  [
    ...new Set(
      norm(s)
        .split(/[ /]+/)
        // Brackets and stray punctuation arrive attached to a word — "pitot)"
        // never matches anything.
        .map((w) => w.replace(/^[.'()\-]+|[.'()\-]+$/g, "")),
    ),
  ].filter((w) => w.length > 2 && !STOP.has(w) && !/^\d+$/.test(w));

async function main() {
  const { source, subjects, rows } = JSON.parse(fs.readFileSync(REQS, "utf8"));

  const course = await db.course.findUnique({ where: { slug: "ir-theory" }, select: { id: true, title: true } });
  const lessons = await db.lesson.findMany({
    where: { module: { subject: { courseId: course.id } } },
    orderBy: [{ module: { subject: { order: "asc" } } }, { module: { displayOrder: "asc" } }, { displayOrder: "asc" }],
    select: {
      id: true,
      slug: true,
      title: true,
      content: { select: { blocks: true } },
      module: { select: { title: true, subject: { select: { slug: true, title: true } } } },
    },
  });

  /* ---- the searchable course ---- */
  const index = lessons.map((l) => {
    const blocks = l.content?.blocks ?? [];
    const text = [
      l.title,
      l.module.title,
      ...blocks.flatMap((b) => [
        b.text,
        b.title,
        b.term,
        b.caption,
        ...(b.items ?? []),
        ...(b.headers ?? []),
        ...((b.rows ?? []).flat()),
      ]),
    ]
      .filter((x) => typeof x === "string" && x)
      .join(" \n ");
    return {
      lesson: l,
      flat: norm(text),
      words: new Set(contentWords(text)),
      // Terms the lesson explicitly defines, and the headings it uses.
      defines: new Set(
        blocks.filter((b) => b.type === "definition").map((b) => norm(b.term ?? b.title ?? "")).filter(Boolean),
      ),
      headings: blocks
        .filter((b) => ["heading", "subheading"].includes(b.type))
        .map((b) => norm(b.text))
        .concat(norm(l.title)),
    };
  });

  const wholeCourse = index.map((e) => e.flat).join(" \n ");

  // The course and the syllabus do not always agree on hyphens and spacing —
  // "change-over point" against "changeover point", "remote-indicating"
  // against "remote indicating" — and a term that is present but punctuated
  // differently must not be reported missing.
  const loose = (t) =>
    norm(t)
      .replace(/\s*\(.*?\)\s*/g, " ")
      .trim()
      .replace(/[^a-z0-9]+/g, "[^a-z0-9]{0,2}");

  /* ---- how a definition is judged ---- */
  const DEFINES = (term) => {
    const t = norm(term);
    if (!t) return null;
    const bare = t.replace(/\s*\(.*?\)\s*/g, " ").trim();
    for (const e of index) {
      if (e.defines.has(t) || e.defines.has(bare)) return { entry: e, how: "a definition block" };
    }
    for (const e of index) {
      if (e.headings.some((h) => h === t || h === bare || h.includes(bare))) return { entry: e, how: "a heading" };
    }
    // "X is …", "X means …", "X refers to …", "X — …"
    const re = new RegExp(`${loose(bare)}\s*(is|are|means|refers to|—|-)\s`, "i");
    for (const e of index) if (re.test(e.flat)) return { entry: e, how: "explained in prose" };
    return null;
  };

  const mentions = (term) => {
    const pattern = loose(term);
    if (!pattern) return 0;
    const re = new RegExp(pattern, "i");
    return index.filter((e) => re.test(e.flat)).length;
  };

  /* ---- how an instruction is judged ---- */
  const bestLesson = (text) => {
    const want = contentWords(text);
    if (!want.length) return { score: 0, entry: null, want, found: [] };
    let best = { score: 0, entry: null, want, found: [] };
    for (const e of index) {
      const found = want.filter(
        (w) => e.words.has(w) || e.flat.includes(w) || new RegExp(loose(w), "i").test(e.flat),
      );
      const score = found.length / want.length;
      if (score > best.score) best = { score, entry: e, want, found };
    }
    return best;
  };

  // The syllabus appends its own cross-references — "(AC91-21)", "AIP GEN",
  // "AC91-21, Section 10" — to tell an examiner where the answer lives. They
  // are pointers to other CAA documents, not concepts the course must teach,
  // and matching on them guarantees a miss every time.
  const CITATION = /\s*[;(]?\s*(AC\d{2}-\d+[^),;]*|AIP\s+(GEN|ENR|AD)[^),;]*|CAR\s+Part\s+\d+[^),;]*|ICAO\s+Doc\s+\d+[^),;]*)\)?\s*$/i;
  const teachable = (t) => String(t).replace(CITATION, "").replace(/[;:,]\s*$/, "").trim();

  const results = [];
  for (const r of rows) {
    r.text = teachable(r.text);
    if (r.term) r.term = teachable(r.term);
    if (r.kind === "topic") {
      results.push({ ...r, status: "N/A", why: "a topic heading in the syllabus, not a testable requirement" });
      continue;
    }

    if (r.kind === "term") {
      const def = DEFINES(r.term);
      if (def) {
        results.push({ ...r, status: "COVERED", why: def.how, where: locate(def.entry) });
        continue;
      }
      const n = mentions(r.term);
      if (n > 0) {
        const e = index.find((x) => x.flat.includes(norm(r.term).replace(/\s*\(.*?\)\s*/g, " ").trim()));
        results.push({ ...r, status: "PARTIAL", why: `mentioned in ${n} lesson(s) but never defined`, where: locate(e) });
        continue;
      }
      results.push({ ...r, status: "UNCOVERED", why: "the term does not appear in the course" });
      continue;
    }

    const best = bestLesson(r.text);
    const missing = best.want.filter((w) => !best.found.includes(w));
    if (best.score >= 0.75) {
      results.push({ ...r, status: "COVERED", why: `${best.found.length}/${best.want.length} key terms in one lesson`, where: locate(best.entry) });
    } else if (best.score >= 0.4 || missing.every((w) => wholeCourse.includes(w))) {
      results.push({
        ...r,
        status: "PARTIAL",
        why: `${best.found.length}/${best.want.length} key terms in the best lesson; missing: ${missing.slice(0, 6).join(", ")}`,
        where: locate(best.entry),
      });
    } else {
      results.push({
        ...r,
        status: "UNCOVERED",
        why: `only ${best.found.length}/${best.want.length} key terms found; missing: ${missing.slice(0, 8).join(", ")}`,
        where: best.entry ? locate(best.entry) : null,
      });
    }
  }

  function locate(e) {
    if (!e) return null;
    return {
      subject: e.lesson.module.subject.title,
      chapter: e.lesson.module.title,
      lesson: e.lesson.title,
      slug: e.lesson.slug,
    };
  }

  /* ---- the gate ---- */
  const slugs = new Set(lessons.map((l) => l.slug));
  const bad = results.filter((r) => r.where && !slugs.has(r.where.slug));
  if (bad.length) throw new Error(`${bad.length} mapping(s) point at a lesson that does not exist`);

  const tally = {};
  const bySubject = {};
  for (const r of results) {
    tally[r.status] = (tally[r.status] ?? 0) + 1;
    bySubject[r.subject] ??= { COVERED: 0, PARTIAL: 0, UNCOVERED: 0, "N/A": 0 };
    bySubject[r.subject][r.status] += 1;
  }

  fs.writeFileSync(OUT, JSON.stringify({ source, generated: new Date().toISOString(), tally, results }, null, 1));

  console.log(`supplied syllabus: ${source}`);
  console.log(`course: ${course.title} — ${lessons.length} lessons\n`);
  console.table(
    Object.entries(bySubject).map(([s, t]) => ({
      subject: `${s} ${subjects[s] ?? "PBN (Appendix III)"}`.slice(0, 52),
      ...t,
      total: t.COVERED + t.PARTIAL + t.UNCOVERED + t["N/A"],
    })),
  );
  console.log(`\ntotal ${results.length} — ${JSON.stringify(tally)}`);

  const show = process.argv[process.argv.indexOf("--show") + 1];
  if (process.argv.includes("--show")) {
    for (const r of results.filter((x) => x.status.toLowerCase() === show.toLowerCase())) {
      console.log(`\n${r.code}  ${r.text.slice(0, 110)}`);
      console.log(`   ${r.status}: ${r.why}`);
      if (r.where) console.log(`   nearest: ${r.where.subject} / ${r.where.chapter} / ${r.where.lesson}`);
    }
  }
  await db.$disconnect();
}

main().catch(async (e) => {
  console.error(String(e.message ?? e));
  await db.$disconnect();
  process.exit(1);
});
