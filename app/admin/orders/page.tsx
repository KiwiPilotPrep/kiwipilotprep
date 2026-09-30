import { db } from "@/lib/db";
import { Empty } from "@/components/admin/ui";
import { formatMinor } from "@/lib/money";

/**
 * Order and payment ledger (§26). Read-only by design: payment records are
 * evidence, and silently editable evidence is not evidence.
 */
export default async function AdminOrdersPage() {
  const orders = await db.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      user: { select: { name: true, email: true } },
      product: { select: { title: true } },
      payments: { orderBy: { createdAt: "desc" } },
      _count: { select: { entitlements: true } },
    },
  });

  const totals = await db.order.groupBy({
    by: ["status"],
    _count: { _all: true },
  });

  /**
   * Revenue: what was actually taken, by currency.
   *
   * PAID orders only, summed on the amount each order recorded when it was
   * placed. Pending and failed orders are money that has not arrived, and a
   * revenue figure that counts them is a figure nobody can reconcile.
   *
   * Summed per currency rather than converted to one. NZD and INR are set
   * independently as prices, so adding them together would need an exchange
   * rate this product does not have and should not invent.
   *
   * Refunds are deliberately not netted off here. That is a separate
   * reconciliation with its own rules, and folding a partial view of it into
   * a headline number would make the number harder to trust, not easier.
   */
  const revenue = await db.order.groupBy({
    by: ["currency"],
    where: { status: "PAID" },
    _sum: { amountMinor: true },
    _count: { _all: true },
  });

  return (
    <>
      <div className="ahead">
        <div>
          <h1>Orders &amp; Payments</h1>
          <p>
            Every checkout, with its gateway references. Records are read-only so the payment
            trail stays auditable. Revenue is the sum of paid orders at the amount each was
            charged, counted separately per currency.
          </p>
        </div>
      </div>

      <div className="tiles">
        {totals.map((t) => (
          <div className="tile" key={t.status}>
            <div className="v">{t._count._all}</div>
            <div className="l">{t.status}</div>
          </div>
        ))}
        {totals.length === 0 && (
          <div className="tile">
            <div className="v">0</div>
            <div className="l">Orders</div>
          </div>
        )}
        {revenue.length === 0 ? (
          <div className="tile">
            <div className="v">{formatMinor(0, "NZD")}</div>
            <div className="l">Revenue</div>
          </div>
        ) : (
          revenue.map((r) => (
            <div className="tile" key={r.currency}>
              <div className="v" style={{ fontSize: "22px" }}>
                {formatMinor(r._sum.amountMinor ?? 0, r.currency)}
              </div>
              <div className="l">Revenue ({r.currency})</div>
            </div>
          ))
        )}
      </div>

      <div className="panel">
        <div className="panel-hd">
          <h2>Recent orders ({orders.length})</h2>
        </div>

        {orders.length === 0 ? (
          <Empty
            title="No orders yet"
            hint="Orders appear here as soon as a student starts checkout."
          />
        ) : (
          <table className="atable">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Student</th>
                <th>Product</th>
                <th>Amount</th>
                <th>Order</th>
                <th>Payment</th>
                <th>Gateway ref</th>
                <th>Access</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const payment = o.payments[0];
                return (
                  <tr key={o.id}>
                    <td className="nm num">{o.reference}</td>
                    <td>
                      {o.user.name}
                      <div className="xs">{o.user.email}</div>
                    </td>
                    <td>{o.product.title}</td>
                    <td className="num">{formatMinor(o.amountMinor, o.currency)}</td>
                    <td>
                      <span className={`pill-s ${o.status === "PAID" ? "published" : o.status === "PENDING" ? "draft" : "archived"}`}>
                        {o.status}
                      </span>
                    </td>
                    <td>
                      {payment ? (
                        <>
                          {payment.status}
                          <div className="xs">
                            {payment.signatureVerified ? "signature verified" : "unverified"}
                          </div>
                        </>
                      ) : (
                        <span className="xs">—</span>
                      )}
                    </td>
                    <td className="xs num">
                      {o.gatewayOrderId ?? "—"}
                      {payment?.gatewayPaymentId && <div>{payment.gatewayPaymentId}</div>}
                    </td>
                    <td>{o._count.entitlements}</td>
                    <td className="xs">{o.createdAt.toLocaleString("en-NZ")}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
