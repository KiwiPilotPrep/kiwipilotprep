import Link from "next/link";

import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { canSitMock, sweepExpiredAttempts } from "@/lib/mock/engine";
import { beginMock } from "./actions";

export const metadata = { title: "Mock Exams — KiwiPilotPrep" };

const ERRORS: Record<string, string> = {
  FORBIDDEN: "That mock is part of a package you do not currently have.",
  NOT_FOUND: "That mock exam is no longer available.",
  NOT_ENOUGH_QUESTIONS: "That mock has no published questions yet.",
  EXPIRED: "Your previous attempt ran out of time and was submitted automatically.",
};

export default async function MocksPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await requireUser();
  const { error } = await searchParams;

  // Close anything that expired while this student was away (§10).
  await sweepExpiredAttempts(user.id);

  const exams = await db.mockExam.findMany({
    // Free trials are provisioned per subject and reached from the trial
    // chooser. Listing them here would put a free paper beside the paid ones
    // and make the package look like something you need not buy.
    where: { status: "PUBLISHED", isFreeTrial: false },
    orderBy: { order: "asc" },
    include: {
      course: { select: { title: true } },
      subject: { select: { title: true } },
    },
  });

  const withAccess = await Promise.all(
    exams.map(async (e) => ({ ...e, allowed: await canSitMock(user, e) })),
  );

  const attempts = await db.mockAttempt.findMany({
    where: { userId: user.id },
    orderBy: { startedAt: "desc" },
    take: 10,
  });

  const live = attempts.find((a) => a.status === "IN_PROGRESS");
  const finished = attempts.filter((a) => a.status !== "IN_PROGRESS");

  const best = new Map<string, number>();
  for (const a of finished) {
    best.set(a.mockExamId, Math.max(best.get(a.mockExamId) ?? 0, a.scorePercent));
  }

  return (
    <section className="sec">
      <div className="wrap">
        <div className="sec-head r in">
          <div className="eyebrow">Mock Exams</div>
          <h1 className="h2">Sit a timed mock.</h1>
          <p className="lede mt-s">
            Real exam conditions: the clock keeps running whether the page is open or not.
          </p>
        </div>

        {error && (
          <p className="fnote on warn" role="alert">
            {ERRORS[error] ?? "Something went wrong starting that mock."}
          </p>
        )}

        {live && (
          <div className="resume r in mt-l">
            <div>
              <div className="eyebrow">Attempt in progress</div>
              <h2 className="h3">{live.examTitle}</h2>
              <p className="small">
                Started {live.startedAt.toLocaleString("en-NZ")} · the timer is still running.
              </p>
            </div>
            <Link className="btn btn-p" href={`/mocks/attempts/${live.id}`}>
              Resume Exam
            </Link>
          </div>
        )}

        <div className="sec-head mt-l">
          <h2 className="h3">Available mocks</h2>
        </div>

        {withAccess.length === 0 ? (
          <div className="empty panel">
            <b>No mock exams published yet</b>
            Mocks appear here as soon as an administrator publishes them.
          </div>
        ) : (
          <div className="g3 mt-m">
            {withAccess.map((exam) => (
              <div className={`subj r in${exam.allowed ? "" : " locked"}`} key={exam.id}>
                <h3>{exam.title}</h3>
                {exam.description && <p>{exam.description}</p>}
                <ul>
                  <li>{exam.questionCount} questions</li>
                  <li>{exam.durationMinutes} minutes</li>
                  {exam.passingPercent !== null && <li>Pass mark {exam.passingPercent}%</li>}
                  {(exam.subject?.title ?? exam.course?.title) && (
                    <li>{exam.subject?.title ?? exam.course?.title}</li>
                  )}
                </ul>

                {best.has(exam.id) && (
                  <p className="xs" style={{ marginTop: "10px" }}>
                    Best score: <b>{best.get(exam.id)}%</b>
                  </p>
                )}

                <div style={{ marginTop: "14px" }}>
                  {exam.allowed ? (
                    <form action={beginMock.bind(null, exam.id)}>
                      <button className="btn btn-p btn-w" type="submit">
                        {live?.mockExamId === exam.id ? "Resume Exam" : "Start Mock Exam"}
                      </button>
                    </form>
                  ) : (
                    <Link className="btn btn-g btn-w" href="/pricing">
                      Unlock with a package
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="sec-head mt-l">
          <h2 className="h3">Recent attempts</h2>
        </div>

        {finished.length === 0 ? (
          <div className="empty panel">
            <b>No completed attempts yet</b>
            Your scorecards will appear here once you finish a mock.
          </div>
        ) : (
          <div className="panel">
            <table className="atable">
              <thead>
                <tr>
                  <th>Mock</th>
                  <th>Date</th>
                  <th>Score</th>
                  <th>Result</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {finished.map((a) => (
                  <tr key={a.id}>
                    <td className="nm">
                      {a.examTitle}
                      {a.subjectTitle && <div className="xs">{a.subjectTitle}</div>}
                    </td>
                    <td className="xs">
                      {(a.submittedAt ?? a.startedAt).toLocaleString("en-NZ")}
                    </td>
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
                      {a.autoSubmitted && <div className="xs">time expired</div>}
                    </td>
                    <td>
                      <Link className="btn btn-g btn-sm" href={`/mocks/attempts/${a.id}`}>
                        Scorecard
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="xs" style={{ marginTop: "18px" }}>
          <Link href="/mocks/history">See full mock history →</Link>
        </p>
      </div>
    </section>
  );
}
