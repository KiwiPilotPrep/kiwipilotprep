import { notFound } from "next/navigation";

import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatMinor } from "@/lib/money";
import { Crumb } from "@/components/admin/ui";
import StudentHistoryView from "@/components/admin/StudentHistory";
import Attachments from "@/components/admin/Attachments";
import SubmitButton from "@/components/admin/SubmitButton";
import GuaranteeEligibility from "@/components/admin/GuaranteeEligibility";
import { studentHistory } from "@/lib/admin/student-history";
import {
  setClaimStatus,
  addInternalNote,
  openRefund,
  completeRefund,
} from "@/app/admin/guarantee-actions";

export const metadata = { title: "Guarantee claim — Admin" };

/**
 * One formal guarantee claim, and the workflow for settling it.
 *
 * This is the operational side of the pass guarantee the site advertises: a
 * claim is reviewed, approved or rejected, and — if approved — a refund is
 * opened and then marked complete once the money has actually moved. Every
 * transition goes through the state machine in `lib/guarantee/workflow`,
 * which refuses an invalid one and writes an audit row naming the admin who
 * did it. The refund amount comes from the order, never from this form.
 *
 * Reached from the Guarantee Claims list rather than from the sidebar. The
 * separate Refunds console is gone; a refund belongs to the claim that
 * caused it, and managing it anywhere else was a second place to look.
 */

const NEXT: Record<string, { to: "UNDER_REVIEW" | "APPROVED" | "REJECTED"; label: string }[]> = {
  SUBMITTED: [{ to: "UNDER_REVIEW", label: "Begin review" }],
  UNDER_REVIEW: [
    { to: "APPROVED", label: "Approve claim" },
    { to: "REJECTED", label: "Reject claim" },
  ],
};

