import "server-only";

import { db } from "@/lib/db";

/**
 * The canonical curriculum mapping, in one place.
 *
 *   Course → Subject → Chapter → Point → Topic/Lesson content
 *
 * A chapter is a `CourseModule`; its number is `chapterNumber`, counted
 * inside its own subject. A point is a `Lesson`; its number is
 * `pointNumber`, counted inside its own chapter. So Air Law chapter 27 is
 * "27 — Emergency Communications and Signals" and its third point is
 * "27.3 — Ground-Air Visual Signals".
 *
 * Both numbers are columns. Nothing here counts array positions, loop
 * indices, row ids, creation order, sort order, or a subject's place in its
 * course. That last one is the bug this module exists to make impossible:
 * codes used to be written "<subject's position>.<chapter's position>", so
 * chapter 27 of the first subject came out as "1.27".
 *
 * The admin editor and the server-side validation both read from here, so
 * the list an author is offered and the list the server will accept cannot
 * drift apart.
 */

/** A chapter's code is simply its number: `27`. */
export function chapterCode(chapterNumber: number | null | undefined): string | null {
  return chapterNumber == null ? null : String(chapterNumber);
}

/** A point's code is its chapter, a dot, and its own number: `27.3`. */
export function pointCode(
  chapterNumber: number | null | undefined,
  pointNumber: number | null | undefined,
): string | null {
  if (chapterNumber == null || pointNumber == null) return null;
  return `${chapterNumber}.${pointNumber}`;
}

export type CurriculumPoint = {
  id: string;
  pointNumber: number | null;
  code: string | null;
  title: string;
};

export type CurriculumChapter = {
  id: string;
  chapterNumber: number | null;
  code: string | null;
  title: string;
  points: CurriculumPoint[];
};

/**
 * One subject's chapters, each with its points, in curriculum order.
 *
 * Ordered by the stored numbers rather than by `displayOrder`, so what an
 * admin reads is the numbering itself and not a second opinion about it.
 */
export async function subjectCurriculum(subjectId: string): Promise<CurriculumChapter[]> {
  const modules = await db.courseModule.findMany({
    where: { subjectId },
    orderBy: [{ chapterNumber: "asc" }, { displayOrder: "asc" }],
    select: {
      id: true,
      chapterNumber: true,
      title: true,
      lessons: {
        orderBy: [{ pointNumber: "asc" }, { displayOrder: "asc" }],
        select: { id: true, pointNumber: true, title: true },
      },
    },
  });

  return modules.map((m) => ({
    id: m.id,
    chapterNumber: m.chapterNumber,
    code: chapterCode(m.chapterNumber),
    title: m.title,
    points: m.lessons.map((l) => ({
      id: l.id,
      pointNumber: l.pointNumber,
      code: pointCode(m.chapterNumber, l.pointNumber),
      title: l.title,
    })),
  }));
}

export type ResolvedSection = {
  moduleId: string | null;
  lessonId: string | null;
  /** The finest code the question has — a point's if it has one. */
  kdrCode: string | null;
  kdrTopic: string | null;
};

export class SectionMappingError extends Error {}

/**
 * Resolves a chosen chapter and point against the canonical mapping.
 *
 * Refuses a chapter that belongs to another subject, and a point that
 * belongs to another chapter. Those are the two ways a question can end up
 * counted against a part of the syllabus it has nothing to do with — an Air
 * Law miss appearing under Meteorology on a student's report — so they are
 * refused here, on the server, whatever the form happened to send.
 *
 * `kdrCode` is the point's code when a point was chosen and the chapter's
 * otherwise, so a question is always grouped by the most precise place in
 * the curriculum its author actually put it.
 */
export async function resolveQuestionSection(
  subjectId: string,
  moduleId: string | null | undefined,
  lessonId: string | null | undefined,
): Promise<ResolvedSection> {
  const wantedModule = moduleId?.trim() || null;
  const wantedLesson = lessonId?.trim() || null;

  if (!wantedModule) {
    // A point without its chapter is not a place in the curriculum.
    if (wantedLesson) {
      throw new SectionMappingError("Choose the chapter that point belongs to.");
    }
    return { moduleId: null, lessonId: null, kdrCode: null, kdrTopic: null };
  }

  const chapter = await db.courseModule.findFirst({
    where: { id: wantedModule, ...(subjectId ? { subjectId } : {}) },
    select: { id: true, chapterNumber: true, title: true },
  });
  if (!chapter) {
    throw new SectionMappingError("That chapter does not belong to this question's subject.");
  }

  if (!wantedLesson) {
    return {
      moduleId: chapter.id,
      lessonId: null,
      kdrCode: chapterCode(chapter.chapterNumber),
      kdrTopic: chapter.title,
    };
  }

  const point = await db.lesson.findFirst({
    where: { id: wantedLesson, moduleId: chapter.id },
    select: { id: true, pointNumber: true, title: true },
  });
  if (!point) {
    throw new SectionMappingError("That point does not belong to the chosen chapter.");
  }

  return {
    moduleId: chapter.id,
    lessonId: point.id,
    kdrCode: pointCode(chapter.chapterNumber, point.pointNumber),
    kdrTopic: point.title,
  };
}
