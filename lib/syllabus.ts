import "server-only";

import { db } from "./db";
import { canAccessSubject, type Actor } from "./entitlements";

/**
 * The syllabus-indexed study material.
 *
 * The organising idea: the official CAA code is the identifier. It is what a
 * student sees on a knowledge deficiency report, what an instructor quotes,
 * and what the examiner references — so it is what the URL is built from and
 * what questions are matched against. Database ids never appear in a route.
 */

// The pure code helpers live in a client-safe module so the navigation can
// build the same URLs this file resolves. Re-exported here so server callers
// have one import.
export { codeToSlug, slugToCode, compareCodes } from "./syllabus-codes";

export type SyllabusNavItem = {
  code: string;
  requirement: string;
  hasContent: boolean;
  completed: boolean;
};

export type SyllabusNavTopic = {
  code: string;
  title: string;
  sectionNumber: string | null;
  sectionTitle: string | null;
  items: SyllabusNavItem[];
};

/**
 * The whole index for one subject, with this student's completion folded in.
 *
 * One query for the tree and one for progress, rather than a progress lookup
 * per item — a subject has a couple of hundred items and the sidebar shows
 * all of them.
 */
export async function syllabusForSubject(
  subjectId: string,
  userId?: string,
): Promise<SyllabusNavTopic[]> {
  const topics = await db.syllabusTopic.findMany({
    where: { subjectId, status: "PUBLISHED" },
    orderBy: { displayOrder: "asc" },
    include: {
      items: {
        where: { status: "PUBLISHED" },
        orderBy: { displayOrder: "asc" },
        include: { content: { select: { status: true, blocks: true } } },
      },
    },
  });

  const completed = new Set<string>();
  if (userId) {
    const rows = await db.syllabusItemProgress.findMany({
      where: { userId, completedAt: { not: null } },
      select: { syllabusItemId: true },
    });
    for (const r of rows) completed.add(r.syllabusItemId);
  }

  return topics.map((topic) => ({
    code: topic.code,
    title: topic.title,
    sectionNumber: topic.sectionNumber,
    sectionTitle: topic.sectionTitle,
    items: topic.items.map((item) => ({
      code: item.code,
      requirement: item.requirement,
      hasContent:
        item.content?.status === "PUBLISHED" &&
        Array.isArray(item.content.blocks) &&
        item.content.blocks.length > 0,
      completed: completed.has(item.id),
    })),
  }));
}

/** Flattens the tree into reading order, for previous/next. */
export function readingOrder(topics: SyllabusNavTopic[]): string[] {
  return topics.flatMap((t) => t.items.map((i) => i.code));
}

/**
 * Resolves a study page, enforcing entitlement server-side.
 *
 * Returns null when the item does not exist, is not published, or the student
 * is not entitled to the subject it belongs to — the caller renders the same
 * "not found" for all three, so a URL cannot be used to discover which
 * syllabus items exist behind a paywall.
 */
export async function studyPageFor(args: {
  courseSlug: string;
  subjectSlug: string;
  code: string;
  /** The whole actor, so an admin previewing is recognised as one (§22). */
  actor: Actor;
}) {
  const item = await db.syllabusItem.findUnique({
    where: { code: args.code },
    include: {
      content: true,
      topic: {
        include: {
          subject: {
            include: { course: { select: { id: true, slug: true, title: true } } },
          },
        },
      },
    },
  });

  if (!item || item.status !== "PUBLISHED") return null;

  const subject = item.topic.subject;
  // The code alone identifies the item, so the course and subject in the URL
  // must agree with it — otherwise one subject's URL could render another's.
  if (subject.course.slug !== args.courseSlug || subject.slug !== args.subjectSlug) return null;

  const allowed = await canAccessSubject(args.actor, subject.id);
  if (!allowed) return null;

  return { item, subject, course: subject.course };
}

/**
 * Practice questions for one syllabus item.
 *
 * Matched on `kdrCode`, which once held the external syllabus reference and
 * now holds the KiwiPilotPrep section a question was assigned to. The two
 * numberings are not the same, so this count finds questions only where a
 * subject's own section codes happen to line up with the syllabus codes —
 * which is why a lesson showing no practice questions is the normal case
 * rather than a fault. Grouping a student's result never comes through here;
 * that reads the assigned module. See lib/report/section.ts.
 */
export async function questionsForCode(code: string, subjectId: string) {
  return db.question.count({
    where: {
      status: "PUBLISHED",
      subjectId,
      OR: [{ kdrCode: code }, { kdrCode: { startsWith: `${code}.` } }],
    },
  });
}

/**
 * Search across a subject's syllabus by code or wording.
 *
 * A code search is matched as a prefix so that "12.6" finds every item in that
 * topic, and "12.6.24" finds exactly one.
 */
export async function searchSyllabus(subjectId: string, query: string) {
  const q = query.trim();
  if (q.length < 2) return [];

  // "12-6-24" typed into search should work as well as "12.6.24".
  const asCode = q.replace(/-/g, ".");

  const items = await db.syllabusItem.findMany({
    where: {
      status: "PUBLISHED",
      topic: { subjectId, status: "PUBLISHED" },
      OR: [
        { code: { startsWith: asCode } },
        { requirement: { contains: q, mode: "insensitive" } },
        { topic: { title: { contains: q, mode: "insensitive" } } },
        { topic: { code: { startsWith: asCode } } },
      ],
    },
    orderBy: [{ topic: { displayOrder: "asc" } }, { displayOrder: "asc" }],
    take: 40,
    include: { topic: { select: { code: true, title: true } } },
  });

  return items.map((i) => ({
    code: i.code,
    requirement: i.requirement,
    topicCode: i.topic.code,
    topicTitle: i.topic.title,
  }));
}
