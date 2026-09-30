import { describe, it, expect } from "vitest";
import crypto from "node:crypto";

import {
  checkoutSignature,
  verifyCheckoutSignature,
  webhookSignature,
  verifyWebhookSignature,
} from "@/lib/payments/signature";

/**
 * Signature verification is the only thing standing between "the browser said
 * it paid" and unlocking paid content, so it is tested against the ways an
 * attacker would actually attack it.
 */

const SECRET = "test_secret_key_do_not_use_in_production";
const ORDER = "order_ABC123";
const PAYMENT = "pay_XYZ789";

describe("checkout signature", () => {
  it("accepts a correctly signed response", () => {
    const signature = checkoutSignature(ORDER, PAYMENT, SECRET);
    expect(
      verifyCheckoutSignature({
        gatewayOrderId: ORDER,
        gatewayPaymentId: PAYMENT,
        signature,
        secret: SECRET,
      }),
    ).toBe(true);
  });

  it("signs order and payment as `order|payment`, matching Razorpay", () => {
    const expected = crypto
      .createHmac("sha256", SECRET)
      .update(`${ORDER}|${PAYMENT}`)
      .digest("hex");
    expect(checkoutSignature(ORDER, PAYMENT, SECRET)).toBe(expected);
  });

  it("rejects a signature made with a different secret", () => {
    const signature = checkoutSignature(ORDER, PAYMENT, "someone_elses_secret");
    expect(
      verifyCheckoutSignature({
        gatewayOrderId: ORDER,
        gatewayPaymentId: PAYMENT,
        signature,
        secret: SECRET,
      }),
    ).toBe(false);
  });

  it("rejects a signature bound to a different payment", () => {
    const signature = checkoutSignature(ORDER, "pay_SOMETHING_ELSE", SECRET);
    expect(
      verifyCheckoutSignature({
        gatewayOrderId: ORDER,
        gatewayPaymentId: PAYMENT,
        signature,
        secret: SECRET,
      }),
    ).toBe(false);
  });

  it("rejects a signature bound to a different order", () => {
    const signature = checkoutSignature("order_SOMEONE_ELSE", PAYMENT, SECRET);
    expect(
      verifyCheckoutSignature({
        gatewayOrderId: ORDER,
        gatewayPaymentId: PAYMENT,
        signature,
        secret: SECRET,
      }),
    ).toBe(false);
  });

  it("rejects an empty signature", () => {
    expect(
      verifyCheckoutSignature({
        gatewayOrderId: ORDER,
        gatewayPaymentId: PAYMENT,
        signature: "",
        secret: SECRET,
      }),
    ).toBe(false);
  });

  it("rejects when the secret is missing, rather than signing with undefined", () => {
    expect(
      verifyCheckoutSignature({
        gatewayOrderId: ORDER,
        gatewayPaymentId: PAYMENT,
        signature: checkoutSignature(ORDER, PAYMENT, SECRET),
        secret: "",
      }),
    ).toBe(false);
  });

  it("rejects a truncated signature (length mismatch cannot pass)", () => {
    const signature = checkoutSignature(ORDER, PAYMENT, SECRET).slice(0, 32);
    expect(
      verifyCheckoutSignature({
        gatewayOrderId: ORDER,
        gatewayPaymentId: PAYMENT,
        signature,
        secret: SECRET,
      }),
    ).toBe(false);
  });

  it("rejects a signature with one character changed", () => {
    const good = checkoutSignature(ORDER, PAYMENT, SECRET);
    const tampered = (good[0] === "a" ? "b" : "a") + good.slice(1);
    expect(
      verifyCheckoutSignature({
        gatewayOrderId: ORDER,
        gatewayPaymentId: PAYMENT,
        signature: tampered,
        secret: SECRET,
      }),
    ).toBe(false);
  });

  it("does not confuse the delimiter — order|payment is not payment|order", () => {
    const swapped = checkoutSignature(PAYMENT, ORDER, SECRET);
    expect(
      verifyCheckoutSignature({
        gatewayOrderId: ORDER,
        gatewayPaymentId: PAYMENT,
        signature: swapped,
        secret: SECRET,
      }),
    ).toBe(false);
  });
});

describe("webhook signature", () => {
  const BODY = JSON.stringify({ event: "payment.captured", payload: { payment: { entity: { id: "pay_1" } } } });

  it("accepts a correctly signed body", () => {
    const signature = webhookSignature(BODY, SECRET);
    expect(verifyWebhookSignature({ rawBody: BODY, signature, secret: SECRET })).toBe(true);
  });

  it("rejects a body that changed after signing", () => {
    const signature = webhookSignature(BODY, SECRET);
    const altered = BODY.replace("pay_1", "pay_2");
    expect(verifyWebhookSignature({ rawBody: altered, signature, secret: SECRET })).toBe(false);
  });

  it("is sensitive to whitespace, which is why the raw body must be used", () => {
    // Re-serialising parsed JSON changes the bytes and would break verification.
    const reserialised = JSON.stringify(JSON.parse(BODY), null, 2);
    const signature = webhookSignature(BODY, SECRET);
    expect(verifyWebhookSignature({ rawBody: reserialised, signature, secret: SECRET })).toBe(false);
  });

  it("rejects the wrong secret", () => {
    const signature = webhookSignature(BODY, "wrong_webhook_secret");
    expect(verifyWebhookSignature({ rawBody: BODY, signature, secret: SECRET })).toBe(false);
  });

  it("rejects an empty signature header", () => {
    expect(verifyWebhookSignature({ rawBody: BODY, signature: "", secret: SECRET })).toBe(false);
  });

  it("rejects an empty body", () => {
    expect(
      verifyWebhookSignature({
        rawBody: "",
        signature: webhookSignature("", SECRET),
        secret: SECRET,
      }),
    ).toBe(false);
  });
});
