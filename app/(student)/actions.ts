"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { canAccessSubject } from "@/lib/entitlements";

/**
 * True when the question falls inside the student's free-trial window for the
 * subject. The window is defined the same way the trial page defines it, so a
 * crafted request cannot reach past the cap into the paid bank.
 */
async function isWithinTrial(userId: string, subjectId: string, questionId: string) {
  const trial = await db.trialAccess.findUnique({
    where: { userId_subjectId: { userId, subjectId } },
    select: { questionLimit: true },
  });
  if (!trial) return false;

  const allowed = await db.question.findMany({
    where: {
      status: "PUBLISHED",
      OR: [{ subjectId }, { chapter: { subjectId } }],
    },
    orderBy: { order: "asc" },
    take: trial.questionLimit,
    select: { id: true },
  });
  return allowed.some((q) => q.id === questionId);
}

/**
 * Student mutations. Each one re-checks entitlement server-side, because a
 * chapter id in a form post is user input like any other.
 */

async function assertChapterAccess(userId: string, role: "STUDENT" | "ADMIN", chapterId: string) {
  const chapter = await db.chapter.findUnique({
    where: { id: chapterId },
    select: {
      id: true,
      status: true,
      subject: { select: { id: true, status: true, courseId: true } },
    },
  });
  if (!chapter || chapter.status !== "PUBLISHED" || chapter.subject.status !== "PUBLISHED") {
    throw new Error("That chapter is not available.");
  }
  if (!(await canAccessSubject({ id: userId, role }, chapter.subject.id))) {
    throw new Error("You do not have access to this subject.");
  }
  return chapter;
}

/** Mark complete / undo. Writes a real row so progress survives logout (§21). */
export async function setChapterComplete(chapterId: string, complete: boolean, path: string) {
  const user = await requireUser();
  await assertChapterAccess(user.id, user.role, chapterId);

  const now = new Date();
  await db.chapterProgress.upsert({
    where: { userId_chapterId: { userId: user.id, chapterId } },
    create: {
      userId: user.id,
      chapterId,
      completedAt: complete ? now : null,
      lastViewedAt: now,
    },
    update: { completedAt: complete ? now : null, lastViewedAt: now },
  });

  revalidatePath(path);
  revalidatePath("/dashboard");
  revalidatePath("/progress");
}

/** Records a practice answer (§22). Correctness is decided on the server. */
export async function answerQuestion(questionId: string, optionId: string, path: string) {
  const user = await requireUser();

  const question = await db.question.findUnique({
    where: { id: questionId },
    select: {
      id: true,
      status: true,
      chapterId: true,
      subjectId: true,
      options: { select: { id: true, isCorrect: true } },
    },
  });
  if (!question || question.status !== "PUBLISHED") {
    throw new Error("That question is not available.");
  }
  // Entitled students answer anything in their subject; trial students may
  // answer only within the capped set the trial page could show them.
  if (question.subjectId || question.chapterId) {
    const subjectId =
      question.subjectId ??
      (
        await db.chapter.findUnique({
          where: { id: question.chapterId! },
          select: { subjectId: true },
        })
      )?.subjectId;

    if (subjectId) {
      const entitled = await canAccessSubject({ id: user.id, role: user.role }, subjectId);
      if (!entitled && !(await isWithinTrial(user.id, subjectId, question.id))) {
        throw new Error("You do not have access to this question.");
      }
    }
  }

  const chosen = question.options.find((o) => o.id === optionId);
  if (!chosen) throw new Error("Unknown option.");

  await db.questionAttempt.create({
    data: {
      userId: user.id,
      questionId,
      selectedOptionId: chosen.id,
      isCorrect: chosen.isCorrect,
    },
  });

  revalidatePath(path);
  return { isCorrect: chosen.isCorrect };
}
