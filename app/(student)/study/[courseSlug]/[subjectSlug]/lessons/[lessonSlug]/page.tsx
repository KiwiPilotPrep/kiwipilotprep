import Link from "next/link";
import { notFound } from "next/navigation";

import { requireVerifiedEmail } from "@/lib/auth";
import { courseSubjectLine } from "@/lib/course-naming";
import { db } from "@/lib/db";
import { toBlocks } from "@/lib/content";
import {
  lessonPageFor,
  lessonsForSubject,
  lessonReadingOrder,
  confirmedItemsForLesson,
} from "@/lib/lessons";
import { questionsForCode } from "@/lib/syllabus";
import StudyContentRenderer from "@/components/study/StudyContent";
import StudyShell from "@/components/study/StudyShell";
import LessonNav from "@/components/study/LessonNav";
import MarkComplete from "@/components/study/MarkComplete";
import StudyWatermark from "@/components/study/StudyWatermark";
import { setLessonComplete } from "../actions";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lessonSlug: string }>;
}) {
  const { lessonSlug } = await params;
  return { title: `${lessonSlug.replace(/-/g, " ")} — Study` };
}

/**
 * One lesson of the lecture course, presented as a page of a technical manual.
 *
 * The order on the page is the order a student needs it: where am I, what does
 * this lesson cover, then the material itself with diagrams sitting in the
 * text that explains them. Everything below the header is exactly what was on
 * the source slides, in the order it was presented — no slide is summarised
 * and none is skipped.
 */
