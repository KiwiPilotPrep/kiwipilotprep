import Link from "next/link";
import { redirect } from "next/navigation";

import { findResetToken, completePasswordReset } from "@/lib/password-reset";
import { checkPassword } from "@/lib/password-policy";
import { rateLimit, actionKey } from "@/lib/rate-limit";
import { destroySession } from "@/lib/auth";
import PasswordField from "@/components/auth/PasswordField";

export const metadata = { title: "Choose a new password" };

async function submitReset(token: string, formData: FormData) {
  "use server";

  const bySource = await rateLimit(await actionKey("reset-submit"), {
    limit: 20,
    windowMs: 60 * 60_000,
  });
  if (!bySource.ok) redirect(`/reset/${token}?error=throttled`);

  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (password !== confirm) redirect(`/reset/${token}?error=mismatch`);

  // The token is looked up first so the policy message is only shown to
  // someone actually holding a valid link.
  const lookup = await findResetToken(token);
  if (!lookup.ok) redirect(`/reset/${token}?error=${lookup.reason}`);

  const strength = checkPassword(password, { name: lookup.name, email: lookup.email });
  if (!strength.ok) {
    redirect(`/reset/${token}?error=weak&detail=${encodeURIComponent(strength.message)}`);
  }

  const result = await completePasswordReset({ raw: token, newPassword: password });
  if (!result.ok) redirect(`/reset/${token}?error=invalid`);

  // Every session issued before now is already refused by the session check.
  // Clearing the cookie here means this browser is not left holding one that
  // silently stops working.
  await destroySession();

  redirect("/login?reset=1");
}

const MESSAGES: Record<string, string> = {
  mismatch: "Those two passwords don't match.",
  throttled: "Too many attempts. Please wait a few minutes and try again.",
  weak: "That password does not meet the requirements below.",
};

export default async function ResetPasswordPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ error?: string; detail?: string }>;
}) {
  const { token } = await params;
  const { error, detail } = await searchParams;

  const lookup = await findResetToken(token);

  // A spent, unknown or expired link never renders the form — there is nothing
  // useful to do with it, and offering the fields would be misleading.
  if (!lookup.ok && error !== "mismatch" && error !== "weak" && error !== "throttled") {
    const expired = lookup.reason === "expired";
    return (
      <section className="sec">
        <div className="wrap auth-wrap">
          <div className="sec-head center r in">
            <div className="eyebrow">{expired ? "Link expired" : "Link not recognised"}</div>
            <h1 className="h2">
              {expired ? "That reset link has expired." : "We couldn't use that link."}
            </h1>
            <p className="lede mt-s">
              {expired
                ? "Reset links last one hour. Request a new one and it will arrive in a moment."
                : "It may already have been used, or it may have been cut short by your email app. Request a fresh one below."}
            </p>
          </div>

          <div className="acts" style={{ justifyContent: "center", marginTop: "26px" }}>
            <Link className="btn btn-p" href="/forgot">
              Request a new link
            </Link>
            <Link className="btn btn-g" href="/login">
              Back to log in
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="sec">
      <div className="wrap auth-wrap">
        <div className="sec-head center r in">
          <div className="eyebrow">Password reset</div>
          <h1 className="h2">Choose a new password.</h1>
          <p className="lede mt-s">
            You&rsquo;ll be signed out everywhere else once this is done.
          </p>
        </div>

        <form className="cform r in mt-l" action={submitReset.bind(null, token)}>
          {error && (
            <p className="fnote on warn" role="alert">
              {detail ?? MESSAGES[error] ?? "Please check the form and try again."}
            </p>
          )}

          <PasswordField label="New password" />

          <div className="fld">
            <label htmlFor="confirm">Confirm new password</label>
            <input
              id="confirm"
              name="confirm"
              type="password"
              autoComplete="new-password"
              required
            />
          </div>

          <button className="btn btn-p btn-w" type="submit">
            Update password
          </button>

          <p className="fhint" style={{ marginTop: "16px", textAlign: "center" }}>
            Changed your mind? <Link href="/login">Back to log in</Link>.
          </p>
        </form>
      </div>
    </section>
  );
}
