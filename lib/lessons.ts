import "server-only";

import { db } from "./db";
import { canAccessSubject, type Actor } from "./entitlements";

/**
 * The lecture material, in the order it was taught.
 *
 * This sits beside the syllabus rather than inside it. The syllabus is the
 * examinable index, organised by CAA code; the decks are organised the way the
 * subject is actually taught, and the two orders do not agree. Forcing the
 * lessons onto syllabus codes would mean dropping every lesson that has no
 * confident match — which is how material gets silently lost. So lessons keep
 * their own tree, and a link to a syllabus item is an optional extra.
 *
 * A lesson is addressed by its slug within its subject, never by a database
 * id, so the URL stays readable and stable across a re-import.
 */

export type LessonNavLesson = {
  slug: string;
  title: string;
  /** Its place in the syllabus, "3.4" — chapter three, fourth topic. */
  number: string;
  sourceFrom: number | null;
  sourceTo: number | null;
  blockCount: number;
  diagramCount: number;
  completed: boolean;
};

export type LessonNavModule = {
  id: string;
  title: string;
  /** What the chapter is for. Authored; null for imported material. */
  summary: string | null;
  /** Chapter number, "3". */
  number: string;
  lessons: LessonNavLesson[];
};

/**
 * Chapter and topic numbers are positional, derived here rather than stored.
 *
 * The student needs to know where they are in the course they are reading —
 * "3.4 of chapter 3" — and the source page a paragraph was lifted from tells
 * them nothing about that. It was showing "slides 111–112" instead, which is
 * navigation for the person who built the course, not for the person taking
 * it. The source range is still recorded on the row for that person.
 */

type BlockShape = { type?: unknown };

function countBlocks(blocks: unknown): { total: number; diagrams: number } {
  if (!Array.isArray(blocks)) return { total: 0, diagrams: 0 };
  let diagrams = 0;
  for (const block of blocks as BlockShape[]) {
    if (block && block.type === "figure") diagrams += 1;
  }
  return { total: blocks.length, diagrams };
}

/**
 * The whole module/lesson tree for one subject, with this student's progress
 * folded in.
 *
 * Two queries, not one per lesson: a subject runs to nearly three hundred
 * lessons and the index shows all of them.
 */
export async function lessonsForSubject(
  subjectId: string,
  userId: string,
): Promise<LessonNavModule[]> {
  const [modules, progress] = await Promise.all([
    db.courseModule.findMany({
      where: { subjectId, status: "PUBLISHED" },
      orderBy: { displayOrder: "asc" },
      select: {
        id: true,
        title: true,
        summary: true,
        lessons: {
          where: { status: "PUBLISHED" },
          orderBy: { displayOrder: "asc" },
          select: {
            id: true,
            slug: true,
            title: true,
            sourceFrom: true,
            sourceTo: true,
            content: { select: { blocks: true } },
          },
        },
      },
    }),
    db.lessonProgress.findMany({
      where: { userId, completedAt: { not: null }, lesson: { module: { subjectId } } },
      select: { lessonId: true },
    }),
  ]);

  const done = new Set(progress.map((row) => row.lessonId));

  return modules.map((module, moduleIndex) => ({
    id: module.id,
    title: module.title,
    summary: module.summary,
    number: String(moduleIndex + 1),
    lessons: module.lessons.map((lesson, lessonIndex) => {
      const counts = countBlocks(lesson.content?.blocks);
      return {
        slug: lesson.slug,
        title: lesson.title,
        number: `${moduleIndex + 1}.${lessonIndex + 1}`,
        sourceFrom: lesson.sourceFrom,
        sourceTo: lesson.sourceTo,
        blockCount: counts.total,
        diagramCount: counts.diagrams,
        completed: done.has(lesson.id),
      };
    }),
  }));
}

/**
 * Resolves one lesson for reading, after checking the student may have it.
 *
 * The entitlement check happens before any lesson content is read from the
 * database, and a student who is not entitled gets the same `null` as one
 * asking for a lesson that does not exist.
 */
export async function lessonPageFor(args: {
  courseSlug: string;
  subjectSlug: string;
  lessonSlug: string;
  actor: Actor;
}) {
  const { courseSlug, subjectSlug, lessonSlug, actor } = args;

  const subject = await db.subject.findFirst({
    where: { slug: subjectSlug, status: "PUBLISHED", course: { slug: courseSlug } },
    select: {
      id: true,
      slug: true,
      title: true,
      course: { select: { slug: true, title: true } },
    },
  });
  if (!subject) return null;
  if (!(await canAccessSubject(actor, subject.id))) return null;

  const lesson = await db.lesson.findFirst({
    where: {
      slug: lessonSlug,
      status: "PUBLISHED",
      module: { subjectId: subject.id, status: "PUBLISHED" },
    },
    select: {
      id: true,
      slug: true,
      title: true,
      sourceFrom: true,
      sourceTo: true,
      displayOrder: true,
      module: { select: { id: true, title: true, displayOrder: true } },
      item: { select: { code: true, requirement: true } },
      content: { select: { blocks: true, references: true } },
    },
  });
  if (!lesson) return null;

  return { lesson, subject, course: subject.course };
}

