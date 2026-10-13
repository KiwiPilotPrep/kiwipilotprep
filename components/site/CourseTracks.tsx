import Link from "next/link";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { accessibleCourseIds } from "@/lib/entitlements";
import { count } from "@/lib/plural";

/**
 * Public course/subject grid, rendered straight from the database.
 *
 * Nothing here assumes "6 PPL subjects" — if an admin publishes a seventh,
 * it appears on the next request with no code change (§7, §11).
 */
/** A subject's real chapter count, whichever shape its material is in. */
function chapterCount(subject: { _count: { chapters: number; modules: number } }) {
  return subject._count.modules > 0 ? subject._count.modules : subject._count.chapters;
}

export default async function CourseTracks() {
  const user = await getCurrentUser();

  const [courses, products, reachable] = await Promise.all([
    db.course.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { order: "asc" },
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        accessMonths: true,
        subjects: {
          where: { status: "PUBLISHED" },
          orderBy: { order: "asc" },
          select: {
            id: true,
            slug: true,
            title: true,
            description: true,
            // Both shapes a subject's material can take. An imported study
            // manual is a module tree; a subject written in the CMS has
            // chapters. Counting only the second advertised "4 chapters" on
            // every subject, including twenty-chapter ones and empty ones.
            _count: {
              select: {
                chapters: { where: { status: "PUBLISHED" } },
                modules: { where: { status: "PUBLISHED", lessons: { some: { status: "PUBLISHED" } } } },
              },
            },
            chapters: {
              where: { status: "PUBLISHED" },
              orderBy: { order: "asc" },
              select: { id: true, title: true },
            },
          },
        },
      },
    }),
    db.product.findMany({
      where: { status: "PUBLISHED", items: { some: { courseId: { not: null } } } },
      orderBy: { order: "asc" },
      select: { slug: true, items: { select: { courseId: true } } },
    }),
    user ? accessibleCourseIds(user) : Promise.resolve([] as string[]),
  ]);

  const productOfCourse = new Map<string, string>();
  for (const p of products) {
    for (const item of p.items) {
      if (item.courseId && !productOfCourse.has(item.courseId)) {
        productOfCourse.set(item.courseId, p.slug);
      }
    }
  }
  const owned = new Set(reachable);

  /**
   * Where Explore Subject goes depends on whether the reader can open it.
   *
   * A student who owns the course gets the subject. Everyone else gets the
   * pricing card for the package that sells it, further down this same page --
   * not the separate pricing page, and not the course route, which for a
   * visitor is a login wall and for an unentitled student was a dead end.
   */
  function subjectHref(courseId: string, courseSlug: string, subjectSlug: string) {
    if (user && owned.has(courseId)) return `/courses/${courseSlug}/subjects/${subjectSlug}`;
    return `/#${productOfCourse.get(courseId) ?? "pricing"}`;
  }

  return (
    <section className="sec" id="courses">
      <div className="wrap">
        <div className="sec-head center r in">
          <div className="eyebrow">Courses</div>
          <h2 className="h2">Every theory subject, plus your flight test groundwork.</h2>
          <p className="lede">
            Structured study material, exam-style practice and a full mock exam for every subject.
          </p>
        </div>

        {courses.length === 0 ? (
          <div className="prob-note mt-l">
            <p>
              No courses have been published yet. Once an administrator publishes a course in the
              admin console it will appear here automatically.
            </p>
          </div>
        ) : (
          courses.map((course) => (
            <div className="mt-l" key={course.id}>
              <div className="course-hd">
                <div className="t">
                  <span className="badge">{course.slug.slice(0, 3).toUpperCase()}</span>
                  <div>
                    <h3 className="h3">{course.title}</h3>
                    {course.description && <p className="small">{course.description}</p>}
                  </div>
                </div>
                <span className="xs num">
                  {count(course.subjects.length, "subject")} &middot;{" "}
                  {count(course.accessMonths, "month")} access
                </span>
              </div>

              {course.subjects.length === 0 ? (
                <p className="xs">No subjects published in this course yet.</p>
              ) : (
                <div className="g3">
                  {course.subjects.map((subject) => (
                    <Link
                      className="subj r in"
                      key={subject.id}
                      href={subjectHref(course.id, course.slug, subject.slug)}
                    >
                      <span className="ic">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          strokeWidth="1.7"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M6 3.5h9l4 4v13H6z" />
                          <path d="M14.5 3.5V8H19M9 12h6M9 16h4" />
                        </svg>
                      </span>
                      <h3>{subject.title}</h3>
                      {subject.description && <p>{subject.description}</p>}
                      {/* A track with one subject — the flight test groundwork —
                          lists its sections instead of a bare chapter count, so
                          the eight prescribed items are visible on the card. */}
                      {course.subjects.length === 1 &&
                      subject._count.modules === 0 &&
                      subject.chapters.length > 1 ? (
                        <ul className="sections">
                          {subject.chapters.map((ch) => (
                            <li key={ch.id}>{ch.title}</li>
                          ))}
                        </ul>
                      ) : (
                        <ul>
                          <li>
                            {chapterCount(subject)}{" "}
                            {chapterCount(subject) === 1 ? "chapter" : "chapters"}
                          </li>
                          <li>Mock Exam</li>
                        </ul>
                      )}
                      <span className="go">
                        Explore Subject
                        <svg
                          viewBox="0 0 24 24"
                          width="16"
                          height="16"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M5 12h13M13 6l6 6-6 6" />
                        </svg>
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </section>
  );
}
