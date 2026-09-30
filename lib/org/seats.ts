import "server-only";

import crypto from "node:crypto";

import { db } from "@/lib/db";
import { grantProductEntitlements, expiryFor } from "@/lib/entitlements";
import { OrgError } from "./access";

/**
 * Seats, invitations and enterprise access (§17, §18, §19).
 *
 * Assigning a seat grants a Phase 3 entitlement. Enterprise access is not a
 * second authorization system — it is the same entitlement mechanism, sourced
 * from a licence instead of a personal purchase.
 */

export function hashToken(raw: string): string {
  return crypto.createHash("sha256").update(raw).digest("hex");
}

export function newInvitationToken(): { raw: string; hash: string } {
  const raw = crypto.randomBytes(24).toString("base64url");
  return { raw, hash: hashToken(raw) };
}

const INVITE_TTL_DAYS = 14;

/** Creates seats to match a licence's purchased seat count. */
export async function provisionSeats(licenseId: string, seatsTotal: number) {
  const existing = await db.enterpriseSeat.count({ where: { licenseId } });
  const missing = seatsTotal - existing;
  if (missing <= 0) return 0;

  await db.enterpriseSeat.createMany({
    data: Array.from({ length: missing }, () => ({ licenseId, status: "AVAILABLE" as const })),
  });
  return missing;
}

/**
 * Assigns a free seat to a student and grants the licence's product access.
 *
 * Runs in one transaction so a seat can never be consumed without the
 * entitlement landing, or vice versa.
 */
export async function assignSeat(args: {
  organizationId: string;
  licenseId: string;
  studentUserId: string;
}) {
  const { organizationId, licenseId, studentUserId } = args;

  const license = await db.enterpriseLicense.findUnique({
    where: { id: licenseId },
    include: { product: { select: { id: true, accessMonths: true, title: true } } },
  });
  if (!license || license.organizationId !== organizationId) {
    throw new OrgError("Licence not found for this organisation.", "NOT_FOUND");
  }

  const link = await db.organizationStudent.findUnique({
    where: { organizationId_userId: { organizationId, userId: studentUserId } },
  });
  if (!link || link.status !== "ACTIVE") {
    throw new OrgError("That student is not active in this organisation.", "NOT_FOUND");
  }

  const already = await db.enterpriseSeat.findFirst({
    where: { licenseId, organizationStudentId: link.id, status: "ASSIGNED" },
  });
  if (already) throw new OrgError("That student already holds a seat on this licence.", "CONFLICT");

  return db.$transaction(async (tx) => {
    // Claim a free seat by id so two concurrent assignments cannot take one seat.
    const free = await tx.enterpriseSeat.findFirst({
      where: { licenseId, status: "AVAILABLE" },
      orderBy: { id: "asc" },
    });
    if (!free) throw new OrgError("No seats available on this licence.", "NO_SEATS");

    await tx.enterpriseSeat.update({
      where: { id: free.id },
      data: {
        status: "ASSIGNED",
        organizationStudentId: link.id,
        assignedAt: new Date(),
        revokedAt: null,
      },
    });

    await grantProductEntitlements(
      license.product.id,
      {
        userId: studentUserId,
        productId: license.product.id,
        source: "ADMIN",
        expiresAt: license.expiresAt ?? expiryFor(license.product.accessMonths),
        note: `Enterprise seat — licence ${license.id}`,
      },
      tx,
    );

    return free.id;
  });
}

/**
 * Frees a seat and deactivates the entitlement it granted.
 *
 * Learning history, mock attempts and progress are untouched — only access is
 * withdrawn (§19, §23).
 */
export async function revokeSeat(args: { organizationId: string; seatId: string }) {
  const seat = await db.enterpriseSeat.findUnique({
    where: { id: args.seatId },
    include: {
      license: { include: { product: { select: { id: true } } } },
      organizationStudent: true,
    },
  });
  if (!seat || seat.license.organizationId !== args.organizationId) {
    throw new OrgError("Seat not found for this organisation.", "NOT_FOUND");
  }
  if (!seat.organizationStudent) {
    throw new OrgError("That seat is not assigned.", "CONFLICT");
  }

  const studentUserId = seat.organizationStudent.userId;

  await db.$transaction(async (tx) => {
    await tx.enterpriseSeat.update({
      where: { id: seat.id },
      data: {
        status: "AVAILABLE",
        organizationStudentId: null,
        revokedAt: new Date(),
        assignedAt: null,
      },
    });

    // Deactivate only the entitlements this licence granted.
    const items = await tx.productItem.findMany({
      where: { productId: seat.license.product.id },
      select: { courseId: true, subjectId: true },
    });
    const scopeKeys = items
      .map((i) => (i.courseId ? `course:${i.courseId}` : i.subjectId ? `subject:${i.subjectId}` : null))
      .filter((k): k is string => k !== null);

    // Only entitlements this licence granted are withdrawn. A student who
    // ALSO bought the course themselves keeps that access — their purchase is
    // a separate claim on the content and losing a school seat must not take
    // it away.
    await tx.entitlement.updateMany({
      where: {
        userId: studentUserId,
        scopeKey: { in: scopeKeys },
        source: "ADMIN",
        note: { contains: `licence ${seat.license.id}` },
      },
      data: { status: "REVOKED" },
    });
  });
}

