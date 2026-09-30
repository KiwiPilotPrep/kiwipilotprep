import Link from "next/link";
import { notFound } from "next/navigation";

import { db } from "@/lib/db";
import { sectionLabel } from "@/lib/report/section";
import { requireUser } from "@/lib/auth";
import { requireMembership, requireOrgStudent, OrgError } from "@/lib/org/access";
import { courseProgress, subjectProgress } from "@/lib/progress";

export const metadata = { title: "Student — KiwiPilotPrep" };

/**
 * One student's academic record (§21).
 *
 * Deliberately academic only: no password data, no payment details, and no
 * guarantee or refund information. requireOrgStudent confirms the student
 * belongs to THIS organisation before anything is read, which is what stops an
 * instructor pulling another school's student by id.
 */
export default async function OrgStudentPage({
  params,
}: {
  params: Promise<{ organizationId: string; studentId: string }>;
}) {
  const user = await requireUser();
  const { organizationId, studentId } = await params;

  let membership, link;
  try {
    membership = await requireMembership(user, organizationId, "students:read");
    link = await requireOrgStudent(organizationId, studentId);
  } catch (error) {
    if (error instanceof OrgError) notFound();
    throw error;
  }

  const entitlements = await db.entitlement.findMany({
    where: { userId: studentId, status: "ACTIVE" },
    include: {
      course: { select: { id: true, title: true, slug: true } },
      subject: { select: { id: true, title: true, courseId: true } },
    },
  });

  const courseIds = [...new Set(entitlements.map((e) => e.courseId ?? e.subject?.courseId).filter(Boolean))] as string[];

  const courses = await db.course.findMany({
    where: { id: { in: courseIds } },
    include: { subjects: { where: { status: "PUBLISHED" }, orderBy: { order: "asc" } } },
  });

  const courseStats = await Promise.all(
    courses.map(async (c) => ({
      ...c,
      overall: await courseProgress(studentId, c.id),
      subjects: await Promise.all(
        c.subjects.map(async (s) => ({ ...s, stats: await subjectProgress(studentId, s.id) })),
      ),
    })),
  );

  const [attempts, kdr, practice] = await Promise.all([
    db.mockAttempt.findMany({
      where: { userId: studentId, status: { not: "IN_PROGRESS" } },
      orderBy: { submittedAt: "desc" },
      take: 20,
    }),
    db.kdrResult.groupBy({
      by: ["kdrCode", "kdrTopic"],
      where: { userId: studentId, kdrCode: { not: null } },
      _avg: { accuracy: true },
      _sum: { attempted: true, correct: true },
      orderBy: { _avg: { accuracy: "asc" } },
      take: 10,
    }),
    db.questionAttempt.aggregate({
      where: { userId: studentId },
      _count: { _all: true },
    }),
  ]);

  const correctPractice = await db.questionAttempt.count({
    where: { userId: studentId, isCorrect: true },
  });

  const best = attempts.reduce((n, a) => Math.max(n, a.scorePercent), 0);

  return (
    <section className="sec">
      <div className="wrap">
        <div className="sec-head r in">
          <div className="eyebrow">
            <Link href={`/org/${organizationId}/students`}>{membership.organizationName}</Link>
          </div>
          <h1 className="h2">{link.user.name}</h1>
          <p className="lede mt-s">
            {link.user.email} · enrolled {link.assignedAt.toLocaleDateString("en-NZ")} ·{" "}
            {link.status}
          </p>
        </div>

        <div className="tiles mt-l">
          <div className="tile"><div className="v">{attempts.length}</div><div className="l">Mock attempts</div></div>
          <div className="tile"><div className="v">{best}%</div><div className="l">Best mock score</div></div>
          <div className="tile"><div className="v">{practice._count._all}</div><div className="l">Practice answers</div></div>
          <div className="tile">
            <div className="v">{practice._count._all ? Math.round((correctPractice / practice._count._all) * 100) : 0}%</div>
            <div className="l">Practice accuracy</div>
          </div>
        </div>

        {courseStats.map((c) => (
          <div className="panel" key={c.id}>
            <div className="panel-hd">
              <h2>{c.title}</h2>
              <span className="xs num">{c.overall.completed}/{c.overall.total} chapters · {c.overall.percent}%</span>
            </div>
            <table className="atable">
              <thead><tr><th>Subject</th><th>Chapters complete</th><th>Progress</th></tr></thead>
              <tbody>
                {c.subjects.map((s) => (
                  <tr key={s.id}>
                    <td className="nm">{s.title}</td>
                    <td className="num">{s.stats.completed}/{s.stats.total}</td>
                    <td className="num">{s.stats.percent}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}

        <div className="panel">
          <div className="panel-hd"><h2>Mock history</h2></div>
          {attempts.length === 0 ? (
            <div className="empty">This student has not sat a mock yet.</div>
          ) : (
            <table className="atable">
              <thead><tr><th>Mock</th><th>Date</th><th>Score</th><th>Result</th></tr></thead>
              <tbody>
                {attempts.map((a) => (
                  <tr key={a.id}>
                    <td className="nm">{a.examTitle}</td>
                    <td className="xs">{(a.submittedAt ?? a.startedAt).toLocaleDateString("en-NZ")}</td>
                    <td className="num">{a.correctCount}/{a.totalQuestions} ({a.scorePercent}%)</td>
                    <td>{a.passed === null ? "—" : a.passed ? "PASS" : "NOT YET"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="panel">
          <div className="panel-hd">
            <h2>KDR performance</h2>
            <span className="xs">Weakest areas first</span>
          </div>
          {kdr.length === 0 ? (
            <div className="empty">No KDR data yet.</div>
          ) : (
            <table className="atable">
              <thead><tr><th>Reference</th><th>Seen</th><th>Correct</th><th>Accuracy</th></tr></thead>
              <tbody>
                {kdr.map((k) => (
                  <tr key={`${k.kdrCode}::${k.kdrTopic}`}>
                    <td className="nm">{sectionLabel(k.kdrCode, k.kdrTopic)}</td>
                    <td>{k._sum.attempted ?? 0}</td>
                    <td>{k._sum.correct ?? 0}</td>
                    <td className="num">{Math.round(k._avg.accuracy ?? 0)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <p className="xs" style={{ marginTop: "20px" }}>
          Academic information only. Payment, guarantee and account details are not shown here.
        </p>
      </div>
    </section>
  );
}
