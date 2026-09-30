import Link from "next/link";
import { notFound } from "next/navigation";

import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { canAccessCourse, accessibleSubjectIds } from "@/lib/entitlements";
import {
  courseProgress,
  subjectProgress,
  practiceProgress,
  subjectSize,
  countLabel,
} from "@/lib/progress";

export default async function CoursePage({
  params,
}: {
  params: Promise<{ courseSlug: string }>;
}) {
  const user = await requireUser();
  const { courseSlug } = await params;

  const course = await db.course.findFirst({
    where: { slug: courseSlug, status: "PUBLISHED" },
    include: {
      subjects: {
        where: { status: "PUBLISHED" },
        orderBy: { order: "asc" },
      },
    },
  });
  if (!course) notFound();

  // Server-side entitlement check — not a hidden link (§25).
  if (!(await canAccessCourse(user, course.id))) {
    return (
      <section className="sec">
        <div className="wrap">
          <div className="empty panel">
            <b>You do not have access to this course</b>
            This course is not part of your current access. Browse the{" "}
            <Link href="/pricing">available packages</Link> or{" "}
            <Link href="/contact">get in touch</Link>.
          </div>
        </div>
      </section>
    );
  }

  const overall = await courseProgress(user.id, course.id);
  const unlocked = await accessibleSubjectIds(user, course.id);

  // Which published product would unlock this course, for the locked-state CTA.
  const unlockingProduct = await db.product.findFirst({
    where: {
      status: "PUBLISHED",
      items: { some: { courseId: course.id } },
    },
    orderBy: { order: "asc" },
    select: { title: true, slug: true },
  });

  const subjects = await Promise.all(
    course.subjects.map(async (s) => ({
      ...s,
      locked: unlocked !== "all" && !unlocked.has(s.id),
      // The real shape of the subject, not the placeholder chapters the seed
      // attaches to every one of them.
      size: await subjectSize(s.id),
      study: await subjectProgress(user.id, s.id),
      practice: await practiceProgress(user.id, s.id),
      syllabusItems: await db.syllabusItem.count({
        where: { status: "PUBLISHED", topic: { subjectId: s.id, status: "PUBLISHED" } },
      }),
    })),
  );

  return (
    <section className="sec">
      <div className="wrap">
        <div className="sec-head r in">
          <div className="eyebrow">Course</div>
          <h1 className="h2">{course.title}</h1>
          {course.description && <p className="lede mt-s">{course.description}</p>}

          <div className="bar mt-m" style={{ maxWidth: "420px" }}>
            <i style={{ width: `${overall.percent}%` }} />
          </div>
          <p className="xs" style={{ marginTop: "8px" }}>
            {overall.completed} of {countLabel(overall.total, overall.unit)} complete ·{" "}
            {overall.percent}%
          </p>
        </div>

        {subjects.length === 0 ? (
          <div className="empty panel mt-l">
            <b>No subjects published yet</b>
            Subjects appear here as soon as an administrator publishes them.
          </div>
        ) : (
          <div className="g3 mt-l">
            {subjects.map((s) =>
              s.locked ? (
                /* Locked: the material is never fetched, let alone sent and hidden. */
                <div className="subj locked r in" key={s.id}>
                  <span className="lockmark" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" />
                      <path d="M8 10.5V7.8a4 4 0 0 1 8 0v2.7" />
                    </svg>
                  </span>
                  <h3>{s.title}</h3>
                  <p>
                    This subject is part of{" "}
                    {unlockingProduct ? unlockingProduct.title : `the ${course.title} package`}.
                  </p>
                  <div className="acts" style={{ marginTop: "14px" }}>
                    <Link className="btn btn-p btn-sm" href="/pricing">
                      View Package
                    </Link>
                    {/* One free experience, chosen from one place. */}
                    <Link className="btn btn-g btn-sm" href="/trial">
                      Try a free 10-question mock
                    </Link>
                  </div>
                </div>
              ) : (
                <Link
                  className="subj r in"
                  key={s.id}
                  href={`/courses/${course.slug}/subjects/${s.slug}`}
                >
                  <h3>{s.title}</h3>
                  {s.description && <p>{s.description}</p>}
                  <ul>
                    <li>{countLabel(s.size.chapters, "chapter")}</li>
                    {s.size.topics > 0 && <li>{countLabel(s.size.topics, "topic")}</li>}
                    <li>
                      {s.study.completed}/{s.study.total} completed
                    </li>
                    {s.practice.total > 0 && <li>{s.practice.percent}% practice</li>}
                    {s.syllabusItems > 0 && <li>{s.syllabusItems} syllabus items</li>}
                  </ul>
                  <div className="bar mt-s">
                    <i style={{ width: `${s.study.percent}%` }} />
                  </div>
                  <span className="go">
                    {s.study.percent}% study progress · Continue
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
              ),
            )}
          </div>
        )}
      </div>
    </section>
  );
}
