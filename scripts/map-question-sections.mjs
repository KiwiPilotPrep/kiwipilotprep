/**
 * Assigns each existing mock question to the KiwiPilotPrep syllabus section
 * it actually belongs to.
 *
 * Why this exists. The question bank was seeded by `prisma/seed-mocks.ts`,
 * which built a ten-question sampler spanning the whole PPL syllabus and
 * filed every one of them under Air Law, because Air Law was the only subject
 * that had a chapter to hang them on. Each one carried a made-up reference
 * ("61.HF.2") and a subject name in place of a section title ("Human
 * Factors"). A later script renumbered those references into 1.1-1.8 by the
 * order their titles first appeared, which made them look like KiwiPilotPrep
 * sections without making them true: an Air Law result came back reporting
 * weakness in "1.3 - Navigation and Flight Planning".
 *
 * The table below is not a rule and not a guess. Every row was read against
 * the question's own wording and matched to a section that exists in the
 * curriculum - the module titles are the ones in the database, and the script
 * refuses to run if any of them has moved. Where a question turned out not to
 * be about the subject it was filed under, it moves to the subject it is
 * about; where it turned out not to be a syllabus question at all, it is
 * withdrawn rather than filed somewhere convenient.
 *
 *   node scripts/map-question-sections.mjs [--apply]
 */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

/**
 * Each row: the question, the subject it is about, and the section of that
 * subject it belongs to. `section` is a CourseModule title, exactly as the
 * curriculum spells it.
 */
const MAPPING = [
  {
    match: "When two aircraft are approaching head-on",
    course: "ppl-theory",
    subject: "air-law",
    section: "Right of Way Rules",
    note: "Air Law. The rule of the air for aircraft converging head-on.",
  },
  {
    match: "A pilot-in-command may only act as PIC",
    course: "ppl-theory",
    subject: "air-law",
    section: "Licences and Ratings",
    note: "Air Law. What a pilot must hold to exercise the privileges.",
  },
  {
    match: "is tracking 090",
    course: "ppl-theory",
    subject: "navigation",
    section: "Wind, Climb and Descent Calculations",
    note: "Not Air Law. A wind triangle - Air Navigation and Flight Planning.",
  },
  {
    match: "A METAR reports",
    course: "ppl-theory",
    subject: "meteorology",
    section: "Meteorological Services, Reports and Forecasts",
    note: "Not Air Law. Reading a routine aerodrome report - Meteorology.",
  },
  {
    match: "Hypoxia in an unpressurised aircraft",
    course: "ppl-theory",
    subject: "human-factors",
    section: "Hypoxia and Hyperventilation",
    note: "Not Air Law. Human Factors.",
  },
  {
    match: "During a normal climb at a constant indicated airspeed",
    course: "ppl-theory",
    subject: "aircraft-technical-knowledge",
    section: "The Airspeed Indicator, Altimeter and VSI",
    note: "Not Air Law. The relationship between indicated and true airspeed.",
  },
  {
    match: "centre of gravity is forward of the forward limit",
    course: "ppl-theory",
    subject: "aircraft-technical-knowledge",
    section: "Weight and Balance",
    note: "Not Air Law. Loading - Aircraft Technical Knowledge.",
  },
  {
    match: "a pilot must check NOTAMs",
    course: "ppl-theory",
    subject: "air-law",
    section: "Flight Preparation and Fuel",
    note: "Air Law. The pre-flight action required before departure.",
  },
  {
    match: "minimum fuel a VFR flight by day must carry",
    course: "ppl-theory",
    subject: "air-law",
    section: "Flight Preparation and Fuel",
    note: "Air Law. The fuel requirement, taught here with flight preparation.",
  },
];

/**
 * Questions that are not syllabus questions.
 *
 * Withdrawn from the bank rather than filed under a section they do not
 * belong to. A question about how to use the product has no revision area,
 * and inventing one would put a student's miss against a piece of the
 * syllabus they never got wrong.
 */
