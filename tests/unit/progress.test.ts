import { describe, it, expect } from "vitest";

import { pct } from "@/lib/progress";

/**
 * The progress percentage is the number students judge themselves by, so the
 * edges matter: an empty subject must not read as 100%, and a fully finished
 * one must not read as 99%.
 */
describe("pct", () => {
  it("reports 0% when there is nothing to complete", () => {
    expect(pct(0, 0)).toEqual({ total: 0, completed: 0, percent: 0, unit: "chapter" });
  });

  it("never claims completion for an empty subject", () => {
    // 0/0 is mathematically undefined; showing 100% would be a lie.
    expect(pct(0, 0).percent).toBe(0);
  });

  it("reports 100% only when everything is done", () => {
    expect(pct(12, 12).percent).toBe(100);
    expect(pct(11, 12).percent).toBeLessThan(100);
  });

  it("rounds to the nearest whole percent", () => {
    expect(pct(1, 3).percent).toBe(33);
    expect(pct(2, 3).percent).toBe(67);
    expect(pct(7, 12).percent).toBe(58);
  });

  it("matches the PRD's worked example (7 of 12 chapters)", () => {
    const stat = pct(7, 12);
    expect(stat.completed).toBe(7);
    expect(stat.total).toBe(12);
    expect(stat.percent).toBe(58);
  });

  it("carries the raw counts through untouched", () => {
    const stat = pct(3, 8);
    expect(stat.completed).toBe(3);
    expect(stat.total).toBe(8);
  });

  it("stays within 0–100 for a single-item subject", () => {
    expect(pct(0, 1).percent).toBe(0);
    expect(pct(1, 1).percent).toBe(100);
  });
});
