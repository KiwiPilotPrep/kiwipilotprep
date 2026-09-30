"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth";
import {
  startAttempt,
  saveAnswer,
  finaliseAttempt,
  loadAttempt,
  remainingMs,
  retryReportDelivery,
  MockError,
} from "@/lib/mock/engine";

/**
 * Student-facing mock actions. Each one re-establishes the user from the
 * session and lets the engine enforce ownership, entitlement and expiry —
 * nothing is trusted from the request body.
 */

export async function beginMock(mockExamId: string) {
  const user = await requireUser();
  try {
    const attempt = await startAttempt(user, mockExamId);
    redirect(`/mocks/attempts/${attempt.id}`);
  } catch (error) {
    if (error instanceof MockError) {
      redirect(`/mocks?error=${encodeURIComponent(error.code)}`);
    }
    throw error;
  }
}

export async function answerQuestion(
  attemptId: string,
  attemptQuestionId: string,
  optionId: string | null,
) {
  const user = await requireUser();
  try {
    const result = await saveAnswer(user, attemptId, attemptQuestionId, optionId);
    return { ok: true as const, remainingMs: result.remainingMs };
  } catch (error) {
    if (error instanceof MockError) {
      return { ok: false as const, code: error.code, message: error.message };
    }
    throw error;
  }
}

export async function submitMock(attemptId: string) {
  const user = await requireUser();

  // Ownership is checked by loading it as this user first.
  const attempt = await loadAttempt(user, attemptId);
  if (attempt.userId !== user.id) redirect("/mocks");

  if (attempt.status === "IN_PROGRESS") {
    // The scorecard email is sent by finaliseAttempt, which is the only
    // place that marks a paper and so the only place that sees every path.
    await finaliseAttempt(attemptId, { auto: false });
  }

  revalidatePath("/mocks");
  revalidatePath("/dashboard");
  redirect(`/mocks/attempts/${attemptId}`);
}

/**
 * Called by the client countdown when it believes time is up. The server
 * re-checks rather than trusting it, so this can only ever close an attempt
 * that has genuinely expired.
 */
export async function expireMock(attemptId: string) {
  const user = await requireUser();
  const attempt = await loadAttempt(user, attemptId);

  if (attempt.status === "IN_PROGRESS" && remainingMs(attempt) === 0) {
    await finaliseAttempt(attemptId, { auto: true });
  }

  revalidatePath(`/mocks/attempts/${attemptId}`);
  return { ok: true as const };
}

/**
 * Sends a report whose delivery failed the first time.
 *
 * The student's result is not at stake — it was stored when the paper was
 * marked — so this only ever builds the report again and hands it to the
 * mailer. Ownership comes from the session, and the unique constraint on
 * MockReport means a retry updates the existing record rather than creating a
 * second report or a second email.
 */
export async function resendReport(attemptId: string) {
  const user = await requireUser();
  await retryReportDelivery(attemptId, user.id);
  revalidatePath(`/mocks/attempts/${attemptId}`);
  revalidatePath("/mocks/history");
}
