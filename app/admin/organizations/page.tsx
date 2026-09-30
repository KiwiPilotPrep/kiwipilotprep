import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { slugify, disambiguate } from "@/lib/slug";
import { provisionSeats } from "@/lib/org/seats";
import { Empty } from "@/components/admin/ui";

/** Platform oversight of flight schools and their licences (§27). */
export default async function AdminOrganizationsPage() {
  await requireAdmin();

  const [orgs, products, users] = await Promise.all([
    db.organization.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { members: true, students: true, licenses: true } },
        licenses: {
          include: {
            product: { select: { title: true } },
            _count: { select: { seats: true } },
          },
        },
      },
    }),
    db.product.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { order: "asc" },
      select: { id: true, title: true },
    }),
    db.user.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, email: true } }),
  ]);

  async function createOrganization(formData: FormData) {
    "use server";
    await requireAdmin();

    const name = String(formData.get("name") ?? "").trim();
    const ownerId = String(formData.get("ownerId") ?? "").trim();
    if (name.length < 2) throw new Error("Name is required.");
    if (!ownerId) throw new Error("Choose an owner.");

    let slug = slugify(name);
    if (await db.organization.findUnique({ where: { slug }, select: { id: true } })) {
      slug = disambiguate(slug);
    }

    const org = await db.organization.create({
      data: {
        slug,
        name,
        contactEmail: String(formData.get("contactEmail") ?? "").trim() || null,
        contactName: String(formData.get("contactName") ?? "").trim() || null,
        members: { create: { userId: ownerId, role: "OWNER" } },
      },
    });

    revalidatePath("/admin/organizations");
    redirect(`/org/${org.id}`);
  }

  async function addLicense(organizationId: string, formData: FormData) {
    "use server";
    await requireAdmin();

    const productId = String(formData.get("productId") ?? "").trim();
    const seats = Number(formData.get("seatsTotal") ?? 0);
    if (!productId) throw new Error("Choose a product.");
    if (!Number.isInteger(seats) || seats < 1 || seats > 1000) {
      throw new Error("Seats must be between 1 and 1000.");
    }

    const license = await db.enterpriseLicense.create({
      data: { organizationId, productId, seatsTotal: seats },
    });
    // Seat rows are created to match the purchased count (§17).
    await provisionSeats(license.id, seats);

    revalidatePath("/admin/organizations");
    revalidatePath(`/org/${organizationId}/seats`);
  }

  return (
    <>
      <div className="ahead">
        <div>
          <h1>Flight Schools</h1>
          <p>Organisations, their staff and their enterprise licences.</p>
        </div>
      </div>

      <div className="panel">
        <div className="panel-hd">
          <h2>Organisations ({orgs.length})</h2>
        </div>
        {orgs.length === 0 ? (
          <Empty title="No flight schools yet" hint="Create one below." />
        ) : (
          orgs.map((org) => (
            <div className="panel-bd" key={org.id} style={{ borderTop: "1px solid var(--line)" }}>
              <div className="ahead" style={{ marginBottom: "12px" }}>
                <div>
                  <h2 className="h4">{org.name}</h2>
                  <p className="xs">
                    {org._count.members} staff · {org._count.students} students ·{" "}
                    {org._count.licenses} licence(s) · {org.status}
                  </p>
                </div>
                <Link className="btn btn-g btn-sm" href={`/org/${org.id}`}>
                  Open portal
                </Link>
              </div>

              {org.licenses.length > 0 && (
                <table className="atable" style={{ marginBottom: "14px" }}>
                  <thead>
                    <tr>
                      <th>Licence</th>
                      <th>Seats</th>
                      <th>Expires</th>
                    </tr>
                  </thead>
                  <tbody>
                    {org.licenses.map((l) => (
                      <tr key={l.id}>
                        <td className="nm">{l.product.title}</td>
                        <td className="num">
                          {l._count.seats} provisioned of {l.seatsTotal}
                        </td>
                        <td className="xs">
                          {l.expiresAt ? l.expiresAt.toLocaleDateString("en-NZ") : "No expiry"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              <form className="inline-form" action={addLicense.bind(null, org.id)}>
                <div className="frow">
                  <div className="fld">
                    <label>Add a licence</label>
                    <div className="selwrap">
                      <select name="productId" defaultValue="">
                        <option value="" disabled>
                          Choose a product…
                        </option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="fld">
                    <label>Seats</label>
                    <input name="seatsTotal" type="number" min={1} max={1000} defaultValue={25} />
                  </div>
                </div>
                <button className="btn btn-g btn-sm" type="submit">
                  Add licence
                </button>
              </form>
            </div>
          ))
        )}
      </div>

      <div className="panel">
        <div className="panel-hd">
          <h2>Create a flight school</h2>
        </div>
        <div className="panel-bd">
          <form className="inline-form" action={createOrganization}>
            <div className="frow">
              <div className="fld">
                <label htmlFor="name">School name</label>
                <input id="name" name="name" required />
              </div>
              <div className="fld">
                <label htmlFor="ownerId">Owner account</label>
                <div className="selwrap">
                  <select id="ownerId" name="ownerId" defaultValue="">
                    <option value="" disabled>
                      Choose a user…
                    </option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} — {u.email}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="frow">
              <div className="fld">
                <label htmlFor="contactName">Contact name</label>
                <input id="contactName" name="contactName" />
              </div>
              <div className="fld">
                <label htmlFor="contactEmail">Contact email</label>
                <input id="contactEmail" name="contactEmail" type="email" />
              </div>
            </div>
            <button className="btn btn-p" type="submit">
              Create flight school
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
