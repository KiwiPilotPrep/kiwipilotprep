import { describe, it, expect } from "vitest";

import { normaliseCode, computeDiscount } from "@/lib/coupons";

/**
 * Codes are typed by hand, often off a poster or an email, so entry has to be
 * forgiving while storage stays exact.
 */
describe("normaliseCode", () => {
  it("upper-cases so a lower-case entry still matches", () => {
    expect(normaliseCode("winter25")).toBe("WINTER25");
  });

  it("trims surrounding whitespace from a pasted code", () => {
    expect(normaliseCode("  WINTER25  ")).toBe("WINTER25");
  });

  it("removes internal spaces, which are always a typo in a code", () => {
    expect(normaliseCode("WINTER 25")).toBe("WINTER25");
  });

  it("collapses a run of whitespace rather than leaving one space", () => {
    expect(normaliseCode("PPL\t \n25")).toBe("PPL25");
  });

  it("leaves an empty string empty rather than inventing a code", () => {
    expect(normaliseCode("   ")).toBe("");
  });
});

/**
 * The money rules. Everything here is in minor units — a percentage that lands
 * on half a cent has to resolve to a whole one, and no configuration may take
 * an order below zero.
 */
describe("computeDiscount", () => {
  it("takes a whole percentage off a round price", () => {
    // 25% of $699.00
    expect(computeDiscount("PERCENT", 25, 69_900)).toBe(17_475);
  });

  it("rounds a fractional percentage to the nearest minor unit", () => {
    // 10% of $19.99 is 199.9 cents
    expect(computeDiscount("PERCENT", 10, 1_999)).toBe(200);
  });

  it("subtracts a fixed amount as given", () => {
    expect(computeDiscount("FIXED", 5_000, 69_900)).toBe(5_000);
  });

  it("caps a fixed amount larger than the price, so nothing goes negative", () => {
    expect(computeDiscount("FIXED", 100_000, 69_900)).toBe(69_900);
  });

  it("treats 100% as the full price and no more", () => {
    expect(computeDiscount("PERCENT", 100, 69_900)).toBe(69_900);
  });

  it("never returns a negative discount from a nonsense value", () => {
    expect(computeDiscount("FIXED", -500, 69_900)).toBe(0);
  });

  it("returns nothing on a zero-priced item rather than a credit", () => {
    expect(computeDiscount("PERCENT", 50, 0)).toBe(0);
  });

  it("gives no discount at 0%", () => {
    expect(computeDiscount("PERCENT", 0, 69_900)).toBe(0);
  });

  it("keeps the result an integer number of minor units", () => {
    const d = computeDiscount("PERCENT", 33, 1_001);
    expect(Number.isInteger(d)).toBe(true);
  });
});
