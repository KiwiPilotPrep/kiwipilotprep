import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatMinor, toMajor } from "@/lib/money";
import { count } from "@/lib/plural";
import { updateProductPrices } from "@/app/admin/product-actions";

export const metadata = { title: "Products — Admin" };

/**
 * The product catalogue, priced.
 *
 * The catalogue itself is fixed: twenty-one products, each wired to the
 * courses and subjects it grants, all referenced by orders and entitlements
 * that must keep resolving. Nothing here can create one, retire one or
 * change what one gives you — those are code changes with a review behind
 * them.
 *
 * What is editable is the price, in both currencies, because that is a
 * commercial decision that should not need a deployment. NZD and INR are
 * two independent prices rather than one price and an exchange rate: the
 * Indian price is a market decision, not arithmetic.
 *
 * Draft and archived products are not listed. They exist — some are
 * referenced by historical orders and must stay — but a price no customer
 * can reach is not something to invite an admin to edit.
 */
export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  await requireRole("ADMIN");
  const { saved } = await searchParams;

  const products = await db.product.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { order: "asc" },
    select: {
      id: true,
      slug: true,
      title: true,
      accessMonths: true,
      prices: { select: { currency: true, amountMinor: true } },
      items: {
        select: {
          course: { select: { title: true } },
          subject: { select: { title: true } },
        },
      },
      _count: { select: { orders: true } },
    },
  });

  const priceOf = (p: (typeof products)[number], currency: "NZD" | "INR") =>
    p.prices.find((x) => x.currency === currency)?.amountMinor ?? null;

  const savedProduct = saved ? products.find((p) => p.id === saved) : undefined;

  return (
    <>
      <div className="ahead">
        <div>
          <h1>Products</h1>
          <p>
            {products.length} product{products.length === 1 ? "" : "s"} on sale. The catalogue is
            fixed — what each product grants is defined in code — but the price in either currency
            can be changed here and takes effect immediately. Orders already placed keep the
            amount they were charged.
          </p>
        </div>
      </div>

      {savedProduct && (
        <div className="cnote info">
          <b>Price saved</b>
          <p>
            {savedProduct.title} is now{" "}
            {priceOf(savedProduct, "NZD") !== null
              ? formatMinor(priceOf(savedProduct, "NZD")!, "NZD")
              : "unpriced"}{" "}
            /{" "}
            {priceOf(savedProduct, "INR") !== null
              ? formatMinor(priceOf(savedProduct, "INR")!, "INR")
              : "unpriced"}
            . The pricing page and new checkouts use it from now on.
          </p>
        </div>
      )}

      <div className="panel mt-m">
        <div className="panel-hd">
          <h2>Current prices</h2>
        </div>
        <table className="atable">
          <thead>
            <tr>
              <th>Product</th>
              <th>Grants</th>
              <th>NZD</th>
              <th>INR</th>
              <th>Orders</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const nzd = priceOf(p, "NZD");
              const inr = priceOf(p, "INR");
              return (
                <tr key={p.id}>
                  <td>
                    <span className="nm">{p.title}</span>
                    <div className="xs">
                      /{p.slug} ·{" "}
                      {p.accessMonths ? `${count(p.accessMonths, "month")} access` : "lifetime access"}
                    </div>
                  </td>
                  <td className="xs">
                    {p.items.length === 0
                      ? "—"
                      : p.items.length === 1
                        ? (p.items[0].course?.title ?? p.items[0].subject?.title)
                        : `${p.items.length} courses/subjects`}
                  </td>
                  {/* The form lives in its own cell and the inputs join it
                      by id, so NZD, INR and Save each get a real column
                      instead of being crushed into one. One submit still
                      writes both currencies, so the pair cannot be left
                      half-updated. */}
                  <td>
                    <label className="xs" style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                      <span aria-hidden="true">$</span>
                      <input
                        form={`price-${p.id}`}
                        name="priceNZD"
                        inputMode="decimal"
                        required
                        // The same rule `parsePrice` enforces on the server.
                        // Without it an admin who types "abc" is shown the
                        // generic "something went wrong" boundary, which
                        // blames the system for their typo; the server stays
                        // the authority either way.
                        pattern="\d{1,7}(\.\d{1,2})?"
                        title="A price in dollars, with at most two decimal places — for example 699 or 699.50"
                        defaultValue={nzd === null ? "" : String(toMajor(nzd))}
                        style={{ width: "92px" }}
                        aria-label={`NZD price for ${p.title}`}
                      />
                    </label>
                    {nzd !== null && <div className="xs num">{formatMinor(nzd, "NZD")}</div>}
                  </td>
                  <td>
                    <label className="xs" style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                      <span aria-hidden="true">₹</span>
                      <input
                        form={`price-${p.id}`}
                        name="priceINR"
                        inputMode="decimal"
                        required
                        // The same rule `parsePrice` enforces on the server.
                        // Without it an admin who types "abc" is shown the
                        // generic "something went wrong" boundary, which
                        // blames the system for their typo; the server stays
                        // the authority either way.
                        pattern="\d{1,7}(\.\d{1,2})?"
                        title="A price in dollars, with at most two decimal places — for example 699 or 699.50"
                        defaultValue={inr === null ? "" : String(toMajor(inr))}
                        style={{ width: "104px" }}
                        aria-label={`INR price for ${p.title}`}
                      />
                    </label>
                    {inr !== null && <div className="xs num">{formatMinor(inr, "INR")}</div>}
                  </td>
                  <td className="num">{p._count.orders}</td>
                  <td>
                    <form id={`price-${p.id}`} action={updateProductPrices.bind(null, p.id)}>
                      <button className="btn btn-g btn-sm" type="submit">
                        Save
                      </button>
                    </form>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="panel mt-m">
        <div className="panel-bd">
          <p className="xs">
            Prices are entered in dollars and rupees and stored in cents and paise, so no rounding
            happens twice. A change applies to the pricing page and to every checkout started
            afterwards. It does not touch an order that already exists: each order records the
            currency and amount it was charged at the moment it was placed.
          </p>
        </div>
      </div>
    </>
  );
}
