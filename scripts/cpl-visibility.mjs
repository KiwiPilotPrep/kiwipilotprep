/**
 * Two corrections to what the CPL course shows a student. Neither deletes
 * anything.
 *
 * ---------------------------------------------------------------------------
 * 1. The CAA syllabus was leaking into the teaching.
 *
 * Navigation's lessons were printing blocks headed "18.2.2 What you need to
 * know" followed by the CAA's own requirement wording, and its subject page was
 * offering "the examinable syllabus for this subject, indexed by code" instead
 * of the course.
 *
 * Neither of those is something the rebuild wrote. Both are what the reader
 * does when a subject has a published CAA syllabus attached to it: the lesson
 * page renders every confirmed syllabus item as an objective block, and the
 * subject page describes the syllabus rather than the chapters. IR has no CAA
 * syllabus rows at all, which is exactly why IR reads as a course — its subject
 * page redirects to the contents and its lessons carry no codes.
 *
 * The rebuild made this louder rather than causing it: mapping every lesson to
 * the items of its chapter turned a page that showed nothing into one showing
 * up to six requirement blocks above the teaching.
 *
 * So the syllabus rows are archived rather than deleted. Archived, they are
 * invisible to `syllabusForSubject` and to `confirmedItemsForLesson`, both of
 * which filter on PUBLISHED — so Navigation behaves exactly as IR does. The
 * rows keep their ids, and every LessonSyllabusItem mapping survives untouched
 * as the internal record of which chapter answers which requirement. That is
 * the role the syllabus is supposed to have: a validation checklist, not the
 * student's curriculum.
 *
 * ---------------------------------------------------------------------------
 * 2. CPL Theory was advertising seven subjects.
 *
 * `flight-planning` corresponds to no CAA examination — flight planning is
 * taught inside Subject 18, Flight Navigation General, which is where the
 * rebuild put it. The subject is empty and its per-subject product is on sale.
 *
 * Archiving the subject removes it from the course page, which lists only
 * PUBLISHED subjects. Its product is taken out of the catalogue at the same
 * time, because a published product pointing at an archived subject is a way
 * to sell access to nothing. It has never been ordered, so nobody loses
 * anything. Both rows keep their ids, so the deliberate retirement step can
 * still do whatever it decides to do.
 *
 *   node scripts/cpl-visibility.mjs            # report what would change
 *   node scripts/cpl-visibility.mjs --apply    # make the changes
 *   node scripts/cpl-visibility.mjs --revert   # put both back as they were
 */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();
const COURSE = "cpl-theory";

/**
 * The subjects whose syllabus index is taken out of the student's way.
 *
 * A subject is added here as it is rebuilt. Until then it keeps the old
 * imported course and the old published syllabus, because hiding the syllabus
 * from a subject that has nothing else to show would leave it with no
 * structure at all.
 */
const SUBJECTS = [
  "navigation", "air-law", "meteorology",
  "principles-of-flight", "aircraft-technical-knowledge", "human-factors",
];

async function main() {
  const apply = process.argv.includes("--apply");
  const revert = process.argv.includes("--revert");
  const to = revert ? "PUBLISHED" : "ARCHIVED";

  const course = await db.course.findUnique({ where: { slug: COURSE }, select: { id: true } });
  if (!course) throw new Error(`no ${COURSE} course`);

  // Only subjects that have actually been rebuilt: a subject still carrying the
  // old import needs its syllabus index, because it is the only structure it
  // has.
  const rebuilt = await db.subject.findMany({
    where: {
      slug: { in: SUBJECTS },
      courseId: course.id,
      // Every chapter authored and none left from the deck importer. "Some
      // authored" is not enough: Human Factors and Air Law carried a handful of
      // AUTHORED chapters from an old additions import long before either was
      // rebuilt, and that would have hidden the syllabus of a subject that
      // still had nothing else to show.
      modules: { some: { origin: "AUTHORED" }, none: { origin: "DECK" } },
    },
    select: { id: true, slug: true },
  });
  if (!rebuilt.length) throw new Error("no rebuilt subject found to act on");

  /* ---- 1. the syllabus index and the objective blocks ------------------- */
  const ids = rebuilt.map((s) => s.id);
  const topics = await db.syllabusTopic.findMany({
    where: { subjectId: { in: ids } },
    select: { id: true, code: true, status: true, _count: { select: { items: true } } },
  });
  const itemCount = topics.reduce((n, t) => n + t._count.items, 0);
  const mappings = await db.lessonSyllabusItem.count({
    where: { item: { topic: { subjectId: { in: ids } } } },
  });

  console.log(`rebuilt subjects: ${rebuilt.map((s) => s.slug).join(", ")}`);
  console.log(`syllabus rows across them: ${topics.length} topics, ${itemCount} items`);
  console.log(`  currently ${topics.filter((t) => t.status === "PUBLISHED").length} published topics`);
  console.log(`  lesson→item mappings that will be left exactly as they are: ${mappings}`);
  console.log(`  → set topic and item status to ${to}`);

  /* ---- 2. the seventh subject ------------------------------------------ */
  const fp = await db.subject.findFirst({
    where: { slug: "flight-planning", courseId: course.id },
    select: { id: true, status: true, _count: { select: { modules: true, chapters: true } } },
  });
  const fpProduct = await db.product.findFirst({
    where: { slug: "subject-cpl-theory-flight-planning" },
    select: { id: true, status: true, _count: { select: { orders: true, entitlements: true } } },
  });

  if (fp) {
    console.log(`\nflight-planning subject: status ${fp.status}, ${fp._count.modules} chapters, ${fp._count.chapters} placeholder chapters`);
    console.log(`  → set subject status to ${to}`);
  }
  if (fpProduct) {
    console.log(`flight-planning product: status ${fpProduct.status}, ${fpProduct._count.orders} orders, ${fpProduct._count.entitlements} entitlements`);
    if (fpProduct._count.orders > 0) {
      throw new Error(
        "the flight-planning product has orders against it — stopping. " +
          "Taking a product somebody has bought out of the catalogue is not a " +
          "visibility change and needs a decision, not a script.",
      );
    }
    console.log(`  → set product status to ${revert ? "PUBLISHED" : "DRAFT"}`);
  }

  if (!apply && !revert) {
    console.log("\ndry run — nothing written. Pass --apply to make these changes.");
    await db.$disconnect();
    return;
  }

  await db.$transaction(async (tx) => {
    // Ids are never touched: only the status column moves, so every foreign key
    // pointing at these rows keeps pointing at them.
    await tx.syllabusItem.updateMany({
      where: { topic: { subjectId: { in: ids } } },
      data: { status: to },
    });
    await tx.syllabusTopic.updateMany({
      where: { subjectId: { in: ids } },
      data: { status: to },
    });
    if (fp) {
      await tx.subject.update({ where: { id: fp.id }, data: { status: to } });
    }
    if (fpProduct) {
      await tx.product.update({
        where: { id: fpProduct.id },
        data: { status: revert ? "PUBLISHED" : "DRAFT" },
      });
    }
  });

  console.log(`\napplied — everything set to ${to}. No row was deleted and no id changed.`);
  await db.$disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await db.$disconnect();
  process.exit(1);
});
