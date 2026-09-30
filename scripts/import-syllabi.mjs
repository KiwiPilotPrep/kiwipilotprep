/**
 * Parses the CAA AC61-3 subject syllabi and writes them as the official index
 * for each subject: Subject -> SyllabusTopic -> SyllabusItem.
 *
 * The syllabus is the examinable authority, so its wording is copied exactly
 * and never rewritten (the parser enforces that; this script only stores what
 * it returns). Lines the parser cannot confidently attribute are reported, not
 * guessed at — an unparsed line is visible and fixable, a misfiled one is not.
 *
 * Content is not touched here. Lessons imported from the lecture decks live
 * alongside the syllabus and are linked to it separately, so a subject with an
 * imperfect map still shows the student all of its material.
 *
 *   node scripts/import-syllabi.mjs [--publish]
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { PrismaClient } from "@prisma/client";

import { parseSyllabus } from "./parse-syllabus.mjs";

const db = new PrismaClient();

const SYLLABI = [
  { subject: "meteorology", file: "Subject No. 8 PPL Meteorology.pdf" },
  { subject: "navigation", file: "Subject No. 6 Air Navigation and Flight Planning.pdf" },
  { subject: "air-law", file: "Subject No. 4 PPL Air Law (Aeroplane and Helicopter).pdf" },
  { subject: "flight-radiotelephony", file: "Subject No. 2 Flight Radiotelephony (1).pdf" },
  // Subject No. 10 was missing from the set originally supplied, which is why
  // Human Factors sat without an examinable index. It is the Human Factors
  // pages of AC61-3 Revision 31 (5 April 2025) — the same document and the
  // same revision the other four came from — lifted out as their own file so
  // this importer reads it exactly as it reads the rest.
  { subject: "human-factors", file: "Subject No. 10 Human Factors.pdf" },
];

const SYLLABUS_DIR = "PPL SYLLABUS";
const CACHE = ".cache/syllabi";

/** Pulls the text layer out of a syllabus PDF, cached so reruns are cheap. */
function syllabusText(file) {
  fs.mkdirSync(CACHE, { recursive: true });
  const cached = path.join(CACHE, file.replace(/\.pdf$/i, ".txt"));
  if (fs.existsSync(cached)) return fs.readFileSync(cached, "utf8");

  const script = [
    "import sys, io",
    "from pypdf import PdfReader",
    "r = PdfReader(sys.argv[1])",
    "out = []",
    "for p in r.pages:",
    "    out.append(p.extract_text() or '')",
    "sys.stdout.reconfigure(encoding='utf-8')",
    "print(chr(10).join(out))",
  ].join("\n");

  const text = execFileSync("python", ["-c", script, path.join(SYLLABUS_DIR, file)], {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });

  // The syllabus is typeset with smart quotes; the text layer hands them back
  // as replacement characters. Restoring them is presentation, not editing.
  const repaired = text
    .replace(/�(?=[A-Za-z(])/g, "‘")
    .replace(/(?<=[A-Za-z).,])�/g, "’");

  fs.writeFileSync(cached, repaired, "utf8");
  return repaired;
}

async function importSyllabus(entry, publish) {
  const status = publish ? "PUBLISHED" : "DRAFT";
  const parsed = parseSyllabus(syllabusText(entry.file));

  const subject = await db.subject.findFirst({
    where: { slug: entry.subject, course: { slug: "ppl-theory" } },
    select: { id: true, title: true },
  });
  if (!subject) throw new Error(`Subject not found: ${entry.subject}`);

  // Replace wholesale, for the same reason as the deck import: a partial
  // overwrite would leave last run's topics interleaved with this one's.
  await db.syllabusTopic.deleteMany({ where: { subjectId: subject.id } });

  let items = 0;
  for (const [topicIndex, topic] of parsed.topics.entries()) {
    const created = await db.syllabusTopic.create({
      data: {
        subjectId: subject.id,
        code: topic.code,
        title: topic.title,
        sectionNumber: topic.sectionNumber ?? null,
        sectionTitle: topic.sectionTitle ?? null,
        displayOrder: topicIndex,
        status,
      },
      select: { id: true },
    });

    for (const [itemIndex, item] of topic.items.entries()) {
      await db.syllabusItem.create({
        data: {
          syllabusTopicId: created.id,
          code: item.code,
          requirement: item.requirement,
          displayOrder: itemIndex,
          status,
        },
      });
      items += 1;
    }
  }

  return {
    subject: subject.title,
    source: entry.file,
    topics: parsed.topics.length,
    items,
    unparsedLines: parsed.unparsed.length,
    status,
  };
}

async function main() {
  const publish = process.argv.includes("--publish");
  // Importing a subject replaces its topics wholesale, and deleting a
  // SyllabusItem takes its lesson mappings with it. So one subject can be
  // re-imported on its own, and the other three keep the mappings the course
  // build wrote for them.
  const flag = process.argv.indexOf("--subject");
  const only = flag === -1 ? null : process.argv[flag + 1];
  const wanted = only ? SYLLABI.filter((s) => s.subject === only) : SYLLABI;
  if (only && !wanted.length) throw new Error(`no syllabus configured for "${only}"`);

  const results = [];
  for (const entry of wanted) {
    process.stdout.write(`parsing ${entry.file} ... `);
    const result = await importSyllabus(entry, publish);
    process.stdout.write(`${result.topics} topics, ${result.items} items\n`);
    results.push(result);
  }
  console.table(results);
  await db.$disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await db.$disconnect();
  process.exit(1);
});
