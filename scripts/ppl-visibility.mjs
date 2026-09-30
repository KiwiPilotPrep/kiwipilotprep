/**
 * Takes the CAA syllabus out of the student's way on the PPL subjects that
 * have something else to show. Deletes nothing.
 *
 * The problem is the one already solved for CPL. `lib/syllabus.ts` and
 * `lib/lessons.ts` both filter on PUBLISHED, so a subject with published
 * syllabus rows gets the CAA's checklist as its index and gets requirement
 * wording printed above the teaching on every lesson that maps to an item. IR
 * reads as a course precisely because it has no syllabus rows at all.
 *
 * PPL has 128 published syllabus topics across five subjects, and 312 of its
 * 864 lesson pages currently open with a CAA objective block.
 *
 * ---------------------------------------------------------------------------
 * Aircraft Technical Knowledge, and why it waited.
 *
 * On the first run ATK was held back. It had forty-two published topics and
 * **no course structure at all** — no chapters, no lessons — because its
 * material was attached to the syllabus rows themselves. For that subject the
 * CAA syllabus was not leaking over the course: it *was* the course, and
 * archiving it would have left a paying student with an empty subject, which
 * is worse than the leak. The note left here said the exemption was a decision
 * with a date on it and that the script should be re-run for ATK the day it had
 * lessons.
 *
 * That day came: `scripts/build-ppl-course.mjs` built the subject from the
 * 506-page source book into 38 chapters and 268 lessons. ATK now has a course
 * to fall back on, so it joins the list and its forty-two topics are archived
 * with the rest. The eligibility check below is what actually decides it — the
 * list is a statement of intent, the lesson count is the authority.
 *
 * The five subjects acted on — Air Law, Navigation, Meteorology, Flight
 * Radiotelephony and Aircraft Technical Knowledge — each keep a full set of
 * lessons underneath. Four of those five sets of lessons are still the old
 * deck-ordered import and will be rebuilt onto the curriculum pipeline later;
 * that is a separate problem, and a bad chapter list is still a better thing
 * to hand a student than a regulator's examination checklist.
 *
 * Human Factors joined the list later. It was left out of the first runs
 * because it had no syllabus rows to archive at all — Subject No. 10 was not
 * among the AC61-3 pages originally supplied — and it is in now that the
 * subject has been imported from the CAA's own copy of AC61-3 Revision 31.
 *
 * ---------------------------------------------------------------------------
 * What survives: every row, every id, and every LessonSyllabusItem mapping.
 * Only the status column moves, so the mapping record — which lesson answers
 * which requirement — stays intact and readable for internal validation, and
 * --revert puts it all back.
 *
 *   node scripts/ppl-visibility.mjs            # report what would change
 *   node scripts/ppl-visibility.mjs --apply    # make the change
 *   node scripts/ppl-visibility.mjs --revert   # put it back
 */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();
const COURSE = "ppl-theory";

/**
 * The subjects whose syllabus index is taken out of the student's way.
 *
 * A subject qualifies only if it has published lessons to fall back on. The
 * check below enforces that rather than trusting this list.
 */
const SUBJECTS = [
  "air-law",
  "navigation",
  "meteorology",
  "flight-radiotelephony",
  // Added once the rebuild gave it 38 chapters and 268 lessons of its own.
  "aircraft-technical-knowledge",
  // Added once Subject No. 10 was finally imported. It had no syllabus rows at
  // all for the whole of the first two rebuilds, because Subject No. 10 was
  // missing from the set of AC61-3 pages originally supplied; the CAA's own
  // AC61-3 Revision 31 has it, and it is now in the database like the rest —
  // and archived like the rest, for the same reason.
  "human-factors",
];

/**
 * Subjects deliberately left alone, with the reason, so that a later reader
 * does not "finish the job" without understanding why it was left unfinished.
 */
const HOLD = {};

