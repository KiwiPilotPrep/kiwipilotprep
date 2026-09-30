"use client";

import { useState } from "react";

export type PointOption = { id: string; code: string | null; label: string };
export type ChapterOption = {
  id: string;
  code: string | null;
  label: string;
  points: PointOption[];
};

export type SubjectOption = {
  id: string;
  label: string;
  chapters: ChapterOption[];
};

export type QuestionValues = {
  subjectId: string;
  moduleId: string;
  lessonId: string;
  prompt: string;
  explanation: string;
  options: [string, string, string, string];
  answer: number;
  difficulty: string;
  freeTrialEligible: boolean;
  status: string;
};

/**
 * The one question editor, used for adding and for editing.
 *
 * Client-side only so the curriculum follows the chosen subject: an admin
 * who changes the subject should not be offered the old subject's chapters
 * for even a moment, and changing the chapter must drop a point belonging to
 * the previous one. The server re-checks both pairings on save — this
 * narrowing is a convenience, not the guarantee.
 *
 * Two levels, because the curriculum has two. A chapter is "27 — Emergency
 * Communications and Signals"; a point inside it is "27.3 — Ground-Air
 * Visual Signals". The point is optional: a question filed against its
 * chapter is correctly filed, and the point is extra precision for an author
 * who knows exactly which part of the chapter the question tests.
 *
 * Four options, exactly. Which one is correct is a radio rather than a
 * checkbox because a question with two right answers, or none, is not a
 * question a mock can mark.
 */
export default function QuestionForm({
  subjects,
  initial,
  action,
  submitLabel,
}: {
  subjects: SubjectOption[];
  initial: QuestionValues;
  action: (formData: FormData) => void;
  submitLabel: string;
}) {
  const [subjectId, setSubjectId] = useState(initial.subjectId || subjects[0]?.id || "");
  const [moduleId, setModuleId] = useState(initial.moduleId);
  const [lessonId, setLessonId] = useState(initial.lessonId);
  const [answer, setAnswer] = useState(initial.answer);
  // Carried, not edited. Difficulty is set elsewhere and a form that posts
  // nothing for it would silently clear it.

  const subject = subjects.find((s) => s.id === subjectId);
  const chapters = subject?.chapters ?? [];
  // Changing subject invalidates a chapter belonging to the old one.
  const chapterValue = chapters.some((c) => c.id === moduleId) ? moduleId : "";
  const chapter = chapters.find((c) => c.id === chapterValue);
  const points = chapter?.points ?? [];
  // …and changing chapter invalidates a point belonging to the old chapter.
  const pointValue = points.some((p) => p.id === lessonId) ? lessonId : "";

  const letters = ["A", "B", "C", "D"] as const;

  return (
    <form className="inline-form" action={action}>
      <div className="frow">
        <div className="fld">
          <label htmlFor="subjectId">Subject</label>
          <select
            id="subjectId"
            name="subjectId"
            value={subjectId}
            onChange={(e) => {
              setSubjectId(e.target.value);
              setModuleId("");
              setLessonId("");
            }}
          >
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div className="fld">
          <label htmlFor="moduleId">Chapter</label>
          <select
            id="moduleId"
            name="moduleId"
            value={chapterValue}
            onChange={(e) => {
              setModuleId(e.target.value);
              setLessonId("");
            }}
          >
            <option value="">Not mapped</option>
            {chapters.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
          <span className="xs">
            This subject&rsquo;s own chapters, numbered as the curriculum numbers them.
          </span>
        </div>
      </div>

      <div className="frow">
        <div className="fld">
          <label htmlFor="lessonId">Point</label>
          <select
            id="lessonId"
            name="lessonId"
            value={pointValue}
            onChange={(e) => setLessonId(e.target.value)}
            disabled={!chapterValue || points.length === 0}
          >
            <option value="">
              {chapterValue ? "Whole chapter" : "Choose a chapter first"}
            </option>
            {points.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
          <span className="xs">
            Optional. A point is what groups the student&rsquo;s result when it is set —
            &ldquo;27.3&rdquo; rather than the whole of chapter 27.
          </span>
        </div>
      </div>

      <div className="fld">
        <label htmlFor="prompt">Question</label>
        {/* The server refuses an empty question, but it refuses silently —
            it throws, and the page simply re-renders unchanged. Marking the
            fields the schema already requires lets the browser say so, which
            is the difference between "nothing happened" and "you missed
            this". The server check stays; this only stops an admin reaching
            it by accident. */}
        <textarea id="prompt" name="prompt" rows={3} required defaultValue={initial.prompt} />
      </div>

      {letters.map((letter, i) => (
        <div className="fld" key={letter}>
          <label htmlFor={`option${letter}`}>
            Option {letter}
            <label style={{ display: "inline", marginLeft: "12px", fontWeight: 400 }}>
              <input
                type="radio"
                name="answer"
                value={i}
                checked={answer === i}
                onChange={() => setAnswer(i)}
              />{" "}
              correct
            </label>
          </label>
          <input
            id={`option${letter}`}
            name={`option${letter}`}
            required
            defaultValue={initial.options[i]}
          />
        </div>
      ))}

      <div className="fld">
        <label htmlFor="explanation">Explanation</label>
        <textarea id="explanation" name="explanation" rows={3} defaultValue={initial.explanation} />
        <span className="xs">Shown to the student on their scorecard and in their report.</span>
      </div>

      {/* The two controls that decide where a question is used. Everything
          else an exam needs is above; nothing else is offered, because a
          field nobody fills is a field somebody has to read past. */}
      <div className="frow">
        <div className="fld">
          <label htmlFor="status">Status</label>
          <select id="status" name="status" defaultValue={initial.status}>
            <option value="DRAFT">DRAFT</option>
            <option value="PUBLISHED">PUBLISHED</option>
            <option value="ARCHIVED">ARCHIVED</option>
          </select>
          <span className="xs">Only PUBLISHED questions are drawn into a paper.</span>
        </div>
        <div className="fld">
          <label htmlFor="freeTrialEligible">Free mock</label>
          <label style={{ fontWeight: 400 }}>
            <input
              id="freeTrialEligible"
              type="checkbox"
              name="freeTrialEligible"
              defaultChecked={initial.freeTrialEligible}
            />{" "}
            May appear in the free 10-question mock
          </label>
        </div>
      </div>

      <input type="hidden" name="difficulty" value={initial.difficulty} />

      <button className="btn btn-p" type="submit">
        {submitLabel}
      </button>
    </form>
  );
}
