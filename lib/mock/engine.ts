import "server-only";

import type { Prisma, MockAttempt } from "@prisma/client";

import { db } from "@/lib/db";
import { canAccessCourse, canAccessSubject, type Actor } from "@/lib/entitlements";
import { questionSection } from "@/lib/report/section";

/**
 * Mock examination engine.
 *
 * Two rules shape everything here:
 *
 *  1. The server owns the clock. `expiresAt` is written once when the attempt
 *     starts and is the only authority on time remaining. The browser's
 *     countdown is presentation only, so refreshing, editing localStorage or
 *     stopping the JS timer buys no extra time (§5).
 *
 *  2. The attempt owns its questions. Every question is snapshotted onto the
 *     attempt at start, so a later edit to the question bank cannot change a
 *     finished paper or reshuffle a live one (§8, §26).
 */

export type SnapshotOption = {
  id: string;
  text: string;
  isCorrect: boolean;
  order: number;
};

/** Option as it is safe to send to the browser during a live attempt. */
export type PublicOption = { id: string; text: string };

export class MockError extends Error {
  constructor(
    message: string,
    readonly code:
      | "NOT_FOUND"
      | "FORBIDDEN"
      | "NOT_ENOUGH_QUESTIONS"
      | "ALREADY_SUBMITTED"
      | "EXPIRED",
  ) {
    super(message);
  }
}

/** Reads the options snapshot back out of Json. */
export function toOptions(value: Prisma.JsonValue): SnapshotOption[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (o): o is SnapshotOption =>
      typeof o === "object" && o !== null && "id" in o && "text" in o,
  );
}

/** Strips the answer key. Used for every response while an attempt is live. */
export function publicOptions(value: Prisma.JsonValue): PublicOption[] {
  return toOptions(value).map((o) => ({ id: o.id, text: o.text }));
}

/** Server-side entitlement check for a mock (§7). Reuses Phase 3 — no parallel system. */
export async function canSitMock(
  actor: Actor,
  exam: { courseId: string | null; subjectId: string | null; isFreeTrial?: boolean },
): Promise<boolean> {
  if (actor.role === "ADMIN") return true;

  // The free trial is the one mock that needs no package — that is the point
  // of it. What it must not become is a way to keep sitting mocks for
  // nothing, so a student gets exactly one for their whole account: one
  // subject, once, ever. It never unlocks anything else, and every other
  // mock still goes through the entitlement check below.
  //
  // This is the courteous check, so the chooser can say why. The guarantee
  // is the unique row written in `startAttempt`; a stale link that gets past
  // here still cannot create a second attempt.
  if (exam.isFreeTrial) {
    if (!exam.subjectId) return false;
    const { trialUsed, trialSubjectAllowed } = await import("./trial");
    if (!(await trialSubjectAllowed(exam.subjectId))) return false;
    return !(await trialUsed(actor.id));
  }

  if (exam.subjectId) return canAccessSubject(actor, exam.subjectId);
  if (exam.courseId) return canAccessCourse(actor, exam.courseId);
  // A mock scoped to nothing is not sellable content; treat as open.
  return true;
}

/**
 * Picks the questions for one attempt (§8).
 *
 * Only published questions, no duplicates, honouring the configured count and
 * randomisation. Deliberately reads ids first so the whole bank is never
 * loaded to pick a handful.
 */
