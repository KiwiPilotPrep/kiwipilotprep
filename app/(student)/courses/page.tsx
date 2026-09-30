import Link from "next/link";

import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { accessibleCourseIds } from "@/lib/entitlements";
import { courseProgress } from "@/lib/progress";

export const metadata = { title: "My Courses — KiwiPilotPrep" };

/**
 * The student's courses.
 *
 * Both states end at the same place. A student with courses is offered
 * another; a student with none is offered a first one. Neither is a dead
 * end, and neither rebuilds the shop: buying happens on the public pricing
 * page, which is the one place that knows about products, currencies,
 * coupons and checkout.
 */
export default async function MyCoursesPage() {
  const user = await requireUser();
  const courseIds = await accessibleCourseIds(user);

  const courses = await db.course.findMany({
    where: { id: { in: courseIds }, status: "PUBLISHED" },
    orderBy: { order: "asc" },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      _count: { select: { subjects: { where: { status: "PUBLISHED" } } } },
    },
  });

  const withProgress = await Promise.all(
    courses.map(async (c) => ({ ...c, progress: await courseProgress(user.id, c.id) })),
  );

  return (
    <section className="sec">
      <div className="wrap">
        <div className="sec-head r in">
          <div className="eyebrow">My Courses</div>
          <h1 className="h2">Your courses</h1>
        </div>

        {withProgress.length === 0 ? (
          <div className="panel mt-l">
            <div className="empty">
              <b>No course access yet</b>
              Course material unlocks with a package. Every theory subject also has a free
              10-question mock you can sit right now.
            </div>
            <div
              className="acts"
              style={{ padding: "0 18px 20px", gap: "10px", flexWrap: "wrap" }}
            >
              {/* Relative, so it lands on the public site of whatever origin
                  the student is already on. */}
              <Link className="btn btn-p" href="/pricing">
                Explore courses
              </Link>
              <Link className="btn btn-g" href="/trial">
                Sit a free 10-question mock
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="g3 mt-l">
              {withProgress.map((c) => (
                <Link className="subj r in" key={c.id} href={`/courses/${c.slug}`}>
                  <h3>{c.title}</h3>
                  {c.description && <p>{c.description}</p>}
                  <ul>
                    <li>
                      {c._count.subjects} {c._count.subjects === 1 ? "subject" : "subjects"}
                    </li>
                  </ul>
                  <div className="bar mt-s">
                    <i style={{ width: `${c.progress.percent}%` }} />
                  </div>
                  <span className="go">{c.progress.percent}% complete</span>
                </Link>
              ))}
            </div>

            <div className="cnote info" style={{ marginTop: "26px" }}>
              <b>Add another course</b>
              <p>
                PPL, CPL and IR theory and flight test groundwork are sold separately. See what is
                included and what each costs on the pricing page.
              </p>
              <Link className="btn btn-p btn-sm" href="/pricing" style={{ marginTop: "10px" }}>
                Explore &amp; purchase courses
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
