/**
 * Gives every course the same name shape.
 *
 * My Courses, the course page, the dashboard resume line, the pricing page and
 * every breadcrumb read the course title straight out of the database, so a
 * course without the prefix sits beside "KiwiPilotPrep — CPL Theory" looking
 * like a different product. One row is wrong, not the pages.
 *
 * This changes titles and nothing else. Ids, slugs, statuses, the subjects
 * beneath them, the products that unlock them and the entitlements that
 * reference them are all untouched — a title is display text and nothing in
 * the application keys off it.
 *
 * PPL Theory was the first to be brought into line. The two Flight Test
 * Groundwork courses followed once their reader was held to the same standard
 * as the theory courses: with the prefix absent, the lesson header read "PPL
 * Flight Test Groundwork · Flight Test Groundwork", which is the course and
 * its only subject saying the same thing twice. `courseSubjectLine` in
 * `lib/course-naming.ts` drops the repeat; this makes the half that remains
 * read like the rest of the product.
 *
 *   node scripts/ppl-course-name.mjs [--apply]
 */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

/** The name each course should carry. */
const WANTED = {
  "ppl-theory": "KiwiPilotPrep — PPL Theory",
  "ppl-flight-test": "KiwiPilotPrep — PPL Flight Test Groundwork",
  "cpl-flight-test": "KiwiPilotPrep — CPL Flight Test Groundwork",
};

/**
 * Read, never written: these are what "consistent" means here, and if one of
 * them ever changes shape this should be seen to disagree with it rather than
 * quietly enforce a stale convention.
 */
const REFERENCE = ["cpl-theory", "ir-theory"];

async function main() {
  const apply = process.argv.includes("--apply");

  const siblings = await db.course.findMany({
    where: { slug: { in: REFERENCE } },
    select: { slug: true, title: true },
    orderBy: { slug: "asc" },
  });
  console.log("for comparison:");
  for (const s of siblings) console.log(`  ${s.slug.padEnd(16)} ${s.title}`);
  console.log();

  let changes = 0;
  for (const [slug, wanted] of Object.entries(WANTED)) {
    const course = await db.course.findUnique({
      where: { slug },
      select: { id: true, title: true, status: true, _count: { select: { subjects: true } } },
    });
    if (!course) throw new Error(`no ${slug} course`);

    if (course.title === wanted) {
      console.log(`  ${slug.padEnd(16)} ${course.title}   (already correct)`);
      continue;
    }
    changes += 1;
    console.log(`  ${slug.padEnd(16)} ${course.title}  →  ${wanted}`);
    console.log(`  ${" ".repeat(16)} ${course._count.subjects} subjects, status ${course.status}, id unchanged`);
    if (apply) await db.course.update({ where: { id: course.id }, data: { title: wanted } });
  }

  console.log();
  if (!changes) console.log("nothing to do");
  else if (apply) console.log(`applied — ${changes} title(s) updated. No id, slug, product or entitlement was touched.`);
  else console.log(`dry run — nothing written. Pass --apply to make ${changes} change(s).`);

  await db.$disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await db.$disconnect();
  process.exit(1);
});
