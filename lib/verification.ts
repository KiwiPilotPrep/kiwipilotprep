import "server-only";

import crypto from "node:crypto";

import { db } from "./db";
import { sendEmail } from "./email/send";
import { emailBaseUrl } from "./site-url";
import { renderEmail, renderText } from "./email/templates";

/**
 * Email verification.
 *
 * The design rule: the raw token exists in exactly one place — the message
 * that was sent — and only its hash is stored. Someone who reads the database
 * cannot verify an account they do not control the inbox for, which is the
 * whole point of asking.
 *
 * A token is single-use and expires. Issuing a new one replaces the old, so a
 * "resend" silently invalidates the earlier link rather than leaving a trail
 * of working ones.
 */

/** Long enough that guessing is not a strategy. */
const TOKEN_BYTES = 32;
const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

/** How often a person may ask for another email. */
export const RESEND_COOLDOWN_MS = 60_000;

export function hashToken(raw: string): string {
  // SHA-256 rather than bcrypt: the token is already 256 bits of entropy, so
  // there is nothing for a slow hash to protect against. What matters is that
  // the stored value cannot be replayed as the link.
  return crypto.createHash("sha256").update(raw).digest("hex");
}

/**
 * Issues a fresh token for a user and returns the raw value for the email.
 * Never store or log the return value.
 */
export async function issueVerificationToken(userId: string): Promise<string> {
  const raw = crypto.randomBytes(TOKEN_BYTES).toString("base64url");

  await db.user.update({
    where: { id: userId },
    data: {
      verifyTokenHash: hashToken(raw),
      verifyTokenExpiresAt: new Date(Date.now() + TOKEN_TTL_MS),
      verifySentAt: new Date(),
    },
  });

  return raw;
}

export type ConsumeResult =
  | { ok: true; userId: string; alreadyVerified: boolean }
  | { ok: false; reason: "invalid" | "expired" };

/**
 * Redeems a token from a verification link.
 *
 * An unknown token and an expired one are reported differently on purpose:
 * "expired" is a normal thing that happens to real people a day later, and
 * telling them so lets the page offer a resend instead of a dead end. Neither
 * message reveals whether an account exists.
 */
export async function consumeVerificationToken(raw: string): Promise<ConsumeResult> {
  if (!raw) return { ok: false, reason: "invalid" };

  const user = await db.user.findUnique({
    where: { verifyTokenHash: hashToken(raw) },
    select: { id: true, verifyTokenExpiresAt: true, emailVerifiedAt: true },
  });

  if (!user) return { ok: false, reason: "invalid" };

  if (!user.verifyTokenExpiresAt || user.verifyTokenExpiresAt <= new Date()) {
    return { ok: false, reason: "expired" };
  }

  await db.user.update({
    where: { id: user.id },
    data: {
      emailVerifiedAt: user.emailVerifiedAt ?? new Date(),
      // Single use: clearing the hash makes a replayed link a plain "invalid".
      verifyTokenHash: null,
      verifyTokenExpiresAt: null,
    },
  });

  return { ok: true, userId: user.id, alreadyVerified: Boolean(user.emailVerifiedAt) };
}

/**
 * Issues a token and sends the link.
 *
 * Reports what actually happened rather than assuming success: if the provider
 * rejects the message we say so, so the page can offer a retry instead of
 * telling someone to check an inbox nothing was sent to (§19).
 */
export async function sendVerificationEmail(user: {
  id: string;
  name: string;
  email: string;
}): Promise<{ delivered: boolean; logged: boolean }> {
  const token = await issueVerificationToken(user.id);
  const link = `${await emailBaseUrl()}/verify/${token}`;
  const firstName = user.name.trim().split(/\s+/)[0] || "there";

  const content = {
    heading: "Verify your email address",
    paragraphs: [
      `Kia ora ${firstName},`,
      "Welcome to KiwiPilotPrep. Confirm this address to unlock your free practice questions and to buy a course.",
    ],
    action: { label: "Verify My Email", url: link },
    fallbackNote: "If the button doesn't work, copy this link into your browser:",
    footnotes: [
      "This link can only be used once and expires 24 hours after it was sent. If it has expired, sign in and ask for a new one.",
      "Security note: if you did not create a KiwiPilotPrep account, you can safely ignore this email. Nothing happens until the link above is opened, and we will never ask you for your password by email.",
    ],
  };

  const result = await sendEmail({
    to: user.email,
    subject: "Verify your KiwiPilotPrep account",
    template: "email-verification",
    sensitive: true,
    userId: user.id,
    body: renderText(content),
    html: renderEmail(content),
  });

  return { delivered: result.status === "SENT", logged: result.status === "LOGGED" };
}

/** True when the person may ask for another email yet. */
export function canResend(verifySentAt: Date | null): boolean {
  if (!verifySentAt) return true;
  return Date.now() - verifySentAt.getTime() >= RESEND_COOLDOWN_MS;
}

/**
 * Clears token fields that have already expired (§27).
 *
 * There is nothing here that can grow without bound: a token lives on the user
 * row, so each account holds at most one verification and one reset token, and
 * issuing a new one overwrites the last. No table accumulates rows and no
 * background job is needed.
 *
 * What this does is tidy away the inert remains — an expired hash is already
 * refused by every check, but there is no reason to keep it. Called
 * opportunistically from low-traffic pages rather than on a timer.
 */
export async function sweepExpiredAuthTokens(): Promise<number> {
  const now = new Date();

  const [verify, reset] = await Promise.all([
    db.user.updateMany({
      where: { verifyTokenExpiresAt: { lt: now } },
      data: { verifyTokenHash: null, verifyTokenExpiresAt: null },
    }),
    db.user.updateMany({
      where: { resetTokenExpiresAt: { lt: now } },
      data: { resetTokenHash: null, resetTokenExpiresAt: null },
    }),
  ]);

  return verify.count + reset.count;
}
