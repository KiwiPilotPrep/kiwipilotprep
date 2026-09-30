import Link from "next/link";
import { notFound } from "next/navigation";

import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { formatMinor } from "@/lib/money";

export const metadata = { title: "Payment successful — KiwiPilotPrep" };

export default async function CheckoutSuccessPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const user = await requireUser();
  const { orderId } = await params;

  const order = await db.order.findUnique({
    where: { id: orderId },
    include: {
      product: { select: { title: true, accessMonths: true } },
      payments: { orderBy: { createdAt: "desc" }, take: 1 },
      entitlements: {
        include: {
          course: { select: { title: true, slug: true } },
          subject: { select: { title: true, slug: true, course: { select: { slug: true } } } },
        },
      },
    },
  });

  if (!order || order.userId !== user.id) notFound();

  const paid = order.status === "PAID";
  const first = order.entitlements[0];
  const continueHref = first?.course
    ? `/courses/${first.course.slug}`
    : first?.subject
      ? `/courses/${first.subject.course.slug}/subjects/${first.subject.slug}`
      : "/dashboard";

  return (
    <section className="sec">
      <div className="wrap auth-wrap">
        <div className="sec-head center r in">
          <div className="eyebrow">{paid ? "Payment successful" : "Order pending"}</div>
          <h1 className="h2">
            {paid ? "Your access has been activated." : "We are still confirming your payment."}
          </h1>
          <p className="lede mt-s">
            {paid
              ? "Everything in this package is available now."
              : "This usually settles within a minute. Your access appears automatically once the payment is confirmed."}
          </p>
        </div>

        <div className="panel mt-l">
          <div className="panel-hd"><h2>Order details</h2></div>
          <table className="atable">
            <tbody>
              <tr><td className="nm">Product</td><td>{order.product.title}</td></tr>
              <tr><td className="nm">Reference</td><td className="num">{order.reference}</td></tr>
              <tr><td className="nm">Amount</td><td className="num">{formatMinor(order.amountMinor, order.currency)} {order.currency}</td></tr>
              <tr>
                <td className="nm">Payment status</td>
                <td>
                  <span className={`pill-s ${paid ? "published" : "draft"}`}>{order.status}</span>
                </td>
              </tr>
              <tr>
                <td className="nm">Access</td>
                <td>
                  {order.entitlements.length === 0
                    ? "Pending confirmation"
                    : order.entitlements
                        .map((e) => e.course?.title ?? e.subject?.title)
                        .filter(Boolean)
                        .join(", ")}
                </td>
              </tr>
              <tr>
                <td className="nm">Valid until</td>
                <td>
                  {order.entitlements[0]?.expiresAt
                    ? order.entitlements[0].expiresAt.toLocaleDateString("en-NZ")
                    : order.product.accessMonths
                      ? "—"
                      : "No expiry"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="acts" style={{ marginTop: "20px", justifyContent: "center" }}>
          <Link className="btn btn-p" href={continueHref}>Start Learning</Link>
          <Link className="btn btn-g" href="/dashboard">Go to dashboard</Link>
        </div>
      </div>
    </section>
  );
}
