import { describe, expect, it } from "vitest";

import { aggregateAreas } from "@/lib/report/kdr-report";
import { questionSection, sectionLabel } from "@/lib/report/section";

/**
 * Chapter-level and point-level results.
 *
 * A question may be mapped to a chapter and no further — that is a
 * deliberate, supported state, not an incomplete one — or to a point inside
 * a chapter. The first must report as its chapter and must never be given a
 * point it does not have; the second must report as its point and must name
 * the chapter above it.
 */

const chapter = { sectionCode: "27", title: "Emergency Communications and Signals" };
const point = { pointNumber: 3, title: "Ground-Air Visual Signals" };

describe("questionSection", () => {
  it("reports a chapter-only question as its chapter", () => {
    const s = questionSection({ module: chapter, lesson: null });
    expect(s).toEqual({ code: "27", title: chapter.title, chapter: null });
    expect(s?.code).not.toContain(".");
  });

  it("invents no point when the question has none", () => {
    for (const lesson of [null, undefined, { pointNumber: null, title: "x" }]) {
      const s = questionSection({ module: chapter, lesson });
      expect(s?.code).toBe("27");
      expect(s?.chapter).toBeNull();
    }
  });

  it("reports a point, and names the chapter above it", () => {
    const s = questionSection({ module: chapter, lesson: point });
    expect(s).toEqual({
      code: "27.3",
      title: point.title,
      chapter: "27 — Emergency Communications and Signals",
    });
  });

  it("falls back to the chapter when the point is unusable", () => {
    // A lesson with no title is not a place in the curriculum.
    const s = questionSection({ module: chapter, lesson: { pointNumber: 3, title: "  " } });
    expect(s?.code).toBe("27");
    expect(s?.chapter).toBeNull();
  });

  it("falls back to the chapter when the chapter has no code", () => {
    const s = questionSection({
      module: { sectionCode: null, title: chapter.title },
      lesson: point,
    });
    expect(s?.code).toBeNull();
    expect(s?.title).toBe(chapter.title);
    expect(s?.chapter).toBeNull();
  });

  it("is unmapped when there is no module at all", () => {
    expect(questionSection({ module: null, lesson: point })).toBeNull();
  });
});

describe("aggregateAreas", () => {
  const rows = [
    { kdrCode: "27", kdrTopic: chapter.title, kdrChapter: null, attempted: 2, correct: 1 },
    {
      kdrCode: "27.3",
      kdrTopic: point.title,
      kdrChapter: "27 — Emergency Communications and Signals",
      attempted: 2,
      correct: 0,
    },
  ];

  it("keeps a point under its chapter and a chapter on its own", () => {
    const areas = aggregateAreas(rows, new Map(), 80, 50);
    const chapterArea = areas.all.find((a) => a.area === sectionLabel("27", chapter.title));
    const pointArea = areas.all.find((a) => a.area === sectionLabel("27.3", point.title));

    expect(chapterArea?.chapter).toBeNull();
    expect(pointArea?.chapter).toBe("27 — Emergency Communications and Signals");
  });

  it("sorts a chapter immediately before its own points", () => {
    const areas = aggregateAreas(rows, new Map(), 80, 50);
    const order = areas.all.map((a) => a.area);
    expect(order.indexOf(sectionLabel("27", chapter.title))).toBeLessThan(
      order.indexOf(sectionLabel("27.3", point.title)),
    );
  });

  it("carries the chapter onto an area known only from a miss", () => {
    const missed = new Map([[sectionLabel("27.3", point.title), 1]]);
    const chapters = new Map([
      [sectionLabel("27.3", point.title), "27 — Emergency Communications and Signals"],
    ]);
    const areas = aggregateAreas([], missed, 80, 50, chapters);
    expect(areas.all).toHaveLength(1);
    expect(areas.all[0].chapter).toBe("27 — Emergency Communications and Signals");
    expect(areas.all[0].missed).toBe(1);
  });

  it("leaves the chapter null for a miss with no chapter recorded", () => {
    // An attempt sat before the chapter was recorded: it still reports, and
    // it still reports honestly, with one line rather than a guessed one.
    const missed = new Map([[sectionLabel("27.3", point.title), 1]]);
    const areas = aggregateAreas([], missed, 80, 50);
    expect(areas.all[0].chapter).toBeNull();
  });
});
