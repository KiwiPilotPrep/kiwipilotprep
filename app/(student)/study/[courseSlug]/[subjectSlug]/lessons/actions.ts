"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { canAccessSubject } from "@/lib/entitlements";

/**
 * Marks a lesson complete, or clears it.
 *
 * Entitlement is re-checked here rather than trusted from the page that
 * rendered the button — a form can be submitted from a stale tab, or crafted
 * outright. The upsert is keyed on (userId, lessonId), so pressing the button
 * twice records one completion rather than two rows.
 *
 * The lesson is looked up by id, but the id alone is not authority: the
 * subject it belongs to is read from the database and the entitlement checked
 * against that, so knowing an id gets nobody access to a lesson they have not
 * bought.
 */
export async function setLessonComplete(
  lessonId: string,
  complete: boolean,
  path: string,
): Promise<void> {
  const user = await requireUser();

  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    select: {
      id: true,
      status: true,
      module: { select: { subjectId: true, status: true } },
    },
  });
  if (!lesson || lesson.status !== "PUBLISHED" || lesson.module.status !== "PUBLISHED") return;

  if (!(await canAccessSubject(user, lesson.module.subjectId))) return;

  await db.lessonProgress.upsert({
    where: { userId_lessonId: { userId: user.id, lessonId: lesson.id } },
    update: { completedAt: complete ? new Date() : null },
    create: {
      userId: user.id,
      lessonId: lesson.id,
      completedAt: complete ? new Date() : null,
    },
  });

  revalidatePath(path);
}
