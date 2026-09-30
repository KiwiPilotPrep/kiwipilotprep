import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { verifyWebhookSignature } from "@/lib/payments/signature";
import { webhookSecret } from "@/lib/payments/gateway";
import { fulfilOrder, failOrder } from "@/lib/payments/fulfil";

/**
 * POST /api/webhooks/razorpay
 *
 * The authoritative settlement path: it keeps working when the student closes
 * the tab before returning from checkout.
 *
 * Two rules drive the implementation:
 *  - Verify before trusting. The signature is computed over the RAW body, so
 *    the body is read as text and never re-serialised (§13).
 *  - Assume redelivery. Razorpay retries, so every branch is idempotent and a
 *    replay is answered 200 with no second entitlement (§31).
 */

type RazorpayEvent = {
  event?: string;
  payload?: {
    payment?: {
      entity?: {
        id?: string;
        order_id?: string;
        method?: string;
        status?: string;
      };
    };
  };
};

export async function POST(request: Request) {
  // Raw bytes — parsing first and re-stringifying would change the signature.
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature") ?? "";

  if (!verifyWebhookSignature({ rawBody, signature, secret: webhookSecret() })) {
    // 401 rather than 400: this is an authenticity failure, and Razorpay will
    // retry, which is the right behaviour if our secret was briefly wrong.
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  let event: RazorpayEvent;
  try {
    event = JSON.parse(rawBody) as RazorpayEvent;
  } catch {
    return NextResponse.json({ error: "Malformed payload." }, { status: 400 });
  }

  const entity = event.payload?.payment?.entity;
  const gatewayPaymentId = entity?.id;
  const gatewayOrderId = entity?.order_id;

  if (!gatewayPaymentId || !gatewayOrderId) {
    // Nothing actionable, but it was authentic — acknowledge so it is not retried.
    return NextResponse.json({ received: true, handled: false });
  }

  const order = await db.order.findUnique({ where: { gatewayOrderId } });
  if (!order) {
    // An order we do not know about. Acknowledge rather than inviting endless
    // retries of something we can never satisfy.
    console.warn(`[webhook] no order for gateway order ${gatewayOrderId}`);
    return NextResponse.json({ received: true, handled: false });
  }

  const name = event.event ?? "";

  try {
    if (name === "payment.captured" || name === "order.paid") {
      const result = await fulfilOrder({
        orderId: order.id,
        gatewayPaymentId,
        gatewayOrderId,
        signatureVerified: true,
        method: entity?.method ?? null,
        raw: JSON.parse(rawBody),
      });
      return NextResponse.json({
        received: true,
        handled: true,
        alreadyFulfilled: result.alreadyFulfilled,
      });
    }

    if (name === "payment.failed") {
      await failOrder({
        orderId: order.id,
        gatewayPaymentId,
        reason: name,
        raw: JSON.parse(rawBody),
      });
      return NextResponse.json({ received: true, handled: true });
    }

    if (name === "payment.authorized") {
      // Authorized is not captured. Record it; grant nothing yet.
      await db.payment.upsert({
        where: { gatewayPaymentId },
        create: {
          orderId: order.id,
          gatewayPaymentId,
          gatewayOrderId,
          status: "AUTHORIZED",
          amountMinor: order.amountMinor,
          currency: order.currency,
          signatureVerified: true,
          raw: JSON.parse(rawBody),
        },
        update: { status: "AUTHORIZED", signatureVerified: true },
      });
      return NextResponse.json({ received: true, handled: true });
    }

    // Authentic but uninteresting event.
    return NextResponse.json({ received: true, handled: false });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[webhook] ${name} failed:`, message);
    // 500 so the gateway retries — the handler is safe to run again.
    return NextResponse.json({ error: "Processing failed." }, { status: 500 });
  }
}
