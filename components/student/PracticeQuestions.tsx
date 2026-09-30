"use client";

import { useState, useTransition } from "react";

import { answerQuestion } from "@/app/(student)/actions";

type Q = {
  id: string;
  prompt: string;
  explanation: string | null;
  options: Array<{ id: string; text: string }>;
  correctId: string | null;
  previous: { optionId: string | null; isCorrect: boolean } | null;
};

/**
 * Chapter practice mode (§22). Answers are graded and stored server-side;
 * this component only reflects the result.
 */
export default function PracticeQuestions({
  questions,
  path,
}: {
  questions: Q[];
  path: string;
}) {
  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    const seed: Record<string, string> = {};
    questions.forEach((q) => {
      if (q.previous?.optionId) seed[q.id] = q.previous.optionId;
    });
    return seed;
  });
  const [pending, start] = useTransition();

  function choose(question: Q, optionId: string) {
    if (answers[question.id]) return;
    setAnswers((prev) => ({ ...prev, [question.id]: optionId }));
    start(async () => {
      try {
        await answerQuestion(question.id, optionId, path);
      } catch {
        // Roll back so the student can try again rather than see a false result.
        setAnswers((prev) => {
          const next = { ...prev };
          delete next[question.id];
          return next;
        });
      }
    });
  }

  return (
    <section className="practice">
      <h2 className="h3">Practice questions</h2>
      <p className="xs" style={{ marginBottom: "18px" }}>
        {questions.length} {questions.length === 1 ? "question" : "questions"} for this chapter.
        Your attempts are saved.
      </p>

      {questions.map((q, n) => {
        const chosen = answers[q.id];
        const answered = Boolean(chosen);
        const correct = answered && chosen === q.correctId;

        return (
          <div className="qbox" key={q.id} style={{ marginBottom: "18px" }}>
            <div className="qbox-hd">
              <span className="t">Question {n + 1}</span>
              {answered && (
                <span className="c num">{correct ? "Correct" : "Incorrect"}</span>
              )}
            </div>

            <div className="qbox-bd">
              <p className="qtx">{q.prompt}</p>

              <div className="opts">
                {q.options.map((o, i) => {
                  const cls = !answered
                    ? "optbtn"
                    : o.id === q.correctId
                      ? "optbtn correct"
                      : o.id === chosen
                        ? "optbtn wrong"
                        : "optbtn dim";
                  return (
                    <button
                      key={o.id}
                      className={cls}
                      disabled={answered || pending}
                      onClick={() => choose(q, o.id)}
                      type="button"
                    >
                      <span className="k">{"ABCDEFGH"[i]}</span>
                      <span className="tx">{o.text}</span>
                      <span className="rs">
                        {answered && o.id === q.correctId
                          ? "Correct answer"
                          : answered && o.id === chosen
                            ? "Your answer"
                            : ""}
                      </span>
                    </button>
                  );
                })}
              </div>

              {answered && q.explanation && (
                <div className={`expl${correct ? "" : " bad"}`}>
                  <b>{correct ? "Correct" : "Not quite"}</b>
                  <p>{q.explanation}</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </section>
  );
}
