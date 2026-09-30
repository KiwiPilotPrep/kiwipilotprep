import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { db } from "@/lib/db";
import { requireVerifiedEmail } from "@/lib/auth";
import { formatMinor } from "@/lib/money";
import { count } from "@/lib/plural";
import { gatewayName, publishableKey } from "@/lib/payments/gateway";
import CheckoutPanel from "@/components/checkout/CheckoutPanel";

export const metadata = { title: "Checkout — KiwiPilotPrep" };

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const user = await requireVerifiedEmail();
  const { orderId } = await params;

  const order = await db.order.findUnique({
    where: { id: orderId },
    include: {
      product: {
        include: {
          items: {
            include: {
              course: { select: { title: true } },
              subject: { select: { title: true } },
            },
          },
        },
      },
    },
  });

  if (!order) notFound();
  // An order is only ever visible to the person who created it.
  if (order.userId !== user.id) notFound();
  if (order.status === "PAID") redirect(`/checkout/${order.id}/success`);

  return (
    <section className="sec">
      <div className="wrap auth-wrap">
        <div className="sec-head r in">
          <div className="eyebrow">Checkout</div>
          <h1 className="h2">{order.product.title}</h1>
          <p className="lede mt-s">
            Order <span className="num">{order.reference}</span>
          </p>
        </div>

        <div className="panel mt-l">
          <div className="panel-hd">
            <h2>Order summary</h2>
          </div>
          <table className="atable">
            <tbody>
              <tr>
                <td className="nm">Product</td>
                <td>{order.product.title}</td>
              </tr>
              <tr>
                <td className="nm">Includes</td>
                <td>
                  {order.product.items.map((i) => (
                    <div key={i.id}>{i.course?.title ?? i.subject?.title}</div>
                  ))}
                </td>
              </tr>
              <tr>
                <td className="nm">Access</td>
                <td>
                  {order.product.accessMonths
                    ? `${count(order.product.accessMonths, "month")} from purchase`
                    : "Lifetime"}
                </td>
              </tr>
              {order.discountMinor > 0 && (
                <>
                  <tr>
                    <td className="nm">Price</td>
                    <td className="num">
                      {formatMinor(order.listAmountMinor ?? order.amountMinor, order.currency)}
                    </td>
                  </tr>
                  <tr>
                    <td className="nm">
                      Discount
                      {order.couponCode && <div className="xs num">{order.couponCode}</div>}
                    </td>
                    <td className="num">
                      &minus;{formatMinor(order.discountMinor, order.currency)}
                    </td>
                  </tr>
                </>
              )}
              <tr>
                <td className="nm">Total</td>
                <td className="num">
                  <b>{formatMinor(order.amountMinor, order.currency)}</b> {order.currency}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <CheckoutPanel
          orderId={order.id}
          gatewayOrderId={order.gatewayOrderId}
          amountMinor={order.amountMinor}
          currency={order.currency}
          keyId={publishableKey()}
          gateway={gatewayName()}
          productTitle={order.product.title}
          customerName={user.name}
          customerEmail={user.email}
        />

        <p className="xs" style={{ marginTop: "18px", textAlign: "center" }}>
          <Link href="/pricing">← Back to pricing</Link>
        </p>
      </div>
    </section>
  );
}
