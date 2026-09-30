"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { Prisma, type ContentStatus } from "@prisma/client";

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { slugify, disambiguate } from "@/lib/slug";

/**
 * Every mutation begins with requireAdmin(). Hiding a button in the UI is not
 * authorization — these run on the server and are the only place content
 * changes (§25).
 */

const STATUSES = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;

function fail(message: string): never {
  throw new Error(message);
}

/* ------------------------------------------------------------------ courses */

const courseSchema = z.object({
  title: z.string().trim().min(2, "Title is required."),
  slug: z.string().trim().optional(),
  description: z.string().trim().max(2000).optional(),
  accessMonths: z.coerce.number().int().min(1).max(120).default(3),
  status: z.enum(STATUSES).default("DRAFT"),
});

export async function createCourse(formData: FormData) {
  await requireAdmin();
  const parsed = courseSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) fail(parsed.error.issues[0].message);

  const { title, description, accessMonths, status } = parsed.data;
  const slug = slugify(parsed.data.slug || title);

  if (await db.course.findUnique({ where: { slug }, select: { id: true } })) {
    fail(`A course with the slug "${slug}" already exists.`);
  }

  const last = await db.course.findFirst({ orderBy: { order: "desc" }, select: { order: true } });

  const course = await db.course.create({
    data: {
      slug,
      title,
      description: description || null,
      accessMonths,
      status,
      order: (last?.order ?? -1) + 1,
    },
  });

  revalidatePath("/admin/courses");
  revalidatePath("/");
  redirect(`/admin/courses/${course.id}`);
}

export async function updateCourse(courseId: string, formData: FormData) {
  await requireAdmin();
  const parsed = courseSchema.partial().safeParse(Object.fromEntries(formData));
  if (!parsed.success) fail(parsed.error.issues[0].message);

  const { title, description, accessMonths, status } = parsed.data;
  await db.course.update({
    where: { id: courseId },
    data: {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description: description || null }),
      ...(accessMonths !== undefined && { accessMonths }),
      ...(status !== undefined && { status }),
    },
  });

  revalidatePath("/admin/courses");
  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath("/");
}

/* ----------------------------------------------------------------- subjects */

const subjectSchema = z.object({
  title: z.string().trim().min(2, "Title is required."),
  description: z.string().trim().max(2000).optional(),
  status: z.enum(STATUSES).default("DRAFT"),
});

export async function createSubject(courseId: string, formData: FormData) {
  await requireAdmin();
  const parsed = subjectSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) fail(parsed.error.issues[0].message);

  const { title, description, status } = parsed.data;
  let slug = slugify(title);

  // Slugs are unique per course, so disambiguate rather than reject.
  const clash = await db.subject.findUnique({
    where: { courseId_slug: { courseId, slug } },
    select: { id: true },
  });
  if (clash) slug = disambiguate(slug);

  const last = await db.subject.findFirst({
    where: { courseId },
    orderBy: { order: "desc" },
    select: { order: true },
  });

  await db.subject.create({
    data: {
      courseId,
      slug,
      title,
      description: description || null,
      status,
      order: (last?.order ?? -1) + 1,
    },
  });

  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath("/");
}

export async function updateSubject(subjectId: string, formData: FormData) {
  await requireAdmin();
  const parsed = subjectSchema.partial().safeParse(Object.fromEntries(formData));
  if (!parsed.success) fail(parsed.error.issues[0].message);

  const subject = await db.subject.update({
    where: { id: subjectId },
    data: {
      ...(parsed.data.title !== undefined && { title: parsed.data.title }),
      ...(parsed.data.description !== undefined && {
        description: parsed.data.description || null,
      }),
      ...(parsed.data.status !== undefined && { status: parsed.data.status }),
    },
  });

  revalidatePath(`/admin/courses/${subject.courseId}`);
  revalidatePath(`/admin/subjects/${subjectId}`);
  revalidatePath("/");
}

/* ----------------------------------------------------------------- chapters */

const chapterSchema = z.object({
  title: z.string().trim().min(2, "Title is required."),
  description: z.string().trim().max(2000).optional(),
  status: z.enum(STATUSES).default("DRAFT"),
});

export async function createChapter(subjectId: string, formData: FormData): Promise<void> {
  await requireAdmin();
  const parsed = chapterSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) fail(parsed.error.issues[0].message);

  const { title, description, status } = parsed.data;
  let slug = slugify(title);
  const clash = await db.chapter.findUnique({
    where: { subjectId_slug: { subjectId, slug } },
    select: { id: true },
  });
  if (clash) slug = disambiguate(slug);

  const last = await db.chapter.findFirst({
    where: { subjectId },
    orderBy: { order: "desc" },
    select: { order: true },
  });

  await db.chapter.create({
    data: {
      subjectId,
      slug,
      title,
      description: description || null,
      status,
      order: (last?.order ?? -1) + 1,
      content: { create: { blocks: [] } },
    },
  });

  revalidatePath(`/admin/subjects/${subjectId}`);
  revalidatePath("/");
}

export async function updateChapter(chapterId: string, formData: FormData) {
  await requireAdmin();
  const parsed = chapterSchema.partial().safeParse(Object.fromEntries(formData));
  if (!parsed.success) fail(parsed.error.issues[0].message);

  const chapter = await db.chapter.update({
    where: { id: chapterId },
    data: {
      ...(parsed.data.title !== undefined && { title: parsed.data.title }),
      ...(parsed.data.description !== undefined && {
        description: parsed.data.description || null,
      }),
      ...(parsed.data.status !== undefined && { status: parsed.data.status }),
    },
  });

  revalidatePath(`/admin/subjects/${chapter.subjectId}`);
  revalidatePath(`/admin/chapters/${chapterId}`);
  revalidatePath("/");
}

