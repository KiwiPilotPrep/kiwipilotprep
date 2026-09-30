import Link from "next/link";

import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { assessGuarantee } from "@/lib/guarantee/eligibility";
import { STUDENT_LABELS } from "@/lib/guarantee/workflow";
import { formatMinor } from "@/lib/money";
import { submitClaim, addClaimDocument } from "./actions";

export const metadata = { title: "Pass Guarantee — KiwiPilotPrep" };

const ERRORS: Record<string, string> = {
  "not-applicable": "You do not have a purchase covered by the current guarantee.",
  "not-eligible": "The guarantee requirements are not met yet.",
  duplicate: "You already have a claim for this purchase.",
  "exam-name": "Please tell us which exam you sat.",
  "document-required": "Please attach your official Aspeq result sheet.",
  document: "That file could not be accepted.",
  "not-found": "That claim could not be found.",
  closed: "That claim is closed.",
};

export default async function GuaranteePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; detail?: string; submitted?: string; added?: string }>;
}) {
  const user = await requireUser();
  const { error, detail, submitted } = await searchParams;

  const assessment = await assessGuarantee(user.id);

  const claim = assessment.existingClaim
    ? await db.guaranteeClaim.findUnique({
        where: { id: assessment.existingClaim.id },
        include: {
          documents: { orderBy: { createdAt: "desc" } },
          refunds: { orderBy: { createdAt: "desc" } },
          order: { select: { reference: true, amountMinor: true, currency: true } },
          // internalNotes is deliberately not selected — admin notes are never
          // exposed to the student (§3).
        },
      })
    : null;

  return (
    <section className="sec">
      <div className="wrap">
        <div className="sec-head r in">
          <div className="eyebrow">Pass Guarantee</div>
          <h1 className="h2">Your guarantee status</h1>
          <p className="lede mt-s">
            Complete the study modules and required mocks, and if you then do not pass your
            official Aspeq exam, you can submit a claim for review.
          </p>
        </div>

        {error && (
          <p className="fnote on warn" role="alert">
            {ERRORS[error] ?? "Something went wrong."} {detail}
          </p>
        )}
        {submitted && (
          <p className="fnote on" role="status">
            Claim <b>{submitted}</b> submitted. We will review it and be in touch.
          </p>
        )}

        {!assessment.applicable ? (
          <div className="empty panel mt-l">
            <b>No guarantee applies to your account yet</b>
            The guarantee covers specific packages. Browse the{" "}
            <Link href="/pricing">available packages</Link> to see what is included.
          </div>
        ) : (
          <>
            {/* ------------------------------------------- requirements */}
            <div className="panel mt-l">
              <div className="panel-hd">
                <h2>Requirements</h2>
                <span className="xs">
                  {assessment.productTitle} · {assessment.orderReference}
                </span>
              </div>
              <table className="atable">
                <tbody>
                  {assessment.requirements.map((r) => (
                    <tr key={r.label}>
                      <td className="nm">{r.label}</td>
                      <td>{r.detail}</td>
                      <td>
                        <span className={`pill-s ${r.met ? "published" : "draft"}`}>
                          {r.met ? "Met" : "Not yet"}
                        </span>
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td className="nm">Guarantee</td>
                    <td>
                      {claim
                        ? STUDENT_LABELS[claim.status]
                        : assessment.eligible
                          ? "You can submit a claim"
                          : "Not eligible yet"}
                    </td>
                    <td>
                      <span
                        className={`pill-s ${claim ? "draft" : assessment.eligible ? "published" : "archived"}`}
                      >
                        {claim ? claim.status.replace(/_/g, " ") : assessment.eligible ? "Eligible" : "Not eligible"}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>

              {assessment.blockers.length > 0 && (
                <div className="panel-bd">
                  <ul className="blockers">
                    {assessment.blockers.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* --------------------------------------------- the claim */}
            {claim ? (
              <div className="panel">
                <div className="panel-hd">
                  <h2>Claim {claim.reference}</h2>
                  <span className="pill-s draft">{STUDENT_LABELS[claim.status]}</span>
                </div>
                <table className="atable">
                  <tbody>
                    <tr><td className="nm">Submitted</td><td>{claim.submittedAt?.toLocaleString("en-NZ") ?? "—"}</td></tr>
                    <tr><td className="nm">Exam</td><td>{claim.examName ?? "—"}</td></tr>
                    <tr><td className="nm">Result</td><td>{claim.examResult ?? "—"}</td></tr>
                    <tr>
                      <td className="nm">Documents</td>
                      <td>
                        {claim.documents.length === 0 ? "—" : claim.documents.map((d) => (
                          <div key={d.id}>
                            <Link href={`/api/documents/${d.id}`}>{d.filename}</Link>
                          </div>
                        ))}
                      </td>
                    </tr>
                    {claim.status === "REJECTED" && claim.rejectionReason && (
                      <tr><td className="nm">Outcome</td><td>{claim.rejectionReason}</td></tr>
                    )}
                    {claim.refunds.length > 0 && (
                      <tr>
                        <td className="nm">Refund</td>
                        <td>
                          {claim.refunds.map((r) => (
                            <div key={r.id}>
                              {formatMinor(r.amountMinor, r.currency)} · {r.method.replace("_", " ")} ·{" "}
                              {r.status}
                              {r.processedAt && ` · ${r.processedAt.toLocaleDateString("en-NZ")}`}
                            </div>
                          ))}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>

                {claim.status === "NEEDS_INFORMATION" && (
                  <div className="panel-bd">
                    <div className="cnote warning">
                      <b>More information needed</b>
                      <p>Please upload the additional document requested and we will continue the review.</p>
                    </div>
                    <form className="inline-form" action={addClaimDocument.bind(null, claim.id)}>
                      <div className="fld">
                        <label htmlFor="document">Additional document</label>
                        <input id="document" name="document" type="file" accept=".pdf,.jpg,.jpeg,.png" required />
                        <p className="fhint">PDF, JPG or PNG · up to 10 MB</p>
                      </div>
                      <button className="btn btn-p" type="submit">Upload document</button>
                    </form>
                  </div>
                )}
              </div>
            ) : assessment.eligible ? (
              <div className="panel">
                <div className="panel-hd"><h2>Submit a guarantee claim</h2></div>
                <div className="panel-bd">
                  <div className="cnote info">
                    <b>Before you submit</b>
                    <p>
                      You can submit a claim if your official Aspeq result meets the guarantee
                      conditions. Submitting does not approve a refund — your result sheet is
                      verified against the guarantee terms first.
                    </p>
                  </div>

                  <form className="inline-form" action={submitClaim}>
                    <div className="frow">
                      <div className="fld">
                        <label htmlFor="examName">Which exam did you sit?</label>
                        <input id="examName" name="examName" placeholder="e.g. PPL Air Law" required />
                      </div>
                      <div className="fld">
                        <label htmlFor="examSittingDate">Date sat</label>
                        <input id="examSittingDate" name="examSittingDate" type="date" />
                      </div>
                    </div>

                    <div className="fld">
                      <label htmlFor="examResult">Result as shown on your result sheet</label>
                      <input id="examResult" name="examResult" placeholder="e.g. 62% — not achieved" />
                    </div>

                    <div className="fld">
                      <label htmlFor="document">Official Aspeq result sheet</label>
                      <input id="document" name="document" type="file" accept=".pdf,.jpg,.jpeg,.png" required />
                      <p className="fhint">
                        PDF, JPG or PNG · up to 10 MB. Stored privately and visible only to you and
                        the reviewing administrator.
                      </p>
                    </div>

                    <div className="fld">
                      <label htmlFor="studentNote">Anything else we should know?</label>
                      <textarea id="studentNote" name="studentNote" rows={3} />
                    </div>

                    <button className="btn btn-p" type="submit">Submit claim</button>
                  </form>
                </div>
              </div>
            ) : null}

            {/* ------------------------------------------------- terms */}
            {assessment.policyTerms && (
              <div className="panel">
                <div className="panel-hd">
                  <h2>Guarantee terms</h2>
                  <span className="xs num">version {assessment.policyVersion}</span>
                </div>
                <div className="panel-bd">
                  <p className="small" style={{ whiteSpace: "pre-wrap" }}>
                    {assessment.policyTerms}
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        <p className="xs" style={{ marginTop: "22px" }}>
          Completing the study modules is an educational milestone, not an official CAANZ or Aspeq
          certification of readiness. KiwiPilotPrep is an independent educational tool, not
          affiliated with Aspeq or CAANZ.
        </p>
      </div>
    </section>
  );
}
