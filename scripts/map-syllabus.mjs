/**
 * Proposes which lesson teaches each syllabus item — Phase 1 of the mapping.
 *
 * Nothing this writes is visible to a student. Every row lands as PROPOSED,
 * and the reader only ever follows CONFIRMED links, so a bad proposal costs a
 * reviewer thirty seconds rather than sending someone who lost marks on 8.10.14
 * to a page that does not teach it.
 *
 * The output that matters most is not the matches. It is the list of syllabus
 * items that nothing in the deck plausibly teaches: those are examinable topics
 * the material does not cover, and until now there was no way to see them.
 *
 *   node scripts/map-syllabus.mjs            propose, and write the review file
 *   node scripts/map-syllabus.mjs --dry-run  report only, write nothing
 */
import fs from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

import {
  buildIdf,
  scoreLesson,
  alignModules,
  bandOf,
  proposalsFor,
} from "./syllabus-match.mjs";

const db = new PrismaClient();
const OUT = "docs/cms";

/** Body text is capped per lesson: past a point it is all noise. */
const BODY_CHARS = 1400;

function bodyText(blocks) {
  if (!Array.isArray(blocks)) return "";
  const parts = [];
  let length = 0;
  for (const block of blocks) {
    const text = typeof block?.text === "string" ? block.text : "";
    if (!text) continue;
    parts.push(text);
    length += text.length;
    if (length >= BODY_CHARS) break;
  }
  return parts.join(" ");
}

