import { describe, it, expect } from "vitest";

// Plain ESM with no type declarations — part of the extraction pipeline.
import { autoChapters } from "../../scripts/auto-chapters.mjs";

/**
 * Recovering a chapter structure from a deck that announced none.
 *
 * The properties worth holding are conservative ones. This runs on material a
 * student pays for, and the two ways it can go wrong are not symmetrical: a
 * chapter boundary in the wrong place misleads a reader about where a topic
 * begins, while a chapter that is a little long only costs them some scrolling.
 * So the tests are mostly about *not* splitting — and, above all, about never
 * losing or reordering a lesson.
 */

type Lesson = { title: string; source_slides: number[]; content: Array<Record<string, unknown>> };

let slide = 0;
function lesson(title: string, body = ""): Lesson {
  slide += 1;
  return {
    title,
    source_slides: [slide],
    content: body ? [{ type: "text", content: body, source_slide: slide }] : [],
  };
}

/** A run of lessons on one subject, long enough to stand as a chapter. */
function run(subject: string, n: number): Lesson[] {
  return Array.from({ length: n }, (_, i) => lesson(`${subject} part ${i + 1}`, `About ${subject}.`));
}

type Chapter = { module: string; source_slide: number | null; lessons: Lesson[] };

function flatten(chapters: Chapter[]): string[] {
  return chapters.flatMap((c) => c.lessons.map((l) => l.title));
}

/**
 * The pipeline is untyped ESM. Its inferred signature comes from the default
 * argument, so the call is made through here rather than sprinkling casts.
 */
const build = autoChapters as (lessons: Lesson[], firstSlide?: number) => Chapter[];
const chapter = (lessons: Lesson[], firstSlide?: number): Chapter[] =>
  build(lessons, firstSlide);

