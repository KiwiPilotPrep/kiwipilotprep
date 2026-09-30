import "server-only";

import crypto from "node:crypto";

import { db } from "./db";
import { sendEmail } from "./email/send";
import { renderEmail, renderText } from "./email/templates";
import { emailBaseUrl } from "./site-url";
import { hashPassword } from "./auth";

/**
 * Password reset.
 *
 * Same shape as email verification, for the same reasons: the raw token exists
 * only in the message, the database keeps a hash, and a token is single-use
 * with an expiry. Because the token lives on the user row rather than in a
 * table, at most one is outstanding per account and expired ones cannot
 * accumulate — there is nothing to sweep (§27).
 *
 * A reset window is deliberately shorter than a verification window. Someone
 * resetting a password is at their keyboard now; a link that still works
 * tomorrow is a link sitting in an inbox that may not be theirs any more.
 */

const TOKEN_BYTES = 32;
const TOKEN_TTL_MS = 60 * 60 * 1000;

/** How often one account may request a reset email. */
export const RESET_COOLDOWN_MS = 60_000;

export function hashResetToken(raw: string): string {
  return crypto.createHash("sha256").update(raw).digest("hex");
}

export function canRequestReset(resetSentAt: Date | null): boolean {
  if (!resetSentAt) return true;
  return Date.now() - resetSentAt.getTime() >= RESET_COOLDOWN_MS;
}

/**
 * Starts a reset for an address, if it belongs to an account.
 *
 * Returns nothing useful on purpose. The caller must show the same message
 * whatever happens here, so the form cannot be used to discover which
 * addresses are registered (§12).
 */
export async function requestPasswordReset(email: string): Promise<void> {
  const user = await db.user.findUnique({
    where: { email: email.trim().toLowerCase() },
    select: {
      id: true,
      name: true,
      email: true,
      status: true,
      resetSentAt: true,
    },
  });

  // No account, or a disabled one. Nothing is sent and nothing is disclosed.
  if (!user || user.status === "DISABLED") return;

  // Per-account cooldown, so the form cannot be used to bombard an inbox that
  // belongs to someone else.
  if (!canRequestReset(user.resetSentAt)) return;

  const raw = crypto.randomBytes(TOKEN_BYTES).toString("base64url");
  await db.user.update({
    where: { id: user.id },
    data: {
      resetTokenHash: hashResetToken(raw),
      resetTokenExpiresAt: new Date(Date.now() + TOKEN_TTL_MS),
      resetSentAt: new Date(),
    },
  });

  const link = `${await emailBaseUrl()}/reset/${raw}`;
  const firstName = user.name.trim().split(/\s+/)[0] || "there";

  const content = {
    heading: "Reset your password",
    paragraphs: [
      `Hi ${firstName},`,
      "Someone asked to reset the password on your KiwiPilotPrep account. Choose a new one using the button below.",
    ],
    action: { label: "Choose a new password", url: link },
    footnotes: [
      "This link works once and expires in one hour.",
      "If you did not ask for this, you can ignore it — your password has not changed, and nobody can change it without opening this link.",
    ],
  };

  await sendEmail({
    to: user.email,
    subject: "Reset your KiwiPilotPrep password",
    template: "password-reset",
    // Carries a single-use link; keep it out of the mail log.
    sensitive: true,
    userId: user.id,
    body: renderText(content),
    html: renderEmail(content),
  });
}

export type ResetLookup =
  | { ok: true; userId: string; name: string; email: string }
  | { ok: false; reason: "invalid" | "expired" };

/** Checks a token without spending it, so the form can be rendered first. */
export async function findResetToken(raw: string): Promise<ResetLookup> {
  if (!raw) return { ok: false, reason: "invalid" };

  const user = await db.user.findUnique({
    where: { resetTokenHash: hashResetToken(raw) },
    select: {
      id: true,
      name: true,
      email: true,
      status: true,
      resetTokenExpiresAt: true,
    },
  });

  if (!user || user.status === "DISABLED") return { ok: false, reason: "invalid" };
  if (!user.resetTokenExpiresAt || user.resetTokenExpiresAt <= new Date()) {
    return { ok: false, reason: "expired" };
  }

  return { ok: true, userId: user.id, name: user.name, email: user.email };
}

/**
 * Sets the new password and retires everything that could still be used to get
 * in with the old one.
 *
 * Three things happen together, in one transaction:
 *   - the password changes,
 *   - the reset token is cleared, so the link cannot be replayed,
 *   - `sessionsValidFrom` moves to now, which invalidates every session issued
 *     before this moment.
 *
 * That last one is the point of resetting a password after a compromise: if an
 * attacker is holding a stolen session cookie, changing the password has to
 * end it. Anything less means the reset was theatre.
 */
export async function completePasswordReset(args: {
  raw: string;
  newPassword: string;
}): Promise<{ ok: boolean; userId?: string }> {
  const lookup = await findResetToken(args.raw);
  if (!lookup.ok) return { ok: false };

  const passwordHash = await hashPassword(args.newPassword);

  await db.user.update({
    where: { id: lookup.userId },
    data: {
      passwordHash,
      resetTokenHash: null,
      resetTokenExpiresAt: null,
      sessionsValidFrom: new Date(),
      // Resetting through a link proves the inbox works, so an address that
      // was never confirmed becomes confirmed here rather than leaving the
      // person to do the same thing twice.
      emailVerifiedAt: new Date(),
      verifyTokenHash: null,
      verifyTokenExpiresAt: null,
    },
  });

  return { ok: true, userId: lookup.userId };
}
