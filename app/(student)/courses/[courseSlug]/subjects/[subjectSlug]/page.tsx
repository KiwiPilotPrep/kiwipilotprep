import { notFound, redirect } from "next/navigation";
import Link from "next/link";

import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { canAccessSubject } from "@/lib/entitlements";

/**
 * A subject has no page of its own — it opens at the student's current
 * chapter, or the first published one.
 */
export default async function SubjectPage({
  params,
}: {
  params: Promise<{ courseSlug: string; subjectSlug: string }>;
}) {
  const user = await requireUser();
  const { courseSlug, subjectSlug } = await params;

  const subject = await db.subject.findFirst({
    where: {
      slug: subjectSlug,
      status: "PUBLISHED",
      course: { slug: courseSlug, status: "PUBLISHED" },
    },
    include: {
      course: { select: { id: true } },
      chapters: {
        where: { status: "PUBLISHED" },
        orderBy: { order: "asc" },
        select: { id: true, slug: true },
      },
    },
  });
  if (!subject) notFound();
  if (!(await canAccessSubject(user, subject.id))) redirect(`/courses/${courseSlug}`);

  // A subject with an official syllabus index opens at that index rather than
  // at a chapter: the syllabus is the structure the exam is actually set
  // against, so it is the more useful front door. Subjects without one keep
  // the original chapter behaviour untouched.
  const hasSyllabus = await db.syllabusTopic.count({
    where: { subjectId: subject.id, status: "PUBLISHED", items: { some: { status: "PUBLISHED" } } },
  });
  if (hasSyllabus > 0) redirect(`/study/${courseSlug}/${subjectSlug}`);

  // No syllabus, but imported lecture material: open at the course material.
  // Without this a subject whose syllabus has not been indexed yet would fall
  // through to its placeholder chapters and its lessons would be unreachable
  // — material that exists but cannot be found is the same as material that
  // was never imported.
  const hasLessons = await db.courseModule.count({
    where: { subjectId: subject.id, status: "PUBLISHED", lessons: { some: { status: "PUBLISHED" } } },
  });
  if (hasLessons > 0) redirect(`/study/${courseSlug}/${subjectSlug}/lessons`);

  if (subject.chapters.length === 0) {
    return (
      <section className="sec">
        <div className="wrap">
          <div className="empty panel">
            <b>No chapters published yet</b>
            This subject has no published chapters. Check back once your instructor adds them —{" "}
            <Link href={`/courses/${courseSlug}`}>back to the course</Link>.
          </div>
        </div>
      </section>
    );
  }

  // Resume where the student left off inside this subject, if anywhere.
  const seen = await db.chapterProgress.findFirst({
    where: {
      userId: user.id,
      chapterId: { in: subject.chapters.map((c) => c.id) },
    },
    orderBy: { lastViewedAt: "desc" },
    select: { chapterId: true },
  });

  const target =
    subject.chapters.find((c) => c.id === seen?.chapterId) ?? subject.chapters[0];

  redirect(`/courses/${courseSlug}/subjects/${subjectSlug}/chapters/${target.slug}`);
}
