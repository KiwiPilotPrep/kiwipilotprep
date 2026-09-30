import Link from "next/link";
import { notFound } from "next/navigation";

import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { Crumb } from "@/components/admin/ui";
import Scorecard from "@/components/mock/Scorecard";

export const metadata = { title: "Attempt — Admin" };

/**
 * One student's result, inside the admin console.
 *
 * Inspecting a result used to send an admin to `/mocks/attempts/<id>`, which
 * is the student route: the admin left the console, picked up the student
 * navigation, and had to find their own way back. The scorecard itself was
 * always the right thing to show — it is the same component, reading the
 * same immutable snapshots — so what was needed was a place to show it that
 * belongs to the admin.
 *
 * Authorisation is the admin role and nothing else. No session is switched
 * and no student token is minted; the ownership check that guards the
 * student route is replaced here by a role check, which is stricter rather
 * than looser. The scorecard is told the viewer is not the owner, so the
 * student's own controls — resend my report, retry — are not rendered.
 *
 * The three controls an admin does need are supplied here and point inside
 * the console: Back to Attempts & Results, Download result (the same PDF,
 * built for the student it belongs to), and History, which opens this
 * student's mock history in the console rather than the student's own page.
 */
export default async function AdminAttemptPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  await requireRole("ADMIN");
  const { attemptId } = await params;

  const attempt = await db.mockAttempt.findUnique({
    where: { id: attemptId },
    select: {
      id: true,
      status: true,
      examTitle: true,
      subjectTitle: true,
      startedAt: true,
      submittedAt: true,
      scorePercent: true,
      user: { select: { id: true, name: true, email: true } },
      mockExam: { select: { isFreeTrial: true } },
      report: { select: { status: true, sentAt: true, pdfBytes: true } },
    },
  });
  if (!attempt) notFound();

  return (
    <>
      <Crumb
        trail={[
          { href: "/admin/attempts", label: "Attempts & Results" },
          { label: attempt.user.name },
        ]}
      />

      <div className="ahead">
        <div>
          <h1>{attempt.user.name}</h1>
          <p>
            {attempt.user.email} · {attempt.examTitle}
            {attempt.mockExam.isFreeTrial ? " · free mock" : ""}
            {attempt.report
              ? ` · report ${attempt.report.status.toLowerCase()}${
                  attempt.report.pdfBytes ? ` (${attempt.report.pdfBytes} byte PDF)` : ""
                }`
              : " · no report record"}
          </p>
        </div>
        <Link className="btn btn-g btn-sm" href="/admin/attempts">
          Back to attempts
        </Link>
      </div>

      {attempt.status === "IN_PROGRESS" ? (
        <div className="panel mt-m">
          <div className="empty">
            <b>This attempt is still in progress</b>
            Started {attempt.startedAt.toLocaleString("en-NZ")}. There is no result to show until
            it is submitted or the clock runs out.
          </div>
        </div>
      ) : (
        // The student's own scorecard, rendered from the attempt's immutable
        // snapshots — the same view the student has, so an admin answering a
        // question about it is looking at the same thing they are.
        <div className="admin-scorecard">
          <Scorecard
            attemptId={attempt.id}
            viewerIsOwner={false}
            nav={
              <>
                <Link className="btn btn-g" href="/admin/attempts">
                  Back
                </Link>
                {/* A plain anchor: a file, not a route. */}
                <a
                  className="btn btn-p"
                  href={`/mocks/attempts/${attempt.id}/report.pdf`}
                >
                  Download result
                </a>
                <Link
                  className="btn btn-g"
                  href={`/admin/history/${attempt.user.id}/mocks`}
                >
                  History
                </Link>
              </>
            }
          />
        </div>
      )}
    </>
  );
}
