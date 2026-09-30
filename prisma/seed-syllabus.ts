/**
 * Syllabus corrections.
 *
 *  1. Renames PPL and CPL subjects to their proper NZ titles.
 *  2. Keeps each Flight Test Groundwork track as ONE subject holding the eight
 *     prescribed sections as its chapters — the card lists those eight as
 *     chips rather than splitting them into eight separate subject cards.
 *
 * Chapters are RE-PARENTED, never recreated, so chapter ids survive and every
 * ChapterProgress, QuestionAttempt and MockAttemptQuestion row still resolves.
 *
 *   npx tsx prisma/seed-syllabus.ts
 */
import { PrismaClient } from "@prisma/client";

import { slugify } from "../lib/slug";

const db = new PrismaClient();

/** Course slug → { current title → new title } */
const RENAMES: Record<string, Record<string, string>> = {
  "ppl-theory": {
    "Air Law": "Air Law (Aeroplane & Helicopter)",
    Navigation: "Air Navigation and Flight Planning",
    Meteorology: "PPL Meteorology",
  },
  "cpl-theory": {
    "Air Law": "Air Law (Aeroplane & Helicopter)",
    Navigation: "Air Navigation and Flight Planning",
    Meteorology: "CPL Meteorology",
  },
};

/** The eight sections of the Flight Test Report, in order. */
const FLIGHT_TEST_SECTIONS = [
  "Personal Preparation",
  "Aircraft Documents",
  "Weather, AIP NZ and Supplements",
  "Performance and Operating Requirements",
  "Fuel Management",
  "Loading",
  "Pre-Flight Inspection",
  "Emergency Equipment",
] as const;

async function renameSubjects() {
  let changed = 0;

  for (const [courseSlug, map] of Object.entries(RENAMES)) {
    const course = await db.course.findUnique({ where: { slug: courseSlug } });
    if (!course) continue;

    for (const [from, to] of Object.entries(map)) {
      const subject = await db.subject.findFirst({
        where: { courseId: course.id, title: from },
      });
      if (!subject) continue;

      await db.subject.update({
        where: { id: subject.id },
        // The slug is left alone on purpose: it is part of every student's
        // bookmarked URL and of any single-subject product already sold.
        data: { title: to },
      });

      await db.product.updateMany({
        where: { items: { some: { subjectId: subject.id } } },
        data: { title: `${to} (${course.title})` },
      });

      changed++;
      console.log(`  ${courseSlug}: "${from}" → "${to}"`);
    }
  }
  return changed;
}

/**
 * Consolidates a flight test track into a single subject.
 *
 * Whether the track is currently one subject with eight chapters, or eight
 * subjects with one chapter each, this ends in the same place: one subject
 * named "Flight Test Groundwork" holding all eight chapters in order.
 */
async function consolidateFlightTest(courseSlug: string) {
  const course = await db.course.findUnique({
    where: { slug: courseSlug },
    include: {
      subjects: {
        include: { chapters: { orderBy: { order: "asc" } } },
        orderBy: { order: "asc" },
      },
    },
  });
  if (!course) return 0;

  const TITLE = "Flight Test Groundwork";
  const SLUG = slugify(TITLE);

  // Reuse the original container if it is still there, archived or not.
  let holder = course.subjects.find((s) => s.slug === SLUG);

  if (!holder) {
    const created = await db.subject.create({
      data: {
        courseId: course.id,
        slug: SLUG,
        title: TITLE,
        description: "The eight prescribed oral preparation sections.",
        order: 0,
        status: "PUBLISHED",
      },
      include: { chapters: true },
    });
    holder = { ...created, chapters: [] };
  }

  await db.subject.update({
    where: { id: holder.id },
    data: {
      title: TITLE,
      description: "The eight prescribed oral preparation sections.",
      status: "PUBLISHED",
      order: 0,
    },
  });

  // Pull every chapter in this course back under the container, ordered to
  // match the Flight Test Report. Titles are compared loosely because the seed
  // wrote "Weather, AIP NZ, and Supplements" with an Oxford comma the report
  // form does not use.
  const loose = (t: string) => t.toLowerCase().replace(/[^a-z0-9]/g, "");

  let moved = 0;
  for (const [index, sectionTitle] of FLIGHT_TEST_SECTIONS.entries()) {
    const chapter = course.subjects
      .flatMap((s) => s.chapters)
      .find((c) => loose(c.title) === loose(sectionTitle));
    if (!chapter) continue;

    await db.chapter.update({
      where: { id: chapter.id },
      data: { subjectId: holder.id, order: index, status: "PUBLISHED" },
    });
    await db.question.updateMany({
      where: { chapterId: chapter.id },
      data: { subjectId: holder.id },
    });
    moved++;
  }

  // Any per-section subject left behind is archived, not deleted, so history
  // and any product that referenced it keep resolving.
  let archived = 0;
  for (const subject of course.subjects) {
    if (subject.id === holder.id) continue;
    const remaining = await db.chapter.count({ where: { subjectId: subject.id } });
    if (remaining > 0) continue;
    await db.subject.update({
      where: { id: subject.id },
      data: { status: "ARCHIVED", order: 99 },
    });
    archived++;
  }

  console.log(`  ${courseSlug}: ${moved} sections under one subject, ${archived} split subjects archived`);
  return moved;
}

async function main() {
  console.log("Renaming theory subjects:");
  const renamed = await renameSubjects();

  console.log("\nConsolidating flight test groundwork:");
  const ppl = await consolidateFlightTest("ppl-flight-test");
  const cpl = await consolidateFlightTest("cpl-flight-test");

  const counts = await db.course.findMany({
    where: { status: "PUBLISHED" },
    select: {
      title: true,
      _count: { select: { subjects: { where: { status: "PUBLISHED" } } } },
    },
    orderBy: { order: "asc" },
  });

  console.log("\nResult:");
  console.log({ renamed, pplSections: ppl, cplSections: cpl });
  for (const c of counts) console.log(`  ${c.title}: ${c._count.subjects} subjects`);
}

main()
  .then(() => db.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
