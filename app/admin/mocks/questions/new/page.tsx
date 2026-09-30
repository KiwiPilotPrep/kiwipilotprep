import { requireRole } from "@/lib/auth";
import { questionSubjects } from "@/lib/admin/question-subjects";
import QuestionForm from "@/components/admin/QuestionForm";
import MockTabs from "@/components/admin/MockTabs";
import { Crumb } from "@/components/admin/ui";
import { createQuestion } from "@/app/admin/mock-actions";

export const metadata = { title: "New question — Admin" };

/**
 * Add a question, from either tab of Mock Management.
 *
 * `subject` and `trial` are carried in the query so that adding a question
 * from the free trial tab starts on the subject being worked on and with the
 * eligibility box already ticked. Neither is trusted: the server validates
 * the subject and the section it is paired with.
 */
export default async function NewQuestionPage({
  searchParams,
}: {
  searchParams: Promise<{ subject?: string; trial?: string }>;
}) {
  await requireRole("ADMIN");
  const { subject, trial } = await searchParams;
  const subjects = await questionSubjects();

  const subjectId = subjects.some((s) => s.id === subject) ? subject! : subjects[0]?.id ?? "";

  return (
    <>
      <Crumb
        trail={[
          { href: "/admin/mocks", label: "Mock Management" },
          { label: "New question" },
        ]}
      />
      <MockTabs current={trial === "1" ? "/admin/mocks/free-trial" : "/admin/mocks/questions"} />

      <div className="ahead">
        <div>
          <h1>New question</h1>
          <p>
            Where a question sits decides how a student&rsquo;s result is grouped, so it is
            chosen from the subject&rsquo;s own curriculum rather than typed: a chapter, and
            optionally a point inside it.
          </p>
        </div>
      </div>

      <div className="panel">
        <div className="panel-bd">
          <QuestionForm
            subjects={subjects}
            action={createQuestion}
            submitLabel="Create question"
            initial={{
              subjectId,
              moduleId: "",
              lessonId: "",
              prompt: "",
              explanation: "",
              options: ["", "", "", ""],
              answer: 0,
              difficulty: "",
              freeTrialEligible: trial === "1",
              status: "DRAFT",
            }}
          />
        </div>
      </div>
    </>
  );
}
