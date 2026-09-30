import Link from "next/link";

import { requireUser } from "@/lib/auth";
import ThemeToggle from "@/components/ThemeToggle";
import StudentNav from "@/components/student/StudentNav";
import SiteEffects from "@/components/site/SiteEffects";

/** Every /dashboard, /courses and /progress route is gated here, server-side. */
export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  return (
    <>
      <a className="skip-link" href="#top">Skip to main content</a>
      <SiteEffects />

      <header className="hdr" id="hdr">
        <div className="wrap-w hdr-in">
          <Link className="brand" href="/dashboard">
            <span className="mark">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--on-accent)"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2 L14.2 9.4 L22 12 L14.2 14.6 L12 22 L9.8 14.6 L2 12 L9.8 9.4 Z" />
              </svg>
            </span>
            <span>
              <span className="bn">KiwiPilotPrep</span>
              <span className="bs">Student</span>
            </span>
          </Link>

          <StudentNav isAdmin={user.role === "ADMIN"} />

          <div className="hdr-cta">
            {/* Back to the public site. Relative on purpose: it resolves to
                the homepage of whatever origin the student is already on, so
                it is the production site in production and can never be a
                hardcoded localhost. */}
            <Link className="btn btn-g btn-sm back-to-site" href="/">
              <svg
                viewBox="0 0 24 24"
                width="15"
                height="15"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M19 12H6M11 6l-6 6 6 6" />
              </svg>
              <span>Back to Website</span>
            </Link>
            <ThemeToggle />
            <form action="/api/auth/logout" method="post">
              <button className="btn btn-g btn-sm" type="submit">
                Log Out
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Present until the address is confirmed, and honest about what it
          actually costs them — a vague "please verify" gets ignored. */}
      {!user.emailVerifiedAt && (
        <div className="verify-bar" role="status">
          <div className="wrap">
            <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" strokeWidth="1.8"
              strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="5.5" width="18" height="13" rx="2.5" />
              <path d="M3.6 7l8.4 6 8.4-6" />
            </svg>
            <p>
              Confirm <b>{user.email}</b> to unlock free practice questions and checkout.
            </p>
            <Link className="btn btn-g btn-sm" href="/verify/sent">
              Resend link
            </Link>
          </div>
        </div>
      )}

      <main id="top" tabIndex={-1}>{children}</main>
    </>
  );
}
