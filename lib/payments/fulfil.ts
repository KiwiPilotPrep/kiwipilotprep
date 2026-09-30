import "server-only";

import type { Prisma } from "@prisma/client";

import { db } from "@/lib/db";
import { grantProductEntitlements, expiryFor } from "@/lib/entitlements";
import { redeemCoupon } from "@/lib/coupons";
import { sendPaymentReceipt } from "./receipt";

/**
 * Marks an order paid and grants its entitlements, atomically (§32).
 *
 * Called from two places that can race: the browser returning from checkout,
 * and Razorpay's webhook — which may itself be delivered more than once. All
 * three writes happen in one transaction, so the system can never come to rest
 * with a captured payment and no access.
 *
 * Idempotency comes from the database, not from remembering: `gatewayPaymentId`
 * is unique, and each entitlement upserts on (userId, scopeKey).
 */
export async function fulfilOrder(args: {
  orderId: string;
  gatewayPaymentId: string;
  gatewayOrderId?: string | null;
  signatureVerified: boolean;
  method?: string | null;
  raw?: Prisma.InputJsonValue;
}): Promise<{ alreadyFulfilled: boolean; granted: number }> {
  // Only what this wrapper itself needs; the rest is passed straight through
  // to the transaction below.
  const { orderId, signatureVerified } = args;

  if (!signatureVerified) {
    throw new Error("Refusing to fulfil an order whose payment signature was not verified.");
  }

  const outcome = await fulfilInTransaction(args);

  // The receipt is sent after the transaction has committed, and never inside
  // it: an unreachable mail provider must not roll back a captured payment.
  // sendPaymentReceipt is itself idempotent, so the browser callback and the
  // webhook cannot produce two emails for one purchase.
  if (!outcome.alreadyFulfilled) {
    await sendPaymentReceipt(orderId).catch((error) => {
      console.error(
        "[payments] receipt email failed:",
        error instanceof Error ? error.message : "unknown error",
      );
      return null;
    });
  }

  return outcome;
}

async function fulfilInTransaction(args: {
  orderId: string;
  gatewayPaymentId: string;
  gatewayOrderId?: string | null;
  method?: string | null;
  raw?: Prisma.InputJsonValue;
}): Promise<{ alreadyFulfilled: boolean; granted: number }> {
  const { orderId, gatewayPaymentId, gatewayOrderId, method, raw } = args;

  return db.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { product: { select: { id: true, accessMonths: true } } },
    });
    if (!order) throw new Error("Order not found.");

    // Already settled — record nothing further and report it as a no-op so a
    // replayed webhook stays harmless.
    const existingPayment = await tx.payment.findUnique({
      where: { gatewayPaymentId },
      select: { id: true, orderId: true },
    });
    if (existingPayment && order.status === "PAID") {
      return { alreadyFulfilled: true, granted: 0 };
    }

    if (existingPayment) {
      await tx.payment.update({
        where: { id: existingPayment.id },
        data: {
          status: "CAPTURED",
          signatureVerified: true,
          method: method ?? undefined,
          raw,
        },
      });
    } else {
      // The CREATED placeholder row from create-order, if it is still bare.
      const placeholder = await tx.payment.findFirst({
        where: { orderId, gatewayPaymentId: null },
        orderBy: { createdAt: "desc" },
        select: { id: true },
      });

      if (placeholder) {
        await tx.payment.update({
          where: { id: placeholder.id },
          data: {
            gatewayPaymentId,
            gatewayOrderId: gatewayOrderId ?? order.gatewayOrderId,
            status: "CAPTURED",
            signatureVerified: true,
            method: method ?? undefined,
            raw,
          },
        });
      } else {
        await tx.payment.create({
          data: {
            orderId,
            gatewayPaymentId,
            gatewayOrderId: gatewayOrderId ?? order.gatewayOrderId,
            status: "CAPTURED",
            signatureVerified: true,
            amountMinor: order.amountMinor,
            currency: order.currency,
            method: method ?? undefined,
            raw,
          },
        });
      }
    }

    await tx.order.update({ where: { id: orderId }, data: { status: "PAID" } });

    // Count the coupon only once the money is confirmed. Inside the same
    // transaction, so a replayed webhook cannot inflate the redemption count.
    if (order.couponCode && order.discountMinor > 0) {
      const coupon = await tx.coupon.findUnique({
        where: { code: order.couponCode },
        select: { id: true },
      });
      if (coupon) {
        await redeemCoupon(
          {
            couponId: coupon.id,
            userId: order.userId,
            orderId: order.id,
            amountMinor: order.discountMinor,
          },
          tx,
        );
      }
    }

    const granted = await grantProductEntitlements(
      order.product.id,
      {
        userId: order.userId,
        productId: order.product.id,
        orderId: order.id,
        source: "PURCHASE",
        expiresAt: expiryFor(order.product.accessMonths),
      },
      tx,
    );

    return { alreadyFulfilled: false, granted };
  });
}

/** Records a failed payment. Deliberately grants nothing (§22). */
export async function failOrder(args: {
  orderId: string;
  gatewayPaymentId?: string | null;
  reason?: string;
  raw?: Prisma.InputJsonValue;
}) {
  const { orderId, gatewayPaymentId, raw } = args;

  await db.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id: orderId } });
    if (!order) return;
    // Never walk back a settled order on a late failure event.
    if (order.status === "PAID") return;

    if (gatewayPaymentId) {
      await tx.payment.upsert({
        where: { gatewayPaymentId },
        create: {
          orderId,
          gatewayPaymentId,
          status: "FAILED",
          amountMinor: order.amountMinor,
          currency: order.currency,
          raw,
        },
        update: { status: "FAILED", raw },
      });
    }

    await tx.order.update({ where: { id: orderId }, data: { status: "FAILED" } });
  });
}
