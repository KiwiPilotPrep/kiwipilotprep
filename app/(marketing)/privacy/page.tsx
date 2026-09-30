import Link from "next/link";

import LegalPage from "@/components/site/LegalPage";

export const metadata = {
  title: "Privacy Policy",
  description:
    "What KiwiPilotPrep collects, why we hold it, how long we keep it, and the rights you have over it.",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Privacy Policy"
      lede="What we collect, why we hold it, how long we keep it, and what you can ask us to do with it."
      updated="6 September 2026"
    >
      <p>
        This policy covers the KiwiPilotPrep website and study platform. It is written to the New
        Zealand Privacy Act 2020 and, for users in India, the Digital Personal Data Protection Act
        2023 (see section&nbsp;11).
      </p>
      <p>
        {/* TODO BEFORE LAUNCH: replace with the registered legal entity and a
            monitored contact email. */}
        KiwiPilotPrep is operated by <b>[add your legal entity]</b>, Aotearoa New Zealand. You can
        reach us any time through the <Link href="/contact">contact form</Link>.
      </p>

      <h2>1. What we collect</h2>
      <ul>
        <li>
          <b>Account details</b> — your name, email address and a securely hashed password. We
          never store your password itself and cannot read it.
        </li>
        <li>
          <b>Study activity</b> — chapters you complete, practice answers, mock exam attempts and
          scores, and the knowledge-deficiency reports generated from them.
        </li>
        <li>
          <b>Purchase records</b> — what you bought, when, in which currency, the amount, any
          discount code applied, and the reference our payment provider returns. We do not receive
          or store your card number, CVV or bank details.
        </li>
        <li>
          <b>Guarantee claims</b> — where you make a claim, the exam you sat and any official
          result document you choose to upload.
        </li>
        <li>
          <b>Technical data</b> — the minimum needed to keep the service running and secure, such
          as session cookies and server logs.
        </li>
      </ul>

      <h2>2. Why we hold it</h2>
      <p>
        To give you access to what you bought, to show you your own progress, to process payments
        and refunds, to assess guarantee claims against their published conditions, to email you
        your scorecards and account notices, and to keep the platform secure. We do not sell your
        information, and we do not use it to build advertising profiles.
      </p>

      <h2>3. Cookies</h2>
      <p>
        We use a small number of first-party cookies: one to keep you signed in, one to remember
        your NZD/INR choice, and a short-lived one that returns what you typed if a sign-up is
        rejected. We do not use advertising or cross-site tracking cookies, and no third-party
        analytics. Each cookie is listed in our <Link href="/cookies">Cookie Policy</Link>.
      </p>

      <h2>4. Who else sees it</h2>
      <ul>
        <li>
          <b>Our payment provider</b> receives what it needs to take a payment and issue a refund.
        </li>
        <li>
          <b>Our email provider</b> receives your email address and the content of messages we
          send you, such as scorecards.
        </li>
        <li>
          <b>Your flight school</b>, if it bought your seat, can see your progress and results for
          the material it paid for. It cannot see your password or your payment details.
        </li>
        <li>
          <b>Nobody else</b>, unless we are legally required to disclose something.
        </li>
      </ul>
      <p>
        Some of these providers process data outside New Zealand. We only use providers that offer
        comparable protection to the Privacy Act.
      </p>

      <h2>5. How long we keep it</h2>
      <ul>
        <li>Account and study records: while your account is open, and 12 months after closure.</li>
        <li>
          Purchase, refund and tax records: seven years, because we are required to keep them.
        </li>
        <li>
          Documents uploaded with a guarantee claim: two years after the claim is closed, then
          deleted.
        </li>
        <li>Server logs: 90 days.</li>
      </ul>

      <h2>6. How we protect it</h2>
      <p>
        Passwords are hashed with a deliberately slow algorithm. Sessions use signed, http-only
        cookies. Payment signatures are verified server-side before any access is granted. Uploaded
        claim documents are stored outside the public web root under generated names and are served
        only to you and to our claim reviewers. Access to the admin console is restricted by role
        and re-checked on every request.
      </p>

      <h2>7. Your rights</h2>
      <p>
        You can ask us for a copy of the information we hold about you, ask us to correct it, or
        ask us to delete your account. We will respond within 20 working days. Some records — the
        purchase and tax records above — we must keep even after an account is deleted.
      </p>

      <h2>8. Children</h2>
      <p>
        The platform is intended for people training towards a pilot licence and is not directed
        at children under 13. We do not knowingly collect their information.
      </p>

      <h2>9. Complaints</h2>
      <p>
        Contact us first through the <Link href="/contact">contact form</Link>. If you are not
        satisfied with our response, you can complain to the New Zealand Office of the Privacy
        Commissioner.
      </p>

      <h2>10. Changes</h2>
      <p>
        If we change this policy we will update the date above and, where the change is
        significant, email the address on your account.
      </p>

      <h2>11. If you are in India (DPDP Act 2023)</h2>
      <p>
        Because we offer courses priced in Indian rupees, India&rsquo;s Digital Personal Data
        Protection Act 2023 applies to users in India. In that context KiwiPilotPrep is the Data
        Fiduciary and you are the Data Principal.
      </p>
      <ul>
        <li>
          <b>Why we may process your data.</b> To provide the account and courses you signed up for
          and paid for, and on the consent you give when you create an account or send us a message.
        </li>
        <li>
          <b>Withdrawing consent.</b> You may withdraw consent at any time by contacting us; where
          we relied only on consent, we will stop that processing. Some records we must keep by law
          (see section&nbsp;5).
        </li>
        <li>
          <b>Your rights.</b> You may request access to, and correction or erasure of, your personal
          data, and you may nominate another person to exercise these rights if you are unable to.
        </li>
        <li>
          <b>Cross-border processing.</b> Some of our providers (payment, email) process data
          outside India; we only use providers offering comparable protection.
        </li>
        <li>
          <b>Grievance redressal.</b> If you have a complaint about how your data is handled, contact
          our Grievance Officer:{" "}
          {/* TODO BEFORE LAUNCH: appoint and name a Grievance Officer with a
              monitored email — required under the DPDP Act. */}
          <b>[add Grievance Officer name and email]</b>. If unresolved, you may approach the Data
          Protection Board of India.
        </li>
      </ul>
    </LegalPage>
  );
}
