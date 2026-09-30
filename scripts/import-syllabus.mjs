/**
 * Imports a parsed CAA syllabus into a subject, and maps source study
 * material against it.
 *
 * Two jobs, deliberately kept apart:
 *
 *   1. The syllabus itself — authoritative, complete, copied verbatim. Every
 *      topic and item is imported.
 *
 *   2. The study material — mapped only where the mapping is *evidenced*. A
 *      chapter is attached to a topic when the source names the topic; an item
 *      gets content when the source prints that item's code. Everything else
 *      is reported as unmapped rather than being attached to whichever item
 *      looked closest, because a student reading the wrong explanation under
 *      an official requirement is worse than a student reading nothing.
 *
 * Re-running is safe: topics and items upsert on their code, so a corrected
 * syllabus can be re-imported without duplicating anything or disturbing
 * student progress, which is keyed on the item rather than on the import.
 *
 *   node scripts/import-syllabus.mjs <syllabus.json> <subject-slug> [--study <study.json>] [--dry-run]
 */
import fs from "node:fs";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const syllabusPath = args[0];
const subjectSlug = args[1];
const studyIndex = args.indexOf("--study");
const studyPath = studyIndex > -1 ? args[studyIndex + 1] : null;

if (!syllabusPath || !subjectSlug) {
  console.error(
    "usage: node scripts/import-syllabus.mjs <syllabus.json> <subject-slug> [--study <study.json>] [--dry-run]",
  );
  process.exit(1);
}

/* ------------------------------------------------------------ study text */

/**
 * Splits the source deck into chapters, and finds any syllabus codes printed
 * in the text. Returns a chapter list with page ranges and the codes seen.
 */
function analyseStudy(pages) {
  const CHAPTER = /CHAPTER\s+(\d+)\s+([A-Z][A-Z\s\-&/]*)/i;
  const CODE = /\b(\d{1,3}\.\d{1,3}\.\d{1,3})\b/g;

  const chapters = [];
  for (let i = 0; i < pages.length; i++) {
    const text = (pages[i] ?? "").trim();
    if (!text) continue;
    const m = CHAPTER.exec(text.replace(/\n/g, " "));
    if (m) {
      chapters.push({
        number: Number(m[1]),
        title: m[2].trim().replace(/\s+/g, " "),
        pageFrom: i + 1,
        pageTo: pages.length,
        codes: [],
      });
    }
  }
  for (let i = 0; i < chapters.length - 1; i++) {
    chapters[i].pageTo = chapters[i + 1].pageFrom - 1;
  }

  // Which item codes actually appear, and on which page.
  const codePages = new Map();
  for (let i = 0; i < pages.length; i++) {
    for (const m of (pages[i] ?? "").matchAll(CODE)) {
      if (!codePages.has(m[1])) codePages.set(m[1], i + 1);
    }
  }
  for (const ch of chapters) {
    ch.codes = [...codePages.entries()]
      .filter(([, page]) => page >= ch.pageFrom && page <= ch.pageTo)
      .map(([code, page]) => ({ code, page }));
  }

  return { chapters, codePages };
}

/**
 * The most pages one syllabus item's notes may plausibly span.
 *
 * The source prints a code only where an item begins, so when the *next*
 * item's code is missing there is nothing to stop an extraction running to the
 * end of the deck. This is the backstop: beyond it, the mapping is not
 * evidence of anything and the item is reported as unmapped instead.
 */
const MAX_ITEM_PAGES = 15;

/** Normalises a title for comparison without altering anything stored. */
const key = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

/**
 * Pulls the text printed under one item's code, up to the next code.
 * Returns null when the code is not printed in the source at all.
 */
function extractItemText(pages, code, nextCode) {
  const escaped = code.replace(/\./g, "\\.");
  const startRe = new RegExp(`\\b${escaped}\\b`);

  let startPage = -1;
  for (let i = 0; i < pages.length; i++) {
    if (startRe.test(pages[i] ?? "")) { startPage = i; break; }
  }
  if (startPage === -1) return null;

  // Where the next item begins. Searched from the current page *inclusive*:
  // several items commonly share one slide, and skipping the current page made
  // the range run to the end of the document — turning a page reference meant
  // for traceability into a useless "pages 18–506".
  let endPage = pages.length - 1;
  if (nextCode) {
    const nextRe = new RegExp(`\\b${nextCode.replace(/\./g, "\\.")}\\b`);
    for (let i = startPage; i < pages.length; i++) {
      if (nextRe.test(pages[i] ?? "")) { endPage = i; break; }
    }
  }

  const slice = pages.slice(startPage, endPage + 1).join("\n");
  const at = slice.search(startRe);
  const after = slice.slice(at).replace(startRe, "").trim();
  const cut = nextCode
    ? after.split(new RegExp(`\\b${nextCode.replace(/\./g, "\\.")}\\b`))[0]
    : after;

  return { text: cut.trim(), pageFrom: startPage + 1, pageTo: endPage + 1 };
}

