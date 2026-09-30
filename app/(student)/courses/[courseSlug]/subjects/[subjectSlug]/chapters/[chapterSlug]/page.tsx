import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { canAccessSubject } from "@/lib/entitlements";
import { touchChapter, subjectProgress } from "@/lib/progress";
import { toBlocks } from "@/lib/content";
import ContentRenderer from "@/components/ContentRenderer";
import ChapterSidebar from "@/components/student/ChapterSidebar";
import ChapterFooter from "@/components/student/ChapterFooter";
import PracticeQuestions from "@/components/student/PracticeQuestions";

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ courseSlug: string; subjectSlug: string; chapterSlug: string }>;
}) {
  const user = await requireUser();
  const { courseSlug, subjectSlug, chapterSlug } = await params;

  const subject = await db.subject.findFirst({
    where: {
      slug: subjectSlug,
      status: "PUBLISHED",
      course: { slug: courseSlug, status: "PUBLISHED" },
    },
    include: {
      course: { select: { id: true, slug: true, title: true } },
      chapters: {
        where: { status: "PUBLISHED" },
        orderBy: { order: "asc" },
        select: { id: true, slug: true, title: true },
      },
    },
  });
  if (!subject) notFound();
  // Gated on the subject, not the course: a student who bought a single
  // subject may read it, and one who bought the course inherits every subject.
  if (!(await canAccessSubject(user, subject.id))) redirect(`/courses/${courseSlug}`);

  const index = subject.chapters.findIndex((c) => c.slug === chapterSlug);
  if (index === -1) notFound();

  const chapter = await db.chapter.findUnique({
    where: { id: subject.chapters[index].id },
    include: {
      content: true,
      questions: {
        where: { status: "PUBLISHED" },
        orderBy: { order: "asc" },
        include: { options: { orderBy: { order: "asc" } } },
      },
    },
  });
  if (!chapter) notFound();

  // Opening a chapter records the visit and moves the "continue" pointer.
  await touchChapter(user.id, chapter.id, subject.id, subject.course.id);

  const [completedRows, progress, attempts] = await Promise.all([
    db.chapterProgress.findMany({
      where: {
        userId: user.id,
        chapterId: { in: subject.chapters.map((c) => c.id) },
        completedAt: { not: null },
      },
      select: { chapterId: true },
    }),
    subjectProgress(user.id, subject.id),
    db.questionAttempt.findMany({
      where: { userId: user.id, questionId: { in: chapter.questions.map((q) => q.id) } },
      orderBy: { createdAt: "desc" },
      select: { questionId: true, selectedOptionId: true, isCorrect: true },
    }),
  ]);

  const completed = new Set(completedRows.map((r) => r.chapterId));
  const base = `/courses/${courseSlug}/subjects/${subjectSlug}/chapters`;
  const prev = index > 0 ? subject.chapters[index - 1] : null;
  const next = index < subject.chapters.length - 1 ? subject.chapters[index + 1] : null;

  // Most recent attempt per question, so a revisit shows the last answer.
  const lastAttempt = new Map<string, { optionId: string | null; isCorrect: boolean }>();
  attempts.forEach((a) => {
    if (!lastAttempt.has(a.questionId)) {
      lastAttempt.set(a.questionId, { optionId: a.selectedOptionId, isCorrect: a.isCorrect });
    }
  });

  return (
    <div className="learn">
      <ChapterSidebar
        subjectTitle={subject.title}
        courseTitle={subject.course.title}
        courseHref={`/courses/${courseSlug}`}
        base={base}
        chapters={subject.chapters.map((c) => ({
          slug: c.slug,
          title: c.title,
          done: completed.has(c.id),
          current: c.slug === chapterSlug,
        }))}
        progress={progress}
      />

      <article className="learn-main">
        <div className="learn-head">
          <p className="xs num">
            Chapter {index + 1} of {subject.chapters.length}
          </p>
          <h1 className="h2">{chapter.title}</h1>
          {chapter.description && <p className="lede mt-s">{chapter.description}</p>}
        </div>

        <ContentRenderer blocks={toBlocks(chapter.content?.blocks)} />

        {chapter.questions.length > 0 && (
          <PracticeQuestions
            path={`${base}/${chapterSlug}`}
            questions={chapter.questions.map((q) => ({
              id: q.id,
              prompt: q.prompt,
              explanation: q.explanation,
              options: q.options.map((o) => ({ id: o.id, text: o.text })),
              // The correct option is sent only so a previously answered
              // question can be re-displayed; grading happens server-side.
              correctId: q.options.find((o) => o.isCorrect)?.id ?? null,
              previous: lastAttempt.get(q.id) ?? null,
            }))}
          />
        )}

        <ChapterFooter
          chapterId={chapter.id}
          isComplete={completed.has(chapter.id)}
          path={`${base}/${chapterSlug}`}
          prevHref={prev ? `${base}/${prev.slug}` : null}
          nextHref={next ? `${base}/${next.slug}` : null}
        />

        <p className="xs" style={{ marginTop: "28px" }}>
          <Link href={`/courses/${courseSlug}`}>← Back to {subject.course.title}</Link>
        </p>
      </article>
    </div>
  );
}
