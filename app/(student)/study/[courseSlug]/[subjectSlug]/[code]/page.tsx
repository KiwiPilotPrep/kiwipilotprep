import Link from "next/link";
import { notFound } from "next/navigation";

import { requireVerifiedEmail } from "@/lib/auth";
import { courseSubjectLine } from "@/lib/course-naming";
import { db } from "@/lib/db";
import { toBlocks } from "@/lib/content";
import {
  studyPageFor,
  syllabusForSubject,
  readingOrder,
  questionsForCode,
  codeToSlug,
  slugToCode,
} from "@/lib/syllabus";
import { confirmedLessonsForItem } from "@/lib/lessons";
import StudyContentRenderer from "@/components/study/StudyContent";
import StudyShell from "@/components/study/StudyShell";
import SyllabusNav from "@/components/study/SyllabusNav";
import MarkComplete from "@/components/study/MarkComplete";
import StudyWatermark from "@/components/study/StudyWatermark";
import { setItemComplete } from "../actions";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  return { title: `${slugToCode(code) ?? "Study"} — Study` };
}

/**
 * One syllabus item, presented as a page of a technical manual.
 *
 * The order on the page is the order a student needs it: where am I, what does
 * the syllabus require, then the material — with diagrams sitting in the text
 * that explains them. The official requirement is set apart from the
 * explanation and is reproduced exactly.
 *
 * Where an item has no notes of its own, the topic's material is shown
 * instead, labelled as covering the whole topic. The source is written in
 * chapters, and showing a student the chapter their requirement sits in is far
 * more use than showing them an empty page.
 */
