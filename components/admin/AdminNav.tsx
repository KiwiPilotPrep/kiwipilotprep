"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = { href: string; label: string; exact?: boolean };

const GROUPS: Array<{ label: string; items: NavItem[] }> = [
  {
    label: "Overview",
    items: [{ href: "/admin", label: "Dashboard", exact: true }],
  },
  // Courses, Syllabus & Study and Syllabus Coverage are gone from here on
  // purpose. The curriculum is built from `content/` by the build scripts and
  // reviewed in code; an admin screen that lets it be edited by hand is a
  // second source of truth for material that already has one. The data and
  // every student-facing page that reads it are untouched.
  {
    label: "Examinations",
    items: [
      // One Mock Management area, two tabs. Question authoring lives inside
      // it rather than as its own section: the questions a mock draws on are
      // the questions, and the free trial draws on the same bank.
      { href: "/admin/mocks", label: "Mock Management" },
      { href: "/admin/attempts", label: "Attempts & Results" },
    ],
  },
  {
    label: "Commerce",
    items: [
      { href: "/admin/products", label: "Products" },
      { href: "/admin/orders", label: "Orders & Payments" },
      { href: "/admin/coupons", label: "Coupons" },
    ],
  },
  {
    label: "Support",
    items: [
      { href: "/admin/claims", label: "Guarantee Claims" },
      { href: "/admin/queries", label: "General Queries" },
    ],
  },
  {
    label: "People",
    items: [
      { href: "/admin/students", label: "Students & Access" },
      { href: "/admin/history", label: "Student History" },
      { href: "/admin/organizations", label: "Flight Schools" },
    ],
  },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="snav">
      {GROUPS.map((group) => (
        <div key={group.label}>
          <p className="snav-h">{group.label}</p>
          {group.items.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`snav-i${active ? " on" : ""}`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
