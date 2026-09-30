/**
 * Seeds an admin, a demo student, and the PRD's initial academic structure.
 *
 * These rows are DATA, not configuration: the counts below reflect the PRD's
 * starting point, and an admin is free to add a seventh PPL subject or a whole
 * new course without touching code (§7, §30).
 *
 * Chapter bodies are clearly-marked placeholders — §31 forbids inventing final
 * client study material.
 */
import { PrismaClient, type ContentStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

import { slugify } from "../lib/slug";

const db = new PrismaClient();

const FLIGHT_TEST_MODULES = [
  ["Personal Preparation", "IM SAFE checklist, Documents, Privileges, Currency, Limitations."],
  ["Aircraft Documents", "Certificate of Airworthiness, Technical Log, Flight Manual, CAA Form 2129, CAA Form 2173."],
  ["Weather, AIP NZ, and Supplements", "Area forecasts, TAF, METAR, NOTAMs, AIP, Go/No-go decision matrix."],
  ["Performance and Operating Requirements", "P-charts, Group rating system, Seasonal atmospheric effects on performance."],
  ["Fuel Management", "Fuel reserves required, Quantity calculations, Consumption rates, Fuel system management."],
  ["Loading", "MAUW, Centre of Gravity envelope position, Load distribution, Cargo securing."],
  ["Pre-Flight Inspection", "Interior checks, Exterior walk around, Load security verification."],
  ["Emergency Equipment", "Passenger supervision, Comprehensive passenger emergency briefings."],
] as const;

const THEORY_CHAPTERS = [
  "Introduction and Syllabus Overview",
  "Core Principles",
  "Applied Scenarios",
  "Exam Technique and Recalls",
] as const;

type SubjectSeed = { title: string; description: string };

const COURSES: Array<{
  slug: string;
  title: string;
  description: string;
  accessMonths: number;
  subjects: SubjectSeed[];
  chapterTitles: readonly string[] | readonly (readonly [string, string])[];
}> = [
  {
    slug: "ppl-theory",
    title: "PPL Theory",
    description: "Private Pilot Licence — the six core theory subjects.",
    accessMonths: 3,
    subjects: [
      { title: "Air Law", description: "Rules, airspace, documents and operating requirements." },
      { title: "Navigation", description: "Charts, tracks, drift, timing and flight planning." },
      { title: "Meteorology", description: "Weather systems, hazards, forecasts and reports." },
      { title: "Human Factors", description: "Performance, limitations and decision making." },
      { title: "Aircraft Technical Knowledge", description: "Airframes, engines, systems and instruments." },
      { title: "Flight Radiotelephony", description: "Standard phraseology and radio procedures." },
    ],
    chapterTitles: THEORY_CHAPTERS,
  },
  {
    slug: "cpl-theory",
    // Named the way IR is: the brand leads, because the course is built here.
    // `syllabusHeading()` strips this prefix before adding its own, so the
    // subject index still reads "KiwiPilotPrep — CPL Theory Syllabus".
    title: "KiwiPilotPrep — CPL Theory",
    description: "Commercial Pilot Licence — the six core theory subjects.",
    accessMonths: 3,
    subjects: [
      { title: "Air Law", description: "Commercial operating rules and requirements." },
      { title: "Navigation", description: "Advanced navigation and flight planning." },
      { title: "Meteorology", description: "Commercial-level weather interpretation." },
      { title: "Human Factors", description: "Crew performance and threat management." },
      { title: "Aircraft Technical Knowledge", description: "Advanced systems and performance." },
      { title: "Flight Planning", description: "Fuel, loading and commercial flight planning." },
    ],
    chapterTitles: THEORY_CHAPTERS,
  },
  {
    // The IR subjects are the three supplied study manuals, one subject each.
    //
    // They were previously seeded as "Navigation & Flight Planning",
    // "Operations & Procedures" and "Meteorology" — a plausible-looking
    // structure that matched no material anyone had. Two of the three could
    // never be filled, and the two subjects that did have manuals had to be
    // added alongside them, so the course showed five subjects for three books.
    // The subjects are now named after what actually exists.
    slug: "ir-theory",
    title: "KiwiPilotPrep — IR Theory",
    description: "Instrument Rating — the three core IR theory subjects.",
    accessMonths: 3,
    subjects: [
      { title: "IFR Navigation", description: "Altimetry, charts, tracking, holds and IFR flight planning." },
      { title: "IFR Navaids", description: "Flight instruments and the radio navigation aids used under IFR." },
      { title: "IR Air Law", description: "The rules, airspace and procedures that govern instrument flight." },
    ],
    // No placeholder chapters. This course's chapters are built from the
    // supplied manuals by the content pipeline, and seeding four empty ones
    // beside them puts a false chapter count on every subject card.
    chapterTitles: [],
  },
  {
    slug: "ppl-flight-test",
    title: "PPL Flight Test Groundwork",
    description: "Eight oral and preparation modules for the PPL flight test.",
    accessMonths: 3,
    subjects: [{ title: "Flight Test Groundwork", description: "The eight prescribed oral preparation sections." }],
    chapterTitles: FLIGHT_TEST_MODULES,
  },
  {
    slug: "cpl-flight-test",
    title: "CPL Flight Test Groundwork",
    description: "The same eight modules held to CPL standard.",
    accessMonths: 3,
    subjects: [{ title: "Flight Test Groundwork", description: "The eight prescribed oral preparation sections." }],
    chapterTitles: FLIGHT_TEST_MODULES,
  },
];

function placeholderBlocks(title: string, note: string) {
  return [
    { type: "heading", text: title },
    {
      type: "paragraph",
      text:
        "Placeholder study material. The client's own content for this chapter is uploaded " +
        "through the admin console — see the CMS content editor.",
    },
    { type: "note", variant: "info", text: note },
  ];
}

/**
 * A guard, not a convenience. This script creates accounts with published
 * passwords and demo content; running it against a live database would hand
 * anyone who has read this repository an admin login. Production seeding is
 * done with prisma/seed-syllabus.ts and the admin console instead.
 */
function refuseInProduction() {
  const url = process.env.DATABASE_URL ?? "";
  const looksLocal = /@(localhost|127\.0\.0\.1|::1)[:/]/.test(url);
  if (process.env.NODE_ENV === "production" || (!looksLocal && !process.env.ALLOW_DEMO_SEED)) {
    throw new Error(
      "Refusing to seed demo accounts against a non-local database. " +
        "Set ALLOW_DEMO_SEED=1 only if you are certain this database is disposable.",
    );
  }
}

async function main() {
  refuseInProduction();
  const PUBLISHED: ContentStatus = "PUBLISHED";

  // Seeded accounts are marked confirmed: there is no inbox behind them, and
  // leaving them unverified would block the demo student from the trial and
  // the checkout on a fresh local database.
  const admin = await db.user.upsert({
    where: { email: "admin@kiwipilotprep.com" },
    update: { emailVerifiedAt: new Date() },
    create: {
      email: "admin@kiwipilotprep.com",
      name: "KiwiPilotPrep Admin",
      passwordHash: await bcrypt.hash("admin12345", 12),
      role: "ADMIN",
      emailVerifiedAt: new Date(),
    },
  });

  const student = await db.user.upsert({
    where: { email: "student@example.com" },
    update: { emailVerifiedAt: new Date() },
    create: {
      email: "student@example.com",
      name: "Jordan Ngata",
      passwordHash: await bcrypt.hash("student12345", 12),
      role: "STUDENT",
      emailVerifiedAt: new Date(),
    },
  });

  for (const [courseIndex, spec] of COURSES.entries()) {
    const course = await db.course.upsert({
      where: { slug: spec.slug },
      update: {},
      create: {
        slug: spec.slug,
        title: spec.title,
        description: spec.description,
        accessMonths: spec.accessMonths,
        order: courseIndex,
        status: PUBLISHED,
      },
    });

    for (const [subjectIndex, subjectSpec] of spec.subjects.entries()) {
      // The slug is derived from the title here and nowhere else, and routes
      // are built on the slug — so changing a title in this file renames the
      // subject's URL and orphans the existing one. Display titles are refined
      // in the database after seeding instead, which is safe because the upsert
      // below leaves an existing subject's title alone.
      const subjectSlug = slugify(subjectSpec.title);
      const subject = await db.subject.upsert({
        where: { courseId_slug: { courseId: course.id, slug: subjectSlug } },
        update: {},
        create: {
          courseId: course.id,
          slug: subjectSlug,
          title: subjectSpec.title,
          description: subjectSpec.description,
          order: subjectIndex,
          status: PUBLISHED,
        },
      });

      for (const [chapterIndex, entry] of spec.chapterTitles.entries()) {
        const [title, note] = Array.isArray(entry)
          ? (entry as unknown as [string, string])
          : [entry as string, "Content to be supplied by the client."];

        const chapterSlug = slugify(title);
        const chapter = await db.chapter.upsert({
          where: { subjectId_slug: { subjectId: subject.id, slug: chapterSlug } },
          update: {},
          create: {
            subjectId: subject.id,
            slug: chapterSlug,
            title,
            description: note,
            order: chapterIndex,
            status: PUBLISHED,
          },
        });

        await db.chapterContent.upsert({
          where: { chapterId: chapter.id },
          update: {},
          create: { chapterId: chapter.id, blocks: placeholderBlocks(title, note) },
        });
      }
    }
  }

  // One sample practice question so the practice flow has something to show.
  const airLaw = await db.subject.findFirst({
    where: { slug: "air-law", course: { slug: "ppl-theory" } },
    include: { chapters: { orderBy: { order: "asc" }, take: 1 } },
  });

  if (airLaw && airLaw.chapters[0]) {
    const existing = await db.question.findFirst({
      where: { chapterId: airLaw.chapters[0].id },
    });
    if (!existing) {
      await db.question.create({
        data: {
          subjectId: airLaw.id,
          chapterId: airLaw.chapters[0].id,
          prompt:
            "When two aircraft are approaching head-on and there is a risk of collision, each pilot shall:",
          explanation:
            "Head-on with a collision risk: both aircraft alter heading to the right. The rule is " +
            "symmetrical so both pilots take a predictable, complementary action.",
          topic: "61.105",
          status: PUBLISHED,
          options: {
            create: [
              { text: "Turn left", order: 0 },
              { text: "Climb immediately", order: 1 },
              { text: "Alter heading to the right", isCorrect: true, order: 2 },
              { text: "Maintain heading and give way to the larger aircraft", order: 3 },
            ],
          },
        },
      });
    }
  }

  /* ------------------------------------------------------------ products */
  // Commercial packages matching the PRD (§2). Prices are DEVELOPMENT
  // PLACEHOLDERS — the client sets real figures in the admin console (§19).
  const productSpecs: Array<{
    slug: string;
    title: string;
    description: string;
    nzd: number;
    inr: number;
    accessMonths: number | null;
    courseSlugs: string[];
  }> = [
    {
      slug: "ppl-theory-package",
      title: "PPL Theory Package",
      description: "All six PPL theory subjects.",
      nzd: 69900, inr: 3590000, accessMonths: 3,
      courseSlugs: ["ppl-theory"],
    },
    {
      slug: "cpl-theory-package",
      title: "CPL Theory Package",
      description: "All six CPL theory subjects.",
      nzd: 79900, inr: 4090000, accessMonths: 3,
      courseSlugs: ["cpl-theory"],
    },
    {
      slug: "ir-theory-package",
      title: "IR Theory Package",
      description: "All three Instrument Rating subjects.",
      nzd: 49900, inr: 2590000, accessMonths: 3,
      courseSlugs: ["ir-theory"],
    },
    {
      slug: "ppl-flight-test-package",
      title: "PPL Flight Test Groundwork",
      description: "Eight oral and preparation modules for the PPL flight test.",
      nzd: 24900, inr: 1290000, accessMonths: 3,
      courseSlugs: ["ppl-flight-test"],
    },
    {
      slug: "cpl-flight-test-package",
      title: "CPL Flight Test Groundwork",
      description: "The same eight modules held to CPL standard.",
      nzd: 29900, inr: 1540000, accessMonths: 3,
      courseSlugs: ["cpl-flight-test"],
    },
    {
      slug: "complete-aviator-pass",
      title: "All-Inclusive Complete Aviator Pass",
      description: "Every theory subject and both flight test groundwork tracks.",
      nzd: 179900, inr: 9190000, accessMonths: 12,
      courseSlugs: [
        "ppl-theory", "cpl-theory", "ir-theory",
        "ppl-flight-test", "cpl-flight-test",
      ],
    },
  ];

  for (const [index, spec] of productSpecs.entries()) {
    const product = await db.product.upsert({
      where: { slug: spec.slug },
      update: {},
      create: {
        slug: spec.slug,
        title: spec.title,
        description: spec.description,
        accessMonths: spec.accessMonths,
        order: index,
        status: PUBLISHED,
        prices: {
          create: [
            { currency: "NZD", amountMinor: spec.nzd },
            { currency: "INR", amountMinor: spec.inr },
          ],
        },
      },
    });

    for (const courseSlug of spec.courseSlugs) {
      const course = await db.course.findUnique({ where: { slug: courseSlug } });
      if (!course) continue;
      const exists = await db.productItem.findFirst({
        where: { productId: product.id, courseId: course.id },
      });
      if (!exists) {
        await db.productItem.create({
          data: { productId: product.id, courseId: course.id },
        });
      }
    }
  }

  // An individual-subject product, proving the architecture supports it (§6).
  const met = await db.subject.findFirst({
    where: { slug: "meteorology", course: { slug: "ppl-theory" } },
  });
  if (met) {
    const single = await db.product.upsert({
      where: { slug: "ppl-meteorology" },
      update: {},
      create: {
        slug: "ppl-meteorology",
        title: "PPL Meteorology (single subject)",
        description: "One PPL theory subject on its own.",
        accessMonths: 3,
        order: 10,
        status: PUBLISHED,
        prices: {
          create: [
            { currency: "NZD", amountMinor: 14900 },
            { currency: "INR", amountMinor: 760000 },
          ],
        },
      },
    });
    const exists = await db.productItem.findFirst({
      where: { productId: single.id, subjectId: met.id },
    });
    if (!exists) {
      await db.productItem.create({
        data: { productId: single.id, subjectId: met.id },
      });
    }
  }

  // Give the demo student the PPL track so the dashboard is not empty.
  const ppl = await db.course.findUnique({ where: { slug: "ppl-theory" } });
  if (ppl) {
    const expires = new Date();
    expires.setMonth(expires.getMonth() + ppl.accessMonths);
    await db.entitlement.upsert({
      where: { userId_scopeKey: { userId: student.id, scopeKey: `course:${ppl.id}` } },
      update: {},
      create: {
        userId: student.id,
        scopeKey: `course:${ppl.id}`,
        courseId: ppl.id,
        source: "SEED",
        status: "ACTIVE",
        expiresAt: expires,
        note: "Seeded demo access",
      },
    });
  }

  const counts = {
    courses: await db.course.count(),
    subjects: await db.subject.count(),
    chapters: await db.chapter.count(),
    questions: await db.question.count(),
    products: await db.product.count(),
    entitlements: await db.entitlement.count(),
  };
  console.log("Seeded:", counts);
  console.log(`Admin:   ${admin.email} / admin12345`);
  console.log(`Student: ${student.email} / student12345`);
}

main()
  .then(() => db.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
