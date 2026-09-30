"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Props = {
  orderId: string;
  gatewayOrderId: string | null;
  amountMinor: number;
  currency: "NZD" | "INR";
  keyId: string;
  gateway: "razorpay" | "sandbox";
  productTitle: string;
  customerName: string;
  customerEmail: string;
};

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

/**
 * Opens the gateway and hands the result back for server-side verification.
 *
 * Nothing here grants access. Whatever the gateway says, the browser only
 * relays it to /api/checkout/verify, which recomputes the signature before
 * anything is unlocked (§10).
 */
export default function CheckoutPanel(props: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scriptReady, setScriptReady] = useState(false);

  useEffect(() => {
    if (props.gateway !== "razorpay") return;

    // Already loaded by an earlier mount — resolve on a microtask rather than
    // synchronously in the effect body, which would cascade a render.
    if (window.Razorpay) {
      queueMicrotask(() => setScriptReady(true));
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => setScriptReady(true);
    script.onerror = () => setError("Could not load the payment gateway.");
    document.body.appendChild(script);
  }, [props.gateway]);

  async function verify(payload: {
    razorpayPaymentId: string;
    razorpayOrderId: string;
    razorpaySignature: string;
  }) {
    const res = await fetch("/api/checkout/verify", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ orderId: props.orderId, ...payload }),
    });
    if (!res.ok) {
      router.push(`/checkout/${props.orderId}/failed`);
      return;
    }
    router.push(`/checkout/${props.orderId}/success`);
  }

  async function payWithRazorpay() {
    if (!props.gatewayOrderId || !window.Razorpay) return;
    setBusy(true);
    setError(null);

    const rzp = new window.Razorpay({
      key: props.keyId,
      order_id: props.gatewayOrderId,
      amount: props.amountMinor,
      currency: props.currency,
      name: "KiwiPilotPrep",
      description: props.productTitle,
      prefill: { name: props.customerName, email: props.customerEmail },
      theme: { color: "#0F4C81" },
      handler: (response: Record<string, string>) =>
        verify({
          razorpayPaymentId: response.razorpay_payment_id,
          razorpayOrderId: response.razorpay_order_id,
          razorpaySignature: response.razorpay_signature,
        }),
      modal: {
        // Cancelling must leave the order PENDING and grant nothing (§23).
        ondismiss: () => setBusy(false),
      },
    });
    rzp.open();
  }

  /** Sandbox: asks the server to produce a correctly signed test payment. */
  async function paySandbox(outcome: "success" | "failure") {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout/sandbox", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ orderId: props.orderId, outcome }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Sandbox payment failed.");
        return;
      }
      await verify({
        razorpayPaymentId: data.razorpayPaymentId,
        razorpayOrderId: data.razorpayOrderId,
        razorpaySignature: data.razorpaySignature,
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="panel">
      <div className="panel-hd">
        <h2>Payment</h2>
      </div>
      <div className="panel-bd">
        {props.gateway === "razorpay" ? (
          <>
            <button
              className="btn btn-p btn-w"
              onClick={payWithRazorpay}
              disabled={busy || !scriptReady || !props.gatewayOrderId}
              type="button"
            >
              {busy ? "Opening…" : scriptReady ? "Pay securely" : "Loading gateway…"}
            </button>
            <p className="fhint" style={{ marginTop: "12px" }}>
              Payments are processed by Razorpay. Your card details never reach our servers.
            </p>
          </>
        ) : (
          <>
            <div className="cnote warning" style={{ marginBottom: "16px" }}>
              <b>Sandbox mode</b>
              <p>
                No payment gateway keys are configured, so this environment simulates the
                gateway. The signature is still generated and verified server-side, exactly as
                in production — but no money moves. Set RAZORPAY_KEY_ID and
                RAZORPAY_KEY_SECRET to use the real gateway.
              </p>
            </div>
            <div className="acts">
              <button
                className="btn btn-p"
                onClick={() => paySandbox("success")}
                disabled={busy}
                type="button"
              >
                {busy ? "Processing…" : "Simulate successful payment"}
              </button>
              <button
                className="btn btn-g"
                onClick={() => paySandbox("failure")}
                disabled={busy}
                type="button"
              >
                Simulate failed payment
              </button>
            </div>
          </>
        )}

        {error && (
          <p className="fnote on warn" role="alert" style={{ marginTop: "12px" }}>
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
