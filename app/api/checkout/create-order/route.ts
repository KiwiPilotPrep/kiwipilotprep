import { NextResponse } from "next/server";
import { z } from "zod";

import { verifiedUserOrProblem } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { startCheckout } from "@/lib/checkout";

/**
 * POST /api/checkout/create-order
 *
 * Takes a product id, a currency and optionally a coupon code. Deliberately
 * takes NO price and NO discount amount — both are read from the database,
 * because a figure supplied by the client is just a number the client chose.
 *
 * The order of business here is the security property worth protecting: the
 * caller is authenticated, active and verified *before* anything is looked up
 * and long before the gateway is contacted. A disabled or unverified account
 * cannot cause a Razorpay order to exist, whatever it posts (§8, §18).
 */

const bodySchema = z.object({
  productId: z.string().min(1),
  currency: z.enum(["NZD", "INR"]).default("NZD"),
  couponCode: z.string().trim().max(40).optional(),
});

export async function POST(request: Request) {
  const { user, problem } = await verifiedUserOrProblem();
  if (problem) {
    return NextResponse.json(
      {
        error: problem.error,
        ...(problem.needsLogin ? { needsLogin: true } : {}),
        ...(problem.needsVerification ? { needsVerification: true } : {}),
      },
      { status: problem.status },
    );
  }

  // Creating an order hits the gateway, so it is worth protecting.
  const limit = await rateLimit(`checkout:${user.id}`, { limit: 30, windowMs: 60_000 });
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many checkout attempts. Please wait a moment." },
      { status: 429, headers: { "retry-after": String(limit.retryAfterSeconds) } },
    );
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const { productId, currency, couponCode } = parsed.data;

  const result = await startCheckout({ user, productId, currency, couponCode });

  if (!result.ok) {
    // Wrong codes are the signal that matters: guessing at them is how a
    // discount gets stolen. Failures are counted on their own, much tighter
    // budget than checkouts, so a student who mistypes once is unaffected
    // while a script runs out of attempts quickly.
    if (result.couponRejected) {
      const guessing = await rateLimit(`coupon-fail:${user.id}`, {
        limit: 10,
        windowMs: 10 * 60_000,
      });
      if (!guessing.ok) {
        return NextResponse.json(
          {
            error: "Too many discount codes tried. Please wait a few minutes.",
            couponRejected: true,
          },
          { status: 429, headers: { "retry-after": String(guessing.retryAfterSeconds) } },
        );
      }
    }

    return NextResponse.json(
      {
        error: result.error,
        ...(result.alreadyOwned ? { alreadyOwned: true } : {}),
        ...(result.couponRejected ? { couponRejected: true } : {}),
      },
      { status: result.status },
    );
  }

  return NextResponse.json({
    orderId: result.orderId,
    reference: result.reference,
    gatewayOrderId: result.gatewayOrderId,
    amountMinor: result.amountMinor,
    listAmountMinor: result.listAmountMinor,
    discountMinor: result.discountMinor,
    couponCode: result.couponCode,
    couponId: result.couponId,
    currency: result.currency,
    keyId: result.keyId,
    gateway: result.gateway,
    productTitle: result.productTitle,
  });
}
