import Link from "next/link";

import LegalPage from "@/components/site/LegalPage";

export const metadata = {
  alternates: { canonical: "/refunds" },
  title: "Refund Policy",
  description:
    "When KiwiPilotPrep refunds a purchase, how to ask for one, and how long it takes.",
};

export default function RefundsPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Refund Policy"
      lede="When we refund a purchase, how to ask, and how long it takes."
      updated="6 September 2026"
    >
      <h2>1. Cooling-off period</h2>
      <p>
        If you change your mind within <b>7 days</b> of purchase and have completed no more than
        20% of the material and no mock exams, tell us and we will refund you in full. Beyond that
        point you have had substantial use of the material, and a change of mind is not by itself
        grounds for a refund.
      </p>

      <h2>2. The First-Attempt Guarantee</h2>
      <p>
        This is the main route to a refund and it is separate from the cooling-off period. If you
        met every published requirement, sat your first attempt, and did not pass, you can claim.
        The full conditions — minimum chapter completion, minimum mock exam scores, and the
        evidence we need — are on the <Link href="/guarantee">Guarantee</Link> page.
      </p>
      <p>How a claim runs:</p>
      <ol>
        <li>Submit your claim from your account and attach your official Aspeq result sheet.</li>
        <li>We check the claim against the requirements recorded on your account.</li>
        <li>We may come back to you once for anything missing.</li>
        <li>We approve or decline, and tell you which and why.</li>
        <li>An approved claim is refunded to the original payment method.</li>
        <li>The refund is confirmed by email with a reference you can quote.</li>
      </ol>

      <h2>3. Technical faults</h2>
      <p>
        If a fault on our side stopped you using what you paid for and we could not fix it in a
        reasonable time, we will refund the unused part of your access. Tell us while it is
        happening so we can see it.
      </p>

      <h2>4. Duplicate and incorrect charges</h2>
      <p>
        Charged twice for the same thing, or charged for something you did not buy? Contact us and
        we will refund it in full. There is no time limit and no conditions on this.
      </p>

      <h2>5. What we do not refund</h2>
      <ul>
        <li>Access that has simply expired without being used.</li>
        <li>
          Purchases where the guarantee requirements were not met, unless another part of this
          policy applies.
        </li>
        <li>Accounts closed for sharing or redistributing the material.</li>
        <li>
          Failing an exam where you did not use the platform — the guarantee is a promise about
          our preparation, and it needs you to have done it.
        </li>
      </ul>

      <h2>6. Partial refunds</h2>
      <p>
        Where we refund the unused portion of an access period, we calculate it from the days
        remaining at the date we accept the claim, and any discount you received is applied
        proportionally.
      </p>

      <h2>7. How long it takes</h2>
      <p>
        We reply to every refund request within <b>three working days</b>. Once a refund is
        approved we issue it within five working days; your bank or card issuer usually takes a
        further 5–10 working days to show it. Refunds always go back to the original payment
        method.
      </p>

      <h2>8. Flight school purchases</h2>
      <p>
        Where a flight school bought your seat, any refund is issued to the school, since it made
        the payment. Individual claims are still assessed on your own study record.
      </p>

      <h2>9. Your statutory rights</h2>
      <p>
        Nothing here limits your rights under the New Zealand Consumer Guarantees Act or Fair
        Trading Act. This policy sits alongside them.
      </p>

      <h2>10. Asking for a refund</h2>
      <p>
        Use the <Link href="/contact?subject=refund">contact form</Link> and select
        &ldquo;Refund&rdquo;, or start a guarantee claim from your account. Include your order
        reference — it is on your receipt and in your account.
      </p>
    </LegalPage>
  );
}
