"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { ContentStatus } from "@prisma/client";

import { db } from "@/lib/db";
import {
  resolveQuestionSection,
  SectionMappingError,
} from "@/lib/curriculum/sections";
import { requireAdmin } from "@/lib/auth";
import { slugify, disambiguate } from "@/lib/slug";

/** Admin mock exam management (§19). */

const STATUSES = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;

function fail(message: string): never {
  throw new Error(message);
}

const examSchema = z.object({
  title: z.string().trim().min(2, "Title is required."),
  description: z.string().trim().max(2000).optional(),
  /** "course:<id>" or "subject:<id>", or blank for an unscoped mock. */
  scope: z.string().trim().optional(),
  questionCount: z.coerce.number().int().min(1).max(200).default(20),
  durationMinutes: z.coerce.number().int().min(1).max(600).default(40),
  passingPercent: z.string().trim().optional(),
  randomize: z.string().optional(),
  kdrStrongPercent: z.coerce.number().int().min(1).max(100).default(80),
  kdrWeakPercent: z.coerce.number().int().min(0).max(99).default(50),
  status: z.enum(STATUSES).default("DRAFT"),
});

function parseScope(scope: string | undefined) {
  if (!scope) return { courseId: null, subjectId: null };
  const [kind, id] = scope.split(":");
  if (kind === "course" && id) return { courseId: id, subjectId: null };
  if (kind === "subject" && id) return { courseId: null, subjectId: id };
  return { courseId: null, subjectId: null };
}

function parsePassing(raw: string | undefined): number | null {
  if (!raw || raw.trim() === "") return null;
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 1 || n > 100) fail("Pass mark must be between 1 and 100.");
  return n;
}

export async function createMockExam(formData: FormData) {
  await requireAdmin();
  const parsed = examSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) fail(parsed.error.issues[0].message);
  const d = parsed.data;

  if (d.kdrWeakPercent >= d.kdrStrongPercent) {
    fail("The weak threshold must be below the strong threshold.");
  }

  let slug = slugify(d.title);
  if (await db.mockExam.findUnique({ where: { slug }, select: { id: true } })) {
    slug = disambiguate(slug);
  }

  const last = await db.mockExam.findFirst({ orderBy: { order: "desc" }, select: { order: true } });

  const exam = await db.mockExam.create({
    data: {
      slug,
      title: d.title,
      description: d.description || null,
      ...parseScope(d.scope),
      questionCount: d.questionCount,
      durationMinutes: d.durationMinutes,
      passingPercent: parsePassing(d.passingPercent),
      randomize: d.randomize === "on" || d.randomize === "true",
      kdrStrongPercent: d.kdrStrongPercent,
      kdrWeakPercent: d.kdrWeakPercent,
      status: d.status,
      order: (last?.order ?? -1) + 1,
    },
  });

  revalidatePath("/admin/mocks");
  revalidatePath("/mocks");
  redirect(`/admin/mocks/${exam.id}`);
}

export async function updateMockExam(examId: string, formData: FormData) {
  await requireAdmin();
  const parsed = examSchema.partial().safeParse(Object.fromEntries(formData));
  if (!parsed.success) fail(parsed.error.issues[0].message);
  const d = parsed.data;

  if (
    d.kdrStrongPercent !== undefined &&
    d.kdrWeakPercent !== undefined &&
    d.kdrWeakPercent >= d.kdrStrongPercent
  ) {
    fail("The weak threshold must be below the strong threshold.");
  }

  await db.mockExam.update({
    where: { id: examId },
    data: {
      ...(d.title !== undefined && { title: d.title }),
      ...(d.description !== undefined && { description: d.description || null }),
      ...(d.scope !== undefined && parseScope(d.scope)),
      ...(d.questionCount !== undefined && { questionCount: d.questionCount }),
      ...(d.durationMinutes !== undefined && { durationMinutes: d.durationMinutes }),
      ...(d.passingPercent !== undefined && { passingPercent: parsePassing(d.passingPercent) }),
      ...(d.kdrStrongPercent !== undefined && { kdrStrongPercent: d.kdrStrongPercent }),
      ...(d.kdrWeakPercent !== undefined && { kdrWeakPercent: d.kdrWeakPercent }),
      ...(d.status !== undefined && { status: d.status }),
      randomize: d.randomize === "on" || d.randomize === "true",
    },
  });

  revalidatePath("/admin/mocks");
  revalidatePath(`/admin/mocks/${examId}`);
  revalidatePath("/mocks");
}

/**
 * Mocks are archived rather than deleted, because historical attempts point at
 * them and must keep resolving (§19).
 */
export async function setMockStatus(examId: string, status: ContentStatus) {
  await requireAdmin();
  await db.mockExam.update({ where: { id: examId }, data: { status } });
  revalidatePath("/admin/mocks");
  revalidatePath("/mocks");
}

