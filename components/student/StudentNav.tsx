"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/courses", label: "My Courses" },
  { href: "/mocks", label: "Mock Exams" },
  { href: "/progress", label: "Progress" },
  { href: "/guarantee", label: "Guarantee" },
  { href: "/profile", label: "Profile" },
];

export default function StudentNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();

  return (
    <nav className="nav">
      {LINKS.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          style={
            pathname === l.href || pathname.startsWith(`${l.href}/`)
              ? { color: "var(--ink)", background: "color-mix(in srgb, var(--ink) 8%, transparent)" }
              : undefined
          }
        >
          {l.label}
        </Link>
      ))}
      {isAdmin && <Link href="/admin">Admin</Link>}
    </nav>
  );
}
