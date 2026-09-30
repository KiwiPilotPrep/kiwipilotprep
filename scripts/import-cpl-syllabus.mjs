/**
 * Imports the six CPL subjects of the official NZ CAA syllabus.
 *
 * The syllabus arrives as one 219-page Advisory Circular covering every
 * licence level, so each subject is cut out by the page range its own
 * "Subject No. N" heading opens. That range is data, in `cpl-sources.mjs`,
 * rather than a number buried in this script: it is the one thing here that
 * will need changing when the CAA reissues the circular.
 *
 * The wording is copied exactly and never rewritten — it is the examinable
 * text, and a paraphrase of it is worse than useless. Lines the parser cannot
 * confidently attribute are reported rather than guessed at.
 *
 *   node scripts/import-cpl-syllabus.mjs [--publish]
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { PrismaClient } from "@prisma/client";

import { parseSyllabus } from "./parse-syllabus.mjs";
import { CPL_SUBJECTS, COURSE_SLUG, SYLLABUS_PDF } from "./cpl-sources.mjs";

const db = new PrismaClient();
const CACHE = ".cache/syllabi";

/**
 * The text of one page range, cached so reruns are cheap.
 *
 * The circular's text layer renders typographic quotes as replacement
 * characters. Restoring them is presentation repair, not editing — the words
 * are untouched.
 */
function pagesText(from, to, tag) {
  fs.mkdirSync(CACHE, { recursive: true });
  const cached = path.join(CACHE, `cpl-${tag}.txt`);
  if (fs.existsSync(cached)) return fs.readFileSync(cached, "utf8");

  const script = [
    "import sys",
    "from pypdf import PdfReader",
    "r = PdfReader(sys.argv[1])",
    "a, b = int(sys.argv[2]), int(sys.argv[3])",
    "out = [ (r.pages[i].extract_text() or '') for i in range(a - 1, min(b, len(r.pages))) ]",
    "sys.stdout.reconfigure(encoding='utf-8')",
    "print(chr(10).join(out))",
  ].join("\n");

  const raw = execFileSync(
    "python",
    ["-c", script, SYLLABUS_PDF, String(from), String(to)],
    { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 },
  );

  const repaired = raw
    .replace(/�(?=[A-Za-z(])/g, "‘")
    .replace(/(?<=[A-Za-z).,])�/g, "’");

  fs.writeFileSync(cached, repaired, "utf8");
  return repaired;
}

/**
 * Makes sure the subject exists before writing a syllabus into it.
 *
 * Subject 22 has no home in the seeded CPL course — the course was set up with
 * a "flight planning" subject where the syllabus has Principles of Flight —
 * so it is created rather than silently dropped or filed under a subject it
 * does not belong to.
 */
async function ensureSubject(entry) {
  const course = await db.course.findUnique({
    where: { slug: COURSE_SLUG },
    select: { id: true },
  });
  if (!course) throw new Error(`Course not found: ${COURSE_SLUG}`);

  const existing = await db.subject.findFirst({
    where: { courseId: course.id, slug: entry.subject },
    select: { id: true, title: true },
  });
  if (existing) return existing;

  const last = await db.subject.findFirst({
    where: { courseId: course.id },
    orderBy: { order: "desc" },
    select: { order: true },
  });

  return db.subject.create({
    data: {
      courseId: course.id,
      slug: entry.subject,
      title: entry.name,
      description: `Subject ${entry.number} of the CPL written examinations.`,
      order: (last?.order ?? 0) + 1,
      status: "PUBLISHED",
    },
    select: { id: true, title: true },
  });
}

async function importSubject(entry, publish) {
  const status = publish ? "PUBLISHED" : "DRAFT";
  const [from, to] = entry.syllabusPages;
  const parsed = parseSyllabus(pagesText(from, to, entry.subject));

  const subject = await ensureSubject(entry);

  // Replaced wholesale: a partial overwrite would leave one run's topics
  // interleaved with another's, and the order is the index.
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
      // Codes are unique platform-wide and the CPL circular reuses none of
      // the PPL numbers, so a clash here means the page range is wrong.
      await db.syllabusItem.create({
        data: {
          syllabusTopicId: created.id,
          code: item.code,
          requirement: item.requirement,
          displayOrder: itemIndex,
          status,
          sourcePageFrom: from,
          sourcePageTo: to,
        },
      });
      items += 1;
    }
  }

  return {
    subject: `${entry.number} ${subject.title}`,
    pages: `${from}-${to}`,
    topics: parsed.topics.length,
    items,
    unparsedLines: parsed.unparsed.length,
    status,
  };
}

async function main() {
  const publish = process.argv.includes("--publish");
  const results = [];

  for (const entry of CPL_SUBJECTS) {
    process.stdout.write(`parsing subject ${entry.number} ${entry.name} ... `);
    const result = await importSubject(entry, publish);
    process.stdout.write(`${result.topics} topics, ${result.items} items\n`);
    results.push(result);
  }

  console.table(results);
  const totals = results.reduce(
    (acc, r) => ({ topics: acc.topics + r.topics, items: acc.items + r.items }),
    { topics: 0, items: 0 },
  );
  console.log(`\ntotal: ${totals.topics} topics, ${totals.items} syllabus items`);
  await db.$disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await db.$disconnect();
  process.exit(1);
});
