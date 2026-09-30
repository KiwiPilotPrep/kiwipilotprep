import "server-only";

import type { RefundMethod } from "@prisma/client";

import { db } from "@/lib/db";
import { gatewayName } from "@/lib/payments/gateway";
import { recordAudit, ClaimError } from "./workflow";

/**
 * Refunds (§10, §11, §12).
 *
 * Built on the Phase 3 Order/Payment records rather than a second financial
 * architecture. The amount is always derived from the captured payment — a
 * client-supplied figure is never used, and a refund can never exceed what was
 * actually taken.
 */

export type RefundBasis = {
  orderId: string;
  orderReference: string;
  amountMinor: number;
  currency: "NZD" | "INR";
  alreadyRefundedMinor: number;
  refundableMinor: number;
  gatewayPaymentId: string | null;
};

/** Works out what may be refunded against one order. */
export async function refundBasis(orderId: string): Promise<RefundBasis> {
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: {
      payments: { where: { status: "CAPTURED" }, orderBy: { createdAt: "desc" } },
      refunds: true,
    },
  });
  if (!order) throw new ClaimError("Order not found.", "NOT_FOUND");
  if (order.status !== "PAID") {
    throw new ClaimError("That order was never paid, so it cannot be refunded.", "INVALID_STATE");
  }

  const captured = order.payments[0] ?? null;

  // Only refunds that actually moved money count against the ceiling.
  const alreadyRefundedMinor = order.refunds
    .filter((r) => r.status === "APPROVED" || r.status === "REFUNDED")
    .reduce((sum, r) => sum + r.amountMinor, 0);

  return {
    orderId: order.id,
    orderReference: order.reference,
    amountMinor: order.amountMinor,
    currency: order.currency,
    alreadyRefundedMinor,
    refundableMinor: Math.max(0, order.amountMinor - alreadyRefundedMinor),
    gatewayPaymentId: captured?.gatewayPaymentId ?? null,
  };
}

/**
 * Opens a refund for an approved claim.
 *
 * The amount comes from `refundBasis`, so "100% refund" means the amount that
 * order was actually charged — never an unrelated purchase, and never a number
 * from the request (§12, §30).
 */
export async function createRefundForClaim(args: {
  claimId: string;
  actorId: string;
  method: RefundMethod;
  notes?: string | null;
}) {
  const claim = await db.guaranteeClaim.findUnique({
    where: { id: args.claimId },
    include: { refunds: true },
  });
  if (!claim) throw new ClaimError("Claim not found.", "NOT_FOUND");

  if (claim.status !== "APPROVED" && claim.status !== "REFUND_PROCESSING") {
    throw new ClaimError(
      "A refund can only be raised on an approved claim.",
      "INVALID_STATE",
    );
  }

  const live = claim.refunds.find(
    (r) => r.status !== "REJECTED" && r.status !== "REQUESTED",
  );
  if (live) throw new ClaimError("A refund already exists for this claim.", "INVALID_STATE");

  const basis = await refundBasis(claim.orderId);
  if (basis.refundableMinor <= 0) {
    throw new ClaimError("This order has already been fully refunded.", "INVALID_STATE");
  }

  const refund = await db.refund.create({
    data: {
      orderId: claim.orderId,
      claimId: claim.id,
      status: "APPROVED",
      method: args.method,
      amountMinor: basis.refundableMinor,
      currency: basis.currency,
      reason: "Pass guarantee claim",
      initiatedAt: new Date(),
      processedById: args.actorId,
      notes: args.notes ?? null,
    },
  });

  await recordAudit(claim.id, {
    actorId: args.actorId,
    action: `refund:opened:${args.method}`,
    note: `${basis.refundableMinor} ${basis.currency} against order ${basis.orderReference}`,
  });

  return { refund, basis };
}

/**
 * Sends the refund to Razorpay.
 *
 * Only meaningful when the original payment went through the gateway; a
 * sandbox or bank-transfer refund is recorded without an API call.
 */
export async function initiateGatewayRefund(refundId: string, actorId: string) {
  const refund = await db.refund.findUnique({
    where: { id: refundId },
    include: { order: { include: { payments: { where: { status: "CAPTURED" } } } } },
  });
  if (!refund) throw new ClaimError("Refund not found.", "NOT_FOUND");
  if (refund.method !== "RAZORPAY") {
    throw new ClaimError("That refund is not a gateway refund.", "INVALID_STATE");
  }
  if (refund.gatewayRefundId) {
    // Already sent — idempotent, as a retried click must not double-refund.
    return refund;
  }

  const paymentId = refund.order.payments[0]?.gatewayPaymentId;
  if (!paymentId) {
    throw new ClaimError("The original payment has no gateway reference.", "INVALID_STATE");
  }

  if (gatewayName() !== "razorpay") {
    // Sandbox: record a reference so the workflow is exercisable, clearly marked.
    const updated = await db.refund.update({
      where: { id: refund.id },
      data: {
        gatewayRefundId: `rfnd_sbx_${refund.id.slice(-12)}`,
        status: "APPROVED",
        notes: [refund.notes, "Sandbox gateway — no money moved."].filter(Boolean).join(" "),
      },
    });
    if (refund.claimId) {
      await recordAudit(refund.claimId, {
        actorId,
        action: "refund:gateway:sandbox",
        note: "Sandbox gateway; no live refund issued.",
      });
    }
    return updated;
  }

  const keyId = process.env.RAZORPAY_KEY_ID!;
  const keySecret = process.env.RAZORPAY_KEY_SECRET!;

  const res = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}/refund`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
    },
    body: JSON.stringify({
      amount: refund.amountMinor,
      speed: "normal",
      notes: { claimId: refund.claimId ?? "", refundId: refund.id },
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    await db.refund.update({
      where: { id: refund.id },
      data: { notes: `Gateway refund failed: ${res.status}` },
    });
    if (refund.claimId) {
      await recordAudit(refund.claimId, {
        actorId,
        action: "refund:gateway:failed",
        note: `${res.status}`,
      });
    }
    throw new ClaimError(`Razorpay refund failed (${res.status}): ${detail}`, "INVALID_STATE");
  }

  const body = (await res.json()) as { id: string };
  const updated = await db.refund.update({
    where: { id: refund.id },
    data: { gatewayRefundId: body.id, status: "APPROVED" },
  });

  if (refund.claimId) {
    await recordAudit(refund.claimId, {
      actorId,
      action: "refund:gateway:initiated",
      note: body.id,
    });
  }
  return updated;
}

/** Marks a refund settled — the bank transfer landed, or the gateway confirmed. */
export async function markRefundComplete(args: {
  refundId: string;
  actorId: string;
  reference?: string | null;
  notes?: string | null;
}) {
  const refund = await db.refund.findUnique({ where: { id: args.refundId } });
  if (!refund) throw new ClaimError("Refund not found.", "NOT_FOUND");
  if (refund.status === "REFUNDED") return refund;

  const updated = await db.refund.update({
    where: { id: refund.id },
    data: {
      status: "REFUNDED",
      processedAt: new Date(),
      processedById: args.actorId,
      reference: args.reference ?? refund.reference,
      notes: args.notes ?? refund.notes,
    },
  });

  if (refund.claimId) {
    await recordAudit(refund.claimId, {
      actorId: args.actorId,
      action: "refund:completed",
      note: args.reference ?? null,
    });
  }
  return updated;
}
