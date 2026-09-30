import "server-only";

import type { OrgRole, User } from "@prisma/client";

import { db } from "@/lib/db";

/**
 * Flight school authorization (§22, §28).
 *
 * Organisation membership is resolved from the session, never from an
 * organizationId in the request. A caller can ask "may I do X here?", but the
 * answer is derived from their own membership row — so an instructor at School
 * A cannot reach School B by changing an id in the URL.
 */

export class OrgError extends Error {
  constructor(
    message: string,
    readonly code: "NOT_FOUND" | "FORBIDDEN" | "NO_SEATS" | "CONFLICT",
  ) {
    super(message);
  }
}

/** Capability sets per role. Platform admins are handled separately. */
const CAPABILITIES: Record<OrgRole, string[]> = {
  OWNER: ["settings", "members", "licenses", "seats", "students", "invitations", "reports"],
  ADMIN: ["students", "invitations", "seats", "reports"],
  INSTRUCTOR: ["students:read", "reports"],
};

export function roleCan(role: OrgRole, capability: string): boolean {
  const caps = CAPABILITIES[role] ?? [];
  if (caps.includes(capability)) return true;
  // "students" implies "students:read".
  if (capability.endsWith(":read") && caps.includes(capability.split(":")[0])) return true;
  return false;
}

export type Membership = {
  organizationId: string;
  organizationName: string;
  role: OrgRole;
  /** True for platform admins viewing an organisation they do not belong to. */
  viaPlatformAdmin: boolean;
};

/** Every active membership this user holds. */
export async function membershipsFor(user: Pick<User, "id">): Promise<Membership[]> {
  const rows = await db.organizationMember.findMany({
    where: { userId: user.id, status: "ACTIVE", organization: { status: "ACTIVE" } },
    include: { organization: { select: { id: true, name: true } } },
    orderBy: { createdAt: "asc" },
  });

  return rows.map((m) => ({
    organizationId: m.organization.id,
    organizationName: m.organization.name,
    role: m.role,
    viaPlatformAdmin: false,
  }));
}

/**
 * Resolves the caller's membership of one organisation, or throws.
 *
 * This is the single gate every organisation page and action passes through.
 */
export async function requireMembership(
  user: Pick<User, "id" | "role">,
  organizationId: string,
  capability?: string,
): Promise<Membership> {
  const org = await db.organization.findUnique({
    where: { id: organizationId },
    select: { id: true, name: true, status: true },
  });
  if (!org) throw new OrgError("Organisation not found.", "NOT_FOUND");

  // Platform admins have oversight (§27) but are marked as such, so the UI can
  // say so rather than implying they are staff of the school.
  if (user.role === "ADMIN") {
    return {
      organizationId: org.id,
      organizationName: org.name,
      role: "OWNER",
      viaPlatformAdmin: true,
    };
  }

  if (org.status !== "ACTIVE") {
    throw new OrgError("This organisation is not active.", "FORBIDDEN");
  }

  const member = await db.organizationMember.findUnique({
    where: { organizationId_userId: { organizationId, userId: user.id } },
  });
  // 404 rather than 403: existence itself is not disclosed to outsiders.
  if (!member || member.status !== "ACTIVE") {
    throw new OrgError("Organisation not found.", "NOT_FOUND");
  }

  if (capability && !roleCan(member.role, capability)) {
    throw new OrgError("Your role does not allow that.", "FORBIDDEN");
  }

  return {
    organizationId: org.id,
    organizationName: org.name,
    role: member.role,
    viaPlatformAdmin: false,
  };
}

/**
 * Confirms a student really belongs to this organisation before any of their
 * academic data is read. Without this, a valid instructor could pull another
 * school's student by id (§28: IDOR).
 */
export async function requireOrgStudent(organizationId: string, studentUserId: string) {
  const link = await db.organizationStudent.findUnique({
    where: { organizationId_userId: { organizationId, userId: studentUserId } },
    include: {
      user: { select: { id: true, name: true, email: true, createdAt: true } },
    },
  });
  if (!link) throw new OrgError("Student not found in this organisation.", "NOT_FOUND");
  return link;
}

/** Seat counts for a licence, derived rather than stored (§17). */
export async function seatSummary(licenseId: string) {
  const [total, assigned, revoked] = await Promise.all([
    db.enterpriseSeat.count({ where: { licenseId } }),
    db.enterpriseSeat.count({ where: { licenseId, status: "ASSIGNED" } }),
    db.enterpriseSeat.count({ where: { licenseId, status: "REVOKED" } }),
  ]);
  return { total, assigned, revoked, available: total - assigned - revoked };
}
