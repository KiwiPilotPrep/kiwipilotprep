/**
 * Writes the record of what the PPL Aircraft Technical Knowledge rebuild
 * produced, and what it decided along the way.
 *
 * The sibling of scripts/cpl-report.mjs and scripts/ir-report.mjs. It reads
 * three things and reconciles them: the extracted source manifest, the
 * curriculum that claims it, and the database rows the build wrote. A report
 * assembled from only one of those would be a restatement rather than a check
 * — this one fails loudly if the course in the database does not match the
 * curriculum on disk.
 *
 * Read-only. Writes docs/cms/PPL-ATK-REBUILD.md. Touches nothing else.
 *
 *   node scripts/ppl-report.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

import { loadManifest } from "./deck-index.mjs";
import { DECKS_ROOT } from "./media-assets.mjs";
import { repairPage } from "../content/ppl/source-repairs.mjs";
import { DROPPED, UPSIDE_DOWN } from "../content/ppl/diagram-decisions.mjs";
import { subject } from "../content/ppl/aircraft-technical-knowledge.mjs";

const db = new PrismaClient();
const OUT = "docs/cms/PPL-ATK-REBUILD.md";
const COURSE = "ppl-theory";

const manifest = loadManifest(path.join(DECKS_ROOT, subject.deck));

/** The repair counts, recomputed page by page rather than remembered. */
function repairTotals() {
  const total = {};
  for (const chapter of subject.chapters) {
    for (const topic of chapter.topics) {
      for (const n of topic.pages) {
        const slide = manifest.slides[n - 1];
        const { counts } = repairPage(slide.blocks, {
          pageTitle: slide.title,
          topicTitle: topic.title,
          page: n,
        });
        for (const [k, v] of Object.entries(counts)) total[k] = (total[k] ?? 0) + v;
      }
    }
  }
  return total;
}

/** How the skipped pages divide up, taken from the reasons themselves. */
function skipClasses() {
  const classes = {};
  for (const reason of Object.values(subject.skip ?? {})) {
    const what = /^Chapter opener/.test(reason)
      ? "chapter openers"
      : /^Section opener/.test(reason)
        ? "section opener"
        : /^Revision card/.test(reason)
          ? "chapter review cards"
          : /^A cue to play/.test(reason)
            ? "classroom video cues"
            : /^The heading/.test(reason)
              ? "headings whose body is overleaf"
              : /^Word-for-word repeat/.test(reason)
                ? "duplicate page"
                : "the deck cover";
    classes[what] = (classes[what] ?? 0) + 1;
  }
  return classes;
}

