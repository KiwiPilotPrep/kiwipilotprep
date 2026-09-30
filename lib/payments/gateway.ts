import "server-only";

import crypto from "node:crypto";

import type { Currency } from "@prisma/client";
import { checkoutSignature } from "./signature";

/**
 * Payment gateway boundary.
 *
 * Razorpay is the real adapter. A sandbox adapter stands in for local work, so
 * the whole server-side chain — order creation, signature verification,
 * webhook handling, entitlement granting — can be exercised without card
 * details. The sandbox signs with the same HMAC scheme as Razorpay, so the
 * verification code under test is the production code, not a stub of it.
 *
 * Selecting the sandbox requires ALLOW_SANDBOX_PAYMENTS=true to be set
 * deliberately. NODE_ENV is deliberately NOT the switch: a built app runs with
 * NODE_ENV=production locally too, so keying off it would both block local
 * testing and give a false sense of safety. An explicit variable that nobody
 * sets by accident is the stronger guarantee.
 */

export type GatewayOrder = {
  gatewayOrderId: string;
  amountMinor: number;
  currency: Currency;
  /** Publishable key handed to the browser. Never the secret. */
  keyId: string;
};

export type GatewayName = "razorpay" | "sandbox";

export function gatewayName(): GatewayName {
  const configured = Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
  if (configured) return "razorpay";

  if (process.env.ALLOW_SANDBOX_PAYMENTS === "true") return "sandbox";

  throw new Error(
    "No payment gateway configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET, " +
      "or set ALLOW_SANDBOX_PAYMENTS=true for local development.",
  );
}

/** Secret used to sign and verify. Never leaves the server. */
export function gatewaySecret(): string {
  return process.env.RAZORPAY_KEY_SECRET ?? sandboxSecret();
}

export function webhookSecret(): string {
  return process.env.RAZORPAY_WEBHOOK_SECRET ?? sandboxSecret();
}

export function publishableKey(): string {
  return process.env.RAZORPAY_KEY_ID ?? "sandbox_key";
}

/**
 * In sandbox mode the signing secret is derived from AUTH_SECRET so it is
 * stable across restarts without being a hardcoded literal in the repository.
 */
function sandboxSecret(): string {
  const base = process.env.AUTH_SECRET ?? "kpp-sandbox";
  return crypto.createHash("sha256").update(`${base}:payments`).digest("hex");
}

/**
 * Creates the order at the gateway.
 *
 * `amountMinor` always comes from the database — never from the request — so
 * a tampered client cannot choose its own price (§30).
 */
export async function createGatewayOrder(args: {
  amountMinor: number;
  currency: Currency;
  reference: string;
}): Promise<GatewayOrder> {
  const { amountMinor, currency, reference } = args;

  if (gatewayName() === "razorpay") {
    const keyId = process.env.RAZORPAY_KEY_ID!;
    const keySecret = process.env.RAZORPAY_KEY_SECRET!;

    const res = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
      },
      body: JSON.stringify({
        amount: amountMinor,
        currency,
        receipt: reference,
        payment_capture: 1,
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      throw new Error(`Razorpay order creation failed (${res.status}): ${detail}`);
    }

    const order = (await res.json()) as { id: string };
    return { gatewayOrderId: order.id, amountMinor, currency, keyId };
  }

  // Sandbox: mint an id in Razorpay's shape without calling anything.
  return {
    gatewayOrderId: `order_sbx_${crypto.randomBytes(9).toString("hex")}`,
    amountMinor,
    currency,
    keyId: publishableKey(),
  };
}

/**
 * Sandbox-only helper: produces the payment id and signature the real gateway
 * would have returned, so a local checkout can complete without a card.
 * Throws if a real gateway is configured, so it can never shortcut production.
 */
export function sandboxCompletion(gatewayOrderId: string) {
  if (gatewayName() !== "sandbox") {
    throw new Error("sandboxCompletion is unavailable when a real gateway is configured.");
  }
  const gatewayPaymentId = `pay_sbx_${crypto.randomBytes(9).toString("hex")}`;
  return {
    gatewayPaymentId,
    signature: checkoutSignature(gatewayOrderId, gatewayPaymentId, gatewaySecret()),
  };
}
