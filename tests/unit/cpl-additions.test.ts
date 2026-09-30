import { describe, it, expect } from "vitest";

// Authored course content, checked as data rather than reviewed by eye.
import { CPL_ADDITIONS, OPEN_GAPS } from "../../content/cpl-additions.mjs";

/**
 * The rules the CPL brief sets for content written to fill a syllabus gap.
 *
 * Two of them are absolute and neither is visible by reading the page in a
 * browser, which is why they are checked here:
 *
 *   1. No source reference reaches a student. The finished material has to read
 *      like a training manual, not a research note, so a URL or a page citation
 *      in a teaching block is a defect however accurate it is.
 *   2. Nothing is written without a source. An entry with no provenance is an
 *      entry somebody wrote from memory, which is exactly what "do not invent"
 *      rules out.
 */

type Block = Record<string, unknown>;
type Addition = {
  subject: string;
  course: string;
  items: string[];
  title: string;
  anchorModule?: string;
  provenance: string;
  blocks: Block[];
};

const additions = CPL_ADDITIONS as Addition[];

/** Every string a student could read on the page. */
function studentText(addition: Addition): string {
  return addition.blocks
    .flatMap((b) => [
      b.text,
      b.title,
      ...((b.rows as string[][]) ?? []).flat(),
      ...((b.headers as string[]) ?? []),
      ...((b.items as string[]) ?? []),
    ])
    .filter((v): v is string => typeof v === "string")
    .join(" \n ");
}

describe("the authored CPL sections", () => {
  it("there are some", () => {
    expect(additions.length).toBeGreaterThan(0);
  });

  it("every section names the syllabus items it answers", () => {
    for (const addition of additions) {
      expect(addition.items.length, addition.title).toBeGreaterThan(0);
      for (const code of addition.items) {
        expect(code, addition.title).toMatch(/^\d{1,3}\.\d{1,3}\.\d{1,3}$/);
      }
    }
  });

  it("every section records where its material came from", () => {
    // An entry without provenance was written from memory.
    for (const addition of additions) {
      expect(addition.provenance, addition.title).toBeTruthy();
      expect(addition.provenance.length, addition.title).toBeGreaterThan(10);
    }
  });

  it("no syllabus item is answered by two different sections", () => {
    const seen = new Map<string, string>();
    for (const addition of additions) {
      for (const code of addition.items) {
        expect(seen.has(code), `${code} answered twice`).toBe(false);
        seen.set(code, addition.title);
      }
    }
  });

  it("every section says where it belongs in the course", () => {
    // Without an anchor a section lands at the end, which is the appendix dump
    // the brief rules out.
    for (const addition of additions) {
      expect(addition.anchorModule, addition.title).toBeTruthy();
    }
  });
});

describe("nothing source-facing reaches the student", () => {
  const forbidden: Array<[RegExp, string]> = [
    [/https?:\/\//i, "a URL"],
    [/\bwww\./i, "a web address"],
    [/\.pdf\b/i, "a filename"],
    [/\baccording to\b/i, "an attribution"],
    [/\bsee (?:page|p\.|chapter)\b/i, "a cross-reference to a source"],
    [/\[\d+\]/, "a footnote marker"],
  ];

  for (const [pattern, what] of forbidden) {
    it(`carries no ${what}`, () => {
      for (const addition of additions) {
        expect(studentText(addition), `${addition.title} carries ${what}`).not.toMatch(pattern);
      }
    });
  }

  it("never names the reference book on the page", () => {
    for (const addition of additions) {
      const text = studentText(addition).toLowerCase();
      expect(text, addition.title).not.toContain("nzicpa");
      expect(text, addition.title).not.toContain("workbook");
    }
  });

  it("keeps the provenance out of the blocks entirely", () => {
    // The provenance string itself must not appear in the teaching text --
    // the easiest way for a citation to leak is to paste it in as a note.
    for (const addition of additions) {
      expect(studentText(addition), addition.title).not.toContain(addition.provenance);
    }
  });
});

describe("the sections actually teach", () => {
  it("each one is long enough to answer its requirement", () => {
    // A section that mentions the topic without teaching it is the failure the
    // brief calls out by name: "merely naming the procedure is NOT sufficient".
    for (const addition of additions) {
      expect(addition.blocks.length, addition.title).toBeGreaterThanOrEqual(5);
      expect(studentText(addition).length, addition.title).toBeGreaterThan(600);
    }
  });

  it("each one is structured, not one long paragraph", () => {
    for (const addition of additions) {
      const kinds = new Set(addition.blocks.map((b) => b.type));
      expect(kinds.size, addition.title).toBeGreaterThan(1);
    }
  });

  it("uses only block types the reader can render", () => {
    const renderable = new Set([
      "heading", "subheading", "paragraph", "list", "table", "image",
      "note", "link", "pdf", "video", "subitem", "formula", "figure", "objective",
    ]);
    for (const addition of additions) {
      for (const block of addition.blocks) {
        expect(renderable.has(block.type as string), `${addition.title}: ${block.type}`).toBe(true);
      }
    }
  });

  it("gives every table a header row and rows of equal width", () => {
    for (const addition of additions) {
      for (const block of addition.blocks) {
        if (block.type !== "table") continue;
        const headers = block.headers as string[];
        const rows = block.rows as string[][];
        expect(headers?.length, addition.title).toBeGreaterThan(0);
        for (const row of rows) expect(row.length, addition.title).toBe(headers.length);
      }
    }
  });
});

describe("the gaps left open", () => {
  it("each says what it is and what would close it", () => {
    for (const gap of OPEN_GAPS as Array<{ items: string[]; reason: string; needs: string }>) {
      expect(gap.items.length).toBeGreaterThan(0);
      expect(gap.reason.length).toBeGreaterThan(60);
      expect(gap.needs.length).toBeGreaterThan(20);
    }
  });

  it("does not also claim to have written the same item", () => {
    const written = new Set(additions.flatMap((a) => a.items));
    for (const gap of OPEN_GAPS as Array<{ items: string[] }>) {
      for (const code of gap.items) {
        expect(written.has(code), `${code} is both written and left open`).toBe(false);
      }
    }
  });
});
