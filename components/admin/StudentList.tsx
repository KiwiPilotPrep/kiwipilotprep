import Link from "next/link";

import type { StudentListRow } from "@/lib/admin/student-history";

/**
 * The student list, with a search box above it.
 *
 * Used by Students & Access and by Student History, because both are asking
 * "which student?" and there is no reason for them to answer it differently.
 *
 * The list is shown by default. Searching narrows it; clearing the box
 * restores it. The search is a plain GET form so it survives a reload, can
 * be linked to, and works before any JavaScript has run — which matters on
 * a page an admin may open from a support ticket.
 */
export default function StudentList({
  rows,
  total,
  query,
  skip,
  take,
  basePath,
  /** Extra column rendered at the end of each row. */
  action,
  /** Kept in the search form so a mode or filter is not lost on submit. */
  hidden = {},
}: {
  rows: StudentListRow[];
  total: number;
  query: string;
  skip: number;
  take: number;
  basePath: string;
  action?: (student: StudentListRow) => React.ReactNode;
  hidden?: Record<string, string>;
}) {
  const pageHref = (nextSkip: number) => {
    const p = new URLSearchParams(hidden);
    if (query) p.set("q", query);
    if (nextSkip > 0) p.set("skip", String(nextSkip));
    const qs = p.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  const from = total === 0 ? 0 : skip + 1;
  const to = Math.min(skip + rows.length, total);

  return (
    <>
      <div className="panel">
        <div className="panel-hd">
          <h2>Find a student</h2>
          <span className="xs">Name or email · partial matches count</span>
        </div>
        <form className="asearch">
          {Object.entries(hidden).map(([k, v]) => (
            <input key={k} type="hidden" name={k} value={v} />
          ))}
          <div className="afield">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3.6-3.6" />
            </svg>
            <input
              name="q"
              type="search"
              defaultValue={query}
              placeholder="Search by name or email"
              aria-label="Search students by name or email"
              autoComplete="off"
            />
          </div>
          <button className="btn btn-p btn-sm" type="submit">
            Search
          </button>
          {query && (
            <Link className="btn btn-g btn-sm" href={basePath}>
              Clear search
            </Link>
          )}
        </form>
      </div>

      <div className="panel mt-m">
        <div className="panel-hd">
          <h2>
            {query ? (
              <>
                {total} match{total === 1 ? "" : "es"} for &ldquo;{query}&rdquo;
              </>
            ) : (
              <>
                {total} student{total === 1 ? "" : "s"}
              </>
            )}
          </h2>
          {total > rows.length && (
            <span className="xs">
              showing {from}–{to}
            </span>
          )}
        </div>

        {rows.length === 0 ? (
          <div className="empty">
            <b>{query ? "No student matches that" : "No students yet"}</b>
            {query
              ? "Try part of a name, or part of an email address."
              : "Nobody has signed up on this system."}
          </div>
        ) : (
          <table className="atable">
            <thead>
              <tr>
                <th>Student</th>
                <th>Joined</th>
                <th>Orders</th>
                <th>Access</th>
                <th>Mocks</th>
                <th>Status</th>
                {action && <th />}
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => (
                <tr key={s.id}>
                  <td>
                    <Link className="nm" href={`/admin/history/${s.id}`}>
                      {s.name}
                    </Link>
                    <div className="xs">{s.email}</div>
                  </td>
                  <td className="xs" style={{ whiteSpace: "nowrap" }}>
                    {s.createdAt.toLocaleDateString("en-NZ")}
                  </td>
                  <td className="num">{s._count.orders}</td>
                  <td className="num">{s._count.entitlements}</td>
                  <td className="num">{s._count.mockAttempts}</td>
                  <td>
                    {s.status === "DISABLED" ? (
                      <span className="pill-s archived">Disabled</span>
                    ) : !s.emailVerifiedAt ? (
                      <span className="pill-s draft">Unconfirmed</span>
                    ) : (
                      <span className="pill-s published">Active</span>
                    )}
                  </td>
                  {action && <td>{action(s)}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {(skip > 0 || to < total) && (
          <div className="acts" style={{ padding: "12px 18px", gap: "8px" }}>
            {skip > 0 && (
              <Link className="btn btn-g btn-sm" href={pageHref(Math.max(0, skip - take))}>
                Previous
              </Link>
            )}
            {to < total && (
              <Link className="btn btn-g btn-sm" href={pageHref(skip + take)}>
                Next
              </Link>
            )}
          </div>
        )}
      </div>
    </>
  );
}
