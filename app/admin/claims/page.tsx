import Link from "next/link";

import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatMinor } from "@/lib/money";
import ContactInbox from "@/components/admin/ContactInbox";

export const metadata = { title: "Guarantee claims — Admin" };

/**
 * Guarantee claims, from the public contact form.
 *
 * Only submissions where the student chose "Claim Pass Guarantee Refund".
 * Everything else they might have written in about is a general query and
 * lives on its own page, so this queue is only the messages that need the
 * guarantee process rather than every message the site receives.
 *
 * Whatever the sender attached comes with it. The form used to count the
 * files and throw them away, so this page advertised attachments that had
 * never been kept; a message from before that was fixed says so plainly
 * rather than pretending there is something to open.
 */
export default async function AdminClaimsPage() {
  await requireRole("ADMIN");

  // Formal claims are the other half of this page. A student who completes
  // the guarantee flow creates one of these; it carries the evidence, the
  // state machine and the refund. A contact-form message saying "I want to
  // claim" is an enquiry, not a claim, and the two are shown apart so
  // nobody mistakes one for the other.
  const claims = await db.guaranteeClaim.findMany({
    where: { status: { not: "DRAFT" } },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    take: 100,
    select: {
      id: true,
      reference: true,
      status: true,
      createdAt: true,
      user: { select: { name: true, email: true } },
      order: { select: { amountMinor: true, currency: true, product: { select: { title: true } } } },
    },
  });

  return (
    <>
      <div className="ahead">
        <div>
          <h1>Guarantee Claims</h1>
          <p>
            Contact form submissions where the sender chose the pass guarantee. Anything they
            attached is kept and can be opened below. A formal claim — with the state machine
            and the refund behind it — is the separate list above.
          </p>
        </div>
      </div>

      {claims.length > 0 && (
        <div className="panel">
          <div className="panel-hd">
            <h2>Formal claims ({claims.length})</h2>
            <span className="xs">Submitted through the guarantee flow, with evidence attached</span>
          </div>
          <table className="atable">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Student</th>
                <th>Purchase</th>
                <th>Submitted</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {claims.map((c) => (
                <tr key={c.id}>
                  <td className="nm num">{c.reference}</td>
                  <td>
                    <span className="nm">{c.user.name}</span>
                    <div className="xs">{c.user.email}</div>
                  </td>
                  <td className="xs">
                    {c.order.product.title}
                    <div className="xs num">
                      {formatMinor(c.order.amountMinor, c.order.currency)}
                    </div>
                  </td>
                  <td className="xs" style={{ whiteSpace: "nowrap" }}>
                    {c.createdAt.toLocaleDateString("en-NZ")}
                  </td>
                  <td>
                    <span
                      className={`pill-s ${c.status === "APPROVED" ? "published" : c.status === "REJECTED" ? "archived" : "draft"}`}
                    >
                      {c.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td>
                    <Link className="btn btn-g btn-sm" href={`/admin/claims/${c.id}`}>
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="sec-head mt-m">
        <h2 className="h3">Contact enquiries about the guarantee</h2>
      </div>

      <ContactInbox
        topics={["GUARANTEE"]}
        emptyTitle="No guarantee claims"
        emptyHint="Claims arrive here when a student selects the pass guarantee on the contact page."
      />
    </>
  );
}