describe("autoChapters", () => {
  it("keeps every lesson", () => {
    const lessons = [...run("Coriolis", 10), ...run("Altimeter", 10), ...run("Transponder", 10)];
    const chapters = chapter(lessons);
    expect(flatten(chapters)).toHaveLength(lessons.length);
  });

  it("keeps them in the order they were taught", () => {
    const lessons = [...run("Coriolis", 10), ...run("Altimeter", 10), ...run("Transponder", 10)];
    const chapters = chapter(lessons);
    expect(flatten(chapters)).toEqual(lessons.map((l) => l.title));
  });

  // A realistic deck teaches many subjects, so each one is a small share of it.
  // That matters: a term only identifies a chapter if it is rare across the
  // whole deck, and in a two-subject fixture each subject fills half the deck
  // and identifies nothing.
  const manySubjects = () => [
    ...run("Coriolis", 12),
    ...run("Transponder", 12),
    ...run("Altimeter", 12),
    ...run("Hypoxia", 12),
    ...run("Barotrauma", 12),
  ];

  it("splits where the subject genuinely changes", () => {
    const chapters = chapter(manySubjects());
    expect(chapters.length).toBeGreaterThan(1);
  });

  it("names a chapter after what runs through it", () => {
    const chapters = chapter(manySubjects());
    expect(chapters[0].module.toLowerCase()).toContain("coriolis");
  });

  it("finds roughly as many chapters as there are subjects", () => {
    // Not exactly: a boundary is only called once a chapter is long enough, so
    // the count tracks the material rather than matching it precisely.
    const chapters = chapter(manySubjects());
    expect(chapters.length).toBeGreaterThanOrEqual(3);
    expect(chapters.length).toBeLessThanOrEqual(7);
  });

  it("does not split a single subject taught at length", () => {
    const chapters = chapter(run("Coriolis", 30));
    expect(chapters).toHaveLength(1);
  });

  it("does not split on one off-topic lesson in the middle of a run", () => {
    // A summary slide, a diagram page, a worked example. One of these is not a
    // new chapter, and treating it as one starts a chapter mid-topic.
    const lessons = [
      ...run("Coriolis", 10),
      lesson("Summary", "A quick recap."),
      ...run("Coriolis", 10),
      ...run("Transponder", 12),
      ...run("Altimeter", 12),
    ];
    const chapters = chapter(lessons);
    const coriolis = chapters.filter((c) => c.module.toLowerCase().includes("coriolis"));
    expect(coriolis).toHaveLength(1);
  });

  it("leaves no chapter too short to be one", () => {
    const lessons = [
      ...run("Coriolis", 12), ...run("Transponder", 3), ...run("Altimeter", 12),
      ...run("Hypoxia", 12), ...run("Barotrauma", 12),
    ];
    const chapters = chapter(lessons);
    for (const chapter of chapters) {
      expect(chapter.lessons.length, chapter.module).toBeGreaterThanOrEqual(4);
    }
  });

  it("breaks up a run too long to scan, even with no change of subject", () => {
    const chapters = chapter(run("Coriolis", 120));
    expect(chapters.length).toBeGreaterThan(1);
    for (const chapter of chapters) {
      expect(chapter.lessons.length).toBeLessThanOrEqual(46);
    }
  });

  it("records the slide each chapter opens on", () => {
    const chapters = chapter(manySubjects());
    for (const chapter of chapters) {
      const first = Math.min(...chapter.lessons.flatMap((l) => l.source_slides));
      expect(chapter.source_slide).toBeLessThanOrEqual(first);
    }
  });

  it("carries the opening slide of the section it replaced", () => {
    // The divider or cover page that opened the original section is not a
    // lesson, so without this it stops being accounted for and the coverage
    // check reports a lost slide.
    const lessons = manySubjects();
    const opening = Math.min(...lessons[0].source_slides) - 1;
    const chapters = chapter(lessons, opening);
    expect(chapters[0].source_slide).toBe(opening);
  });

  it("returns a single chapter for a section already short enough", () => {
    const chapters = chapter(run("Coriolis", 6));
    expect(chapters).toHaveLength(1);
    expect(chapters[0].lessons).toHaveLength(6);
  });

  it("handles an empty list without throwing", () => {
    expect(chapter([])).toHaveLength(1);
    expect(chapter([])[0].lessons).toEqual([]);
  });

  it("never names a chapter after a word common to the whole deck", () => {
    // "Aircraft" and "system" appear everywhere in an aviation deck and say
    // nothing about which chapter a reader is in.
    const lessons = [
      ...Array.from({ length: 12 }, (_, i) => lesson(`Aircraft hydraulic system ${i}`, "hydraulics")),
      ...Array.from({ length: 12 }, (_, i) => lesson(`Aircraft electrical system ${i}`, "electrics")),
    ];
    const chapters = chapter(lessons);
    for (const chapter of chapters) {
      expect(chapter.module.toLowerCase()).not.toBe("aircraft");
      expect(chapter.module.toLowerCase()).not.toBe("system");
    }
  });
});

describe("chapter names", () => {
  it("names a chapter after one of its own headings, not after a word", () => {
    // Naming a chapter after the single term that runs through it produced
    // "Datum", "Sector" and "Based" in the IR index. The source already has a
    // well-formed heading for the same idea.
    const lessons = [
      ...run("holding pattern entry procedures", 12),
      ...run("transponder code assignment", 12),
    ];
    for (const recovered of chapter(lessons)) {
      expect(recovered.module.split(/\s+/).length).toBeGreaterThan(1);
      expect(lessons.some((l) => l.title === recovered.module)).toBe(true);
    }
  });

  it("never names a chapter after a word that means nothing", () => {
    // "Based", "Continued", "Provides" — words that recur in every deck and
    // say nothing about what a chapter teaches.
    const lessons = [
      ...run("based continued provides holding", 12),
      ...run("based continued provides transponder", 12),
    ];
    for (const recovered of chapter(lessons)) {
      expect(/^(based|continued|provides|following|general)$/i.test(recovered.module)).toBe(false);
    }
  });
});