/**
 * Turns extracted source text into content blocks.
 *
 * Structural only: it decides what is a heading and what is a paragraph, and
 * drops the slide's page number. It never rewrites a sentence — the words that
 * go in are the words that came out of the source.
 */
function toBlocks(text, code, requirement) {
  const blocks = [];
  const lines = text
    .split("\n")
    .map((l) => l.replace(/\s+$/, ""))
    .filter((l) => l.trim() && !/^\d{1,4}$/.test(l.trim()));

  let paragraph = [];
  const flush = () => {
    if (!paragraph.length) return;
    blocks.push({ type: "paragraph", text: paragraph.join(" ").replace(/\s+/g, " ").trim() });
    paragraph = [];
  };

  for (const raw of lines) {
    const line = raw.trim();
    // A short ALL-CAPS line is a slide heading in this deck.
    if (line.length < 70 && line === line.toUpperCase() && /[A-Z]{3}/.test(line)) {
      flush();
      blocks.push({ type: "heading", text: line.replace(/\s+/g, " ") });
      continue;
    }
    // A bullet starts a new paragraph; the lines after it are its
    // continuation, not separate paragraphs. Treating every line as its own
    // block split sentences in half mid-clause.
    if (/^[••\-]\s*/.test(line)) {
      flush();
      paragraph.push(line.replace(/^[••\-]\s*/, "").trim());
      continue;
    }
    paragraph.push(line);
  }
  flush();

  // Skip a leading paragraph that merely repeats the official requirement —
  // the reader already shows that above the content.
  if (blocks.length && blocks[0].type === "paragraph") {
    const a = key(blocks[0].text);
    const b = key(requirement);
    if (a && b.startsWith(a.slice(0, Math.min(40, a.length)))) blocks.shift();
  }

  return blocks.filter((b) => b.text && b.text.length > 1);
}

/* ------------------------------------------------------------------ main */

