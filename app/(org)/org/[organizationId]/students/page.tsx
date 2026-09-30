import Link from "next/link";
import { notFound } from "next/navigation";

import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { requireMembership, roleCan, seatSummary, OrgError } from "@/lib/org/access";
import { inviteStudent, revokeInvitation, removeStudent } from "@/app/(org)/org/actions";

export const metadata = { title: "Students — KiwiPilotPrep" };

export default async function OrgStudentsPage({
  params,
}: {
  params: Promise<{ organizationId: string }>;
}) {
  const user = await requireUser();
  const { organizationId } = await params;

  let membership;
  try {
    membership = await requireMembership(user, organizationId, "students:read");
  } catch (error) {
    if (error instanceof OrgError) notFound();
    throw error;
  }

  const canManage = roleCan(membership.role, "invitations");

  const [students, invitations, licenses] = await Promise.all([
    db.organizationStudent.findMany({
      where: { organizationId },
      orderBy: [{ status: "asc" }, { assignedAt: "desc" }],
      include: {
        user: { select: { id: true, name: true, email: true } },
        seats: {
          where: { status: "ASSIGNED" },
          include: { license: { include: { product: { select: { title: true } } } } },
        },
      },
    }),
    db.organizationInvitation.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    db.enterpriseLicense.findMany({
      where: { organizationId },
      include: { product: { select: { title: true } } },
    }),
  ]);

  const seatCounts = Object.fromEntries(
    await Promise.all(licenses.map(async (l) => [l.id, await seatSummary(l.id)] as const)),
  );

  return (
    <section className="sec">
      <div className="wrap">
        <div className="sec-head r in">
          <div className="eyebrow">
            <Link href={`/org/${organizationId}`}>{membership.organizationName}</Link>
          </div>
          <h1 className="h2">Students &amp; invitations</h1>
        </div>

        <div className="panel mt-l">
          <div className="panel-hd">
            <h2>Students ({students.filter((s) => s.status === "ACTIVE").length} active)</h2>
          </div>
          {students.length === 0 ? (
            <div className="empty">
              <b>No students yet</b>
              Invite your first student below.
            </div>
          ) : (
            <table className="atable">
              <thead>
                <tr><th>Student</th><th>Seat</th><th>Status</th><th /></tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id}>
                    <td className="nm">
                      {s.user.name}
                      <div className="xs">{s.user.email}</div>
                    </td>
                    <td>
                      {s.seats.length === 0 ? (
                        <span className="xs">No seat assigned</span>
                      ) : (
                        s.seats.map((seat) => (
                          <div key={seat.id} className="xs">{seat.license.product.title}</div>
                        ))
                      )}
                    </td>
                    <td>
                      <span className={`pill-s ${s.status === "ACTIVE" ? "published" : "archived"}`}>
                        {s.status}
                      </span>
                    </td>
                    <td>
                      <div className="acts">
                        <Link className="btn btn-g btn-sm" href={`/org/${organizationId}/students/${s.userId}`}>
                          View
                        </Link>
                        {canManage && s.status === "ACTIVE" && (
                          <form action={removeStudent.bind(null, organizationId, s.userId)}>
                            <button className="btn btn-g btn-sm" type="submit">Remove</button>
                          </form>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {canManage && (
          <>
            <div className="panel">
              <div className="panel-hd"><h2>Invite a student</h2></div>
              <div className="panel-bd">
                <form className="inline-form" action={inviteStudent.bind(null, organizationId)}>
                  <div className="frow">
                    <div className="fld">
                      <label htmlFor="email">Student email</label>
                      <input id="email" name="email" type="email" required />
                    </div>
                    <div className="fld">
                      <label htmlFor="licenseId">Assign a seat from</label>
                      <div className="selwrap">
                        <select id="licenseId" name="licenseId" defaultValue="">
                          <option value="">No seat for now</option>
                          {licenses.map((l) => (
                            <option
                              key={l.id}
                              value={l.id}
                              disabled={(seatCounts[l.id]?.available ?? 0) === 0}
                            >
                              {l.product.title} — {seatCounts[l.id]?.available ?? 0} free
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                  <p className="fhint">
                    The invitation expires in 14 days and can only be accepted from the address it
                    was sent to.
                  </p>
                  <button className="btn btn-p" type="submit">Send invitation</button>
                </form>
              </div>
            </div>

            <div className="panel">
              <div className="panel-hd"><h2>Invitations ({invitations.length})</h2></div>
              {invitations.length === 0 ? (
                <div className="empty">No invitations sent yet.</div>
              ) : (
                <table className="atable">
                  <thead><tr><th>Email</th><th>Sent</th><th>Expires</th><th>Status</th><th /></tr></thead>
                  <tbody>
                    {invitations.map((i) => (
                      <tr key={i.id}>
                        <td className="nm">{i.email}</td>
                        <td className="xs">{i.createdAt.toLocaleDateString("en-NZ")}</td>
                        <td className="xs">{i.expiresAt.toLocaleDateString("en-NZ")}</td>
                        <td>
                          <span className={`pill-s ${i.status === "ACCEPTED" ? "published" : i.status === "PENDING" ? "draft" : "archived"}`}>
                            {i.status}
                          </span>
                        </td>
                        <td>
                          {i.status === "PENDING" && (
                            <form action={revokeInvitation.bind(null, organizationId, i.id)}>
                              <button className="btn btn-g btn-sm" type="submit">Revoke</button>
                            </form>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
