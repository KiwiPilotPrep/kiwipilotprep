import "server-only";

import { db } from "@/lib/db";
import { courseProgress } from "@/lib/progress";
import { assessGuarantee, type Eligibility } from "@/lib/guarantee/eligibility";

/**
 * Everything an admin needs to verify one student, gathered once.
 *
 * There is deliberately a single function behind this. The student history
 * page and the guarantee claim review both need the same picture — what was
 * bought, for how much, what access it granted, how much study is done and
 * how the mocks went — and two implementations of that would drift until one
 * of them was quietly wrong about a refund.
 *
 * Two rules the rest of the file exists to keep:
 *
 *   Money comes from the order, never from the product. An order records the
 *   currency and the amount charged at the moment it was placed; the current
 *   price is a different number and is nobody's business here. Nothing in
 *   this file reads ProductPrice.
 *
 *   Eligibility comes from `assessGuarantee`, the same function the student
 *   flow and the claim submission use. This adds no condition of its own and
 *   no opinion — it reports what the policy says.
 */

export type StudentOrderRow = {
  id: string;
  reference: string;
  productTitle: string;
  placedAt: Date;
  /** What was actually charged, from the order. */
  amountMinor: number;
  currency: "NZD" | "INR";
  listAmountMinor: number | null;
  discountMinor: number;
  couponCode: string | null;
  status: string;
  paymentStatus: string | null;
};

export type StudentEntitlementRow = {
  id: string;
  scope: string;
  what: string;
  source: string;
  status: string;
  grantedAt: Date;
  expiresAt: Date | null;
  orderReference: string | null;
  note: string | null;
};

export type StudentProgressRow = {
  courseId: string;
  courseTitle: string;
  percent: number;
  completed: number;
  total: number;
  remaining: number;
  lastActivity: Date | null;
};

export type StudentAttemptRow = {
  id: string;
  examTitle: string;
  subjectTitle: string | null;
  isFreeTrial: boolean;
  startedAt: Date;
  submittedAt: Date | null;
  status: string;
  scorePercent: number;
  correct: number;
  total: number;
  passed: boolean | null;
  passingPercent: number | null;
};

export type StudentHistory = {
  student: {
    id: string;
    name: string;
    email: string;
    status: string;
    role: string;
    createdAt: Date;
    emailVerifiedAt: Date | null;
  };
  orders: StudentOrderRow[];
  entitlements: StudentEntitlementRow[];
  progress: StudentProgressRow[];
  attempts: StudentAttemptRow[];
  totals: {
    paidOrders: number;
    mockAttempts: number;
    mocksPassed: number;
    freeTrialUsed: boolean;
  };
  /** The policy's own assessment. Null when no policy applies to them. */
  guarantee: Eligibility;
};

