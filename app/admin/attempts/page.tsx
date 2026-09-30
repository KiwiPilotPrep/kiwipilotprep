import Link from "next/link";

import { db } from "@/lib/db";
import { Empty } from "@/components/admin/ui";
import { sweepExpiredAttempts } from "@/lib/mock/engine";

/** Admin visibility into student results (§20). Read-only. */
export default async function AdminAttemptsPage() {
  await sweepExpiredAttempts();

  const [attempts, totals] = await Promise.all([
    db.mockAttempt.findMany({
      orderBy: { startedAt: "desc" },
      take: 100,
      include: {
        user: { select: { name: true, email: true } },
        kdrResults: { orderBy: { accuracy: "asc" }, take: 3 },
      },
    }),
    db.mockAttempt.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);

  const graded = attempts.filter((a) => a.status !== "IN_PROGRESS");
  const average = graded.length
    ? Math.round(graded.reduce((sum, a) => sum + a.scorePercent, 0) / graded.length)
    : 0;

  return (
    <>
      <div className="ahead">
        <div>
          <h1>Mock Attempts</h1>
          <p>Student results, scored server-side. Records are read-only.</p>
        </div>
      </div>

      <div className="tiles">
        {totals.map((t) => (
          <div className="tile" key={t.status}>
            <div className="v">{t._count._all}</div>
            <div className="l">{t.status.replace("_", " ")}</div>
          </div>
        ))}
        <div className="tile">
          <div className="v">{average}%</div>
          <div className="l">Average score</div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-hd"><h2>Recent attempts ({attempts.length})</h2></div>
        {attempts.length === 0 ? (
          <Empty title="No attempts yet" hint="Results appear once students sit a mock." />
        ) : (
          <table className="atable">
            <thead>
              <tr>
                <th>Student</th><th>Mock</th><th>Started</th><th>Score</th>
                <th>Result</th><th>Weakest KDR</th><th>Status</th><th />
              </tr>
            </thead>
            <tbody>
              {attempts.map((a) => (
                <tr key={a.id}>
                  <td className="nm">
                    {a.user.name}
                    <div className="xs">{a.user.email}</div>
                  </td>
                  <td>
                    {a.examTitle}
                    {a.subjectTitle && <div className="xs">{a.subjectTitle}</div>}
                  </td>
                  <td className="xs">{a.startedAt.toLocaleString("en-NZ")}</td>
                  <td className="num">
                    {a.status === "IN_PROGRESS" ? "—" : `${a.correctCount}/${a.totalQuestions} (${a.scorePercent}%)`}
                  </td>
                  <td>
                    {a.passed === null ? <span className="xs">—</span>
                      : a.passed ? <span className="pill-s published">PASS</span>
                      : <span className="pill-s archived">NOT YET</span>}
                  </td>
                  <td className="xs">
                    {a.kdrResults.length === 0 ? "—"
                      : a.kdrResults.map((k) => `${k.kdrCode ?? k.kdrTopic} (${k.accuracy}%)`).join(", ")}
                  </td>
                  <td>
                    <span className={`pill-s ${a.status === "SUBMITTED" ? "published" : a.status === "EXPIRED" ? "archived" : "draft"}`}>
                      {a.status.replace("_", " ")}
                    </span>
                    {a.autoSubmitted && <div className="xs">auto</div>}
                  </td>
                  <td>
                    {a.status !== "IN_PROGRESS" && (
                      <Link className="btn btn-g btn-sm" href={`/admin/attempts/${a.id}`}>Inspect</Link>
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
