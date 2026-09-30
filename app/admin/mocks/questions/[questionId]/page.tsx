import { notFound } from "next/navigation";

import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { questionSubjects } from "@/lib/admin/question-subjects";
import QuestionForm from "@/components/admin/QuestionForm";
import MockTabs from "@/components/admin/MockTabs";
import { Crumb } from "@/components/admin/ui";
import { saveQuestion, deleteQuestion, setQuestionStatus } from "@/app/admin/mock-actions";

export const metadata = { title: "Edit question — Admin" };

/**
 * Edit one question: wording, options, correct answer, explanation, the
 * KiwiPilotPrep section it is reported under, and whether the free mock may
 * draw on it.
 *
 * A question that has already been sat is shown as such. Editing it is
 * allowed and is safe — every attempt reads its own snapshot, so a past
 * result cannot be rewritten from here — but an admin ought to know that the
 * question has history before changing what it says.
 */
export default async function EditQuestionPage({
  params,
  searchParams,
}: {
  params: Promise<{ questionId: string }>;
  searchParams: Promise<{ saved?: string; trial?: string }>;
}) {
  await requireRole("ADMIN");
  const { questionId } = await params;
  const { saved, trial } = await searchParams;

  const question = await db.question.findUnique({
    where: { id: questionId },
    select: {
      id: true,
      prompt: true,
      explanation: true,
      status: true,
      difficulty: true,
      freeTrialEligible: true,
      subjectId: true,
      moduleId: true,
      lessonId: true,
      chapterId: true,
      chapter: { select: { subjectId: true } },
      options: { orderBy: { order: "asc" }, select: { text: true, isCorrect: true } },
      _count: { select: { attemptQuestions: true } },
    },
  });
  if (!question) notFound();

  const subjects = await questionSubjects();
  const subjectId = question.subjectId ?? question.chapter?.subjectId ?? subjects[0]?.id ?? "";

  const texts = question.options.map((o) => o.text);
  const options: [string, string, string, string] = [
    texts[0] ?? "",
    texts[1] ?? "",
    texts[2] ?? "",
    texts[3] ?? "",
  ];
  const answer = Math.max(0, question.options.findIndex((o) => o.isCorrect));

  return (
    <>
      <Crumb
        trail={[
          { href: "/admin/mocks", label: "Mock Management" },
          { href: "/admin/mocks/questions", label: "Questions" },
          { label: question.prompt.slice(0, 40) },
        ]}
      />
      <MockTabs current={trial === "1" ? "/admin/mocks/free-trial" : "/admin/mocks/questions"} />

      <div className="ahead">
        <div>
          <h1>Edit question</h1>
          <p>
            {question._count.attemptQuestions > 0 ? (
              <>
                This question has been sat {question._count.attemptQuestions} time
                {question._count.attemptQuestions === 1 ? "" : "s"}. Editing it is safe — every
                attempt keeps its own snapshot — but past results will not change.
              </>
            ) : (
              <>This question has not been sat yet.</>
            )}
          </p>
        </div>
      </div>

      {saved === "1" && (
        <div className="cnote info">
          <b>Saved</b>
          <p>The question has been updated.</p>
        </div>
      )}

      <div className="panel mt-m">
        <div className="panel-bd">
          <QuestionForm
            subjects={subjects}
            action={saveQuestion.bind(null, question.id)}
            submitLabel="Save question"
            initial={{
              subjectId,
              moduleId: question.moduleId ?? "",
              lessonId: question.lessonId ?? "",
              prompt: question.prompt,
              explanation: question.explanation ?? "",
              options,
              answer,
              difficulty: question.difficulty ? String(question.difficulty) : "",
              freeTrialEligible: question.freeTrialEligible,
              status: question.status,
            }}
          />
        </div>
      </div>

      <div className="panel mt-m">
        <div className="panel-hd">
          <h2>Availability</h2>
        </div>
        <div className="acts" style={{ padding: "14px 18px", gap: "8px", flexWrap: "wrap" }}>
          {question.status !== "PUBLISHED" && (
            <form action={setQuestionStatus.bind(null, question.id, "PUBLISHED")}>
              <button className="btn btn-g btn-sm" type="submit">
                Activate
              </button>
            </form>
          )}
          {question.status === "PUBLISHED" && (
            <form action={setQuestionStatus.bind(null, question.id, "DRAFT")}>
              <button className="btn btn-g btn-sm" type="submit">
                Deactivate
              </button>
            </form>
          )}
          {question.status !== "ARCHIVED" && (
            <form action={setQuestionStatus.bind(null, question.id, "ARCHIVED")}>
              <button className="btn btn-g btn-sm" type="submit">
                Archive
              </button>
            </form>
          )}
          <form action={deleteQuestion.bind(null, question.id)}>
            <button className="btn btn-d btn-sm" type="submit">
              Delete
            </button>
          </form>

        </div>
        <div className="panel-bd">
          <p className="xs">
            Deactivating removes a question from new papers without losing it. Archiving also
            withdraws it from the free mock. Deleting removes it outright, unless it has been sat —
            a question with history is archived instead, so past results keep their link to it.
          </p>
        </div>
      </div>
    </>
  );
}
