import { describe, it, expect } from "vitest";

import { toBlocks, emptyBlock, blocksToText, BLOCK_TYPES, type Block } from "@/lib/content";

/**
 * `toBlocks` is the boundary between untyped JSON in Postgres and the
 * renderer. Anything it lets through gets rendered, so it has to be strict.
 */
describe("toBlocks", () => {
  it("passes through a well-formed block list", () => {
    const input = [
      { type: "heading", text: "Airspace" },
      { type: "paragraph", text: "Classes A to G." },
    ];
    expect(toBlocks(input)).toHaveLength(2);
  });

  it("returns an empty list for null (a chapter with no content row)", () => {
    expect(toBlocks(null)).toEqual([]);
  });

  it("returns an empty list for undefined", () => {
    expect(toBlocks(undefined)).toEqual([]);
  });

  it("rejects a non-array, rather than throwing", () => {
    expect(toBlocks({ type: "heading", text: "not in an array" })).toEqual([]);
    expect(toBlocks("a string")).toEqual([]);
    expect(toBlocks(42)).toEqual([]);
  });

  it("drops entries with no type, keeping the valid ones", () => {
    const mixed = [
      { type: "paragraph", text: "keep me" },
      { text: "no type — drop me" },
      null,
      "just a string",
      { type: "heading", text: "keep me too" },
    ];
    const out = toBlocks(mixed);
    expect(out).toHaveLength(2);
    expect(out.every((b) => typeof b.type === "string")).toBe(true);
  });

  it("drops a block whose type is not a string", () => {
    expect(toBlocks([{ type: 7, text: "x" }])).toEqual([]);
  });
});

describe("emptyBlock", () => {
  it("creates a usable starting shape for every advertised block type", () => {
    for (const { type } of BLOCK_TYPES) {
      const block = emptyBlock(type);
      expect(block.type).toBe(type);
    }
  });

  it("gives a list one blank item to type into", () => {
    const block = emptyBlock("list") as Extract<Block, { type: "list" }>;
    expect(block.items).toEqual([""]);
    expect(block.ordered).toBe(false);
  });

  it("gives a table a header row and a body row of equal width", () => {
    const block = emptyBlock("table") as Extract<Block, { type: "table" }>;
    expect(block.headers).toHaveLength(2);
    expect(block.rows[0]).toHaveLength(block.headers.length);
  });

  it("gives a note a default variant so it always renders", () => {
    const block = emptyBlock("note") as Extract<Block, { type: "note" }>;
    expect(block.variant).toBe("info");
  });

  it("survives a round trip through JSON, as the database does", () => {
    for (const { type } of BLOCK_TYPES) {
      const block = emptyBlock(type);
      const restored = toBlocks(JSON.parse(JSON.stringify([block])));
      expect(restored).toHaveLength(1);
      expect(restored[0].type).toBe(type);
    }
  });
});

describe("blocksToText", () => {
  it("flattens prose blocks", () => {
    const text = blocksToText([
      { type: "heading", text: "Fuel" },
      { type: "paragraph", text: "Reserves are 30 minutes." },
    ]);
    expect(text).toContain("Fuel");
    expect(text).toContain("30 minutes");
  });

  it("includes list items", () => {
    const text = blocksToText([{ type: "list", items: ["TAF", "METAR"] }]);
    expect(text).toContain("TAF");
    expect(text).toContain("METAR");
  });

  it("includes table headers and cells", () => {
    const text = blocksToText([
      { type: "table", headers: ["Class"], rows: [["Charlie"]] },
    ]);
    expect(text).toContain("Class");
    expect(text).toContain("Charlie");
  });

  it("ignores blocks with no readable text", () => {
    expect(blocksToText([{ type: "image", url: "x.png" }])).toBe("");
  });

  it("returns an empty string for no blocks", () => {
    expect(blocksToText([])).toBe("");
  });
});