export default async function LessonPage({
  params,
}: {
  params: Promise<{ courseSlug: string; subjectSlug: string; lessonSlug: string }>;
}) {
  const user = await requireVerifiedEmail();
  const { courseSlug, subjectSlug, lessonSlug } = await params;

  const found = await lessonPageFor({ courseSlug, subjectSlug, lessonSlug, actor: user });
  if (!found) notFound();

  const { lesson, subject, course } = found;

  const [modules, order, progress, objectives, syllabusTopics] = await Promise.all([
    lessonsForSubject(subject.id, user.id),
    lessonReadingOrder(subject.id),
    db.lessonProgress.findUnique({
      where: { userId_lessonId: { userId: user.id, lessonId: lesson.id } },
      select: { completedAt: true },
    }),
    // Only links a person has confirmed. A matcher's guess must never be shown
    // to a student as the syllabus code this lesson answers.
    confirmedItemsForLesson(lesson.id),
    // Whether this subject has a CAA syllabus at all. Where it has none, the
    // toolbar used to offer a "Syllabus" button that led to a page reporting
    // nought of everything.
    db.syllabusTopic.count({
      where: { subjectId: subject.id, status: "PUBLISHED", items: { some: { status: "PUBLISHED" } } },
    }),
  ]);

  // Practice questions are matched on the CAA code, so a lesson can only offer
  // them once it is confirmed against one.
  const questionCounts = await Promise.all(
    objectives.map((objective) => questionsForCode(objective.code, subject.id)),
  );
  const practiceCode = objectives.find((_, i) => questionCounts[i] > 0)?.code ?? null;
  const practiceCount = questionCounts.reduce((n, count) => n + count, 0);

  const completed = Boolean(progress?.completedAt);
  const blocks = toBlocks(lesson.content?.blocks);

  const at = order.findIndex((entry) => entry.slug === lesson.slug);
  const previous = at > 0 ? order[at - 1] : null;
  const next = at > -1 && at < order.length - 1 ? order[at + 1] : null;

  const allLessons = modules.flatMap((m) => m.lessons);
  const done = allLessons.filter((l) => l.completed).length;
  const percent = allLessons.length ? Math.round((done / allLessons.length) * 100) : 0;

  const base = `/study/${courseSlug}/${subjectSlug}/lessons`;
  const here = `${base}/${lesson.slug}`;

  // Where this topic sits in the course — "3.4" — not which page of the
  // manual it was lifted from. The source range stays on the row for whoever
  // has to trace the content back; it is no use to a student.
  const number = order.find((entry) => entry.slug === lesson.slug)?.number ?? "";

  return (
    <StudyShell
      nav={
        <LessonNav
          modules={modules}
          courseSlug={courseSlug}
          subjectSlug={subjectSlug}
          activeSlug={lesson.slug}
        />
      }
      tools={
        <>
          <MarkComplete
            action={setLessonComplete.bind(null, lesson.id, !completed, here)}
            completed={completed}
          />
          {practiceCode && (
            <Link
              className="tool-btn"
              href={`/courses/${courseSlug}/subjects/${subjectSlug}?practice=${encodeURIComponent(practiceCode)}`}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" strokeWidth="1.7"
                strokeLinecap="round" strokeLinejoin="round">
                <path d="M9.1 9a3 3 0 1 1 4 2.8c-.8.3-1.1 1-1.1 1.7v.5M12 17.5h.01" />
                <circle cx="12" cy="12" r="9" />
              </svg>
              <span>Practice ({practiceCount})</span>
            </Link>
          )}
          <Link
            className="tool-btn"
            href={syllabusTopics > 0 ? `/study/${courseSlug}/${subjectSlug}` : base}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" strokeWidth="1.7"
              strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 5h16M4 12h16M4 19h10" />
            </svg>
            <span>{syllabusTopics > 0 ? "Syllabus" : "Contents"}</span>
          </Link>
        </>
      }
    >
      <article className="reader">
        <StudyWatermark />

        <nav className="reader-crumb" aria-label="Breadcrumb">
          <Link href={base}>{subject.title}</Link>
          <span aria-hidden="true">·</span>
          <span>{lesson.module.title}</span>
        </nav>

        <header className="reader-head">
          <div className="reader-eyebrow">{courseSubjectLine(course.title, subject.title)}</div>
          <div className="reader-code">{number}</div>
          <h1>{lesson.title}</h1>
        </header>

        {/* Where a topic has been matched to a published syllabus requirement,
            it is quoted here exactly as published — never rewritten.
            Most lessons carry no match, and that is shown by its absence
            rather than by a guess. */}
        {objectives.map((objective) => (
          <section className="objective" key={objective.code} aria-label="Syllabus objective">
            <div className="objective-label">
              <span className="num">{objective.code}</span> What you need to know
            </div>
            {objective.requirement.split("\n").map((line, i) => (
              <p key={i} className={i > 0 ? "objective-clause" : undefined}>
                {line}
              </p>
            ))}
          </section>
        ))}

        <StudyContentRenderer blocks={blocks} />

        {completed && next && (
          <div className="reader-done">
            <b>✓ Lesson completed</b>
            <p>Next up: {next.title}</p>
            <Link className="btn btn-p" href={`${base}/${next.slug}`}>
              Continue →
            </Link>
          </div>
        )}

        <nav className="reader-pager" aria-label="Course navigation">
          {previous ? (
            <Link className="pager-prev" href={`${base}/${previous.slug}`} rel="prev">
              <small>← Previous</small>
              <em>{previous.title}</em>
            </Link>
          ) : (
            <span />
          )}

          {next ? (
            <Link className="pager-next" href={`${base}/${next.slug}`} rel="next">
              <small>Next →</small>
              <em>{next.title}</em>
            </Link>
          ) : (
            <span />
          )}
        </nav>

        <div className="reader-progress">
          <div className="reader-progress-head">
            <span>{subject.title}</span>
            <span className="num">{percent}% complete</span>
          </div>
          <div className="bar">
            <i style={{ width: `${percent}%` }} />
          </div>
          {at > -1 && (
            <p className="xs">
              Topic {at + 1} of {order.length} · {done} completed
            </p>
          )}
        </div>

        <p className="xs reader-disclaimer">
          Study material reproduced from the course notes supplied for this subject.
          KiwiPilotPrep is an independent educational tool. Not affiliated with Aspeq or CAANZ.
        </p>
      </article>
    </StudyShell>
  );
}
