import { describe, expect, it } from "vitest";

import type { Block } from "@/lib/content";
import { BLANK_FIGURE_ASSET_IDS, dropBlankFigures } from "@/lib/study/blank-figures";

const BLANK = "cmtsa9kar015rc3zk46yzfcgw";
const fig = (assetId: string, caption?: string): Block => ({ type: "figure", assetId, caption });
const p = (text: string): Block => ({ type: "paragraph", text });

describe("dropBlankFigures", () => {
  it("knows about the one figure measured as blank", () => {
    expect(BLANK_FIGURE_ASSET_IDS.has(BLANK)).toBe(true);
  });

  it("removes that figure, and its caption with it", () => {
    const out = dropBlankFigures([
      p("Times are given in UTC."),
      fig(BLANK, "A clock face showing the twenty-four hour convention used for aviation times."),
    ]);

    expect(out).toHaveLength(1);
    expect(out[0]).toEqual(p("Times are given in UTC."));
  });

  it("leaves every other figure alone", () => {
    const keep = fig("cmtsa9ka4014tc3zkk6lvvp2r", "The subparts of Part 61.");
    expect(dropBlankFigures([keep])).toEqual([keep]);
  });

  it("keeps the surrounding blocks in order", () => {
    const before = p("Before the diagram.");
    const after = p("After the diagram.");
    const out = dropBlankFigures([before, fig(BLANK), after]);

    expect(out).toEqual([before, after]);
  });

  it("does not touch blocks that are not figures", () => {
    const blocks: Block[] = [
      { type: "heading", text: "The Time System" },
      { type: "keypoints", items: ["UTC is the reference."] },
      p("Prose."),
    ];

    expect(dropBlankFigures(blocks)).toEqual(blocks);
  });

  it("does not mutate the blocks it was given", () => {
    const input = [p("One."), fig(BLANK), p("Two.")];
    const snapshot = JSON.parse(JSON.stringify(input));

    dropBlankFigures(input);

    expect(input).toEqual(snapshot);
  });
});
