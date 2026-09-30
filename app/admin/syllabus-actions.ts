"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { toBlocks } from "@/lib/content";

/**
 * Admin management of the syllabus index and its study content (§12).
 *
 * Built on the same server-action + revalidate pattern as the rest of the CMS,
 * so this is another set of screens in the existing console rather than a
 * second, disconnected one.
 *
 * The rule that shapes every write here: the official requirement and the
 * study content are edited separately. Saving notes cannot touch the CAA
 * wording, and editing the wording cannot touch the notes.
 */

const STATUSES = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;

function fail(message: string): never {
  throw new Error(message);
}

/** "12.6" or "12.6.24" — digits and dots only. Never derived from a title. */
const CODE = /^\d{1,3}(\.\d{1,3}){1,2}$/;

const topicSchema = z.object({
  code: z.string().trim().regex(CODE, "A topic code looks like 12.6."),
  title: z.string().trim().min(2, "A title is required."),
  sectionNumber: z.string().trim().optional(),
  sectionTitle: z.string().trim().optional(),
  status: z.enum(STATUSES).default("DRAFT"),
});

export async function createSyllabusTopic(subjectId: string, formData: FormData) {
  await requireAdmin();
  const parsed = topicSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) fail(parsed.error.issues[0].message);
  const d = parsed.data;

  const clash = await db.syllabusTopic.findUnique({
    where: { subjectId_code: { subjectId, code: d.code } },
    select: { id: true },
  });
  if (clash) fail(`Topic ${d.code} already exists in this subject.`);

  const last = await db.syllabusTopic.findFirst({
    where: { subjectId },
    orderBy: { displayOrder: "desc" },
    select: { displayOrder: true },
  });

  await db.syllabusTopic.create({
    data: {
      subjectId,
      code: d.code,
      title: d.title,
      sectionNumber: d.sectionNumber || null,
      sectionTitle: d.sectionTitle || null,
      status: d.status,
      displayOrder: (last?.displayOrder ?? -1) + 1,
    },
  });

  revalidatePath(`/admin/syllabus/${subjectId}`);
}

const itemSchema = z.object({
  code: z.string().trim().regex(CODE, "An item code looks like 12.6.24."),
  requirement: z.string().trim().min(3, "The official requirement is required."),
  title: z.string().trim().optional(),
  status: z.enum(STATUSES).default("DRAFT"),
});

export async function createSyllabusItem(topicId: string, formData: FormData) {
  await requireAdmin();
  const parsed = itemSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) fail(parsed.error.issues[0].message);
  const d = parsed.data;

  const topic = await db.syllabusTopic.findUnique({
    where: { id: topicId },
    select: { subjectId: true },
  });
  if (!topic) fail("That topic no longer exists.");

  // The code is the academic key and is unique platform-wide, so a clash is
  // reported plainly rather than silently disambiguated.
  const clash = await db.syllabusItem.findUnique({
    where: { code: d.code },
    select: { id: true },
  });
  if (clash) fail(`Syllabus item ${d.code} already exists.`);

  const last = await db.syllabusItem.findFirst({
    where: { syllabusTopicId: topicId },
    orderBy: { displayOrder: "desc" },
    select: { displayOrder: true },
  });

  await db.syllabusItem.create({
    data: {
      syllabusTopicId: topicId,
      code: d.code,
      requirement: d.requirement,
      title: d.title || null,
      status: d.status,
      displayOrder: (last?.displayOrder ?? -1) + 1,
    },
  });

  revalidatePath(`/admin/syllabus/${topic.subjectId}`);
}

/** Edits the official requirement. Deliberately separate from saving content. */
export async function updateSyllabusItem(itemId: string, formData: FormData) {
  await requireAdmin();
  const parsed = itemSchema.partial().safeParse(Object.fromEntries(formData));
  if (!parsed.success) fail(parsed.error.issues[0].message);

  const item = await db.syllabusItem.update({
    where: { id: itemId },
    data: {
      ...(parsed.data.requirement ? { requirement: parsed.data.requirement } : {}),
      ...(parsed.data.title !== undefined ? { title: parsed.data.title || null } : {}),
      ...(parsed.data.status ? { status: parsed.data.status } : {}),
    },
    select: { topic: { select: { subjectId: true } } },
  });

  revalidatePath(`/admin/syllabus/${item.topic.subjectId}`);
}

