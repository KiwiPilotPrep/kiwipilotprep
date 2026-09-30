import Link from "next/link";
import { notFound } from "next/navigation";

import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { requireMembership, roleCan, seatSummary, OrgError } from "@/lib/org/access";
import { assignStudentSeat, revokeStudentSeat } from "@/app/(org)/org/actions";

export const metadata = { title: "Licences & Seats — KiwiPilotPrep" };

export default async function OrgSeatsPage({
  params, searchParams,
}: {
  params: Promise<{ organizationId: string }>;
  searchParams: Promise<{ error?: string; assigned?: string; revoked?: string }>;
}) {
  const user = await requireUser();
  const { organizationId } = await params;
  const { error, assigned, revoked } = await searchParams;

  let membership;
  try {
    membership = await requireMembership(user, organizationId, "reports");
  } catch (e) {
    if (e instanceof OrgError) notFound();
    throw e;
  }
  const canManage = roleCan(membership.role, "seats");

  const licenses = await db.enterpriseLicense.findMany({
    where: { organizationId },
    include: {
      product: { select: { title: true } },
      order: { select: { reference: true } },
      seats: {
        orderBy: { id: "asc" },
        include: {
          organizationStudent: { include: { user: { select: { id: true, name: true, email: true } } } },
        },
      },
    },
  });

  const unseated = await db.organizationStudent.findMany({
    where: { organizationId, status: "ACTIVE" },
    include: { user: { select: { id: true, name: true, email: true } }, seats: { where: { status: "ASSIGNED" } } },
  });

  return (
    <section className="sec">
      <div className="wrap">
        <div className="sec-head r in">
          <div className="eyebrow">
            <Link href={`/org/${organizationId}`}>{membership.organizationName}</Link>
          </div>
          <h1 className="h2">Licences &amp; seats</h1>
        </div>

        {error && <p className="fnote on warn" role="alert">{error}</p>}
        {assigned && <p className="fnote on" role="status">Seat assigned.</p>}
        {revoked && <p className="fnote on" role="status">Seat released.</p>}

        {licenses.length === 0 ? (
          <div className="empty panel mt-l">
            <b>No licences yet</b>
            A platform administrator sets up enterprise licences for your school.
          </div>
        ) : (
          licenses.map(async (l) => {
            const summary = await seatSummary(l.id);
            return (
              <div className="panel" key={l.id}>
                <div className="panel-hd">
                  <h2>{l.product.title}</h2>
                  <span className="xs num">
                    {summary.assigned} assigned · {summary.available} available · {summary.total} total
                    {l.order && ` · ${l.order.reference}`}
                  </span>
                </div>

                <table className="atable">
                  <thead><tr><th>Seat</th><th>Student</th><th>Status</th><th /></tr></thead>
                  <tbody>
                    {l.seats.map((seat, i) => (
                      <tr key={seat.id}>
                        <td className="nm num">#{i + 1}</td>
                        <td>
                          {seat.organizationStudent
                            ? <>{seat.organizationStudent.user.name}<div className="xs">{seat.organizationStudent.user.email}</div></>
                            : <span className="xs">Unassigned</span>}
                        </td>
                        <td>
                          <span className={`pill-s ${seat.status === "ASSIGNED" ? "published" : "draft"}`}>
                            {seat.status}
                          </span>
                        </td>
                        <td>
                          {canManage && seat.status === "ASSIGNED" && (
                            <form action={revokeStudentSeat.bind(null, organizationId, seat.id)}>
                              <button className="btn btn-g btn-sm" type="submit">Release</button>
                            </form>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {canManage && summary.available > 0 && (
                  <div className="panel-bd">
                    <h3 className="h4" style={{ marginBottom: "10px" }}>Assign a seat</h3>
                    <div className="acts">
                      {unseated.filter((s) => s.seats.length === 0).length === 0 ? (
                        <p className="xs">Every active student already holds a seat.</p>
                      ) : (
                        unseated
                          .filter((s) => s.seats.length === 0)
                          .map((s) => (
                            <form key={s.id} action={assignStudentSeat.bind(null, organizationId, l.id, s.userId)}>
                              <button className="btn btn-g btn-sm" type="submit">+ {s.user.name}</button>
                            </form>
                          ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
