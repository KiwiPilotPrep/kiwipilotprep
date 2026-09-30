import Link from "next/link";

import { formatMinor } from "@/lib/money";
import type { StudentHistory } from "@/lib/admin/student-history";
import { revokeEntitlement, restoreEntitlement } from "@/app/admin/product-actions";

/**
 * One student's complete record, as an admin needs to read it.
 *
 * Used by the student history page and by the guarantee claim review. Both
 * show the same thing because both are answering the same question — is
 * this person who they say they are, did they buy what they say they
 * bought, and did they do the work — and a claim reviewer should not be
 * looking at a thinner version of the truth than a support agent.
 *
 * Every figure comes from `studentHistory`. Nothing is computed here.
 */

/**
 * How long a grant runs for, in the words an admin would use.
 *
 * Derived from the two dates already on the row rather than stored, so it
 * cannot disagree with them.
 */
function duration(from: Date, until: Date | null): string {
  if (!until) return "Unlimited";
  const days = Math.round((until.getTime() - from.getTime()) / 86_400_000);
  if (days <= 0) return "Expired";
  if (days < 31) return `${days} day${days === 1 ? "" : "s"}`;
  const months = Math.round(days / 30.44);
  return `${months} month${months === 1 ? "" : "s"}`;
}

const pill = (status: string) =>
  status === "PAID" || status === "ACTIVE" || status === "SUBMITTED"
    ? "published"
    : status === "FAILED" || status === "REVOKED" || status === "EXPIRED"
      ? "archived"
      : "draft";

