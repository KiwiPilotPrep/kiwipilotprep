import Link from "next/link";

import { inspectVerificationToken } from "@/lib/verification";
import { getCurrentUser } from "@/lib/auth";

import { confirmEmailAction } from "./actions";

export const metadata = { title: "Confirming your email" };

/**
 * The landing page for a verification link.
 *
 * Rendering this page changes nothing. The token is only read here, and is
 * redeemed by the POST behind the confirm button — because the link is fetched
 * by things that are not the recipient. Mail security scanners, link preview
 * bots and antivirus proxies all follow URLs in mail before a person sees
 * them, and while redemption happened during render, one of those fetches
 * confirmed the address on the recipient's behalf. An address nobody clicked
 * would be verified seconds after signup.
 *
 * Deliberately does not require a session: people open these links in whatever
 * browser their mail app hands them, which is often not the one they signed up
 * in. The token itself is the proof, so redeeming it works either way — and if
 * they are not signed in here, they are pointed at the login form afterwards
 * rather than being told the link failed.
 */
export default async function VerifyTokenPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ busy?: string }>;
}) {
  const { token } = await params;
  const { busy } = await searchParams;

  const result = await inspectVerificationToken(token);
  const user = await getCurrentUser();

  if (result.ok) {
    return (
      <section className="sec">
        <div className="wrap auth-wrap">
          <div className="sec-head center r in">
            <div className="eyebrow">One last tap</div>
            <h1 className="h2">
              {result.alreadyVerified
                ? "That address is already confirmed."
                : "Confirm your email address."}
            </h1>
            <p className="lede mt-s">
              {result.alreadyVerified
                ? "Nothing more to do — your account is ready."
                : "Press the button below and free practice questions and checkout both open up."}
            </p>
          </div>

          {busy ? (
            <p className="xs" style={{ textAlign: "center", marginTop: "18px" }}>
              That was a lot of attempts at once. Wait a moment and press it again.
            </p>
          ) : null}

          <form
            action={confirmEmailAction}
            className="acts"
            style={{ justifyContent: "center", marginTop: "26px" }}
          >
            <input type="hidden" name="token" value={token} />
            <button className="btn btn-p" type="submit">
              {result.alreadyVerified ? "Continue" : "Confirm my email"}
            </button>
          </form>

          <p className="xs" style={{ textAlign: "center", marginTop: "22px" }}>
            The link stays valid until you press it, for 24 hours from when it was sent.
          </p>
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
