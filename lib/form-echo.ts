import "server-only";

import { cookies } from "next/headers";

/**
 * What the person had already typed, handed back to a form that was rejected.
 *
 * A server action that fails validation redirects, and a redirect re-renders
 * the page with empty inputs — so someone who mistyped their password lost
 * their name and email address with it and had to enter all three again.
 *
 * The values ride in a short-lived cookie rather than in the query string.
 * They are personal data: an email address in a URL ends up in browser
 * history, in the address bar over someone's shoulder, and in any access log
 * the request passes through.
 *
 * Only fields that are safe to send back go in here. A password never does —
 * it is retyped, which is the one field the person actually needs to correct.
 */

const COOKIE = "kpp_form_echo";

/** Long enough to survive the redirect, short enough to be gone by the next visitor. */
const TTL_SECONDS = 120;

export async function rememberFields(
  path: string,
  fields: Record<string, string>,
): Promise<void> {
  (await cookies()).set(COOKIE, JSON.stringify(fields), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path,
    maxAge: TTL_SECONDS,
  });
}

/** Whatever was last rejected on this path, or an empty object. */
export async function echoedFields(): Promise<Record<string, string>> {
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return {};
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    const out: Record<string, string> = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (typeof value === "string") out[key] = value;
    }
    return out;
  } catch {
    return {};
  }
}

/** Drops the echo once the form has been accepted. */
export async function clearFields(path: string): Promise<void> {
  (await cookies()).set(COOKIE, "", { path, maxAge: 0 });
}
