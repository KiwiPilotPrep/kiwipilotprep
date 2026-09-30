import Link from "next/link";

import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { accessibleCourseIds } from "@/lib/entitlements";
import { courseProgress, subjectProgress, practiceProgress } from "@/lib/progress";

export const metadata = { title: "Progress — KiwiPilotPrep" };

export default async function ProgressPage() {
  const user = await requireUser();
  const courseIds = await accessibleCourseIds(user);

  const courses = await db.course.findMany({
    where: { id: { in: courseIds }, status: "PUBLISHED" },
    orderBy: { order: "asc" },
    include: {
      subjects: { where: { status: "PUBLISHED" }, orderBy: { order: "asc" } },
    },
  });

  const [attempts, correct] = await Promise.all([
    db.questionAttempt.count({ where: { userId: user.id } }),
    db.questionAttempt.count({ where: { userId: user.id, isCorrect: true } }),
  ]);

  const data = await Promise.all(
    courses.map(async (c) => ({
      ...c,
      overall: await courseProgress(user.id, c.id),
      rows: await Promise.all(
        c.subjects.map(async (s) => ({
          ...s,
          study: await subjectProgress(user.id, s.id),
          practice: await practiceProgress(user.id, s.id),
        })),
      ),
    })),
  );

  return (
    <section className="sec">
      <div className="wrap">
        <div className="sec-head r in">
          <div className="eyebrow">Progress</div>
          <h1 className="h2">Your progress</h1>
          <p className="lede mt-s">
            Every figure here is counted from your saved records — nothing is estimated.
          </p>
        </div>

        <div className="tiles mt-l">
          <div className="tile"><div className="v">{attempts}</div><div className="l">Questions attempted</div></div>
          <div className="tile"><div className="v">{correct}</div><div className="l">Correct answers</div></div>
          <div className="tile"><div className="v">{attempts - correct}</div><div className="l">Incorrect answers</div></div>
          <div className="tile">
            <div className="v">{attempts ? Math.round((correct / attempts) * 100) : 0}%</div>
            <div className="l">Accuracy</div>
          </div>
        </div>

        {data.length === 0 && (
          <div className="empty panel">
            <b>Nothing to report yet</b>
            Once you have access to a course your progress appears here.
          </div>
        )}

        {data.map((c) => (
          <div className="panel" key={c.id}>
            <div className="panel-hd">
              <h2>{c.title}</h2>
              <span className="xs num">
                {c.overall.completed}/{c.overall.total} chapters · {c.overall.percent}%
              </span>
            </div>
            {c.rows.length === 0 ? (
              <div className="empty">No published subjects yet.</div>
            ) : (
              <table className="atable">
                <thead>
                  <tr><th>Subject</th><th>Study</th><th>Practice</th><th></th></tr>
                </thead>
                <tbody>
                  {c.rows.map((s) => (
                    <tr key={s.id}>
                      <td className="nm">{s.title}</td>
                      <td>{s.study.completed}/{s.study.total} ({s.study.percent}%)</td>
                      <td>
                        {s.practice.total === 0
                          ? "—"
                          : `${s.practice.completed}/${s.practice.total} (${s.practice.percent}%)`}
                      </td>
                      <td>
                        <Link className="btn btn-g btn-sm" href={`/courses/${c.slug}/subjects/${s.slug}`}>
                          Open
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