async function main() {
  const parsed = JSON.parse(fs.readFileSync(syllabusPath, "utf8"));
  const pages = studyPath ? JSON.parse(fs.readFileSync(studyPath, "utf8")) : null;

  // Subject slugs are unique per course, not globally — PPL and CPL both have
  // an "aircraft-technical-knowledge". The target is given as
  // "<course-slug>/<subject-slug>" so the wrong one cannot be filled by
  // accident with a different subject's syllabus.
  const [courseSlug, slug] = subjectSlug.includes("/")
    ? subjectSlug.split("/")
    : [null, subjectSlug];

  const matches = await db.subject.findMany({
    where: { slug, ...(courseSlug ? { course: { slug: courseSlug } } : {}) },
    include: { course: { select: { title: true, slug: true } } },
  });

  if (matches.length === 0) {
    console.error(`No subject matching "${subjectSlug}".`);
    process.exit(1);
  }
  if (matches.length > 1) {
    console.error(`"${subjectSlug}" matches ${matches.length} subjects — qualify it as <course-slug>/<subject-slug>:`);
    for (const m of matches) console.error(`   ${m.course.slug}/${m.slug}  (${m.course.title})`);
    process.exit(1);
  }
  const subject = matches[0];

  console.log(`subject : ${subject.course.title} / ${subject.title}`);
  console.log(`syllabus: ${parsed.topics.length} topics, ` +
    `${parsed.topics.reduce((n, t) => n + t.items.length, 0)} items`);

  const study = pages ? analyseStudy(pages) : null;
  if (study) {
    console.log(`source  : ${pages.length} pages, ${study.chapters.length} chapters, ` +
      `${study.codePages.size} item codes printed`);
  }

  // Chapter → topic, matched on title. Only an exact normalised match counts.
  // Matched on the title the source itself prints, never on position.
  //
  // Positional mapping was tested and rejected: the deck has no chapter for
  // "12.30 Fuel Tanks", so from that point every chapter would land on the
  // topic before it — putting lubrication content under a fuel-tank
  // requirement. Containment (one title contains the other) is still evidence
  // that the source is naming that topic; an ordinal is not.
  const chapterByTopic = new Map();
  const unmatchedChapters = [];
  if (study) {
    for (const ch of study.chapters) {
      const c = key(ch.title);
      const topic = parsed.topics.find((t) => {
        const k = key(t.title);
        if (k === c) return true;
        // Require a decent overlap so a two-letter fragment cannot match.
        const shorter = k.length < c.length ? k : c;
        if (shorter.length < 6) return false;
        return k.startsWith(c) || c.startsWith(k) || k.includes(c) || c.includes(k);
      });
      if (topic && !chapterByTopic.has(topic.code)) chapterByTopic.set(topic.code, ch);
      else unmatchedChapters.push(ch);
    }
  }

  const report = {
    topics: 0,
    items: 0,
    contentWritten: 0,
    itemsWithoutContent: [],
    overlongDiscarded: [],
    retracted: [],
    chaptersUnmatched: unmatchedChapters.map((c) => `Ch${c.number} ${c.title} (p${c.pageFrom}-${c.pageTo})`),
  };

  const allItems = parsed.topics.flatMap((t) => t.items.map((i) => i.code));

  for (const topic of parsed.topics) {
    const chapter = chapterByTopic.get(topic.code);

    if (!dryRun) {
      const row = await db.syllabusTopic.upsert({
        where: { subjectId_code: { subjectId: subject.id, code: topic.code } },
        update: {
          title: topic.title,
          sectionNumber: topic.sectionNumber,
          sectionTitle: topic.sectionTitle,
          displayOrder: topic.displayOrder,
          status: "PUBLISHED",
        },
        create: {
          subjectId: subject.id,
          code: topic.code,
          title: topic.title,
          sectionNumber: topic.sectionNumber,
          sectionTitle: topic.sectionTitle,
          displayOrder: topic.displayOrder,
          status: "PUBLISHED",
        },
      });
      report.topics++;

      for (const item of topic.items) {
        const nextCode = allItems[allItems.indexOf(item.code) + 1] ?? null;
        let extracted = pages ? extractItemText(pages, item.code, nextCode) : null;

        // A run this long is not one syllabus item — it means the next code was
        // never printed, so the extraction ran on to the end of the document
        // and swallowed everything after it. Discard rather than publish
        // hundreds of unrelated pages under one requirement (§15).
        if (extracted && extracted.pageTo - extracted.pageFrom > MAX_ITEM_PAGES) {
          report.overlongDiscarded.push(
            `${item.code} (would have taken pages ${extracted.pageFrom}–${extracted.pageTo})`,
          );
          extracted = null;
        }

        const blocks = extracted ? toBlocks(extracted.text, item.code, item.requirement) : [];

        const itemRow = await db.syllabusItem.upsert({
          where: { code: item.code },
          update: {
            syllabusTopicId: row.id,
            requirement: item.requirement,
            displayOrder: item.displayOrder,
            status: "PUBLISHED",
            sourcePageFrom: extracted?.pageFrom ?? chapter?.pageFrom ?? null,
            sourcePageTo: extracted?.pageTo ?? chapter?.pageTo ?? null,
          },
          create: {
            syllabusTopicId: row.id,
            code: item.code,
            requirement: item.requirement,
            displayOrder: item.displayOrder,
            status: "PUBLISHED",
            sourcePageFrom: extracted?.pageFrom ?? chapter?.pageFrom ?? null,
            sourcePageTo: extracted?.pageTo ?? chapter?.pageTo ?? null,
          },
        });
        report.items++;

        if (blocks.length >= 1) {
          await db.studyContent.upsert({
            where: { syllabusItemId: itemRow.id },
            update: { blocks, references: `AC61-3 Rev 31 — source pages ${extracted.pageFrom}–${extracted.pageTo}`, status: "PUBLISHED" },
            create: {
              syllabusItemId: itemRow.id,
              blocks,
              references: `AC61-3 Rev 31 — source pages ${extracted.pageFrom}–${extracted.pageTo}`,
              status: "PUBLISHED",
            },
          });
          report.contentWritten++;
        } else {
          // Nothing confidently mapped this time. If an earlier run wrote
          // something here, retract it: leaving a previous mistake in place
          // because this run had nothing to say would keep publishing content
          // the importer no longer stands behind.
          const existing = await db.studyContent.findUnique({
            where: { syllabusItemId: itemRow.id },
            select: { id: true },
          });
          if (existing) {
            await db.studyContent.delete({ where: { id: existing.id } });
            report.retracted.push(item.code);
          }
          report.itemsWithoutContent.push(item.code);
        }
      }
    }
  }

  console.log("");
  console.log(`topics imported        : ${report.topics}`);
  console.log(`items imported         : ${report.items}`);
  console.log(`items with study content: ${report.contentWritten}`);
  console.log(`items WITHOUT content   : ${report.itemsWithoutContent.length}`);
  if (report.retracted.length) {
    console.log(`retracted from a previous run: ${report.retracted.join(", ")}`);
  }
  if (report.overlongDiscarded.length) {
    console.log(`
discarded as implausibly long (${report.overlongDiscarded.length}):`);
    for (const d of report.overlongDiscarded) console.log(`   ${d}`);
  }

  if (report.chaptersUnmatched.length) {
    console.log(`\nsource chapters not matched to a syllabus topic (${report.chaptersUnmatched.length}):`);
    for (const c of report.chaptersUnmatched) console.log(`   ${c}`);
  }

  fs.writeFileSync(
    ".work/import-report.json",
    JSON.stringify(report, null, 2),
  );
  console.log("\nfull report: .work/import-report.json");

  await db.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await db.$disconnect();
  process.exit(1);
});
