import Link from "next/link";
import { redirect } from "next/navigation";

import { requestPasswordReset } from "@/lib/password-reset";
import { rateLimit, actionKey } from "@/lib/rate-limit";
import { sweepExpiredAuthTokens } from "@/lib/verification";

export const metadata = { title: "Forgot your password" };

async function requestReset(formData: FormData) {
  "use server";

  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  // Throttled per source, because this endpoint sends mail to an address the
  // requester does not have to own. Per-account cooldown is enforced inside
  // requestPasswordReset as well.
  const bySource = await rateLimit(await actionKey("reset-request"), {
    limit: 12,
    windowMs: 60 * 60_000,
  });

  if (bySource.ok && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    // Never awaited for its result, and its result is never surfaced: whether
    // an account exists is exactly what must not be revealed here (§12).
    await requestPasswordReset(email).catch(() => null);
  }

  // The same answer every time — unknown address, known address, throttled,
  // or a provider outage. Anything else turns this form into a way to find out
  // who has an account.
  redirect("/forgot?sent=1");
}

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string }>;
}) {
  const { sent } = await searchParams;

  // Opportunistic tidy-up (§27). This page is visited rarely and never in a
  // hot path, which makes it a reasonable place to clear expired token
  // remains without adding a scheduler. A failure here must never stop
  // someone resetting their password.
  await sweepExpiredAuthTokens().catch(() => 0);

  if (sent) {
    return (
      <section className="sec">
        <div className="wrap auth-wrap">
          <div className="sec-head center r in">
            <div className="eyebrow">Check your email</div>
            <h1 className="h2">If that address has an account, a link is on its way.</h1>
            <p className="lede mt-s">
              We&rsquo;ve sent password reset instructions to the address you entered. The link
              works once and expires in an hour.
            </p>
          </div>

          <div className="panel mt-l">
            <div className="panel-bd">
              <p>
                Nothing yet? Check your spam folder first. If it still hasn&rsquo;t arrived, the
                address may not have an account &mdash; try signing up instead.
              </p>
              <div className="acts" style={{ marginTop: "18px" }}>
                <Link className="btn btn-p" href="/login">
                  Back to log in
                </Link>
                <Link className="btn btn-g" href="/forgot">
                  Try another address
                </Link>
              </div>
            </div>
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
          <h1 className="h2">Forgotten your password?</h1>
          <p className="lede mt-s">
            Enter the address you signed up with and we&rsquo;ll send you a link to choose a new
            one.
          </p>
        </div>

        <form className="cform r in mt-l" action={requestReset}>
          <div className="fld">
            <label htmlFor="email">Email address</label>
            <input id="email" name="email" type="email" autoComplete="email" required />
          </div>

          <button className="btn btn-p btn-w" type="submit">
            Send reset link
          </button>

          <p className="fhint" style={{ marginTop: "16px", textAlign: "center" }}>
            Remembered it? <Link href="/login">Log in</Link>.
          </p>
        </form>
      </div>
    </section>
  );
}
