/**
 * Parses the supplied CAA syllabus into an internal validation checklist.
 *
 * The source is the file supplied with this pass: **AC61-17, Revision 17,
 * 5 April 2025, Pilot Licences and Ratings — Instrument Rating**, extracted to
 * `.cache/ir/syllabus.txt`. Nothing here is fetched from anywhere else.
 *
 * The document numbers every requirement `subject.topic.item` — 52.2.2,
 * 53.104.2, 56.32.10 — and each is one instruction beginning with a verb:
 * "Describe…", "Explain…", "State…". Long definition lists hang off a parent
 * item as lettered sub-items running across page breaks, and each of those is
 * a term a candidate has to know, so each becomes a row of its own. Appendix
 * III is not numbered at all: its knowledge points are lettered under headings
 * naming the navigation specification they apply to.
 *
 * The output is `.cache/ir/requirements.json`. It is an internal artefact: no
 * part of it is shown to a student, and no code from it may appear on a page.
 *
 *   node scripts/ir-syllabus-parse.mjs
 */
import fs from "node:fs";

const SRC = ".cache/ir/syllabus.txt";
const OUT = ".cache/ir/requirements.json";

/** The written-examination subjects this course is responsible for. */
const SUBJECTS = {
  52: "IR Air Law (Aeroplane and Helicopter)",
  53: "IR Operational Knowledge (Aeroplane and Helicopter)",
  54: "Flight Navigation - IFR",
  56: "Instruments and Navigation Aids",
};

/** Running heads, footers and the repeated table header. */
const FURNITURE =
  /^(Advisory Circular AC61-17.*|\d+ \w+ \d{4}\s+\d+\s+CAA of NZ|Sub Topic Syllabus Item|CAA of NZ|\s*)$/;

const lines = fs
  .readFileSync(SRC, "utf8")
  .split("\n")
  .map((l) => l.replace(/\s+/g, " ").trim())
  // The contents pages repeat every heading with a dotted leader and a page
  // number; they would otherwise open appendices that have not started yet.
  .filter((l) => !FURNITURE.test(l) && !/\.{4,}\s*\d+\s*$/.test(l));

const ITEM = /^(\d{2}\.\d{1,3}(?:\.\d{1,3})?)\s+(.*)$/;
// The definition lists run past (z) into (aa) and on into (aaa).
const LETTER = /^\(([a-z]{1,3})\)\s+(.*)$/;
const ROMAN = /^([ivx]{1,4})\)\s+(.*)$/;
const SUBJECT_HEAD = /^Subject No (\d{2})\b/;
const APPENDIX_HEAD = /^Appendix ([IVX]+)\s+\w/;
/** The boilerplate every subject repeats before its first item. */
const PREAMBLE = /^(Note:|This syllabus|Each subject has been given|CAR Part 1|State the definition of)/;

const items = [];
let subject = null;
let appendix = null;
let topicLabel = null;
let pbnHeading = null;
let current = null;

for (const line of lines) {
  const app = APPENDIX_HEAD.exec(line);
  if (app) {
    appendix = app[1];
    subject = null;
    current = null;
    continue;
  }
  const sub = SUBJECT_HEAD.exec(line);
  if (sub) {
    subject = Number(sub[1]);
    appendix = null;
    current = null;
    topicLabel = null;
    continue;
  }

  /* ---------------------------------------------- Appendix III (PBN) ---- */
  if (appendix === "III") {
    // Numbers in this appendix are rule and AC references, not item codes.
    const letter = LETTER.exec(line);
    if (letter) {
      current = { code: `PBN.${letter[1]}`, subject: "PBN", text: letter[2], kind: "item", parent: pbnHeading, terms: [] };
      items.push(current);
      continue;
    }
    const roman = ROMAN.exec(line);
    if (roman && current) {
      current.text += ` — ${roman[2]}`;
      continue;
    }
    if (/^(RNAV|RNP|All PBN|Specific|The following)/i.test(line)) {
      pbnHeading = line;
      current = null;
      continue;
    }
    if (current && line) current.text += ` ${line}`;
    continue;
  }

  if (!subject || !SUBJECTS[subject]) continue;

  /* --------------------------------------- Appendix I examination subjects */
  const m = ITEM.exec(line);
  if (m) {
    const [, code, text] = m;
    if (Number(code.split(".")[0]) !== subject) continue;
    const kind = /^\d{2}\.\d{1,3}$/.test(code) ? "topic" : "item";
    if (kind === "topic") topicLabel = text;
    current = { code, subject, text, kind, parent: topicLabel, terms: [] };
    items.push(current);
    continue;
  }

  const letter = LETTER.exec(line);
  if (letter && current) {
    current.terms.push({ letter: letter[1], text: letter[2].replace(/[;.]$/, "").trim() });
    continue;
  }

  // A continuation of whatever line came before, unless it is the subject's
  // standing preamble, which is not a requirement.
  if (!current || !line || PREAMBLE.test(line)) continue;
  if (current.terms.length) current.terms[current.terms.length - 1].text += ` ${line}`;
  else current.text += ` ${line}`;
}

/* ---- an item with lettered terms becomes one checkable row per term ------ */
const rows = [];
for (const it of items) {
  const base = { subject: it.subject, parent: it.parent ?? null };
  if (!it.terms.length) {
    rows.push({ ...base, code: it.code, kind: it.kind, text: it.text.trim() });
    continue;
  }
  // The instruction ("State the definition of") is the same for every letter
  // and the parent line carries the subject's standing note; what is checked
  // is the term itself, so that is what the row says.
  const lead = it.text.replace(/:$/, "").split(/Note:|participants are encouraged/)[0].trim();

  // A lettered sub-item is a definition only when the instruction above it
  // asks for one. Elsewhere — "Distinguish between the following:", "With the
  // aid of diagrams:" — each letter is a clause of that instruction and has to
  // be judged as one, not looked up as a term.
  const asksForDefinition = /definition|^Definitions?|^Define/i.test(lead);
  for (const t of it.terms) {
    rows.push({
      ...base,
      code: `${it.code}(${t.letter})`,
      kind: asksForDefinition ? "term" : "item",
      ...(asksForDefinition ? { term: t.text } : {}),
      text: asksForDefinition ? `Define: ${t.text}` : `${lead}: ${t.text}`,
    });
  }
}

fs.writeFileSync(
  OUT,
  JSON.stringify({ source: "CAA AC61-17 Revision 17, 5 April 2025 (supplied)", subjects: SUBJECTS, rows }, null, 1),
);

const by = {};
for (const r of rows) by[r.subject] = (by[r.subject] ?? 0) + 1;
console.log(`${rows.length} requirement rows -> ${OUT}\n`);
for (const [s, n] of Object.entries(by)) {
  console.log(`   ${String(s).padEnd(5)} ${String(n).padStart(4)}  ${SUBJECTS[s] ?? "PBN knowledge (Appendix III)"}`);
}
console.log(`\nkinds: ${JSON.stringify(rows.reduce((a, r) => ({ ...a, [r.kind]: (a[r.kind] ?? 0) + 1 }), {}))}`);
console.log("\nsamples:");
for (const r of [rows[1], rows[8], rows.find((x) => x.subject === 53), rows.find((x) => x.subject === 54), rows.find((x) => x.subject === "PBN")]) {
  if (r) console.log(`   ${r.code.padEnd(12)} ${r.text.slice(0, 100)}`);
}
