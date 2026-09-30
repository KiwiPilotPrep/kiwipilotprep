"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { answerQuestion, submitMock, expireMock } from "@/app/(student)/mocks/actions";

type Question = {
  id: string;
  order: number;
  prompt: string;
  options: Array<{ id: string; text: string }>;
  selectedOptionId: string | null;
};

/**
 * The live exam.
 *
 * The countdown here is display only — `remainingMs` was computed on the
 * server and every answer is re-validated against `expiresAt` server-side.
 * Stopping this timer in devtools buys nothing; the next save is rejected and
 * the attempt is finalised.
 */
export default function MockRunner({
  attemptId,
  title,
  subtitle,
  remainingMs: initialRemaining,
  questions,
}: {
  attemptId: string;
  title: string;
  subtitle: string | null;
  remainingMs: number;
  questions: Question[];
}) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | null>>(() =>
    Object.fromEntries(questions.map((q) => [q.id, q.selectedOptionId])),
  );
  const [left, setLeft] = useState(initialRemaining);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const expired = useRef(false);

  const current = questions[index];
  const answeredCount = Object.values(answers).filter(Boolean).length;

  /* ---------------------------------------------------------------- timer */
  useEffect(() => {
    // Track against a wall-clock deadline rather than decrementing, so a
    // throttled background tab does not drift.
    const deadline = Date.now() + initialRemaining;
    const tick = setInterval(() => {
      const ms = Math.max(0, deadline - Date.now());
      setLeft(ms);
      if (ms === 0 && !expired.current) {
        expired.current = true;
        clearInterval(tick);
        // Ask the server to finalise. It re-checks the clock itself.
        expireMock(attemptId).finally(() => router.refresh());
      }
    }, 250);
    return () => clearInterval(tick);
  }, [attemptId, initialRemaining, router]);

  const clock = (() => {
    const total = Math.floor(left / 1000);
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    const pad = (n: number) => String(n).padStart(2, "0");
    return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
  })();

  const urgent = left <= 60_000;

  /* --------------------------------------------------------------- answers */
  const choose = useCallback(
    async (questionId: string, optionId: string) => {
      // Toggle off if the same option is picked again.
      const next = answers[questionId] === optionId ? null : optionId;
      setAnswers((prev) => ({ ...prev, [questionId]: next }));
      setSaving(true);
      setNotice(null);

      const result = await answerQuestion(attemptId, questionId, next);
      setSaving(false);

      if (!result.ok) {
        setNotice(result.message);
        if (result.code === "EXPIRED" || result.code === "ALREADY_SUBMITTED") {
          router.refresh();
        }
        return;
      }
      setLeft(result.remainingMs);
    },
    [answers, attemptId, router],
  );

  return (
    <div className="exam">
      <header className="exam-bar">
        <div className="exam-id">
          <b>{title}</b>
          {subtitle && <span>{subtitle}</span>}
        </div>

        <div className={`exam-clock${urgent ? " urgent" : ""}`} aria-live="off">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7.2V12l3.2 2" />
          </svg>
          <span className="num">{clock}</span>
        </div>

        <div className="exam-meta">
          <span className="xs">
            {answeredCount}/{questions.length} answered
          </span>
          <button
            className="btn btn-g btn-sm palette-toggle"
            onClick={() => setPaletteOpen((v) => !v)}
            aria-expanded={paletteOpen}
            type="button"
          >
            Questions
          </button>
        </div>
      </header>

      {urgent && (
        <p className="fnote on warn" role="alert" style={{ margin: "0 0 16px" }}>
          Less than a minute remaining. The exam submits itself at 00:00.
        </p>
      )}
      {notice && (
        <p className="fnote on warn" role="alert" style={{ margin: "0 0 16px" }}>
          {notice}
        </p>
      )}

      <div className="exam-body">
        <nav className={`palette${paletteOpen ? " open" : ""}`} aria-label="Question navigation">
          <p className="xs">Question palette</p>
          <div className="palette-grid">
            {questions.map((q, i) => {
              const state = answers[q.id] ? "done" : "todo";
              return (
                <button
                  key={q.id}
                  className={`pnum ${state}${i === index ? " current" : ""}`}
                  onClick={() => {
                    setIndex(i);
                    setPaletteOpen(false);
                  }}
                  aria-current={i === index ? "true" : undefined}
                  type="button"
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
          <p className="xs palette-key">
            <span className="k done" /> answered <span className="k todo" /> unanswered
          </p>
        </nav>

        <main className="exam-main">
          <p className="xs num">
            Question {index + 1} of {questions.length}
          </p>
          <h1 className="h3 exam-q">{current.prompt}</h1>

          <div className="opts mt-m">
            {current.options.map((o, i) => {
              const picked = answers[current.id] === o.id;
              return (
                <button
                  key={o.id}
                  className={`optbtn${picked ? " sel" : ""}`}
                  onClick={() => choose(current.id, o.id)}
                  type="button"
                >
                  <span className="k">{"ABCDEFGH"[i]}</span>
                  <span className="tx">{o.text}</span>
                  <span className="rs">{picked ? "Selected" : ""}</span>
                </button>
              );
            })}
          </div>

          <p className="xs" style={{ marginTop: "12px", minHeight: "18px" }}>
            {saving ? "Saving…" : answers[current.id] ? "Answer saved" : "Not answered yet"}
          </p>

          <div className="exam-nav">
            <button
              className="btn btn-g"
              onClick={() => setIndex((i) => Math.max(0, i - 1))}
              disabled={index === 0}
              type="button"
            >
              ← Previous
            </button>

            {index === questions.length - 1 ? (
              <form
                action={submitMock.bind(null, attemptId)}
                onSubmit={() => setSubmitting(true)}
              >
                <button className="btn btn-p" type="submit" disabled={submitting}>
                  {submitting ? "Submitting…" : "Submit Exam"}
                </button>
              </form>
            ) : (
              <button
                className="btn btn-p"
                onClick={() => setIndex((i) => Math.min(questions.length - 1, i + 1))}
                type="button"
              >
                Next →
              </button>
            )}

            <button
              className="btn btn-g"
              onClick={() => setIndex((i) => Math.min(questions.length - 1, i + 1))}
              disabled={index === questions.length - 1}
              type="button"
            >
              Next →
            </button>
          </div>

          <details className="exam-finish">
            <summary>Finish early</summary>
            <p className="xs">
              {questions.length - answeredCount > 0
                ? `${questions.length - answeredCount} question(s) still unanswered. Unanswered questions are marked incorrect.`
                : "All questions answered."}
            </p>
            <form action={submitMock.bind(null, attemptId)}>
              <button className="btn btn-p btn-sm" type="submit">
                Submit Exam Now
              </button>
            </form>
          </details>
        </main>
      </div>
    </div>
  );
}
