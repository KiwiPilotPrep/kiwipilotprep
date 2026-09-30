"use client";

import Link from "next/link";
import { useEffect } from "react";

/**
 * The recoverable error boundary.
 *
 * What it deliberately does not show: the error message, the stack, or any
 * database text. In production Next replaces both with a digest before they
 * reach the browser, and this page shows only that digest — enough for a
 * student to quote when they contact us, and nothing that describes our
 * internals to someone probing the site.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Server-side logging already captured this; this is the browser-side
    // record, which is what a support conversation usually starts from.
    console.error("[error-boundary]", error.digest ?? "no digest");
  }, [error]);

  return (
    <section className="sec">
      <div className="wrap auth-wrap">
        <div className="sec-head center r in">
          <div className="eyebrow">Something went wrong</div>
          <h1 className="h2">That didn&rsquo;t load properly.</h1>
          <p className="lede mt-s">
            The problem is on our side, not yours. Nothing you had in progress has been lost —
            your answers and progress are saved as you go.
          </p>
        </div>

        <div className="acts" style={{ justifyContent: "center", marginTop: "26px" }}>
          <button className="btn btn-p" type="button" onClick={reset}>
            Try again
          </button>
          <Link className="btn btn-g" href="/dashboard">
            Back to my dashboard
          </Link>
        </div>

        {error.digest && (
          <p className="xs num" style={{ textAlign: "center", marginTop: "22px" }}>
            Reference: {error.digest}
          </p>
        )}
        <p className="xs" style={{ textAlign: "center", marginTop: "10px" }}>
          If it keeps happening, <Link href="/contact">tell us</Link> and quote that reference.
        </p>
      </div>
    </section>
  );
}