/** One student, everything about them an admin may need. Admin-only callers. */
export async function studentHistory(
  userId: string,
  /**
   * Assess the guarantee against this purchase rather than the newest one.
   * The claim review passes the order the claim was filed against, so the
   * eligibility panel and the claim below it are talking about the same
   * purchase.
   */
  guaranteeOrderId?: string,
): Promise<StudentHistory | null> {
  const student = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      status: true,
      role: true,
      createdAt: true,
      emailVerifiedAt: true,
    },
  });
  if (!student) return null;

  const [orderRows, entitlementRows, attemptRows, freeTrial] = await Promise.all([
    db.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        reference: true,
        currency: true,
        amountMinor: true,
        listAmountMinor: true,
        discountMinor: true,
        couponCode: true,
        status: true,
        createdAt: true,
        product: { select: { title: true } },
        payments: { orderBy: { createdAt: "desc" }, take: 1, select: { status: true } },
      },
    }),
    db.entitlement.findMany({
      where: { userId },
      orderBy: { grantedAt: "desc" },
      select: {
        id: true,
        scopeKey: true,
        source: true,
        status: true,
        grantedAt: true,
        expiresAt: true,
        note: true,
        course: { select: { title: true } },
        subject: { select: { title: true, course: { select: { title: true } } } },
        product: { select: { title: true } },
        order: { select: { reference: true } },
      },
    }),
    db.mockAttempt.findMany({
      where: { userId },
      orderBy: { startedAt: "desc" },
      select: {
        id: true,
        examTitle: true,
        subjectTitle: true,
        startedAt: true,
        submittedAt: true,
        status: true,
        scorePercent: true,
        correctCount: true,
        totalQuestions: true,
        passed: true,
        mockExam: { select: { isFreeTrial: true, passingPercent: true } },
      },
    }),
    db.freeTrialUse.findUnique({ where: { userId }, select: { id: true } }),
  ]);

  /* --------------------------------------------------------------- money */
  // Straight off the order. A price change today must not move a figure a
  // refund will be computed from.
  const orders: StudentOrderRow[] = orderRows.map((o) => ({
    id: o.id,
    reference: o.reference,
    productTitle: o.product.title,
    placedAt: o.createdAt,
    amountMinor: o.amountMinor,
    currency: o.currency,
    listAmountMinor: o.listAmountMinor,
    discountMinor: o.discountMinor,
    couponCode: o.couponCode,
    status: o.status,
    paymentStatus: o.payments[0]?.status ?? null,
  }));

  /* ---------------------------------------------------------- what access */
  const entitlements: StudentEntitlementRow[] = entitlementRows.map((e) => ({
    id: e.id,
    scope: e.scopeKey.startsWith("course:") ? "Course" : "Subject",
    what: e.course
      ? e.course.title
      : e.subject
        ? `${e.subject.course.title} · ${e.subject.title}`
        : (e.product?.title ?? e.scopeKey),
    source: e.source,
    status: e.status,
    grantedAt: e.grantedAt,
    expiresAt: e.expiresAt,
    orderReference: e.order?.reference ?? null,
    note: e.note,
  }));

  /* ------------------------------------------------------------ progress */
  // Only the courses they can actually reach, so the page does not report
  // 0% against material nobody sold them.
  const courseIds = new Set<string>();
  for (const e of entitlementRows) {
    if (e.status !== "ACTIVE") continue;
    const id = e.scopeKey.startsWith("course:") ? e.scopeKey.slice(7) : null;
    if (id) courseIds.add(id);
  }
  const subjectScoped = await db.entitlement.findMany({
    where: { userId, status: "ACTIVE", subjectId: { not: null } },
    select: { subject: { select: { courseId: true } } },
  });
  for (const s of subjectScoped) if (s.subject) courseIds.add(s.subject.courseId);

  const courses = await db.course.findMany({
    where: { id: { in: [...courseIds] } },
    orderBy: { order: "asc" },
    select: { id: true, title: true },
  });

  const progress: StudentProgressRow[] = [];
  for (const c of courses) {
    const stat = await courseProgress(userId, c.id);
    // The most recent thing they finished in this course, whichever kind of
    // record it came from — lessons for rebuilt subjects, chapters for the
    // rest — so "last activity" is not blank for half the catalogue.
    const [lastLesson, lastChapter] = await Promise.all([
      db.lessonProgress.findFirst({
        where: { userId, completedAt: { not: null }, lesson: { module: { subject: { courseId: c.id } } } },
        orderBy: { completedAt: "desc" },
        select: { completedAt: true },
      }),
      db.chapterProgress.findFirst({
        where: { userId, completedAt: { not: null }, chapter: { subject: { courseId: c.id } } },
        orderBy: { completedAt: "desc" },
        select: { completedAt: true },
      }),
    ]);
    const dates = [lastLesson?.completedAt, lastChapter?.completedAt].filter(
      (d): d is Date => Boolean(d),
    );
    progress.push({
      courseId: c.id,
      courseTitle: c.title,
      percent: stat.percent,
      completed: stat.completed,
      total: stat.total,
      remaining: Math.max(0, stat.total - stat.completed),
      lastActivity: dates.length ? new Date(Math.max(...dates.map((d) => d.getTime()))) : null,
    });
  }

  /* --------------------------------------------------------------- mocks */
  const attempts: StudentAttemptRow[] = attemptRows.map((a) => ({
    id: a.id,
    examTitle: a.examTitle,
    subjectTitle: a.subjectTitle,
    isFreeTrial: a.mockExam.isFreeTrial,
    startedAt: a.startedAt,
    submittedAt: a.submittedAt,
    status: a.status,
    scorePercent: a.scorePercent,
    correct: a.correctCount,
    total: a.totalQuestions,
    passed: a.passed,
    passingPercent: a.mockExam.passingPercent,
  }));

  return {
    student,
    orders,
    entitlements,
    progress,
    attempts,
    totals: {
      paidOrders: orders.filter((o) => o.status === "PAID").length,
      mockAttempts: attempts.filter((a) => a.status !== "IN_PROGRESS").length,
      mocksPassed: attempts.filter((a) => a.passed === true).length,
      freeTrialUsed: Boolean(freeTrial),
    },
    // The policy's own answer, not a second opinion formed here.
    guarantee: await assessGuarantee(userId, guaranteeOrderId),
  };
}

/** One row of the student list. */
export type StudentListRow = Awaited<ReturnType<typeof listStudents>>["rows"][number];

const STUDENT_ROW = {
  id: true,
  name: true,
  email: true,
  status: true,
  createdAt: true,
  emailVerifiedAt: true,
  _count: { select: { orders: true, entitlements: true, mockAttempts: true } },
} as const;

/**
 * The student list, optionally narrowed by a search.
 *
 * With no query this is the list: the page shows who is on the system
 * without being asked twice. With a query it is the same list filtered, on
 * part of a name or part of an email, ignoring case.
 *
 * The filtering is done by the database, not by shipping every student to
 * the browser and hiding rows: there is no upper bound on how many students
 * there will be, and downloading all of them to find one is both slow and a
 * needless disclosure. Paging exists for the same reason — the default view
 * is a page of students, not all of them.
 */
export async function listStudents({
  query = "",
  take = 50,
  skip = 0,
}: { query?: string; take?: number; skip?: number } = {}) {
  const q = query.trim();
  const where = {
    role: "STUDENT" as const,
    ...(q.length > 0
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" as const } },
            { email: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [rows, total] = await Promise.all([
    db.user.findMany({
      where,
      orderBy: [{ createdAt: "desc" }],
      take,
      skip,
      select: STUDENT_ROW,
    }),
    db.user.count({ where }),
  ]);

  return { rows, total, skip, take, query: q };
}

/**
 * Finds students by name or email.
 *
 * Kept as the narrow form of `listStudents` for callers that only ever want
 * matches — it returns nothing for a query too short to be meaningful.
 */
export async function searchStudents(query: string, take = 25) {
  const q = query.trim();
  if (q.length < 2) return [];
  const { rows } = await listStudents({ query: q, take });
  return rows;
}
