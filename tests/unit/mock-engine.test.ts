import { describe, it, expect } from "vitest";

import { toOptions, publicOptions, remainingMs, kdrBand } from "@/lib/mock/engine";

/**
 * The engine's pure surface. The parts that matter most here are the ones a
 * student could otherwise exploit: the answer key must never survive into a
 * public payload, and the clock must never report time that has already gone.
 */

const OPTIONS = [
  { id: "o1", text: "First", isCorrect: false, order: 0 },
  { id: "o2", text: "Second", isCorrect: true, order: 1 },
  { id: "o3", text: "Third", isCorrect: false, order: 2 },
];

describe("option snapshots", () => {
  it("reads a well-formed snapshot back", () => {
    expect(toOptions(OPTIONS)).toHaveLength(3);
  });

  it("returns nothing for a non-array, rather than throwing", () => {
    expect(toOptions(null)).toEqual([]);
    expect(toOptions("not options")).toEqual([]);
    expect(toOptions({ id: "o1" })).toEqual([]);
  });

  it("drops malformed entries", () => {
    expect(toOptions([{ id: "o1", text: "ok" }, null, 42, { nope: true }])).toHaveLength(1);
  });

  it("keeps the answer key when marking server-side", () => {
    expect(toOptions(OPTIONS).find((o) => o.isCorrect)?.id).toBe("o2");
  });
});

describe("publicOptions", () => {
  it("strips isCorrect so the answer key never reaches the browser", () => {
    const shipped = publicOptions(OPTIONS);
    expect(shipped).toEqual([
      { id: "o1", text: "First" },
      { id: "o2", text: "Second" },
      { id: "o3", text: "Third" },
    ]);
    for (const o of shipped) {
      expect("isCorrect" in o).toBe(false);
    }
  });

  it("leaks nothing even when serialised", () => {
    expect(JSON.stringify(publicOptions(OPTIONS))).not.toContain("isCorrect");
    expect(JSON.stringify(publicOptions(OPTIONS))).not.toContain("true");
  });

  it("preserves order and ids so answers can still be matched", () => {
    expect(publicOptions(OPTIONS).map((o) => o.id)).toEqual(["o1", "o2", "o3"]);
  });
});

describe("remainingMs", () => {
  it("reports time left for a future deadline", () => {
    const ms = remainingMs({ expiresAt: new Date(Date.now() + 60_000) });
    expect(ms).toBeGreaterThan(58_000);
    expect(ms).toBeLessThanOrEqual(60_000);
  });

  it("clamps to zero once the deadline has passed", () => {
    expect(remainingMs({ expiresAt: new Date(Date.now() - 60_000) })).toBe(0);
  });

  it("never returns a negative, however stale the attempt", () => {
    expect(remainingMs({ expiresAt: new Date(2000, 0, 1) })).toBe(0);
  });

  it("is zero exactly at the deadline", () => {
    expect(remainingMs({ expiresAt: new Date(Date.now()) })).toBe(0);
  });
});

describe("kdrBand", () => {
  it("bands at or above the strong threshold as strong", () => {
    expect(kdrBand(80, 80, 50)).toBe("strong");
    expect(kdrBand(100, 80, 50)).toBe("strong");
  });

  it("bands below the weak threshold as weak", () => {
    expect(kdrBand(49, 80, 50)).toBe("weak");
    expect(kdrBand(0, 80, 50)).toBe("weak");
  });

  it("bands between the thresholds as improving", () => {
    expect(kdrBand(50, 80, 50)).toBe("improving");
    expect(kdrBand(79, 80, 50)).toBe("improving");
  });

  it("respects thresholds configured per mock rather than hardcoding them", () => {
    // A stricter mock: strong needs 90, weak is anything under 70.
    expect(kdrBand(85, 90, 70)).toBe("improving");
    expect(kdrBand(65, 90, 70)).toBe("weak");
    expect(kdrBand(95, 90, 70)).toBe("strong");
  });
});
