import "server-only";

import { db } from "@/lib/db";
import { chapterCode, pointCode } from "@/lib/curriculum/sections";
import type { SubjectOption } from "@/components/admin/QuestionForm";

/**
 * Every subject a question can belong to, with that subject's own chapters
 * and the points inside them.
 *
 * The shape mirrors the curriculum — Course → Subject → Chapter → Point — so
 * the editor can offer a chapter and then narrow to a point without a round
 * trip. Numbers come from `chapterNumber` and `pointNumber`; nothing here
 * counts positions in the arrays it builds.
 *
 * The server re-resolves the same pairing through `resolveQuestionSection`
 * when the form is saved. This is only what the admin is offered.
 */
export async function questionSubjects(): Promise<SubjectOption[]> {
  const subjects = await db.subject.findMany({
    where: { status: { not: "ARCHIVED" }, course: { status: { not: "ARCHIVED" } } },
    orderBy: [{ course: { order: "asc" } }, { order: "asc" }],
    select: {
      id: true,
      title: true,
      course: { select: { title: true } },
      modules: {
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
      },
    },
  });

  return subjects.map((s) => ({
    id: s.id,
    label: `${s.course.title.replace(/^KiwiPilotPrep — /, "")} · ${s.title}`,
    chapters: s.modules.map((m) => ({
      id: m.id,
      code: chapterCode(m.chapterNumber),
      label: `${chapterCode(m.chapterNumber) ?? "—"} — ${m.title}`,
      points: m.lessons.map((l) => ({
        id: l.id,
        code: pointCode(m.chapterNumber, l.pointNumber),
        label: `${pointCode(m.chapterNumber, l.pointNumber) ?? "—"} — ${l.title}`,
      })),
    })),
  }));
}