async function mapSubject(subject, { dryRun }) {
  const [topics, modules] = await Promise.all([
    db.syllabusTopic.findMany({
      where: { subjectId: subject.id, status: "PUBLISHED" },
      orderBy: { displayOrder: "asc" },
      select: {
        code: true,
        title: true,
        items: {
          where: { status: "PUBLISHED" },
          orderBy: { displayOrder: "asc" },
          select: { id: true, code: true, requirement: true },
        },
      },
    }),
    db.courseModule.findMany({
      where: { subjectId: subject.id, status: "PUBLISHED" },
      orderBy: { displayOrder: "asc" },
      select: {
        id: true,
        title: true,
        lessons: {
          where: { status: "PUBLISHED" },
          orderBy: { displayOrder: "asc" },
          select: {
            id: true,
            slug: true,
            title: true,
            sourceFrom: true,
            content: { select: { blocks: true } },
          },
        },
      },
    }),
  ]);

  const lessons = modules.flatMap((m) =>
    m.lessons.map((l) => ({
      id: l.id,
      slug: l.slug,
      title: l.title,
      slide: l.sourceFrom,
      moduleId: m.id,
      moduleTitle: m.title,
      body: bodyText(l.content?.blocks),
    })),
  );

  if (!topics.length || !lessons.length) {
    return { subject, topics, lessons, rows: [], gaps: [], alignment: new Map() };
  }

  // Rarity is measured against this subject's own lessons. A word that is
  // distinctive in meteorology is not distinctive in air law, and a corpus
  // pooled across subjects would blunt exactly the terms doing the work.
  const idf = buildIdf(lessons.map((l) => `${l.title} ${l.body}`));

  const alignment = alignModules({
    topics: topics.map((t) => ({ code: t.code, title: t.title })),
    modules: modules.map((m) => ({ id: m.id, title: m.title })),
    idf,
  });

  const rows = [];
  const gaps = [];

  for (const topic of topics) {
    const alignedModuleId = alignment.get(topic.code) ?? null;

    for (const item of topic.items) {
      const scored = lessons.map((lesson) => {
        const { score, titleScore, bodyScore } = scoreLesson({
          requirement: item.requirement,
          lessonTitle: lesson.title,
          lessonBody: lesson.body,
          idf,
          sameSection: alignedModuleId !== null && lesson.moduleId === alignedModuleId,
        });
        return { lesson, score, titleScore, bodyScore };
      });

      const proposals = proposalsFor(scored);
      if (!proposals.length) {
        gaps.push({ topic, item });
        continue;
      }

      for (const proposal of proposals) {
        const evidence = [
          `title ${proposal.titleScore.toFixed(2)}`,
          `body ${proposal.bodyScore.toFixed(2)}`,
          alignedModuleId && proposal.lesson.moduleId === alignedModuleId
            ? `in aligned module "${proposal.lesson.moduleTitle}"`
            : "outside the aligned module",
        ].join(" · ");

        rows.push({
          topic,
          item,
          lesson: proposal.lesson,
          score: proposal.score,
          band: bandOf(proposal.score),
          evidence,
        });
      }
    }
  }

  if (!dryRun) {
    // Persist which module covers each topic. Worth storing rather than
    // recomputing, because the reader needs it: an item with no confirmed
    // lesson can still say which part of the course covers its topic, which is
    // true at that level and far better than an empty page.
    //
    // Title alignment answers this for about half the topics -- a deck section
    // called "The Pilot" does not look like a syllabus topic called
    // "Eligibility, Privileges and Limitations", however plainly it covers it.
    // So where titles do not agree, the topic's own proposals are counted
    // instead: every item of a topic proposes a lesson, and the module those
    // proposals land in is where the topic is taught. Weak proposals are poor
    // evidence about a single item and good evidence in aggregate.
    const covering = new Map();
    for (const topic of topics) {
      let moduleId = alignment.get(topic.code) ?? null;

      if (!moduleId) {
        const votes = new Map();
        for (const row of rows) {
          if (row.topic.code !== topic.code) continue;
          const id = row.lesson.moduleId;
          votes.set(id, (votes.get(id) ?? 0) + row.score);
        }
        const ranked = [...votes].sort((a, b) => b[1] - a[1]);
        const [winner, weight] = ranked[0] ?? [];
        const runnerUp = ranked[1]?.[1] ?? 0;

        // Where the topic's material concentrates in one module. A near-tie
        // means the topic is genuinely split, and the interpolation below is a
        // better answer for that case than picking one half of it.
        if (winner && weight >= 0.5 && weight >= runnerUp * 1.4) moduleId = winner;
      }

      covering.set(topic.code, moduleId);
    }

    // Anything still unplaced takes the module its neighbours are in.
    //
    // A deck teaches a subject in roughly syllabus order, so a topic sitting
    // between two topics that both resolve to "Passengers" is taught in
    // "Passengers", whatever its own title happens to say. This is what closes
    // the topics that have no proposals of their own at all -- a topic nothing
    // matched has no votes to count, and leaving it unplaced leaves its items
    // with nowhere to point.
    const order = topics.map((t) => t.code);
    for (let i = 0; i < order.length; i += 1) {
      if (covering.get(order[i])) continue;

      let before = null;
      for (let j = i - 1; j >= 0; j -= 1) {
        if (covering.get(order[j])) { before = covering.get(order[j]); break; }
      }
      let after = null;
      for (let j = i + 1; j < order.length; j += 1) {
        if (covering.get(order[j])) { after = covering.get(order[j]); break; }
      }

      // Both neighbours agreeing is the confident case. Where they disagree the
      // topic sits on a boundary; the one before it is the better guess,
      // because a deck introduces a section before it moves on from it.
      covering.set(order[i], before && after && before === after ? before : (before ?? after));
    }

    for (const topic of topics) {
      await db.syllabusTopic.updateMany({
        where: { subjectId: subject.id, code: topic.code },
        data: { moduleId: covering.get(topic.code) ?? null },
      });
    }

    // Proposals are replaced wholesale on each run, but a link a person has
    // already ruled on is left alone — re-running the matcher must never
    // silently undo a review.
    await db.lessonSyllabusItem.deleteMany({
      where: {
        status: "PROPOSED",
        item: { topic: { subjectId: subject.id } },
      },
    });

    for (const row of rows) {
      await db.lessonSyllabusItem.upsert({
        where: {
          lessonId_syllabusItemId: { lessonId: row.lesson.id, syllabusItemId: row.item.id },
        },
        // Every PROPOSED row for this subject was deleted above, so anything
        // this upsert collides with has already been ruled on. Leave it
        // completely alone: refreshing its numbers would overwrite the method
        // and evidence of a hand-authored link, which is the only record of
        // where that section's material came from.
        update: {},
        create: {
          lessonId: row.lesson.id,
          syllabusItemId: row.item.id,
          confidence: row.score,
          evidence: row.evidence,
          method: "auto",
          status: "PROPOSED",
        },
      });
    }
  }

  return { subject, topics, lessons, rows, gaps, alignment };
}

