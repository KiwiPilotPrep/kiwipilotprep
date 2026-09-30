import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { evaluateCoupon } from "@/lib/coupons";
import { formatMinor } from "@/lib/money";
import { rateLimit } from "@/lib/rate-limit";

/**
 * POST /api/checkout/preview-coupon
 *
 * Prices a discount code against one product so the pricing page can show
 * what it is worth before the student commits to buying.
 *
 * It is a preview and nothing more: no order is created, no redemption is
 * counted, and the figure it returns is not carried into payment. Checkout
 * re-runs the same evaluation against the same database price when the order
 * is created, so a tampered response buys nothing.
 *
 * The list price comes from ProductPrice here, exactly as it does in
 * `startCheckout`. Nothing about the amount is taken from the request.
 */
export async function POST(request: Request) {
  const user = await getCurrentUser();
  // Per-user redemption limits mean a code cannot be judged without knowing
  // who is asking. A signed-out visitor keeps their code and has it applied
  // once they are through login.
  if (!user) {
    return NextResponse.json({ ok: false, needsLogin: true, reason: "Sign in to apply a code." });
  }

  let body: { productId?: string; currency?: string; code?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, reason: "Malformed request." }, { status: 400 });
  }

  const productId = String(body.productId ?? "").trim();
  const code = String(body.code ?? "").trim();
  const currency = body.currency === "INR" ? "INR" : "NZD";
  if (!productId || !code) {
    return NextResponse.json({ ok: false, reason: "Enter a code to apply." }, { status: 400 });
  }

  // Guessing at codes costs something, as it does on the real checkout path.
  const guessing = await rateLimit(`coupon-preview:${user.id}`, {
    limit: 20,
    windowMs: 10 * 60_000,
  });
  if (!guessing.ok) {
    return NextResponse.json(
      { ok: false, reason: "Too many attempts. Please wait a few minutes." },
      { status: 429 },
    );
  }

  const product = await db.product.findUnique({
    where: { id: productId },
    select: { id: true, status: true, prices: true },
  });
  if (!product || product.status !== "PUBLISHED") {
    return NextResponse.json({ ok: false, reason: "That product is not available." });
  }

  const price = product.prices.find((p) => p.currency === currency);
  if (!price) {
    return NextResponse.json({ ok: false, reason: `Not available in ${currency}.` });
  }

  const check = await evaluateCoupon({
    code,
    productId: product.id,
    currency,
    listMinor: price.amountMinor,
    userId: user.id,
  });

  if (!check.ok) return NextResponse.json({ ok: false, reason: check.reason });

  const total = Math.max(0, price.amountMinor - check.discountMinor);
  return NextResponse.json({
    ok: true,
    code: check.code,
    discount: formatMinor(check.discountMinor, currency),
    total: formatMinor(total, currency),
    currency,
  });
}
