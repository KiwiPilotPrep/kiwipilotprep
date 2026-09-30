import "server-only";

import { db } from "@/lib/db";

/**
 * The free 10-question mock trial.
 *
 * Not a second exam engine. A trial is an ordinary `MockExam` scoped to one
 * subject with `isFreeTrial` set, so it runs through `startAttempt`,
 * `finaliseAttempt`, the KDR aggregation, the report and the email exactly as
 * a paid mock does. A student who finishes one gets the same scorecard, the
 * same PDF and the same "View My Result" link.
 *
 * Three things make it a trial rather than a mock:
 *
 *   it is provisioned by this module rather than built by an admin, so a new
 *   subject offers a trial the moment enough of its questions are marked
 *   eligible, and nobody has to hand-build fifteen of them;
 *
 *   it draws only from questions flagged `freeTrialEligible`, which is how the
 *   paid bank stays out of the shop window;
 *
 *   it needs no entitlement, and a student gets exactly one for their whole
 *   account — not one per subject. Choosing a subject spends it.
 *
 * That last rule is held by the database. `FreeTrialUse.userId` is unique and
 * the row is written in the same transaction as the attempt, so a second
 * trial cannot be created by racing two requests, by picking a different
 * subject, or by keeping a stale link to a subject that was never used.
 */

export const TRIAL_QUESTION_COUNT = 10;
export const TRIAL_DURATION_MINUTES = 12;

/**
 * Which subjects the free mock is offered for at all.
 *
 * Only courses that opt in. The flight test groundwork courses do not: they
 * are oral preparation with no multi-choice bank, and listing them as "not
 * available yet" would promise something that is never coming.
 */
const TRIAL_SUBJECT_SCOPE = {
  status: "PUBLISHED",
  course: { status: "PUBLISHED", freeTrialEnabled: true },
} as const;

/** How many questions of this subject a trial could draw on right now. */
export async function eligibleQuestionCount(subjectId: string): Promise<number> {
  return db.question.count({
    where: {
      status: "PUBLISHED",
      freeTrialEligible: true,
      OR: [{ subjectId }, { chapter: { subjectId } }],
    },
  });
}

export type TrialSubject = {
  subjectId: string;
  subjectSlug: string;
  subjectTitle: string;
  courseSlug: string;
  courseTitle: string;
  eligible: number;
  /** False when the subject has not got ten eligible questions yet. */
  ready: boolean;
};

export type TrialState = {
  subjects: TrialSubject[];
  /** Set once the student has spent their one free mock. */
  used: {
    subjectTitle: string | null;
    attemptId: string | null;
    at: Date;
  } | null;
};

/** Has this student already spent their one free mock? */
export async function trialUsed(userId: string): Promise<boolean> {
  return (await db.freeTrialUse.count({ where: { userId } })) > 0;
}

/**
 * Everything the chooser needs: the subjects on offer, and whether this
 * student still has their free mock.
 *
 * Unready subjects are returned too. A chooser that silently omits half the
 * syllabus looks broken, whereas one that shows a subject as not yet
 * available is merely honest — and the subjects that will never be offered
 * are excluded by scope rather than shown as pending.
 */
export async function trialState(userId: string | null): Promise<TrialState> {
  const subjects = await db.subject.findMany({
    where: TRIAL_SUBJECT_SCOPE,
    orderBy: [{ course: { order: "asc" } }, { order: "asc" }],
    select: {
      id: true,
      slug: true,
      title: true,
      course: { select: { slug: true, title: true } },
    },
  });

  const counts = await db.question.groupBy({
    by: ["subjectId"],
    where: { status: "PUBLISHED", freeTrialEligible: true, subjectId: { not: null } },
    _count: { _all: true },
  });
  const bySubject = new Map(counts.map((c) => [c.subjectId as string, c._count._all]));

  // Questions hung off a chapter rather than the subject directly still count.
  const viaChapter = await db.question.findMany({
    where: { status: "PUBLISHED", freeTrialEligible: true, subjectId: null, chapter: { isNot: null } },
    select: { chapter: { select: { subjectId: true } } },
  });
  for (const q of viaChapter) {
    const id = q.chapter?.subjectId;
    if (id) bySubject.set(id, (bySubject.get(id) ?? 0) + 1);
  }

  const use = userId
    ? await db.freeTrialUse.findUnique({
        where: { userId },
        select: { attemptId: true, createdAt: true, subject: { select: { title: true } } },
      })
    : null;

  return {
    subjects: subjects.map((s) => {
      const eligible = bySubject.get(s.id) ?? 0;
      return {
        subjectId: s.id,
        subjectSlug: s.slug,
        subjectTitle: s.title,
        courseSlug: s.course.slug,
        courseTitle: s.course.title,
        eligible,
        ready: eligible >= TRIAL_QUESTION_COUNT,
      };
    }),
    used: use
      ? {
          subjectTitle: use.subject?.title ?? null,
          attemptId: use.attemptId,
          at: use.createdAt,
        }
      : null,
  };
}

/** Is this subject one the free mock may be offered for? */
export async function trialSubjectAllowed(subjectId: string): Promise<boolean> {
  return (await db.subject.count({ where: { id: subjectId, ...TRIAL_SUBJECT_SCOPE } })) > 0;
}

/**
 * The trial mock for a subject, created the first time it is needed.
 *
 * Returns null when the subject is out of scope, or has too few eligible
 * questions. Starting a ten-question mock with six questions in it would be
 * worse than saying so: the student would take a short exam believing it was
 * the real shape of one.
 */
export async function trialExamFor(subjectId: string): Promise<{ id: string } | null> {
  if (!(await trialSubjectAllowed(subjectId))) return null;

  const existing = await db.mockExam.findFirst({
    where: { isFreeTrial: true, subjectId },
    select: { id: true },
  });

  if ((await eligibleQuestionCount(subjectId)) < TRIAL_QUESTION_COUNT) {
    // An existing trial whose bank has shrunk is withdrawn rather than left to
    // hand out a short paper.
    if (existing) await db.mockExam.update({ where: { id: existing.id }, data: { status: "DRAFT" } });
    return null;
  }

  if (existing) {
    await db.mockExam.update({ where: { id: existing.id }, data: { status: "PUBLISHED" } });
    return existing;
  }

  const subject = await db.subject.findUnique({
    where: { id: subjectId },
    select: { id: true, title: true, courseId: true, course: { select: { slug: true } } },
  });
  if (!subject) return null;

  return db.mockExam.create({
    data: {
      slug: `free-trial-${subject.course.slug}-${subjectId.slice(-8)}`,
      title: `${subject.title} — Free 10-Question Mock`,
      description: "A free ten-question sample of the mock exam experience.",
      courseId: subject.courseId,
      subjectId: subject.id,
      questionCount: TRIAL_QUESTION_COUNT,
      durationMinutes: TRIAL_DURATION_MINUTES,
      // No pass mark: ten questions is a sample, and calling a sample a pass
      // or a fail would say more than it can support.
      passingPercent: null,
      randomize: true,
      isFreeTrial: true,
      status: "PUBLISHED",
    },
    select: { id: true },
  });
}
