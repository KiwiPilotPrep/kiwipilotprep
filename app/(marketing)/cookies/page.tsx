import Link from "next/link";

import LegalPage from "@/components/site/LegalPage";

export const metadata = {
  alternates: { canonical: "/cookies" },
  title: "Cookie Policy",
  description:
    "The small number of cookies KiwiPilotPrep sets, what each is for, and how to control them.",
};

export default function CookiePolicyPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Cookie Policy"
      lede="The small number of cookies we set, what each one does, and how to control them."
      updated="30 September 2026"
    >
      <p>
        A cookie is a small text file a website stores in your browser. We use as few as the
        service can run on. We do <b>not</b> use advertising cookies, cross-site tracking, or
        third-party analytics such as Google Analytics or Facebook Pixel. Nothing on this site
        builds a marketing profile of you.
      </p>

      <h2>1. The cookies we set</h2>
      <p>All of the cookies below come from this website itself (first-party).</p>
      <table className="legal-table">
        <thead>
          <tr>
            <th>Cookie</th>
            <th>Purpose</th>
            <th>Type</th>
            <th>Lifetime</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>kpp_session</code>
            </td>
            <td>
              Keeps you signed in after you log in. Encrypted and http-only, so page scripts can
              never read it.
            </td>
            <td>Strictly necessary</td>
            <td>Until you sign out or it expires</td>
          </tr>
          <tr>
            <td>
              <code>kpp_currency</code>
            </td>
            <td>Remembers whether you chose NZD or INR, so prices stay in your currency.</td>
            <td>Functional (preference)</td>
            <td>180 days</td>
          </tr>
          <tr>
            <td>
              <code>kpp_form_echo</code>
            </td>
            <td>
              Holds the name and email you already typed if a sign-up is rejected, so you do not
              re-enter them. Never holds a password.
            </td>
            <td>Functional</td>
            <td>2 minutes</td>
          </tr>
        </tbody>
      </table>
      <p>
        Your light/dark theme choice is stored in your browser&rsquo;s local storage, not a cookie,
        and never leaves your device.
      </p>

      <h2>2. Cookies on the checkout page only</h2>
      <p>
        When you go to pay, our payment provider, Razorpay, loads its secure checkout and may set
        its own cookies to process the transaction and prevent fraud. These appear only on the
        checkout step, only when you choose to pay, and are governed by Razorpay&rsquo;s own privacy
        and cookie policies. We never receive or store your card or bank details.
      </p>

      <h2>3. Do you need to consent?</h2>
      <p>
        The cookies above are either strictly necessary (the site cannot work without them) or
        functional (they remember a choice you made). Under the New Zealand Privacy Act 2020 and
        India&rsquo;s Digital Personal Data Protection Act 2023, cookies like these — with no
        advertising or tracking — do not require prior opt-in consent. We show a short notice so you
        know they are used, and we disclose every one of them here.
      </p>

      <h2>4. How to control cookies</h2>
      <p>
        You can delete or block cookies in your browser settings at any time. If you block{" "}
        <code>kpp_session</code> you will not be able to stay signed in; the functional cookies can
        be cleared with no loss beyond forgetting your currency choice. Guidance for the major
        browsers is under their own Help &rarr; Privacy sections.
      </p>

      <h2>5. Changes</h2>
      <p>
        If the cookies we use change, we will update this page and the date above. Any question is
        welcome through the <Link href="/contact">contact form</Link>, and this policy sits
        alongside our <Link href="/privacy">Privacy Policy</Link>.
      </p>
    </LegalPage>
  );
}
