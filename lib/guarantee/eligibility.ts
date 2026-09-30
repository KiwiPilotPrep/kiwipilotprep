import "server-only";

import type { AttemptStatus, ClaimStatus } from "@prisma/client";

import { db } from "@/lib/db";
import { courseProgress } from "@/lib/progress";

/**
 * Guarantee eligibility (§2).
 *
 * Everything is computed here, on the server, from real records. The student
 * UI only renders what this returns — it never decides eligibility itself, and
 * a claim submission re-runs this rather than trusting the page that produced
 * the button.
 *
 * Every threshold comes from the active GuaranteePolicy. No condition is
 * invented in code.
 */

export type Requirement = {
  label: string;
  met: boolean;
  detail: string;
};

export type Eligibility = {
  /** No active policy, or no qualifying purchase. */
  applicable: boolean;
  policyId: string | null;
  policyVersion: string | null;
  policyTerms: string | null;
  orderId: string | null;
  orderReference: string | null;
  productTitle: string | null;
  studyPercent: number;
  requiredStudyPercent: number;
  mocksCompleted: number;
  requiredMockCount: number;
  requirements: Requirement[];
  eligible: boolean;
  /** Why they cannot claim right now, in words a student can act on. */
  blockers: string[];
  existingClaim: { id: string; reference: string; status: ClaimStatus } | null;
};

const NOT_APPLICABLE: Eligibility = {
  applicable: false,
  policyId: null,
  policyVersion: null,
  policyTerms: null,
  orderId: null,
  orderReference: null,
  productTitle: null,
  studyPercent: 0,
  requiredStudyPercent: 0,
  mocksCompleted: 0,
  requiredMockCount: 0,
  requirements: [],
  eligible: false,
  blockers: [],
  existingClaim: null,
};

/** The policy currently in force, if any. */
export async function activePolicy() {
  return db.guaranteePolicy.findFirst({
    where: { active: true },
    orderBy: { createdAt: "desc" },
    include: { products: { select: { productId: true } } },
  });
}

/**
 * Assesses one student against the active policy.
 *
 * Picks the most recent paid order for a qualifying product. If the student has
 * several, the newest is assessed — a claim is made against one purchase (§12).
 *
 * `orderId` narrows that to one purchase. A claim is filed against a specific
 * order, and an admin reviewing it must see the assessment for *that* order
 * rather than for whichever one happens to be newest. It changes which
 * purchase is looked at and nothing else: the policy, the thresholds and the
 * verdict are the same code either way.
 */
export async function assessGuarantee(
  userId: string,
  orderId?: string,
): Promise<Eligibility> {
  const policy = await activePolicy();
  if (!policy || policy.products.length === 0) return NOT_APPLICABLE;

  const qualifyingProductIds = policy.products.map((p) => p.productId);

  const order = await db.order.findFirst({
    where: {
      userId,
      status: "PAID",
      productId: { in: qualifyingProductIds },
      ...(orderId ? { id: orderId } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      product: {
        select: {
          title: true,
          items: { select: { courseId: true, subjectId: true } },
        },
      },
    },
  });
  if (!order) return { ...NOT_APPLICABLE, policyId: policy.id, policyVersion: policy.version };

  const existingClaim = await db.guaranteeClaim.findUnique({
    where: { userId_orderId: { userId, orderId: order.id } },
    select: { id: true, reference: true, status: true },
  });

  /* ---------------------------------------------------------- study work */

  const courseIds = order.product.items
    .map((i) => i.courseId)
    .filter((id): id is string => id !== null);

  // A subject-only product still implies its course for progress purposes.
  if (courseIds.length === 0) {
    const subjectIds = order.product.items
      .map((i) => i.subjectId)
      .filter((id): id is string => id !== null);
    const subjects = await db.subject.findMany({
      where: { id: { in: subjectIds } },
      select: { courseId: true },
    });
    courseIds.push(...subjects.map((s) => s.courseId));
  }

  const progresses = await Promise.all(
    [...new Set(courseIds)].map((id) => courseProgress(userId, id)),
  );
  const totalChapters = progresses.reduce((n, p) => n + p.total, 0);
  const doneChapters = progresses.reduce((n, p) => n + p.completed, 0);
  const studyPercent =
    totalChapters === 0 ? 0 : Math.round((doneChapters / totalChapters) * 100);

  /* ---------------------------------------------------------- mock work */

  const mockWhere = {
    userId,
    status: { in: ["SUBMITTED", "EXPIRED"] as AttemptStatus[] },
    mockExam: {
      OR: [
        { courseId: { in: [...new Set(courseIds)] } },
        { subject: { courseId: { in: [...new Set(courseIds)] } } },
      ],
    },
    ...(policy.requiredMockPassPercent !== null
      ? { scorePercent: { gte: policy.requiredMockPassPercent } }
      : {}),
  };

  // Distinct exams, so re-sitting the same mock does not inflate the count.
  const attempts = await db.mockAttempt.findMany({
    where: mockWhere,
    select: { mockExamId: true },
    distinct: ["mockExamId"],
  });
  const mocksCompleted = attempts.length;

  /* --------------------------------------------------------- assessment */

  const blockers: string[] = [];
  const requirements: Requirement[] = [];

  const studyMet = studyPercent >= policy.requiredStudyPercent;
  requirements.push({
    label: "Study modules",
    met: studyMet,
    detail: `${studyPercent}% complete (${policy.requiredStudyPercent}% required)`,
  });
  if (!studyMet) {
    blockers.push(
      `Study completion is ${studyPercent}%. The guarantee requires ${policy.requiredStudyPercent}%.`,
    );
  }

  const mocksMet = mocksCompleted >= policy.requiredMockCount;
  requirements.push({
    label: "Mock exams",
    met: mocksMet,
    detail:
      policy.requiredMockPassPercent !== null
        ? `${mocksCompleted} of ${policy.requiredMockCount} passed at ${policy.requiredMockPassPercent}%+`
        : `${mocksCompleted} of ${policy.requiredMockCount} completed`,
  });
  if (!mocksMet) {
    blockers.push(
      `You have completed ${mocksCompleted} of the ${policy.requiredMockCount} required mock exam(s).`,
    );
  }

  // Claim window, when the policy sets one.
  let windowMet = true;
  if (policy.claimWindowDays !== null) {
    const deadline = new Date(order.createdAt);
    deadline.setDate(deadline.getDate() + policy.claimWindowDays);
    windowMet = new Date() <= deadline;
    requirements.push({
      label: "Claim window",
      met: windowMet,
      detail: windowMet
        ? `Open until ${deadline.toLocaleDateString("en-NZ")}`
        : `Closed on ${deadline.toLocaleDateString("en-NZ")}`,
    });
    if (!windowMet) {
      blockers.push(
        `The claim window for this purchase closed on ${deadline.toLocaleDateString("en-NZ")}.`,
      );
    }
  }

  if (existingClaim && existingClaim.status !== "DRAFT") {
    blockers.push(`You already have a claim (${existingClaim.reference}) for this purchase.`);
  }

  return {
    applicable: true,
    policyId: policy.id,
    policyVersion: policy.version,
    policyTerms: policy.terms,
    orderId: order.id,
    orderReference: order.reference,
    productTitle: order.product.title,
    studyPercent,
    requiredStudyPercent: policy.requiredStudyPercent,
    mocksCompleted,
    requiredMockCount: policy.requiredMockCount,
    requirements,
    eligible: studyMet && mocksMet && windowMet && !existingClaim,
    blockers,
    existingClaim,
  };
}
