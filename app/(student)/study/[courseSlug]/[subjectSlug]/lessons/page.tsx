import Link from "next/link";
import { notFound } from "next/navigation";

import { db } from "@/lib/db";
import { requireVerifiedEmail } from "@/lib/auth";
import { canAccessSubject } from "@/lib/entitlements";
import { lessonsForSubject, searchLessons } from "@/lib/lessons";
import { syllabusHeading } from "@/lib/course-naming";
import LessonNav from "@/components/study/LessonNav";
import StudyWatermark from "@/components/study/StudyWatermark";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ subjectSlug: string }>;
}) {
  const { subjectSlug } = await params;
  return { title: `Course material — ${subjectSlug}` };
}

/**
 * The course-material index for a subject.
 *
 * This is the course as it is taught: chapters in teaching order, topics in
 * the order they are met, with every page of the source preserved beneath
 * them. For a subject whose syllabus is still published it sits alongside the
 * syllabus index; for one whose syllabus is archived — which is now every
 * subject that has a course of its own — it *is* the index, and the link back
 * to the regulator's list is not offered at all.
 */
export default async function LessonIndexPage({
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

  // Server-side, before any lesson content is read. A student who has not
  // bought this subject gets the same 404 as one asking for a subject that
  // does not exist.
  if (!(await canAccessSubject(user, subject.id))) notFound();

  const modules = await lessonsForSubject(subject.id, user.id);
  if (!modules.length) notFound();

  // Whether this subject has a CAA syllabus a student can actually open. Where
  // its syllabus is archived — which is now every subject that has a course of
  // its own — the index behind that button reports nought of everything, and
  // the button itself puts the regulator's word for the material in front of a
  // student who should be reading ours. The lesson page already made this
  // decision; the contents page it links back from had been left behind.
  const publishedSyllabus = await db.syllabusTopic.count({
    where: { subjectId: subject.id, status: "PUBLISHED", items: { some: { status: "PUBLISHED" } } },
  });

  const results = q ? await searchLessons(subject.id, q) : null;

  const allLessons = modules.flatMap((m) => m.lessons);
  const done = allLessons.filter((l) => l.completed).length;
  const diagrams = allLessons.reduce((n, l) => n + l.diagramCount, 0);
  const percent = allLessons.length ? Math.round((done / allLessons.length) * 100) : 0;
  const next = allLessons.find((l) => !l.completed) ?? allLessons[0];

  const base = `/study/${courseSlug}/${subjectSlug}`;

  return (
    <section className="sec">
      <div className="wrap">
        <div className="sec-head r in">
          {/* Whose syllabus this is, then which subject of it. */}
          <h1 className="h2">{syllabusHeading(subject.course.title)}</h1>
          <p className="syllabus-subject">{subject.title}</p>
          <p className="lede mt-s">
            The full course, chapter by chapter. Every topic keeps the material it was built
            from, diagrams included.
          </p>
        </div>

        <div className="study-summary mt-l">
          <div className="study-stat">
            <b>{modules.length}</b>
            <small>Chapters</small>
          </div>
          <div className="study-stat">
            <b>{allLessons.length}</b>
            <small>Topics</small>
          </div>
          <div className="study-stat">
            <b>{diagrams}</b>
            <small>Diagrams</small>
          </div>
          <div className="study-stat">
            {/* The count leads, not the percentage — one lesson out of three
                hundred rounds to 0%, and someone who has just finished one
                should not be shown a zero. */}
            <b>
              {done}
              <span className="study-of"> / {allLessons.length}</span>
            </b>
            <small>Complete{percent > 0 ? ` · ${percent}%` : ""}</small>
          </div>
        </div>

        <div className="acts mt-l">
          {next && (
            <Link className="btn btn-p" href={`${base}/lessons/${next.slug}`}>
              {done > 0 ? "Continue course" : "Start the course"}
            </Link>
          )}
          {publishedSyllabus > 0 && (
            <Link className="btn btn-g" href={base}>
              Syllabus index
            </Link>
          )}
        </div>

        {/* A plain GET form, so it works without JavaScript and the result is
            a URL the student can keep. */}
        <form className="study-search mt-l" role="search">
          <label className="sr-only" htmlFor="q">
            Search the course material
          </label>
          <input
            id="q"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Search the lessons (coriolis, transponder, ISA deviation)"
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
                  Nothing matched. Try a single term from the lesson — the search looks at lesson
                  titles and at the text of every slide beneath them.
                </p>
              ) : (
                <ul className="study-results">
                  {results.map((r) => (
                    <li key={r.slug}>
                      <Link href={`${base}/lessons/${r.slug}`}>
                        <span>{r.title}</span>
                        <small>
                          {r.moduleTitle}
                          {r.excerpt ? ` · …${r.excerpt}…` : ""}
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
          <LessonNav modules={modules} courseSlug={courseSlug} subjectSlug={subjectSlug} />

          <div className="study-main">
            <StudyWatermark />
            {modules.map((module, index) => (
              <div className="panel mt-l" key={module.id}>
                <div className="panel-hd">
                  <h2>
                    <span className="num">{String(index + 1).padStart(2, "0")}</span>{" "}
                    {module.title}
                  </h2>
                  <small>
                    {module.lessons.length} topic{module.lessons.length === 1 ? "" : "s"}
                  </small>
                </div>
                <div className="panel-bd">
                  {/* What the chapter is for, before the list of what is in it.
                      A contents page that only lists titles makes the reader
                      infer the shape of the subject; this says it. */}
                  {module.summary && <p className="chapter-summary">{module.summary}</p>}
                  <ol className="lesson-list">
                    {module.lessons.map((lesson, lessonIndex) => (
                      <li key={lesson.slug}>
                        <Link href={`${base}/lessons/${lesson.slug}`}>
                          <span className="num">
                            {String(index + 1).padStart(2, "0")}.{lessonIndex + 1}
                          </span>
                          <span className="lesson-title">{lesson.title}</span>
                          {/* What a reader chooses on: how much there is to
                              read and whether they have read it. Which slide it
                              came from was neither. */}
                          <small>
                            {lesson.diagramCount > 0
                              ? `${lesson.diagramCount} diagram${lesson.diagramCount === 1 ? "" : "s"}`
                              : ""}
                            {lesson.diagramCount > 0 && lesson.completed ? " · " : ""}
                            {lesson.completed ? "✓ complete" : ""}
                          </small>
                        </Link>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* The same independence statement the syllabus index for the other
            courses carries. This page now names the course at the top of it,
            so it is the page that needs to say who the course belongs to. */}
        <p className="xs syllabus-note">
          Study material reproduced from the course notes supplied for this subject.
          KiwiPilotPrep is an independent educational tool, not affiliated with Aspeq or CAANZ.
        </p>
      </div>
    </section>
  );
}
