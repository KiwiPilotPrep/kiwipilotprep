import Link from "next/link";

import { requireAdmin } from "@/lib/auth";
import ThemeToggle from "@/components/ThemeToggle";
import AdminNav from "@/components/admin/AdminNav";

export const metadata = { title: "Admin — KiwiPilotPrep" };

/**
 * Every /admin route passes through requireAdmin(), so authorization is
 * enforced by the server before any admin markup is produced.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();

  return (
    <div className="admin-shell">
      <a className="skip-link" href="#top">Skip to main content</a>
      <aside className="side">
        <Link className="brand" href="/admin">
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
            <span className="bs">Admin Console</span>
          </span>
        </Link>

        <AdminNav />

        <div className="side-ft">
          <Link className="side-link" href="/" target="_blank">
            View student site ↗
          </Link>
          <form action="/api/auth/logout" method="post">
            <button className="side-link" type="submit">
              Log out ({admin.name.split(" ")[0]})
            </button>
          </form>
        </div>
      </aside>

      <main className="admin-main" id="top" tabIndex={-1}>
        <div className="admin-topbar">
          <ThemeToggle />
        </div>
        {children}
      </main>
    </div>
  );
}
