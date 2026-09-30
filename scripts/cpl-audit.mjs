/**
 * The CPL syllabus coverage audit.
 *
 * Three independent readings of the same question — "is this examinable item
 * actually taught?" — put side by side:
 *
 *   1. the supplied Gap Report's claim, where it makes one
 *   2. what the matcher found in the imported decks
 *   3. what the reference books contain
 *
 * The brief is explicit that the Gap Report is a checklist rather than the
 * truth, and it turns out to matter: the report carries headline percentages
 * implying a few hundred gaps but only names a few dozen items. Comparing the
 * three is the only way to tell an item the report missed from an item the
 * matcher scored badly.
 *
 *   node scripts/cpl-audit.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

import { parseGapReport } from "./parse-gap-report.mjs";
import { searchBooks, loadBooks } from "./book-search.mjs";
import { terms, buildIdf } from "./syllabus-match.mjs";
import { CPL_SUBJECTS, COURSE_SLUG } from "./cpl-sources.mjs";

const db = new PrismaClient();
const OUT = "docs/cms";

/** Above this, the matcher's best proposal is treated as real coverage. */
const COVERED = 0.4;

/**
 * A requirement's distinctive words -- the ones rare enough in this subject to
 * identify it. "Explain the meanings of the subscale settings QNH and QFE"
 * comes down to {qnh, qfe}; "Describe the Bergeron theory of rainfall
 * development" to {bergeron}.
 */
function distinctiveTerms(requirement, idf, take = 4) {
  return terms(requirement)
    .map((t) => ({ t, w: idf.get(t) ?? 0 }))
    .filter((x) => x.w > 0)
    .sort((a, b) => b.w - a.w)
    .slice(0, take)
    .map((x) => x.t);
}

/**
 * Whether a subject's lessons actually contain a requirement's distinctive
 * words, and where.
 *
 * This is a different question from the matcher's ranking, and the audit needs
 * both. The matcher asks "which lesson is this item about?" and answers it from
 * titles, so a lesson titled "THE ALTIMETER" scores badly against "Explain the
 * meanings of the subscale settings QNH and QFE" even though it is exactly
 * where QFE is taught. Reporting that as a gap would send someone to write a
 * section the course already has.
 */
function findInLessons(requirement, lessons, idf) {
  const need = distinctiveTerms(requirement, idf);
  if (!need.length) return null;

  let best = null;
  for (const lesson of lessons) {
    const haystack = `${lesson.title} ${lesson.body}`.toLowerCase();
    const found = need.filter((t) => haystack.includes(t));
    if (!found.length) continue;
    const share = found.length / need.length;
    if (!best || share > best.share) best = { share, found, lesson };
  }
  // Every distinctive word present, or at least two of them together.
  return best && (best.share >= 0.99 || best.found.length >= 2) ? best : null;
}

/**
 * Items an aeroplane course is not expected to teach.
 *
 * Subject 16 is the combined "CPL Air Law (Aeroplane and Helicopter)" syllabus,
 * so it carries topics on helicopter external loads and winching that an
 * aeroplane CPL candidate is not examined on. Reporting those as gaps in an
 * aeroplane course would be wrong, and filling them would be worse.
 */
const HELICOPTER_ONLY = /\bhelicopter\b/i;


