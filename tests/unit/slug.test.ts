import { describe, it, expect } from "vitest";

import { slugify, disambiguate } from "@/lib/slug";

describe("slugify", () => {
  it("lowercases and hyphenates", () => {
    expect(slugify("PPL Theory")).toBe("ppl-theory");
  });

  it("expands ampersands to 'and' so titles stay readable", () => {
    expect(slugify("Navigation & Flight Planning")).toBe("navigation-and-flight-planning");
  });

  it("collapses runs of punctuation into a single hyphen", () => {
    expect(slugify("Weather, AIP NZ, and Supplements")).toBe("weather-aip-nz-and-supplements");
  });

  it("trims leading and trailing hyphens", () => {
    expect(slugify("  !!Air Law!!  ")).toBe("air-law");
  });

  it("keeps digits", () => {
    expect(slugify("CAA Form 2129")).toBe("caa-form-2129");
  });

  it("returns an empty string when nothing survives", () => {
    expect(slugify("!!!")).toBe("");
  });

  it("is idempotent — slugifying a slug changes nothing", () => {
    const once = slugify("Aircraft Technical Knowledge & Systems");
    expect(slugify(once)).toBe(once);
  });

  it("produces the same slug for the same title (admin and seed agree)", () => {
    expect(slugify("Human Factors")).toBe(slugify("human factors"));
  });
});

describe("disambiguate", () => {
  it("appends a short suffix to the original slug", () => {
    const out = disambiguate("air-law", 0);
    expect(out.startsWith("air-law-")).toBe(true);
  });

  it("gives different suffixes for different seeds", () => {
    expect(disambiguate("air-law", 1)).not.toBe(disambiguate("air-law", 999999));
  });

  it("stays a valid slug", () => {
    const out = disambiguate("air-law", Date.now());
    expect(out).toBe(slugify(out));
  });
});
