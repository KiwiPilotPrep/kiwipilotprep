/**
 * Reads every stored block of the CPL course looking for text that should never
 * have reached a student.
 *
 * The title checks catch names. This catches bodies, which is where the harder
 * failures live: a reviewer's note the author left in the deck, a page footer
 * the extractor read as a sentence, a definition cut off mid-clause because the
 * source set it across two text frames.
 *
 * Nothing here edits anything. It reports, with the topic and the exact text,
 * because most of these need a person to decide whether the fix is to remove
 * the fragment or to reconstruct what it was part of.
 *
 *   node scripts/cpl-content-scan.mjs [--all] [--subject <slug>]
 */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();
const COURSE = "cpl-theory";

/**
 * Text that is the author talking to themselves, or to a colleague.
 *
 * These are the ones that must never survive: they are not wrong about
 * aviation, they are simply not addressed to the reader.
 */
const REVIEWER_NOTE = [
  /\bfor review\b/i,
  /\bcheck (?:this|it) out\b/i,
  /\bcheck again\b/i,
  /\bTODO\b/,
  /\bTBC\b/,
  /\bFIXME\b/,
  /\buntil (?:its|it's|it is) in there\b/i,
  /\bcontinue quietly\b/i,
  /\bnote to self\b/i,
  /\bplaceholder\b/i,
  /\bexam \d+ minutes\b/i,
];

/**
 * Wording that belongs to whoever made the slides, not to the reader.
 *
 * The CPL decks were built to be presented in a classroom by a named provider,
 * so they carry two things an IR manual did not: instructions addressed to an
 * instructor, and another academy's name.
 */
const BORROWED = [
  /commercial pilot academy/i,
  /NZICPA/i,
  /new zealand international commercial/i,
  /instructor to demonstrate/i,
  /instructor will demonstrate/i,
  /student to demonstrate/i,
  /course notes play a video/i,
  /video in the source material/i,
];

/** Page furniture the extractor read as prose. */
const FURNITURE = [
  /^slide\s*no\.?\s*\d/i,
  /\.pptx?/i,
  /^https?:\/\//i,
  /^slide no\.?\s*\d/i,
  /^page \d+ of \d+$/i,
  /^\d+\s*[-–—]\s*\d+$/,
  /^(?:AIP|AIPNZ)\s+(?:vol|volume)?\s*\d*\s*$/i,
];

/** Shapes that mean the extractor cut a sentence in half. */
function looksTruncated(text) {
  const t = text.trim();
  if (t.length < 12) return false;
  // The rules are written as lists whose items end "; and" or "; or". Those
  // are complete items, not broken sentences, and there are hundreds of them.
  if (/[;,]\s+(?:and|or)$/i.test(t)) return false;
  // Ends on a word that cannot end a sentence.
  if (/\b(?:the|a|an|of|to|in|on|at|for|with|and|or|but|is|are|was|were|be|by|from|that|which|when|if|as|than|then|into|onto|per|via)$/i.test(t)) {
    return true;
  }
  // Ends mid-clause on a comma. A colon is not a defect — it introduces the
  // list that follows it, which is how half the rules in Air Law are written.
  if (/,$/.test(t) && t.split(/\s+/).length < 6) return true;
  if ((t.match(/\(/g) ?? []).length > (t.match(/\)/g) ?? []).length) return true;
  return false;
}

/** A label with nothing after it — "MFA" alone on its own line. */
function looksOrphaned(text) {
  const t = text.trim();
  if (t.length > 24) return false;
  if (/^[A-Z]{2,6}(?:\s*[/-]\s*[A-Z]{2,6})*$/.test(t)) return true;
  if (/^[A-Z][A-Za-z ]{0,20}[:=]$/.test(t)) return true;
  return false;
}

/** Runs of symbols, stray glyphs, and text no reader can use. */
function looksLikeNoise(text) {
  const t = text.trim();
  if (!t) return true;
  if (/^[^\w\s]{1,6}$/.test(t)) return true;
  // Mostly non-letters, and long enough that it is not an abbreviation.
  const letters = (t.match(/[A-Za-z]/g) ?? []).length;
  if (t.length > 10 && letters / t.length < 0.4) return true;
  return false;
}

function textOf(block) {
  if (!block) return "";
  if (block.type === "keypoints" || block.type === "list") {
    return (block.items ?? []).join(" · ");
  }
  if (block.type === "table") return "";
  if (block.type === "figure") return block.caption ?? "";
  return [block.text, block.term, block.title, block.label].filter(Boolean).join(" ");
}

/**
 * A line of a worked calculation.
 *
 * "1013 – 1028 = -15" is mostly not letters, which is exactly what the noise
 * test looks for — and it is also the most useful line on the page. Arithmetic
 * is recognised so it is never reported as an extraction artefact.
 */
function isCalculation(text) {
  const t = text.trim();
  if (!/[=×x+–-]/.test(t)) return false;
  return /\d/.test(t) && /[=]/.test(t);
}

async function main() {
  const showAll = process.argv.includes("--all");

  const only = process.argv.includes("--subject")
    ? process.argv[process.argv.indexOf("--subject") + 1]
    : null;

  const lessons = await db.lesson.findMany({
    where: {
      status: "PUBLISHED",
      module: { subject: { course: { slug: COURSE }, ...(only ? { slug: only } : {}) } },
    },
    orderBy: [{ module: { displayOrder: "asc" } }, { displayOrder: "asc" }],
    select: {
      title: true, slug: true,
      module: { select: { title: true, subject: { select: { slug: true } } } },
      content: { select: { blocks: true } },
    },
  });

  const findings = [];
  const report = (kind, lesson, block, text) =>
    findings.push({
      kind,
      subject: lesson.module.subject.slug,
      chapter: lesson.module.title,
      topic: lesson.title,
      slug: lesson.slug,
      page: block?.sourcePage ?? null,
      origin: block?.origin ?? "?",
      text: text.length > 180 ? `${text.slice(0, 177)}...` : text,
    });

  for (const lesson of lessons) {
    const blocks = lesson.content?.blocks ?? [];
    const seenText = new Map();

    for (const block of blocks) {
      const text = textOf(block);
      if (!text && block?.type !== "table" && block?.type !== "figure") {
        report("EMPTY BLOCK", lesson, block, `(${block?.type})`);
        continue;
      }
      if (!text) continue;

      for (const pattern of REVIEWER_NOTE) {
        if (pattern.test(text)) { report("REVIEWER NOTE", lesson, block, text); break; }
      }
      for (const pattern of FURNITURE) {
        if (pattern.test(text.trim())) { report("PAGE FURNITURE", lesson, block, text); break; }
      }
      for (const pattern of BORROWED) {
        if (pattern.test(text)) { report("BORROWED WORDING", lesson, block, text); break; }
      }
      if (block.origin === "source") {
        if (isCalculation(text)) {
          // Working, not noise. Left alone.
        } else if (looksLikeNoise(text)) report("NOISE", lesson, block, text);
        else if (looksOrphaned(text)) report("ORPHANED LABEL", lesson, block, text);
        else if (looksTruncated(text)) report("TRUNCATED", lesson, block, text);
      }

      // The same paragraph twice inside one topic. The manual repeats itself
      // across pages a topic gathers, so this is common and worth seeing.
      const key = text.toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 120);
      if (key.length > 40) {
        if (seenText.has(key)) report("DUPLICATED IN TOPIC", lesson, block, text);
        else seenText.set(key, true);
      }

      // A paragraph identical to the topic's own title is a heading the
      // extractor also emitted as body text.
      if (text.trim().toLowerCase() === lesson.title.trim().toLowerCase()) {
        report("TITLE REPEATED AS BODY", lesson, block, text);
      }
    }
  }

  const byKind = {};
  for (const f of findings) byKind[f.kind] = (byKind[f.kind] ?? 0) + 1;

  console.log(`${lessons.length} topics scanned\n`);
  console.table(
    Object.entries(byKind)
      .sort((a, b) => b[1] - a[1])
      .map(([kind, n]) => ({ kind, findings: n })),
  );

  const order = [
    "BORROWED WORDING", "REVIEWER NOTE", "PAGE FURNITURE", "EMPTY BLOCK", "TITLE REPEATED AS BODY",
    "NOISE", "ORPHANED LABEL", "DUPLICATED IN TOPIC", "TRUNCATED",
  ];
  for (const kind of order) {
    const rows = findings.filter((f) => f.kind === kind);
    if (!rows.length) continue;
    console.log(`\n=== ${kind} (${rows.length}) ===`);
    for (const row of showAll ? rows : rows.slice(0, 25)) {
      console.log(`  ${row.subject} · ${row.topic}${row.page ? ` (p${row.page})` : ""}`);
      console.log(`    ${JSON.stringify(row.text)}`);
    }
    if (!showAll && rows.length > 25) console.log(`  ... and ${rows.length - 25} more`);
  }

  await db.$disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await db.$disconnect();
  process.exit(1);
});