async function selectQuestionIds(exam: {
  id?: string;
  courseId: string | null;
  subjectId: string | null;
  questionCount: number;
  randomize: boolean;
  isFreeTrial?: boolean;
}): Promise<string[]> {
  // A mock an admin built by hand uses the questions they chose, and only
  // those. Most mocks have no picks and fall straight through to the scope
  // draw below, which is how every mock behaved before picking existed.
  if (exam.id) {
    const picked = await db.mockExamQuestion.findMany({
      where: { mockExamId: exam.id, question: { status: "PUBLISHED" } },
      orderBy: { order: "asc" },
      select: { questionId: true },
    });
    if (picked.length > 0) {
      const ids = picked.map((p) => p.questionId);
      if (exam.randomize) {
        for (let i = ids.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [ids[i], ids[j]] = [ids[j], ids[i]];
        }
      }
      return ids.slice(0, exam.questionCount);
    }
  }

  const where: Prisma.QuestionWhereInput = {
    status: "PUBLISHED",
    // The paid bank stays out of the shop window: a trial sees only what has
    // been marked for it.
    ...(exam.isFreeTrial ? { freeTrialEligible: true } : {}),
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
  };

  const rows = await db.question.findMany({
    where,
    select: { id: true },
    orderBy: { order: "asc" },
  });

  const ids = rows.map((r) => r.id);
  if (exam.randomize) {
    // Fisher-Yates, so every ordering is equally likely.
    for (let i = ids.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [ids[i], ids[j]] = [ids[j], ids[i]];
    }
  }
  return ids.slice(0, exam.questionCount);
}

/**
 * Starts an attempt, or returns the one already in progress.
 *
 * Returning the live attempt is what makes refresh safe: the student resumes
 * the same paper with the same remaining time rather than getting a fresh one.
 */
export async function startAttempt(actor: Actor, mockExamId: string): Promise<MockAttempt> {
  const exam = await db.mockExam.findUnique({
    where: { id: mockExamId },
    include: { subject: { select: { title: true } } },
  });
  if (!exam || exam.status !== "PUBLISHED") {
    throw new MockError("That mock exam is not available.", "NOT_FOUND");
  }
  if (!(await canSitMock(actor, exam))) {
    throw new MockError("You do not have access to this mock exam.", "FORBIDDEN");
  }

  const live = await db.mockAttempt.findFirst({
    where: { userId: actor.id, mockExamId, status: "IN_PROGRESS" },
    orderBy: { startedAt: "desc" },
  });
  if (live) {
    // Expired while they were away — finalise it rather than resuming.
    if (live.expiresAt <= new Date()) {
      await finaliseAttempt(live.id, { auto: true });
      throw new MockError("Your previous attempt expired and has been submitted.", "EXPIRED");
    }
    return live;
  }

  const questionIds = await selectQuestionIds(exam);
  if (questionIds.length === 0) {
    throw new MockError(
      "This mock has no published questions yet.",
      "NOT_ENOUGH_QUESTIONS",
    );
  }
  // A free trial is advertised as ten questions, so it is ten or it is not
  // offered. Handing out a six-question paper would let a student judge the
  // product on something that is not the product. The chooser already checks
  // this; the check is repeated here because a stale link bypasses the
  // chooser entirely.
  if (exam.isFreeTrial && questionIds.length < exam.questionCount) {
    throw new MockError(
      "This free mock is not available yet.",
      "NOT_ENOUGH_QUESTIONS",
    );
  }

  const questions = await db.question.findMany({
    where: { id: { in: questionIds } },
    include: {
      options: { orderBy: { order: "asc" } },
      // The KiwiPilotPrep section is read from the module the question was
      // assigned to, and from nowhere else. See lib/report/section.ts.
      module: { select: { sectionCode: true, title: true } },
      lesson: { select: { pointNumber: true, title: true } },
    },
  });
  const byId = new Map(questions.map((q) => [q.id, q]));

  const previous = await db.mockAttempt.count({ where: { userId: actor.id, mockExamId } });
  const startedAt = new Date();
  const expiresAt = new Date(startedAt.getTime() + exam.durationMinutes * 60_000);

  return db.$transaction(async (tx) => {
    // Spending the free mock and creating the attempt are one act. The
    // unique constraint on `FreeTrialUse.userId` is what makes "one per
    // account" true rather than merely checked: a second trial — a different
    // subject, a stale link, two clicks at once — fails the insert and takes
    // the attempt down with it.
    if (exam.isFreeTrial) {
      try {
        await tx.freeTrialUse.create({
          data: { userId: actor.id, subjectId: exam.subjectId },
        });
      } catch {
        throw new MockError(
          "You have already used your free mock.",
          "FORBIDDEN",
        );
      }
    }

    const attempt = await tx.mockAttempt.create({
      data: {
        userId: actor.id,
        mockExamId,
        attemptNumber: previous + 1,
        startedAt,
        expiresAt,
        status: "IN_PROGRESS",
        totalQuestions: questionIds.length,
        unansweredCount: questionIds.length,
        examTitle: exam.title,
        subjectTitle: exam.subject?.title ?? null,
      },
    });

    await tx.mockAttemptQuestion.createMany({
      data: questionIds.map((id, index) => {
        const q = byId.get(id)!;
        const section = questionSection(q);
        return {
          attemptId: attempt.id,
          questionId: q.id,
          order: index,
          promptSnapshot: q.prompt,
          explanationSnapshot: q.explanation,
          // Frozen at the section the question carried on the day. A
          // curriculum renamed or renumbered afterwards must not rewrite a
          // report a student already holds.
          kdrCodeSnapshot: section?.code ?? null,
          kdrTopicSnapshot: section?.title ?? null,
          // Null unless the question was mapped to a point, so a
          // chapter-mapped question never gains a chapter line above an
          // identical one.
          kdrChapterSnapshot: section?.chapter ?? null,
          caanzRefSnapshot: q.caanzRef,
          ac61RefSnapshot: q.ac61Ref,
          optionsSnapshot: q.options.map((o) => ({
            id: o.id,
            text: o.text,
            isCorrect: o.isCorrect,
            order: o.order,
          })) as unknown as Prisma.InputJsonValue,
        };
      }),
    });

    // The claim is written before the attempt exists, so its id is filled in
    // here. Kept for support: it answers "which trial did they use" without
    // a join through the mock exam table.
    if (exam.isFreeTrial) {
      await tx.freeTrialUse.update({
        where: { userId: actor.id },
        data: { attemptId: attempt.id },
      });
    }

    return attempt;
  });
}