export default async function AdminClaimPage({
  params,
}: {
  params: Promise<{ claimId: string }>;
}) {
  await requireRole("ADMIN");
  const { claimId } = await params;

  const claim = await db.guaranteeClaim.findUnique({
    where: { id: claimId },
    include: {
      user: { select: { name: true, email: true } },
      order: { select: { reference: true, amountMinor: true, currency: true, product: { select: { title: true } } } },
      policy: { select: { version: true, requiredStudyPercent: true, requiredMockCount: true } },
      documents: { orderBy: { createdAt: "asc" } },
      refunds: { orderBy: { createdAt: "desc" } },
      audit: { orderBy: { createdAt: "desc" }, include: { actor: { select: { name: true } } } },
      reviewedBy: { select: { name: true } },
    },
  });
  if (!claim) notFound();

  // The same record the student history page shows, from the same function.
  // A claim reviewer needs the purchase, the access, the progress and the
  // mocks in front of them, and reading a thinner version of that than
  // support does is how a refund gets decided on half the facts.
  // Assessed against the order this claim was filed against, not merely the
  // student's newest purchase.
  const history = await studentHistory(claim.userId, claim.orderId);

  const openRefundRow = claim.refunds.find((r) => r.status !== "REFUNDED");

  return (
    <>
      <Crumb
        trail={[
          { href: "/admin/claims", label: "Guarantee Claims" },
          { label: claim.reference },
        ]}
      />

      <div className="ahead">
        <div>
          <h1>{claim.reference}</h1>
          <p>
            {claim.user.name} · {claim.user.email} · {claim.order.product.title} ·{" "}
            {formatMinor(claim.order.amountMinor, claim.order.currency)} on order{" "}
            {claim.order.reference}
          </p>
        </div>
        <span className={`pill-s ${claim.status === "APPROVED" ? "published" : claim.status === "REJECTED" ? "archived" : "draft"}`}>
          {claim.status.replace(/_/g, " ")}
        </span>
      </div>

      {/* The policy's own assessment, rendered from `assessGuarantee`. It
          decides nothing — the workflow below re-checks on the server. */}
      {history && <GuaranteeEligibility assessment={history.guarantee} />}

      {/* ------------------------------------------------ the claim itself */}
      <div className="panel">
        <div className="panel-hd">
          <h2>Completion evidence</h2>
        </div>
        <table className="atable">
          <tbody>
            <tr>
              <td className="nm">Study completed at claim</td>
              <td>
                {claim.studyPercentAtClaim ?? "—"}% (policy requires{" "}
                {claim.policy.requiredStudyPercent}%)
              </td>
            </tr>
            <tr>
              <td className="nm">Mocks completed at claim</td>
              <td>
                {claim.mocksCompletedAtClaim ?? "—"} (policy requires {claim.policy.requiredMockCount})
              </td>
            </tr>
            <tr>
              <td className="nm">Claim submitted</td>
              <td>
                {claim.submittedAt
                  ? claim.submittedAt.toLocaleString("en-NZ")
                  : `Not submitted · created ${claim.createdAt.toLocaleString("en-NZ")}`}
              </td>
            </tr>
            <tr>
              <td className="nm">Policy version</td>
              <td>{claim.policyVersionAtClaim ?? claim.policy.version}</td>
            </tr>
            <tr>
              <td className="nm">Exam</td>
              <td>
                {claim.examName ?? "—"}
                {claim.examSittingDate && ` · sat ${claim.examSittingDate.toLocaleDateString("en-NZ")}`}
                {claim.examResult && ` · ${claim.examResult}`}
              </td>
            </tr>
            <tr>
              <td className="nm">Student note</td>
              <td style={{ whiteSpace: "pre-wrap" }}>{claim.studentNote ?? "—"}</td>
            </tr>
            <tr>
              <td className="nm">Documents</td>
              <td className="xs">
                {claim.documents.length === 0
                  ? "None uploaded"
                  : `${claim.documents.length} attached — see below`}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* The evidence itself, openable and downloadable rather than named. */}
      <Attachments
        files={claim.documents}
        basePath="/api/documents"
        heading="Uploaded document"
        emptyHint="This claim has no result sheet attached. Ask the student for one before deciding."
      />

      {/* ------------------------------------------------------- workflow */}
      <div className="panel">
        <div className="panel-hd">
          <h2>Decision</h2>
          {claim.reviewedBy && <span className="xs">Reviewed by {claim.reviewedBy.name}</span>}
        </div>
        <div className="acts" style={{ padding: "14px 18px", gap: "8px", flexWrap: "wrap" }}>
          {(NEXT[claim.status] ?? []).map((n) => (
            <form key={n.to} action={setClaimStatus.bind(null, claim.id, n.to)}>
              <SubmitButton pendingLabel={`${n.label}…`}>{n.label}</SubmitButton>
            </form>
          ))}
          {!NEXT[claim.status] && (
            <p className="xs">
              No further transition is available from {claim.status.replace(/_/g, " ").toLowerCase()}.
            </p>
          )}
        </div>

      </div>

      {/* --------------------------------------------------------- refund */}
      <div className="panel">
        <div className="panel-hd">
          <h2>Refund</h2>
          <span className="xs">
            Amount is taken from the order — {formatMinor(claim.order.amountMinor, claim.order.currency)}
          </span>
        </div>

        {claim.refunds.length > 0 && (
          <table className="atable">
            <thead>
              <tr>
                <th>Amount</th>
                <th>Method</th>
                <th>Status</th>
                <th>Opened</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {claim.refunds.map((r) => (
                <tr key={r.id}>
                  <td className="num">{formatMinor(r.amountMinor, r.currency)}</td>
                  <td className="xs">{r.method}</td>
                  <td>
                    <span className={`pill-s ${r.status === "REFUNDED" ? "published" : "draft"}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="xs">{r.createdAt.toLocaleString("en-NZ")}</td>
                  <td>
                    {r.status !== "REFUNDED" && (
                      <form className="acts" action={completeRefund.bind(null, r.id)} style={{ gap: "6px" }}>
                        <input name="reference" placeholder="Bank reference" style={{ width: "150px" }} />
                        <SubmitButton pendingLabel="Recording…">Mark complete</SubmitButton>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {claim.status === "APPROVED" && !openRefundRow && (
          <div className="panel-bd">
            <form className="inline-form" action={openRefund.bind(null, claim.id)}>
              <div className="frow">
                <div className="fld">
                  <label htmlFor="method">Method</label>
                  <select id="method" name="method" defaultValue="BANK_TRANSFER">
                    <option value="BANK_TRANSFER">Bank transfer</option>
                    <option value="RAZORPAY">Razorpay</option>
                    <option value="MANUAL">Manual</option>
                  </select>
                </div>
                <div className="fld">
                  <label htmlFor="notes">Notes</label>
                  <input id="notes" name="notes" />
                </div>
              </div>
              <button className="btn btn-p btn-sm" type="submit">
                Open refund
              </button>
            </form>
          </div>
        )}

        {claim.status !== "APPROVED" && claim.refunds.length === 0 && (
          <div className="empty">
            <b>No refund yet</b>A refund can only be opened on an approved claim.
          </div>
        )}
      </div>

      {/* Internal notes sit after the refund, not before it. Both actions
          bind only the claim id, so anything reading the page's bound
          actions in order should find the money one where it expects it. */}
      <div className="panel">
        <div className="panel-hd">
          <h2>Internal notes</h2>
          <span className="xs">Never shown to the student</span>
        </div>
        <div className="panel-bd">
          <p className="xs" style={{ whiteSpace: "pre-wrap", marginBottom: "10px" }}>
            {claim.internalNotes ?? "No notes yet."}
          </p>
          <form className="inline-form" action={addInternalNote.bind(null, claim.id)}>
            <div className="fld">
              <label htmlFor="note">Add a note</label>
              <textarea id="note" name="note" rows={2} />
            </div>
            <button className="btn btn-g btn-sm" type="submit">
              Save note
            </button>
          </form>
        </div>
      </div>

      {/* ------------------------------------------- the student's record */}
      <div className="sec-head mt-m">
        <h2 className="h3">Student verification</h2>
        <p className="xs">
          The same record as Students &amp; Access, from the same source. Amounts are what was
          charged at the time.
        </p>
      </div>
      {history ? (
        <StudentHistoryView data={history} />
      ) : (
        <div className="panel">
          <div className="empty">
            <b>The student account no longer exists</b>The claim and its audit trail remain.
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- audit trail */}
      <div className="panel">
        <div className="panel-hd">
          <h2>Audit trail</h2>
        </div>
        {claim.audit.length === 0 ? (
          <div className="empty">
            <b>Nothing recorded yet</b>Every transition is written here as it happens.
          </div>
        ) : (
          <table className="atable">
            <thead>
              <tr>
                <th>When</th>
                <th>Actor</th>
                <th>Change</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              {claim.audit.map((a) => (
                <tr key={a.id}>
                  <td className="xs" style={{ whiteSpace: "nowrap" }}>
                    {a.createdAt.toLocaleString("en-NZ")}
                  </td>
                  <td className="xs">{a.actor?.name ?? "system"}</td>
                  <td className="xs">
                    {a.fromStatus ?? "—"} → {a.toStatus ?? "—"}
                  </td>
                  <td className="xs">{a.note ?? ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
