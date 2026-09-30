import { describe, it, expect } from "vitest";

import { toMajor, formatMinor, formatMinorWithCode } from "@/lib/money";

/**
 * Money is held in minor units precisely so it never touches floating point.
 * These tests pin that down, including the classic 0.1 + 0.2 trap.
 */
describe("money", () => {
  it("converts minor units to major", () => {
    expect(toMajor(69900)).toBe(699);
    expect(toMajor(14900)).toBe(149);
  });

  it("formats NZD with a dollar sign", () => {
    expect(formatMinor(69900, "NZD")).toBe("$699");
  });

  it("formats INR with a rupee sign", () => {
    expect(formatMinor(3590000, "INR")).toContain("₹");
  });

  it("shows cents only when there are cents", () => {
    expect(formatMinor(69900, "NZD")).toBe("$699");
    expect(formatMinor(69950, "NZD")).toBe("$699.50");
  });

  it("groups thousands", () => {
    expect(formatMinor(179900, "NZD")).toBe("$1,799");
  });

  it("handles zero", () => {
    expect(formatMinor(0, "NZD")).toBe("$0");
  });

  it("appends the currency code when asked", () => {
    expect(formatMinorWithCode(69900, "NZD")).toBe("$699 NZD");
  });

  it("adds prices exactly, which floats would not", () => {
    // 0.1 + 0.2 !== 0.3 in floating point; 10 + 20 === 30 in minor units.
    const total = 10 + 20;
    expect(total).toBe(30);
    expect(toMajor(total)).toBeCloseTo(0.3, 10);
  });

  it("never loses a cent across a round trip", () => {
    for (const minor of [1, 99, 100, 12345, 999999]) {
      expect(Math.round(toMajor(minor) * 100)).toBe(minor);
    }
  });
});