/** Milliseconds left, from the server's clock. Never negative. */
export function remainingMs(attempt: { expiresAt: Date }): number {
  return Math.max(0, attempt.expiresAt.getTime() - Date.now());
}

/**
 * Loads an attempt for its owner, finalising it first if the clock has run out.
 *
 * This is the "next server interaction detects expiry" path in §10: even if the
 * browser was closed at 00:00, the attempt is finalised the moment anything
 * touches it again.
 */
export async function loadAttempt(actor: Actor, attemptId: string) {
  const attempt = await db.mockAttempt.findUnique({
    where: { id: attemptId },
    include: {
      mockExam: true,
      questions: { orderBy: { order: "asc" } },
    },
  });

  if (!attempt) throw new MockError("Attempt not found.", "NOT_FOUND");
  // An attempt belongs to exactly one student. Admins may inspect (§20).
  if (attempt.userId !== actor.id && actor.role !== "ADMIN") {
    throw new MockError("Attempt not found.", "NOT_FOUND");
  }

  if (attempt.status === "IN_PROGRESS" && attempt.expiresAt <= new Date()) {
    await finaliseAttempt(attempt.id, { auto: true });
    return loadAttempt(actor, attemptId);
  }

  return attempt;
}

/**
 * Records one answer.
 *
 * Refuses after expiry, which is why the client timer cannot be gamed: the
 * server compares against `expiresAt` on every single call.
 */