async function main() {
  const apply = process.argv.includes("--apply");
  const revert = process.argv.includes("--revert");
  const to = revert ? "PUBLISHED" : "ARCHIVED";

  const course = await db.course.findUnique({ where: { slug: COURSE }, select: { id: true } });
  if (!course) throw new Error(`no ${COURSE} course`);

  const all = await db.subject.findMany({
    where: { courseId: course.id },
    orderBy: { order: "asc" },
    select: {
      id: true, slug: true, title: true,
      _count: { select: { modules: true, syllabusTopics: true } },
    },
  });

  // A subject may only lose its syllabus index if it has a course to fall back
  // on. Counted from the database, not assumed from the list above.
  const eligible = [];
  for (const s of all) {
    if (!SUBJECTS.includes(s.slug)) continue;
    const lessons = await db.lesson.count({ where: { module: { subjectId: s.id }, status: "PUBLISHED" } });
    if (lessons === 0) {
      throw new Error(
        `${s.slug} is listed for archiving but has no published lessons. ` +
          "Hiding the syllabus of a subject with nothing else to show would " +
          "leave it empty — the same mistake this script exists to avoid.",
      );
    }
    eligible.push({ ...s, lessons });
  }
  if (eligible.length !== SUBJECTS.length) {
    throw new Error(`expected ${SUBJECTS.length} subjects, resolved ${eligible.length}`);
  }

  const ids = eligible.map((s) => s.id);
  const topics = await db.syllabusTopic.findMany({
    where: { subjectId: { in: ids } },
    select: { id: true, subjectId: true, status: true, _count: { select: { items: true } } },
  });
  const items = await db.syllabusItem.count({ where: { topic: { subjectId: { in: ids } } } });
  const mappings = await db.lessonSyllabusItem.count({ where: { item: { topic: { subjectId: { in: ids } } } } });
  const confirmed = await db.lessonSyllabusItem.count({
    where: { item: { topic: { subjectId: { in: ids } } }, status: "CONFIRMED" },
  });
  const lessonsAffected = await db.lesson.count({
    where: { module: { subjectId: { in: ids } }, mappings: { some: { status: "CONFIRMED" } } },
  });

  console.log(`course ${COURSE} — ${all.length} subjects\n`);
  console.log("acting on:");
  for (const s of eligible) {
    const mine = topics.filter((t) => t.subjectId === s.id);
    const published = mine.filter((t) => t.status === "PUBLISHED").length;
    console.log(
      `  ${s.slug.padEnd(24)} ${String(mine.length).padStart(2)} topics (${published} published), ` +
        `${String(mine.reduce((n, t) => n + t._count.items, 0)).padStart(3)} items, ${s.lessons} published lessons to fall back on`,
    );
  }
  console.log("\nleaving alone:");
  for (const [slug, why] of Object.entries(HOLD)) {
    const s = all.find((x) => x.slug === slug);
    console.log(`  ${slug.padEnd(24)} ${s?._count.syllabusTopics ?? 0} topics — ${why}`);
  }

  console.log(`\n→ set status to ${to} on ${topics.length} topics and ${items} items`);
  console.log(`  ${mappings} lesson→item mappings (${confirmed} CONFIRMED) are left exactly as they are`);
  console.log(`  ${lessonsAffected} lesson pages stop printing a CAA objective block`);

  if (!apply && !revert) {
    console.log("\ndry run — nothing written. Pass --apply to make this change.");
    await db.$disconnect();
    return;
  }

  await db.$transaction(async (tx) => {
    // Only the status column moves. No id changes, so every foreign key
    // pointing at these rows keeps pointing at them.
    await tx.syllabusItem.updateMany({ where: { topic: { subjectId: { in: ids } } }, data: { status: to } });
    await tx.syllabusTopic.updateMany({ where: { subjectId: { in: ids } }, data: { status: to } });
  });

  console.log(`\napplied — set to ${to}. No row was deleted and no id changed.`);
  await db.$disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await db.$disconnect();
  process.exit(1);
});
