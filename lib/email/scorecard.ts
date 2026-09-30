import "server-only";

import { db } from "@/lib/db";
import { buildKdrReport, resultStatus } from "@/lib/report/kdr-report";
import { reportLink } from "@/lib/report/link";
import { renderKdrPdf } from "@/lib/report/pdf";

import { renderScorecardHtml } from "./scorecard-html";
import { sendEmail, type Attachment } from "./send";

/**
 * The mock result email, with the Knowledge Deficiency Report attached.
 *
 * Sent as two parts. The HTML part is the branded one a student normally
 * sees; the text part below is written to be read on its own, because some
 * clients render nothing else and it is also the copy EmailLog keeps. Both
 * are built from the same report, so they cannot disagree about a score or a
 * revision area.
 *
 * Reports only what the attempt recorded. No readiness claim and no invented
 * statistic — the report is an educational indicator, not a prediction of any
 * official examination result.
 *
 * The message is KiwiPilotPrep's own: its revision areas, its wording, its
 * branding. It names no external authority, syllabus or examination body,
 * except in the approved independence disclaimer at the foot, whose whole
 * purpose is to deny a relationship rather than to imply one.
 *
 * Sent through the shared `sendEmail`, which is the one place this product
 * talks to Resend. It uses the same `RESEND_API_KEY` as verification mail and
 * the same `EMAIL_FROM` sender; nothing here creates a client or a key.
 */

/** A filename a student can find again in a downloads folder. */
function filenameFor(examTitle: string, when: Date | null): string {
  const slug = examTitle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
  const date = (when ?? new Date()).toISOString().slice(0, 10);
  return `kiwipilotprep-report-${slug || "mock"}-${date}.pdf`;
}

export type ScorecardOutcome = {
  status: "SENT" | "LOGGED" | "FAILED";
  pdfBytes: number | null;
  error?: string;
};

export async function sendScorecardEmail(attemptId: string, baseUrl: string): Promise<ScorecardOutcome | null> {
  const attempt = await db.mockAttempt.findUnique({
    where: { id: attemptId },
    select: { userId: true, status: true },
  });
  if (!attempt || attempt.status === "IN_PROGRESS") return null;

  const report = await buildKdrReport(attemptId, attempt.userId);
  if (!report) return null;

  // The PDF is the reason the email exists, but a failure to render one must
  // not cost the student the email as well: the result and the revision areas
  // are in the body either way, and the report stays downloadable from the
  // dashboard where it is rendered again on demand.
  let attachments: Attachment[] | undefined;
  let pdfBytes: number | null = null;
  try {
    const pdf = await renderKdrPdf(report);
    pdfBytes = pdf.byteLength;
    attachments = [{ filename: filenameFor(report.exam.title, report.completedAt), content: pdf }];
  } catch (error) {
    console.error("[report] pdf render failed:", error);
  }

  const attached = Boolean(attachments);
  const first = report.student.name.split(" ")[0] || report.student.name;
  const r = report.result;

  // The link opens the report itself, not a page about it. It carries a
  // signed token because mail is read in browsers that hold no session, and
  // it resolves to exactly the document attached above.
  const link = await reportLink(baseUrl, attemptId, attempt.userId);

  /**
   * The plain-text part.
   *
   * Not a stripped copy of the HTML. It is a readable message in its own
   * right, because some people read all their mail this way and a text part
   * that reads like a leftover tells them what the sender thinks of them. It
   * carries the same figures, the same sections and the same link, and it is
   * what EmailLog keeps as the record of what was sent.
   */
  const pad = (label: string) => `${label}:`.padEnd(14);
  const text: string[] = [
    `Hi ${first},`,
    "",
    "Your KiwiPilotPrep mock exam result is ready.",
    "",
    "YOUR RESULT",
    `  ${pad("Exam")}${report.exam.title}`,
    ...(report.exam.subject ? [`  ${pad("Subject")}${report.exam.subject}`] : []),
    `  ${pad("Score")}${r.scorePercent}%`,
    `  ${pad("Correct")}${r.correct} / ${r.total}`,
    `  ${pad("Incorrect")}${r.incorrect}`,
    `  ${pad("Unanswered")}${r.unanswered}`,
    ...(r.passed === null ? [] : [`  ${pad("Status")}${resultStatus(report)}`]),
    ...(r.passingPercent === null ? [] : [`  ${pad("Pass mark")}${r.passingPercent}%`]),
  ];

  if (report.autoSubmitted) {
    text.push("", "This attempt was submitted automatically when the time ran out.");
  }

  text.push("", "PERFORMANCE SUMMARY", `  ${report.summary}`);

  const strong = report.strongAreas.slice(0, 4);
  if (strong.length) {
    text.push("", "Strong areas");
    for (const a of strong) text.push(`  ${a.area} — ${a.accuracy}%`);
  }

  const weak = report.weakAreas.slice(0, 4);
  if (weak.length) {
    text.push("", "Weak areas");
    for (const a of weak) {
      const missed = a.missed > 0 ? ` (${a.missed} missed)` : "";
      text.push(`  ${a.area} — ${a.accuracy}%${missed}`);
    }
  }

  const revision = report.revisionAreas.slice(0, 6);
  if (revision.length) {
    text.push("", "REVISION AREAS");
    for (const a of revision) {
      const n = `${a.missed} question${a.missed === 1 ? "" : "s"} missed`;
      text.push(`  ${a.area} — ${n}`);
    }
  }

  text.push(
    "",
    attached
      ? "Your Knowledge Deficiency Report is attached to this email. It covers your"
      : "Your Knowledge Deficiency Report is linked below. It covers your",
    "overall result, every question you missed with the correct answer and any",
    "explanation it carries, and the revision area each one belongs to.",
    "",
    "View My Result:",
    link,
    "",
    "Regards,",
    "KiwiPilotPrep",
    "Independent aviation exam preparation.",
    "",
    "KiwiPilotPrep is an independent educational tool. Not affiliated with Aspeq or CAANZ.",
  );

  const result = await sendEmail({
    to: report.student.email,
    subject: `Your KiwiPilotPrep Mock Result — ${report.exam.subject ?? report.exam.title}`,
    body: text.join("\n"),
    html: renderScorecardHtml(report, link, attached),
    template: "mock-scorecard",
    userId: attempt.userId,
    attemptId,
    ...(attachments ? { attachments } : {}),
  });

  return { status: result.status, pdfBytes, ...(result.error ? { error: result.error } : {}) };
}
