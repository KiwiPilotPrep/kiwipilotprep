import { describe, it, expect } from "vitest";

// The extraction pipeline is plain ESM with no type declarations.
import { buildIndex, coveredSlides, isFrontMatter } from "../../scripts/deck-index.mjs";

/**
 * The properties that make the deck-to-CMS conversion a migration rather than
 * a rewrite: every slide lands somewhere, order survives, and nothing on a
 * slide is quietly dropped on its way into a lesson.
 *
 * These are the rules that are cheap to break by accident and expensive to
 * notice — an importer that loses one slide in forty still looks like it
 * worked.
 */

type Slide = {
  n: number;
  title: string | null;
  is_section?: boolean;
  blocks?: Array<Record<string, unknown>>;
  pictures?: Array<Record<string, unknown>>;
  tables?: unknown[];
  notes?: string;
};

const text = (t: string, level = 0) => ({ kind: "text", level, text: t });

function manifest(slides: Slide[]) {
  return {
    source_file: "Test_Deck.pptx",
    total_slides: slides.length,
    slides: slides.map((s) => ({
      is_section: false,
      blocks: [],
      pictures: [],
      tables: [],
      notes: "",
      ...s,
    })),
  };
}

describe("buildIndex", () => {
  it("opens a module on a divider slide", () => {
    const tree = buildIndex(
      manifest([
        { n: 1, title: "The Atmosphere", is_section: true },
        { n: 2, title: "Water Vapour", blocks: [text("There is always some water vapour.")] },
      ]),
    );
    expect(tree).toHaveLength(1);
    expect(tree[0].module).toBe("The Atmosphere");
    expect(tree[0].lessons[0].title).toBe("Water Vapour");
  });

  it("opens a lesson on a titled slide", () => {
    const tree = buildIndex(
      manifest([
        { n: 1, title: "Wind", is_section: true },
        { n: 2, title: "Coriolis", blocks: [text("a")] },
        { n: 3, title: "Geostrophic", blocks: [text("b")] },
      ]),
    );
    expect(tree[0].lessons.map((l: { title: string }) => l.title)).toEqual([
      "Coriolis",
      "Geostrophic",
    ]);
  });

  it("treats an untitled slide as a continuation of the lesson before it", () => {
    const tree = buildIndex(
      manifest([
        { n: 1, title: "Wind", is_section: true },
        { n: 2, title: "Coriolis", blocks: [text("first")] },
        { n: 3, title: null, blocks: [text("second")] },
      ]),
    );
    expect(tree[0].lessons).toHaveLength(1);
    expect(tree[0].lessons[0].source_slides).toEqual([2, 3]);
    expect(tree[0].lessons[0].content).toHaveLength(2);
  });

  it("does not split a lesson when the same heading repeats", () => {
    const tree = buildIndex(
      manifest([
        { n: 1, title: "Wind", is_section: true },
        { n: 2, title: "Coriolis", blocks: [text("first")] },
        { n: 3, title: "Coriolis", blocks: [text("second")] },
      ]),
    );
    expect(tree[0].lessons).toHaveLength(1);
    expect(tree[0].lessons[0].source_slides).toEqual([2, 3]);
  });

  it("gives content that arrives before any heading a module to live in", () => {
    // Otherwise the deck's opening slides would have nowhere to go, and the
    // easiest thing for an importer to do with them is drop them.
    const tree = buildIndex(manifest([{ n: 1, title: null, blocks: [text("cover")] }]));
    expect(tree).toHaveLength(1);
    expect(tree[0].lessons[0].content).toHaveLength(1);
  });

  it("keeps every block of every slide, in slide order", () => {
    const tree = buildIndex(
      manifest([
        { n: 1, title: "M", is_section: true },
        { n: 2, title: "L", blocks: [text("one"), text("two"), text("three")] },
      ]),
    );
    expect(tree[0].lessons[0].content.map((b: { content: string }) => b.content)).toEqual([
      "one",
      "two",
      "three",
    ]);
  });

  it("carries the indent level through, because nesting is meaning", () => {
    const tree = buildIndex(
      manifest([
        { n: 1, title: "M", is_section: true },
        { n: 2, title: "L", blocks: [text("point", 0), text("sub", 1)] },
      ]),
    );
    expect(tree[0].lessons[0].content.map((b: { level: number }) => b.level)).toEqual([0, 1]);
  });

  it("records which slide each block came from", () => {
    const tree = buildIndex(
      manifest([
        { n: 1, title: "M", is_section: true },
        { n: 2, title: "L", blocks: [text("a")] },
        { n: 3, title: null, blocks: [text("b")] },
      ]),
    );
    expect(
      tree[0].lessons[0].content.map((b: { source_slide: number }) => b.source_slide),
    ).toEqual([2, 3]);
  });

  it("keeps a diagram as its own entry rather than folding it into the text", () => {
    const tree = buildIndex(
      manifest([
        { n: 1, title: "M", is_section: true },
        {
          n: 2,
          title: "L",
          blocks: [text("before"), { kind: "picture", sha1: "abc" }, text("after")],
          pictures: [{ sha1: "abc", asset: "abc.png" }],
        },
      ]),
    );
    const kinds = tree[0].lessons[0].content.map((b: { type: string }) => b.type);
    expect(kinds).toEqual(["text", "diagram", "text"]);
    expect(tree[0].lessons[0].diagrams).toHaveLength(1);
    expect(tree[0].lessons[0].diagrams[0].asset).toBe("abc.png");
  });

  it("keeps a table's rows exactly as extracted", () => {
    const rows = [
      ["Gas", "Percentage"],
      ["Nitrogen", "78%"],
    ];
    const tree = buildIndex(
      manifest([
        { n: 1, title: "M", is_section: true },
        { n: 2, title: "L", blocks: [{ kind: "table", rows }], tables: [rows] },
      ]),
    );
    expect(tree[0].lessons[0].tables[0].rows).toEqual(rows);
  });

  it("marks an embedded video instead of losing the slide", () => {
    const tree = buildIndex(
      manifest([
        { n: 1, title: "M", is_section: true },
        { n: 2, title: "L", blocks: [{ kind: "media", poster: null }] },
      ]),
    );
    expect(tree[0].lessons[0].media).toHaveLength(1);
    expect(tree[0].lessons[0].content[0].note).toContain("PRESERVE FROM SOURCE");
  });

  it("records a slide that carried nothing without making a page of it", () => {
    // The slide has to stay accounted for — that is what proves nothing was
    // lost — but a paragraph reading "no content in source" is not content,
    // and the student was the one being shown it.
    const tree = buildIndex(
      manifest([
        { n: 1, title: "M", is_section: true },
        { n: 2, title: "L", blocks: [text("a")] },
        { n: 3, title: null, blocks: [] },
      ]),
    );
    const lesson = tree[0].lessons[0];
    expect(lesson.content).toHaveLength(1);
    expect(lesson.empty_slides).toEqual([3]);
    expect(coveredSlides(tree).has(3)).toBe(true);
  });

  it("drops a topic that ended up with no content at all", () => {
    // A divider slide that opens a topic and then has nothing to put in it
    // used to ship as an empty topic — "Lift", with one line saying there was
    // no content. The slide is still covered; the empty page is not.
    const tree = buildIndex(
      manifest([
        { n: 1, title: "M", is_section: true },
        { n: 2, title: "Lift", blocks: [] },
        { n: 3, title: "Real topic", blocks: [text("a")] },
      ]),
    );
    expect(tree[0].lessons.map((l: { title: string }) => l.title)).toEqual(["Real topic"]);
    expect(coveredSlides(tree).has(2)).toBe(true);
  });

  it("never names a topic after the source file", () => {
    // A cover page has no title and opens no lesson, so the fallback named the
    // first topic of the IR course "IFRNavigation2020_Branding_Removed".
    const tree = buildIndex(
      manifest([
        { n: 1, title: null, blocks: [] },
        { n: 2, title: "M", is_section: true },
        { n: 3, title: "L", blocks: [text("a")] },
      ]),
    );
    const titles = tree.flatMap((m: { lessons: Array<{ title: string }> }) =>
      m.lessons.map((l) => l.title),
    );
    expect(titles.some((t) => /\.pptx|\.pdf|manifest|Branding/i.test(t))).toBe(false);
    expect(coveredSlides(tree).has(1)).toBe(true);
  });

  it("does not ship a chapter with no topics in it", () => {
    // A divider for a section the deck never filled. The reader gets a chapter
    // heading, clicks it, and finds nothing — and the chapter count on the
    // subject card counts it.
    const tree = buildIndex(
      manifest([
        { n: 1, title: "Real Chapter", is_section: true },
        { n: 2, title: "A topic", blocks: [text("something")] },
        { n: 3, title: "Empty Chapter", is_section: true },
      ]),
    );
    expect(tree.map((m) => m.module)).toEqual(["Real Chapter"]);
    // Dropped from the index, still accounted for against the source.
    expect(coveredSlides(tree).has(3)).toBe(true);
  });

  it("gives two chapters of the same name something to tell them apart", () => {
    const tree = buildIndex(
      manifest([
        { n: 1, title: "Navigation", is_section: true },
        { n: 2, title: "First topic", blocks: [text("a")] },
        { n: 3, title: "Navigation", is_section: true },
        { n: 4, title: "Holding Patterns", blocks: [text("b")] },
      ]),
    );
    const names = tree.map((m) => m.module);
    expect(new Set(names).size).toBe(names.length);
    expect(names[1]).toBe("Holding Patterns");
  });

  it("keeps a presenter note as a note, attributed to its slide", () => {
    const tree = buildIndex(
      manifest([
        { n: 1, title: "M", is_section: true },
        { n: 2, title: "L", blocks: [text("a")], notes: "Mention the exam weighting." },
      ]),
    );
    const note = tree[0].lessons[0].content.find((b: { type: string }) => b.type === "note");
    expect(note.content).toBe("Mention the exam weighting.");
    expect(note.source_slide).toBe(2);
  });

  it("turns an exam-information cover into a lesson, not a module heading", () => {
    // Read as a divider it becomes a module several lines long with nothing
    // under it, which puts the exam details in the contents list instead of
    // in front of the student.
    const tree = buildIndex(
      manifest([
        {
          n: 1,
          title: "Exam:\n70 minutes\n25 questions",
          is_section: true,
        },
      ]),
    );
    expect(tree[0].lessons).toHaveLength(1);
    expect(tree[0].lessons[0].title).toBe("Exam:");
    expect(tree[0].lessons[0].content.map((b: { content: string }) => b.content)).toEqual([
      "Exam:",
      "70 minutes",
      "25 questions",
    ]);
  });

  it("does not drop blocks that arrive on a slide called a divider", () => {
    const tree = buildIndex(
      manifest([{ n: 1, title: "Wind", is_section: true, blocks: [text("stray")] }]),
    );
    expect(tree[0].lessons[0].content[0].content).toBe("stray");
  });
});

