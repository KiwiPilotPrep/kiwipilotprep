import Link from "next/link";

import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { sectionLabel, questionSectionLabel } from "@/lib/report/section";
import { TRIAL_QUESTION_COUNT } from "@/lib/mock/trial";
import MockTabs from "@/components/admin/MockTabs";

export const metadata = { title: "Question Bank — Admin" };

/**
 * The question bank, inside Mock Management.
 *
 * Not a separate sidebar section: these are the questions paid mocks draw
 * on and the questions the free mock draws on, so they belong where those
 * two live. One set of rows, three views of it.
 *
 * Navigated the way the curriculum is shaped — course, then subject, then
 * section — because that is how an admin looks for a question, and because
 * a flat list of a hundred and sixty rows is not a bank, it is a haystack.
 */
export default async function QuestionBankPage({
  searchParams,
}: {
  searchParams: Promise<{ course?: string; subject?: string; section?: string }>;
}) {
  await requireRole("ADMIN");
  const { course: courseId, subject: subjectId, section: sectionId } = await searchParams;

  const courses = await db.course.findMany({
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
  });

  const course = courses.find((c) => c.id === courseId) ?? courses[0];
  const subjects = course?.subjects ?? [];
  // A subject from another course is ignored rather than honoured: the
  // filters are a hierarchy, and a mismatched pair means a stale link.
  const subject = subjects.find((s) => s.id === subjectId) ?? subjects[0];

  const sections = subject
    ? await db.courseModule.findMany({
        where: { subjectId: subject.id },
        orderBy: { displayOrder: "asc" },
        select: {
          id: true,
          sectionCode: true,
          title: true,
          _count: { select: { questions: true } },
        },
      })
    : [];
  const section = sections.find((m) => m.id === sectionId);

  const questions = subject
    ? await db.question.findMany({
        where: {
          OR: [{ subjectId: subject.id }, { chapter: { subjectId: subject.id } }],
          ...(section ? { moduleId: section.id } : {}),
        },
        orderBy: [{ status: "asc" }, { order: "asc" }],
        select: {
          id: true,
          prompt: true,
          status: true,
          moduleId: true,
          freeTrialEligible: true,
          explanation: true,
          seedKey: true,
          module: { select: { sectionCode: true, title: true } },
          lesson: { select: { pointNumber: true, title: true } },
          _count: { select: { options: true, attemptQuestions: true } },
        },
      })
    : [];

  const eligible = questions.filter((q) => q.freeTrialEligible && q.status === "PUBLISHED").length;
  const unmapped = questions.filter((q) => !q.moduleId).length;

  const link = (next: Record<string, string | undefined>) => {
    const merged: Record<string, string | undefined> = {
      course: course?.id,
      subject: subject?.id,
      section: section?.id,
      ...next,
    };
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries(merged)) if (v) p.set(k, v);
    return `/admin/mocks/questions?${p.toString()}`;
  };

  return (
    <>
      <MockTabs current="/admin/mocks/questions" />

      <div className="ahead">
        <div>
          <h1>Question Bank</h1>
          <p>
            Every question a mock can draw on, arranged by course, subject and KiwiPilotPrep
            section. The section is what groups a student&rsquo;s result, so it is chosen from the
            subject&rsquo;s own curriculum rather than typed.
          </p>
        </div>
        {subject && (
          <Link
            className="btn btn-p btn-sm"
            href={`/admin/mocks/questions/new?subject=${subject.id}`}
          >
            Add question
          </Link>
        )}
      </div>

      <div className="panel">
        <div className="panel-hd">
          <h2>Course</h2>
        </div>
        <div className="acts" style={{ padding: "14px 18px", flexWrap: "wrap", gap: "8px" }}>
          {courses.map((c) => (
            <Link
              key={c.id}
              className={`btn btn-sm ${c.id === course?.id ? "btn-p" : "btn-g"}`}
              href={`/admin/mocks/questions?course=${c.id}`}
            >
              {c.title.replace(/^KiwiPilotPrep — /, "")}
            </Link>
          ))}
        </div>
      </div>

      {subjects.length > 0 && course && (
        <div className="panel mt-m">
          <div className="panel-hd">
            <h2>Subject</h2>
          </div>
          <div className="acts" style={{ padding: "14px 18px", flexWrap: "wrap", gap: "8px" }}>
            {subjects.map((s) => (
              <Link
                key={s.id}
                className={`btn btn-sm ${s.id === subject?.id ? "btn-p" : "btn-g"}`}
                href={`/admin/mocks/questions?course=${course.id}&subject=${s.id}`}
              >
                {s.title}
              </Link>
            ))}
          </div>
        </div>
      )}

      {sections.length > 0 && (
        <div className="panel mt-m">
          <div className="panel-hd">
            <h2>
              Section
              <span className="xs"> · {sections.length} in this subject</span>
            </h2>
          </div>
          <div className="acts" style={{ padding: "14px 18px", flexWrap: "wrap", gap: "8px" }}>
            <Link
              className={`btn btn-sm ${section ? "btn-g" : "btn-p"}`}
              href={link({ section: "" })}
            >
              All sections
            </Link>
            {/* Only sections that hold something, plus whichever is selected.
                A subject has up to forty-four, and listing the empty ones
                buries the four that matter. */}
            {sections
              .filter((m) => m._count.questions > 0 || m.id === section?.id)
              .map((m) => (
                <Link
                  key={m.id}
                  className={`btn btn-sm ${m.id === section?.id ? "btn-p" : "btn-g"}`}
                  href={link({ section: m.id })}
                >
                  {sectionLabel(m.sectionCode, m.title)} ({m._count.questions})
                </Link>
              ))}
          </div>
        </div>
      )}

      <div className="panel mt-m">
        <div className="panel-hd">
          <h2>
            {questions.length} question{questions.length === 1 ? "" : "s"}
            <span className="xs">
              {" "}
              · {eligible} in the free mock
              {eligible > 0 && eligible < TRIAL_QUESTION_COUNT && (
                <> — {TRIAL_QUESTION_COUNT} needed before this subject can offer one</>
              )}
              {unmapped > 0 && <> · {unmapped} with no section</>}
            </span>
          </h2>
        </div>

        {questions.length === 0 ? (
          <div className="empty">
            <b>No questions here yet</b>
            Use Add question to write the first one for this subject.
          </div>
        ) : (
          <table className="atable">
            <thead>
              <tr>
                <th>Question</th>
                <th>KiwiPilotPrep section</th>
                <th>Options</th>
                <th>Status</th>
                <th>Free mock</th>
                <th>Sat</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {questions.map((q) => (
                <tr key={q.id}>
                  <td>
                    <Link className="nm" href={`/admin/mocks/questions/${q.id}`}>
                      {q.prompt.slice(0, 88)}
                      {q.prompt.length > 88 ? "…" : ""}
                    </Link>
                    <div className="xs">
                      {subject?.title}
                      {!q.explanation && <> · no explanation</>}
                      {q._count.options !== 4 && <> · {q._count.options} options</>}
                    </div>
                  </td>
                  <td className="xs">
                    {q.module ? (
                      questionSectionLabel(q)
                    ) : (
                      <span className="pill-s archived">Not mapped</span>
                    )}
                  </td>
                  <td className="num">{q._count.options}</td>
                  <td>
                    <span
                      className={`pill-s ${q.status === "PUBLISHED" ? "published" : q.status === "ARCHIVED" ? "archived" : "draft"}`}
                    >
                      {q.status}
                    </span>
                  </td>
                  <td className="xs">{q.freeTrialEligible ? "Eligible" : "—"}</td>
                  <td className="num">{q._count.attemptQuestions}</td>
                  <td>
                    <Link className="btn btn-g btn-sm" href={`/admin/mocks/questions/${q.id}`}>
                      Edit
                    </Link>
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
