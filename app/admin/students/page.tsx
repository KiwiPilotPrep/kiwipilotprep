import Link from "next/link";

import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { listStudents } from "@/lib/admin/student-history";
import StudentList from "@/components/admin/StudentList";
import {
  grantProductAccess,
  grantCourseAccess,
  grantSubjectAccess,
  setUserStatus,
  markEmailVerified,
} from "@/app/admin/product-actions";

export const metadata = { title: "Students & Access — Admin" };

const PAGE = 50;

/**
 * Who is on the system, and what they can reach.
 *
 * The list is the page. It is there when the page opens, searching narrows
 * it and clearing the box brings it back — the search is an addition to the
 * listing, never a gate in front of it. It is paged rather than unbounded,
 * and both the paging and the search run in the database.
 *
 * `grant` opens the grant panel for one student without leaving the list,
 * so an admin can see who they are granting to while they do it.
 */
export default async function AdminStudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; grant?: string; skip?: string }>;
}) {
  await requireRole("ADMIN");
  const { q = "", grant, skip: skipParam } = await searchParams;
  const skip = Math.max(0, Number.parseInt(skipParam ?? "0", 10) || 0);

  const { rows, total, query } = await listStudents({ query: q, take: PAGE, skip });

  // The student the grant panel is open for. Looked up directly rather than
  // found in the current page of results, so opening it from page three, or
  // from a link in a support ticket, works.
  const target = grant
    ? await db.user.findFirst({
        where: { id: grant, role: "STUDENT" },
        select: { id: true, name: true, email: true, status: true, emailVerifiedAt: true },
      })
    : null;

  // The canonical catalogue. Published products only, one row each — these
  // are the same Product records checkout sells, so nothing here can be a
  // duplicate or an invention.
  const [products, courses, subjects] = await Promise.all([
    db.product.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { order: "asc" },
      select: { id: true, title: true, items: { select: { courseId: true, subjectId: true } } },
    }),
    db.course.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { order: "asc" },
      select: { id: true, title: true },
    }),
    db.subject.findMany({
      where: { status: "PUBLISHED", course: { status: "PUBLISHED" } },
      orderBy: [{ course: { order: "asc" } }, { order: "asc" }],
      select: { id: true, title: true, course: { select: { title: true } } },
    }),
  ]);

  // Packages grant more than one thing; single-subject products grant one.
  // Splitting them is what stops the six packages reading as duplicates of
  // the fifteen subject products in one long undifferentiated row of buttons.
  const packages = products.filter((p) => p.items.length !== 1 || p.items[0].courseId !== null);
  const singles = products.filter((p) => p.items.length === 1 && p.items[0].subjectId !== null);

  return (
    <>
      <div className="ahead">
        <div>
          <h1>Students &amp; Access</h1>
          <p>
            Access comes from entitlements — granted by a purchase, or by hand here; manual
            grants record who made them.
          </p>
        </div>
      </div>

      <StudentList
        rows={rows}
        total={total}
        query={query}
        skip={skip}
        take={PAGE}
        basePath="/admin/students"
        action={(s) => (
          <div className="acts" style={{ gap: "6px", flexWrap: "nowrap" }}>
            <Link className="btn btn-g btn-sm" href={`/admin/history/${s.id}`}>
              History
            </Link>
            <Link
              className={`btn btn-sm ${grant === s.id ? "btn-p" : "btn-g"}`}
              href={`/admin/students?${new URLSearchParams({
                ...(query ? { q: query } : {}),
                ...(skip ? { skip: String(skip) } : {}),
                grant: s.id,
              })}`}
            >
              Grant access
            </Link>
          </div>
        )}
      />

      {/* --------------------------------------------------- grant access */}
      {target && (
        <>
          <div className="panel mt-m">
            <div className="panel-hd">
              <h2>Grant access to {target.name}</h2>
              <span className="xs">{target.email}</span>
            </div>
            <div className="acts" style={{ padding: "14px 18px", gap: "8px", flexWrap: "wrap" }}>
              {!target.emailVerifiedAt && (
                <form action={markEmailVerified.bind(null, target.id)}>
                  <button className="btn btn-g btn-sm" type="submit">
                    Confirm email
                  </button>
                </form>
              )}
              <form
                action={setUserStatus.bind(
                  null,
                  target.id,
                  target.status === "DISABLED" ? "ACTIVE" : "DISABLED",
                )}
              >
                <button className="btn btn-g btn-sm" type="submit">
                  {target.status === "DISABLED" ? "Re-enable account" : "Disable account"}
                </button>
              </form>
              <Link className="btn btn-g btn-sm" href={`/admin/history/${target.id}`}>
                Open full history
              </Link>
            </div>
          </div>

          <div className="panel">
            <div className="panel-hd">
              <h2>Packages ({packages.length})</h2>
            </div>
            <div className="acts" style={{ padding: "14px 18px", gap: "8px", flexWrap: "wrap" }}>
              {packages.map((p) => (
                <form key={p.id} action={grantProductAccess.bind(null, target.id, p.id)}>
                  <button className="btn btn-g btn-sm" type="submit">
                    + {p.title}
                  </button>
                </form>
              ))}
            </div>
          </div>

          <div className="panel">
            <div className="panel-hd">
              <h2>Single subjects ({singles.length})</h2>
            </div>
            <div className="acts" style={{ padding: "14px 18px", gap: "8px", flexWrap: "wrap" }}>
              {singles.map((p) => (
                <form key={p.id} action={grantProductAccess.bind(null, target.id, p.id)}>
                  <button className="btn btn-g btn-sm" type="submit">
                    + {p.title}
                  </button>
                </form>
              ))}
            </div>
          </div>

          <div className="panel">
            <div className="panel-hd">
              <h2>Direct access, without a product</h2>
              <span className="xs">
                Entitlements are held against a course or a subject — there is no per-mock scope
              </span>
            </div>
            <div className="panel-bd">
              <p className="xs">
                A mock is sat on the strength of access to the course or subject it belongs to, so
                that is what is granted here. Granting a subject makes every mock scoped to that
                subject available; granting a course does the same for the whole course.
              </p>
            </div>
            <div className="acts" style={{ padding: "0 18px 16px", gap: "8px", flexWrap: "wrap" }}>
              {courses.map((c) => (
                <form key={c.id} action={grantCourseAccess.bind(null, target.id, c.id)}>
                  <button className="btn btn-g btn-sm" type="submit">
                    + Course: {c.title.replace(/^KiwiPilotPrep — /, "")}
                  </button>
                </form>
              ))}
              {subjects.map((s) => (
                <form key={s.id} action={grantSubjectAccess.bind(null, target.id, s.id)}>
                  <button className="btn btn-g btn-sm" type="submit">
                    + {s.course.title.replace(/^KiwiPilotPrep — /, "")} · {s.title}
                  </button>
                </form>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}
