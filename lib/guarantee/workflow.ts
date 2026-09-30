import "server-only";

import type { ClaimStatus, Prisma } from "@prisma/client";

import { db } from "@/lib/db";

/**
 * Claim state machine (§9).
 *
 * Transitions are declared, not inferred. Anything not listed is refused, so
 * REFUNDED can never go back to APPROVED however the request is crafted.
 * Every accepted transition writes an audit row (§13, §32).
 */

export const TRANSITIONS: Record<ClaimStatus, ClaimStatus[]> = {
  DRAFT: ["SUBMITTED"],
  SUBMITTED: ["UNDER_REVIEW", "NEEDS_INFORMATION", "REJECTED"],
  NEEDS_INFORMATION: ["SUBMITTED", "UNDER_REVIEW", "REJECTED"],
  UNDER_REVIEW: ["APPROVED", "REJECTED", "NEEDS_INFORMATION"],
  APPROVED: ["REFUND_PROCESSING", "CLOSED"],
  REFUND_PROCESSING: ["REFUNDED", "APPROVED"],
  REFUNDED: ["CLOSED"],
  REJECTED: ["CLOSED", "UNDER_REVIEW"],
  CLOSED: [],
};

export class ClaimError extends Error {
  constructor(
    message: string,
    readonly code: "NOT_FOUND" | "FORBIDDEN" | "INVALID_TRANSITION" | "INVALID_STATE",
  ) {
    super(message);
  }
}

export function canTransition(from: ClaimStatus, to: ClaimStatus): boolean {
  return TRANSITIONS[from]?.includes(to) ?? false;
}

/** Statuses a student is allowed to see described plainly. */
export const STUDENT_LABELS: Record<ClaimStatus, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Claim submitted",
  NEEDS_INFORMATION: "More information needed",
  UNDER_REVIEW: "Under review",
  APPROVED: "Approved",
  REJECTED: "Not approved",
  REFUND_PROCESSING: "Refund processing",
  REFUNDED: "Refunded",
  CLOSED: "Closed",
};

export async function recordAudit(
  claimId: string,
  entry: {
    actorId?: string | null;
    action: string;
    fromStatus?: ClaimStatus | null;
    toStatus?: ClaimStatus | null;
    note?: string | null;
  },
  tx: Prisma.TransactionClient = db,
) {
  await tx.claimAuditLog.create({
    data: {
      claimId,
      actorId: entry.actorId ?? null,
      action: entry.action,
      fromStatus: entry.fromStatus ?? null,
      toStatus: entry.toStatus ?? null,
      note: entry.note ?? null,
    },
  });
}

/**
 * Moves a claim to a new status, refusing anything the state machine does not
 * allow, and writing the audit row in the same transaction as the change so
 * the two can never disagree.
 */
export async function transitionClaim(args: {
  claimId: string;
  to: ClaimStatus;
  actorId: string;
  note?: string | null;
  /** Extra columns to set alongside the status. */
  data?: Prisma.GuaranteeClaimUpdateInput;
}) {
  const { claimId, to, actorId, note, data } = args;

  return db.$transaction(async (tx) => {
    const claim = await tx.guaranteeClaim.findUnique({ where: { id: claimId } });
    if (!claim) throw new ClaimError("Claim not found.", "NOT_FOUND");

    if (claim.status === to) return claim;

    if (!canTransition(claim.status, to)) {
      throw new ClaimError(
        `A claim cannot move from ${claim.status} to ${to}.`,
        "INVALID_TRANSITION",
      );
    }

    const stamps: Prisma.GuaranteeClaimUpdateInput = {};
    if (to === "SUBMITTED") stamps.submittedAt = new Date();
    if (to === "UNDER_REVIEW") {
      stamps.reviewedAt = new Date();
      stamps.reviewedBy = { connect: { id: actorId } };
    }
    if (to === "APPROVED") stamps.approvedAt = new Date();
    if (to === "REJECTED") stamps.rejectedAt = new Date();

    const updated = await tx.guaranteeClaim.update({
      where: { id: claimId },
      data: { status: to, ...stamps, ...data },
    });

    await recordAudit(
      claimId,
      { actorId, action: `status:${to}`, fromStatus: claim.status, toStatus: to, note },
      tx,
    );

    return updated;
  });
}
