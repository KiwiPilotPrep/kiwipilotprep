import Link from "next/link";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { safeNextPath } from "@/lib/safe-next";
import { createSession, getCurrentUser, verifyPassword } from "@/lib/auth";
import { rateLimit, clearRateLimit, actionKey } from "@/lib/rate-limit";

export const metadata = { title: "Log in — KiwiPilotPrep" };

async function login(formData: FormData) {
  "use server";

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) redirect("/login?error=missing");

  // Two budgets, because they stop different attacks. Per-address catches
  // someone working through a password list against one account; per-source
  // catches someone spraying one password across many accounts.
  //
  // Only FAILED attempts are charged. Counting successes as well would
  // eventually lock out a person who simply signs in from several devices,
  // and it protects nothing: an attacker who already knows the password does
  // not need a ninth guess.
  const failureKey = `login:fail:${email}`;
  const byAddress = await rateLimit(failureKey, {
    limit: 8,
    windowMs: 10 * 60_000,
    count: false,
  });
  // Same reasoning as signup: a shared address may be a whole classroom. The
  // per-address budget above is the one that actually stops password guessing.
  const bySource = await rateLimit(await actionKey("login:ip"), {
    limit: 100,
    windowMs: 10 * 60_000,
  });
  if (!byAddress.ok || !bySource.ok) redirect("/login?error=throttled");

  const user = await db.user.findUnique({ where: { email } });
  // Same message whether the address is unknown, the password is wrong, or the
  // account is switched off. Distinguishing them would turn this form into a
  // way to enumerate accounts and learn their state.
  if (
    !user ||
    user.status === "DISABLED" ||
    !(await verifyPassword(password, user.passwordHash))
  ) {
    await rateLimit(failureKey, { limit: 8, windowMs: 10 * 60_000 });
    redirect("/login?error=invalid");
  }

  // A correct password clears the run of failures that preceded it.
  clearRateLimit(failureKey);
  await createSession(user.id);

  // Back to whatever they were trying to reach before they were asked to sign
  // in — a specific course checkout, usually. Relative paths only.
  const raw = String(formData.get("next") ?? "");
  const next = safeNextPath(raw);
  if (next) redirect(next);

  redirect(user.role === "ADMIN" ? "/admin" : "/dashboard");
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string; reset?: string }>;
}) {
  const { error, next, reset } = await searchParams;
  // Relative only, so `next` can never become an open redirect.
  const safeNext = safeNextPath(next);
  // Already signed in: go where they were heading, not to the dashboard.
  // Someone who clicks Get on a package in a second tab should land on that
  // checkout, not be made to find it again.
  if (await getCurrentUser()) redirect(safeNext || "/dashboard");

  return (
    <section className="sec">
      <div className="wrap auth-wrap">
        <div className="sec-head center r in">
          <div className="eyebrow">Welcome back</div>
          <h1 className="h2">Log in to continue your preparation.</h1>
        </div>

        <form className="cform r in mt-l" action={login}>
          {safeNext && <input type="hidden" name="next" value={safeNext} />}

          {reset && (
            <p className="fnote on" role="status">
              Your password has been updated. Sign in with the new one.
            </p>
          )}

          {error && (
            <p className="fnote on warn" role="alert">
              {error === "missing"
                ? "Please enter your email and password."
                : error === "throttled"
                  ? "Too many sign-in attempts. Please wait a few minutes and try again."
                  : "That email and password combination is not recognised."}
            </p>
          )}

          <div className="fld">
            <label htmlFor="email">Email address</label>
            <input id="email" name="email" type="email" autoComplete="email" required />
          </div>

          <div className="fld">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </div>

          <button className="btn btn-p btn-w" type="submit">
            Log In
          </button>

          <p className="fhint" style={{ marginTop: "16px", textAlign: "center" }}>
            No account yet?{" "}
            <Link href={safeNext ? `/signup?next=${encodeURIComponent(safeNext)}` : "/signup"}>
              Create one free
            </Link>
            . Forgotten your password? <Link href="/forgot">Reset it</Link>.
          </p>
        </form>
      </div>
    </section>
  );
}
