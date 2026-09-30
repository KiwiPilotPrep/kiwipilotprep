import crypto from "node:crypto";

/**
 * Razorpay HMAC verification.
 *
 * Pure functions with no I/O and no environment access, so they can be tested
 * exhaustively and cannot be accidentally bypassed by a caller passing the
 * wrong thing. Comparisons are constant-time: a fast-failing `===` on a
 * signature leaks its prefix through timing.
 */

function hmac(payload: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

/** Constant-time compare that tolerates unequal lengths. */
function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Signature returned by Razorpay Checkout.
 * Razorpay signs `${order_id}|${payment_id}` with the API key secret.
 */
export function checkoutSignature(
  gatewayOrderId: string,
  gatewayPaymentId: string,
  secret: string,
): string {
  return hmac(`${gatewayOrderId}|${gatewayPaymentId}`, secret);
}

export function verifyCheckoutSignature(args: {
  gatewayOrderId: string;
  gatewayPaymentId: string;
  signature: string;
  secret: string;
}): boolean {
  const { gatewayOrderId, gatewayPaymentId, signature, secret } = args;
  if (!gatewayOrderId || !gatewayPaymentId || !signature || !secret) return false;
  return safeEqual(checkoutSignature(gatewayOrderId, gatewayPaymentId, secret), signature);
}

/**
 * Webhook signature. Razorpay signs the *raw* request body, so the caller must
 * pass the exact bytes received — re-serialising parsed JSON changes the
 * payload and the signature will never match.
 */
export function webhookSignature(rawBody: string, secret: string): string {
  return hmac(rawBody, secret);
}

export function verifyWebhookSignature(args: {
  rawBody: string;
  signature: string;
  secret: string;
}): boolean {
  const { rawBody, signature, secret } = args;
  if (!rawBody || !signature || !secret) return false;
  return safeEqual(webhookSignature(rawBody, secret), signature);
}