async function main() {
  const row = await db.subject.findFirst({
    where: { slug: subject.slug, course: { slug: COURSE } },
    select: { id: true, title: true, status: true },
  });
  if (!row) throw new Error(`no subject ${subject.slug} in ${COURSE}`);

  const modules = await db.courseModule.findMany({
    where: { subjectId: row.id },
    orderBy: { displayOrder: "asc" },
    select: {
      title: true,
      status: true,
      lessons: {
        orderBy: { displayOrder: "asc" },
        select: {
          title: true, slug: true, status: true, sourceFrom: true, sourceTo: true,
          content: { select: { blocks: true } },
          _count: { select: { mappings: true } },
        },
      },
    },
  });

  // The database is checked against the curriculum rather than described.
  const wantChapters = subject.chapters.length;
  const wantTopics = subject.chapters.reduce((n, c) => n + c.topics.length, 0);
  const gotTopics = modules.reduce((n, m) => n + m.lessons.length, 0);
  if (modules.length !== wantChapters || gotTopics !== wantTopics) {
    throw new Error(
      `the database has ${modules.length} chapters and ${gotTopics} topics; the curriculum ` +
        `declares ${wantChapters} and ${wantTopics}. Re-run scripts/build-ppl-course.mjs.`,
    );
  }

  let blocks = 0;
  let figures = 0;
  let authored = 0;
  let headings = 0;
  const distinctFigures = new Set();
  const empty = [];
  for (const m of modules) {
    for (const l of m.lessons) {
      const bs = l.content?.blocks ?? [];
      if (bs.length === 0) empty.push(l.title);
      blocks += bs.length;
      figures += bs.filter((b) => b.type === "figure").length;
      headings += bs.filter((b) => b.type === "subheading").length;
      authored += bs.filter((b) => b.origin === "authored").length;
      for (const b of bs) if (b.type === "figure") distinctFigures.add(b.assetId);
    }
  }

  const topics = await db.syllabusTopic.groupBy({
    by: ["status"],
    where: { subjectId: row.id },
    _count: true,
  });
  const mappings = await db.lessonSyllabusItem.count({
    where: { lesson: { module: { subjectId: row.id } } },
  });

  const repairs = repairTotals();
  const skips = skipClasses();
  const claimed = manifest.total_slides - Object.keys(subject.skip ?? {}).length;

  const out = [];
  const w = (line = "") => out.push(line);

  w("# PPL Aircraft Technical Knowledge — the rebuild");
  w();
  w("Generated by `scripts/ppl-report.mjs` from the extracted source, the curriculum in");
  w("`content/ppl/aircraft-technical-knowledge.mjs`, and the rows in the database. If the three");
  w("disagree, the script fails rather than writing this file.");
  w();
  w("## What changed");
  w();
  w("This subject had no course. Forty-two published CAA syllabus topics, two hundred and ten items,");
  w("fourteen fragments of study content, **no chapters and no lessons** — its material had been");
  w("attached to the syllabus rows themselves, so a student who had paid for PPL theory opened");
  w("Aircraft Technical Knowledge and was handed the regulator's examination checklist.");
  w();
  w("| | Before | After |");
  w("| --- | ---: | ---: |");
  w(`| Chapters | 0 | ${modules.length} |`);
  w(`| Lessons | 0 | ${gotTopics} |`);
  w(`| Content blocks | 0 | ${blocks} |`);
  w(`| Diagrams | 0 | ${figures} |`);
  w(`| Lesson → syllabus item mappings | 0 | ${mappings} |`);
  w(
    `| Published CAA syllabus topics | 42 | ${topics.find((t) => t.status === "PUBLISHED")?._count ?? 0} |`,
  );
  w();
  w("The syllabus rows are archived, not deleted: every row, every id and every mapping survives,");
  w("and `scripts/ppl-visibility.mjs --revert` puts the status back. The subject id is unchanged, so");
  w("entitlements keyed on it and every existing route keep working.");
  w();
  w(`Of the ${blocks} blocks a student now reads, ${blocks - authored} are the source book's own words`);
  w(`and ${authored} are authored teaching apparatus — the lead paragraph that says what a topic is`);
  w("for, key points, worked examples, what to hold on to, and where people go wrong. Every block");
  w("carries which of the two it is, so they never blur together in later editing.");
  w();
  w("## The source, page by page");
  w();
  w(`**${manifest.total_slides} pages. ${claimed} claimed by a topic, ${manifest.total_slides - claimed} skipped with a reason.**`);
  w("The build refuses to finish if that does not add up, so no page of the book quietly failed to");
  w("make it into the course. `docs/cms/PPL-ATK-COVERAGE.md` classifies every page; this is what the");
  w("curriculum then did with them.");
  w();
  w("| Skipped | Pages | Why |");
  w("| --- | ---: | --- |");
  const skipWhy = {
    "chapter openers": "A chapter name over an empty page. The name is kept as course structure.",
    "section opener": "Announces the book's second half. Structural furniture.",
    "chapter review cards":
      "Expected to be question material; opened, every one is a title card with no questions under it.",
    "classroom video cues": "An instruction to play a video in class. No video came with the book.",
    "headings whose body is overleaf": "A heading alone on a page; it survives as the topic title.",
    "duplicate page": "Word for word the same as an earlier page.",
    "the deck cover": "The subject name and the exam format, which the course page states already.",
  };
  for (const [what, n] of Object.entries(skips).sort((a, b) => b[1] - a[1])) {
    w(`| ${what} | ${n} | ${skipWhy[what] ?? ""} |`);
  }
  w();
  w("The 35 picture-only pages are **not** in that list. Each is a figure whose explanation sits on");
  w("the page before or after it, so each is claimed by the topic that explains it and lands beside");
  w("its own text.");
  w();
  w("## What the PDF broke, and what was done about it");
  w();
  w("A 506-page PDF has no idea what a heading, a list or a table is. Every repair below removes,");
  w("rejoins or re-assembles; none rewrites. Where the source is broken in a way that cannot be");
  w("repaired without inventing text, it is left alone and the sense is supplied in an authored");
  w("block, which is tagged as authored.");
  w();
  w("| Repair | Count | What it was |");
  w("| --- | ---: | --- |");
  w(
    `| List items restored | ${repairs.bullets ?? 0} | The book's bullets are Wingdings — U+F084, which renders as nothing. A third of the deck was written as lists and none of it looked like one. |`,
  );
  w(
    `| Headings kept | ${headings} | The first line of a page, emitted as a heading where the book set it as one. The repair pass found ${repairs.headings ?? 0}; the build drops one where the same heading opens the next page of the same topic. |`,
  );
  w(
    `| Heading echoes removed | ${repairs.echoes ?? 0} | The same heading again as a WordArt copy, which arrives as a paragraph shouting in the middle of the page. |`,
  );
  w(
    `| Sentences rejoined | ${repairs.joined ?? 0} | A text frame ends where the layout ended it: "This will upset the mixture in the" + "Carburettor and can result in rough running." |`,
  );
  w(
    `| Figure labels removed | ${repairs.callouts ?? 0} | Words printed beside a picture — "Normal", "Piston" under two photographs of pistons — that reached the extractor as prose. |`,
  );
  w(
    `| Tables rebuilt | ${repairs.tables ?? 0} | The flight-controls summary, the ISA temperature ladder and the worked centre of gravity calculation, each flattened into loose cells. |`,
  );
  w(
    `| Equations rebuilt | ${repairs.formulas ?? 0} | The centripetal force equation, whose numerator became the page title and whose denominator became the first paragraph. |`,
  );
  w(
    `| Page numbers stripped | ${repairs.footers ?? 0} | "15-1" and "15-3", printed in the corner of the page and read as body text. |`,
  );
  w(
    `| CAA objectives removed | ${repairs.objectives ?? 0} | The book quotes the requirement it is about to answer, code and all: "12.4.2 Name the principal gases which constitute the atmosphere." The teaching under it stays; the checklist does not reach a student. |`,
  );
  w();
  w("## The diagrams");
  w();
  w(
    `The source holds 579 distinct images. **${distinctFigures.size} of them reach a student** — ` +
      `${figures} placements across the course — while ${Object.keys(DROPPED).length} are rejected, and ` +
      `${Object.keys(UPSIDE_DOWN).length} are turned the right way up before they are stored.`,
  );
  w();
  w("Every one was put on a contact sheet and looked at, which mattered: the measurement pass had");
  w("flagged 205 images as mirrored heading reflections and thirteen of them turned out to be real");
  w("diagrams — the angle of attack sequence on page 34, the flaps-up-flaps-down camber comparison on");
  w("page 43, the control column drawing on page 308. Those are kept. What is rejected is");
  w("overwhelmingly one artefact: 186 pale upside-down WordArt copies of chapter headings, which");
  w("carry nothing at all. The rest are named one at a time in");
  w("`content/ppl/diagram-decisions.mjs` — a stock library watermark, another academy's wordmark, a");
  w("presenter's photograph, a bare red arrow that pointed at something on a page it is no longer on.");
  w();
  w("The twelve rotated figures are a different fault. A PDF may embed an image any way round and");
  w("place it with a transform; the extractor gets the stored bytes. Those twelve read perfectly in");
  w("the book and arrived here upside down — a bourdon tube with \"pointer shaft\" written upside down");
  w("under it. They are real teaching diagrams, so the build rotates them rather than dropping them.");
  w();
  w("## The course");
  w();
  w("Chapter by chapter, with the source pages each topic was built from.");
  w();
  for (const [i, m] of modules.entries()) {
    w(`### ${String(i + 1).padStart(2, "0")}. ${m.title}`);
    w();
    const chapter = subject.chapters[i];
    if (chapter?.intro) w(`${chapter.intro}`);
    w();
    w("| Topic | Source pages | Blocks | Diagrams |");
    w("| --- | --- | ---: | ---: |");
    for (const [j, l] of m.lessons.entries()) {
      const bs = l.content?.blocks ?? [];
      const declared = subject.chapters[i].topics[j].pages;
      const pages = declared.length ? declared.join(", ") : "— authored";
      w(`| ${l.title} | ${pages} | ${bs.length} | ${bs.filter((b) => b.type === "figure").length} |`);
    }
    w();
    w(`Syllabus coverage declared: ${(chapter?.syllabus ?? []).map((c) => `\`${c}\``).join(", ")}`);
    w();
  }

  if (empty.length) {
    w("## Topics with no content");
    w();
    for (const e of empty) w(`- ${e}`);
    w();
  }

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, out.join("\n") + "\n");
  console.log(
    `wrote ${OUT} — ${modules.length} chapters, ${gotTopics} topics, ${blocks} blocks, ${figures} diagrams`,
  );
  await db.$disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await db.$disconnect();
  process.exit(1);
});
