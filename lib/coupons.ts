import "server-only";

import type { Currency, DiscountType, Prisma } from "@prisma/client";

import { db } from "./db";

/**
 * Discount coupons.
 *
 * The rule that matters: a coupon code arriving from the browser is a *claim*.
 * Everything about it — whether it exists, whether it applies to this product,
 * whether it is still live, and how much it takes off — is resolved here from
 * the database. The client never sends, and is never trusted for, an amount.
 */

export type CouponCheck =
  | { ok: true; couponId: string; code: string; discountMinor: number; finalMinor: number; label: string }
  | { ok: false; reason: string };

/** Normalises user input so entry is forgiving but storage is consistent. */
export function normaliseCode(input: string): string {
  return input.trim().toUpperCase().replace(/\s+/g, "");
}

/**
 * The discount arithmetic, kept separate from the database so it can be
 * exercised directly.
 *
 * A percentage rounds to the nearest minor unit. A discount may take a price
 * down to zero but never below it: an order is never allowed to become a
 * credit, however the coupon was configured.
 */
export function computeDiscount(
  type: DiscountType,
  value: number,
  listMinor: number,
): number {
  if (listMinor <= 0) return 0;
  const raw = type === "PERCENT" ? Math.round((listMinor * value) / 100) : value;
  return Math.max(0, Math.min(raw, listMinor));
}

/**
 * Prices a coupon against one product and amount.
 *
 * `listMinor` must come from ProductPrice, never from the request.
 */
export async function evaluateCoupon(args: {
  code: string;
  productId: string;
  currency: Currency;
  listMinor: number;
  userId: string;
}): Promise<CouponCheck> {
  const code = normaliseCode(args.code);
  if (!code) return { ok: false, reason: "Enter a code to apply." };

  const coupon = await db.coupon.findUnique({ where: { code } });
  if (!coupon) return { ok: false, reason: "That code is not recognised." };
  if (!coupon.active) return { ok: false, reason: "That code is no longer active." };

  const now = new Date();
  if (coupon.startsAt && coupon.startsAt > now) {
    return { ok: false, reason: "That code is not active yet." };
  }
  if (coupon.expiresAt && coupon.expiresAt <= now) {
    return { ok: false, reason: "That code has expired." };
  }
  if (coupon.maxRedemptions !== null && coupon.redemptions >= coupon.maxRedemptions) {
    return { ok: false, reason: "That code has reached its usage limit." };
  }
  if (coupon.productId && coupon.productId !== args.productId) {
    return { ok: false, reason: "That code does not apply to this product." };
  }
  if (coupon.currency && coupon.currency !== args.currency) {
    return { ok: false, reason: `That code can only be used in ${coupon.currency}.` };
  }
  if (coupon.minAmountMinor !== null && args.listMinor < coupon.minAmountMinor) {
    return { ok: false, reason: "This purchase is below the minimum for that code." };
  }

  // One redemption per person, so a single-use code cannot be recycled.
  const alreadyUsed = await db.couponRedemption.findFirst({
    where: { couponId: coupon.id, userId: args.userId },
    select: { id: true },
  });
  if (alreadyUsed) return { ok: false, reason: "You have already used that code." };

  const discountMinor = computeDiscount(coupon.type, coupon.value, args.listMinor);

  return {
    ok: true,
    couponId: coupon.id,
    code: coupon.code,
    discountMinor,
    finalMinor: args.listMinor - discountMinor,
    label:
      coupon.type === "PERCENT"
        ? `${coupon.value}% off`
        : `${(coupon.value / 100).toFixed(2)} off`,
  };
}

/**
 * Records a redemption against a paid order.
 *
 * Both uniqueness constraints do the real work: one redemption row per order,
 * and the counter increments in the same transaction, so a replayed webhook or
 * a double-submitted checkout cannot count a coupon twice.
 */
export async function redeemCoupon(
  args: { couponId: string; userId: string; orderId: string; amountMinor: number },
  tx: Prisma.TransactionClient = db,
) {
  const existing = await tx.couponRedemption.findUnique({
    where: { orderId: args.orderId },
    select: { id: true },
  });
  if (existing) return false;

  await tx.couponRedemption.create({
    data: {
      couponId: args.couponId,
      userId: args.userId,
      orderId: args.orderId,
      amountMinor: args.amountMinor,
    },
  });
  await tx.coupon.update({
    where: { id: args.couponId },
    data: { redemptions: { increment: 1 } },
  });
  return true;
}