export async function saveAnswer(
  actor: Actor,
  attemptId: string,
  attemptQuestionId: string,
  selectedOptionId: string | null,
): Promise<{ savedAt: Date; remainingMs: number }> {
  const attempt = await db.mockAttempt.findUnique({ where: { id: attemptId } });
  if (!attempt) throw new MockError("Attempt not found.", "NOT_FOUND");
  if (attempt.userId !== actor.id) throw new MockError("Attempt not found.", "NOT_FOUND");
  if (attempt.status !== "IN_PROGRESS") {
    throw new MockError("This attempt has already been submitted.", "ALREADY_SUBMITTED");
  }
  if (attempt.expiresAt <= new Date()) {
    await finaliseAttempt(attempt.id, { auto: true });
    throw new MockError("Time is up — this attempt has been submitted.", "EXPIRED");
  }

  const row = await db.mockAttemptQuestion.findUnique({ where: { id: attemptQuestionId } });
  if (!row || row.attemptId !== attemptId) {
    throw new MockError("Question not found on this attempt.", "NOT_FOUND");
  }

  // The option must be one this attempt actually offered.
  if (selectedOptionId !== null) {
    const options = toOptions(row.optionsSnapshot);
    if (!options.some((o) => o.id === selectedOptionId)) {
      throw new MockError("That option is not part of this question.", "NOT_FOUND");
    }
  }

  await db.mockAttemptQuestion.update({
    where: { id: attemptQuestionId },
    // isCorrect stays null until submission; nothing about correctness is
    // computed or revealed while the paper is live (§12).
    data: { selectedOptionId, answeredAt: selectedOptionId ? new Date() : null },
  });

  return { savedAt: new Date(), remainingMs: remainingMs(attempt) };
}

/**
 * Marks, scores and closes an attempt (§9, §10).
 *
 * Everything happens in one transaction, and the guard re-reads status inside
 * it so a double submit — or a submit racing the expiry sweep — cannot score
 * the paper twice.
 *
 * The scorecard email is sent from here rather than from the submit action,
 * because there are four ways an attempt reaches this function and only two of
 * them go through that action. A student who closed the tab and let the clock
 * run out had their paper marked by the expiry sweep and their KDR written,
 * and then heard nothing. Sending from the one place that marks the paper
 * means every path that produces a KDR also delivers it.
 *
 * It goes out after the transaction commits and only when this call is the one
 * that did the scoring — an attempt that was already finalised returns early
 * and sends nothing, so a submit racing the sweep still sends one email.
 */
