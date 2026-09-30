import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { verifyCheckoutSignature } from "@/lib/payments/signature";
import { gatewaySecret } from "@/lib/payments/gateway";
import { fulfilOrder, failOrder } from "@/lib/payments/fulfil";

/**
 * POST /api/checkout/verify
 *
 * The browser hands back what Razorpay Checkout gave it. Nothing here is
 * trusted: the signature is recomputed with the server-side secret, and access
 * is granted only if it matches (§12). A "success" flag from the frontend is
 * not an input to this decision.
 */

const bodySchema = z.object({
  orderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpayOrderId: z.string().min(1),
  razorpaySignature: z.string().min(1),
});

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const { orderId, razorpayPaymentId, razorpayOrderId, razorpaySignature } = parsed.data;

  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });

  // An order belongs to the person who created it.
  if (order.userId !== user.id) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }
  // The returned gateway order must be the one we created for this order.
  if (order.gatewayOrderId && order.gatewayOrderId !== razorpayOrderId) {
    return NextResponse.json({ error: "Payment does not match this order." }, { status: 400 });
  }

  const ok = verifyCheckoutSignature({
    gatewayOrderId: razorpayOrderId,
    gatewayPaymentId: razorpayPaymentId,
    signature: razorpaySignature,
    secret: gatewaySecret(),
  });

  if (!ok) {
    await failOrder({
      orderId: order.id,
      gatewayPaymentId: razorpayPaymentId,
      reason: "signature mismatch",
    });
    return NextResponse.json({ error: "Payment could not be verified." }, { status: 400 });
  }

  const result = await fulfilOrder({
    orderId: order.id,
    gatewayPaymentId: razorpayPaymentId,
    gatewayOrderId: razorpayOrderId,
    signatureVerified: true,
  });

  return NextResponse.json({
    status: "PAID",
    reference: order.reference,
    alreadyFulfilled: result.alreadyFulfilled,
    entitlementsGranted: result.granted,
  });
}
