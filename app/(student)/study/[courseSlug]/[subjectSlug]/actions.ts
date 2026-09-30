"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { canAccessSubject } from "@/lib/entitlements";

/**
 * Marks a syllabus item complete, or clears it.
 *
 * Entitlement is re-checked here rather than trusted from the page that
 * rendered the button: a form can be submitted from a stale tab, or crafted
 * outright. The upsert is keyed on (userId, syllabusItemId), so pressing the
 * button twice records one completion rather than two rows.
 */
export async function setItemComplete(
  code: string,
  complete: boolean,
  path: string,
): Promise<void> {
  const user = await requireUser();

  const item = await db.syllabusItem.findUnique({
    where: { code },
    select: {
      id: true,
      status: true,
      topic: { select: { subjectId: true, status: true } },
    },
  });
  if (!item || item.status !== "PUBLISHED" || item.topic.status !== "PUBLISHED") return;

  if (!(await canAccessSubject(user, item.topic.subjectId))) return;

  await db.syllabusItemProgress.upsert({
    where: { userId_syllabusItemId: { userId: user.id, syllabusItemId: item.id } },
    update: { completedAt: complete ? new Date() : null },
    create: {
      userId: user.id,
      syllabusItemId: item.id,
      completedAt: complete ? new Date() : null,
    },
  });

  revalidatePath(path);
}
