import Link from "next/link";

import { requireUser } from "@/lib/auth";
import ThemeToggle from "@/components/ThemeToggle";
import SiteEffects from "@/components/site/SiteEffects";

/** Flight school portal shell. Membership is checked per organisation page. */
export default async function OrgLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  return (
    <>
      <a className="skip-link" href="#top">Skip to main content</a>
      <SiteEffects />
      <header className="hdr" id="hdr">
        <div className="wrap-w hdr-in">
          <Link className="brand" href="/org">
            <span className="mark">
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--on-accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2 L14.2 9.4 L22 12 L14.2 14.6 L12 22 L9.8 14.6 L2 12 L9.8 9.4 Z" />
              </svg>
            </span>
            <span>
              <span className="bn">KiwiPilotPrep</span>
              <span className="bs">Flight School</span>
            </span>
          </Link>

          <nav className="nav">
            <Link href="/org">Organisations</Link>
            <Link href="/dashboard">My learning</Link>
          </nav>

          <div className="hdr-cta">
            <ThemeToggle />
            <span className="xs">{user.name}</span>
            <form action="/api/auth/logout" method="post">
              <button className="btn btn-g btn-sm" type="submit">Log Out</button>
            </form>
          </div>
        </div>
      </header>

      <main id="top" tabIndex={-1}>{children}</main>
    </>
  );
}
