import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { z } from "zod";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { gatewayName, sandboxCompletion } from "@/lib/payments/gateway";

/**
 * POST /api/checkout/sandbox — development only.
 *
 * Produces the payment id and signature the real gateway would have returned,
 * so the full server-side chain can be exercised without card details. It
 * refuses to run when a real gateway is configured, and `sandboxCompletion`
 * itself throws outside sandbox mode, so there are two independent guards
 * between this and production.
 */

const bodySchema = z.object({
  orderId: z.string().min(1),
  outcome: z.enum(["success", "failure"]).default("success"),
});

export async function POST(request: Request) {
  if (gatewayName() !== "sandbox") {
    return NextResponse.json(
      { error: "Sandbox payments are disabled when a real gateway is configured." },
      { status: 403 },
    );
  }

  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  const order = await db.order.findUnique({ where: { id: parsed.data.orderId } });
  if (!order || order.userId !== user.id) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }
  if (!order.gatewayOrderId) {
    return NextResponse.json({ error: "Order has no gateway reference." }, { status: 409 });
  }

  if (parsed.data.outcome === "failure") {
    // A deliberately wrong signature, so the verify route rejects it exactly
    // as it would a genuine tampered response.
    return NextResponse.json({
      razorpayPaymentId: `pay_sbx_${crypto.randomBytes(9).toString("hex")}`,
      razorpayOrderId: order.gatewayOrderId,
      razorpaySignature: crypto.randomBytes(32).toString("hex"),
    });
  }

  const completion = sandboxCompletion(order.gatewayOrderId);
  return NextResponse.json({
    razorpayPaymentId: completion.gatewayPaymentId,
    razorpayOrderId: order.gatewayOrderId,
    razorpaySignature: completion.signature,
  });
}
