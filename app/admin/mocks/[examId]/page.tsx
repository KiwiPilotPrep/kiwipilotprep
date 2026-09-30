import Link from "next/link";
import { notFound } from "next/navigation";

import { db } from "@/lib/db";
import { updateMockExam, addMockQuestions, removeMockQuestion } from "@/app/admin/mock-actions";
import { questionSectionLabel } from "@/lib/report/section";
import MockTabs from "@/components/admin/MockTabs";
import { Crumb, StatusPill, StatusSelect, Empty } from "@/components/admin/ui";

export default async function AdminMockPage({
  params,
}: {
  params: Promise<{ examId: string }>;
}) {
  const { examId } = await params;

  const [exam, courses] = await Promise.all([
    db.mockExam.findUnique({
      where: { id: examId },
      include: {
        course: { select: { id: true, title: true } },
        subject: { select: { id: true, title: true } },
        attempts: {
          orderBy: { startedAt: "desc" },
          take: 20,
          include: { user: { select: { name: true, email: true } } },
        },
        picks: {
          orderBy: { order: "asc" },
          include: {
            question: {
              select: {
                id: true,
                prompt: true,
                status: true,
                module: { select: { sectionCode: true, title: true } },
                lesson: { select: { pointNumber: true, title: true } },
              },
            },
          },
        },
      },
    }),
    db.course.findMany({
      where: { status: { not: "ARCHIVED" } },
      orderBy: { order: "asc" },
      select: {
        id: true,
        title: true,
        subjects: {
          where: { status: { not: "ARCHIVED" } },
          orderBy: { order: "asc" },
          select: { id: true, title: true },
        },
      },
    }),
  ]);
  if (!exam) notFound();

  // How many questions the bank can actually supply — a mock configured for
  // more than exists would silently deliver a short paper.
  const available = await db.question.count({
    where: {
      status: "PUBLISHED",
      ...(exam.subjectId
        ? { OR: [{ subjectId: exam.subjectId }, { chapter: { subjectId: exam.subjectId } }] }
        : exam.courseId
          ? {
              OR: [
                { subject: { courseId: exam.courseId } },
                { chapter: { subject: { courseId: exam.courseId } } },
              ],
            }
          : {}),
    },
  });

  const currentScope = exam.subjectId
    ? `subject:${exam.subjectId}`
    : exam.courseId
      ? `course:${exam.courseId}`
      : "";

  const short = available < exam.questionCount;

  // Everything the mock could draw on that is not already on the paper.
  // Scoped the same way `available` is counted, so the picker can never
  // offer a question the engine would refuse.
  const picked = new Set(exam.picks.map((p) => p.question.id));
  const selectable = (
    await db.question.findMany({
      where: {
        status: "PUBLISHED",
        ...(exam.subjectId
          ? { OR: [{ subjectId: exam.subjectId }, { chapter: { subjectId: exam.subjectId } }] }
          : exam.courseId
            ? {
                OR: [
                  { subject: { courseId: exam.courseId } },
                  { chapter: { subject: { courseId: exam.courseId } } },
                ],
              }
            : {}),
      },
      orderBy: [{ subjectId: "asc" }, { order: "asc" }],
      take: 300,
      select: {
        id: true,
        prompt: true,
        subject: { select: { title: true } },
        chapter: { select: { subject: { select: { title: true } } } },
        module: { select: { sectionCode: true, title: true } },
                lesson: { select: { pointNumber: true, title: true } },
      },
    })
  ).filter((q) => !picked.has(q.id));

  return (
    <>
      <Crumb trail={[{ href: "/admin/mocks", label: "Mock Exams" }, { label: exam.title }]} />

      <div className="ahead">
        <div>
          <h1>{exam.title}</h1>
          <p>
            {exam.questionCount} questions · {exam.durationMinutes} minutes ·{" "}
            {exam.randomize ? "randomised" : "fixed order"}
          </p>
        </div>
        <StatusPill status={exam.status} />
      </div>

      {short && (
        <div className="err-note">
          This mock asks for {exam.questionCount} questions but only <b>{available}</b> published
          question{available === 1 ? " is" : "s are"} available in its scope. Attempts will be
          shorter than configured until more are published.
        </div>
      )}

      <MockTabs current="/admin/mocks" />

      <div className="panel">
        <div className="panel-hd">
          <h2>Configuration</h2>
          <span className="xs num">{available} questions available</span>
        </div>
        <div className="panel-bd">
          <form className="inline-form" action={updateMockExam.bind(null, exam.id)}>
            <div className="fld">
              <label htmlFor="title">Title</label>
              <input id="title" name="title" defaultValue={exam.title} />
            </div>
            <div className="fld">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                rows={2}
                defaultValue={exam.description ?? ""}
              />
            </div>

            <div className="fld">
              <label htmlFor="scope">Draw questions from</label>
              <div className="selwrap">
                <select id="scope" name="scope" defaultValue={currentScope}>
                  <option value="">Whole question bank</option>
                  {courses.map((c) => (
                    <optgroup key={c.id} label={c.title}>
                      <option value={`course:${c.id}`}>Whole course — {c.title}</option>
                      {c.subjects.map((s) => (
                        <option key={s.id} value={`subject:${s.id}`}>
                          Subject — {s.title}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            </div>

            <div className="frow">
              <div className="fld">
                <label htmlFor="questionCount">Number of questions</label>
                <input
                  id="questionCount"
                  name="questionCount"
                  type="number"
                  min={1}
                  max={200}
                  defaultValue={exam.questionCount}
                />
              </div>
              <div className="fld">
                <label htmlFor="durationMinutes">Duration (minutes)</label>
                <input
                  id="durationMinutes"
                  name="durationMinutes"
                  type="number"
                  min={1}
                  max={600}
                  defaultValue={exam.durationMinutes}
                />
              </div>
            </div>

            <div className="frow">
              <div className="fld">
                <label htmlFor="passingPercent">Pass mark (%)</label>
                <input
                  id="passingPercent"
                  name="passingPercent"
                  type="number"
                  min={1}
                  max={100}
                  defaultValue={exam.passingPercent ?? ""}
                />
              </div>
              <StatusSelect value={exam.status} />
            </div>

            <div className="frow">
              <div className="fld">
                <label htmlFor="kdrStrongPercent">KDR strong threshold (%)</label>
                <input
                  id="kdrStrongPercent"
                  name="kdrStrongPercent"
                  type="number"
                  min={1}
                  max={100}
                  defaultValue={exam.kdrStrongPercent}
                />
              </div>
              <div className="fld">
                <label htmlFor="kdrWeakPercent">KDR weak threshold (%)</label>
                <input
                  id="kdrWeakPercent"
                  name="kdrWeakPercent"
                  type="number"
                  min={0}
                  max={99}
                  defaultValue={exam.kdrWeakPercent}
                />
              </div>
            </div>

            <label className="chk">
              <input type="checkbox" name="randomize" defaultChecked={exam.randomize} />
              Randomise question order for each attempt
            </label>

            <button className="btn btn-p" type="submit">
              Save configuration
            </button>
          </form>
        </div>
      </div>

      {/* ------------------------------------------------ question picker */}
      <div className="panel">
        <div className="panel-hd">
          <h2>
            Questions
            <span className="xs">
              {" "}
              ·{" "}
              {exam.picks.length > 0
                ? `${exam.picks.length} picked by hand`
                : `drawn from the scope above (${available} available)`}
            </span>
          </h2>
        </div>

        <div className="panel-bd">
          <p className="xs">
            A mock with no picked questions draws {exam.questionCount} at random from its scope
            each time a student starts it. Pick questions here and it uses those instead —
            {exam.randomize ? " still shuffled per attempt" : " in the order below"}. Either way a
            finished attempt keeps its own copy of what was asked, so changing this never alters a
            result somebody already has.
          </p>
        </div>

        {exam.picks.length > 0 && (
          <table className="atable">
            <thead>
              <tr>
                <th>#</th>
                <th>Question</th>
                <th>Section</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {exam.picks.map((p, i) => (
                <tr key={p.id}>
                  <td className="num">{i + 1}</td>
                  <td>
                    <Link className="nm" href={`/admin/mocks/questions/${p.question.id}`}>
                      {p.question.prompt.slice(0, 84)}
                      {p.question.prompt.length > 84 ? "…" : ""}
                    </Link>
                  </td>
                  <td className="xs">
                    {p.question.module
                      ? questionSectionLabel(p.question)
                      : "—"}
                  </td>
                  <td>
                    <StatusPill status={p.question.status} />
                  </td>
                  <td>
                    <form action={removeMockQuestion.bind(null, exam.id, p.question.id)}>
                      <button className="btn btn-g btn-sm" type="submit">
                        Remove
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selectable.length > 0 && (
        <div className="panel">
          <div className="panel-hd">
            <h2>
              Add questions
              <span className="xs"> · {selectable.length} available in this scope</span>
            </h2>
          </div>
          {/* One form, one submit: tick what belongs on the paper and add it
              in a single act rather than a round trip per question. */}
          <form action={addMockQuestions.bind(null, exam.id)}>
            <table className="atable">
              <thead>
                <tr>
                  <th />
                  <th>Question</th>
                  <th>Subject</th>
                  <th>Section</th>
                </tr>
              </thead>
              <tbody>
                {selectable.map((q) => (
                  <tr key={q.id}>
                    <td>
                      <input
                        type="checkbox"
                        name="questionId"
                        value={q.id}
                        aria-label={`Add: ${q.prompt.slice(0, 60)}`}
                      />
                    </td>
                    <td>
                      <span className="nm">
                        {q.prompt.slice(0, 84)}
                        {q.prompt.length > 84 ? "…" : ""}
                      </span>
                    </td>
                    <td className="xs">{q.subject?.title ?? q.chapter?.subject.title ?? "—"}</td>
                    <td className="xs">
                      {q.module ? questionSectionLabel(q) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="acts" style={{ padding: "14px 18px" }}>
              <button className="btn btn-p btn-sm" type="submit">
                Add selected to this mock
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="panel">
        <div className="panel-hd">
          <h2>Recent attempts ({exam.attempts.length})</h2>
          <Link className="btn btn-g btn-sm" href="/admin/attempts">
            All attempts
          </Link>
        </div>
        {exam.attempts.length === 0 ? (
          <Empty title="No attempts yet" hint="Student results will appear here." />
        ) : (
          <table className="atable">
            <thead>
              <tr>
                <th>Student</th>
                <th>Started</th>
                <th>Score</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {exam.attempts.map((a) => (
                <tr key={a.id}>
                  <td className="nm">
                    {a.user.name}
                    <div className="xs">{a.user.email}</div>
                  </td>
                  <td className="xs">{a.startedAt.toLocaleString("en-NZ")}</td>
                  <td className="num">
                    {a.status === "IN_PROGRESS"
                      ? "—"
                      : `${a.correctCount}/${a.totalQuestions} (${a.scorePercent}%)`}
                  </td>
                  <td>
                    <span
                      className={`pill-s ${a.status === "SUBMITTED" ? "published" : a.status === "EXPIRED" ? "archived" : "draft"}`}
                    >
                      {a.status}
                    </span>
                  </td>
                  <td>
                    {a.status !== "IN_PROGRESS" && (
                      <Link className="btn btn-g btn-sm" href={`/mocks/attempts/${a.id}`}>
                        Scorecard
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