/**
 * Question exam settings: the KiwiPilotPrep section, free-trial eligibility,
 * difficulty, and the internal-only external references.
 *
 * The section is chosen, not typed. It is a chapter of the question's own
 * subject, optionally narrowed to a point inside that chapter, and it is the
 * single source of truth for how their result is grouped: the "27 — Emergency
 * Communications and Signals", or the "27.3 — Ground-Air Visual Signals",
 * they read on their scorecard, in their result email and in their report all
 * come from here.
 *
 * Free text is deliberately not offered. It is what let an Air Law question
 * be filed under "Human Factors", and a section that exists only as a string
 * beside one question can never be reconciled with the curriculum.
 *
 * The code and title are written alongside the link as a denormalised copy,
 * so a grouping can be read without a join. This action is the only writer.
 *
 * The external references are kept for internal validation and are never
 * rendered to a student.
 */
const metaSchema = z.object({
  /** A CourseModule id — the chapter — or "" for deliberately unmapped. */
  moduleId: z.string().trim().max(40).optional(),
  /** A Lesson id inside that chapter — the point — or "" for the whole chapter. */
  lessonId: z.string().trim().max(40).optional(),
  caanzRef: z.string().trim().max(160).optional(),
  ac61Ref: z.string().trim().max(160).optional(),
  difficulty: z.string().trim().optional(),
  /** An unchecked box sends nothing at all, which is how it reads as false. */
  freeTrialEligible: z.union([z.literal("on"), z.literal("")]).optional(),
});

export async function updateQuestionMeta(questionId: string, formData: FormData) {
  await requireAdmin();
  const parsed = metaSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) fail(parsed.error.issues[0].message);

  let difficulty: number | null = null;
  if (parsed.data.difficulty && parsed.data.difficulty.trim() !== "") {
    const n = Number(parsed.data.difficulty);
    if (!Number.isInteger(n) || n < 1 || n > 5) fail("Difficulty must be between 1 and 5.");
    difficulty = n;
  }

  const existing = await db.question.findUnique({
    where: { id: questionId },
    select: { subjectId: true, chapter: { select: { subjectId: true } } },
  });
  if (!existing) fail("That question no longer exists.");
  const subjectId = existing.subjectId ?? existing.chapter?.subjectId ?? null;

  // A chapter from another subject, or a point from another chapter, would
  // put a student's miss against a part of the syllabus their paper never
  // covered. Both are refused by the canonical resolver rather than trusted
  // from the form — the same resolver the editor's own list is built from.
  const section = await resolveSection(subjectId ?? "", parsed.data.moduleId, parsed.data.lessonId);

  const question = await db.question.update({
    where: { id: questionId },
    data: {
      moduleId: section.moduleId,
      lessonId: section.lessonId,
      kdrCode: section.kdrCode,
      kdrTopic: section.kdrTopic,
      caanzRef: parsed.data.caanzRef || null,
      ac61Ref: parsed.data.ac61Ref || null,
      difficulty,
      freeTrialEligible: parsed.data.freeTrialEligible === "on",
    },
    select: { chapterId: true, subjectId: true },
  });

  if (question.chapterId) revalidatePath(`/admin/chapters/${question.chapterId}`);
  revalidatePath("/admin/mocks/questions");
  // Eligibility decides whether a subject can offer a free mock at all, so the
  // chooser has to be rebuilt when it changes.
  revalidatePath("/trial");
}

/**
 * ==========================================================================
 * Question authoring, inside Mock Management
 * ==========================================================================
 *
 * One editor writes everything a question needs to be sat and to be reported
 * on: the wording, the four options, which one is right, the explanation, the
 * KiwiPilotPrep section it belongs to, and whether the free mock may use it.
 *
 * The section is the part with a rule behind it. It is a CourseModule of the
 * question's own subject and nothing else — checked here on the server, not
 * only narrowed in the form — because a section from another subject would
 * report a student's miss against a part of the syllabus their paper never
 * touched.
 */

const OPTION_COUNT = 4;

const questionSchema = z.object({
  subjectId: z.string().trim().min(1, "Choose a subject."),
  moduleId: z.string().trim().optional(),
  lessonId: z.string().trim().optional(),
  prompt: z.string().trim().min(8, "The question needs a prompt."),
  explanation: z.string().trim().max(4000).optional(),
  optionA: z.string().trim().min(1, "Option A is required."),
  optionB: z.string().trim().min(1, "Option B is required."),
  optionC: z.string().trim().min(1, "Option C is required."),
  optionD: z.string().trim().min(1, "Option D is required."),
  answer: z.coerce.number().int().min(0).max(OPTION_COUNT - 1),
  difficulty: z.string().trim().optional(),
  freeTrialEligible: z.union([z.literal("on"), z.literal("")]).optional(),
  status: z.enum(STATUSES).default("DRAFT"),
});

