import { describe, it, expect } from "vitest";

import { codeToSlug, slugToCode, compareCodes } from "@/lib/syllabus-codes";

/**
 * The syllabus code is the identifier the whole feature turns on — it builds
 * the URL, keys the questions and is what a student is given on a knowledge
 * deficiency report. These are the rules that keep it stable.
 */

describe("codeToSlug", () => {
  it("makes a code URL-safe", () => {
    expect(codeToSlug("12.6.24")).toBe("12-6-24");
  });

  it("handles a topic code as well as an item code", () => {
    expect(codeToSlug("12.6")).toBe("12-6");
  });

  it("handles multi-digit segments", () => {
    expect(codeToSlug("12.110.2")).toBe("12-110-2");
  });
});

describe("slugToCode", () => {
  it("reverses codeToSlug", () => {
    expect(slugToCode("12-6-24")).toBe("12.6.24");
  });

  it("round-trips every shape of code", () => {
    for (const code of ["12.2", "12.6.24", "12.110.2", "9.1.1", "100.100.100"]) {
      expect(slugToCode(codeToSlug(code))).toBe(code);
    }
  });

  it("rejects a slug that is not a code, so a route cannot be forged", () => {
    expect(slugToCode("not-a-code")).toBeNull();
    expect(slugToCode("12")).toBeNull();
    expect(slugToCode("")).toBeNull();
    expect(slugToCode("../../etc/passwd")).toBeNull();
    expect(slugToCode("12-6-24-99-1")).toBeNull();
  });

  it("rejects a database id, which must never appear in a study URL", () => {
    expect(slugToCode("cmtof2kei009lc3f4s1241sbb")).toBeNull();
  });

  it("rejects segments that are not digits", () => {
    expect(slugToCode("12-a-24")).toBeNull();
    expect(slugToCode("12--24")).toBeNull();
  });
});

/**
 * The ordering rule that a plain string sort gets wrong, and which would put
 * the syllabus index out of order in a way a student would notice.
 */
describe("compareCodes", () => {
  it("orders 12.6 before 12.10, unlike a string sort", () => {
    expect(compareCodes("12.6", "12.10")).toBeLessThan(0);
    // The bug this guards against:
    expect("12.10" < "12.6").toBe(true);
  });

  it("orders items within a topic numerically", () => {
    expect(compareCodes("12.6.8", "12.6.40")).toBeLessThan(0);
  });

  it("treats an identical code as equal", () => {
    expect(compareCodes("12.6.24", "12.6.24")).toBe(0);
  });

  it("orders a topic before its own items", () => {
    expect(compareCodes("12.6", "12.6.2")).toBeLessThan(0);
  });

  it("sorts a realistic mixed list into syllabus order", () => {
    const sorted = ["12.110.2", "12.6.40", "12.2.2", "12.10.4", "12.6.8", "12.100.2"].sort(
      compareCodes,
    );
    expect(sorted).toEqual([
      "12.2.2",
      "12.6.8",
      "12.6.40",
      "12.10.4",
      "12.100.2",
      "12.110.2",
    ]);
  });

  it("orders across subjects too", () => {
    expect(compareCodes("10.2.2", "12.2.2")).toBeLessThan(0);
  });
});
