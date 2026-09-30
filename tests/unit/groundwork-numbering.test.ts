import { describe, it, expect } from "vitest";

// The groundwork builder is plain ESM with no type declarations.
import { stripSectionCode } from "../../scripts/build-groundwork-course.mjs";

/**
 * The supplied study document numbers its own sections, and the reader numbers
 * topics itself, so a line that opens with the client's numbering is showing a
 * student internal addressing. Taking it off is easy; taking off one character
 * too many is a silent content error, because "10 hours cross-country flight
 * time" reads perfectly well as "hours cross-country flight time" and nothing
 * downstream can tell that the number has gone.
 *
 * That is exactly the mistake this guards: a quantity is not a section number,
 * and neither is a rule number.
 */
describe("stripSectionCode", () => {
  it("removes the document's own section numbering", () => {
    expect(stripSectionCode("3.3.1 A standard plain-text Notice to Airmen conveys urgent data.")).toBe(
      "A standard plain-text Notice to Airmen conveys urgent data.",
    );
    expect(stripSectionCode("6.1.4 Moment:")).toBe("Moment:");
    expect(stripSectionCode("4.1.2 TODA (Take-Off Distance Available):")).toBe("TODA (Take-Off Distance Available):");
    expect(stripSectionCode("3.2. AIP Amendments")).toBe("AIP Amendments");
  });

  it("leaves a leading quantity alone", () => {
    for (const line of [
      "10 hours cross-country flight time (combined dual and solo).",
      "50 hours total flight time (or 40 hours if cross-country privileges are excluded).",
      "5 hours instrument flight time (IF).",
      "600 ft minimum ceiling.",
    ]) {
      expect(stripSectionCode(line)).toBe(line);
    }
  });

  it("leaves a rule number alone", () => {
    for (const line of [
      "91.515) Civil Aviation Rule Part 91 prescribes equipment steps.",
      "91.605 allows a 10% extension for maintenance planning.",
      "61.153 sets the eligibility requirements.",
      "43.51 covers maintenance records.",
    ]) {
      expect(stripSectionCode(line)).toBe(line);
    }
  });

  it("trusts a code the document declares, even outside the usual range", () => {
    // The numeric bound is a fallback for a document that does not label its
    // headings. Where the extractor did record a section code, that wins.
    expect(stripSectionCode("13.4 Something", new Set(["13.4"]))).toBe("Something");
    // A three-digit part after the dot is never section numbering in this
    // document — that shape belongs to Civil Aviation Rules — so it is left
    // alone whatever the code set says.
    expect(stripSectionCode("91.605 Extension", new Set(["91.605"]))).toBe("91.605 Extension");
  });
});
