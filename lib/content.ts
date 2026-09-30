/**
 * Structured learning-content model (§13).
 *
 * Chapter bodies are stored as an ordered array of typed blocks rather than
 * raw HTML, so the same content can be rendered on the web today and reused
 * for PDF scorecards or a native reader later without re-parsing markup —
 * and so admin input can never inject markup into the page.
 */

export type Block =
  | { type: "heading"; text: string }
  | { type: "subheading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; ordered?: boolean; items: string[] }
  | { type: "table"; headers: string[]; rows: string[][] }
  | { type: "image"; url: string; alt?: string; caption?: string }
  | { type: "note"; variant?: "info" | "warning"; title?: string; text: string }
  | { type: "link"; url: string; label?: string }
  | { type: "pdf"; url: string; label?: string }
  | { type: "video"; url: string; title?: string }
  /**
   * A lettered sub-item — "(a) distance;" — with its explanation.
   *
   * Stored as its own block rather than as a line inside a paragraph. That is
   * the whole point: the source runs "(a) distance; (b) time; (c) velocity;"
   * together, and flattening them into prose is what made the material hard to
   * study. A block per sub-item means each one gets its own line, its own
   * spacing, and can carry its own body text.
   */
  | { type: "subitem"; label: string; title?: string; text?: string }
  /**
   * A technical expression shown apart from the prose — "F = ma", "9.81 m/s²".
   * Separate from `paragraph` so superscripts and units keep their spacing
   * instead of collapsing into a sentence.
   */
  | { type: "formula"; text: string; note?: string }
  /**
   * A figure from the source, with its caption. `assetId` refers to a
   * MediaAsset, so the bytes stay behind the same access control as every
   * other piece of paid material.
   */
  | { type: "figure"; assetId: string; alt?: string; caption?: string }
  /** The official syllabus objective, quoted. Never rewritten. */
  | { type: "objective"; code: string; text: string }
  /*
   * The teaching apparatus of an authored course.
   *
   * These blocks are written for the course rather than lifted from a manual,
   * and every one of them carries `origin: "authored"` so the two can never be
   * confused in the record. They exist because a study manual is a set of
   * facts and a course is a set of facts arranged to be learned: the manual
   * says what static pressure is, and the course has to say why the student is
   * being told, what to hold on to, and where people get it wrong.
   */
  /** The term this topic turns on, stated once, plainly. */
  | { type: "definition"; term: string; text: string }
  /** What to carry away — the short list a reader can revise from. */
  | { type: "keypoints"; items: string[] }
  /** A worked example. `title` says whether it came from the source. */
  | { type: "example"; title?: string; text: string }
  /** Why this matters in the aeroplane, rather than in the exam. */
  | { type: "context"; text: string }
  /** The mistake people actually make here. */
  | { type: "misconception"; text: string }
  /** One sentence, if nothing else survives the week. */
  | { type: "takeaway"; text: string };

/**
 * Where a block came from.
 *
 * Source blocks are the manual's own words, carried across unchanged. Authored
 * blocks are written for this course. The distinction is kept on every block
 * so it survives in the database rather than living only in whoever built it.
 */
export type BlockOrigin = "source" | "authored";

export const BLOCK_TYPES: Array<{ type: Block["type"]; label: string }> = [
  { type: "heading", label: "Heading" },
  { type: "subheading", label: "Subheading" },
  { type: "paragraph", label: "Paragraph" },
  { type: "subitem", label: "Lettered sub-item" },
  { type: "formula", label: "Formula" },
  { type: "figure", label: "Figure" },
  { type: "objective", label: "Syllabus objective" },
  { type: "list", label: "List" },
  { type: "table", label: "Table" },
  { type: "image", label: "Image / diagram" },
  { type: "note", label: "Note / warning" },
  { type: "link", label: "Link" },
  { type: "pdf", label: "PDF or file" },
  { type: "video", label: "Video" },
];

export function emptyBlock(type: Block["type"]): Block {
  switch (type) {
    case "keypoints":
      return { type: "keypoints", items: [""] };
    case "definition":
      return { type: "definition", term: "", text: "" };
    case "list":
      return { type: "list", ordered: false, items: [""] };
    case "table":
      return { type: "table", headers: ["", ""], rows: [["", ""]] };
    case "image":
      return { type: "image", url: "", alt: "", caption: "" };
    case "note":
      return { type: "note", variant: "info", title: "", text: "" };
    case "link":
      return { type: "link", url: "", label: "" };
    case "pdf":
      return { type: "pdf", url: "", label: "" };
    case "video":
      return { type: "video", url: "", title: "" };
    default:
      return { type, text: "" } as Block;
  }
}

/** Narrows unknown JSON from the database into a block list we can render. */
export function toBlocks(value: unknown): Block[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (b): b is Block =>
      typeof b === "object" && b !== null && typeof (b as { type?: unknown }).type === "string",
  );
}

/** Plain-text preview used for chapter summaries and search later. */
export function blocksToText(blocks: Block[]): string {
  return blocks
    .map((b) => {
      if ("text" in b && b.text) return b.text;
      if (b.type === "list") return b.items.join(" ");
      if (b.type === "table") return [...b.headers, ...b.rows.flat()].join(" ");
      return "";
    })
    .join(" ")
    .trim();
}