function renderReview(results, courseTitle) {
  const lines = [
    `# ${courseTitle} — lesson ↔ syllabus mapping, for review`,
    "",
    "Every link below is **PROPOSED**. None is visible to a student, and the",
    "study reader ignores anything that is not CONFIRMED. Nothing here changes",
    "what the site does until a person says so.",
    "",
    "Read it in two passes. The **coverage gaps** at the top of each subject are",
    "the important part: those are examinable syllabus items that nothing in the",
    "lecture deck plausibly teaches. The proposals below them are the ordinary",
    "review — confirm, correct, or reject.",
    "",
    "Confidence bands: **strong** ≥ 0.62 · **likely** ≥ 0.40 · **weak** ≥ 0.22.",
    "A `weak` proposal is a suggestion, not a claim.",
    "",
  ];

  for (const result of results) {
    const { subject, topics, lessons, rows, gaps, alignment } = result;
    if (!topics.length) {
      lines.push(
        `## ${subject.title}`,
        "",
        "_No syllabus was supplied for this subject, so there is nothing to map to._",
        "",
      );
      continue;
    }
    if (!lessons.length) {
      lines.push(`## ${subject.title}`, "", "_No imported lessons in this subject._", "");
      continue;
    }

    const items = topics.reduce((n, t) => n + t.items.length, 0);
    const byBand = { strong: 0, likely: 0, weak: 0 };
    const itemsWithProposal = new Set();
    for (const row of rows) {
      byBand[row.band] += 1;
      itemsWithProposal.add(row.item.code);
    }

    lines.push(
      `## ${subject.title}`,
      "",
      `${items} syllabus items · ${lessons.length} lessons · ${topics.length} topics aligned to ${alignment.size} deck modules`,
      "",
      `| | Items | Share |`,
      `|---|---|---|`,
      `| Covered by at least one proposal | ${itemsWithProposal.size} | ${Math.round((itemsWithProposal.size / items) * 100)}% |`,
      `| **No lesson found — coverage gap** | **${gaps.length}** | ${Math.round((gaps.length / items) * 100)}% |`,
      "",
      `Proposals: ${byBand.strong} strong · ${byBand.likely} likely · ${byBand.weak} weak`,
      "",
    );

    if (gaps.length) {
      lines.push(
        "### Coverage gaps — examinable, not taught by the deck",
        "",
        "| Code | Requirement | Topic |",
        "|---|---|---|",
      );
      for (const gap of gaps) {
        const req = gap.item.requirement.split("\n")[0].replace(/\|/g, "\\|").slice(0, 110);
        lines.push(`| \`${gap.item.code}\` | ${req} | ${gap.topic.code} ${gap.topic.title} |`);
      }
      lines.push("");
    }

    lines.push("### Proposed links", "", "| Code | Requirement | → Lesson | Slide | Band | Score |", "|---|---|---|---|---|---|");
    for (const row of rows) {
      const req = row.item.requirement.split("\n")[0].replace(/\|/g, "\\|").slice(0, 78);
      const title = row.lesson.title.replace(/\|/g, "\\|").slice(0, 60);
      lines.push(
        `| \`${row.item.code}\` | ${req} | ${title} | ${row.lesson.slide ?? "—"} | ${row.band} | ${row.score.toFixed(2)} |`,
      );
    }
    lines.push("");
  }

  return lines.join("\n");
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");

  // Both licence levels go through the same matcher. Rarity is measured per
  // subject, so a CPL subject is never scored against PPL vocabulary.
  const courseSlug = process.argv.includes("--course")
    ? process.argv[process.argv.indexOf("--course") + 1]
    : "ppl-theory";

  const course = await db.course.findUnique({
    where: { slug: courseSlug },
    select: { title: true },
  });
  if (!course) throw new Error(`Course not found: ${courseSlug}`);

  const subjects = await db.subject.findMany({
    where: { course: { slug: courseSlug }, status: "PUBLISHED" },
    orderBy: { order: "asc" },
    select: { id: true, slug: true, title: true },
  });

  const results = [];
  for (const subject of subjects) {
    process.stdout.write(`mapping ${subject.title} ... `);
    const result = await mapSubject(subject, { dryRun });
    process.stdout.write(
      result.topics.length && result.lessons.length
        ? `${result.rows.length} proposals, ${result.gaps.length} gaps\n`
        : "skipped\n",
    );
    results.push(result);
  }

  fs.mkdirSync(OUT, { recursive: true });
  const file = courseSlug === "ppl-theory" ? "SYLLABUS-MAP.md" : `SYLLABUS-MAP-${courseSlug}.md`;
  fs.writeFileSync(path.join(OUT, file), renderReview(results, course.title), "utf8");

  console.table(
    results
      .filter((r) => r.topics.length && r.lessons.length)
      .map((r) => {
        const items = r.topics.reduce((n, t) => n + t.items.length, 0);
        const covered = new Set(r.rows.map((row) => row.item.code)).size;
        const bands = { strong: 0, likely: 0, weak: 0 };
        for (const row of r.rows) bands[row.band] += 1;
        return {
          subject: r.subject.title,
          items,
          covered,
          gaps: r.gaps.length,
          strong: bands.strong,
          likely: bands.likely,
          weak: bands.weak,
        };
      }),
  );

  console.log(
    `\n${dryRun ? "dry run — nothing written to the database. " : ""}Review file: ${OUT}/${file}`,
  );
  await db.$disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await db.$disconnect();
  process.exit(1);
});
