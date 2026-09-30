import Link from "next/link";

import { db } from "@/lib/db";
import { toOptions } from "@/lib/mock/engine";
import { aggregateAreas } from "@/lib/report/kdr-report";
import { sectionLabel } from "@/lib/report/section";
import { resendReport } from "@/app/(student)/mocks/actions";

/**
 * The automated scorecard (§11, §12, §14).
 *
 * Everything shown is read from the attempt's own snapshot, so it reads
 * identically today and after the question bank has moved on.
 */
export default async function Scorecard({
  attemptId,
  viewerIsOwner,
  nav,
}: {
  attemptId: string;
  viewerIsOwner: boolean;
  /**
   * The back / download / history controls, supplied by the host page.
   * Omitted, the student's own are rendered.
   */
  nav?: React.ReactNode;
}) {
  const attempt = await db.mockAttempt.findUnique({
    where: { id: attemptId },
    include: {
      mockExam: { select: { kdrStrongPercent: true, kdrWeakPercent: true, passingPercent: true } },
      user: { select: { name: true } },
      questions: { orderBy: { order: "asc" } },
      kdrResults: { orderBy: [{ accuracy: "asc" }, { kdrCode: "asc" }] },
      // Delivery state only. The report itself is rendered on demand from the
      // attempt's snapshots, so nothing here depends on it having been stored.
      report: { select: { status: true } },
    },
  });
  if (!attempt) return null;
  const report = attempt.report;

  const { kdrStrongPercent, kdrWeakPercent } = attempt.mockExam;

  // Grouped by the same function the report, the email and the PDF use, so
  // this page cannot name a different strength or a different weakness for
  // the same attempt. Questions with no section reach it through
  // `missesByArea`, which is the only place they would otherwise be lost.
  const missesByArea = new Map<string, number>();
  const chapterByArea = new Map<string, string | null>();
  for (const q of attempt.questions) {
    if (q.isCorrect === true) continue;
    const area = sectionLabel(q.kdrCodeSnapshot, q.kdrTopicSnapshot);
    missesByArea.set(area, (missesByArea.get(area) ?? 0) + 1);
    if (!chapterByArea.has(area)) chapterByArea.set(area, q.kdrChapterSnapshot ?? null);
  }
  const areas = aggregateAreas(
    attempt.kdrResults,
    missesByArea,
    kdrStrongPercent,
    kdrWeakPercent,
    chapterByArea,
  );

  const groups = [
    { key: "weak", label: "Weak areas", rows: areas.all.filter((k) => k.band === "weak") },
    { key: "improving", label: "Needs improvement", rows: areas.all.filter((k) => k.band === "improving") },
    { key: "strong", label: "Strong areas", rows: areas.all.filter((k) => k.band === "strong") },
  ].filter((g) => g.rows.length > 0);

  const timeUsedMs =
    attempt.submittedAt ? attempt.submittedAt.getTime() - attempt.startedAt.getTime() : null;
  const timeUsed = timeUsedMs
    ? `${Math.floor(timeUsedMs / 60000)}m ${Math.floor((timeUsedMs % 60000) / 1000)}s`
    : "—";

  return (
    <section className="sec">
      <div className="wrap">
        <div className="sec-head r in">
          <div className="eyebrow">Scorecard</div>
          <h1 className="h2">{attempt.examTitle}</h1>
          <p className="lede mt-s">
            {attempt.subjectTitle ? `${attempt.subjectTitle} · ` : ""}
            {(attempt.submittedAt ?? attempt.startedAt).toLocaleString("en-NZ")}
            {!viewerIsOwner && ` · ${attempt.user.name}`}
          </p>
          {attempt.autoSubmitted && (
            <p className="fnote on warn" style={{ marginTop: "14px" }}>
              This attempt was submitted automatically when the time ran out.
            </p>
          )}
        </div>

        {/* ------------------------------------------------ headline result */}
        <div className="tiles mt-l">
          <div className="tile">
            <div className="v">{attempt.scorePercent}%</div>
            <div className="l">Score</div>
          </div>
          <div className="tile">
            <div className="v">{attempt.correctCount}</div>
            <div className="l">Correct</div>
          </div>
          <div className="tile">
            <div className="v">{attempt.incorrectCount}</div>
            <div className="l">Incorrect</div>
          </div>
          <div className="tile">
            <div className="v">{attempt.unansweredCount}</div>
            <div className="l">Unanswered</div>
          </div>
          <div className="tile">
            <div className="v">{attempt.totalQuestions}</div>
            <div className="l">Total questions</div>
          </div>
          <div className="tile">
            <div className="v" style={{ fontSize: "20px" }}>{timeUsed}</div>
            <div className="l">Time used</div>
          </div>
        </div>

        {attempt.passed !== null && (
          <div className={`cnote ${attempt.passed ? "info" : "warning"}`}>
            <b>{attempt.passed ? "Pass" : "Not yet"}</b>
            <p>
              This attempt scored {attempt.scorePercent}% against a {attempt.mockExam.passingPercent}%
              pass mark. This is a practice indicator for your own revision, and not a prediction of
              any official examination result.
            </p>
          </div>
        )}

        {/* -------------------------------------------------- KDR breakdown */}
        <div className="sec-head mt-l">
          <h2 className="h3">Knowledge Deficiency Report</h2>
          <p className="xs">
            Grouped by the revision area each question belongs to. Strong is{" "}
            {kdrStrongPercent}% and above; weak is below {kdrWeakPercent}%.
          </p>
        </div>

        {areas.all.length === 0 ? (
          <div className="empty panel">
            <b>No KDR data for this attempt</b>
            None of these questions carry a syllabus reference yet.
          </div>
        ) : (
          groups.map((group) => (
            <div className="panel" key={group.key}>
              <div className="panel-hd">
                <h2>{group.label}</h2>
                <span className={`pill-s ${group.key === "strong" ? "published" : group.key === "weak" ? "archived" : "draft"}`}>
                  {group.rows.length}
                </span>
              </div>
              <table className="atable">
                <thead>
                  <tr>
                    {/* The internal code is deliberately not a column. It is
                        KiwiPilotPrep's own addressing, it means nothing to a
                        student, and printed as a bare number beside a topic it
                        reads like an external syllabus citation on what is an
                        independent platform's report. */}
                    <th>Revision area</th>
                    <th>Attempted</th>
                    <th>Correct</th>
                    <th>Accuracy</th>
                  </tr>
                </thead>
                <tbody>
                  {group.rows.map((k) => (
                    <tr key={k.area}>
                      {/* Informational only. Deliberately not a link: a
                          student reading a result should not be invited to
                          leave it, and the section is a label rather than a
                          destination. */}
                      <td className="nm">
                        {/* A point is shown under the chapter it belongs to,
                            so "27.3" is never read without knowing what 27
                            is. A chapter-mapped area has nothing above it
                            and is shown on its own. */}
                        {k.chapter && <div className="xs">{k.chapter}</div>}
                        {k.area}
                      </td>
                      <td>{k.attempted}</td>
                      <td>{k.attempted - k.missed}</td>
                      <td className="num">{k.accuracy}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))
        )}

        {/* ------------------------------------------------ question review */}
        <div className="sec-head mt-l">
          <h2 className="h3">Question review</h2>
        </div>

        {attempt.questions.map((q) => {
          const options = toOptions(q.optionsSnapshot);
          const correctOption = options.find((o) => o.isCorrect);
          const unanswered = !q.selectedOptionId;
          const state = unanswered ? "unanswered" : q.isCorrect ? "correct" : "incorrect";

          return (
            <div className="qbox" key={q.id} style={{ marginBottom: "16px" }}>
              <div className="qbox-hd">
                <span className="t">Question {q.order + 1}</span>
                <span
                  className={`pill-s ${state === "correct" ? "published" : state === "incorrect" ? "archived" : "draft"}`}
                >
                  {state === "correct" ? "Correct" : state === "incorrect" ? "Incorrect" : "Unanswered"}
                </span>
              </div>

              <div className="qbox-bd">
                <p className="qtx">{q.promptSnapshot}</p>

                <div className="opts">
                  {options.map((o, i) => {
                    const chosen = q.selectedOptionId === o.id;
                    const cls = o.isCorrect
                      ? "optbtn correct"
                      : chosen
                        ? "optbtn wrong"
                        : "optbtn dim";
                    return (
                      <div className={cls} key={o.id}>
                        <span className="k">{"ABCDEFGH"[i]}</span>
                        <span className="tx">{o.text}</span>
                        <span className="rs">
                          {o.isCorrect ? "Correct answer" : chosen ? "Your answer" : ""}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {unanswered && correctOption && (
                  <p className="xs" style={{ marginTop: "10px" }}>
                    You did not answer this question.
                  </p>
                )}

                {q.explanationSnapshot && (
                  <div className={`expl${q.isCorrect ? "" : " bad"}`}>
                    <b>Explanation</b>
                    <p>{q.explanationSnapshot}</p>
                  </div>
                )}

                {/* KiwiPilotPrep's own revision reference only. The external
                    regulator and syllabus references are kept on the snapshot
                    for internal validation and are never shown to a student:
                    this is an independent platform and a page carrying those
                    codes reads as an official document, which it is not. */}
                {(q.kdrCodeSnapshot || q.kdrTopicSnapshot) && (
                  <p className="xs qrefs">
                    <span>{sectionLabel(q.kdrCodeSnapshot, q.kdrTopicSnapshot)}</span>
                  </p>
                )}
              </div>
            </div>
          );
        })}

        {/* Shown unless the email is known to have gone out. A failed send and
            an attempt finished before reports existed at all look the same to
            the student — no email arrived — so both get the same offer. The
            result and the download are unaffected either way, so this offers
            the one thing that actually failed rather than implying anything is
            missing. */}
        {viewerIsOwner && report?.status !== "SENT" && (
          <form action={resendReport.bind(null, attempt.id)} className="callout" style={{ marginTop: "20px" }}>
            <b>Report email</b>
            <p>
              Your report is ready to download here, but the email carrying it did not get through.
              You can send it again.
            </p>
            <button className="btn btn-g btn-sm" type="submit">
              Email me the report
            </button>
          </form>
        )}

        {/* Back, download and history — the same three controls wherever
            this is read, but pointing at the routes of whoever is reading.
            A host that supplies `nav` gets its own; the student gets theirs.
            What must never happen is an admin being handed a link onto the
            student dashboard, which is why these are supplied rather than
            assumed. */}
        <div className="acts" style={{ marginTop: "24px" }}>
          {nav ?? (
            <>
              {/* A plain anchor, not a Link: this is a file download rather
                  than a route, and the client router would try to navigate
                  to it. */}
              <a className="btn btn-p" href={`/mocks/attempts/${attempt.id}/report.pdf`}>
                Download report
              </a>
              <Link className="btn btn-g" href="/mocks">
                Back to mocks
              </Link>
              <Link className="btn btn-g" href="/mocks/history">
                Mock history
              </Link>
            </>
          )}
        </div>

        <p className="xs" style={{ marginTop: "22px" }}>
          This report reflects performance on this practice attempt only. KiwiPilotPrep is an
          independent educational tool, not affiliated with Aspeq or CAANZ.
        </p>
      </div>
    </section>
  );
}