/* ------------------------------------------------- status, archive, ordering */

/**
 * Archiving is the delete (§16). The row stays, so historical ChapterProgress
 * and QuestionAttempt records keep resolving to something real.
 */
export async function setStatus(
  entity: "course" | "subject" | "chapter" | "question",
  id: string,
  status: ContentStatus,
) {
  await requireAdmin();
  if (!STATUSES.includes(status)) fail("Unknown status.");

  if (entity === "course") await db.course.update({ where: { id }, data: { status } });
  if (entity === "subject") await db.subject.update({ where: { id }, data: { status } });
  if (entity === "chapter") await db.chapter.update({ where: { id }, data: { status } });
  if (entity === "question") await db.question.update({ where: { id }, data: { status } });

  revalidatePath("/admin", "layout");
  revalidatePath("/", "layout");
}

/** Swaps this row's order with its neighbour, so ordering stays contiguous. */
export async function move(
  entity: "course" | "subject" | "chapter",
  id: string,
  direction: "up" | "down",
) {
  await requireAdmin();

  const table =
    entity === "course" ? db.course : entity === "subject" ? db.subject : db.chapter;

  // @ts-expect-error - the three delegates share this narrow shape
  const current = await table.findUnique({ where: { id } });
  if (!current) fail("Not found.");

  const scope =
    entity === "subject"
      ? { courseId: current.courseId }
      : entity === "chapter"
        ? { subjectId: current.subjectId }
        : {};

  // @ts-expect-error - see above
  const neighbour = await table.findFirst({
    where: {
      ...scope,
      order: direction === "up" ? { lt: current.order } : { gt: current.order },
    },
    orderBy: { order: direction === "up" ? "desc" : "asc" },
  });
  if (!neighbour) return;

  await db.$transaction([
    // @ts-expect-error - see above
    table.update({ where: { id: current.id }, data: { order: neighbour.order } }),
    // @ts-expect-error - see above
    table.update({ where: { id: neighbour.id }, data: { order: current.order } }),
  ]);

  revalidatePath("/admin", "layout");
  revalidatePath("/", "layout");
}

/* --------------------------------------------------------- chapter content  */

/**
 * Save Draft writes draftBlocks; Publish promotes them to the live blocks.
 * Keeping them apart is what makes preview-before-publish meaningful (§13).
 */
export async function saveContent(chapterId: string, blocksJson: string, publish: boolean) {
  await requireAdmin();

  let blocks: unknown;
  try {
    blocks = JSON.parse(blocksJson);
  } catch {
    fail("Content is not valid JSON.");
  }
  if (!Array.isArray(blocks)) fail("Content must be a list of blocks.");

  await db.chapterContent.upsert({
    where: { chapterId },
    create: publish
      ? { chapterId, blocks }
      : { chapterId, blocks: [], draftBlocks: blocks },
    update: publish
      ? { blocks, draftBlocks: Prisma.DbNull }
      : { draftBlocks: blocks },
  });

  if (publish) {
    await db.chapter.update({ where: { id: chapterId }, data: { status: "PUBLISHED" } });
  }

  revalidatePath(`/admin/chapters/${chapterId}`);
  revalidatePath("/", "layout");
}

/* ---------------------------------------------------------------- questions */

const questionSchema = z.object({
  prompt: z.string().trim().min(5, "Question text is required."),
  explanation: z.string().trim().max(4000).optional(),
  topic: z.string().trim().max(120).optional(),
  status: z.enum(STATUSES).default("DRAFT"),
  correct: z.coerce.number().int().min(0).max(9),
});

export async function saveQuestion(
  chapterId: string,
  questionId: string | null,
  formData: FormData,
): Promise<void> {
  await requireAdmin();

  const parsed = questionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) fail(parsed.error.issues[0].message);

  const options = formData
    .getAll("option")
    .map((o) => String(o).trim())
    .filter(Boolean);
  if (options.length < 2) fail("A question needs at least two options.");
  if (parsed.data.correct >= options.length) fail("Pick which option is correct.");

  const chapter = await db.chapter.findUnique({
    where: { id: chapterId },
    select: { subjectId: true },
  });
  if (!chapter) fail("Chapter not found.");

  const data = {
    prompt: parsed.data.prompt,
    explanation: parsed.data.explanation || null,
    topic: parsed.data.topic || null,
    status: parsed.data.status,
    chapterId,
    subjectId: chapter.subjectId,
  };

  if (questionId) {
    // Options are replaced wholesale; attempts reference the question, and
    // any attempt pointing at a removed option keeps its isCorrect verdict.
    await db.$transaction([
      db.question.update({ where: { id: questionId }, data }),
      db.questionOption.deleteMany({ where: { questionId } }),
      db.questionOption.createMany({
        data: options.map((text, i) => ({
          questionId,
          text,
          isCorrect: i === parsed.data.correct,
          order: i,
        })),
      }),
    ]);
  } else {
    await db.question.create({
      data: {
        ...data,
        options: {
          create: options.map((text, i) => ({
            text,
            isCorrect: i === parsed.data.correct,
            order: i,
          })),
        },
      },
    });
  }

  revalidatePath(`/admin/chapters/${chapterId}`);
}

/* Course access, products and entitlements now live in ./product-actions.ts */
