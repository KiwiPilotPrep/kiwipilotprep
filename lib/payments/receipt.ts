import "server-only";

import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email/send";
import { renderEmail, renderText } from "@/lib/email/templates";
import { emailBaseUrl } from "@/lib/site-url";
import { formatMinor } from "@/lib/money";
import { count } from "@/lib/plural";

/**
 * The payment confirmation email (§14).
 *
 * Two rules govern when this fires:
 *
 *   1. **Only after trusted server-side confirmation.** It is called from
 *      `fulfilOrder`, which runs after the signature has been verified — never
 *      because Razorpay Checkout closed successfully in the browser.
 *
 *   2. **Once per order, ever.** The same payment arrives twice by design: the
 *      browser confirms it and the webhook confirms it again, and Razorpay
 *      retries webhooks. Idempotency is enforced against the EmailLog rather
 *      than with a new table — if a receipt for this order has already been
 *      recorded, nothing is sent.
 *
 * A failure here is logged and swallowed. A student who has paid must not see
 * an error, and must certainly not lose their access, because a mail provider
 * was briefly unavailable.
 */
export async function sendPaymentReceipt(orderId: string): Promise<{ sent: boolean; reason?: string }> {
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: {
      user: { select: { id: true, name: true, email: true } },
      product: { select: { title: true, accessMonths: true } },
      payments: {
        where: { status: "CAPTURED" },
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { gatewayPaymentId: true },
      },
    },
  });

  if (!order) return { sent: false, reason: "order not found" };
  if (order.status !== "PAID") return { sent: false, reason: "order is not paid" };

  // One receipt per order. The template name plus the order reference is the
  // idempotency key, and it survives a restart because it lives in the table.
  //
  // Scoped to the buyer as well, which changes no meaning — a receipt for
  // this order is always logged against this order's user — but decides the
  // query plan. `contains` is a leading-wildcard LIKE that no index can
  // serve, so without the user this scanned the whole of EmailLog on every
  // successful payment, and EmailLog only ever grows. With it, the existing
  // index on (userId, createdAt) narrows the scan to one student's own mail.
  const already = await db.emailLog.findFirst({
    where: {
      userId: order.user.id,
      template: "payment-receipt",
      body: { contains: order.reference },
    },
    select: { id: true },
  });
  if (already) return { sent: false, reason: "receipt already sent" };

  const firstName = order.user.name.trim().split(/\s+/)[0] || "there";
  const dashboard = `${await emailBaseUrl()}/dashboard`;
  const amount = `${formatMinor(order.amountMinor, order.currency)} ${order.currency}`;
  const paymentId = order.payments[0]?.gatewayPaymentId ?? null;

  const access = order.product.accessMonths
    ? `Your access runs for ${count(order.product.accessMonths, "month")} from today.`
    : "Your access does not expire.";

  const content = {
    heading: "Payment confirmed",
    paragraphs: [
      `Kia ora ${firstName},`,
      `Thank you — your payment has been confirmed and your access to ${order.product.title} is active now.`,
      access,
    ],
    action: { label: "Start studying", url: dashboard },
    fallbackNote: "If the button doesn't work, copy this link into your browser:",
    footnotes: [
      `Package: ${order.product.title}`,
      `Amount paid: ${amount}`,
      `Order reference: ${order.reference}`,
      ...(paymentId ? [`Payment reference: ${paymentId}`] : []),
      "Keep this email — quote the order reference if you ever need to contact us about this purchase.",
    ],
  };

  const result = await sendEmail({
    to: order.user.email,
    subject: `Your KiwiPilotPrep purchase — ${order.product.title}`,
    template: "payment-receipt",
    userId: order.user.id,
    // Carries no single-use link, so the body is kept in the log: it is the
    // record of what the student was told they paid.
    body: renderText(content),
    html: renderEmail(content),
  });

  return { sent: result.status === "SENT" };
}
