import Link from "next/link";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { safeNextPath } from "@/lib/safe-next";
import { requireUser } from "@/lib/auth";
import { rateLimit, actionKey } from "@/lib/rate-limit";
import { sendVerificationEmail, canResend } from "@/lib/verification";
import { emailConfigured } from "@/lib/email/send";

export const metadata = { title: "Confirm your email" };

async function resend(next: string) {
  "use server";

  const user = await requireUser();
  const back = safeNextPath(next);
  const query = (extra: Record<string, string>) =>
    new URLSearchParams({ ...(back ? { next: back } : {}), ...extra }).toString();

  const fresh = await db.user.findUnique({
    where: { id: user.id },
    select: { id: true, name: true, email: true, emailVerifiedAt: true, verifySentAt: true },
  });
  if (!fresh) redirect("/login");
  if (fresh.emailVerifiedAt) redirect(back || "/pricing");

  // Two brakes: a short per-account cooldown so the button cannot be leaned
  // on, and a per-source hourly cap so the endpoint cannot be turned into a
  // way to send mail to an address someone else owns.
  if (!canResend(fresh.verifySentAt)) redirect(`/verify/sent?${query({ error: "wait" })}`);

  const bySource = await rateLimit(await actionKey("verify-resend"), {
    limit: 15,
    windowMs: 60 * 60_000,
  });
  if (!bySource.ok) redirect(`/verify/sent?${query({ error: "throttled" })}`);

  const delivery = await sendVerificationEmail(fresh).catch(() => ({
    delivered: false,
    logged: false,
  }));

  // Say what actually happened. Claiming it was sent when the provider
  // refused it leaves someone waiting on a message that does not exist (§19).
  if (!delivery.delivered && !delivery.logged) {
    redirect(`/verify/sent?${query({ send: "failed" })}`);
  }
  redirect(`/verify/sent?${query({ resent: "1" })}`);
}

export default async function VerifySentPage({
  searchParams,
}: {
  searchParams: Promise<{ resent?: string; error?: string; send?: string; next?: string }>;
}) {
  const user = await requireUser();
  const { resent, error, send, next } = await searchParams;
  const safeNext = safeNextPath(next);

  // Already confirmed — go on to whatever they were doing. Resend is neither
  // available nor needed past this point (§6).
  if (user.emailVerifiedAt) redirect(safeNext || "/pricing");

  return (
    <section className="sec">
      <div className="wrap auth-wrap">
        <div className="sec-head center r in">
          <div className="eyebrow">One more step</div>
          <h1 className="h2">Check your email.</h1>
          <p className="lede mt-s">
            We&rsquo;ve sent a confirmation link to <b>{user.email}</b>. Open it and your free
            practice questions unlock straight away.
          </p>
        </div>

        {resent && (
          <p className="fnote on" role="status" style={{ marginTop: "20px" }}>
            Sent again. It can take a minute to arrive.
          </p>
        )}
        {error === "wait" && (
          <p className="fnote on warn" role="alert" style={{ marginTop: "20px" }}>
            That was just sent. Give it a minute before asking for another.
          </p>
        )}
        {error === "throttled" && (
          <p className="fnote on warn" role="alert" style={{ marginTop: "20px" }}>
            Too many requests from this connection. Please try again later.
          </p>
        )}
        {send === "failed" && (
          <p className="fnote on warn" role="alert" style={{ marginTop: "20px" }}>
            We could not send that email just now. Please try again in a moment &mdash; if it
            keeps failing, <Link href="/contact">let us know</Link> and we&rsquo;ll confirm your
            address manually.
          </p>
        )}

        <div className="panel mt-l">
          <div className="panel-bd">
            <p>
              The link works once and expires in 24 hours. Nothing else about your account is
              waiting on it &mdash; you can look around now, and you&rsquo;ll be asked to confirm
              when you start a free trial or buy a course.
            </p>
            <p className="xs" style={{ marginTop: "14px" }}>
              Not in your inbox? Check the spam folder first &mdash; confirmation mail often lands
              there.
            </p>

            <div className="acts" style={{ marginTop: "20px" }}>
              <form action={resend.bind(null, safeNext)}>
                <button className="btn btn-p" type="submit">
                  Send it again
                </button>
              </form>
              <Link className="btn btn-g" href={safeNext || "/pricing"}>
                {safeNext ? "Back to checkout" : "Look at the courses"}
              </Link>
            </div>
          </div>
        </div>

        {!emailConfigured() && (
          <p className="fnote on warn" style={{ marginTop: "18px" }}>
            <b>Email is not configured on this server.</b> Nothing was delivered. Please contact
            us and we will confirm your address manually.
          </p>
        )}

        <p className="xs" style={{ textAlign: "center", marginTop: "22px" }}>
          Wrong address? <Link href="/contact">Tell us</Link> and we&rsquo;ll correct it.
        </p>
      </div>
    </section>
  );
}
