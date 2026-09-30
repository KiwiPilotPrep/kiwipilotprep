import "server-only";

/**
 * How an uploaded file is handed back to a browser.
 *
 * An upload is somebody else's bytes, so the rules are the same wherever it
 * is served from and live here rather than being written out twice.
 *
 * Only three types may be shown in the page at all — a PDF and the two
 * image formats the form accepts. Anything else is a download regardless of
 * what the caller asked for, because "open" on an unknown type means
 * letting the browser guess, and a browser that guesses "HTML" is running a
 * stranger's markup on our origin.
 *
 * Even the three that may be shown are told not to be sniffed and are
 * served under a policy that permits no script, no subresource and no
 * network — so a file that lies about its type is inert.
 */

const INLINE_SAFE = new Set(["application/pdf", "image/jpeg", "image/png"]);

export function canDisplayInline(mimeType: string): boolean {
  return INLINE_SAFE.has(mimeType);
}

/** Strips anything that could break out of the Content-Disposition header. */
function safeFilename(filename: string): string {
  const cleaned = filename.replace(/[\r\n"\\]/g, "").slice(0, 200);
  return cleaned || "attachment";
}

export function fileResponse(
  bytes: Buffer,
  file: { filename: string; mimeType: string },
  { inline = false }: { inline?: boolean } = {},
): Response {
  const display = inline && canDisplayInline(file.mimeType);

  return new Response(new Uint8Array(bytes), {
    headers: {
      "content-type": display ? file.mimeType : "application/octet-stream",
      "content-length": String(bytes.byteLength),
      "content-disposition": `${display ? "inline" : "attachment"}; filename="${safeFilename(
        file.filename,
      )}"`,
      // Nothing in an uploaded file may run, fetch or load anything.
      // `object-src 'self'` is the exception that lets the browser's PDF
      // viewer open a PDF. The matching rule in next.config.ts is what
      // actually reaches the client — this is here so the route is correct
      // on its own terms too.
      "content-security-policy":
        "default-src 'none'; img-src 'self' data:; object-src 'self'; frame-ancestors 'self'",
      "cache-control": "private, no-store",
      "referrer-policy": "no-referrer",
      "x-content-type-options": "nosniff",
      "x-frame-options": "SAMEORIGIN",
    },
  });
}
