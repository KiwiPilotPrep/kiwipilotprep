import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import type { Role, User } from "@prisma/client";

import { db } from "./db";

const COOKIE = "kpp_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value || value.length < 32) {
    throw new Error("AUTH_SECRET is missing or shorter than 32 characters.");
  }
  return new TextEncoder().encode(value);
}

export function hashPassword(plain: string) {
  return bcrypt.hash(plain, 12);
}

export function verifyPassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash);
}

/** Issues the session cookie. httpOnly so client JS can never read it. */
export async function createSession(userId: string) {
  const token = await new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(secret());

  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function destroySession() {
  (await cookies()).delete(COOKIE);
}

/**
 * Resolves the signed-in user, or null.
 *
 * The role is deliberately re-read from the database rather than trusted from
 * the token: if an admin demotes someone, that must take effect immediately
 * instead of when their week-old cookie happens to expire.
 *
 * Wrapped in React's `cache` so that re-reading is once per request rather
 * than once per caller. A layout and the page inside it both ask who is signed
 * in, which was two JWT verifications and two identical SELECTs on every
 * signed-in page — cheap against a database on the same machine, and a pair of
 * network round trips against a hosted one.
 *
 * This is per-request memoisation, not a cache with a lifetime: the next
 * request reads the database again, so the demotion above still takes effect
 * immediately. Nothing in the app mutates the user and then re-reads it within
 * one request, which is the only pattern this would change.
 */
export const getCurrentUser = cache(async function getCurrentUser(): Promise<User | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secret());
    const id = payload.sub;
    if (typeof id !== "string") return null;

    const user = await db.user.findUnique({ where: { id } });
    if (!user) return null;

    // "Sign out everywhere", expressed without a session table: a token issued
    // before the cutoff is refused. Changing a password moves the cutoff, so a
    // stolen session dies the moment the real owner resets.
    if (user.sessionsValidFrom) {
      const issuedAt = typeof payload.iat === "number" ? payload.iat * 1000 : 0;
      if (issuedAt < user.sessionsValidFrom.getTime()) return null;
    }

    // A disabled account is not a signed-in account.
    if (user.status === "DISABLED") return null;

    return user;
  } catch {
    // expired, tampered with, or signed by a different secret
    return null;
  }
});

/** Server-side gate for any student page or action. */
export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/** Server-side gate for admin-only pages and mutations (§25). */
export async function requireRole(role: Role): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== role) redirect("/dashboard?denied=1");
  return user;
}

export async function requireAdmin() {
  return requireRole("ADMIN");
}

/**
 * The gate for anything that spends money or hands over paid material (§7).
 *
 * Every condition the business rule names is checked here, server-side, in one
 * place: the account exists, it is active, and its address has been confirmed.
 * Callers that can redirect use this; API routes use `verifiedUserOrProblem`
 * below so they can answer with a status code instead.
 *
 * A disabled account never reaches the verification branch, because
 * `getCurrentUser` already refuses it — so a disabled user with a confirmed
 * address is still refused, which is the point of keeping the two separate.
 */
export async function requireVerifiedEmail(next?: string): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    redirect(next ? `/login?next=${encodeURIComponent(next)}` : "/login");
  }
  if (!user.emailVerifiedAt) {
    redirect(next ? `/verify/sent?next=${encodeURIComponent(next)}` : "/verify/sent");
  }
  return user;
}

export type AuthProblem = {
  status: number;
  error: string;
  needsLogin?: boolean;
  needsVerification?: boolean;
};

/**
 * The same rule for JSON endpoints.
 *
 * Returns either the user or the problem to send back, so a route can refuse
 * before it does any work — no product lookup, no gateway call, no order row.
 */
export async function verifiedUserOrProblem(): Promise<
  { user: User; problem: null } | { user: null; problem: AuthProblem }
> {
  const user = await getCurrentUser();

  if (!user) {
    return {
      user: null,
      problem: { status: 401, error: "You must be signed in to check out.", needsLogin: true },
    };
  }

  if (!user.emailVerifiedAt) {
    return {
      user: null,
      problem: {
        status: 403,
        error: "Please confirm your email address before buying. Check your inbox for the link.",
        needsVerification: true,
      },
    };
  }

  return { user, problem: null };
}
