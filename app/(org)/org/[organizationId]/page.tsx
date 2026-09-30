import Link from "next/link";
import { notFound } from "next/navigation";

import { db } from "@/lib/db";
import { sectionLabel } from "@/lib/report/section";
import { requireUser } from "@/lib/auth";
import { requireMembership, seatSummary, OrgError } from "@/lib/org/access";
import { courseProgress } from "@/lib/progress";

export const metadata = { title: "Flight School — KiwiPilotPrep" };

/**
 * Instructor dashboard (§20).
 *
 * Every figure is counted from real records for students of this organisation
 * only. Nothing is estimated and no other school's data is reachable.
 */
export default async function OrgDashboardPage({
  params,
}: {
  params: Promise<{ organizationId: string }>;
}) {
  const user = await requireUser();
  const { organizationId } = await params;

  let membership;
  try {
    membership = await requireMembership(user, organizationId);
  } catch (error) {
    if (error instanceof OrgError) notFound();
    throw error;
  }

  const students = await db.organizationStudent.findMany({
    where: { organizationId, status: "ACTIVE" },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { assignedAt: "desc" },
  });
  const studentIds = students.map((s) => s.userId);

  const licenses = await db.enterpriseLicense.findMany({
    where: { organizationId },
    include: { product: { select: { title: true } } },
  });
  const seatRows = await Promise.all(licenses.map((l) => seatSummary(l.id)));
  const seats = seatRows.reduce(
    (acc, s) => ({
      total: acc.total + s.total,
      assigned: acc.assigned + s.assigned,
      available: acc.available + s.available,
    }),
    { total: 0, assigned: 0, available: 0 },
  );

  // Activity is scoped to this school's students throughout.
  const [attempts, recentProgress, weakKdr] = await Promise.all([
    studentIds.length
      ? db.mockAttempt.findMany({
          where: { userId: { in: studentIds }, status: { not: "IN_PROGRESS" } },
          orderBy: { submittedAt: "desc" },
          take: 50,
          include: { user: { select: { name: true } } },
        })
      : [],
    studentIds.length
      ? db.chapterProgress.findMany({
          where: { userId: { in: studentIds }, completedAt: { not: null } },
          orderBy: { completedAt: "desc" },
          take: 8,
          include: {
            user: { select: { name: true } },
            chapter: { select: { title: true, subject: { select: { title: true } } } },
          },
        })
      : [],
    studentIds.length
      ? db.kdrResult.groupBy({
          by: ["kdrCode", "kdrTopic"],
          where: { userId: { in: studentIds }, kdrCode: { not: null } },
          _avg: { accuracy: true },
          _sum: { attempted: true },
          orderBy: { _avg: { accuracy: "asc" } },
          take: 6,
        })
      : [],
  ]);

  const averageScore = attempts.length
    ? Math.round(attempts.reduce((sum, a) => sum + a.scorePercent, 0) / attempts.length)
    : 0;
  const studentsWithMocks = new Set(attempts.map((a) => a.userId)).size;

  // Course progress per student, for the roster summary.
  const courseIds = [
    ...new Set(
      (
        await db.productItem.findMany({
          where: { productId: { in: licenses.map((l) => l.productId) } },
          select: { courseId: true },
        })
      )
        .map((i) => i.courseId)
        .filter((id): id is string => id !== null),
    ),
  ];

  const progressByStudent = await Promise.all(
    students.slice(0, 25).map(async (s) => {
      const stats = await Promise.all(courseIds.map((c) => courseProgress(s.userId, c)));
      const total = stats.reduce((n, p) => n + p.total, 0);
      const done = stats.reduce((n, p) => n + p.completed, 0);
      return {
        ...s,
        percent: total === 0 ? 0 : Math.round((done / total) * 100),
        completed: done,
        total,
      };
    }),
  );

  return (
    <section className="sec">
      <div className="wrap">
        <div className="sec-head r in">
          <div className="eyebrow">Flight School</div>
          <h1 className="h2">{membership.organizationName}</h1>
          <p className="lede mt-s">
            Your role: {membership.role}
            {membership.viaPlatformAdmin && " (platform admin oversight)"}
          </p>
        </div>

        <div className="tiles mt-l">
          <div className="tile"><div className="v">{students.length}</div><div className="l">Active students</div></div>
          <div className="tile"><div className="v">{studentsWithMocks}</div><div className="l">Have sat a mock</div></div>
          <div className="tile"><div className="v">{attempts.length}</div><div className="l">Mock attempts</div></div>
          <div className="tile"><div className="v">{averageScore}%</div><div className="l">Average mock score</div></div>
          <div className="tile"><div className="v">{seats.assigned}/{seats.total}</div><div className="l">Seats assigned</div></div>
          <div className="tile"><div className="v">{seats.available}</div><div className="l">Seats available</div></div>
        </div>

        <div className="acts" style={{ marginBottom: "22px" }}>
          <Link className="btn btn-p btn-sm" href={`/org/${organizationId}/students`}>Students &amp; invitations</Link>
          <Link className="btn btn-g btn-sm" href={`/org/${organizationId}/seats`}>Licences &amp; seats</Link>
        </div>

        {/* ------------------------------------------------ weak areas */}
        <div className="panel">
          <div className="panel-hd">
            <h2>Weakest KDR areas across the school</h2>
            <span className="xs">Averaged from real mock results</span>
          </div>
          {weakKdr.length === 0 ? (
            <div className="empty">No mock results yet.</div>
          ) : (
            <table className="atable">
              <thead><tr><th>Reference</th><th>Questions seen</th><th>Average accuracy</th></tr></thead>
              <tbody>
                {weakKdr.map((k) => (
                  <tr key={`${k.kdrCode}::${k.kdrTopic}`}>
                    <td className="nm">{sectionLabel(k.kdrCode, k.kdrTopic)}</td>
                    <td>{k._sum.attempted ?? 0}</td>
                    <td className="num">{Math.round(k._avg.accuracy ?? 0)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* -------------------------------------------------- roster */}
        <div className="panel">
          <div className="panel-hd"><h2>Student progress</h2></div>
          {progressByStudent.length === 0 ? (
            <div className="empty">
              <b>No students yet</b>
              Invite students from the students page.
            </div>
          ) : (
            <table className="atable">
              <thead><tr><th>Student</th><th>Study progress</th><th>Chapters</th><th /></tr></thead>
              <tbody>
                {progressByStudent.map((s) => (
                  <tr key={s.id}>
                    <td className="nm">
                      {s.user.name}
                      <div className="xs">{s.user.email}</div>
                    </td>
                    <td className="num">{s.percent}%</td>
                    <td className="num">{s.completed}/{s.total}</td>
                    <td>
                      <Link className="btn btn-g btn-sm" href={`/org/${organizationId}/students/${s.userId}`}>
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ---------------------------------------------- activity */}
        <div className="panel">
          <div className="panel-hd"><h2>Recent activity</h2></div>
          {recentProgress.length === 0 ? (
            <div className="empty">No chapter completions yet.</div>
          ) : (
            <table className="atable">
              <thead><tr><th>Student</th><th>Subject</th><th>Chapter</th><th>Completed</th></tr></thead>
              <tbody>
                {recentProgress.map((p) => (
                  <tr key={p.id}>
                    <td className="nm">{p.user.name}</td>
                    <td>{p.chapter.subject.title}</td>
                    <td>{p.chapter.title}</td>
                    <td className="xs">{p.completedAt?.toLocaleString("en-NZ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </section>
  );
}
