"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import {
  courseScope,
  subjectScope,
  grantProductEntitlements,
  expiryFor,
} from "@/lib/entitlements";

/** Admin product, order and entitlement management (§5, §26, §27). */

function fail(message: string): never {
  throw new Error(message);
}

/*
 * Product creation, deletion and status changes are deliberately absent.
 *
 * The catalogue is developer-controlled: twenty-one products, each wired to
 * the courses and subjects it grants, all of them referenced by orders and
 * entitlements that must keep resolving. An admin console that can add a
 * twenty-second product, or archive one somebody has bought, is a way to
 * break checkout at three in the morning. What an admin genuinely needs to
 * change is the price, and that is what `updateProductPrices` below does.
 */

/**
 * Changes what a product costs, and nothing else.
 *
 * This is the one thing about the catalogue an admin may change. Identity,
 * what the product grants, and whether it is on sale are all fixed in code
 * and in the seed; a price is a commercial decision that should not need a
 * deployment.
 *
 * Historical orders are untouched by design rather than by care: an Order
 * carries its own `currency` and `amountMinor`, captured when it was placed.
 * Nothing recomputes an order from the current price, so a student who paid
 * $699 keeps an order that says $699 however often this runs.
 *
 * Prices are entered in major units and stored in minor units, so no money
 * is ever held in a float.
 */
const priceSchema = z.object({
  priceNZD: z.string().trim(),
  priceINR: z.string().trim(),
});

/** A price as typed, validated into minor units. */
function parsePrice(raw: string, label: string): number {
  const text = raw.trim();
  if (text === "") fail(`${label} is required.`);
  // A digit string with at most two decimal places. Rejects "1e3", "-5",
  // "12.345", "$99", "abc" and the empty string before Number() is asked to
  // have an opinion about any of them.
  if (!/^\d{1,7}(\.\d{1,2})?$/.test(text)) {
    fail(`${label} must be a number with at most two decimal places.`);
  }
  const n = Number(text);
  if (!Number.isFinite(n) || n <= 0) fail(`${label} must be greater than zero.`);
  const minor = Math.round(n * 100);
  if (minor < 1 || minor > 99_999_999) fail(`${label} is out of range.`);
  return minor;
}

export async function updateProductPrices(productId: string, formData: FormData) {
  await requireAdmin();
  const parsed = priceSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) fail(parsed.error.issues[0].message);

  const product = await db.product.findUnique({
    where: { id: productId },
    select: { id: true, status: true },
  });
  if (!product) fail("That product no longer exists.");

  const nzd = parsePrice(parsed.data.priceNZD, "NZD price");
  const inr = parsePrice(parsed.data.priceINR, "INR price");

  // Both currencies in one transaction: a product priced in one currency and
  // not the other is a product the pricing page cannot render.
  await db.$transaction([
    db.productPrice.upsert({
      where: { productId_currency: { productId, currency: "NZD" } },
      create: { productId, currency: "NZD", amountMinor: nzd },
      update: { amountMinor: nzd },
    }),
    db.productPrice.upsert({
      where: { productId_currency: { productId, currency: "INR" } },
      create: { productId, currency: "INR", amountMinor: inr },
      update: { amountMinor: inr },
    }),
  ]);

  // Everywhere the price is read. The public pricing page and the checkout
  // both read ProductPrice directly, so this is a cache concern rather than
  // a data one — but an admin who saves a price and then sees the old one on
  // the public page has no reason to believe the save worked.
  revalidatePath("/admin/products");
  revalidatePath("/pricing");
  revalidatePath("/");
  redirect("/admin/products?saved=" + productId);
}

/* --------------------------------------------------------- entitlements */

/**
 * Manual grant. Recorded with source ADMIN and a note naming who did it, so
 * hand-granted access is never indistinguishable from a purchase (§27).
 */
export async function grantProductAccess(userId: string, productId: string) {
  const admin = await requireAdmin();
  const product = await db.product.findUnique({
    where: { id: productId },
    select: { accessMonths: true },
  });
  if (!product) fail("Product not found.");

  await grantProductEntitlements(productId, {
    userId,
    productId,
    source: "ADMIN",
    expiresAt: expiryFor(product.accessMonths),
    note: `Granted by ${admin.email}`,
  });

  revalidatePath("/admin/students");
  // Student History reads the same entitlements, so it has to be rebuilt too.
  revalidatePath("/admin/history", "layout");
}

