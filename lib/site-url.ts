import "server-only";

/**
 * The origin to use when building a link that will leave the server — an
 * invitation email, a scorecard link, a receipt.
 *
 * `NEXT_PUBLIC_SITE_URL` is preferred and, in production, is the only thing
 * trusted. The `Host` header is supplied by the client: an attacker can send
 * `Host: evil.example` and, if we built links from it, our own invitation
 * email would carry their domain to the recipient. Falling back to the header
 * is fine in development, where the value is whatever port you happen to be
 * on and no mail is actually sent.
 */
export async function emailBaseUrl(): Promise<string> {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "");
  if (configured) return configured;

  const { headers } = await import("next/headers");
  const h = await headers();
  const host = h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}
