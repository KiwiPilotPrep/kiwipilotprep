/**
 * Reads the supplied CPL Gap & Addition Report into structured rows.
 *
 * The brief is explicit that this document is a checklist, not the truth: its
 * percentages are described in the document itself as audit estimates. So it is
 * parsed rather than trusted — every claim it makes becomes a row that can be
 * checked against the actual syllabus, the actual decks and the actual books,
 * and disagreements are reported rather than resolved in its favour.
 *
 * The report is a Word document of tables. Each row is
 *   status | syllabus ref | requirement | finding | content to add | where
 *
 *   node scripts/parse-gap-report.mjs [--json]
 */
import fs from "node:fs";
import { execFileSync } from "node:child_process";

const DOCX = "CPL_Syllabus_Gap_Addition_Report.docx";
const OUT = ".cache/gap-report.json";

/** `16.22.30` — a syllabus item; `16.22` — a topic. */
const REF = /^\d{1,3}\.\d{1,3}(?:\.\d{1,3})?$/;
const STATUSES = new Set(["MISSING", "PARTIAL", "STRENGTHEN", "WEAK", "REFINE"]);

/** Pulls the document's table cells out in reading order. */
function cells() {
  const script = [
    "import sys, zipfile, re",
    "sys.stdout.reconfigure(encoding='utf-8')",
    "xml = zipfile.ZipFile(sys.argv[1]).read('word/document.xml').decode('utf-8','ignore')",
    // A cell break becomes a delimiter and a row break a newline, so the
    // table's shape survives the strip.
    "xml = re.sub(r'</w:tc>', '\\u241f', xml)",
    "xml = re.sub(r'</w:tr>', '\\u241e', xml)",
    "xml = re.sub(r'</w:p>', ' ', xml)",
    "text = re.sub(r'<[^>]+>', '', xml)",
    "for a, b in [('&amp;','&'),('&lt;','<'),('&gt;','>'),('&quot;','\"'),('&#39;',chr(39))]:",
    "    text = text.replace(a, b)",
    "print(text)",
  ].join("\n");

  return execFileSync("python", ["-c", script, DOCX], {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
}

export function parseGapReport() {
  const raw = cells();
  const rows = [];

  for (const rowText of raw.split("␞")) {
    const parts = rowText
      .split("␟")
      .map((c) => c.replace(/\s+/g, " ").trim())
      .filter(Boolean);
    if (parts.length < 3) continue;

    const status = parts[0].toUpperCase();
    if (!STATUSES.has(status)) continue;

    const ref = parts[1];
    if (!REF.test(ref)) continue;

    rows.push({
      status,
      ref,
      subject: Number(ref.split(".")[0]),
      requirement: parts[2] ?? "",
      finding: parts[3] ?? "",
      contentToAdd: parts[4] ?? "",
      whereToInsert: parts[5] ?? "",
    });
  }

  return rows;
}

function main() {
  if (!fs.existsSync(DOCX)) {
    console.error(`missing ${DOCX}`);
    process.exit(1);
  }

  const rows = parseGapReport();
  fs.writeFileSync(OUT, JSON.stringify(rows, null, 1), "utf8");

  const bySubject = new Map();
  for (const row of rows) {
    if (!bySubject.has(row.subject)) bySubject.set(row.subject, { MISSING: 0, PARTIAL: 0, other: 0 });
    const bucket = bySubject.get(row.subject);
    if (row.status in bucket) bucket[row.status] += 1;
    else bucket.other += 1;
  }

  console.table(
    [...bySubject.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([subject, counts]) => ({
        subject,
        missing: counts.MISSING,
        partial: counts.PARTIAL,
        strengthen: counts.other,
        total: counts.MISSING + counts.PARTIAL + counts.other,
      })),
  );
  console.log(`\n${rows.length} claims parsed → ${OUT}`);

  if (process.argv.includes("--json")) console.log(JSON.stringify(rows.slice(0, 5), null, 1));
}

if (process.argv[1] && process.argv[1].endsWith("parse-gap-report.mjs")) main();
