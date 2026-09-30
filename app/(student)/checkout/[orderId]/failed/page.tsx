import Link from "next/link";
import { notFound } from "next/navigation";

import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export const metadata = { title: "Payment failed — KiwiPilotPrep" };

export default async function CheckoutFailedPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const user = await requireUser();
  const { orderId } = await params;

  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { product: { select: { title: true, id: true } } },
  });
  if (!order || order.userId !== user.id) notFound();

  return (
    <section className="sec">
      <div className="wrap auth-wrap">
        <div className="sec-head center r in">
          <div className="eyebrow">Payment failed</div>
          <h1 className="h2">Payment could not be completed.</h1>
          <p className="lede mt-s">
            Your course access has not been activated, and you have not been charged for a
            failed payment.
          </p>
        </div>

        <div className="panel mt-l">
          <div className="panel-hd"><h2>What happened</h2></div>
          <table className="atable">
            <tbody>
              <tr><td className="nm">Product</td><td>{order.product.title}</td></tr>
              <tr><td className="nm">Reference</td><td className="num">{order.reference}</td></tr>
              <tr><td className="nm">Order status</td><td><span className="pill-s archived">{order.status}</span></td></tr>
              <tr><td className="nm">Access granted</td><td>None</td></tr>
            </tbody>
          </table>
        </div>

        <div className="acts" style={{ marginTop: "20px", justifyContent: "center" }}>
          <Link className="btn btn-p" href="/pricing">Try Again</Link>
          <Link className="btn btn-g" href="/contact">Contact support</Link>
        </div>
      </div>
    </section>
  );
}
