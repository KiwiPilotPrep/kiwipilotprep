import Link from "next/link";

import { requireUser } from "@/lib/auth";
import { membershipsFor } from "@/lib/org/access";
import { db } from "@/lib/db";

export const metadata = { title: "Flight Schools — KiwiPilotPrep" };

export default async function OrgIndexPage() {
  const user = await requireUser();
  const memberships = await membershipsFor(user);

  // A platform admin sees every school for oversight (§27).
  const all = user.role === "ADMIN"
    ? await db.organization.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, status: true } })
    : [];

  return (
    <section className="sec">
      <div className="wrap">
        <div className="sec-head r in">
          <div className="eyebrow">Flight Schools</div>
          <h1 className="h2">Your organisations</h1>
        </div>

        {memberships.length === 0 && all.length === 0 ? (
          <div className="empty panel mt-l">
            <b>You are not a member of any flight school</b>
            If your school uses KiwiPilotPrep, ask them to invite you.
          </div>
        ) : (
          <div className="g3 mt-l">
            {memberships.map((m) => (
              <Link className="subj r in" key={m.organizationId} href={`/org/${m.organizationId}`}>
                <h3>{m.organizationName}</h3>
                <ul><li>Your role: {m.role}</li></ul>
                <span className="go">Open dashboard →</span>
              </Link>
            ))}
            {all
              .filter((o) => !memberships.some((m) => m.organizationId === o.id))
              .map((o) => (
                <Link className="subj r in" key={o.id} href={`/org/${o.id}`}>
                  <h3>{o.name}</h3>
                  <ul><li>Platform admin oversight</li><li>{o.status}</li></ul>
                  <span className="go">Open dashboard →</span>
                </Link>
              ))}
          </div>
        )}
      </div>
    </section>
  );
}
