import Link from "next/link";

import { consumeVerificationToken } from "@/lib/verification";
import { getCurrentUser } from "@/lib/auth";

export const metadata = { title: "Confirming your email" };

/**
 * The landing page for a verification link.
 *
 * Deliberately does not require a session: people open these links in whatever
 * browser their mail app hands them, which is often not the one they signed up
 * in. The token itself is the proof, so redeeming it works either way — and if
 * they are not signed in here, they are pointed at the login form afterwards
 * rather than being told the link failed.
 */
export default async function VerifyTokenPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const result = await consumeVerificationToken(token);
  const user = await getCurrentUser();

  if (result.ok) {
    return (
      <section className="sec">
        <div className="wrap auth-wrap">
          <div className="sec-head center r in">
            <div className="eyebrow">Confirmed</div>
            <h1 className="h2">
              {result.alreadyVerified
                ? "That address was already confirmed."
                : "Your email is confirmed."}
            </h1>
            <p className="lede mt-s">
              {result.alreadyVerified
                ? "Nothing more to do — your account is ready."
                : "Free practice questions and checkout are both open to you now."}
            </p>
          </div>

          <div className="acts" style={{ justifyContent: "center", marginTop: "26px" }}>
            {user ? (
              <>
                <Link className="btn btn-p" href="/pricing">
                  Choose your course
                </Link>
                <Link className="btn btn-g" href="/dashboard">
                  Go to my dashboard
                </Link>
              </>
            ) : (
              <Link className="btn btn-p" href="/login?next=/pricing">
                Log in to continue
              </Link>
            )}
          </div>
        </div>
      </section>
    );
  }

  const expired = result.reason === "expired";

  return (
    <section className="sec">
      <div className="wrap auth-wrap">
        <div className="sec-head center r in">
          <div className="eyebrow">{expired ? "Link expired" : "Link not recognised"}</div>
          <h1 className="h2">
            {expired ? "That link has expired." : "We couldn't use that link."}
          </h1>
          <p className="lede mt-s">
            {expired
              ? "Confirmation links last 24 hours. Sign in and ask for a new one — it takes a moment."
              : "It may already have been used, or it may have been cut short by your email app. Signing in will let you send a fresh one."}
          </p>
        </div>

        <div className="acts" style={{ justifyContent: "center", marginTop: "26px" }}>
          <Link className="btn btn-p" href={user ? "/verify/sent" : "/login?next=/verify/sent"}>
            Send a new link
          </Link>
          <Link className="btn btn-g" href="/">
            Back to the homepage
          </Link>
        </div>

        <p className="xs" style={{ textAlign: "center", marginTop: "22px" }}>
          Still stuck? <Link href="/contact">Get in touch</Link> — we reply within three working
          days.
        </p>
      </div>
    </section>
  );
}
