import Link from "next/link";

import { getCurrentUser } from "@/lib/auth";

export const metadata = { title: "Email confirmed" };

/**
 * Where the confirm button lands.
 *
 * A page of its own rather than a branch of the token page, because by the
 * time this renders the token has been spent — re-reading it would report an
 * unusable link to somebody who just succeeded.
 */
export default async function VerifyConfirmedPage({
  searchParams,
}: {
  searchParams: Promise<{ already?: string }>;
}) {
  const { already } = await searchParams;
  const user = await getCurrentUser();
  const wasAlreadyVerified = already === "1";

  return (
    <section className="sec">
      <div className="wrap auth-wrap">
        <div className="sec-head center r in">
          <div className="eyebrow">Confirmed</div>
          <h1 className="h2">
            {wasAlreadyVerified
              ? "That address was already confirmed."
              : "Your email is confirmed."}
          </h1>
          <p className="lede mt-s">
            {wasAlreadyVerified
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
