import Link from "next/link";

import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { accessibleCourseIds } from "@/lib/entitlements";
import { sweepExpiredAttempts } from "@/lib/mock/engine";
import { courseProgress } from "@/lib/progress";

export const metadata = { title: "Dashboard — KiwiPilotPrep" };

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ denied?: string }>;
}) {
  const user = await requireUser();
  const { denied } = await searchParams;

  // Close any mock whose clock ran out while the student was away (§10).
  await sweepExpiredAttempts(user.id);

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

  // "Continue learning" — the last chapter this student opened.
  const pointer = await db.studentProgress.findUnique({ where: { userId: user.id } });
  const resume = pointer?.lastChapterId
    ? await db.chapter.findFirst({
        where: { id: pointer.lastChapterId, status: "PUBLISHED" },
        select: {
          title: true,
          slug: true,
          subject: {
            select: { title: true, slug: true, course: { select: { title: true, slug: true, id: true } } },
          },
        },
      })
    : null;

  const resumeProgress = resume
    ? await courseProgress(user.id, resume.subject.course.id)
    : null;

  /* ---------------------------------------------------------- study resume */

  // The Study Reader pointer takes precedence over the chapter pointer: it is
  // the newer surface and names the exact syllabus item, which is what a
  // student actually recognises ("12.2.4"), not a chapter slug.
  const studyResume = pointer?.lastSyllabusItemId
    ? await db.syllabusItem.findFirst({
        where: { id: pointer.lastSyllabusItemId, status: "PUBLISHED" },
        select: {
          code: true,
          requirement: true,
          topic: {
            select: {
              code: true,
              title: true,
              subject: {
                select: { title: true, slug: true, id: true, course: { select: { title: true, slug: true } } },
              },
            },
          },
        },
      })
    : null;

  const studySubjectProgress = studyResume
    ? await (async () => {
        const items = await db.syllabusItem.count({
          where: { status: "PUBLISHED", topic: { subjectId: studyResume.topic.subject.id, status: "PUBLISHED" } },
        });
        const done = await db.syllabusItemProgress.count({
          where: {
            userId: user.id,
            completedAt: { not: null },
            item: { topic: { subjectId: studyResume.topic.subject.id } },
          },
        });
        return { items, done, percent: items ? Math.round((done / items) * 100) : 0 };
      })()
    : null;

  /* ------------------------------------------------------ subject progress */

  // Per-subject completion across every course this student can reach, so the
  // dashboard answers "how far am I" per subject rather than only per course.
  const subjects = await db.subject.findMany({
    where: { status: "PUBLISHED", courseId: { in: courseIds } },
    orderBy: [{ course: { order: "asc" } }, { order: "asc" }],
    select: {
      id: true,
      slug: true,
      title: true,
      course: { select: { slug: true, title: true } },
      _count: { select: { syllabusTopics: { where: { status: "PUBLISHED" } } } },
    },
  });

  const subjectRows = await Promise.all(
    subjects.map(async (sub) => {
      const total = await db.syllabusItem.count({
        where: { status: "PUBLISHED", topic: { subjectId: sub.id, status: "PUBLISHED" } },
      });
      if (total === 0) return null;
      const done = await db.syllabusItemProgress.count({
        where: { userId: user.id, completedAt: { not: null }, item: { topic: { subjectId: sub.id } } },
      });
      return { ...sub, total, done, percent: Math.round((done / total) * 100) };
    }),
  );
  const withSyllabus = subjectRows.filter((r): r is NonNullable<typeof r> => r !== null);

  /* ------------------------------------------------------------ weak areas */

  // Real KDR data only. Where a student has sat no mocks there is nothing
  // meaningful to say, and inventing an analytics panel would be worse than
  // omitting one.
  const kdr = await db.kdrResult.groupBy({
    by: ["kdrCode", "kdrTopic"],
    where: { userId: user.id },
    _sum: { correct: true, attempted: true },
    orderBy: { _sum: { correct: "asc" } },
    take: 8,
  });

  const weakAreas = kdr
    .filter((k) => (k._sum?.attempted ?? 0) > 0)
    .map((k) => {
      const asked = k._sum?.attempted ?? 0;
      const right = k._sum?.correct ?? 0;
      const percent = Math.round((right / asked) * 100);
      return {
        code: k.kdrCode,
        topic: k.kdrTopic,
        asked,
        percent,
        // Bands, not invented labels: they describe the measured accuracy.
        band: percent >= 80 ? "strong" : percent >= 60 ? "improving" : "review",
      };
    })
    .sort((a, b) => a.percent - b.percent);

  /* --------------------------------------------------------- recent study */

  const recentStudy = await db.syllabusItemProgress.findMany({
    where: { userId: user.id, completedAt: { not: null } },
    orderBy: { completedAt: "desc" },
    take: 5,
    select: {
      completedAt: true,
      item: {
        select: {
          code: true,
          requirement: true,
          topic: {
            select: { subject: { select: { slug: true, title: true, course: { select: { slug: true } } } } },
          },
        },
      },
    },
  });

  // Mock exam summary (§17).
  const [liveAttempt, recentAttempts] = await Promise.all([
    db.mockAttempt.findFirst({
      where: { userId: user.id, status: "IN_PROGRESS" },
      orderBy: { startedAt: "desc" },
    }),
    db.mockAttempt.findMany({
      where: { userId: user.id, status: { not: "IN_PROGRESS" } },
      orderBy: { submittedAt: "desc" },
      take: 4,
    }),
  ]);
  const bestScore = recentAttempts.reduce((best, a) => Math.max(best, a.scorePercent), 0);

  return (
    <section className="sec">
      <div className="wrap">
        {denied && (
          <p className="fnote on warn" role="alert">
            That area is restricted to administrators.
          </p>
        )}

        <div className="sec-head r in">
          <div className="eyebrow">Dashboard</div>
          <h1 className="h2">
            {greeting()}, {user.name.split(" ")[0]}
          </h1>
          <p className="lede mt-s">Continue your preparation from where you left off.</p>
        </div>

        {/* ---------------------------------------------------------------
            CONTINUE STUDYING — the dominant element on the page.

            The Study Reader pointer wins when there is one: "12.2.4" is what a
            student recognises. The chapter pointer is the fallback for anyone
            who has not opened the reader yet.
            --------------------------------------------------------------- */}
        {studyResume && studySubjectProgress ? (
          <Link
            className="resume-card r in"
            href={`/study/${studyResume.topic.subject.course.slug}/${studyResume.topic.subject.slug}/${studyResume.code.replace(/\./g, "-")}`}
          >
            <div className="resume-body">
              <div className="resume-label">Continue studying</div>
              <div className="resume-course">
                {studyResume.topic.subject.course.title} · {studyResume.topic.subject.title}
              </div>
              <div className="resume-code">{studyResume.code}</div>
              <h2>{studyResume.requirement.split("\n")[0].replace(/[:;]$/, "")}</h2>
              <div className="resume-meter">
                <div className="bar">
                  <i style={{ width: `${studySubjectProgress.percent}%` }} />
                </div>
                <span className="num">
                  {studySubjectProgress.done}/{studySubjectProgress.items} ·{" "}
                  {studySubjectProgress.percent}%
                </span>
              </div>
            </div>
            <span className="resume-go">
              Continue
              <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h13M13 6l6 6-6 6" />
              </svg>
            </span>
          </Link>
        ) : resume && resumeProgress ? (
          <div className="resume r in mt-l">
            <div>
              <div className="eyebrow">Continue learning</div>
              <h2 className="h3">{resume.subject.course.title}</h2>
              <p className="small">
                {resume.subject.title} · Current chapter: <b>{resume.title}</b>
              </p>
              <div className="bar mt-s">
                <i style={{ width: `${resumeProgress.percent}%` }} />
              </div>
              <p className="xs" style={{ marginTop: "6px" }}>
                {resumeProgress.completed} of {resumeProgress.total} chapters ·{" "}
                {resumeProgress.percent}%
              </p>
            </div>
            <Link
              className="btn btn-p"
              href={`/courses/${resume.subject.course.slug}/subjects/${resume.subject.slug}/chapters/${resume.slug}`}
            >
              Continue Learning
            </Link>
          </div>
        ) : null}

        {liveAttempt && (
          <div className="resume r in mt-l">
            <div>
              <div className="eyebrow">Mock exam in progress</div>
              <h2 className="h3">{liveAttempt.examTitle}</h2>
              <p className="small">The timer is still running on this attempt.</p>
            </div>
            <Link className="btn btn-p" href={`/mocks/attempts/${liveAttempt.id}`}>
              Resume Exam
            </Link>
          </div>
        )}

        {/* Quick actions — only ones that lead somewhere real. */}
        <div className="quick-actions r in">
          {studyResume && (
            <Link
              className="quick-act"
              href={`/study/${studyResume.topic.subject.course.slug}/${studyResume.topic.subject.slug}`}
            >
              <span>Syllabus index</span>
              <small>Browse every requirement</small>
            </Link>
          )}
          <Link className="quick-act" href="/mocks">
            <span>Mock exams</span>
            <small>{recentAttempts.length > 0 ? `Best ${bestScore}%` : "Sit a timed paper"}</small>
          </Link>
          <Link className="quick-act" href="/progress">
            <span>My progress</span>
            <small>Chapters and practice</small>
          </Link>
          {weakAreas.length > 0 && (
            <Link className="quick-act" href="/progress">
              <span>Weak areas</span>
              <small>{weakAreas.filter((w) => w.band === "review").length} need review</small>
            </Link>
          )}
        </div>

        {/* ------------------------------------------------ subject progress */}
        {withSyllabus.length > 0 && (
          <>
            <div className="sec-head mt-l">
              <h2 className="h3">Where you are</h2>
            </div>
            <div className="subject-progress r in">
              {withSyllabus.map((sub) => (
                <Link
                  className="subject-row"
                  key={sub.id}
                  href={`/study/${sub.course.slug}/${sub.slug}`}
                >
                  <div className="subject-row-head">
                    <span className="subject-row-title">{sub.title}</span>
                    <span className="num">{sub.percent}%</span>
                  </div>
                  <div className="bar">
                    <i style={{ width: `${sub.percent}%` }} />
                  </div>
                  <span className="xs">
                    {sub.done} of {sub.total} syllabus items · {sub.course.title}
                  </span>
                </Link>
              ))}
            </div>
          </>
        )}

        {/* --------------------------------------------------- weak areas */}
        {weakAreas.length > 0 && (
          <>
            <div className="sec-head mt-l">
              <h2 className="h3">Areas to review</h2>
              <p className="xs">
                Measured from your mock exam results, by knowledge deficiency code.
              </p>
            </div>
            <div className="weak-grid r in">
              {weakAreas.slice(0, 6).map((w) => (
                <div className={`weak-item is-${w.band}`} key={`${w.code}-${w.topic}`}>
                  <div className="weak-head">
                    {w.code && <span className="num">{w.code}</span>}
                    <span className={`weak-band is-${w.band}`}>
                      {w.band === "review" ? "Needs review" : w.band === "improving" ? "Improving" : "Strong"}
                    </span>
                  </div>
                  <b>{w.topic ?? w.code ?? "Untitled area"}</b>
                  <span className="xs">
                    {w.percent}% across {w.asked} question{w.asked === 1 ? "" : "s"}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ------------------------------------------------ recent activity */}
        {recentStudy.length > 0 && (
          <>
            <div className="sec-head mt-l">
              <h2 className="h3">Recent activity</h2>
            </div>
            <ul className="activity r in">
              {recentStudy.map((r, i) => (
                <li key={i}>
                  <Link
                    href={`/study/${r.item.topic.subject.course.slug}/${r.item.topic.subject.slug}/${r.item.code.replace(/\./g, "-")}`}
                  >
                    <span className="activity-mark" aria-hidden="true">✓</span>
                    <span className="num">{r.item.code}</span>
                    <span className="activity-title">
                      {r.item.requirement.split("\n")[0].replace(/[:;]$/, "")}
                    </span>
                    <span className="xs">
                      {r.completedAt?.toLocaleDateString("en-NZ", { day: "numeric", month: "short" })}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}

        <div className="sec-head mt-l">
          <h2 className="h3">My courses</h2>
        </div>

        {withProgress.length === 0 ? (
          <div className="empty panel">
            <b>No course access yet</b>
            Your instructor or an administrator grants access to a course. Once they do, it
            appears here automatically.
          </div>
        ) : (
          <div className="g3 mt-m">
            {withProgress.map((c) => (
              <Link className="subj r in" key={c.id} href={`/courses/${c.slug}`}>
                <h3>{c.title}</h3>
                {c.description && <p>{c.description}</p>}
                <ul>
                  <li>
                    {c._count.subjects} {c._count.subjects === 1 ? "subject" : "subjects"}
                  </li>
                  <li>
                    {c.progress.completed}/{c.progress.total} chapters
                  </li>
                </ul>
                <div className="bar mt-s">
                  <i style={{ width: `${c.progress.percent}%` }} />
                </div>
                <span className="go">
                  {c.progress.percent}% complete · Continue
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
        <div className="sec-head mt-l">
          <h2 className="h3">Mock exams</h2>
        </div>

        {recentAttempts.length === 0 ? (
          <div className="empty panel">
            <b>No mock attempts yet</b>
            <Link className="btn btn-p btn-sm" href="/mocks">
              Sit a timed mock
            </Link>
          </div>
        ) : (
          <>
            <div className="tiles">
              <div className="tile">
                <div className="v">{recentAttempts[0].scorePercent}%</div>
                <div className="l">Latest score</div>
              </div>
              <div className="tile">
                <div className="v">{bestScore}%</div>
                <div className="l">Best score</div>
              </div>
              <div className="tile">
                <div className="v">{recentAttempts.length}</div>
                <div className="l">Recent attempts</div>
              </div>
            </div>

            <div className="panel">
              <table className="atable">
                <thead>
                  <tr>
                    <th>Mock</th>
                    <th>Subject</th>
                    <th>Date</th>
                    <th>Score</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {recentAttempts.map((a) => (
                    <tr key={a.id}>
                      <td className="nm">{a.examTitle}</td>
                      <td>{a.subjectTitle ?? "—"}</td>
                      <td className="xs">
                        {(a.submittedAt ?? a.startedAt).toLocaleDateString("en-NZ")}
                      </td>
                      <td className="num">
                        {a.scorePercent}%
                        {a.passed !== null && (
                          <span className={`pill-s ${a.passed ? "published" : "archived"}`} style={{ marginLeft: "8px" }}>
                            {a.passed ? "PASS" : "NOT YET"}
                          </span>
                        )}
                      </td>
                      <td>
                        <Link className="btn btn-g btn-sm" href={`/mocks/attempts/${a.id}`}>
                          Scorecard
                        </Link>{" "}
                        {/* A file, not a route, so a plain anchor. */}
                        <a className="btn btn-g btn-sm" href={`/mocks/attempts/${a.id}/report.pdf`}>
                          PDF
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="xs" style={{ marginTop: "14px" }}>
              <Link href="/mocks">Sit another mock →</Link>
            </p>
          </>
        )}
      </div>
    </section>
  );
}
