"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/**
 * Starts checkout for one product, from wherever the student chose it.
 *
 * Sends only the product id, the currency and — if they typed one — a coupon
 * code. It never sends a price or a discount amount: the server reads the
 * price from the database and prices the coupon itself, so there is nothing
 * here worth tampering with (§30). The preview below is the same evaluation
 * run early for display; checkout runs it again before taking money.
 *
 * It works signed out as well. Rather than sending someone to a login page
 * and losing what they picked, the product, the currency and any code they
 * entered ride along in the `next` URL, so confirming their email or signing
 * in returns them to this exact purchase instead of a list of everything.
 */

type Applied = { code: string; discount: string; total: string };

export default function BuyButton({
  productId,
  currency,
  label,
  signedIn = true,
}: {
  productId: string;
  currency: "NZD" | "INR";
  label: string;
  /** Drives the copy only. The server decides who may buy. */
  signedIn?: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCode, setShowCode] = useState(false);
  const [code, setCode] = useState("");
  const [applied, setApplied] = useState<Applied | null>(null);
  const [couponNote, setCouponNote] = useState<string | null>(null);

  // A coupon is priced in one currency. If the currency changes under it — the
  // home page's toggle switches NZD/INR without reloading — the applied figure
  // is no longer the one that would be charged, so it is dropped and re-entered
  // in the new currency. This is the React-recommended "adjust state while
  // rendering when a prop changes" pattern rather than an effect; on the
  // pricing page the toggle reloads, so it never actually fires there.
  const [pricedIn, setPricedIn] = useState(currency);
  if (pricedIn !== currency) {
    setPricedIn(currency);
    setApplied(null);
    setCouponNote(null);
  }

  /** Where to come back to after a detour, with everything still attached. */
  const resumeUrl = () => {
    const active = applied?.code ?? (code.trim() ? code.trim() : "");
    const params = new URLSearchParams({ product: productId, currency });
    if (active) params.set("coupon", active);
    return `/checkout/start?${params.toString()}`;
  };

  async function applyCode() {
    const value = code.trim();
    if (!value || checking) return;
    setChecking(true);
    setCouponNote(null);
    setApplied(null);
    try {
      const res = await fetch("/api/checkout/preview-coupon", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ productId, currency, code: value }),
      });
      const data = await res.json();
      if (data.ok) {
        setApplied({ code: data.code, discount: data.discount, total: data.total });
      } else if (data.needsLogin) {
        // Nothing is lost: the code travels with the purchase and is applied
        // on the other side of the login.
        setCouponNote("Sign in to apply this code — we will keep it for you.");
      } else {
        setCouponNote(data.reason ?? "That code could not be applied.");
      }
    } catch {
      setCouponNote("Could not check that code. Please try again.");
    } finally {
      setChecking(false);
    }
  }

  async function start() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          productId,
          currency,
          couponCode: applied?.code ?? (code.trim() ? code.trim() : undefined),
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.alreadyOwned) {
          router.push("/dashboard");
          return;
        }
        // Send them where they can actually fix it, rather than showing a
        // message about an inbox with no way to reach it — and carry the
        // product, so confirming lands them back on this purchase.
        if (data.needsVerification) {
          router.push(`/verify/sent?next=${encodeURIComponent(resumeUrl())}`);
          return;
        }
        if (data.needsLogin) {
          router.push(`/login?next=${encodeURIComponent(resumeUrl())}`);
          return;
        }
        // A rejected code opens the field so the student can see and fix it.
        if (data.couponRejected) {
          setShowCode(true);
          setApplied(null);
          setCouponNote(data.error ?? "That code could not be applied.");
        }
        setError(data.error ?? "Could not start checkout.");
        return;
      }

      // To the application's own checkout, where the product, the currency,
      // the discount and the total are set out and the student chooses to pay.
      // This used to jump straight into the gateway, which put a payment
      // window in front of someone who had not yet seen the total.
      router.push(`/checkout/${data.orderId}`);
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button className="btn btn-p btn-w" onClick={start} disabled={busy} type="button">
        {busy ? "Opening payment…" : signedIn ? label : `${label} — sign in`}
      </button>

      {showCode ? (
        <div className="coupon-box">
          <div className="coupon-row">
            <input
              aria-label="Discount code"
              placeholder="Discount code"
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setApplied(null);
                setCouponNote(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  applyCode();
                }
              }}
              disabled={busy || checking}
            />
            <button
              className="btn btn-g btn-sm"
              type="button"
              onClick={applyCode}
              disabled={busy || checking || !code.trim()}
            >
              {checking ? "Checking…" : "Apply"}
            </button>
          </div>

          {applied && (
            <p className="coupon-ok" role="status">
              <b>✓ {applied.code} applied</b>
              <span>Discount {applied.discount}</span>
              <span>New total {applied.total}</span>
            </p>
          )}
          {couponNote && !applied && (
            <p className="coupon-bad" role="alert">
              {couponNote}
            </p>
          )}
        </div>
      ) : (
        <button className="coupon-link" type="button" onClick={() => setShowCode(true)}>
          Have a discount code?
        </button>
      )}

      {error && (
        <p className="fnote on warn" role="alert" style={{ marginTop: "10px" }}>
          {error}
        </p>
      )}
    </>
  );
}
