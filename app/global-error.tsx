"use client";

/**
 * The last resort: an error thrown in the root layout itself, before any of
 * the app's chrome or CSS is mounted. It has to render its own <html> and
 * <body>, and it cannot rely on the stylesheet loading, so the few styles it
 * needs are inline.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en-NZ">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: "24px",
          background: "#080f1b",
          color: "#f4f9ff",
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        }}
      >
        <main style={{ maxWidth: "460px", textAlign: "center" }}>
          <h1 style={{ fontSize: "22px", fontWeight: 600, margin: "0 0 12px" }}>
            KiwiPilotPrep is temporarily unavailable
          </h1>
          <p style={{ margin: "0 0 22px", lineHeight: 1.7, color: "#a2b8cf", fontSize: "15px" }}>
            Something failed while loading the site. Your account and your progress are unaffected.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              padding: "11px 22px",
              borderRadius: "10px",
              border: 0,
              background: "#38bdf8",
              color: "#03151f",
              font: "inherit",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Reload
          </button>
          {error.digest && (
            <p style={{ marginTop: "20px", fontSize: "12.5px", color: "#7387a0" }}>
              Reference: {error.digest}
            </p>
          )}
        </main>
      </body>
    </html>
  );
}