export async function revokeEntitlement(entitlementId: string) {
  const admin = await requireAdmin();
  await db.entitlement.update({
    where: { id: entitlementId },
    data: { status: "REVOKED", note: `Revoked by ${admin.email}` },
  });
  revalidatePath("/admin/students");
  // Student History reads the same entitlements, so it has to be rebuilt too.
  revalidatePath("/admin/history", "layout");
}

export async function restoreEntitlement(entitlementId: string) {
  const admin = await requireAdmin();
  await db.entitlement.update({
    where: { id: entitlementId },
    data: { status: "ACTIVE", note: `Restored by ${admin.email}` },
  });
  revalidatePath("/admin/students");
  // Student History reads the same entitlements, so it has to be rebuilt too.
  revalidatePath("/admin/history", "layout");
}

/** Grants a single course directly, without a product. */
export async function grantCourseAccess(userId: string, courseId: string) {
  const admin = await requireAdmin();
  const course = await db.course.findUnique({
    where: { id: courseId },
    select: { accessMonths: true },
  });
  if (!course) fail("Course not found.");

  await db.entitlement.upsert({
    where: { userId_scopeKey: { userId, scopeKey: courseScope(courseId) } },
    create: {
      userId,
      scopeKey: courseScope(courseId),
      courseId,
      source: "ADMIN",
      status: "ACTIVE",
      expiresAt: expiryFor(course.accessMonths),
      note: `Granted by ${admin.email}`,
    },
    update: {
      status: "ACTIVE",
      expiresAt: expiryFor(course.accessMonths),
      note: `Re-granted by ${admin.email}`,
    },
  });

  revalidatePath("/admin/students");
  // Student History reads the same entitlements, so it has to be rebuilt too.
  revalidatePath("/admin/history", "layout");
}

export async function grantSubjectAccess(userId: string, subjectId: string) {
  const admin = await requireAdmin();
  await db.entitlement.upsert({
    where: { userId_scopeKey: { userId, scopeKey: subjectScope(subjectId) } },
    create: {
      userId,
      scopeKey: subjectScope(subjectId),
      subjectId,
      source: "ADMIN",
      status: "ACTIVE",
      note: `Granted by ${admin.email}`,
    },
    update: { status: "ACTIVE", note: `Re-granted by ${admin.email}` },
  });
  revalidatePath("/admin/students");
  // Student History reads the same entitlements, so it has to be rebuilt too.
  revalidatePath("/admin/history", "layout");
}

/* ------------------------------------------------------------ account state */

/**
 * Switches an account on or off (§16).
 *
 * Disabling is not deleting: the person's orders, attempts, progress and any
 * guarantee claim stay exactly where they are, because those are the record of
 * what happened. What changes is that the account stops resolving to a session
 * — `getCurrentUser` refuses a disabled user — so it can neither sign in nor
 * act on a session it already held.
 *
 * Deliberately cannot be used on an administrator. Locking every admin out of
 * the console is a mistake with no in-app way back.
 */
export async function setUserStatus(userId: string, status: "ACTIVE" | "DISABLED") {
  const admin = await requireAdmin();

  if (userId === admin.id) fail("You cannot disable your own account.");

  const target = await db.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  if (!target) fail("That account no longer exists.");
  if (target.role === "ADMIN") fail("Administrator accounts cannot be disabled here.");

  await db.user.update({
    where: { id: userId },
    data:
      status === "DISABLED"
        ? {
            status: "DISABLED",
            disabledAt: new Date(),
            // Ends any session the account is currently holding, rather than
            // waiting for the cookie to expire on its own.
            sessionsValidFrom: new Date(),
          }
        : { status: "ACTIVE", disabledAt: null, disabledNote: null },
  });

  revalidatePath("/admin/students");
  // Student History reads the same entitlements, so it has to be rebuilt too.
  revalidatePath("/admin/history", "layout");
}

/** Confirms an address by hand, for someone whose mail will not arrive. */
export async function markEmailVerified(userId: string) {
  await requireAdmin();

  await db.user.update({
    where: { id: userId },
    data: {
      emailVerifiedAt: new Date(),
      verifyTokenHash: null,
      verifyTokenExpiresAt: null,
    },
  });

  revalidatePath("/admin/students");
  // Student History reads the same entitlements, so it has to be rebuilt too.
  revalidatePath("/admin/history", "layout");
}