const WITHDRAW = [
  {
    match: "The primary purpose of a mock examination",
    why: "About the product, not the syllabus. No section applies.",
  },
];

async function main() {
  const apply = process.argv.includes("--apply");

  const questions = await db.question.findMany({
    select: {
      id: true,
      prompt: true,
      status: true,
      freeTrialEligible: true,
      subjectId: true,
      chapterId: true,
      moduleId: true,
      kdrCode: true,
      kdrTopic: true,
    },
  });

  const problems = [];
  const plan = [];

  for (const row of MAPPING) {
    const hits = questions.filter((q) => q.prompt.includes(row.match));
    if (hits.length !== 1) {
      problems.push(`"${row.match}" matched ${hits.length} questions (expected 1)`);
      continue;
    }
    const subject = await db.subject.findFirst({
      where: { slug: row.subject, course: { slug: row.course } },
      select: {
        id: true,
        title: true,
        chapters: { orderBy: { order: "asc" }, take: 1, select: { id: true } },
        modules: {
          where: { title: row.section },
          select: { id: true, title: true, sectionCode: true },
        },
      },
    });
    if (!subject) {
      problems.push(`no subject ${row.course}/${row.subject}`);
      continue;
    }
    if (subject.modules.length !== 1) {
      problems.push(
        `${row.course}/${row.subject} has ${subject.modules.length} sections titled "${row.section}"`,
      );
      continue;
    }
    plan.push({ question: hits[0], subject, module: subject.modules[0], row });
  }

  for (const row of WITHDRAW) {
    const hits = questions.filter((q) => q.prompt.includes(row.match));
    if (hits.length !== 1) {
      problems.push(`"${row.match}" matched ${hits.length} questions (expected 1)`);
      continue;
    }
    plan.push({ question: hits[0], withdraw: row });
  }

  const untouched = questions.filter((q) => !plan.some((p) => p.question.id === q.id));

  for (const p of plan) {
    if (p.withdraw) {
      console.log(`\nWITHDRAW  ${p.question.prompt.slice(0, 68)}`);
      console.log(`          ${p.withdraw.why}`);
      continue;
    }
    const label = `${p.module.sectionCode ?? "?"} - ${p.module.title}`;
    console.log(`\n${p.question.prompt.slice(0, 68)}`);
    console.log(`   was  ${p.question.kdrCode ?? "(none)"} - ${p.question.kdrTopic ?? "(none)"}`);
    console.log(`   now  ${p.subject.title} | ${label}`);
    console.log(`        ${p.row.note}`);
  }

  if (untouched.length) {
    console.log(`\n${untouched.length} question(s) not covered by this mapping:`);
    for (const q of untouched) console.log(`   ${q.prompt.slice(0, 76)}`);
  }

  if (problems.length) {
    console.log(`\nREFUSING TO RUN - ${problems.length} problem(s):`);
    for (const p of problems) console.log(`   ${p}`);
    await db.$disconnect();
    process.exit(1);
  }

  if (apply) {
    for (const p of plan) {
      if (p.withdraw) {
        await db.question.update({
          where: { id: p.question.id },
          data: {
            moduleId: null,
            kdrCode: null,
            kdrTopic: null,
            freeTrialEligible: false,
            status: "DRAFT",
          },
        });
        continue;
      }
      await db.question.update({
        where: { id: p.question.id },
        data: {
          subjectId: p.subject.id,
          // A question follows its subject. Left pointing at another
          // subject's chapter it would be unreachable in the CMS and would
          // be drawn on by that subject's mocks.
          chapterId: p.subject.chapters[0]?.id ?? null,
          moduleId: p.module.id,
          kdrCode: p.module.sectionCode,
          kdrTopic: p.module.title,
        },
      });
    }
    console.log(`\napplied - ${plan.length} question(s) updated.`);
  } else {
    console.log(`\ndry run - ${plan.length} question(s) would be updated. Pass --apply.`);
  }

  await db.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await db.$disconnect();
  process.exit(1);
});
