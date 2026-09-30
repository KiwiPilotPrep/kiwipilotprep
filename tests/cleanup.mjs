/**
 * Removes fixtures left behind by the black-box suites.
 *
 * `uat.mjs` and `admin-cms.mjs` are deliberately database-free — they drive the
 * application through its own interface and never reach into Postgres, because
 * that is what makes them honest acceptance tests. The cost is that they
 * cannot tidy up after themselves: the CMS offers archiving, not deletion, so
 * every run leaves an archived course behind. Sixty of them had accumulated
 * before this script existed.
 *
 * So the sweeping happens here instead, after the suites have run. Cleaning up
 * afterwards is not the same as fabricating state beforehand, which is the
 * thing those suites are careful to avoid.
 *
 * Safe by construction: it matches only the fixture naming patterns, and it
 * refuses to delete anything a real entitlement, product, order or piece of
 * student progress depends on.
 *
 *   node tests/cleanup.mjs
 */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();
const dryRun = process.argv.includes("--dry-run");

/** Fixture names, as created by the suites. Nothing else is ever matched. */
const COURSE_PATTERNS = [
  { title: { startsWith: "UAT Course" } },
  { title: { startsWith: "CMS Test" } },
  { slug: { startsWith: "t3-" } },
  { slug: { startsWith: "t4-" } },
  { slug: { startsWith: "t6-" } },
  { slug: { startsWith: "t7-" } },
  { slug: { startsWith: "g5-" } },
  { slug: { startsWith: "idor-" } },
];

const QUESTION_PATTERNS = [
  { prompt: { startsWith: "T4 Q" } },
  { prompt: { startsWith: "T7 Q" } },
  { prompt: { startsWith: "G5 " } },
];

const USER_PREFIXES = [
  "uat-", "pay-", "mock-", "g5-", "coup-", "idor-", "verif-", "autht-", "resp-", "flow-",
  "t7-",
];

async function main() {
  const report = [];

  /* ------------------------------------------------------------ courses */

  const courses = await db.course.findMany({
    where: { OR: COURSE_PATTERNS },
    select: { id: true, title: true },
  });
  const courseIds = courses.map((c) => c.id);

  if (courseIds.length) {
    const subjects = await db.subject.findMany({
      where: { courseId: { in: courseIds } },
      select: { id: true },
    });
    const subjectIds = subjects.map((s) => s.id);
    const chapters = await db.chapter.findMany({
      where: { subjectId: { in: subjectIds } },
      select: { id: true },
    });
    const chapterIds = chapters.map((c) => c.id);

    // If anything real points at these, something has gone wrong and deleting
    // would take live data with it. Stop rather than guess.
    const held =
      (await db.entitlement.count({
        where: { OR: [{ courseId: { in: courseIds } }, { subjectId: { in: subjectIds } }] },
      })) +
      (await db.productItem.count({
        where: { OR: [{ courseId: { in: courseIds } }, { subjectId: { in: subjectIds } }] },
      })) +
      (await db.chapterProgress.count({ where: { chapterId: { in: chapterIds } } }));

    if (held > 0) {
      console.error(
        `Refusing to delete ${courseIds.length} fixture courses: ${held} real records depend on them.`,
      );
      process.exit(1);
    }

    if (!dryRun) await db.course.deleteMany({ where: { id: { in: courseIds } } });
    report.push(`courses ${courseIds.length} (with ${subjectIds.length} subjects, ${chapterIds.length} chapters)`);
  }

  /* ---------------------------------------------------------- questions */

  // Some suites create questions with no subject, so a course delete never
  // reaches them. They are matched by their fixture prompt instead.
  const strays = await db.question.findMany({
    where: { OR: QUESTION_PATTERNS },
    select: { id: true },
  });
  if (strays.length) {
    const ids = strays.map((q) => q.id);
    const used =
      (await db.mockAttemptQuestion.count({ where: { questionId: { in: ids } } })) +
      (await db.questionAttempt.count({ where: { questionId: { in: ids } } }));

    if (used > 0) {
      console.error(`Refusing to delete ${ids.length} fixture questions: ${used} attempts use them.`);
      process.exit(1);
    }

    if (!dryRun) {
      await db.questionOption.deleteMany({ where: { questionId: { in: ids } } });
      await db.question.deleteMany({ where: { id: { in: ids } } });
    }
    report.push(`questions ${ids.length}`);
  }

  /* -------------------------------------------------------------- users */

  const users = await db.user.findMany({
    where: { OR: USER_PREFIXES.map((p) => ({ email: { startsWith: p } })) },
    select: { id: true },
  });
  if (users.length) {
    const ids = users.map((u) => u.id);
    if (!dryRun) {
      const claims = await db.guaranteeClaim.findMany({
        where: { userId: { in: ids } },
        select: { id: true },
      });
      const claimIds = claims.map((c) => c.id);
      if (claimIds.length) {
        await db.refund.deleteMany({ where: { claimId: { in: claimIds } } });
        await db.guaranteeDocument.deleteMany({ where: { claimId: { in: claimIds } } });
        await db.claimAuditLog.deleteMany({ where: { claimId: { in: claimIds } } }).catch(() => {});
        await db.guaranteeClaim.deleteMany({ where: { id: { in: claimIds } } });
      }
      await db.emailLog.deleteMany({ where: { userId: { in: ids } } });
      await db.mockAttemptQuestion.deleteMany({ where: { attempt: { userId: { in: ids } } } });
      await db.mockAttempt.deleteMany({ where: { userId: { in: ids } } });
      await db.questionAttempt.deleteMany({ where: { userId: { in: ids } } });
      await db.chapterProgress.deleteMany({ where: { userId: { in: ids } } });
      await db.couponRedemption.deleteMany({ where: { userId: { in: ids } } });
      await db.entitlement.deleteMany({ where: { userId: { in: ids } } });
      await db.payment.deleteMany({ where: { order: { userId: { in: ids } } } });
      await db.order.deleteMany({ where: { userId: { in: ids } } });
      await db.organizationMember.deleteMany({ where: { userId: { in: ids } } });
      await db.organizationStudent.deleteMany({ where: { userId: { in: ids } } });
      await db.user.deleteMany({ where: { id: { in: ids } } });
    }
    report.push(`users ${ids.length}`);
  }

  /* ------------------------------------------------- other fixture rows */

  if (!dryRun) {
    await db.organization.deleteMany({ where: { slug: { startsWith: "idor-" } } }).catch(() => {});
    await db.organization.deleteMany({ where: { slug: { startsWith: "g5-" } } }).catch(() => {});
    await db.guaranteePolicy
      .deleteMany({ where: { version: { startsWith: "idor-fixture-" } } })
      .catch(() => {});
    await db.coupon.deleteMany({ where: { code: { startsWith: "T6" } } }).catch(() => {});
    await db.product.deleteMany({ where: { slug: { startsWith: "t3-" } } }).catch(() => {});
    await db.product.deleteMany({ where: { slug: { startsWith: "t6-" } } }).catch(() => {});
    await db.product.deleteMany({ where: { slug: { startsWith: "g5-" } } }).catch(() => {});
  }

  console.log(
    report.length
      ? `${dryRun ? "would remove" : "removed"}: ${report.join(", ")}`
      : "nothing to clean up",
  );

  const remaining = {
    courses: await db.course.count(),
    subjects: await db.subject.count(),
    chapters: await db.chapter.count(),
    questions: await db.question.count(),
  };
  console.log("remaining:", JSON.stringify(remaining));

  await db.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await db.$disconnect();
  process.exit(1);
});
