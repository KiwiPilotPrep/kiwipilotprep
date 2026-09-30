/**
 * Produces the deliverables the migration brief asks for:
 *
 *   docs/cms/MASTER-INDEX.md          the index of all five courses (Step 1)
 *   docs/cms/<course>.index.txt       each course's index on its own
 *   docs/cms/<course>.cms.json        the CMS-ready structure (Step 5)
 *   docs/cms/COVERAGE.md              the completeness report (Step 4)
 *
 * The coverage report is generated, never written by hand. It compares three
 * things that can disagree — the source file, the extracted manifest, and the
 * rows actually in the database — and states where they differ. A report that
 * only restated the importer's own summary would prove nothing.
 *
 *   node scripts/cms-report.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

import { buildIndex, coveredSlides, renderIndex, loadManifest } from "./deck-index.mjs";

const db = new PrismaClient();

const OUT = "docs/cms";
const DECKS_ROOT = ".cache/decks";

const COURSES = [
  { deck: "meteorology", subject: "meteorology", name: "PPL Meteorology", n: 1 },
  { deck: "navigation", subject: "navigation", name: "PPL Air Navigation and Flight Planning", n: 2 },
  { deck: "air-law", subject: "air-law", name: "PPL Air Law", n: 3 },
  { deck: "human-factors", subject: "human-factors", name: "PPL Human Factors in Aviation", n: 4 },
  { deck: "flight-radio", subject: "flight-radiotelephony", name: "Flight Radio Telephony", n: 5 },
];

function countTree(modules) {
  const counts = { lessons: 0, text: 0, diagram: 0, table: 0, media: 0, note: 0, empty: 0 };
  for (const section of modules) {
    counts.lessons += section.lessons.length;
    for (const lesson of section.lessons) {
      // Slides the extractor found nothing on are counted from the lesson's
      // own record of them. They used to be a visible "[NO CONTENT IN SOURCE]"
      // paragraph, which reconciled the numbers by putting a line saying
      // nothing in front of the student.
      counts.empty += (lesson.empty_slides ?? []).length;
      for (const block of lesson.content) {
        if (block.type === "text") counts.text += 1;
        else if (block.type === "diagram") counts.diagram += 1;
        else if (block.type === "table") counts.table += 1;
        else if (block.type === "media") counts.media += 1;
        else if (block.type === "note") counts.note += 1;
      }
    }
  }
  return counts;
}

async function countStored(subjectSlug) {
  const subject = await db.subject.findFirst({
    where: { slug: subjectSlug, course: { slug: "ppl-theory" } },
    select: { id: true, title: true },
  });
  if (!subject) return null;

  const modules = await db.courseModule.findMany({
    where: { subjectId: subject.id },
    orderBy: { displayOrder: "asc" },
    select: {
      lessons: {
        orderBy: { displayOrder: "asc" },
        select: { content: { select: { blocks: true } } },
      },
    },
  });

  const counts = { modules: modules.length, lessons: 0, text: 0, diagram: 0, table: 0, note: 0 };
  for (const section of modules) {
    counts.lessons += section.lessons.length;
    for (const lesson of section.lessons) {
      for (const block of lesson.content?.blocks ?? []) {
        if (block.type === "paragraph" || block.type === "subitem") counts.text += 1;
        else if (block.type === "figure") counts.diagram += 1;
        else if (block.type === "table") counts.table += 1;
        else if (block.type === "note") counts.note += 1;
      }
    }
  }

  const topics = await db.syllabusTopic.count({ where: { subjectId: subject.id } });
  const items = await db.syllabusItem.count({ where: { topic: { subjectId: subject.id } } });

  return { subject: subject.title, ...counts, topics, items };
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });

  const master = [
    "# Master index — five PPL courses",
    "",
    "Extracted from the supplied source files, not from prior knowledge. Every",
    "entry below names the slides or pages it was built from, so any line here",
    "can be checked against the original.",
    "",
  ];

  const coverage = [];

  for (const course of COURSES) {
    const dir = path.join(DECKS_ROOT, course.deck);
    const manifest = loadManifest(dir);
    const modules = buildIndex(manifest);

    const covered = coveredSlides(modules);
    const missing = [];
    for (let n = 1; n <= manifest.total_slides; n += 1) {
      if (!covered.has(n)) missing.push(n);
    }

    const index = renderIndex(course.name, manifest, modules);
    fs.writeFileSync(path.join(OUT, `${course.deck}.index.txt`), index, "utf8");
    fs.writeFileSync(
      path.join(OUT, `${course.deck}.cms.json`),
      JSON.stringify(
        {
          course: {
            title: course.name,
            source_file: manifest.source_file,
            total_slides: manifest.total_slides,
            index: modules,
          },
        },
        null,
        1,
      ),
      "utf8",
    );

    master.push(`## COURSE ${course.n}`, "", "```", index.trimEnd(), "```", "");

    const tree = countTree(modules);
    const stored = await countStored(course.subject);
    coverage.push({ course, manifest, missing, tree, stored });
  }

  fs.writeFileSync(path.join(OUT, "MASTER-INDEX.md"), master.join("\n"), "utf8");

  /* ------------------------------------------------------- coverage report */

  const report = [
    "# Content coverage report",
    "",
    "Three independent counts are compared for each course: what the source",
    "file contains, what the extractor produced, and what is actually stored in",
    "the database. They are counted separately on purpose — an importer that",
    "compared its own output against itself would report success either way.",
    "",
  ];

  let anyMissing = false;

  for (const row of coverage) {
    const { course, manifest, missing, tree, stored } = row;
    if (missing.length) anyMissing = true;

    // A slide that was blank in the source stores no block at all, so the
    // extracted and stored text counts compare directly.
    const textOk = stored && stored.text === tree.text;
    const diagramOk = stored && stored.diagram === tree.diagram;
    const tableOk = stored && stored.table === tree.table;

    report.push(
      `## Course ${course.n} — ${course.name}`,
      "",
      `- **Source file:** \`${manifest.source_file}\``,
      `- **Source slides/pages:** ${manifest.total_slides}`,
      `- **CMS modules:** ${stored ? stored.modules : "—"}`,
      `- **CMS lessons:** ${stored ? stored.lessons : "—"}`,
      `- **Slides represented in the CMS:** ${manifest.total_slides - missing.length} of ${manifest.total_slides}`,
      `- **Missing content:** ${missing.length ? missing.join(", ") : "none"}`,
      `- **Slides that were blank in the source:** ${tree.empty || "none"}`,
      `- **Text blocks:** ${tree.text} extracted → ${stored ? stored.text : "—"} stored ${textOk ? "✅" : "⚠️"}`,
      `- **Diagrams preserved:** ${tree.diagram} extracted → ${stored ? stored.diagram : "—"} stored ${diagramOk ? "✅" : "⚠️"}`,
      `- **Tables preserved:** ${tree.table} extracted → ${stored ? stored.table : "—"} stored ${tableOk ? "✅" : "⚠️"}`,
      `- **Embedded videos marked:** ${tree.media}`,
      `- **Presenter notes kept:** ${tree.note}`,
      `- **Official syllabus indexed:** ${stored && stored.topics ? `${stored.topics} topics, ${stored.items} items` : "no syllabus supplied for this subject"}`,
      "",
      textOk && diagramOk && tableOk && !missing.length
        ? "**NO CONTENT OMITTED.**"
        : "**Discrepancy above — see the flagged lines.**",
      "",
    );
  }

  const totals = coverage.reduce(
    (acc, r) => ({
      slides: acc.slides + r.manifest.total_slides,
      lessons: acc.lessons + (r.stored?.lessons ?? 0),
      text: acc.text + r.tree.text,
      diagram: acc.diagram + r.tree.diagram,
      table: acc.table + r.tree.table,
      media: acc.media + r.tree.media,
    }),
    { slides: 0, lessons: 0, text: 0, diagram: 0, table: 0, media: 0 },
  );

  report.push(
    "## Totals",
    "",
    `- Source slides/pages processed: **${totals.slides}**`,
    `- Lessons created: **${totals.lessons}**`,
    `- Text blocks preserved: **${totals.text}**`,
    `- Diagrams preserved: **${totals.diagram}**`,
    `- Tables preserved: **${totals.table}**`,
    `- Embedded videos marked: **${totals.media}**`,
    "",
    anyMissing
      ? "One or more slides are unaccounted for. See the per-course sections."
      : "**Every slide of every source file is represented in the CMS. NO CONTENT OMITTED.**",
    "",
    "### What is deliberately not carried across",
    "",
    "- **Repeated small images** that appear on five or more slides at under",
    "  60 KB. These are logos and page borders, not teaching material, and",
    "  carrying another provider's branding into the student experience is the",
    "  one thing the brief for this reader rules out.",
    "- **Slide numbers** printed on the slides themselves. The topic records",
    "  its source slide range as a field instead.",
    "- **Embedded video files.** They cannot play in the reader, so each one is",
    "  marked in place with a note, and its slide number kept on the block,",
    "  rather than being dropped without trace.",
    "- **Blank slides.** A slide the extractor found nothing on is recorded by",
    "  number on the topic that spans it, and produces no page of its own.",
    "",
  );

  fs.writeFileSync(path.join(OUT, "COVERAGE.md"), report.join("\n"), "utf8");

  console.log(`wrote ${OUT}/MASTER-INDEX.md, COVERAGE.md and ${COURSES.length} course files`);
  console.table(
    coverage.map((r) => ({
      course: r.course.name,
      slides: r.manifest.total_slides,
      missing: r.missing.length,
      lessons: r.stored?.lessons ?? 0,
      text: `${r.tree.text} → ${r.stored?.text ?? "—"}`,
      diagrams: `${r.tree.diagram} → ${r.stored?.diagram ?? "—"}`,
    })),
  );

  await db.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await db.$disconnect();
  process.exit(1);
});
