"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

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

/**
 * Marks the lesson the student is reading complete, then moves them on.
 *
 * One control instead of two. Asking somebody to press "Mark complete" and
 * then "Next" is asking them to tell the site something it can already see: a
 * reader who has finished with this topic and wants the following one has
 * finished this one. So Next does both, and the completion is written here, on
 * the server, through the same `LessonProgress` upsert the old control used.
 *
 * It is pressing Next that records the completion, never opening the page.
 * Rendering a lesson says nothing about whether it was read.
 *
 * Idempotent on purpose. `completedAt` is only written where it is not already
 * set, so a student who presses Next twice -- or uses the back button and
 * presses it again -- keeps the time they first finished the topic rather than
 * having it quietly moved. The upsert is keyed on (userId, lessonId), so there
 * is one row however many times it is pressed.
 *
 * `nextSlug` is resolved against the database rather than trusted: a crafted
 * form must not be able to send a student to a lesson in another subject, and
 * must not be able to mark one complete. Where there is no next lesson -- the
 * last topic of the subject -- the completion is still written and the reader
 * stays where it is, because there is nowhere to go and inventing a
 * destination would lose the student.
 */
export async function completeAndAdvance(
  lessonId: string,
  nextSlug: string | null,
  path: string,
): Promise<void> {
  const user = await requireUser();

  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    select: {
      id: true,
      status: true,
      module: {
        select: {
          subjectId: true,
          status: true,
          subject: { select: { slug: true, course: { select: { slug: true } } } },
        },
      },
    },
  });
  if (!lesson || lesson.status !== "PUBLISHED" || lesson.module.status !== "PUBLISHED") return;
  if (!(await canAccessSubject(user, lesson.module.subjectId))) return;

  const existing = await db.lessonProgress.findUnique({
    where: { userId_lessonId: { userId: user.id, lessonId: lesson.id } },
    select: { completedAt: true },
  });

  if (!existing) {
    await db.lessonProgress.create({
      data: { userId: user.id, lessonId: lesson.id, completedAt: new Date() },
    });
  } else if (!existing.completedAt) {
    await db.lessonProgress.update({
      where: { userId_lessonId: { userId: user.id, lessonId: lesson.id } },
      data: { completedAt: new Date() },
    });
  }
  // Already complete: left exactly as it was, timestamp included.

  if (!nextSlug) {
    revalidatePath(path);
    return;
  }

  // The destination has to be a published lesson of this same subject. A slug
  // that is not one is treated as no next lesson at all rather than as a
  // redirect to wherever it pointed.
  const target = await db.lesson.findFirst({
    where: {
      slug: nextSlug,
      status: "PUBLISHED",
      module: { subjectId: lesson.module.subjectId, status: "PUBLISHED" },
    },
    select: { slug: true },
  });
  if (!target) {
    revalidatePath(path);
    return;
  }

  const { slug: subjectSlug, course } = lesson.module.subject;
  revalidatePath(path);
  redirect(`/study/${course.slug}/${subjectSlug}/lessons/${target.slug}`);
}