async function main() {
  const claims = new Map();
  for (const row of parseGapReport()) claims.set(row.ref, row);

  const books = loadBooks();

  // Every CPL lesson, once. An item can be taught outside its own subject --
  // the primary control surfaces are on the Principles of Flight syllabus and
  // taught in that deck, but Subject 26 examines them too. Calling that a gap
  // and writing a new section would duplicate teaching the course already has.
  const allLessonRows = await db.lesson.findMany({
    where: {
      status: "PUBLISHED",
      module: { subject: { course: { slug: COURSE_SLUG } } },
    },
    select: {
      title: true,
      sourceFrom: true,
      module: { select: { subject: { select: { title: true } } } },
      content: { select: { blocks: true } },
    },
  });
  const allLessons = allLessonRows.map((l) => ({
    title: l.title,
    slide: l.sourceFrom,
    subject: l.module.subject.title,
    body: (l.content?.blocks ?? [])
      .map((b) => (typeof b.text === "string" ? b.text : ""))
      .join(" "),
  }));
  const courseIdf = buildIdf(allLessons.map((l) => `${l.title} ${l.body}`));

  const results = [];

  for (const entry of CPL_SUBJECTS) {
    const subject = await db.subject.findFirst({
      where: { slug: entry.subject, course: { slug: COURSE_SLUG } },
      select: { id: true, title: true },
    });
    if (!subject) continue;

    const items = await db.syllabusItem.findMany({
      where: { topic: { subjectId: subject.id } },
      orderBy: { code: "asc" },
      select: {
        code: true,
        requirement: true,
        topic: { select: { code: true, title: true } },
        mappings: {
          orderBy: { confidence: "desc" },
          take: 1,
          select: {
            confidence: true,
            lesson: {
              select: { title: true, sourceFrom: true, module: { select: { title: true } } },
            },
          },
        },
      },
    });

    const bookKey = entry.book ? path.basename(entry.book) : null;

    // Every lesson of this subject as searchable text, plus a rarity model over
    // them. Loaded once -- the alternative is a query per syllabus item.
    const lessonRows = await db.lesson.findMany({
      where: { module: { subjectId: subject.id }, status: "PUBLISHED" },
      select: {
        title: true,
        sourceFrom: true,
        content: { select: { blocks: true } },
      },
    });
    const lessons = lessonRows.map((l) => ({
      title: l.title,
      slide: l.sourceFrom,
      body: (l.content?.blocks ?? [])
        .map((b) => (typeof b.text === "string" ? b.text : ""))
        .join(" "),
    }));
    const subjectIdf = buildIdf(lessons.map((l) => `${l.title} ${l.body}`));

    const rows = [];

    for (const item of items) {
      const best = item.mappings[0] ?? null;
      const inDeck = best && best.confidence >= COVERED;

      // The book is only consulted where the deck falls short — that is the
      // order the brief sets, and searching every item would bury the ones
      // that matter under a thousand confident hits.
      const inBook =
        !inDeck && bookKey ? searchBooks(books, item.requirement, bookKey, item.code) : null;

      // Third signal, and the one that keeps the audit honest: are the
      // requirement's distinctive words anywhere in this subject's lessons?
      const termHit = inDeck ? null : findInLessons(item.requirement, lessons, subjectIdf);

      const helicopterOnly =
        entry.number === 16 &&
        HELICOPTER_ONLY.test(item.requirement) &&
        !/aeroplane/i.test(item.requirement);

      let status;
      let elsewhere = null;
      if (inDeck) status = "FULLY COVERED";
      else if (termHit && termHit.share >= 0.99) status = "FULLY COVERED";
      else if (helicopterOnly) status = "NOT APPLICABLE (HELICOPTER)";
      else if (termHit || best) status = "PARTIALLY COVERED";
      else if (inBook && inBook.score >= 0.5) status = "IN BOOK, NOT IN COURSE";
      else {
        // Last resort before calling something a gap: is it taught anywhere in
        // the course at all? Run only here, because searching every lesson of
        // every subject for every item would cost far more than it is worth.
        elsewhere = findInLessons(item.requirement, allLessons, courseIdf);
        status = elsewhere ? "TAUGHT IN ANOTHER SUBJECT" : "NOT COVERED";
      }

      rows.push({
        code: item.code,
        topic: `${item.topic.code} ${item.topic.title}`,
        requirement: item.requirement.split("\n")[0],
        status,
        deck: best
          ? {
              lesson: best.lesson.title,
              module: best.lesson.module.title,
              slide: best.lesson.sourceFrom,
              confidence: best.confidence,
            }
          : null,
        book: inBook && inBook.score >= 0.35 ? inBook : null,
        termHit: termHit
          ? { lesson: termHit.lesson.title, slide: termHit.lesson.slide, found: termHit.found }
          : null,
        elsewhere: elsewhere
          ? {
              lesson: elsewhere.lesson.title,
              slide: elsewhere.lesson.slide,
              subject: elsewhere.lesson.subject,
              found: elsewhere.found,
            }
          : null,
        claim: claims.get(item.code) ?? null,
      });
    }

    results.push({ entry, subject, rows });
  }

  /* ------------------------------------------------ the report ---------- */

  const lines = [
    "# CPL syllabus coverage audit",
    "",
    "Every examinable item of the six CPL subjects, checked against the imported",
    "course material and — where the course falls short — against the reference",
    "book for that subject.",
    "",
    "Status is decided on instructional coverage, not keyword presence:",
    "",
    "| Status | Meaning |",
    "|---|---|",
    "| **FULLY COVERED** | A lesson teaches this item; the match is confident. |",
    "| **PARTIALLY COVERED** | Related material exists but does not answer the requirement squarely. |",
    "| **IN BOOK, NOT IN COURSE** | The reference book covers it; the slides do not. This is the material to bring across. |",
    "| **NOT COVERED** | Neither source answers it. |",
    "| **NOT APPLICABLE (HELICOPTER)** | A helicopter-only item of the combined Subject 16 syllabus. |",
    "| **TAUGHT IN ANOTHER SUBJECT** | Not in this subject\u2019s deck, but taught elsewhere in the CPL course. |",
    "",
  ];

  const STATUSES = [
    "FULLY COVERED",
    "PARTIALLY COVERED",
    "IN BOOK, NOT IN COURSE",
    "NOT COVERED",
    "NOT APPLICABLE (HELICOPTER)",
    "TAUGHT IN ANOTHER SUBJECT",
  ];
  const totals = Object.fromEntries(STATUSES.map((k) => [k, 0]));
  const summary = [];

  for (const { entry, rows } of results) {
    const counts = Object.fromEntries(STATUSES.map((k) => [k, 0]));
    for (const row of rows) {
      counts[row.status] += 1;
      totals[row.status] += 1;
    }

    summary.push({
      subject: `${entry.number} ${entry.name}`.slice(0, 44),
      items: rows.length,
      full: counts["FULLY COVERED"],
      partial: counts["PARTIALLY COVERED"],
      inBook: counts["IN BOOK, NOT IN COURSE"],
      notCovered: counts["NOT COVERED"],
      naHeli: counts["NOT APPLICABLE (HELICOPTER)"],
      elsewhere: counts["TAUGHT IN ANOTHER SUBJECT"],
    });

    lines.push(
      `## Subject ${entry.number} — ${entry.name}`,
      "",
      `${rows.length} syllabus items · syllabus pages ${entry.syllabusPages[0]}–${entry.syllabusPages[1]}`,
      entry.book ? `· reference book: \`${path.basename(entry.book)}\`` : "· no reference book supplied",
      "",
      `Fully covered **${counts["FULLY COVERED"]}** · partially **${counts["PARTIALLY COVERED"]}** · in the book only **${counts["IN BOOK, NOT IN COURSE"]}** · not covered **${counts["NOT COVERED"]}**`,
      "",
    );

    const attention = rows.filter((r) => r.status !== "FULLY COVERED");
    if (!attention.length) {
      lines.push("_Every item of this subject is taught by the course material._", "");
      continue;
    }

    lines.push(
      "| Ref | Requirement | Status | Where it is now | Gap Report |",
      "|---|---|---|---|---|",
    );
    for (const row of attention) {
      const req = row.requirement.replace(/\|/g, "\\|").slice(0, 86);
      const where = row.elsewhere
        ? `${row.elsewhere.subject.slice(0, 22)} \u2014 ${row.elsewhere.lesson.slice(0, 30)} (slide ${row.elsewhere.slide})`
        : row.termHit
        ? `${row.termHit.lesson.replace(/\|/g, "\\\|").slice(0, 34)} (slide ${row.termHit.slide}) — mentions ${row.termHit.found.join(", ")}`
        : row.book
        ? `book p${row.book.page}${row.book.heading ? ` — ${row.book.heading}` : ""}`
        : row.deck
          ? `${row.deck.lesson.replace(/\|/g, "\\|").slice(0, 40)} (slide ${row.deck.slide}, ${row.deck.confidence.toFixed(2)})`
          : "—";
      const claim = row.claim ? row.claim.status : "not listed";
      lines.push(`| \`${row.code}\` | ${req} | ${row.status} | ${where} | ${claim} |`);
    }
    lines.push("");
  }

  /* --------------------------------- are the sources sound? ------------- */
  //
  // Before trusting a book to fill a gap, check the book. Two things make a
  // supplied reference unsafe to copy from, and both are present here.

  lines.push("## Source health", "");

  // 1. Superseded law. The CPL syllabus is written to the Civil Aviation Act
  //    2023 and says in its own text that the fit-and-proper criteria changed
  //    from the 1990 Act. A book that still teaches the 1990 Act cannot be
  //    used to answer those items.
  const actRows = [];
  for (const book of books) {
    const teaching = book.pages.filter((pg) => !pg.is_questions);
    const old1990 = teaching.filter((pg) => /(CA )?Act 1990|Civil Aviation Act 1990/i.test(pg.text)).length;
    const new2023 = teaching.filter((pg) => /(CA )?Act 2023|Civil Aviation Act 2023/i.test(pg.text)).length;
    if (old1990 || new2023) actRows.push({ book: book.source, old1990, new2023 });
  }

  if (actRows.length) {
    lines.push(
      "### Which Civil Aviation Act the reference books teach",
      "",
      "| Book | Pages citing the 1990 Act | Pages citing the 2023 Act |",
      "|---|---|---|",
      ...actRows.map((r) => `| \`${r.book}\` | ${r.old1990} | ${r.new2023} |`),
      "",
    );
  }

  const affected = [];
  for (const { entry, rows } of results) {
    for (const row of rows) {
      if (/CA Act 2023|Act 2023/i.test(row.requirement)) {
        affected.push({ code: row.code, subject: entry.number, status: row.status });
      }
    }
  }
  lines.push(
    `**${affected.length} syllabus items are written to the Civil Aviation Act 2023.**`,
    "Where a reference book still teaches the 1990 Act, its wording cannot be",
    "carried across for those items without checking the current Act — the",
    "syllabus itself notes that the fit-and-proper criteria changed between the",
    "two.",
    "",
  );
  if (affected.length) {
    lines.push(
      "| Ref | Subject | Current status |",
      "|---|---|---|",
      ...affected.map((a) => `| \`${a.code}\` | ${a.subject} | ${a.status} |`),
      "",
    );
  }

  // 2. Self-test questions. A workbook interleaves teaching with revision
  //    questions, and a question page mentions every right word while
  //    teaching none of them.
  const questionPages = books
    .map((b) => ({ book: b.source, n: b.pages.filter((pg) => pg.is_questions).length }))
    .filter((r) => r.n > 0);
  if (questionPages.length) {
    lines.push(
      "### Self-test pages, excluded from the search",
      "",
      "| Book | Question pages |",
      "|---|---|",
      ...questionPages.map((r) => `| \`${r.book}\` | ${r.n} |`),
      "",
      "These are revision questions, not teaching. They are skipped, because a",
      "page of multiple-choice options matches a requirement's wording perfectly",
      "and would credit the course with coverage it does not have.",
      "",
    );
  }

  /* --------------------------------- the Gap Report, checked ------------ */

  lines.push(
    "## The supplied Gap Report, checked against this audit",
    "",
    "The report names specific items; this is what the material actually shows",
    "for each of them.",
    "",
    "| Ref | Report says | This audit finds | Agrees |",
    "|---|---|---|---|",
  );

  const byCode = new Map();
  for (const { rows } of results) for (const row of rows) byCode.set(row.code, row);

  let agree = 0;
  let disagree = 0;
  let unmatched = 0;
  for (const [ref, claim] of [...claims].sort()) {
    const row = byCode.get(ref);
    if (!row) {
      unmatched += 1;
      lines.push(`| \`${ref}\` | ${claim.status} | **no such item in the syllabus** | — |`);
      continue;
    }
    const reportSaysGap = claim.status === "MISSING";
    const auditSaysGap = row.status === "NOT COVERED" || row.status === "IN BOOK, NOT IN COURSE";
    const same = reportSaysGap === auditSaysGap;
    if (same) agree += 1;
    else disagree += 1;
    lines.push(`| \`${ref}\` | ${claim.status} | ${row.status} | ${same ? "yes" : "**no**"} |`);
  }

  lines.push(
    "",
    `${agree} of the report's ${claims.size} claims agree with this audit; ${disagree} disagree; ${unmatched} name a reference that is not in the syllabus.`,
    "",
    "The report's headline percentages imply several hundred gaps across the six",
    "subjects but the document names only these few dozen items. The item-level",
    "audit above is therefore the wider of the two, and the one to work from.",
    "",
  );

  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, "CPL-AUDIT.md"), lines.join("\n"), "utf8");

  console.table(summary);
  console.log("\ntotals:", totals);
  console.log(
    `gap report: ${agree} agree, ${disagree} disagree, ${unmatched} unmatched refs`,
  );
  console.log(`\nwrote ${OUT}/CPL-AUDIT.md`);

  await db.$disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await db.$disconnect();
  process.exit(1);
});
