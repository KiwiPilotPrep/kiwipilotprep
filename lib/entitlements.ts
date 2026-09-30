import "server-only";

import type { Prisma, Role } from "@prisma/client";

import { db } from "./db";

/**
 * Entitlement-based access (§15/§16).
 *
 * Access is never "user.paid === true". A student holds granular entitlement
 * rows, each scoped to one course or one subject, and every read is checked
 * against them on the server.
 *
 * `scopeKey` is the canonical identity of a grant. Making (userId, scopeKey)
 * unique in the database is what makes granting idempotent: a replayed webhook
 * hits the constraint instead of creating a second row.
 */

export const courseScope = (courseId: string) => `course:${courseId}`;
export const subjectScope = (subjectId: string) => `subject:${subjectId}`;

export type Actor = { id: string; role: Role };

/** Entitlements that are ACTIVE and not past their expiry. */
function liveWhere(userId: string): Prisma.EntitlementWhereInput {
  return {
    userId,
    status: "ACTIVE",
    OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
  };
}

/**
 * Can this actor read this subject?
 *
 * True when they hold the subject directly, or hold the course it belongs to.
 * A course entitlement covers subjects added later, which is what keeps
 * package products working when an admin extends the syllabus (§7).
 */
export async function canAccessSubject(actor: Actor, subjectId: string): Promise<boolean> {
  if (actor.role === "ADMIN") return true;

  const subject = await db.subject.findUnique({
    where: { id: subjectId },
    select: { courseId: true },
  });
  if (!subject) return false;

  const held = await db.entitlement.findFirst({
    where: {
      ...liveWhere(actor.id),
      scopeKey: { in: [subjectScope(subjectId), courseScope(subject.courseId)] },
    },
    select: { id: true },
  });
  return held !== null;
}

/**
 * Can this actor read this course?
 *
 * A whole-course entitlement qualifies, and so does holding any subject inside
 * it — someone who bought a single subject still needs the course page to
 * reach it, where the subjects they do not own show as locked.
 */
export async function canAccessCourse(actor: Actor, courseId: string): Promise<boolean> {
  if (actor.role === "ADMIN") return true;

  const held = await db.entitlement.findFirst({
    where: {
      ...liveWhere(actor.id),
      OR: [{ scopeKey: courseScope(courseId) }, { subject: { courseId } }],
    },
    select: { id: true },
  });
  return held !== null;
}

/** Course ids the actor may open at all. */
export async function accessibleCourseIds(actor: Actor): Promise<string[]> {
  if (actor.role === "ADMIN") {
    const all = await db.course.findMany({ select: { id: true } });
    return all.map((c) => c.id);
  }

  const rows = await db.entitlement.findMany({
    where: liveWhere(actor.id),
    select: { courseId: true, subject: { select: { courseId: true } } },
  });

  const ids = new Set<string>();
  for (const row of rows) {
    if (row.courseId) ids.add(row.courseId);
    if (row.subject?.courseId) ids.add(row.subject.courseId);
  }
  return [...ids];
}

/** Subject ids inside one course that the actor may open. */
export async function accessibleSubjectIds(
  actor: Actor,
  courseId: string,
): Promise<Set<string> | "all"> {
  if (actor.role === "ADMIN") return "all";

  const wholeCourse = await db.entitlement.findFirst({
    where: { ...liveWhere(actor.id), scopeKey: courseScope(courseId) },
    select: { id: true },
  });
  if (wholeCourse) return "all";

  const rows = await db.entitlement.findMany({
    where: { ...liveWhere(actor.id), subject: { courseId } },
    select: { subjectId: true },
  });
  return new Set(rows.map((r) => r.subjectId!).filter(Boolean));
}

/** Everything the actor currently holds, for the profile and admin views. */
export async function listEntitlements(userId: string) {
  return db.entitlement.findMany({
    where: { userId },
    orderBy: { grantedAt: "desc" },
    include: {
      course: { select: { title: true, slug: true } },
      subject: { select: { title: true, slug: true, course: { select: { title: true } } } },
      product: { select: { title: true } },
      order: { select: { reference: true } },
    },
  });
}

export type GrantInput = {
  userId: string;
  productId?: string | null;
  orderId?: string | null;
  source: "PURCHASE" | "ADMIN" | "TRIAL" | "SEED";
  expiresAt?: Date | null;
  note?: string | null;
};

/**
 * Grants everything a product includes, inside one transaction.
 *
 * Idempotent by construction: each row is an upsert on (userId, scopeKey), so
 * a duplicate webhook, a double-clicked button and a retried network call all
 * converge on the same set of entitlements (§31).
 */
export async function grantProductEntitlements(
  productId: string,
  input: GrantInput,
  tx: Prisma.TransactionClient = db,
): Promise<number> {
  const items = await tx.productItem.findMany({
    where: { productId },
    select: { courseId: true, subjectId: true },
  });

  let granted = 0;
  for (const item of items) {
    const scopeKey = item.courseId
      ? courseScope(item.courseId)
      : item.subjectId
        ? subjectScope(item.subjectId)
        : null;
    if (!scopeKey) continue;

    await tx.entitlement.upsert({
      where: { userId_scopeKey: { userId: input.userId, scopeKey } },
      create: {
        userId: input.userId,
        scopeKey,
        courseId: item.courseId,
        subjectId: item.subjectId,
        productId: input.productId ?? productId,
        orderId: input.orderId ?? null,
        source: input.source,
        status: "ACTIVE",
        expiresAt: input.expiresAt ?? null,
        note: input.note ?? null,
      },
      // Re-purchasing or re-granting extends access rather than duplicating it.
      update: {
        status: "ACTIVE",
        expiresAt: input.expiresAt ?? null,
        orderId: input.orderId ?? undefined,
        productId: input.productId ?? productId,
      },
    });
    granted++;
  }

  return granted;
}

/** True when the student already holds everything a product would grant (§24). */
export async function alreadyOwnsProduct(userId: string, productId: string): Promise<boolean> {
  const items = await db.productItem.findMany({
    where: { productId },
    select: { courseId: true, subjectId: true },
  });
  if (items.length === 0) return false;

  const scopeKeys = items
    .map((i) =>
      i.courseId ? courseScope(i.courseId) : i.subjectId ? subjectScope(i.subjectId) : null,
    )
    .filter((k): k is string => k !== null);

  const held = await db.entitlement.count({
    where: { ...liveWhere(userId), scopeKey: { in: scopeKeys } },
  });
  return held >= scopeKeys.length;
}

/** Computes the expiry for a purchase, or null for lifetime access. */
export function expiryFor(accessMonths: number | null | undefined): Date | null {
  if (accessMonths === null || accessMonths === undefined) return null;
  const at = new Date();
  at.setMonth(at.getMonth() + accessMonths);
  return at;
}
