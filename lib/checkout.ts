import "server-only";

import crypto from "node:crypto";
import type { User } from "@prisma/client";

import { db } from "./db";
import { alreadyOwnsProduct } from "./entitlements";
import { evaluateCoupon } from "./coupons";
import { createGatewayOrder, gatewayName, publishableKey } from "./payments/gateway";

/**
 * Order creation, in one place.
 *
 * Two callers reach checkout — the JSON endpoint the buy button posts to, and
 * the `/checkout/start` page someone lands on after logging in. Both must
 * apply exactly the same rules, so the rules live here rather than in either
 * of them. A gap between the two would be a way to buy on terms the other
 * path refuses.
 *
 * What this function does NOT do is decide whether the caller is allowed to
 * buy at all. Authentication, account state and email verification are settled
 * before it is called — by `verifiedUserOrProblem` in the API route and by the
 * redirects in the start page — so that a refusal happens before any product
 * is looked up and long before the gateway is contacted.
 */

export type CheckoutSuccess = {
  ok: true;
  orderId: string;
  reference: string;
  gatewayOrderId: string;
  amountMinor: number;
  listAmountMinor: number;
  discountMinor: number;
  couponCode: string | null;
  couponId: string | null;
  currency: "NZD" | "INR";
  keyId: string;
  gateway: string;
  productTitle: string;
};

export type CheckoutFailure = {
  ok: false;
  status: number;
  error: string;
  alreadyOwned?: boolean;
  couponRejected?: boolean;
};

export type CheckoutResult = CheckoutSuccess | CheckoutFailure;

function reference() {
  return `KPP-${Date.now().toString(36).toUpperCase()}-${crypto
    .randomBytes(3)
    .toString("hex")
    .toUpperCase()}`;
}

export async function startCheckout(args: {
  user: Pick<User, "id">;
  productId: string;
  currency: "NZD" | "INR";
  couponCode?: string;
}): Promise<CheckoutResult> {
  const { user, productId, currency, couponCode } = args;

  const product = await db.product.findUnique({
    where: { id: productId },
    include: { prices: true, items: true },
  });

  if (!product || product.status !== "PUBLISHED") {
    return { ok: false, status: 404, error: "That product is not available." };
  }
  if (product.items.length === 0) {
    return {
      ok: false,
      status: 409,
      error: "That product does not grant access to anything yet.",
    };
  }

  // Server-side price lookup. The currency must be one this product is
  // actually priced in — displaying INR does not imply it can be charged.
  const price = product.prices.find((p) => p.currency === currency);
  if (!price) {
    return { ok: false, status: 409, error: `This product is not priced in ${currency}.` };
  }

  if (await alreadyOwnsProduct(user.id, product.id)) {
    return {
      ok: false,
      status: 409,
      error: "You already have access to this content.",
      alreadyOwned: true,
    };
  }

  /* ------------------------------------------------------------- coupon */

  const listMinor = price.amountMinor;
  let amountMinor = listMinor;
  let discountMinor = 0;
  let appliedCode: string | null = null;
  let couponId: string | null = null;

  if (couponCode) {
    const check = await evaluateCoupon({
      code: couponCode,
      productId: product.id,
      currency,
      listMinor,
      userId: user.id,
    });
    if (!check.ok) {
      // Stop rather than quietly charging full price: someone who typed a code
      // expects it to count, and no order or gateway call happens on a reject.
      return { ok: false, status: 400, error: check.reason, couponRejected: true };
    }
    amountMinor = check.finalMinor;
    discountMinor = check.discountMinor;
    appliedCode = check.code;
    couponId = check.couponId;
  }

  // A gateway cannot charge nothing. A 100% coupon is a business decision the
  // admin can make, so it is honoured by granting access without a payment.
  if (amountMinor <= 0) {
    return {
      ok: false,
      status: 409,
      error: "That code covers the full price. Please contact us so we can activate your access.",
    };
  }

  /* -------------------------------------------------------------- order */

  // Reuse an existing pending order for the same product, currency and price,
  // so opening checkout twice cannot fork into two gateway orders.
  const existing = await db.order.findFirst({
    where: {
      userId: user.id,
      productId: product.id,
      currency,
      status: "PENDING",
      gatewayOrderId: { not: null },
      amountMinor,
    },
    orderBy: { createdAt: "desc" },
  });

  if (existing?.gatewayOrderId) {
    return {
      ok: true,
      orderId: existing.id,
      reference: existing.reference,
      gatewayOrderId: existing.gatewayOrderId,
      amountMinor: existing.amountMinor,
      listAmountMinor: existing.listAmountMinor ?? existing.amountMinor,
      discountMinor: existing.discountMinor,
      couponCode: existing.couponCode,
      couponId,
      currency: existing.currency as "NZD" | "INR",
      keyId: publishableKey(),
      gateway: gatewayName(),
      productTitle: product.title,
    };
  }

  const order = await db.order.create({
    data: {
      reference: reference(),
      userId: user.id,
      productId: product.id,
      currency,
      amountMinor,
      listAmountMinor: listMinor,
      discountMinor,
      couponCode: appliedCode,
      status: "PENDING",
    },
  });

  try {
    const gatewayOrder = await createGatewayOrder({
      amountMinor,
      currency,
      reference: order.reference,
    });

    await db.$transaction([
      db.order.update({
        where: { id: order.id },
        data: { gatewayOrderId: gatewayOrder.gatewayOrderId },
      }),
      db.payment.create({
        data: {
          orderId: order.id,
          gatewayOrderId: gatewayOrder.gatewayOrderId,
          status: "CREATED",
          amountMinor,
          currency,
        },
      }),
    ]);

    return {
      ok: true,
      orderId: order.id,
      reference: order.reference,
      gatewayOrderId: gatewayOrder.gatewayOrderId,
      amountMinor,
      listAmountMinor: listMinor,
      discountMinor,
      couponCode: appliedCode,
      couponId,
      currency: gatewayOrder.currency as "NZD" | "INR",
      keyId: gatewayOrder.keyId,
      gateway: gatewayName(),
      productTitle: product.title,
    };
  } catch (error) {
    await db.order.update({ where: { id: order.id }, data: { status: "FAILED" } });
    // Logged server-side only — the gateway's message may carry account detail.
    console.error(
      "[checkout] create-order failed:",
      error instanceof Error ? error.message : "unknown error",
    );
    return { ok: false, status: 502, error: "Could not start checkout." };
  }
}
