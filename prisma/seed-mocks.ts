/**
 * Phase 4 seed: exam-ready questions with KDR metadata, plus mock exams.
 *
 * Run after the main seed:  npx tsx prisma/seed-mocks.ts
 *
 * The questions are the Phase 1 sampler material carried into the database,
 * clearly placeholder content for development. Real recall material is
 * client-supplied through the CMS — nothing here claims to be it.
 *
 * Each one is filed under the subject it is actually about and assigned to a
 * KiwiPilotPrep section of that subject. That is not tidiness: an earlier
 * version of this file put all ten under Air Law because Air Law was the
 * only subject with a chapter to hang them on, and gave each a made-up
 * reference in place of a section. The result was Air Law papers reporting
 * weakness in "Navigation and Flight Planning". A seed that files a question
 * under the wrong subject teaches the reporting pipeline to lie.
 */
import { PrismaClient, type ContentStatus } from "@prisma/client";

import { slugify } from "../lib/slug";

const db = new PrismaClient();

type Seed = {
  prompt: string;
  options: string[];
  answer: number;
  explanation: string;
  /** The subject this question is about, by slug, within `ppl-theory`. */
  subject: string;
  /** A CourseModule title of that subject — the KiwiPilotPrep section. */
  section: string;
  caanzRef?: string;
  ac61Ref?: string;
  difficulty?: number;
};

const BANK: Seed[] = [
  {
    prompt: "A pilot-in-command may only act as PIC of an aircraft if they hold:",
    options: [
      "A current medical certificate appropriate to the licence held",
      "A valid passport and photo identification",
      "A logbook containing at least 100 hours",
      "Written permission from the aircraft owner",
    ],
    answer: 0,
    explanation:
      "A current and appropriate medical certificate is a licensing requirement for acting as pilot-in-command.",
    subject: "air-law",
    section: "Licences and Ratings",
    caanzRef: "CAR Part 61",
    difficulty: 2,
  },
  {
    prompt:
      "When two aircraft are approaching head-on and there is a risk of collision, each pilot shall:",
    options: [
      "Turn left",
      "Climb immediately",
      "Alter heading to the right",
      "Maintain heading and give way to the larger aircraft",
    ],
    answer: 2,
    explanation:
      "Head-on with a collision risk: both aircraft alter heading to the right. The rule is symmetrical so both pilots take a predictable, complementary action.",
    subject: "air-law",
    section: "Right of Way Rules",
    caanzRef: "CAR Part 91",
    difficulty: 1,
  },
  {
    prompt:
      "An aircraft is tracking 090°M at 100 kt TAS with a wind of 360°M at 20 kt. The approximate heading required to maintain that track is:",
    options: ["078°M", "090°M", "102°M", "110°M"],
    answer: 0,
    explanation:
      "A northerly wind drifts an eastbound aircraft right of track. Maximum drift is about 12° (20 kt across 100 kt TAS), so lay off 12° into wind to hold the track.",
    subject: "navigation",
    section: "Wind, Climb and Descent Calculations",
    ac61Ref: "AC61-3",
    difficulty: 3,
  },
  {
    prompt: 'A METAR reports "BKN012". This means:',
    options: [
      "Broken cloud at 1,200 ft above aerodrome level",
      "Broken cloud at 12,000 ft above mean sea level",
      "Visibility is broken into sectors of 12 km",
      "Cloud base is 120 m above the runway threshold",
    ],
    answer: 0,
    explanation:
      "Cloud height in a METAR is given in hundreds of feet above aerodrome elevation, so 012 is 1,200 ft AAL. BKN is 5 to 7 oktas.",
    subject: "meteorology",
    section: "Meteorological Services, Reports and Forecasts",
    ac61Ref: "AC61-3",
    difficulty: 2,
  },
  {
    prompt: "Hypoxia in an unpressurised aircraft is most likely to first affect:",
    options: [
      "Physical strength in the arms and legs",
      "Judgement, and the ability to recognise your own impairment",
      "Hearing, especially at higher frequencies",
      "The sense of smell",
    ],
    answer: 1,
    explanation:
      "Higher cognitive function degrades early while the pilot still feels fine, which is why oxygen requirements are prescriptive rather than left to pilot discretion.",
    subject: "human-factors",
    section: "Hypoxia and Hyperventilation",
    difficulty: 2,
  },
  {
    prompt:
      "During a normal climb at a constant indicated airspeed, as altitude increases the true airspeed will:",
    options: [
      "Decrease, because the air is less dense",
      "Remain constant, because IAS is held constant",
      "Increase, because the air is less dense",
      "Vary directly with outside air temperature only",
    ],
    answer: 2,
    explanation:
      "The ASI measures dynamic pressure. As density falls, a given IAS corresponds to a progressively higher TAS — roughly 2% per 1,000 ft.",
    subject: "aircraft-technical-knowledge",
    section: "The Airspeed Indicator, Altimeter and VSI",
    difficulty: 3,
  },
  {
    prompt:
      "An aircraft is loaded so that its centre of gravity is forward of the forward limit. The most likely effect is:",
    options: [
      "Reduced stall speed and a lighter feel in pitch",
      "Increased stability but reduced elevator authority, particularly in the flare",
      "A tendency to pitch up uncontrollably after rotation",
      "No effect provided the aircraft is below MAUW",
    ],
    answer: 1,
    explanation:
      "A forward CG increases longitudinal stability but costs elevator authority, and the shortfall shows up in the landing flare. Being under MAUW does not help: weight and balance are separate limits.",
    subject: "aircraft-technical-knowledge",
    section: "Weight and Balance",
    difficulty: 4,
  },
  {
    prompt: "Before a flight, a pilot must check NOTAMs primarily to:",
    options: [
      "Confirm the aircraft technical log has been signed",
      "Obtain the area forecast and terminal aerodrome forecasts",
      "Identify temporary hazards and changes not yet published in the AIP",
      "Establish the fuel reserves required for the flight",
    ],
    answer: 2,
    explanation:
      "NOTAMs carry time-critical information that arises too late for the AIP publication cycle — navaid outages, runway works, temporary restricted areas.",
    subject: "air-law",
    section: "Flight Preparation and Fuel",
    caanzRef: "CAR Part 91",
    difficulty: 2,
  },
  {
    prompt:
      "The minimum fuel a VFR flight by day must carry is the fuel to reach the destination plus a reserve of:",
    options: [
      "10 minutes at normal cruise consumption",
      "30 minutes at normal cruise consumption",
      "45 minutes at normal cruise consumption",
      "Whatever the pilot judges reasonable for the conditions",
    ],
    answer: 1,
    explanation:
      "Day VFR requires a 30 minute fixed reserve at normal cruise consumption on top of the fuel to reach the destination. It is a regulatory minimum, not a target.",
    subject: "air-law",
    section: "Flight Preparation and Fuel",
    caanzRef: "CAR Part 91",
    difficulty: 2,
  },
];