/** Saves the student-facing explanation for one item. */
export async function saveStudyContent(itemId: string, blocksJson: string, publish: boolean) {
  await requireAdmin();

  let blocks;
  try {
    blocks = toBlocks(JSON.parse(blocksJson));
  } catch {
    fail("That content could not be read.");
  }

  const item = await db.syllabusItem.findUnique({
    where: { id: itemId },
    select: { topic: { select: { subjectId: true } } },
  });
  if (!item) fail("That syllabus item no longer exists.");

  await db.studyContent.upsert({
    where: { syllabusItemId: itemId },
    update: publish
      ? { blocks, draftBlocks: undefined, status: "PUBLISHED" }
      : { draftBlocks: blocks },
    create: publish
      ? { syllabusItemId: itemId, blocks, status: "PUBLISHED" }
      : { syllabusItemId: itemId, blocks: [], draftBlocks: blocks, status: "DRAFT" },
  });

  revalidatePath(`/admin/syllabus/${item.topic.subjectId}`);
}

/**
 * Publishes, unpublishes or archives.
 *
 * Archiving rather than deleting is the only option offered, because a
 * syllabus item may already be referenced by a question, a mock attempt or a
 * student's progress (§23). Historical records must keep resolving.
 */
export async function setSyllabusStatus(
  kind: "topic" | "item",
  id: string,
  status: (typeof STATUSES)[number],
) {
  await requireAdmin();

  if (kind === "topic") {
    const t = await db.syllabusTopic.update({
      where: { id },
      data: { status },
      select: { subjectId: true },
    });
    revalidatePath(`/admin/syllabus/${t.subjectId}`);
  } else {
    const i = await db.syllabusItem.update({
      where: { id },
      data: { status },
      select: { topic: { select: { subjectId: true } } },
    });
    revalidatePath(`/admin/syllabus/${i.topic.subjectId}`);
  }
}

/** Moves a topic or item within its parent. */
export async function reorderSyllabus(
  kind: "topic" | "item",
  id: string,
  direction: "up" | "down",
) {
  await requireAdmin();
  const before = direction === "up";

  if (kind === "topic") {
    const row = await db.syllabusTopic.findUnique({ where: { id } });
    if (!row) return;
    const swap = await db.syllabusTopic.findFirst({
      where: {
        subjectId: row.subjectId,
        displayOrder: before ? { lt: row.displayOrder } : { gt: row.displayOrder },
      },
      orderBy: { displayOrder: before ? "desc" : "asc" },
    });
    if (!swap) return;
    await db.$transaction([
      db.syllabusTopic.update({ where: { id: row.id }, data: { displayOrder: swap.displayOrder } }),
      db.syllabusTopic.update({ where: { id: swap.id }, data: { displayOrder: row.displayOrder } }),
    ]);
    revalidatePath(`/admin/syllabus/${row.subjectId}`);
    return;
  }

  const row = await db.syllabusItem.findUnique({
    where: { id },
    include: { topic: { select: { subjectId: true } } },
  });
  if (!row) return;
  const swap = await db.syllabusItem.findFirst({
    where: {
      syllabusTopicId: row.syllabusTopicId,
      displayOrder: before ? { lt: row.displayOrder } : { gt: row.displayOrder },
    },
    orderBy: { displayOrder: before ? "desc" : "asc" },
  });
  if (!swap) return;
  await db.$transaction([
    db.syllabusItem.update({ where: { id: row.id }, data: { displayOrder: swap.displayOrder } }),
    db.syllabusItem.update({ where: { id: swap.id }, data: { displayOrder: row.displayOrder } }),
  ]);
  revalidatePath(`/admin/syllabus/${row.topic.subjectId}`);
}
