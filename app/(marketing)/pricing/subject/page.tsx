import Link from "next/link";

import { getCurrentUser } from "@/lib/auth";
import { preferredCurrency } from "@/lib/currency";
import { singleSubjectData } from "@/lib/single-subject";
import SingleSubjectSection from "@/components/checkout/SingleSubjectSection";

export const metadata = { title: "Buy a single subject — KiwiPilotPrep" };

/**
 * The dedicated single-subject page.
 *
 * Reached from a "Buy a single subject" button on the pricing surfaces, this
 * page holds nothing but the one job: pick a licence track, pick the subject,
 * apply a code if you have one, and buy. No package cards, no catalogue — the
 * whole list of everything is on /pricing, and showing it again here is what
 * made this feel like a second pricing page.
 *
 * The picker is the same one the packages use, so a subject takes a discount
 * code and goes straight to the application checkout in exactly the same way.
 */
export default async function BuySubjectPage({
  searchParams,
}: {
  searchParams: Promise<{ currency?: string }>;
}) {
  const { currency: raw } = await searchParams;
  const [currency, subjects, user] = await Promise.all([
    preferredCurrency(raw),
    singleSubjectData(),
    getCurrentUser(),
  ]);

  return (
    <section className="sec">
      <div className="wrap auth-wrap">
        <div className="sec-head center r in">
          <div className="eyebrow">Single subject</div>
          <h1 className="h2">Buy a single subject.</h1>
          <p className="lede mt-s">
            Any one PPL, CPL or IR subject on its own — full material, practice questions and its
            mock exam. Choose a track, then the subject.
          </p>
        </div>

        {subjects.options.length === 0 ? (
          <div className="cnote info mt-l">
            <b>No single subjects on sale yet</b>
            <p>
              They appear here as soon as an administrator publishes them. In the meantime, the{" "}
              <Link href="/pricing">full packages</Link> are available.
            </p>
          </div>
        ) : (
          <div className="mt-l">
            <SingleSubjectSection
              initialCurrency={currency}
              options={subjects.options}
              courses={subjects.courses}
              signedIn={Boolean(user)}
            />
          </div>
        )}

        <p className="xs" style={{ marginTop: "18px", textAlign: "center" }}>
          <Link href="/pricing">← Back to all packages</Link>
        </p>
      </div>
    </section>
  );
}