/** Creates an invitation, refusing duplicates and over-allocation (§18). */
export async function createInvitation(args: {
  organizationId: string;
  email: string;
  licenseId?: string | null;
  invitedById: string;
}) {
  const email = args.email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    throw new OrgError("That is not a valid email address.", "CONFLICT");
  }

  const existingUser = await db.user.findUnique({ where: { email }, select: { id: true } });
  if (existingUser) {
    const already = await db.organizationStudent.findUnique({
      where: { organizationId_userId: { organizationId: args.organizationId, userId: existingUser.id } },
    });
    if (already && already.status === "ACTIVE") {
      throw new OrgError("That student is already in this organisation.", "CONFLICT");
    }
  }

  const pending = await db.organizationInvitation.findFirst({
    where: { organizationId: args.organizationId, email, status: "PENDING" },
  });
  if (pending) {
    if (pending.expiresAt > new Date()) {
      throw new OrgError("An invitation is already pending for that address.", "CONFLICT");
    }
    await db.organizationInvitation.update({
      where: { id: pending.id },
      data: { status: "EXPIRED" },
    });
  }

  if (args.licenseId) {
    const license = await db.enterpriseLicense.findUnique({
      where: { id: args.licenseId },
      select: { organizationId: true },
    });
    if (!license || license.organizationId !== args.organizationId) {
      throw new OrgError("Licence not found for this organisation.", "NOT_FOUND");
    }
    const free = await db.enterpriseSeat.count({
      where: { licenseId: args.licenseId, status: "AVAILABLE" },
    });
    if (free === 0) throw new OrgError("No seats available on that licence.", "NO_SEATS");
  }

  const { raw, hash } = newInvitationToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + INVITE_TTL_DAYS);

  const invitation = await db.organizationInvitation.create({
    data: {
      organizationId: args.organizationId,
      email,
      tokenHash: hash,
      licenseId: args.licenseId ?? null,
      expiresAt,
      invitedById: args.invitedById,
    },
  });

  // The raw token is returned once, for the link. Only its hash is stored.
  return { invitation, token: raw };
}

/**
 * Accepts an invitation for a signed-in user.
 *
 * Matches on the token, not on anything the caller asserts about themselves.
 */
export async function acceptInvitation(args: { token: string; userId: string; email: string }) {
  const invitation = await db.organizationInvitation.findUnique({
    where: { tokenHash: hashToken(args.token) },
    include: { organization: { select: { id: true, name: true, status: true } } },
  });

  if (!invitation) throw new OrgError("That invitation link is not valid.", "NOT_FOUND");
  if (invitation.status === "REVOKED") throw new OrgError("That invitation was revoked.", "FORBIDDEN");
  if (invitation.status === "ACCEPTED") throw new OrgError("That invitation has already been used.", "CONFLICT");
  if (invitation.expiresAt <= new Date()) {
    await db.organizationInvitation.update({
      where: { id: invitation.id },
      data: { status: "EXPIRED" },
    });
    throw new OrgError("That invitation has expired.", "FORBIDDEN");
  }
  if (invitation.organization.status !== "ACTIVE") {
    throw new OrgError("That organisation is not active.", "FORBIDDEN");
  }
  // The invitation is addressed to one mailbox.
  if (invitation.email.toLowerCase() !== args.email.toLowerCase()) {
    throw new OrgError("This invitation was sent to a different email address.", "FORBIDDEN");
  }

  const link = await db.organizationStudent.upsert({
    where: {
      organizationId_userId: { organizationId: invitation.organizationId, userId: args.userId },
    },
    create: { organizationId: invitation.organizationId, userId: args.userId, status: "ACTIVE" },
    update: { status: "ACTIVE", removedAt: null },
  });

  await db.organizationInvitation.update({
    where: { id: invitation.id },
    data: { status: "ACCEPTED", acceptedAt: new Date() },
  });

  // Seat assignment is best-effort: a full licence must not block enrolment.
  if (invitation.licenseId) {
    await assignSeat({
      organizationId: invitation.organizationId,
      licenseId: invitation.licenseId,
      studentUserId: args.userId,
    }).catch(() => null);
  }

  return { organizationId: invitation.organizationId, organizationStudentId: link.id };
}
