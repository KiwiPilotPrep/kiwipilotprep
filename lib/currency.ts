import "server-only";

import { cookies } from "next/headers";

/**
 * Which currency the visitor is shopping in.
 *
 * NZD and INR are two independently configured prices on the same product —
 * never a conversion — so this only decides which stored price is shown and
 * which one checkout is asked for. The product never changes with it.
 *
 * The choice is remembered in a cookie so it survives the walk from the
 * pricing page through login and email confirmation to checkout. A URL
 * parameter still wins when present, because a shared link should show what
 * the sender saw.
 */

export type Currency = "NZD" | "INR";

export const CURRENCY_COOKIE = "kpp_currency";

export function normaliseCurrency(value: string | null | undefined): Currency | null {
  return value === "INR" ? "INR" : value === "NZD" ? "NZD" : null;
}

/** The currency to price this request in. */
export async function preferredCurrency(fromUrl?: string | null): Promise<Currency> {
  const explicit = normaliseCurrency(fromUrl);
  if (explicit) return explicit;
  const stored = normaliseCurrency((await cookies()).get(CURRENCY_COOKIE)?.value);
  return stored ?? "NZD";
}

/** Remembers the choice. Not a secret, so it is readable by the client. */
export async function rememberCurrency(currency: Currency): Promise<void> {
  (await cookies()).set(CURRENCY_COOKIE, currency, {
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 180,
  });
}
