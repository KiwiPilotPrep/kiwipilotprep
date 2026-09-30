import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { db } from "@/lib/db";
import { requireVerifiedEmail } from "@/lib/auth";
import { canAccessSubject } from "@/lib/entitlements";
import { syllabusForSubject, searchSyllabus, codeToSlug } from "@/lib/syllabus";
import { lessonsForSubject } from "@/lib/lessons";
import { syllabusHeading } from "@/lib/course-naming";
import SyllabusNav from "@/components/study/SyllabusNav";
import StudyWatermark from "@/components/study/StudyWatermark";

/**
 * The subject index: the examinable syllabus, and where the student is in it.
 *
 * This is the page that replaces "open a 500-page PDF and start scrolling".
 * Every requirement is listed under its own code, so a student who has been
 * told they lost marks on 12.6.24 can find 12.6.24.
 */
export default async function StudySubjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ courseSlug: string; subjectSlug: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const user = await requireVerifiedEmail();
  const { courseSlug, subjectSlug } = await params;
  const { q } = await searchParams;

  const subject = await db.subject.findFirst({
    where: { slug: subjectSlug, status: "PUBLISHED", course: { slug: courseSlug } },
    include: { course: { select: { title: true, slug: true } } },
  });
  if (!subject) notFound();

  // Server-side, before any syllabus wording is read from the database. A
  // student who has not bought this subject gets the same 404 as one asking
  // for a subject that does not exist.
  if (!(await canAccessSubject(user, subject.id))) notFound();

  const topics = await syllabusForSubject(subject.id, user.id);
  const modules = await lessonsForSubject(subject.id, user.id);

  // A subject has one hierarchy, and this page describes the CAA syllabus.
  // Where a subject has no published syllabus — the IR subjects are built from
  // study manuals, and no CAA syllabus was supplied for them — this page had
  // nothing to describe, and said so in the worst possible way: "0 syllabus
  // items · 0 topics · 0 with study notes", directly above a panel offering
  // 146 lessons. Those subjects have a contents page of their own, and that is
  // the one authoritative structure for them.
  if (topics.length === 0 && modules.length > 0) {
    redirect(`/study/${courseSlug}/${subjectSlug}/lessons`);
  }

  const results = q ? await searchSyllabus(subject.id, q) : null;

  const lessons = modules.flatMap((m) => m.lessons);
  const lessonsDone = lessons.filter((l) => l.completed).length;
  const lessonDiagrams = lessons.reduce((n, l) => n + l.diagramCount, 0);
  const nextLesson = lessons.find((l) => !l.completed) ?? lessons[0];

  const allItems = topics.flatMap((t) => t.items);
  const done = allItems.filter((i) => i.completed).length;
  const withContent = allItems.filter((i) => i.hasContent).length;
  const percent = allItems.length ? Math.round((done / allItems.length) * 100) : 0;
  const firstUnread = allItems.find((i) => !i.completed && i.hasContent) ?? allItems[0];

  return (
    <section className="sec">
      <div className="wrap">
        <div className="sec-head r in">
          {/* Same convention as the imported-course index: whose syllabus
              this is, then which subject of it. */}
          <h1 className="h2">{syllabusHeading(subject.course.title)}</h1>
          <p className="syllabus-subject">{subject.title}</p>
          <p className="lede mt-s">
            The examinable syllabus for this subject, indexed by code. Open any requirement to
            read the study material for it.
          </p>
        </div>

        <div className="study-summary mt-l">
          <div className="study-stat">
            <b>{allItems.length}</b>
            <small>Syllabus items</small>
          </div>
          <div className="study-stat">
            <b>{topics.length}</b>
            <small>Topics</small>
          </div>
          <div className="study-stat">
            <b>{withContent}</b>
            <small>With study notes</small>
          </div>
          <div className="study-stat">
            {/* The count leads, not the percentage. One item done out of two
                hundred rounds to 0%, and a student who has just marked
                something complete should not be shown a zero. */}
            <b>
              {done}
              <span className="study-of"> / {allItems.length}</span>
            </b>
            <small>Complete{percent > 0 ? ` · ${percent}%` : ""}</small>
          </div>
        </div>

        {/* The lecture course, where one has been imported. It is put above
            the syllabus index deliberately: the syllabus says what the exam
            asks, but this is the material that teaches it, and a student
            landing here wants to start reading. */}
        {lessons.length > 0 && (
          <div className="panel mt-l">
            <div className="panel-hd">
              <h2>Course material</h2>
              <small>
                {modules.length} module{modules.length === 1 ? "" : "s"} · {lessons.length} lessons
                {lessonDiagrams > 0 ? ` · ${lessonDiagrams} diagrams` : ""}
              </small>
            </div>
            <div className="panel-bd">
              <p>
                The full lecture course for {subject.title}, in the order it is taught. Every
                lesson keeps the material from the slides it was built from, diagrams included.
              </p>
              <div className="acts mt-m">
                <Link
                  className="btn btn-p"
                  href={`/study/${courseSlug}/${subjectSlug}/lessons${
                    nextLesson ? `/${nextLesson.slug}` : ""
                  }`}
                >
                  {lessonsDone > 0 ? "Continue course" : "Start the course"}
                </Link>
                <Link
                  className="btn btn-g"
                  href={`/study/${courseSlug}/${subjectSlug}/lessons`}
                >
                  Browse all {lessons.length} lessons
                </Link>
              </div>
              {lessonsDone > 0 && (
                <p className="xs mt-s">
                  {lessonsDone} of {lessons.length} lessons complete.
                </p>
              )}
            </div>
          </div>
        )}

        <div className="acts mt-l">
          {firstUnread && (
            <Link
              className="btn btn-p"
              href={`/study/${courseSlug}/${subjectSlug}/${codeToSlug(firstUnread.code)}`}
            >
              {done > 0 ? "Continue studying" : "Start studying"}
            </Link>
          )}
          <Link className="btn btn-g" href={`/courses/${courseSlug}/subjects/${subjectSlug}`}>
            Subject overview
          </Link>
        </div>

        {/* Search by code or wording (§18). A plain GET form so it works
            without JavaScript and the result is a shareable URL. */}
        <form className="study-search mt-l" role="search">
          <label className="sr-only" htmlFor="q">
            Search the syllabus
          </label>
          <input
            id="q"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Search by code (12.6.24) or by wording (lift formula)"
          />
          <button className="btn btn-g" type="submit">
            Search
          </button>
        </form>

        {results && (
          <div className="panel mt-l">
            <div className="panel-hd">
              <h2>
                {results.length} result{results.length === 1 ? "" : "s"} for &ldquo;{q}&rdquo;
              </h2>
            </div>
            <div className="panel-bd">
              {results.length === 0 ? (
                <p className="xs">
                  Nothing matched. Try a topic code such as <span className="num">12.6</span>, or a
                  word from the requirement.
                </p>
              ) : (
                <ul className="study-results">
                  {results.map((r) => (
                    <li key={r.code}>
                      <Link href={`/study/${courseSlug}/${subjectSlug}/${codeToSlug(r.code)}`}>
                        <span className="num">{r.code}</span>
                        <span>{r.requirement.split("\n")[0]}</span>
                        <small>
                          {r.topicCode} {r.topicTitle}
                        </small>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        <div className="study-layout mt-l">
          <SyllabusNav topics={topics} courseSlug={courseSlug} subjectSlug={subjectSlug} />

          <div className="study-main">
            <StudyWatermark />
            <div className="panel">
              <div className="panel-hd">
                <h2>How this works</h2>
              </div>
              <div className="panel-bd">
                <p>
                  Each numbered requirement below is quoted, word for word, from the
                  published syllabus it is examined against. Those numbers are the ones that appear on your knowledge
                  deficiency report after an exam &mdash; so if you are told you lost marks on a
                  particular code, you can search it above and go straight to it.
                </p>
                <p>
                  Open an item from the index to read its study notes, then mark it complete. Your
                  progress is saved to your account, not to this browser.
                </p>
                <p className="xs">
                  Official syllabus wording is reproduced from CAA NZ Advisory Circular AC61-3.
                  KiwiPilotPrep is an independent educational tool, not affiliated with Aspeq or
                  CAANZ.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
