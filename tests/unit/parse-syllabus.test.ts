import { describe, it, expect } from "vitest";

import { parseSyllabus as parseUntyped } from "../../scripts/parse-syllabus.mjs";

/** The parser is a plain .mjs script; this is its shape, declared once. */
type Item = { code: string; requirement: string; displayOrder: number };
type Topic = {
  code: string;
  title: string;
  sectionNumber: string | null;
  sectionTitle: string | null;
  items: Item[];
};
type Parsed = { topics: Topic[]; unparsed: string[]; sectionNote: string | null };

const parseSyllabus = parseUntyped as (raw: string) => Parsed;

/**
 * The parser's one job is to copy the official syllabus, not to improve it.
 *
 * Every test here is really the same assertion from a different angle: the
 * words that come out are the words that went in. Getting this wrong would put
 * altered CAA wording in front of someone sitting a real exam.
 */

const SAMPLE = `Advisory Circular AC61-3 Revision 31

5 April 2025 80       CAA of NZ

Subject No. 12 Aircraft Technical Knowledge (Aeroplane)
Note: This syllabus is primarily based on a single piston-engine GA-type aeroplane.
Sub Topic Syllabus Item
 Section 1 General Technical Knowledge
12.2 Definitions, Terminology, Units and Abbreviations
12.2.2 State the International System (SI) and ICAO units used to express:
(a) distance;
(b) time.
12.2.4 Define and where appropriate show the relevant relationships between:
(a) mass, weight and gravitational force (g);
(b) inertia.
12.4 The Atmosphere
12.4.2 Name the principal gases which constitute the atmosphere.
12.4.4 Explain how air density varies with altitude within the
atmosphere.
 Section 2  Aeroplane Technical Knowledge
12.52 Cooling Systems
12.52.2 Describe the function of a cooling system.
`;

describe("parseSyllabus — structure", () => {
  const parsed = parseSyllabus(SAMPLE);

  it("finds every topic", () => {
    expect(parsed.topics.map((t) => t.code)).toEqual([
      "12.2",
      "12.4",
      "12.52",
    ]);
  });

  it("attaches each item to the topic it appears under", () => {
    expect(parsed.topics[0].items.map((i) => i.code)).toEqual([
      "12.2.2",
      "12.2.4",
    ]);
    expect(parsed.topics[1].items.map((i) => i.code)).toEqual([
      "12.4.2",
      "12.4.4",
    ]);
  });

  it("records which section a topic belongs to", () => {
    expect(parsed.topics[0].sectionNumber).toBe("1");
    expect(parsed.topics[0].sectionTitle).toBe("General Technical Knowledge");
    expect(parsed.topics[2].sectionNumber).toBe("2");
    expect(parsed.topics[2].sectionTitle).toBe("Aeroplane Technical Knowledge");
  });

  it("keeps topic titles exactly as printed, punctuation included", () => {
    expect(parsed.topics[0].title).toBe("Definitions, Terminology, Units and Abbreviations");
  });

  it("numbers items in the order they appear", () => {
    expect(parsed.topics[0].items.map((i) => i.displayOrder)).toEqual([
      0, 1,
    ]);
  });
});

describe("parseSyllabus — official wording is preserved", () => {
  const parsed = parseSyllabus(SAMPLE);
  const item = (code: string) => {
    const found = parsed.topics.flatMap((t) => t.items).find((i) => i.code === code);
    if (!found) throw new Error(`no item ${code} in the parsed sample`);
    return found;
  };

  it("keeps lettered sub-clauses on their own lines", () => {
    expect(item("12.2.2").requirement).toBe(
      "State the International System (SI) and ICAO units used to express:\n(a) distance;\n(b) time.",
    );
  });

  it("rejoins a requirement that wrapped across two lines", () => {
    // The source breaks this one mid-sentence after "the".
    expect(item("12.4.4").requirement).toBe(
      "Explain how air density varies with altitude within the atmosphere.",
    );
  });

  it("does not collapse the newlines it just inserted", () => {
    // The bug this pins: collapsing \s+ after a sub-clause flattens
    // "(a) …\n(b) …" onto one line and changes how the requirement reads.
    const req = item("12.2.4").requirement;
    expect(req.split("\n")).toHaveLength(3);
    expect(req).toContain("\n(a) mass, weight and gravitational force (g);");
  });

  it("preserves the exact characters, including parentheses and semicolons", () => {
    expect(item("12.2.4").requirement).toContain("gravitational force (g);");
  });

  it("never leaves trailing whitespace on a requirement", () => {
    for (const t of parsed.topics) {
      for (const i of t.items) {
        expect(i.requirement).toBe(i.requirement.trim());
      }
    }
  });
});

describe("parseSyllabus — what it refuses to guess", () => {
  it("reports the subject preamble instead of attaching it to a topic", () => {
    const parsed = parseSyllabus(SAMPLE);
    expect(parsed.unparsed.some((l) => l.startsWith("Note: This syllabus"))).toBe(true);
    // And it did not end up inside a topic or item.
    const allText = JSON.stringify(parsed.topics);
    expect(allText).not.toContain("primarily based on a single piston-engine");
  });

  it("drops repeated page furniture, which is not syllabus content", () => {
    const parsed = parseSyllabus(SAMPLE);
    const allText = JSON.stringify(parsed);
    expect(allText).not.toContain("CAA of NZ");
    expect(allText).not.toContain("Advisory Circular");
    expect(allText).not.toContain("Sub Topic Syllabus Item");
  });

  it("does not invent a topic for an item that appears before any topic", () => {
    const orphan = parseSyllabus("12.9.9 An item with no topic above it.\n");
    expect(orphan.topics).toHaveLength(0);
    expect(orphan.unparsed).toHaveLength(1);
  });

  it("treats the 'Section 1 is common to…' line as a note, not a section", () => {
    const parsed = parseSyllabus(
      "Section 1 is common to both Subject 12 (Aeroplane) and Subject 14 (Helicopter)\n" + SAMPLE,
    );
    // Still exactly two real sections across the topics.
    const sections = new Set(parsed.topics.map((t) => t.sectionTitle));
    expect(sections).toEqual(new Set(["General Technical Knowledge", "Aeroplane Technical Knowledge"]));
  });

  it("returns an empty result for empty input rather than throwing", () => {
    const parsed = parseSyllabus("");
    expect(parsed.topics).toEqual([]);
  });
});
