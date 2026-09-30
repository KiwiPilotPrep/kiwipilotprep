"use server";

import { redirect } from "next/navigation";

import { requireVerifiedEmail } from "@/lib/auth";
import { MockError, startAttempt } from "@/lib/mock/engine";
import { trialExamFor, trialUsed } from "@/lib/mock/trial";

/**
 * Starts the free 10-question mock for one subject.
 *
 * Everything after this point is the ordinary mock engine: the timer, the
 * scoring, the KDR, the report and the email are the paid ones. All this
 * does is find or provision the subject's trial exam and hand it to
 * `startAttempt`.
 *
 * The subject arrives as an id from the chooser and nothing is trusted from
 * it. `trialExamFor` only returns a trial for a subject whose course offers
 * one and that has enough eligible questions; the account-wide check below
 * catches a student who already spent theirs; and `startAttempt` writes a
 * uniquely-constrained row inside the attempt's own transaction, so even a
 * request that gets past both checks cannot produce a second trial.
 */
export async function beginTrial(subjectId: string) {
  // Same gate as the checkout: signed in, active, address confirmed. The
  // trial is a sample of paid material, not an anonymous demo.
  const user = await requireVerifiedEmail();

  if (await trialUsed(user.id)) redirect("/trial?error=FORBIDDEN");

  const exam = await trialExamFor(subjectId);
  if (!exam) redirect("/trial?error=NOT_READY");

  try {
    const attempt = await startAttempt(user, exam.id);
    redirect(`/mocks/attempts/${attempt.id}`);
  } catch (error) {
    if (error instanceof MockError) redirect(`/trial?error=${encodeURIComponent(error.code)}`);
    throw error;
  }
}
