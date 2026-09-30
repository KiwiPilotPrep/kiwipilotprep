import { db } from "@/lib/db";
import { createCoupon, setCouponActive, deleteCoupon } from "@/app/admin/coupon-actions";
import { Empty } from "@/components/admin/ui";
import { formatMinor } from "@/lib/money";

export const metadata = { title: "Coupons — Admin" };

function formatDate(d: Date | null) {
  if (!d) return "—";
  return d.toLocaleDateString("en-NZ", { day: "numeric", month: "short", year: "numeric" });
}

/** Describes a coupon's state in the words an admin would use. */
function state(c: {
  active: boolean;
  startsAt: Date | null;
  expiresAt: Date | null;
  redemptions: number;
  maxRedemptions: number | null;
}) {
  const now = new Date();
  if (!c.active) return { label: "Off", tone: "draft" };
  if (c.startsAt && c.startsAt > now) return { label: "Scheduled", tone: "draft" };
  if (c.expiresAt && c.expiresAt <= now) return { label: "Expired", tone: "archived" };
  if (c.maxRedemptions !== null && c.redemptions >= c.maxRedemptions) {
    return { label: "Used up", tone: "archived" };
  }
  return { label: "Live", tone: "published" };
}

export default async function AdminCouponsPage() {
  const [coupons, products] = await Promise.all([
    db.coupon.findMany({
      orderBy: { createdAt: "desc" },
      include: { product: { select: { title: true } } },
    }),
    db.product.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { order: "asc" },
      select: { id: true, title: true },
    }),
  ]);

  return (
    <>
      <div className="ahead">
        <div>
          <h1>Discount coupons</h1>
          <p>
            Codes a student can enter at checkout. The discount is always worked out here on the
            server from the product&rsquo;s own price &mdash; a code is only ever a claim, never an
            amount the browser gets to choose.
          </p>
        </div>
      </div>

      <div className="panel">
        <div className="panel-hd">
          <h2>All coupons ({coupons.length})</h2>
        </div>

        {coupons.length === 0 ? (
          <Empty
            title="No coupons yet"
            hint="Generate your first discount code using the form below."
          />
        ) : (
          <table className="atable">
            <thead>
              <tr>
                <th>Code</th>
                <th>Discount</th>
                <th>Applies to</th>
                <th>Window</th>
                <th>Used</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => {
                const s = state(c);
                return (
                  <tr key={c.id}>
                    <td className="nm">
                      <span className="num">{c.code}</span>
                      {c.description && <div className="xs">{c.description}</div>}
                    </td>
                    <td className="num">
                      {c.type === "PERCENT"
                        ? `${c.value}% off`
                        : `${formatMinor(c.value, c.currency ?? "NZD")} off`}
                      {c.minAmountMinor !== null && (
                        <div className="xs">
                          min {formatMinor(c.minAmountMinor, c.currency ?? "NZD")}
                        </div>
                      )}
                    </td>
                    <td>
                      {c.product?.title ?? "Any product"}
                      {c.currency && <div className="xs">{c.currency} only</div>}
                    </td>
                    <td className="xs">
                      {formatDate(c.startsAt)} &rarr; {formatDate(c.expiresAt)}
                    </td>
                    <td className="num">
                      {c.redemptions}
                      {c.maxRedemptions !== null ? ` / ${c.maxRedemptions}` : ""}
                    </td>
                    <td>
                      <span className={`pill-s ${s.tone}`}>{s.label}</span>
                    </td>
                    <td>
                      <div className="acts">
                        <form action={setCouponActive.bind(null, c.id, !c.active)}>
                          <button className="btn btn-g btn-sm" type="submit">
                            {c.active ? "Turn off" : "Turn on"}
                          </button>
                        </form>
                        <form action={deleteCoupon.bind(null, c.id)}>
                          <button className="btn btn-g btn-sm" type="submit">
                            Delete
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <div className="panel">
        <div className="panel-hd">
          <h2>Generate a coupon</h2>
        </div>
        <div className="panel-bd">
          <form className="inline-form" action={createCoupon}>
            <div className="frow">
              <div className="fld">
                <label htmlFor="code">Code</label>
                <input id="code" name="code" placeholder="e.g. WINTER25" required />
                <p className="fhint">Saved in capitals; students may type it either way.</p>
              </div>
              <div className="fld">
                <label htmlFor="description">Internal note</label>
                <input id="description" name="description" placeholder="Winter campaign" />
              </div>
            </div>

            <div className="frow">
              <div className="fld">
                <label htmlFor="type">Discount type</label>
                <select id="type" name="type" defaultValue="PERCENT">
                  <option value="PERCENT">Percentage off</option>
                  <option value="FIXED">Fixed amount off</option>
                </select>
              </div>
              <div className="fld">
                <label htmlFor="value">Value</label>
                <input id="value" name="value" inputMode="decimal" placeholder="25" required />
                <p className="fhint">
                  A whole number for a percentage, or an amount in dollars/rupees for a fixed
                  discount.
                </p>
              </div>
            </div>

            <div className="frow">
              <div className="fld">
                <label htmlFor="productId">Limit to a product</label>
                <select id="productId" name="productId" defaultValue="">
                  <option value="">Any product</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="fld">
                <label htmlFor="currency">Limit to a currency</label>
                <select id="currency" name="currency" defaultValue="">
                  <option value="">Any currency</option>
                  <option value="NZD">NZD</option>
                  <option value="INR">INR</option>
                </select>
                <p className="fhint">Required for a fixed-amount discount.</p>
              </div>
            </div>

            <div className="frow">
              <div className="fld">
                <label htmlFor="minAmount">Minimum order value</label>
                <input id="minAmount" name="minAmount" inputMode="decimal" placeholder="0" />
                <p className="fhint">Leave blank for no minimum.</p>
              </div>
              <div className="fld">
                <label htmlFor="maxRedemptions">Redemption limit</label>
                <input id="maxRedemptions" name="maxRedemptions" type="number" min={1} />
                <p className="fhint">
                  Blank means unlimited. Each student may use a code only once regardless.
                </p>
              </div>
            </div>

            <div className="frow">
              <div className="fld">
                <label htmlFor="startsAt">Starts</label>
                <input id="startsAt" name="startsAt" type="date" />
              </div>
              <div className="fld">
                <label htmlFor="expiresAt">Ends</label>
                <input id="expiresAt" name="expiresAt" type="date" />
              </div>
            </div>

            <button className="btn btn-p" type="submit">
              Generate coupon
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
