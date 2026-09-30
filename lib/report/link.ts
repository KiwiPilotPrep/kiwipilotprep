import "server-only";

import { SignJWT, jwtVerify } from "jose";

/**
 * The signed link that opens one report straight from an email.
 *
 * A link in an email is followed in whatever browser the student happens to be
 * reading mail in, and usually without a session cookie. The report route is
 * otherwise session-authenticated, so an emailed link to it would answer 404
 * for the very person it was sent to.
 *
 * So the email carries a token instead. It is signed with the same secret as
 * the session, and it says one thing only: this person may read this one
 * report. It cannot be used to list attempts, to open a different attempt, or
 * to act as a session — it is checked by the report route and nowhere else.
 *
 * The token is a bearer credential, so:
 *
 *   - it is scoped to a single attempt and a single user, both of which are
 *     re-checked against the database when it is used;
 *   - it expires, because a mailbox is not a safe place to keep a credential
 *     indefinitely;
 *   - it appears only in a link the student was sent, and the route that
 *     accepts it never caches or logs the URL.
 *
 * Thirty days is the window. A student who opens their mail three weeks late
 * still gets their report; a link that leaks a year from now is inert.
 */

const AUDIENCE = "kpp:report";
const TTL_SECONDS = 60 * 60 * 24 * 30;

function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value || value.length < 32) {
    throw new Error("AUTH_SECRET is missing or shorter than 32 characters.");
  }
  return new TextEncoder().encode(value);
}

/** A token that authorises reading one attempt's report. */
export async function signReportToken(attemptId: string, userId: string): Promise<string> {
  return new SignJWT({ sub: userId, att: attemptId })
    .setProtectedHeader({ alg: "HS256" })
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${TTL_SECONDS}s`)
    .sign(secret());
}

/**
 * The user a token authorises for this attempt, or null.
 *
 * Null for anything wrong at all: expired, tampered with, signed for a
 * different purpose, or issued for a different attempt than the one being
 * opened. The caller still has to confirm the attempt belongs to that user —
 * this says who is asking, not what they may have.
 */
export async function readReportToken(token: string, attemptId: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, secret(), { audience: AUDIENCE });
    if (payload.att !== attemptId) return null;
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}

/** The absolute link that opens this report, for use in an email. */
export async function reportLink(baseUrl: string, attemptId: string, userId: string): Promise<string> {
  const token = await signReportToken(attemptId, userId);
  return `${baseUrl.replace(/\/+$/, "")}/mocks/attempts/${attemptId}/report.pdf?t=${encodeURIComponent(token)}`;
}
