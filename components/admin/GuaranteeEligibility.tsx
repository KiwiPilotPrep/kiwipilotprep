import type { Eligibility } from "@/lib/guarantee/eligibility";

/**
 * What the guarantee policy says about this student.
 *
 * A display of `assessGuarantee`, and nothing else. Every requirement, its
 * label, whether it is met and the detail beside it are produced by the
 * policy assessment that the student flow and the claim submission both
 * run; this adds no condition, no threshold and no opinion.
 *
 * That matters because the verdict here is not what decides anything. An
 * admin reads it, then uses the claim workflow, and the workflow re-checks
 * on the server. A green tick on this panel grants nobody a refund.
 */
export default function GuaranteeEligibility({ assessment }: { assessment: Eligibility }) {
  if (!assessment.applicable) {
    return (
      <div className="panel">
        <div className="panel-hd">
          <h2>Guarantee eligibility</h2>
        </div>
        <div className="empty">
          <b>The guarantee does not apply</b>
          {assessment.policyId
            ? "This student has no paid order for a product the active policy covers."
            : "There is no active guarantee policy."}
        </div>
      </div>
    );
  }

  return (
    <div className="panel">
      <div className="panel-hd">
        <h2>Guarantee eligibility</h2>
        <span className={`pill-s ${assessment.eligible ? "published" : "archived"}`}>
          {assessment.eligible ? "ELIGIBLE" : "NOT ELIGIBLE"}
        </span>
      </div>

      <table className="atable">
        <tbody>
          {assessment.requirements.map((r) => (
            <tr key={r.label}>
              <td style={{ width: "34px" }}>
                <span
                  aria-hidden="true"
                  style={{
                    color: r.met ? "var(--green, #1C6B4B)" : "var(--red, #9C3A28)",
                    fontWeight: 700,
                  }}
                >
                  {r.met ? "✓" : "✕"}
                </span>
                <span className="sr-only">{r.met ? "Met" : "Not met"}</span>
              </td>
              <td className="nm">{r.label}</td>
              <td>{r.detail}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="panel-bd">
        <p>
          <b>Overall: {assessment.eligible ? "ELIGIBLE" : "NOT ELIGIBLE"}</b>
        </p>
        {!assessment.eligible && assessment.blockers.length > 0 && (
          <>
            <p className="xs" style={{ marginTop: "8px" }}>
              Reason{assessment.blockers.length === 1 ? "" : "s"}:
            </p>
            <ul className="xs" style={{ marginTop: "4px", paddingLeft: "18px" }}>
              {assessment.blockers.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </>
        )}
        <p className="xs" style={{ marginTop: "10px" }}>
          Assessed against policy {assessment.policyVersion ?? "—"} against order{" "}
          {assessment.orderReference ?? "—"}
          {assessment.productTitle ? ` (${assessment.productTitle})` : ""}. This is the same
          assessment the student sees and the same one a claim submission re-runs; the workflow
          below validates again on the server before anything is approved or refunded.
        </p>
      </div>
    </div>
  );
}
