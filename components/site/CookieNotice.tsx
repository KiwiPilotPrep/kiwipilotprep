"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/**
 * A short cookie notice.
 *
 * Not a consent gate: the site sets only strictly-necessary and functional
 * cookies (no advertising, no cross-site tracking, no third-party analytics),
 * which do not require prior opt-in under the NZ Privacy Act or India's DPDP
 * Act. So this informs and links to the full policy rather than blocking the
 * page behind an accept/reject wall. Dismissal is remembered locally so it
 * shows once.
 */
const KEY = "kpp_cookie_notice";

export default function CookieNotice() {
  // Start hidden; only reveal after we've checked storage, so a returning
  // visitor never sees a flash of the bar.
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Reading localStorage — a browser-only API React cannot see — on mount,
    // then revealing. It must not run during SSR (no storage there) or a
    // hydration mismatch and a flash of the bar would follow, so it lives in an
    // effect rather than an initialiser.
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (localStorage.getItem(KEY) !== "seen") setShow(true);
    } catch {
      // Storage blocked (private mode): show it, dismissal just won't persist.
      setShow(true);
    }
  }, []);

  const dismiss = () => {
    try {
      localStorage.setItem(KEY, "seen");
    } catch {
      /* ignore */
    }
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="cookie-notice" role="region" aria-label="Cookie notice">
      <p>
        We use a few essential and preference cookies to keep you signed in and remember your
        currency. No advertising or tracking cookies.{" "}
        <Link href="/cookies">Read our cookie policy</Link>.
      </p>
      <button type="button" className="btn btn-p btn-sm" onClick={dismiss}>
        Got it
      </button>
    </div>
  );
}
