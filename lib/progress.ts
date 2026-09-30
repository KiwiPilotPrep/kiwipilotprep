import "server-only";

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
 */
async function lessonStat(
  userId: string,
  where: { subjectId: string } | { subject: { courseId: string; status: "PUBLISHED" } },
): Promise<ProgressStat | null> {
  const lessons = await db.lesson.findMany({
    where: { status: "PUBLISHED", module: { status: "PUBLISHED", ...where } },
    select: { id: true },
  });
  if (lessons.length === 0) return null;

  const completed = await db.lessonProgress.count({
    where: {
      userId,
      lessonId: { in: lessons.map((l) => l.id) },
      completedAt: { not: null },
    },
  });
  return pct(completed, lessons.length, "topic");
}

/** Study progress for one subject: completed / published topics (or chapters). */
export async function subjectProgress(
  userId: string,
  subjectId: string,
): Promise<ProgressStat> {
  const imported = await lessonStat(userId, { subjectId });
  if (imported) return imported;

  const chapters = await db.chapter.findMany({
    where: { subjectId, status: "PUBLISHED" },
    select: { id: true },
  });
  if (chapters.length === 0) return pct(0, 0);

  const completed = await db.chapterProgress.count({
    where: {
      userId,
      chapterId: { in: chapters.map((c) => c.id) },
      completedAt: { not: null },
    },
  });
  return pct(completed, chapters.length);
}

/** Study progress for a whole course, across every published subject. */
export async function courseProgress(
  userId: string,
  courseId: string,
): Promise<ProgressStat> {
  const imported = await lessonStat(userId, {
    subject: { courseId, status: "PUBLISHED" },
  });
  if (imported) return imported;

  const chapters = await db.chapter.findMany({
    where: {
      status: "PUBLISHED",
      subject: { courseId, status: "PUBLISHED" },
    },
    select: { id: true },
  });
  if (chapters.length === 0) return pct(0, 0);

  const completed = await db.chapterProgress.count({
    where: {
      userId,
      chapterId: { in: chapters.map((c) => c.id) },
      completedAt: { not: null },
    },
  });
  return pct(completed, chapters.length);
}

/**
 * How many chapters a subject really has, and what to call them.
 *
 * The subject card used to print `_count.chapters`, which for an imported
 * subject counts the four placeholder chapters the seed attaches to every
 * subject — so a subject with twenty chapters of real material advertised
 * four, and one with none at all also advertised four.
 */
export async function subjectSize(
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
}

/** Practice progress: distinct questions attempted / available (§23). */
export async function practiceProgress(
  userId: string,
  subjectId: string,
): Promise<ProgressStat> {
  const questions = await db.question.findMany({
    where: {
      status: "PUBLISHED",
      OR: [{ subjectId }, { chapter: { subjectId } }],
    },
    select: { id: true },
  });
  if (questions.length === 0) return pct(0, 0);

  const attempted = await db.questionAttempt.findMany({
    where: { userId, questionId: { in: questions.map((q) => q.id) } },
    select: { questionId: true },
    distinct: ["questionId"],
  });
  return pct(attempted.length, questions.length);
}

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