export async function finaliseAttempt(
  attemptId: string,
  { auto = false }: { auto?: boolean } = {},
): Promise<MockAttempt> {
  let scored = false;

  const result = await db.$transaction(async (tx) => {
    const attempt = await tx.mockAttempt.findUnique({
      where: { id: attemptId },
      include: { mockExam: true, questions: true },
    });
    if (!attempt) throw new MockError("Attempt not found.", "NOT_FOUND");

    // Already finalised: return as-is rather than re-scoring.
    if (attempt.status !== "IN_PROGRESS") {
      return attempt;
    }

    // Claim the attempt before scoring it.
    //
    // Reading the status and then acting on it is not enough: at the default
    // isolation level two submissions can both read IN_PROGRESS and both go
    // on to score, which wrote the KDR breakdown twice and made a four
    // question paper report forty questions attempted. That is a real
    // sequence — a double-click on Submit, or the timer firing at the same
    // moment as a manual submit.
    //
    // A conditional UPDATE settles it in the database: it locks the row, and
    // only the first transaction finds it still IN_PROGRESS. Everyone else
    // matches nothing, and returns the finished attempt rather than scoring
    // it a second time.
    const claimed = await tx.mockAttempt.updateMany({
      where: { id: attemptId, status: "IN_PROGRESS" },
      data: { status: auto ? "EXPIRED" : "SUBMITTED" },
    });
    if (claimed.count === 0) {
      return tx.mockAttempt.findUniqueOrThrow({ where: { id: attemptId } });
    }

    let correct = 0;
    let incorrect = 0;
    let unanswered = 0;

    type Bucket = {
      code: string | null;
      topic: string | null;
      chapter: string | null;
      attempted: number;
      correct: number;
    };
    const kdr = new Map<string, Bucket>();

    for (const q of attempt.questions) {
      const options = toOptions(q.optionsSnapshot);
      const correctOption = options.find((o) => o.isCorrect);

      let isCorrect: boolean | null = null;
      if (!q.selectedOptionId) {
        unanswered++;
      } else {
        isCorrect = correctOption ? q.selectedOptionId === correctOption.id : false;
        if (isCorrect) correct++;
        else incorrect++;
      }

      await tx.mockAttemptQuestion.update({
        where: { id: q.id },
        data: { isCorrect },
      });

      // Questions with no KDR mapping still mark normally; they simply do not
      // appear in the breakdown (§13).
      if (q.kdrCodeSnapshot || q.kdrTopicSnapshot) {
        const key = `${q.kdrCodeSnapshot ?? ""}::${q.kdrTopicSnapshot ?? ""}`;
        const bucket = kdr.get(key) ?? {
          code: q.kdrCodeSnapshot,
          topic: q.kdrTopicSnapshot,
          chapter: q.kdrChapterSnapshot,
          attempted: 0,
          correct: 0,
        };
        // Unanswered questions count as attempted-and-wrong for KDR, because
        // a blank is a knowledge gap in exactly the way a wrong answer is.
        bucket.attempted++;
        if (isCorrect) bucket.correct++;
        kdr.set(key, bucket);
      }
    }

    const total = attempt.questions.length;
    const scorePercent = total === 0 ? 0 : Math.round((correct / total) * 100);
    const passed =
      attempt.mockExam.passingPercent === null
        ? null
        : scorePercent >= attempt.mockExam.passingPercent;

    if (kdr.size > 0) {
      await tx.kdrResult.createMany({
        data: [...kdr.values()].map((b) => ({
          userId: attempt.userId,
          attemptId: attempt.id,
          kdrCode: b.code,
          kdrTopic: b.topic,
          kdrChapter: b.chapter,
          attempted: b.attempted,
          correct: b.correct,
          incorrect: b.attempted - b.correct,
          accuracy: b.attempted === 0 ? 0 : Math.round((b.correct / b.attempted) * 100),
        })),
      });
    }

    scored = true;
    return tx.mockAttempt.update({
      where: { id: attempt.id },
      data: {
        status: auto ? "EXPIRED" : "SUBMITTED",
        submittedAt: new Date(),
        autoSubmitted: auto,
        totalQuestions: total,
        correctCount: correct,
        incorrectCount: incorrect,
        unansweredCount: unanswered,
        scorePercent,
        passed,
      },
    });
  });

  if (scored) await sendScorecard(attemptId, result.userId, result.scorePercent);
  return result;
}

/**
 * Hands the finished attempt to the mailer.
 *
 * Imported at call time on purpose: `lib/email/scorecard` reads `kdrBand`
 * from this module, so a static import back would be a cycle.
 *
 * Nothing in here may take a submission down with it. A mailer that is not
 * configured, a provider that rejects the address, a request context that has
 * no headers to build a link from — all of it is caught and logged, because
 * the paper is already marked and the KDR is already on the student's
 * dashboard whether or not the email leaves.
 */
async function sendScorecard(attemptId: string, userId: string, scorePercent: number): Promise<void> {
  // Creating the row is how delivery is claimed, and `attemptId` is unique,
  // so exactly one caller can ever claim it. An upsert would not do: two
  // finalisations racing each other would both update an existing row and
  // both go on to send, which is the one outcome a student must never see.
  // The loser of the race simply returns.
  //
  // A deliberate retry does not come through here — `retryReportDelivery`
  // owns that path and is explicit about sending again.
  const claimed = await db.mockReport
    .create({ data: { attemptId, userId, scorePercent, status: "PENDING", attempts: 1 } })
    .then(() => true)
    .catch(() => false);
  if (!claimed) return;

  await deliver(attemptId);
}

