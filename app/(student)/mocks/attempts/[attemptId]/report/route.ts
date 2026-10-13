import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { buildKdrReport } from "@/lib/report/kdr-report";
import { readReportToken } from "@/lib/report/link";
import { renderKdrPdf } from "@/lib/report/pdf";

/**
 * Opens one attempt's Knowledge Deficiency Report as a PDF.
 *
 * Two ways in, and both settle who is asking on the server:
 *
 *   the session, for a student already signed in — the download buttons on the
 *   scorecard, the dashboard and the history page;
 *
 *   a signed `?t=` token, for the link in the result email, which is followed
 *   in whatever browser the student reads mail in and usually carries no
 *   cookie. The token names one user and one attempt and is good for nothing
 *   else.
 *
 * An administrator is a third, narrower case: the report is built for the
 * attempt's own owner rather than for the admin, because an admin has no
 * attempts of their own and the report must still be that student's report.
 * The widening is the ADMIN role and nothing else — no token is minted, no
 * session is switched, and a student asking for another student's attempt
 * gets the same 404 they always did.
 *
 * The attempt id in the URL is a claim, not a credential. Whichever route in
 * was used, `buildKdrReport` returns null unless the attempt really belongs to
 * that user, so guessing another student's id gets the same 404 as an id that
 * does not exist. Nothing about the attempt is revealed by the difference.
 *
 * The PDF is rendered on demand from the attempt's snapshots rather than
 * stored, so this is the same report the email attached, and will still be the
 * same report a year from now even if the question, its explanation or its
 * revision area has been edited since.
 */
export async function GET(request: Request, { params }: { params: Promise<{ attemptId: string }> }) {
  const { attemptId } = await params;

  const token = new URL(request.url).searchParams.get("t");
  const session = await getCurrentUser();

  let userId: string | null = null;
  if (token) {
    userId = await readReportToken(token, attemptId);
  } else if (session?.role === "ADMIN") {
    // Build the student's report, not the admin's.
    const attempt = await db.mockAttempt.findUnique({
      where: { id: attemptId },
      select: { userId: true },
    });
    userId = attempt?.userId ?? null;
  } else {
    userId = session?.id ?? null;
  }

  // A route that returns a file cannot usefully redirect a signed-out browser,
  // so it answers rather than bouncing.
  if (!userId) return new Response("Not found", { status: 404 });

  const report = await buildKdrReport(attemptId, userId);
  if (!report) return new Response("Not found", { status: 404 });

  const pdf = await renderKdrPdf(report);
  const slug = (report.exam.subject ?? report.exam.title)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
  const date = (report.completedAt ?? new Date()).toISOString().slice(0, 10);
  const filename = `kiwipilotprep-report-${slug || "mock"}-${date}.pdf`;

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Length": String(pdf.byteLength),
      // `inline` so following the link from an email opens the report in the
      // browser's viewer rather than dropping a file into Downloads. The
      // download buttons in the app ask for an attachment instead.
      "Content-Disposition": `${token ? "inline" : "attachment"}; filename="${filename}"`,
      // A report is personal, and the emailed URL carries a credential, so no
      // shared cache may keep either.
      "Cache-Control": "private, no-store",
      "Referrer-Policy": "no-referrer",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
