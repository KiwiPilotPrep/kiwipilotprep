import Link from "next/link";

import { db } from "@/lib/db";
import { sectionLabel } from "@/lib/report/section";
import { requireUser } from "@/lib/auth";
import { sweepExpiredAttempts } from "@/lib/mock/engine";

export const metadata = { title: "Mock History — KiwiPilotPrep" };

/**
 * Every attempt this student has made. Rows read from the attempt's own stored
 * figures, so they never shift when the question bank is edited (§18).
 */
export default async function MockHistoryPage() {
  const user = await requireUser();
  await sweepExpiredAttempts(user.id);

  const attempts = await db.mockAttempt.findMany({
    where: { userId: user.id, status: { not: "IN_PROGRESS" } },
    orderBy: { submittedAt: "desc" },
    include: { kdrResults: { orderBy: { accuracy: "asc" }, take: 3 } },
  });

  // Grouped by code and title together, so the table can show the section
  // the way every other view of a result shows it — "1.10 — Right of Way
  // Rules" — rather than a bare number a student has no key for.
  const trend = await db.kdrResult.groupBy({
    by: ["kdrCode", "kdrTopic"],
    where: { userId: user.id, kdrCode: { not: null } },
    _avg: { accuracy: true },
    _sum: { attempted: true, correct: true },
    orderBy: { _avg: { accuracy: "asc" } },
    take: 10,
  });

  return (
    <section className="sec">
      <div className="wrap">
        <div className="sec-head r in">
          <div className="eyebrow">Mock History</div>
          <h1 className="h2">Your attempts</h1>
          <p className="lede mt-s">
            Every completed mock, with the score exactly as it was marked at the time.
          </p>
        </div>

        {attempts.length === 0 ? (
          <div className="empty panel mt-l">
            <b>No completed attempts yet</b>
            <Link className="btn btn-p btn-sm" href="/mocks">Sit your first mock</Link>
          </div>
        ) : (
          <div className="panel mt-l">
            <table className="atable">
              <thead>
                <tr>
                  <th>Mock</th>
                  <th>Date</th>
                  <th>Attempt</th>
                  <th>Score</th>
                  <th>Result</th>
                  <th>Weakest areas</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {attempts.map((a) => (
                  <tr key={a.id}>
                    <td className="nm">
                      {a.examTitle}
                      {a.subjectTitle && <div className="xs">{a.subjectTitle}</div>}
                    </td>
                    <td className="xs">{(a.submittedAt ?? a.startedAt).toLocaleString("en-NZ")}</td>
                    <td className="num">#{a.attemptNumber}</td>
                    <td className="num">
                      {a.correctCount}/{a.totalQuestions} ({a.scorePercent}%)
                    </td>
                    <td>
                      {a.passed === null ? (
                        <span className="pill-s draft">Graded</span>
                      ) : a.passed ? (
                        <span className="pill-s published">PASS</span>
                      ) : (
                        <span className="pill-s archived">NOT YET</span>
                      )}
                    </td>
                    <td className="xs">
                      {a.kdrResults.length === 0
                        ? "—"
                        : a.kdrResults
                            .map((k) => `${sectionLabel(k.kdrCode, k.kdrTopic)} (${k.accuracy}%)`)
                            .join(", ")}
                    </td>
                    <td>
                      <Link className="btn btn-g btn-sm" href={`/mocks/attempts/${a.id}`}>
                        Scorecard
                      </Link>{" "}
                      {/* Rendered on demand from the attempt's own snapshots, so this
                          is the same report whenever it is downloaded. */}
                      <a className="btn btn-g btn-sm" href={`/mocks/attempts/${a.id}/report.pdf`}>
                        PDF
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {trend.length > 0 && (
          <>
            <div className="sec-head mt-l">
              <h2 className="h3">KDR performance across all attempts</h2>
              <p className="xs">Averaged over every mock you have sat, weakest first.</p>
            </div>
            <div className="panel">
              <table className="atable">
                <thead>
                  <tr>
                    <th>Revision area</th>
                    <th>Questions seen</th>
                    <th>Correct</th>
                    <th>Average accuracy</th>
                  </tr>
                </thead>
                <tbody>
                  {trend.map((t) => (
                    <tr key={`${t.kdrCode}::${t.kdrTopic}`}>
                      {/* Informational, not a link. */}
                      <td className="nm">{sectionLabel(t.kdrCode, t.kdrTopic)}</td>
                      <td>{t._sum.attempted ?? 0}</td>
                      <td>{t._sum.correct ?? 0}</td>
                      <td className="num">{Math.round(t._avg.accuracy ?? 0)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