/**
 * Builds the report, mails it, and records how that went.
 *
 * Separate from claiming so a first delivery and a deliberate retry share one
 * implementation: whoever holds the claim calls this.
 */
async function deliver(attemptId: string): Promise<void> {

  try {
    const [{ sendScorecardEmail }, { emailBaseUrl }] = await Promise.all([
      import("@/lib/email/scorecard"),
      import("@/lib/site-url"),
    ]);
    const outcome = await sendScorecardEmail(attemptId, await emailBaseUrl());

    await db.mockReport.update({
      where: { attemptId },
      data:
        outcome === null
          ? { status: "FAILED", error: "the attempt produced no report" }
          : {
              // LOGGED means no mail provider is configured, which is a
              // complete outcome in development rather than a failure.
              status: outcome.status === "FAILED" ? "FAILED" : "SENT",
              pdfBytes: outcome.pdfBytes,
              generatedAt: outcome.pdfBytes === null ? null : new Date(),
              sentAt: outcome.status === "FAILED" ? null : new Date(),
              error: outcome.error?.slice(0, 500) ?? null,
            },
    });
  } catch (error) {
    // Nothing in here may take a submission down with it. The paper is marked
    // and the result is stored; a mailer that is not configured, a provider
    // that rejects the address or a request context with no headers to build a
    // link from are all recorded and left for a retry.
    console.error("[email] scorecard failed:", error);
    await db.mockReport
      .update({
        where: { attemptId },
        data: { status: "FAILED", error: (error instanceof Error ? error.message : String(error)).slice(0, 500) },
      })
      .catch(() => null);
  }
}

/**
 * Builds and delivers the report for an attempt that has one outstanding.
 *
 * The student's result is never at stake here — it is already stored — so this
 * is safe to call again after a failure. It refuses to run on an attempt whose
 * report has already gone out.
 */
export async function retryReportDelivery(attemptId: string, userId: string): Promise<boolean> {
  const attempt = await db.mockAttempt.findUnique({
    where: { id: attemptId },
    select: { userId: true, status: true, scorePercent: true },
  });
  if (!attempt || attempt.userId !== userId) return false;
  if (attempt.status === "IN_PROGRESS") return false;

  const existing = await db.mockReport.findUnique({ where: { attemptId }, select: { status: true } });
  if (existing?.status === "SENT") return true;

  if (existing) {
    // The claim is already held — by a delivery that failed, or by one that
    // never finished. Count the attempt and go again.
    await db.mockReport.update({ where: { attemptId }, data: { attempts: { increment: 1 } } });
    await deliver(attemptId);
  } else {
    // An attempt finished before reports existed has no row at all.
    await sendScorecard(attemptId, userId, attempt.scorePercent);
  }
  const after = await db.mockReport.findUnique({ where: { attemptId }, select: { status: true } });
  return after?.status === "SENT";
}

/**
 * Finalises any attempt whose clock ran out while nobody was looking.
 *
 * Called opportunistically from student-facing pages rather than by a job
 * runner, so no queue infrastructure is introduced for this phase (§10).
 */
export async function sweepExpiredAttempts(userId?: string): Promise<number> {
  const stale = await db.mockAttempt.findMany({
    where: {
      status: "IN_PROGRESS",
      expiresAt: { lte: new Date() },
      ...(userId ? { userId } : {}),
    },
    select: { id: true },
    take: 25,
  });

  for (const a of stale) {
    await finaliseAttempt(a.id, { auto: true }).catch(() => null);
  }
  return stale.length;
}

/** KDR banding, using the thresholds configured on the mock (§14). */
export function kdrBand(
  accuracy: number,
  strongPercent: number,
  weakPercent: number,
): "strong" | "improving" | "weak" {
  if (accuracy >= strongPercent) return "strong";
  if (accuracy < weakPercent) return "weak";
  return "improving";
}
