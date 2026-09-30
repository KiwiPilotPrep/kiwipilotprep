import Link from "next/link";
import type { User } from "@prisma/client";

import ThemeToggle from "@/components/ThemeToggle";
import SubjectsMenu from "./SubjectsMenu";
import MobileNav from "./MobileNav";

type Track = {
  id: string;
  slug: string;
  title: string;
  subjectCount: number;
  /** Whether the course has any material yet. */
  ready: boolean;
};

/**
 * Marketing header, migrated from Phase 1. The Subjects menu is fed from the
 * database rather than a hardcoded list, so a course added in the admin shows
 * up here with no code change (§11).
 */
export default function Header({
  user,
  tracks,
}: {
  user: User | null;
  tracks: Track[];
}) {
  return (
    <>
      <header className="hdr" id="hdr">
        <div className="wrap-w hdr-in">
          <Link className="brand" href="/">
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
              <span className="bs">Pilot Theory Prep</span>
            </span>
          </Link>

          <nav className="nav">
            <SubjectsMenu tracks={tracks} />
            <Link href="/#guarantee">Guarantee</Link>
            <Link href="/flight-schools">Flight Schools</Link>
            <Link href="/#pricing">Pricing</Link>
            <Link href="/contact">Contact</Link>
          </nav>

          <div className="hdr-cta">
            <ThemeToggle />
            {user ? (
              <>
                <Link className="login" href="/dashboard">
                  Dashboard
                </Link>
                {user.role === "ADMIN" && (
                  <Link className="btn btn-g btn-sm" href="/admin">
                    Admin
                  </Link>
                )}
                <form action="/api/auth/logout" method="post">
                  <button className="btn btn-p btn-sm" type="submit">
                    Log Out
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link className="login" href="/login">
                  Log In
                </Link>
                <Link className="btn btn-p btn-sm" href="/signup">
                  Start Free Trial
                </Link>
              </>
            )}
          </div>

          <MobileNav user={user} tracks={tracks} />
        </div>
      </header>
    </>
  );
}
