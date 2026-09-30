import Link from "next/link";

/**
 * The three parts of Mock Management.
 *
 * Deliberately not three sidebar entries: paid mocks, the free trial and the
 * question bank are one area because they are one set of questions seen
 * three ways. The tabs answer the only question an admin actually has — am
 * I building a paid exam, tending the free sample, or writing questions?
 */
const TABS = [
  {
    href: "/admin/mocks",
    label: "Mocks",
    // /admin/mocks itself, and /admin/mocks/<examId> — but not the two
    // sibling tabs, which own their own subtrees.
    match: (p: string) =>
      p === "/admin/mocks" ||
      (/^\/admin\/mocks\/[^/]+$/.test(p) &&
        !p.startsWith("/admin/mocks/free-trial") &&
        !p.startsWith("/admin/mocks/questions")),
  },
  {
    href: "/admin/mocks/free-trial",
    label: "Free trial",
    match: (p: string) => p.startsWith("/admin/mocks/free-trial"),
  },
  {
    href: "/admin/mocks/questions",
    label: "Question Bank",
    match: (p: string) => p.startsWith("/admin/mocks/questions"),
  },
];

export default function MockTabs({ current }: { current: string }) {
  return (
    <div className="acts" style={{ gap: "8px", margin: "0 0 18px" }}>
      {TABS.map((t) => (
        <Link
          key={t.href}
          href={t.href}
          className={`btn btn-sm ${t.match(current) ? "btn-p" : "btn-g"}`}
        >
          {t.label}
        </Link>
      ))}
    </div>
  );
}