export default function StudentHistoryView({
  data,
  heading = true,
  allowAccessChanges = false,
}: {
  data: StudentHistory;
  heading?: boolean;
  /**
   * Adds revoke and restore to the access table. On by default nowhere: a
   * claim reviewer is reading the record, not editing it, and a revoke
   * button beside a refund decision is an accident waiting to happen.
   */
  allowAccessChanges?: boolean;
}) {
  const { student, orders, entitlements, progress, attempts, totals } = data;

  return (
    <>
      {heading && (
        <div className="panel">
          <div className="panel-hd">
            <h2>Student</h2>
            <span className={`pill-s ${pill(student.status)}`}>{student.status}</span>
          </div>
          <table className="atable">
            <tbody>
              <tr>
                <td className="nm">Name</td>
                <td>{student.name}</td>
              </tr>
              <tr>
                <td className="nm">Email</td>
                <td>
                  <a href={`mailto:${student.email}`}>{student.email}</a>
                  {!student.emailVerifiedAt && <span className="xs"> · unconfirmed</span>}
                </td>
              </tr>
              <tr>
                <td className="nm">Account created</td>
                <td>{student.createdAt.toLocaleString("en-NZ")}</td>
              </tr>
              <tr>
                <td className="nm">Activity</td>
                <td className="xs">
                  {totals.paidOrders} paid order{totals.paidOrders === 1 ? "" : "s"} ·{" "}
                  {totals.mockAttempts} completed mock{totals.mockAttempts === 1 ? "" : "s"} ·{" "}
                  {totals.mocksPassed} passed ·{" "}
                  {totals.freeTrialUsed ? "free mock used" : "free mock unused"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* ------------------------------------------------------- purchases */}
      <div className="panel">
        <div className="panel-hd">
          <h2>Purchases ({orders.length})</h2>
          <span className="xs">Amounts are what was charged at the time, not today&rsquo;s price</span>
        </div>
        {orders.length === 0 ? (
          <div className="empty">
            <b>No orders</b>This student has never been through checkout.
          </div>
        ) : (
          <table className="atable">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Product</th>
                <th>Placed</th>
                <th>Paid</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td className="nm num">{o.reference}</td>
                  <td>{o.productTitle}</td>
                  <td className="xs" style={{ whiteSpace: "nowrap" }}>
                    {o.placedAt.toLocaleDateString("en-NZ")}
                  </td>
                  <td className="num" style={{ whiteSpace: "nowrap" }}>
                    {formatMinor(o.amountMinor, o.currency)} {o.currency}
                    {o.discountMinor > 0 && o.listAmountMinor !== null && (
                      <div className="xs">
                        was {formatMinor(o.listAmountMinor, o.currency)}
                        {o.couponCode && ` · ${o.couponCode}`}
                      </div>
                    )}
                  </td>
                  <td>
                    <span className={`pill-s ${pill(o.status)}`}>{o.status}</span>
                    {o.paymentStatus && <div className="xs">{o.paymentStatus}</div>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ----------------------------------------------------------- access */}
      <div className="panel">
        <div className="panel-hd">
          <h2>Access ({entitlements.length})</h2>
        </div>
        {entitlements.length === 0 ? (
          <div className="empty">
            <b>No access granted</b>Nothing has been bought or granted to this account.
          </div>
        ) : (
          <table className="atable">
            <thead>
              <tr>
                <th>Grants</th>
                <th>Scope</th>
                <th>Source</th>
                <th>From</th>
                <th>Until</th>
                <th>Duration</th>
                <th>Status</th>
                {allowAccessChanges && <th />}
              </tr>
            </thead>
            <tbody>
              {entitlements.map((e) => (
                <tr key={e.id}>
                  <td className="nm">
                    {e.what}
                    {e.note && <div className="xs">{e.note}</div>}
                  </td>
                  <td className="xs">{e.scope}</td>
                  <td className="xs">
                    {e.source}
                    {e.orderReference && <div className="xs num">{e.orderReference}</div>}
                  </td>
                  <td className="xs" style={{ whiteSpace: "nowrap" }}>
                    {e.grantedAt.toLocaleDateString("en-NZ")}
                  </td>
                  <td className="xs" style={{ whiteSpace: "nowrap" }}>
                    {e.expiresAt ? e.expiresAt.toLocaleDateString("en-NZ") : "No expiry"}
                  </td>
                  <td className="xs" style={{ whiteSpace: "nowrap" }}>
                    {duration(e.grantedAt, e.expiresAt)}
                  </td>
                  <td>
                    <span className={`pill-s ${pill(e.status)}`}>{e.status}</span>
                  </td>
                  {allowAccessChanges && (
                    <td>
                      {e.status === "ACTIVE" ? (
                        <form action={revokeEntitlement.bind(null, e.id)}>
                          <button className="btn btn-g btn-sm" type="submit">
                            Revoke
                          </button>
                        </form>
                      ) : (
                        <form action={restoreEntitlement.bind(null, e.id)}>
                          <button className="btn btn-g btn-sm" type="submit">
                            Restore
                          </button>
                        </form>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* --------------------------------------------------------- progress */}
      <div className="panel">
        <div className="panel-hd">
          <h2>Course progress</h2>
          <span className="xs">Only courses this student has access to</span>
        </div>
        {progress.length === 0 ? (
          <div className="empty">
            <b>No course access</b>There is nothing to make progress through yet.
          </div>
        ) : (
          <table className="atable">
            <thead>
              <tr>
                <th>Course</th>
                <th>Complete</th>
                <th>Done</th>
                <th>Remaining</th>
                <th>Last activity</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {progress.map((p) => (
                <tr key={p.courseId}>
                  <td className="nm">{p.courseTitle}</td>
                  <td className="num">
                    {p.percent}%
                    <div className="bar mt-s" style={{ maxWidth: "120px" }}>
                      <i style={{ width: `${p.percent}%` }} />
                    </div>
                  </td>
                  <td className="num">
                    {p.completed} / {p.total}
                  </td>
                  <td className="num">{p.remaining}</td>
                  <td className="xs" style={{ whiteSpace: "nowrap" }}>
                    {p.lastActivity ? p.lastActivity.toLocaleDateString("en-NZ") : "—"}
                  </td>
                  <td>
                    <span
                      className={`pill-s ${
                        p.percent >= 100 ? "published" : p.completed > 0 ? "draft" : "archived"
                      }`}
                    >
                      {p.percent >= 100 ? "COMPLETE" : p.completed > 0 ? "IN PROGRESS" : "NOT STARTED"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ------------------------------------------------------------ mocks */}
      <div className="panel">
        <div className="panel-hd">
          <h2>Mock history ({attempts.length})</h2>
        </div>
        {attempts.length === 0 ? (
          <div className="empty">
            <b>No mock attempts</b>This student has not sat a mock exam.
          </div>
        ) : (
          <table className="atable">
            <thead>
              <tr>
                <th>Mock</th>
                <th>Subject</th>
                <th>Sat</th>
                <th>Score</th>
                <th>Percentage</th>
                <th>Result</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {attempts.map((a) => (
                <tr key={a.id}>
                  <td>
                    <span className="nm">{a.examTitle}</span>
                    {a.isFreeTrial && <div className="xs">free mock</div>}
                  </td>
                  <td className="xs">{a.subjectTitle ?? "—"}</td>
                  <td className="xs" style={{ whiteSpace: "nowrap" }}>
                    {(a.submittedAt ?? a.startedAt).toLocaleDateString("en-NZ")}
                  </td>
                  <td className="num" style={{ whiteSpace: "nowrap" }}>
                    {a.status === "IN_PROGRESS" ? "—" : `${a.correct} / ${a.total}`}
                  </td>
                  <td className="num" style={{ whiteSpace: "nowrap" }}>
                    {a.status === "IN_PROGRESS" ? "—" : `${a.scorePercent}%`}
                  </td>
                  <td>
                    {a.status === "IN_PROGRESS" ? (
                      <span className="pill-s draft">IN PROGRESS</span>
                    ) : a.passed === null ? (
                      <span className="pill-s draft">NO PASS MARK</span>
                    ) : (
                      <span className={`pill-s ${a.passed ? "published" : "archived"}`}>
                        {a.passed ? "PASS" : "BELOW PASS"}
                      </span>
                    )}
                    {a.passingPercent !== null && (
                      <div className="xs">pass {a.passingPercent}%</div>
                    )}
                  </td>
                  <td>
                    {a.status !== "IN_PROGRESS" && (
                      // Inside the admin console. Never the student route.
                      <Link className="btn btn-g btn-sm" href={`/admin/attempts/${a.id}`}>
                        Inspect
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