/*
 * A tenth question once sat here — "The primary purpose of a mock
 * examination is to:". It is about the product, not the syllabus, so there
 * is no section it belongs to and no revision area a student could be sent
 * to after missing it. It is gone rather than filed somewhere convenient.
 */

async function main() {
  const PUBLISHED: ContentStatus = "PUBLISHED";

  const airLaw = await db.subject.findFirst({
    where: { slug: "air-law", course: { slug: "ppl-theory" } },
    include: { chapters: { orderBy: { order: "asc" }, take: 1 }, course: true },
  });
  if (!airLaw) {
    console.error("PPL Air Law not found — run `npm run seed` first.");
    process.exit(1);
  }

  let created = 0;
  for (const [index, spec] of BANK.entries()) {
    // The subject the question is about, and the section of it the question
    // belongs to. Both must exist: a question with nowhere real to sit is
    // skipped rather than filed under a plausible-looking substitute.
    const subject = await db.subject.findFirst({
      where: { slug: spec.subject, course: { slug: "ppl-theory" } },
      include: {
        chapters: { orderBy: { order: "asc" }, take: 1 },
        modules: { where: { title: spec.section }, select: { id: true, sectionCode: true, title: true } },
      },
    });
    const section = subject?.modules[0];
    if (!subject || !section) {
      console.warn(
        `skipped — ${spec.subject} has no section "${spec.section}": ${spec.prompt.slice(0, 50)}`,
      );
      continue;
    }

    const mapping = {
      subjectId: subject.id,
      chapterId: subject.chapters[0]?.id ?? null,
      moduleId: section.id,
      kdrCode: section.sectionCode,
      kdrTopic: section.title,
    };

    const existing = await db.question.findFirst({ where: { prompt: spec.prompt } });
    if (existing) {
      await db.question.update({
        where: { id: existing.id },
        data: {
          ...mapping,
          caanzRef: spec.caanzRef ?? null,
          ac61Ref: spec.ac61Ref ?? null,
          difficulty: spec.difficulty ?? null,
          status: PUBLISHED,
        },
      });
      continue;
    }

    await db.question.create({
      data: {
        ...mapping,
        prompt: spec.prompt,
        explanation: spec.explanation,
        caanzRef: spec.caanzRef ?? null,
        ac61Ref: spec.ac61Ref ?? null,
        difficulty: spec.difficulty ?? null,
        order: index,
        status: PUBLISHED,
        options: {
          create: spec.options.map((text, i) => ({
            text,
            isCorrect: i === spec.answer,
            order: i,
          })),
        },
      },
    });
    created++;
  }

  const mocks = [
    {
      title: "PPL Air Law Mock Exam",
      description: "Timed mock drawn from the PPL Air Law question bank.",
      subjectId: airLaw.id,
      questionCount: 10,
      durationMinutes: 20,
      passingPercent: 70,
    },
    {
      title: "PPL Theory Full Mock",
      description: "Timed mock drawn from every published PPL Theory subject.",
      courseId: airLaw.course.id,
      questionCount: 10,
      durationMinutes: 30,
      passingPercent: 70,
    },
  ];

  for (const [index, m] of mocks.entries()) {
    const slug = slugify(m.title);
    await db.mockExam.upsert({
      where: { slug },
      update: {},
      create: {
        slug,
        title: m.title,
        description: m.description,
        subjectId: "subjectId" in m ? (m.subjectId as string) : null,
        courseId: "courseId" in m ? (m.courseId as string) : null,
        questionCount: m.questionCount,
        durationMinutes: m.durationMinutes,
        passingPercent: m.passingPercent,
        randomize: true,
        status: PUBLISHED,
        order: index,
      },
    });
  }

  console.log("Phase 4 seed:", {
    questionsCreated: created,
    publishedQuestions: await db.question.count({ where: { status: "PUBLISHED" } }),
    mockExams: await db.mockExam.count(),
  });
}

main()
  .then(() => db.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
