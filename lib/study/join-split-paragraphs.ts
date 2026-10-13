import type { Block } from "@/lib/content";

/**
 * FE-012 — rejoin sentences that the slide extractor split across paragraphs.
 *
 * Course material was extracted from presentation decks, and a line break on a
 * slide became a paragraph break here. So a single sentence can arrive as
 * several `paragraph` blocks:
 *
 *   "This category allows most aircraft"
 *   "operations under various CA rules."
 *
 * which the reader then sets as separate paragraphs, with paragraph spacing
 * between the halves. That is the "half half sentences" in the audit.
 *
 * This is presentation only. Not one character of the course text changes: the
 * fragments are concatenated with a single space and nothing is rewritten,
 * reordered, summarised or dropped. Stored content is left exactly as it is, so
 * the repair is reversible and the admin console still shows the source.
 *
 * ## Why the rule is what it is
 *
 * A paragraph that does not finish its sentence is continuing into the next
 * one. That is the idea; the rest of the conditions below exist because this
 * material is not all prose, and a rule that cannot tell a clipped table
 * heading from a trailing clause will run the two together.
 *
 * The obvious alternative — "join when the next fragment starts lowercase" —
 * is wrong on this very material. The second sentence in the example above is
 * "Aircraft used for Air Transport Operations shall be in the standard
 * category.", split as "...Air Transport" / "Operations shall be...". The
 * continuation starts with a capital O because "Air Transport Operations" is a
 * defined term. A case test would leave that sentence broken.
 *
 * Everything else here exists to keep the rule from over-reaching: only
 * paragraphs join, only to adjacent paragraphs, never across a figure or a
 * heading, and never after a colon, which introduces something rather than
 * trailing off.
 */

/** Characters that end a sentence, allowing for a closing quote or bracket. */
const ENDS_SENTENCE = /[.!?][)\]"'’”]?\s*$/;

/** A colon or semicolon introduces what follows; it is not an unfinished clause. */
const INTRODUCES = /[:;]\s*$/;

/**
 * An abbreviation at the end of a fragment ends with a full stop without ending
 * the sentence. Joining those is still correct, so they are not special-cased —
 * but a fragment that is *only* an abbreviation is left alone rather than
 * swallowed into its neighbour.
 */
const BARE_ABBREVIATION = /^(?:[A-Z]{1,5}|[A-Z][a-z]{1,3})\.$/;

/** Guard against a runaway chain if the material is unusual. */
const MAX_JOINED_LENGTH = 1200;

function isParagraph(block: Block | undefined): block is Extract<Block, { type: "paragraph" }> {
  return block?.type === "paragraph";
}

/**
 * Mid-prose means the fragment stops on a lowercase word or a comma.
 *
 * This is the guard that keeps the repair away from everything that is not
 * prose. Some of this material is flight-plan working and column data stored
 * as paragraphs — "From To CAS Temp° Alt/FL TAS", "WCA = 1°Left so, SUBTRACT
 * HDG M = 045°", "Insert the track WU to RUGVI". None of those finish a
 * sentence either, and running them together would destroy the line structure
 * that makes them readable. They end on a digit, a symbol or an abbreviation in
 * capitals; a sentence broken mid-clause ends on an ordinary word.
 */
const MID_PROSE = /[a-z],?$|,$/;

/**
 * Prose contains ordinary words. A column heading does not.
 *
 * "From To CAS Temp" is a truncated table heading and it ends on a lowercase
 * letter, so the test above alone would treat it as mid-sentence. What it does
 * not have is a word that begins in lower case — every token is a label. Real
 * prose almost cannot avoid one: "used", "for", "shall", "the".
 */
const HAS_LOWERCASE_WORD = /(^|\s)[a-z]{2,}/;

/**
 * A trailing clause is a piece of a sentence, not a two-word label. "Spd kts"
 * and "continued" both end on an ordinary lowercase word and would otherwise
 * qualify; neither is a sentence running on. Four words is the floor, which
 * errs toward leaving material alone.
 */
const MIN_WORDS = 4;

/** True when `text` reads as an unfinished sentence that continues after it. */
function looksUnfinished(text: string): boolean {
  const trimmed = text.trim();
  if (trimmed.length === 0) return false;
  if (INTRODUCES.test(trimmed)) return false;
  if (BARE_ABBREVIATION.test(trimmed)) return false;
  if (ENDS_SENTENCE.test(trimmed)) return false;
  if (!MID_PROSE.test(trimmed)) return false;
  if (trimmed.split(/\s+/).length < MIN_WORDS) return false;
  return HAS_LOWERCASE_WORD.test(trimmed);
}

/**
 * Returns the blocks with split sentences rejoined. The input is not mutated,
 * and blocks of every other type pass through untouched and in order.
 */
export function joinSplitParagraphs(blocks: Block[]): Block[] {
  const out: Block[] = [];

  for (const block of blocks) {
    const previous = out[out.length - 1];

    if (
      isParagraph(block) &&
      isParagraph(previous) &&
      looksUnfinished(previous.text) &&
      previous.text.trim().length + block.text.trim().length < MAX_JOINED_LENGTH
    ) {
      // Replace rather than mutate: `previous` is still the caller's object.
      out[out.length - 1] = {
        ...previous,
        text: `${previous.text.trim()} ${block.text.trim()}`,
      };
      continue;
    }

    out.push(block);
  }

  return out;
}

/**
 * How many joins a set of blocks would receive. Used by the audit script to
 * report which lessons were affected without rendering them.
 */
export function countJoins(blocks: Block[]): number {
  return blocks.length - joinSplitParagraphs(blocks).length;
}