/**
 * The flat reading order for a subject: every lesson of every module, in the
 * order the material was taught. This is what previous/next walk along.
 */
export async function lessonReadingOrder(subjectId: string) {
  const modules = await db.courseModule.findMany({
    where: { subjectId, status: "PUBLISHED" },
    orderBy: { displayOrder: "asc" },
    select: {
      title: true,
      lessons: {
        where: { status: "PUBLISHED" },
        orderBy: { displayOrder: "asc" },
        select: { slug: true, title: true },
      },
    },
  });

  return modules.flatMap((module, moduleIndex) =>
    module.lessons.map((lesson, lessonIndex) => ({
      slug: lesson.slug,
      title: lesson.title,
      number: `${moduleIndex + 1}.${lessonIndex + 1}`,
      moduleTitle: module.title,
    })),
  );
}

/** Whether this subject has imported lecture material at all. */
export async function subjectHasLessons(subjectId: string): Promise<boolean> {
  const count = await db.courseModule.count({
    where: { subjectId, status: "PUBLISHED", lessons: { some: { status: "PUBLISHED" } } },
  });
  return count > 0;
}

/**
 * Free-text search across a subject's lessons.
 *
 * Titles are searched in the database; block text is searched in memory,
 * because the blocks are JSON and a containment query across them cannot use
 * an index. A subject is a few hundred lessons, which is small enough that
 * this stays well inside a request.
 */
export async function searchLessons(subjectId: string, query: string) {
  const term = query.trim();
  if (term.length < 2) return [];

  const lessons = await db.lesson.findMany({
    where: { status: "PUBLISHED", module: { subjectId, status: "PUBLISHED" } },
    orderBy: [{ module: { displayOrder: "asc" } }, { displayOrder: "asc" }],
    select: {
      slug: true,
      title: true,
      module: { select: { title: true } },
      content: { select: { blocks: true } },
    },
  });

  const needle = term.toLowerCase();
  const hits: Array<{ slug: string; title: string; moduleTitle: string; excerpt: string }> = [];

  for (const lesson of lessons) {
    if (lesson.title.toLowerCase().includes(needle)) {
      hits.push({
        slug: lesson.slug,
        title: lesson.title,
        moduleTitle: lesson.module.title,
        excerpt: "",
      });
      continue;
    }

    const blocks = Array.isArray(lesson.content?.blocks) ? lesson.content.blocks : [];
    for (const block of blocks as Array<{ text?: unknown }>) {
      const text = typeof block?.text === "string" ? block.text : "";
      const at = text.toLowerCase().indexOf(needle);
      if (at !== -1) {
        hits.push({
          slug: lesson.slug,
          title: lesson.title,
          moduleTitle: lesson.module.title,
          excerpt: text.slice(Math.max(0, at - 60), at + 140).trim(),
        });
        break;
      }
    }

    if (hits.length >= 40) break;
  }

  return hits;
}

/**
 * The syllabus items a lesson has been *confirmed* to teach.
 *
 * Only CONFIRMED links are ever read. The matcher writes its guesses as
 * PROPOSED, and a guess must not reach a student: someone told they lost marks
 * on 8.10.14 and sent to a lesson that does not teach it has been given a
 * wrong answer with a straight face. Confirmation is a person's act, and this
 * is the only place the reader trusts.
 */
export async function confirmedItemsForLesson(lessonId: string) {
  const rows = await db.lessonSyllabusItem.findMany({
    where: { lessonId, status: "CONFIRMED", item: { status: "PUBLISHED" } },
    orderBy: { item: { code: "asc" } },
    select: { item: { select: { code: true, requirement: true } } },
  });
  return rows.map((row) => row.item);
}

/**
 * The lessons confirmed to teach one syllabus item.
 *
 * This is what makes a knowledge deficiency report actionable: a student is
 * given a code, searches it, and lands on the material that covers it.
 */
export async function confirmedLessonsForItem(syllabusItemId: string) {
  const rows = await db.lessonSyllabusItem.findMany({
    where: { syllabusItemId, status: "CONFIRMED", lesson: { status: "PUBLISHED" } },
    orderBy: [{ confidence: "desc" }],
    select: {
      lesson: {
        select: {
          slug: true,
          title: true,
          sourceFrom: true,
          sourceTo: true,
          // The blocks come too. A syllabus item that only links out is a
          // signpost, and a student who searched a code they lost marks on
          // wants the material, not directions to it.
          content: { select: { blocks: true } },
          module: { select: { title: true, subject: { select: { slug: true, course: { select: { slug: true } } } } } },
        },
      },
    },
  });
  return rows.map((row) => row.lesson);
}

/**
 * How many items of a subject have confirmed material behind them.
 *
 * Reported as a count rather than a percentage, so a syllabus index can say
 * "31 of 139 items have study notes" instead of implying completeness it does
 * not have.
 */
export async function confirmedCoverage(subjectId: string) {
  const rows = await db.lessonSyllabusItem.findMany({
    where: {
      status: "CONFIRMED",
      item: { status: "PUBLISHED", topic: { subjectId } },
    },
    select: { syllabusItemId: true },
    distinct: ["syllabusItemId"],
  });
  return rows.length;
}
