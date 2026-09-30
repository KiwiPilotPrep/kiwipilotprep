import type { Currency } from "@prisma/client";

/**
 * Money is stored in minor units (cents, paise) so nothing is ever added or
 * compared in floating point. These helpers are the only place it becomes a
 * human-readable string.
 */

const LOCALE: Record<Currency, string> = { NZD: "en-NZ", INR: "en-IN" };
const SYMBOL: Record<Currency, string> = { NZD: "$", INR: "₹" };

export function toMajor(amountMinor: number): number {
  return amountMinor / 100;
}

export function formatMinor(amountMinor: number, currency: Currency): string {
  const major = toMajor(amountMinor);
  const formatted = major.toLocaleString(LOCALE[currency] ?? "en-NZ", {
    minimumFractionDigits: major % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
  return `${SYMBOL[currency] ?? "$"}${formatted}`;
}

/** "NZ$699" style, for places that must disambiguate the currency. */
export function formatMinorWithCode(amountMinor: number, currency: Currency): string {
  return `${formatMinor(amountMinor, currency)} ${currency}`;
}
