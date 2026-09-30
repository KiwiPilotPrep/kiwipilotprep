"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { normaliseCode } from "@/lib/coupons";

/** Admin-generated discount codes (phase 6). */

function fail(message: string): never {
  throw new Error(message);
}

/** Blank string, "" or undefined all mean "no limit" rather than zero. */
function optionalInt(raw: string | undefined, label: string, max: number): number | null {
  if (!raw || raw.trim() === "") return null;
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 1 || n > max) fail(`${label} must be between 1 and ${max}.`);
  return n;
}

function optionalDate(raw: string | undefined): Date | null {
  if (!raw || raw.trim() === "") return null;
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) fail("Enter a valid date.");
  return d;
}

const schema = z.object({
  code: z.string().trim().min(3, "A code needs at least 3 characters.").max(40),
  description: z.string().trim().max(300).optional(),
  type: z.enum(["PERCENT", "FIXED"]),
  value: z.string().trim().min(1, "Enter a discount value."),
  currency: z.string().trim().optional(),
  productId: z.string().trim().optional(),
  minAmount: z.string().trim().optional(),
  maxRedemptions: z.string().trim().optional(),
  startsAt: z.string().trim().optional(),
  expiresAt: z.string().trim().optional(),
});

export async function createCoupon(formData: FormData) {
  await requireAdmin();
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) fail(parsed.error.issues[0].message);
  const d = parsed.data;

  const code = normaliseCode(d.code);
  if (!/^[A-Z0-9._-]+$/.test(code)) {
    fail("Codes may use letters, digits, dots, dashes and underscores only.");
  }
  if (await db.coupon.findUnique({ where: { code }, select: { id: true } })) {
    fail(`The code ${code} already exists.`);
  }

  // A percentage is a whole number of percent; a fixed amount is entered in
  // major units and stored in minor, the same convention as prices.
  const rawValue = Number(d.value);
  if (!Number.isFinite(rawValue) || rawValue <= 0) fail("The discount must be greater than zero.");
  let value: number;
  if (d.type === "PERCENT") {
    if (!Number.isInteger(rawValue) || rawValue > 100) fail("A percentage must be 1–100.");
    value = rawValue;
  } else {
    value = Math.round(rawValue * 100);
  }

  const currency = d.currency === "NZD" || d.currency === "INR" ? d.currency : null;
  // A fixed amount only means something in a stated currency.
  if (d.type === "FIXED" && !currency) {
    fail("A fixed-amount code must be tied to a currency.");
  }

  const minAmountRaw = d.minAmount?.trim();
  const minAmountMinor =
    minAmountRaw && minAmountRaw !== "" ? Math.round(Number(minAmountRaw) * 100) : null;
  if (minAmountMinor !== null && (!Number.isFinite(minAmountMinor) || minAmountMinor < 0)) {
    fail("The minimum order value must be a positive number.");
  }

  const startsAt = optionalDate(d.startsAt);
  const expiresAt = optionalDate(d.expiresAt);
  if (startsAt && expiresAt && expiresAt <= startsAt) {
    fail("The end date must be after the start date.");
  }

  await db.coupon.create({
    data: {
      code,
      description: d.description || null,
      type: d.type,
      value,
      currency,
      productId: d.productId && d.productId !== "" ? d.productId : null,
      minAmountMinor,
      maxRedemptions: optionalInt(d.maxRedemptions, "The redemption limit", 1_000_000),
      startsAt,
      expiresAt,
      active: true,
    },
  });

  revalidatePath("/admin/coupons");
}

export async function setCouponActive(id: string, active: boolean) {
  await requireAdmin();
  await db.coupon.update({ where: { id }, data: { active } });
  revalidatePath("/admin/coupons");
}

/**
 * Deletes a code that has never been used. A redeemed coupon is deactivated
 * instead — its redemptions are part of the payment record and must survive.
 */
export async function deleteCoupon(id: string) {
  await requireAdmin();
  const coupon = await db.coupon.findUnique({
    where: { id },
    select: { redemptions: true, _count: { select: { redemptionRows: true } } },
  });
  if (!coupon) return;

  if (coupon.redemptions > 0 || coupon._count.redemptionRows > 0) {
    await db.coupon.update({ where: { id }, data: { active: false } });
  } else {
    await db.coupon.delete({ where: { id } });
  }
  revalidatePath("/admin/coupons");
}