describe("coveredSlides", () => {
  it("accounts for every slide of the deck", () => {
    const m = manifest([
      { n: 1, title: "M", is_section: true },
      { n: 2, title: "L", blocks: [text("a")] },
      { n: 3, title: null, blocks: [text("b")] },
      { n: 4, title: "L2", blocks: [text("c")] },
    ]);
    const covered = coveredSlides(buildIndex(m));
    expect([...covered].sort((a, b) => a - b)).toEqual([1, 2, 3, 4]);
  });

  it("counts a divider slide even though it holds no content", () => {
    const covered = coveredSlides(buildIndex(manifest([{ n: 1, title: "M", is_section: true }])));
    expect(covered.has(1)).toBe(true);
  });
});

describe("isFrontMatter", () => {
  it("recognises the deck's own cover and exam slides", () => {
    expect(isFrontMatter("Subject No. 6")).toBe(true);
    expect(isFrontMatter("Exam: 70 minutes")).toBe(true);
    expect(isFrontMatter("Contents")).toBe(true);
  });

  it("does not mistake a teaching topic for front matter", () => {
    expect(isFrontMatter("Coriolis Force")).toBe(false);
    expect(isFrontMatter("Transponders")).toBe(false);
    // "Examination" is a topic in Air Law; "Exam:" is a cover slide.
    expect(isFrontMatter("Examinations and Ratings")).toBe(false);
  });
});
