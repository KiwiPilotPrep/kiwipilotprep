import Link from "next/link";

import LegalPage from "@/components/site/LegalPage";

export const metadata = {
  title: "Terms of Service",
  description:
    "The terms on which KiwiPilotPrep provides Aspeq PPL, CPL and IR theory exam preparation.",
};

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Terms of Service"
      lede="The agreement between you and KiwiPilotPrep when you buy or use anything on this site."
      updated="6 September 2026"
    >
      <h2>1. Who we are</h2>
      <p>
        KiwiPilotPrep is an independent study platform for New Zealand aviation theory
        examinations. We are not affiliated with, endorsed by, or acting on behalf of Aspeq or
        the Civil Aviation Authority of New Zealand. We do not deliver official examinations and
        we cannot enter, alter or influence your official results.
      </p>

      <h2>2. Your account</h2>
      <p>
        You need an account to access paid material. Keep your password to yourself: access is
        licensed to one person, and we treat activity on an account as activity by its owner. Tell
        us promptly if you believe someone else has your login and we will help you secure it.
      </p>
      <p>
        You must be old enough to enter a contract in your jurisdiction. If a flight school bought
        your seat, your school administrator can see your progress and results and can withdraw
        your seat.
      </p>

      <h2>3. What you are buying</h2>
      <p>
        A purchase grants access to specific study material for a stated period, shown before you
        pay and on your receipt. Access periods run from the moment payment is confirmed, not from
        the date you start studying. When a period ends, access to that material stops; your
        progress records are retained so that access can be restored if you buy again.
      </p>
      <p>
        Individual subjects are sold with one month of access. Course packages and the Complete
        Aviator Pass carry the access period shown on the pricing page.
      </p>

      <h2>4. How the material is prepared</h2>
      <p>
        Our question banks and notes are written from published syllabus material and from exam
        recalls contributed by students. We work hard to keep them accurate and current, but a
        study aid is not a syllabus and not an examination. You remain responsible for satisfying
        yourself that you are ready to sit, and for meeting any requirements your instructor or
        flight school sets.
      </p>
      <p>
        We do not reproduce official examination papers, and we do not want them. Do not send us
        material you are not permitted to share.
      </p>

      <h2>5. Acceptable use</h2>
      <ul>
        <li>Do not share, resell, publish or redistribute any part of the material.</li>
        <li>Do not scrape, bulk-download or systematically copy the question bank.</li>
        <li>Do not share your account with another person.</li>
        <li>Do not attempt to bypass access controls, timers or scoring.</li>
      </ul>
      <p>
        We may suspend or close an account that breaches this section. Where a breach is clear and
        deliberate, we may do so without a refund.
      </p>

      <h2>6. Payments</h2>
      <p>
        Prices are shown in New Zealand dollars or Indian rupees and are charged in the currency
        you select at checkout. Payments are processed by our payment provider; we never see or
        store your full card details. Discount codes are applied by us at checkout, are subject to
        their own conditions, and may be withdrawn at any time before they are used.
      </p>

      <h2>7. The First-Attempt Guarantee</h2>
      <p>
        Our guarantee is a separate promise with its own published conditions, including minimum
        study and mock-exam requirements. It is set out in full on the{" "}
        <Link href="/guarantee">Guarantee</Link> page, and refunds under it follow our{" "}
        <Link href="/refunds">Refund Policy</Link>.
      </p>

      <h2>8. Availability</h2>
      <p>
        We aim to keep the platform available at all times but do not promise uninterrupted
        service. We may take it down for maintenance, and we may change, add to or withdraw
        material as syllabuses change. If we withdraw material you have paid for and cannot offer
        an equivalent, we will refund the unused portion of your access.
      </p>

      <h2>9. Intellectual property</h2>
      <p>
        All material on the platform belongs to KiwiPilotPrep or its licensors. Buying access
        gives you a personal, non-transferable licence to use it for your own study. It does not
        transfer ownership of anything.
      </p>

      <h2>10. Liability</h2>
      <p>
        Nothing in these terms limits rights you have under the New Zealand Consumer Guarantees
        Act or Fair Trading Act, or under equivalent laws that apply to you. Subject to that: we
        provide the platform as a study aid, and we are not liable for examination outcomes, for
        costs of re-sitting beyond what our guarantee provides, or for indirect or consequential
        loss. Where we are liable, our liability is limited to the amount you paid us in the
        twelve months before the claim.
      </p>

      <h2>11. Changes to these terms</h2>
      <p>
        We may update these terms. The version that applies to a purchase is the one published
        when you made it. Material changes will be notified by email to the address on your
        account.
      </p>

      <h2>12. Law and disputes</h2>
      <p>
        These terms are governed by New Zealand law and the New Zealand courts have
        non-exclusive jurisdiction. Please contact us first — most things are resolved faster that
        way.
      </p>

      <h2>13. Contact</h2>
      <p>
        Questions about these terms: use the <Link href="/contact">contact form</Link>. We reply
        within three working days.
      </p>
    </LegalPage>
  );
}
