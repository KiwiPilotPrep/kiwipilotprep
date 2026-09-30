import Link from "next/link";
import { notFound } from "next/navigation";

import { requireRole } from "@/lib/auth";
import { studentHistory } from "@/lib/admin/student-history";
import { Crumb } from "@/components/admin/ui";

export const metadata = { title: "Student mock history — Admin" };

/**
 * One student's mock attempts, inside the admin console.
 *
 * This is where the History button on an attempt goes. It used to go to
 * `/mocks/history`, which is the student's own page: an admin who pressed it
 * was signed in as themselves, so they were shown their own empty history,
 * or bounced to the student dashboard. Either way they left the console and
 * learned nothing about the student they were looking at.
 *
 * Same data as the Mock history panel on the student's record, on its own
 * page so it can be linked to directly and read without scrolling past the
 * purchases and the progress.
 */
export default async function AdminStudentMockHistoryPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  await requireRole("ADMIN");
  const { studentId } = await params;

  const data = await studentHistory(studentId);
  if (!data) notFound();

  const { student, attempts, totals } = data;

  return (
    <>
      <Crumb
        trail={[
          { href: "/admin/history", label: "Student History" },
          { href: `/admin/history/${student.id}`, label: student.name },
          { label: "Mock history" },
        ]}
      />

      <div className="ahead">
        <div>
          <h1>Student mock history</h1>
          <p>
            {student.name} · {student.email} · {totals.mockAttempts} completed mock
            {totals.mockAttempts === 1 ? "" : "s"} · {totals.mocksPassed} passed
          </p>
        </div>
        <Link className="btn btn-g btn-sm" href={`/admin/history/${student.id}`}>
          Full student record
        </Link>
      </div>

      <div className="panel mt-m">
        <div className="panel-hd">
          <h2>Attempts ({attempts.length})</h2>
        </div>
        {attempts.length === 0 ? (
          <div className="empty">
            <b>No mock attempts</b>This student has not sat a mock exam.
          </div>
        ) : (
          <table className="atable">
            <thead>
              <tr>
                <th>Mock</th>
                <th>Subject</th>
                <th>Date</th>
                <th>Score</th>
                <th>Percentage</th>
                <th>Result</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {attempts.map((a) => (
                <tr key={a.id}>
                  <td>
                    <span className="nm">{a.examTitle}</span>
                    {a.isFreeTrial && <div className="xs">free mock</div>}
                  </td>
                  <td className="xs">{a.subjectTitle ?? "—"}</td>
                  <td className="xs" style={{ whiteSpace: "nowrap" }}>
                    {(a.submittedAt ?? a.startedAt).toLocaleString("en-NZ")}
                  </td>
                  <td className="num" style={{ whiteSpace: "nowrap" }}>
                    {a.status === "IN_PROGRESS" ? "—" : `${a.correct} / ${a.total}`}
                  </td>
                  <td className="num">
                    {a.status === "IN_PROGRESS" ? "—" : `${a.scorePercent}%`}
                  </td>
                  <td>
                    {a.status === "IN_PROGRESS" ? (
                      <span className="pill-s draft">IN PROGRESS</span>
                    ) : a.passed === null ? (
                      <span className="pill-s draft">NO PASS MARK</span>
                    ) : (
                      <span className={`pill-s ${a.passed ? "published" : "archived"}`}>
                        {a.passed ? "PASS" : "BELOW PASS"}
                      </span>
                    )}
                    {a.passingPercent !== null && (
                      <div className="xs">pass {a.passingPercent}%</div>
                    )}
                  </td>
                  <td>
                    {a.status !== "IN_PROGRESS" && (
                      <Link className="btn btn-g btn-sm" href={`/admin/attempts/${a.id}`}>
                        Inspect
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
