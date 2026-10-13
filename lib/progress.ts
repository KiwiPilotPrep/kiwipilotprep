import "server-only";

import { cache } from "react";

import { db } from "./db";

/**
 * Progress is always DERIVED from ChapterProgress / QuestionAttempt rows.
 *
 * Nothing here reads a stored percentage, because a stored percentage can
 * silently disagree with the records it claims to summarise once an admin
 * adds or archives a chapter (§23: "Do NOT create fake progress percentages").
 */

export type ProgressStat = {
  total: number;
  completed: number;
  percent: number;
  /** What was counted, so a page can say "of 320 topics" and mean it. */
  unit: "chapter" | "topic";
};

/** Pure percentage helper — exported so it can be tested without a database. */
export function pct(
  completed: number,
  total: number,
  unit: ProgressStat["unit"] = "chapter",
): ProgressStat {
  return {
    total,
    completed,
    percent: total === 0 ? 0 : Math.round((completed / total) * 100),
    unit,
  };
}

/** "3 topics" / "1 chapter" — plural agreement in one place. */
export function countLabel(n: number, unit: ProgressStat["unit"]): string {
  return `${n} ${unit}${n === 1 ? "" : "s"}`;
}

/**
 * Progress is measured against whatever the student actually reads.
 *
 * A subject holds its material in one of two shapes. Subjects an administrator
 * writes in the CMS have `Chapter` rows. Subjects built from a study manual
 * have a `CourseModule` (chapter) → `Lesson` (topic) tree, and their reading is
 * recorded in `LessonProgress`. Counting only chapters made every imported
 * subject read "0 of 0 complete" behind a permanently empty bar, no matter how
 * much of it the student had worked through — a progress display that cannot
 * move is worse than none.
 *
 * So each subject is measured in its own units: lessons where a manual was
 * imported, chapters where it was not. They are never mixed, because "17 of
 * 320" and "2 of 4" are not addable quantities.
 *
 * Each statistic is two aggregate counts issued together, rather than a fetch
 * of every matching id followed by a second query that sends those ids back as
 * an IN list. The numbers are identical; what changes is the cost. Reading a
 * subject of three hundred lessons used to carry three hundred ids out to the
 * application and three hundred back, and the second query could not start
 * until the first had landed. Against a database on the same machine that is
 * invisible. Against a hosted one it is two network round trips plus a payload,
 * per subject, on pages that ask for twenty subjects at once -- which is most
 * of what /progress and /dashboard were waiting for.
 */
type LessonScope = { subjectId: string } | { subject: { courseId: string; status: "PUBLISHED" } };

async function lessonStat(
  userId: string,
  where: LessonScope,
): Promise<ProgressStat | null> {
  const published = { status: "PUBLISHED" as const, module: { status: "PUBLISHED" as const, ...where } };

  const [total, completed] = await Promise.all([
    db.lesson.count({ where: published }),
    db.lessonProgress.count({
      where: { userId, completedAt: { not: null }, lesson: published },
    }),
  ]);

  // No lessons means no manual was imported for this scope, and the caller
  // falls through to chapters. An imported subject with nothing read yet is a
  // different answer -- zero of forty -- and still returns a stat.
  if (total === 0) return null;
  return pct(completed, total, "topic");
}

/** Study progress for one subject: completed / published topics (or chapters). */
export const subjectProgress = cache(async function subjectProgress(
  userId: string,
  subjectId: string,
): Promise<ProgressStat> {
  const imported = await lessonStat(userId, { subjectId });
  if (imported) return imported;

  const [total, completed] = await Promise.all([
    db.chapter.count({ where: { subjectId, status: "PUBLISHED" } }),
    db.chapterProgress.count({
      where: { userId, completedAt: { not: null }, chapter: { subjectId, status: "PUBLISHED" } },
    }),
  ]);
  if (total === 0) return pct(0, 0);
  return pct(completed, total);
});

/** Study progress for a whole course, across every published subject. */
export const courseProgress = cache(async function courseProgress(
  userId: string,
  courseId: string,
): Promise<ProgressStat> {
  const scope = { courseId, status: "PUBLISHED" as const };

  const imported = await lessonStat(userId, { subject: scope });
  if (imported) return imported;

  const [total, completed] = await Promise.all([
    db.chapter.count({ where: { status: "PUBLISHED", subject: scope } }),
    db.chapterProgress.count({
      where: {
        userId,
        completedAt: { not: null },
        chapter: { status: "PUBLISHED", subject: scope },
      },
    }),
  ]);
  if (total === 0) return pct(0, 0);
  return pct(completed, total);
});

/**
 * How many chapters a subject really has, and what to call them.
 *
 * The subject card used to print `_count.chapters`, which for an imported
 * subject counts the four placeholder chapters the seed attaches to every
 * subject -- so a subject with twenty chapters of real material advertised
 * four, and one with none at all also advertised four.
 */
export const subjectSize = cache(async function subjectSize(
  subjectId: string,
): Promise<{ chapters: number; topics: number }> {
  const [chapters, topics, placeholders] = await Promise.all([
    db.courseModule.count({
      where: { subjectId, status: "PUBLISHED", lessons: { some: { status: "PUBLISHED" } } },
    }),
    db.lesson.count({
      where: { status: "PUBLISHED", module: { subjectId, status: "PUBLISHED" } },
    }),
    db.chapter.count({ where: { subjectId, status: "PUBLISHED" } }),
  ]);
  return chapters > 0 ? { chapters, topics } : { chapters: placeholders, topics: 0 };
});

/**
 * Practice progress: distinct questions attempted / available (§23).
 *
 * The attempted side counts questions that hold at least one attempt by this
 * student, which is the same number the previous distinct-on-questionId pass
 * produced, without carrying every question id in the subject across the wire.
 */
export const practiceProgress = cache(async function practiceProgress(
  userId: string,
  subjectId: string,
): Promise<ProgressStat> {
  const published = {
    status: "PUBLISHED" as const,
    OR: [{ subjectId }, { chapter: { subjectId } }],
  };

  const [total, attempted] = await Promise.all([
    db.question.count({ where: published }),
    db.question.count({ where: { ...published, attempts: { some: { userId } } } }),
  ]);
  if (total === 0) return pct(0, 0);
  return pct(attempted, total);
});

/** Records that a chapter was opened, and moves the "continue" pointer. */
export async function touchChapter(
  userId: string,
  chapterId: string,
  subjectId: string,
  courseId: string,
) {
  const now = new Date();
  await db.$transaction([
    db.chapterProgress.upsert({
      where: { userId_chapterId: { userId, chapterId } },
      create: { userId, chapterId, lastViewedAt: now },
      update: { lastViewedAt: now },
    }),
    db.studentProgress.upsert({
      where: { userId },
      create: {
        userId,
        lastCourseId: courseId,
        lastSubjectId: subjectId,
        lastChapterId: chapterId,
        lastActivity: now,
      },
      update: {
        lastCourseId: courseId,
        lastSubjectId: subjectId,
        lastChapterId: chapterId,
        lastActivity: now,
      },
    }),
  ]);
}