/**
 * Resolves the chapter and point through the canonical curriculum mapping,
 * refusing a chapter from another subject or a point from another chapter.
 *
 * One resolver for both create and edit, and the same module the editor's
 * own list is built from, so what an author is offered and what the server
 * will accept are the same thing by construction.
 */
async function resolveSection(
  subjectId: string,
  moduleId: string | undefined,
  lessonId: string | undefined,
) {
  try {
    const r = await resolveQuestionSection(subjectId, moduleId, lessonId);
    return { moduleId: r.moduleId, lessonId: r.lessonId, kdrCode: r.kdrCode, kdrTopic: r.kdrTopic };
  } catch (e) {
    if (e instanceof SectionMappingError) fail(e.message);
    throw e;
  }
}

function revalidateQuestionViews() {
  revalidatePath("/admin/mocks/questions");
  revalidatePath("/admin/mocks/free-trial");
  revalidatePath("/trial");
}

export async function createQuestion(formData: FormData) {
  await requireAdmin();
  const parsed = questionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) fail(parsed.error.issues[0].message);
  const d = parsed.data;

  const subject = await db.subject.findUnique({
    where: { id: d.subjectId },
    select: { id: true, chapters: { orderBy: { order: "asc" }, take: 1, select: { id: true } } },
  });
  if (!subject) fail("That subject no longer exists.");

  const section = await resolveSection(subject.id, d.moduleId, d.lessonId);
  const last = await db.question.findFirst({
    where: { subjectId: subject.id },
    orderBy: { order: "desc" },
    select: { order: true },
  });

  const created = await db.question.create({
    data: {
      subjectId: subject.id,
      // A question still hangs off a chapter so it stays reachable from the
      // chapter page, where the teaching material is.
      chapterId: subject.chapters[0]?.id ?? null,
      ...section,
      prompt: d.prompt,
      explanation: d.explanation || null,
      difficulty: d.difficulty ? Number(d.difficulty) : null,
      freeTrialEligible: d.freeTrialEligible === "on",
      status: d.status,
      order: (last?.order ?? -1) + 1,
      options: {
        create: [d.optionA, d.optionB, d.optionC, d.optionD].map((text, i) => ({
          text,
          isCorrect: i === d.answer,
          order: i,
        })),
      },
    },
    select: { id: true },
  });

  revalidateQuestionViews();
  redirect(`/admin/mocks/questions/${created.id}?saved=1`);
}

export async function saveQuestion(questionId: string, formData: FormData) {
  await requireAdmin();
  const parsed = questionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) fail(parsed.error.issues[0].message);
  const d = parsed.data;

  const existing = await db.question.findUnique({
    where: { id: questionId },
    select: { id: true, chapterId: true, subjectId: true },
  });
  if (!existing) fail("That question no longer exists.");

  const subject = await db.subject.findUnique({
    where: { id: d.subjectId },
    select: { id: true, chapters: { orderBy: { order: "asc" }, take: 1, select: { id: true } } },
  });
  if (!subject) fail("That subject no longer exists.");

  const section = await resolveSection(subject.id, d.moduleId, d.lessonId);
  const movedSubject = existing.subjectId !== subject.id;

  await db.question.update({
    where: { id: questionId },
    data: {
      subjectId: subject.id,
      // A question follows its subject. Left on another subject's chapter it
      // would be unreachable in the CMS and would be drawn on by the wrong
      // subject's mocks.
      ...(movedSubject ? { chapterId: subject.chapters[0]?.id ?? null } : {}),
      ...section,
      prompt: d.prompt,
      explanation: d.explanation || null,
      difficulty: d.difficulty ? Number(d.difficulty) : null,
      freeTrialEligible: d.freeTrialEligible === "on",
      status: d.status,
    },
  });

  // Options are replaced rather than patched: an option's text and whether it
  // is correct travel together, and a partial update could leave a question
  // with two correct answers or none. Attempts already under way are
  // unaffected — they run on their own snapshot.
  await db.questionOption.deleteMany({ where: { questionId } });
  await db.questionOption.createMany({
    data: [d.optionA, d.optionB, d.optionC, d.optionD].map((text, i) => ({
      questionId,
      text,
      isCorrect: i === d.answer,
      order: i,
    })),
  });

  if (existing.chapterId) revalidatePath(`/admin/chapters/${existing.chapterId}`);
  revalidateQuestionViews();
  redirect(`/admin/mocks/questions/${questionId}?saved=1`);
}

