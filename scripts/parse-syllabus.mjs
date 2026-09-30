/**
 * Parses a CAA NZ AC61-3 subject syllabus into structured JSON.
 *
 * The one rule that governs every line of this file: **the official wording is
 * copied, never rewritten.** Requirements are reassembled exactly as printed —
 * wrapped lines are rejoined, lettered sub-clauses are kept in place, and no
 * word is normalised, corrected or shortened. The syllabus code is the
 * academic reference students and examiners use on knowledge deficiency
 * reports, so it is carried through verbatim as its own field rather than
 * being derived from a title.
 *
 * What it deliberately does NOT do is invent structure. A line it cannot
 * confidently attribute to a topic is reported as unparsed rather than
 * attached to whichever topic happened to come last.
 *
 *   node scripts/parse-syllabus.mjs <input.txt> <output.json>
 */
import fs from "node:fs";

/** `12.6` — a topic. Followed by its title on the same line. */
const TOPIC = /^(\d{1,3}\.\d{1,3})\s+(\S.*)$/;
/** `12.6.24` — an item. Followed by the start of its requirement. */
const ITEM = /^(\d{1,3}\.\d{1,3}\.\d{1,3})\s+(\S.*)$/;
/** `Section 1 General Technical Knowledge` — groups topics. */
const SECTION = /^Section\s+(\d+)\s+(\S.*)$/;

/**
 * Page furniture that repeats on every page of the source. Dropping these is
 * presentation cleanup, not content editing — none of it is syllabus wording.
 */
const FURNITURE = [
  // AC61-3 carries the PPL syllabi and AC61-5 the CPL ones; both print the
  // same running header.
  /^Advisory Circular AC61-\d+ Revision \d+\s*$/,
  /^\d{1,2} \w+ \d{4}\s+\d+\s+CAA of NZ\s*$/,
  /^Sub Topic Syllabus Item\s*$/,
  /^Subject No\. \d+ .*$/,
  /^\s*$/,
];

const isFurniture = (line) => FURNITURE.some((re) => re.test(line));

export function parseSyllabus(raw) {
  const lines = raw.split("\n").map((l) => l.replace(/\s+$/, ""));

  const topics = [];
  const unparsed = [];
  let section = null;
  let sectionNote = null;
  let topic = null;
  let item = null;

  /** Rejoins a wrapped line onto whatever is currently open. */
  const append = (text) => {
    const target = item ?? topic;
    if (!target) {
      unparsed.push(text);
      return;
    }
    if (item) {
      // A lettered sub-clause starts its own line; anything else is a
      // continuation of the previous one and is rejoined with a space.
      // Collapse runs of spaces and tabs only. Collapsing `\s+` would eat the
      // newlines separating lettered sub-clauses, silently flattening
      // "(a) …\n(b) …" into one line and changing how the requirement reads.
      item.requirement = /^\([a-z]\)/.test(text.trim())
        ? `${item.requirement}\n${text.trim()}`
        : `${item.requirement} ${text.trim()}`.replace(/[ \t]+/g, " ");
    } else {
      topic.description = topic.description
        ? `${topic.description} ${text.trim()}`
        : text.trim();
    }
  };

  for (const line of lines) {
    if (isFurniture(line)) continue;
    const trimmed = line.trim();

    const sec = SECTION.exec(trimmed);
    if (sec) {
      // "Section 1 is common to both Subject 12 and Subject 14" is a note
      // about the section, not a section heading itself.
      if (/^is\b/.test(sec[2])) {
        sectionNote = trimmed;
      } else {
        section = { number: sec[1], title: sec[2].trim() };
        item = null;
      }
      continue;
    }

    const it = ITEM.exec(trimmed);
    if (it) {
      if (!topic) {
        unparsed.push(trimmed);
        continue;
      }
      item = {
        code: it[1],
        requirement: it[2].trim(),
        displayOrder: topic.items.length,
      };
      topic.items.push(item);
      continue;
    }

    const tp = TOPIC.exec(trimmed);
    if (tp) {
      topic = {
        code: tp[1],
        title: tp[2].trim(),
        sectionNumber: section?.number ?? null,
        sectionTitle: section?.title ?? null,
        description: null,
        displayOrder: topics.length,
        items: [],
      };
      topics.push(topic);
      item = null;
      continue;
    }

    append(trimmed);
  }

  // Tidy trailing whitespace introduced by rejoining, without touching words.
  for (const t of topics) {
    t.title = t.title.trim();
    for (const i of t.items) i.requirement = i.requirement.trim();
  }

  return { sectionNote, topics, unparsed };
}

/* ------------------------------------------------------------------ CLI */

// Only act as a CLI when run directly. Imported by other scripts, this file
// is a parser and nothing else.
const runDirectly = process.argv[1] && process.argv[1].endsWith("parse-syllabus.mjs");
const [, , inputPath, outputPath] = process.argv;
if (runDirectly && inputPath) {
  const raw = fs.readFileSync(inputPath, "utf8");
  const parsed = parseSyllabus(raw);

  const itemCount = parsed.topics.reduce((n, t) => n + t.items.length, 0);
  console.log(`topics   : ${parsed.topics.length}`);
  console.log(`items    : ${itemCount}`);
  console.log(`unparsed : ${parsed.unparsed.length}`);
  if (parsed.unparsed.length) {
    console.log("\nlines that could not be attributed (reported, not guessed at):");
    for (const l of parsed.unparsed.slice(0, 20)) console.log(`   ${l}`);
  }

  if (outputPath) {
    fs.writeFileSync(outputPath, JSON.stringify(parsed, null, 2));
    console.log(`\nwritten to ${outputPath}`);
  }
}