export default async function StudyItemPage({
  params,
}: {
  params: Promise<{ courseSlug: string; subjectSlug: string; code: string }>;
}) {
  const user = await requireVerifiedEmail();
  const { courseSlug, subjectSlug, code: codeSlug } = await params;

  const code = slugToCode(codeSlug);
  if (!code) notFound();

  const found = await studyPageFor({ courseSlug, subjectSlug, code, actor: user });
  if (!found) notFound();

  const { item, subject, course } = found;

  const [topics, questionCount, progress, topicContent, taughtBy] = await Promise.all([
    syllabusForSubject(subject.id, user.id),
    questionsForCode(code, subject.id),
    db.syllabusItemProgress.findUnique({
      where: { userId_syllabusItemId: { userId: user.id, syllabusItemId: item.id } },
      select: { completedAt: true },
    }),
    db.studyContent.findUnique({
      where: { syllabusTopicId: item.syllabusTopicId },
      select: { blocks: true, status: true, references: true },
    }),
    // The lessons a person has confirmed teach this requirement. This is what
    // makes a knowledge deficiency report actionable: a student is handed a
    // code, searches it here, and lands on the material that covers it.
    confirmedLessonsForItem(item.id),
  ]);

  // Where no lesson has been confirmed against this exact item, the course
  // still covers the topic it belongs to, and saying so is far more use than
  // an empty page. This is a topic-level pointer and is labelled as one: it
  // claims the section covers the topic, never that a particular lesson
  // answers this particular requirement.
  // Whether any linked lesson actually carries teaching, which decides both
  // what is rendered and whether the empty state is honest.
  const lessonHasContent = taughtBy.some(
    (lesson) => toBlocks(lesson.content?.blocks).length > 0,
  );

  const coveringModule =
    taughtBy.length === 0
      ? await db.courseModule.findFirst({
          where: {
            status: "PUBLISHED",
            coversTopics: { some: { id: item.syllabusTopicId } },
          },
          select: {
            title: true,
            lessons: {
              where: { status: "PUBLISHED" },
              orderBy: { displayOrder: "asc" },
              select: { slug: true, title: true, sourceFrom: true },
            },
          },
        })
      : null;

  const order = readingOrder(topics);
  const at = order.indexOf(code);
  const previousCode = at > 0 ? order[at - 1] : null;
  const nextCode = at > -1 && at < order.length - 1 ? order[at + 1] : null;
  const lookup = (c: string | null) =>
    c ? topics.flatMap((t) => t.items).find((i) => i.code === c) ?? null : null;
  const previous = lookup(previousCode);
  const next = lookup(nextCode);

  const completed = Boolean(progress?.completedAt);

  // Remember where they are, so the dashboard can offer to resume here. Fired
  // on read rather than on completion: "where did I stop" is about the last
  // thing opened, not the last thing finished.
  await db.studentProgress.upsert({
    where: { userId: user.id },
    update: {
      lastSyllabusItemId: item.id,
      lastCourseId: course.id,
      lastSubjectId: subject.id,
      lastActivity: new Date(),
    },
    create: {
      userId: user.id,
      lastSyllabusItemId: item.id,
      lastCourseId: course.id,
      lastSubjectId: subject.id,
    },
  });

  const ownBlocks = item.content?.status === "PUBLISHED" ? toBlocks(item.content.blocks) : [];
  const fallback = topicContent?.status === "PUBLISHED" ? toBlocks(topicContent.blocks) : [];
  const usingTopic = ownBlocks.length === 0 && fallback.length > 0;
  const blocks = ownBlocks.length > 0 ? ownBlocks : fallback;
  const reference = ownBlocks.length > 0 ? item.content?.references : topicContent?.references;

  // Progress within this subject, for the reading rail.
  const allItems = topics.flatMap((t) => t.items);
  const done = allItems.filter((i) => i.completed).length;
  const percent = allItems.length ? Math.round((done / allItems.length) * 100) : 0;
  const position = at > -1 ? at + 1 : null;

  const here = `/study/${courseSlug}/${subjectSlug}/${codeSlug}`;

  return (
    <StudyShell
      nav={
        <SyllabusNav
          topics={topics}
          courseSlug={courseSlug}
          subjectSlug={subjectSlug}
          activeCode={code}
        />
      }
      tools={
        <>
          <MarkComplete
            action={setItemComplete.bind(null, code, !completed, here)}
            completed={completed}
          />
          {questionCount > 0 && (
            <Link
              className="tool-btn"
              href={`/courses/${courseSlug}/subjects/${subjectSlug}?practice=${encodeURIComponent(code)}`}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" strokeWidth="1.7"
                strokeLinecap="round" strokeLinejoin="round">
                <path d="M9.1 9a3 3 0 1 1 4 2.8c-.8.3-1.1 1-1.1 1.7v.5M12 17.5h.01" />
                <circle cx="12" cy="12" r="9" />
              </svg>
              <span>Practice ({questionCount})</span>
            </Link>
          )}
        </>
      }
    >
      <article className="reader">
        <StudyWatermark />

        <nav className="reader-crumb" aria-label="Breadcrumb">
          <Link href={`/study/${courseSlug}/${subjectSlug}`}>{subject.title}</Link>
          <span aria-hidden="true">·</span>
          <span>
            <span className="num">{item.topic.code}</span> {item.topic.title}
          </span>
        </nav>

        <header className="reader-head">
          <div className="reader-eyebrow">{courseSubjectLine(course.title, subject.title)}</div>
          <div className="reader-code">{item.code}</div>
          <h1>{item.title ?? firstClause(item.requirement)}</h1>
        </header>

        {/* The official requirement, quoted. Never rewritten (§10, §18). */}
        <section className="objective" aria-label="Syllabus objective">
          <div className="objective-label">
            <span className="num">{item.code}</span> What you need to know
          </div>
          {item.requirement.split("\n").map((line, i) => (
            <p key={i} className={i > 0 ? "objective-clause" : undefined}>
              {line}
            </p>
          ))}
        </section>

        {usingTopic && (
          <p className="reader-scope">
            The notes below cover <strong>{item.topic.code} {item.topic.title}</strong> in full,
            which is the section of the source material this requirement belongs to.
          </p>
        )}

        {taughtBy.length > 0 && (
          <section className="taught-by" aria-label="Lessons covering this requirement">
            <h2>{taughtBy.length === 1 ? "This is taught in" : "This is taught across"}</h2>
            <ol className="lesson-list">
              {taughtBy.map((lesson, i) => (
                <li key={lesson.slug}>
                  <Link href={`/study/${courseSlug}/${subjectSlug}/lessons/${lesson.slug}`}>
                    <span className="num">{i + 1}</span>
                    <span className="lesson-title">{lesson.title}</span>
                    {/* The chapter it belongs to. Which slide it came from is
                        recorded on the row, not put in front of the reader. */}
                    <small>{lesson.module.title}</small>
                  </Link>
                </li>
              ))}
            </ol>
          </section>
        )}

        {/* The material itself, on this page.
            A syllabus code is what a student is handed after an exam, and the
            page they land on has to teach them the thing rather than point at
            where the thing lives. The lesson stays linked above for context —
            what chapter it belongs to — but the reading happens here. */}
        {taughtBy.map((lesson) => {
          const lessonBlocks = toBlocks(lesson.content?.blocks);
          if (!lessonBlocks.length) return null;
          return (
            <section className="from-lesson" key={`content-${lesson.slug}`}>
              {taughtBy.length > 1 && (
                <h2 className="from-lesson-head">{lesson.title}</h2>
              )}
              <StudyContentRenderer blocks={lessonBlocks} />
            </section>
          );
        })}

        {coveringModule && coveringModule.lessons.length > 0 && (
          <section className="taught-by" aria-label="Where this topic is covered">
            <h2>Covered in the course material</h2>
            <p className="xs">
              No notes have been mapped to <span className="num">{item.code}</span> on its own
              yet. This topic &mdash; <strong>{item.topic.code} {item.topic.title}</strong>{" "}
              &mdash; is taught in <strong>{coveringModule.title}</strong>, which begins here.
            </p>
            <ol className="lesson-list">
              {coveringModule.lessons.slice(0, 12).map((lesson, i) => (
                <li key={lesson.slug}>
                  <Link href={`/study/${courseSlug}/${subjectSlug}/lessons/${lesson.slug}`}>
                    <span className="num">{i + 1}</span>
                    <span className="lesson-title">{lesson.title}</span>
                  </Link>
                </li>
              ))}
            </ol>
            {coveringModule.lessons.length > 12 && (
              <p className="xs">
                <Link href={`/study/${courseSlug}/${subjectSlug}/lessons`}>
                  All {coveringModule.lessons.length} topics in this chapter &rarr;
                </Link>
              </p>
            )}
          </section>
        )}

        {blocks.length > 0 && <StudyContentRenderer blocks={blocks} />}

        {/* Said only when it is true. The empty state used to fire whenever an
            item had no notes of its own, including when the lesson that
            teaches it was rendered directly above. */}
        {blocks.length === 0 && !lessonHasContent && !coveringModule && (
          <div className="empty">
            <b>No notes written against this code yet</b>
            The official requirement above is complete and examinable. The course material for
            this topic has not been mapped to this code.
          </div>
        )}

        {reference && <p className="reader-source">{reference}</p>}

        {completed && next && (
          <div className="reader-done">
            <b>✓ Topic completed</b>
            <p>
              Next up: <span className="num">{next.code}</span>{" "}
              {firstClause(next.requirement)}
            </p>
            <Link
              className="btn btn-p"
              href={`/study/${courseSlug}/${subjectSlug}/${codeToSlug(next.code)}`}
            >
              Continue →
            </Link>
          </div>
        )}

        <nav className="reader-pager" aria-label="Syllabus navigation">
          {previous ? (
            <Link
              className="pager-prev"
              href={`/study/${courseSlug}/${subjectSlug}/${codeToSlug(previous.code)}`}
              rel="prev"
            >
              <small>← Previous</small>
              <span className="num">{previous.code}</span>
              <em>{firstClause(previous.requirement)}</em>
            </Link>
          ) : (
            <span />
          )}

          {next ? (
            <Link
              className="pager-next"
              href={`/study/${courseSlug}/${subjectSlug}/${codeToSlug(next.code)}`}
              rel="next"
            >
              <small>Next →</small>
              <span className="num">{next.code}</span>
              <em>{firstClause(next.requirement)}</em>
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
          {position && (
            <p className="xs">
              Item {position} of {allItems.length} · {done} completed
            </p>
          )}
        </div>

        <p className="xs reader-disclaimer">
          Official syllabus wording reproduced from CAA NZ Advisory Circular AC61-3.
          KiwiPilotPrep is an independent educational tool. Not affiliated with Aspeq or CAANZ.
        </p>
      </article>
    </StudyShell>
  );
}

/** The requirement's opening clause, for use as a short title. */
function firstClause(requirement: string): string {
  const line = requirement.split("\n")[0].trim();
  return line.replace(/[:;]$/, "");
}