export async function setQuestionStatus(questionId: string, status: ContentStatus) {
  await requireAdmin();
  const q = await db.question.update({
    where: { id: questionId },
    data: {
      status,
      // An archived question must not keep appearing in the free mock. The
      // eligibility flag goes with it, so the subject's count falls and the
      // chooser reflects what is actually available.
      ...(status === "ARCHIVED" ? { freeTrialEligible: false } : {}),
    },
    select: { chapterId: true },
  });
  if (q.chapterId) revalidatePath(`/admin/chapters/${q.chapterId}`);
  revalidateQuestionViews();
}

/**
 * Removes a question.
 *
 * Archived rather than deleted whenever an attempt has ever drawn on it.
 * Historical reports read their own snapshots and would survive a delete,
 * but the row is the remaining link between a result and the question that
 * produced it, and that link is worth keeping. A question nobody has been
 * asked is deleted outright.
 */
export async function deleteQuestion(questionId: string) {
  await requireAdmin();
  const q = await db.question.findUnique({
    where: { id: questionId },
    select: {
      chapterId: true,
      _count: { select: { attemptQuestions: true, attempts: true } },
    },
  });
  if (!q) fail("That question no longer exists.");

  if (q._count.attemptQuestions > 0 || q._count.attempts > 0) {
    await db.question.update({
      where: { id: questionId },
      data: { status: "ARCHIVED", freeTrialEligible: false },
    });
  } else {
    await db.questionOption.deleteMany({ where: { questionId } });
    await db.question.delete({ where: { id: questionId } });
  }

  if (q.chapterId) revalidatePath(`/admin/chapters/${q.chapterId}`);
  revalidateQuestionViews();
  redirect("/admin/mocks/questions");
}

/**
 * ==========================================================================
 * Hand-picking the questions in a mock
 * ==========================================================================
 *
 * A mock with no picks draws from its course or subject, which is how mocks
 * have always worked and how most of them should keep working. Picking is
 * for the case an admin wants a specific paper: once a mock has picks it
 * uses those questions and nothing else.
 *
 * Nothing here touches a finished attempt. What a student saw is snapshotted
 * onto `MockAttemptQuestion` when their paper starts, so adding or removing
 * a pick changes the next attempt and no earlier one.
 */
export async function addMockQuestions(mockExamId: string, formData: FormData) {
  await requireAdmin();

  const exam = await db.mockExam.findUnique({
    where: { id: mockExamId },
    select: { id: true, courseId: true, subjectId: true },
  });
  if (!exam) fail("That mock exam no longer exists.");

  const ids = formData.getAll("questionId").map(String).filter(Boolean);
  if (ids.length === 0) fail("Choose at least one question.");

  // Only questions the mock could legitimately draw on anyway. A mock scoped
  // to a subject must not be filled with another subject's questions by
  // posting ids at the form.
  const allowed = await db.question.findMany({
    where: {
      id: { in: ids },
      status: "PUBLISHED",
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
    },
    select: { id: true },
  });
  if (allowed.length === 0) fail("None of those questions belong to this mock's scope.");

  const last = await db.mockExamQuestion.findFirst({
    where: { mockExamId },
    orderBy: { order: "desc" },
    select: { order: true },
  });
  let order = (last?.order ?? -1) + 1;

  for (const q of allowed) {
    await db.mockExamQuestion
      .create({ data: { mockExamId, questionId: q.id, order: order++ } })
      // Unique on (mock, question): already picked, nothing to do.
      .catch(() => null);
  }

  revalidatePath(`/admin/mocks/${mockExamId}`);
  revalidatePath("/admin/mocks");
}

export async function removeMockQuestion(mockExamId: string, questionId: string) {
  await requireAdmin();
  await db.mockExamQuestion
    .delete({ where: { mockExamId_questionId: { mockExamId, questionId } } })
    .catch(() => null);
  revalidatePath(`/admin/mocks/${mockExamId}`);
  revalidatePath("/admin/mocks");
}

/**
 * Removes a mock exam.
 *
 * Archived rather than deleted the moment anyone has sat it. Attempts,
 * scores, reports and the question snapshots behind them all point at the
 * exam, and a student's history is not ours to tidy away. A mock nobody has
 * sat — a draft, a test record, a mistake — is deleted outright.
 */
export async function deleteMockExam(mockExamId: string) {
  await requireAdmin();
  const exam = await db.mockExam.findUnique({
    where: { id: mockExamId },
    select: { id: true, _count: { select: { attempts: true } } },
  });
  if (!exam) fail("That mock exam no longer exists.");

  if (exam._count.attempts > 0) {
    await db.mockExam.update({ where: { id: mockExamId }, data: { status: "ARCHIVED" } });
  } else {
    await db.mockExamQuestion.deleteMany({ where: { mockExamId } });
    await db.mockExam.delete({ where: { id: mockExamId } });
  }

  revalidatePath("/admin/mocks");
  revalidatePath("/mocks");
}
