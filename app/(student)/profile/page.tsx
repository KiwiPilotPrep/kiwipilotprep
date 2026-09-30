import { requireUser } from "@/lib/auth";
import { listEntitlements } from "@/lib/entitlements";

export const metadata = { title: "Profile — KiwiPilotPrep" };

export default async function ProfilePage() {
  const user = await requireUser();

  const access = await listEntitlements(user.id);

  return (
    <section className="sec">
      <div className="wrap auth-wrap">
        <div className="sec-head r in">
          <div className="eyebrow">Profile</div>
          <h1 className="h2">{user.name}</h1>
        </div>

        <div className="panel mt-l">
          <div className="panel-hd"><h2>Account</h2></div>
          <table className="atable">
            <tbody>
              <tr><td className="nm">Email</td><td>{user.email}</td></tr>
              <tr><td className="nm">Role</td><td>{user.role}</td></tr>
              <tr><td className="nm">Member since</td><td>{user.createdAt.toLocaleDateString("en-NZ")}</td></tr>
            </tbody>
          </table>
        </div>

        <div className="panel">
          <div className="panel-hd"><h2>My access</h2></div>
          {access.length === 0 ? (
            <div className="empty">
              <b>No access yet</b>
              Buy a package from the pricing page, or ask an administrator to grant access.
            </div>
          ) : (
            <table className="atable">
              <thead>
                <tr><th>Access</th><th>Source</th><th>Begins</th><th>Expires</th></tr>
              </thead>
              <tbody>
                {access.map((a) => (
                  <tr key={a.id}>
                    <td className="nm">
                      {a.course?.title ?? a.subject?.title ?? "—"}
                      {a.subject && (
                        <div className="xs">{a.subject.course.title} · single subject</div>
                      )}
                    </td>
                    <td>
                      {a.product?.title ?? a.source}
                      {a.order && <div className="xs num">{a.order.reference}</div>}
                    </td>
                    <td>{a.grantedAt.toLocaleDateString("en-NZ")}</td>
                    <td>{a.expiresAt ? a.expiresAt.toLocaleDateString("en-NZ") : "No expiry"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </section>
  );
}
