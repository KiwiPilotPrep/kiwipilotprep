import { describe, expect, it } from "vitest";

import type { Block } from "@/lib/content";
import { joinSplitParagraphs } from "@/lib/study/join-split-paragraphs";

const p = (text: string): Block => ({ type: "paragraph", text });
const texts = (blocks: Block[]) =>
  blocks.map((b) => (b.type === "paragraph" ? b.text : `<${b.type}>`));

/**
 * These cases are taken from the material the audit pointed at — PPL Air Law,
 * section 4.2 "Standard and Restricted Categories" — because the rule has to
 * hold on the real text, not on invented examples.
 */
describe("joinSplitParagraphs", () => {
  it("rejoins a sentence split across two blocks", () => {
    const out = joinSplitParagraphs([
      p("This category allows most aircraft"),
      p("operations under various CA rules."),
    ]);

    expect(texts(out)).toEqual([
      "This category allows most aircraft operations under various CA rules.",
    ]);
  });

  it("rejoins across three blocks, including one that starts with a capital", () => {
    // "Air Transport Operations" is a defined term, so the continuation begins
    // with a capital O. A rule based on letter case would leave this broken.
    const out = joinSplitParagraphs([
      p("Aircraft used for Air Transport"),
      p("Operations shall be in the standard"),
      p("category."),
    ]);

    expect(texts(out)).toEqual([
      "Aircraft used for Air Transport Operations shall be in the standard category.",
    ]);
  });

  it("preserves every word, in order", () => {
    const input = [
      p("This category allows most aircraft"),
      p("operations under various CA rules."),
      p("Aircraft used for Air Transport"),
      p("Operations shall be in the standard"),
      p("category."),
    ];
    const before = input.map((b) => (b as { text: string }).text).join(" ").split(/\s+/);
    const after = texts(joinSplitParagraphs(input)).join(" ").split(/\s+/);

    expect(after).toEqual(before);
  });

  it("leaves correctly formed paragraphs alone", () => {
    const input = [
      p("The category most aircraft hold, and the one that trades operational freedom for load limits."),
      p("This category generally applies to aircraft used in the agricultural role."),
    ];

    expect(joinSplitParagraphs(input)).toEqual(input);
  });

  it("does not join across a figure", () => {
    const figure: Block = { type: "figure", assetId: "abc" };
    const out = joinSplitParagraphs([p("An unfinished line"), figure, p("and the next one.")]);

    expect(texts(out)).toEqual(["An unfinished line", "<figure>", "and the next one."]);
  });

  it("does not join a heading to the paragraph beneath it", () => {
    const heading: Block = { type: "heading", text: "Standard and Restricted Categories" };
    const out = joinSplitParagraphs([heading, p("The category most aircraft hold.")]);

    expect(out).toHaveLength(2);
  });

  it("does not continue past a colon, which introduces rather than trails off", () => {
    const out = joinSplitParagraphs([p("The categories are:"), p("Standard and Restricted.")]);

    expect(texts(out)).toEqual(["The categories are:", "Standard and Restricted."]);
  });

  it("treats a question or exclamation as a finished sentence", () => {
    const out = joinSplitParagraphs([p("Which category applies?"), p("It depends on the role.")]);

    expect(out).toHaveLength(2);
  });

  it("handles a closing quote after the full stop", () => {
    const out = joinSplitParagraphs([p('He called it "standard."'), p("That is the usual case.")]);

    expect(out).toHaveLength(2);
  });

  it("leaves a lone abbreviation as its own block", () => {
    const out = joinSplitParagraphs([p("CAA."), p("The authority.")]);

    expect(out).toHaveLength(2);
  });

  it("does not mutate the blocks it was given", () => {
    const input = [p("This category allows most aircraft"), p("operations under various CA rules.")];
    const snapshot = JSON.parse(JSON.stringify(input));

    joinSplitParagraphs(input);

    expect(input).toEqual(snapshot);
  });

  it("passes an empty list through", () => {
    expect(joinSplitParagraphs([])).toEqual([]);
  });
});

/**
 * The material is not all prose. Flight-plan working and column data are stored
 * as paragraphs too, and they also fail to end in a full stop — but running
 * them together destroys the line structure that makes them readable. These
 * cases are taken verbatim from IR Navigation, "Planning the Climb".
 */
describe("joinSplitParagraphs leaves working and tabular lines alone", () => {
  it("does not join a line of column headings to the row beneath it", () => {
    const input = [
      p("From To CAS Temp° Alt/FL TAS Track ° M Wind ° M"),
      p("WU TOC 130 17k -16 26k 172 046"),
    ];

    expect(joinSplitParagraphs(input)).toEqual(input);
  });

  it("does not join flight-plan working", () => {
    const input = [
      p("WCA = 1°Left so, SUBTRACT HDG M = 045°"),
      p("GS = 202kts Remember climb time was 7 min"),
    ];

    expect(joinSplitParagraphs(input)).toEqual(input);
  });

  it("does not join a line ending in a capitalised identifier", () => {
    const input = [p("Insert the track WU to RUGVI"), p("This is 046°M")];

    expect(joinSplitParagraphs(input)).toEqual(input);
  });

  it("still joins ordinary prose that stops on a comma", () => {
    const out = joinSplitParagraphs([
      p("Where the aircraft is operated for hire or reward,"),
      p("the standard category applies."),
    ]);

    expect(texts(out)).toEqual([
      "Where the aircraft is operated for hire or reward, the standard category applies.",
    ]);
  });
});

describe("joinSplitParagraphs recognises prose by its ordinary words", () => {
  it("does not join a truncated column heading, even though it ends lowercase", () => {
    // Verbatim from IR Navigation: "Temp" is a clipped column label, not a word
    // trailing off mid-sentence. Every token is capitalised, which prose is not.
    const input = [p("From To CAS Temp"), p("WU TOC 130 17k -16")];

    expect(joinSplitParagraphs(input)).toEqual(input);
  });

  it("still joins a fragment that carries ordinary words", () => {
    const out = joinSplitParagraphs([
      p("Aircraft used for Air Transport"),
      p("Operations shall be in the standard category."),
    ]);

    expect(out).toHaveLength(1);
  });
});

describe("joinSplitParagraphs ignores fragments too short to be a clause", () => {
  it("does not join a two-word column label", () => {
    const input = [p("Spd kts"), p("Hdg G/S")];
    expect(joinSplitParagraphs(input)).toEqual(input);
  });

  it("does not join a single trailing word", () => {
    const input = [p("continued"), p("Your plan should be starting to look like this now.")];
    expect(joinSplitParagraphs(input)).toEqual(input);
  });
});
