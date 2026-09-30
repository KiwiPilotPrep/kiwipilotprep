import { notFound } from "next/navigation";

import { requireUser } from "@/lib/auth";
import { loadAttempt, publicOptions, remainingMs, MockError } from "@/lib/mock/engine";
import MockRunner from "@/components/mock/MockRunner";
import Scorecard from "@/components/mock/Scorecard";

export const metadata = { title: "Mock Exam — KiwiPilotPrep" };

/**
 * One attempt. While it is live this renders the exam runner; once submitted
 * or expired it renders the scorecard.
 *
 * loadAttempt finalises an attempt whose clock ran out before returning it, so
 * simply opening this page after the deadline closes and marks the paper.
 */
export default async function AttemptPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const user = await requireUser();
  const { attemptId } = await params;

  let attempt;
  try {
    attempt = await loadAttempt(user, attemptId);
  } catch (error) {
    if (error instanceof MockError) notFound();
    throw error;
  }

  if (attempt.status === "IN_PROGRESS") {
    return (
      <MockRunner
        attemptId={attempt.id}
        title={attempt.examTitle}
        subtitle={attempt.subjectTitle}
        remainingMs={remainingMs(attempt)}
        questions={attempt.questions.map((q) => ({
          id: q.id,
          order: q.order,
          prompt: q.promptSnapshot,
          // The answer key is deliberately stripped: nothing about correctness
          // reaches the browser while the paper is live (§22).
          options: publicOptions(q.optionsSnapshot),
          selectedOptionId: q.selectedOptionId,
        }))}
      />
    );
  }

  return <Scorecard attemptId={attempt.id} viewerIsOwner={attempt.userId === user.id} />;
}
