/**
 * Putting the shape back into text a 506-page PDF took out of it.
 *
 * The Aircraft Technical Knowledge source is a book rather than a lecture
 * deck, which makes it cleaner than the IR manuals in one way — the prose is
 * written to be read, not spoken — and worse in another. A PDF page has no
 * idea what a heading is. The extractor takes the first line of the page as
 * its title and hands back everything else as a flat run of text blocks, and
 * three things follow from that:
 *
 *   - Where the first line is a heading, the deck usually prints it twice: once
 *     as the heading and again as a WordArt copy, which arrives as a body
 *     paragraph shouting "REFRIGERATION ICE" in the middle of the page.
 *
 *   - Where the first line is *not* a heading — and on this deck it very often
 *     is not, because the book opens a page mid-sentence with the CAA objective
 *     it is answering — dropping it silently truncates the teaching. Page 3
 *     begins "12.2.2 State the International System (SI) and ICAO units" and
 *     the body continues "used to express: (a) distance;". The two belong to
 *     one sentence.
 *
 *   - A table is not a table. Three of them — the flight-controls summary, the
 *     ISA temperature ladder and the worked centre of gravity calculation —
 *     arrive as a run of loose cells in reading order.
 *
 * Everything here removes, rejoins or re-assembles. Nothing is rewritten:
 * every word in a rebuilt table is a word that was on the page, and where the
 * source is broken in a way that cannot be repaired without inventing text —
 * the ASI error mnemonic on page 229, whose initial letters were lifted out as
 * separate images — it is left as it is and the missing sense is supplied in
 * an authored block, which is tagged as authored and stays that way.
 */

/**
 * Labels printed beside a picture that reached the extractor as prose.
 *
 * Removed by knowing which page they came off, never by pattern: "Normal" and
 * "Piston" are perfectly good things for a sentence to say, and they are
 * dropped here only because on page 98 they are the captions under two
 * photographs of pistons that are themselves on the page.
 */
export const FIGURE_CALLOUTS = {
  40: ["AOA"],
  98: ["Normal", "Piston", "Severely", "Detonated piston"],
  305: ["LATERAL AXIS", "NORMAL AXIS", "LONGITUDINAL AXIS"],
  429: ["fitted", "Flap Levers"],
  // "IAS = ½" and nothing else: the rest of the dynamic pressure equation was
  // set as an image and rejected with the other fragments, so what is left is
  // a half-written equation. The sentence under it — "as P (density) reduces
  // away from ISA, V (TAS) increases if IAS is to remain constant" — says what
  // the equation says, in words, and it stays.
  226: ["IAS = ½"],
  // The denominator of the load factor fraction, which is put back into the
  // line above it by SUBSTITUTIONS.
  361: ["Weight"],
};

/**
 * The book's own page numbers, printed in the corner of the page.
 *
 * Chapter 22 carries them into the text as "15-1" and "15-3" — a footer, not
 * teaching, and a footer from a different chapter numbering at that.
 */
const PAGE_NUMBER = /^\s*\d{1,2}\s*-\s*\d{1,2}\s*$/;

/**
 * Tables the PDF flattened into loose cells, rebuilt from those same cells.
 *
 * Each entry names the page, the cells it consumes in the order they arrive,
 * and the grid they go back into. The builder checks that every consumed cell
 * was actually found before it uses the table, so a re-extraction that changes
 * the wording fails loudly instead of silently dropping the page's content.
 */
export const TABLES = {
  311: {
    consumes: [
      "Plane Axis Control Primary",
      "Effect",
      "Secondary",
      "Effect",
      "Pitch Lateral Elevator Pitch Nil",
      "Roll Longitudinal Ailerons Roll Yaw",
      "Yaw Normal Rudder Yaw Roll",
    ],
    headers: ["Plane", "Axis", "Control", "Primary effect", "Secondary effect"],
    rows: [
      ["Pitch", "Lateral", "Elevator", "Pitch", "Nil"],
      ["Roll", "Longitudinal", "Ailerons", "Roll", "Yaw"],
      ["Yaw", "Normal", "Rudder", "Yaw", "Roll"],
    ],
  },
  453: {
    consumes: [
      "ALTITUDE",
      "7,000 feet",
      "6,000 feet",
      "5,000 feet",
      "4,000 feet",
      "3,000 feet",
      "2,000 feet",
      "1,000 feet",
      "MEAN SEA LEVEL",
      "TEMPERATURE",
      "01°C",
      "03°C",
      "05°C",
      "07°C",
      "09°C",
      "11°C",
      "13°C",
      "15°C",
    ],
    headers: ["Altitude", "ISA temperature"],
    rows: [
      ["7,000 feet", "01°C"],
      ["6,000 feet", "03°C"],
      ["5,000 feet", "05°C"],
      ["4,000 feet", "07°C"],
      ["3,000 feet", "09°C"],
      ["2,000 feet", "11°C"],
      ["1,000 feet", "13°C"],
      ["Mean sea level", "15°C"],
    ],
  },
  500: {
    consumes: [
      "Item Weight (kg) Arm (mm)",
      "Moment (kg- mm)",
      "Basic empty weight 690 1,310 903,900",
      "Pilot and Front passenger 140 940 131,600",
      "Rear passengers 180 1,855 333,900",
      "Baggage 20 3,124 62,480",
      "Fuel 100lts @",
      "0.72 72 1420 102,240",
      "Total 1,102 1392 1,534,120",
    ],
    headers: ["Item", "Weight (kg)", "Arm (mm)", "Moment (kg-mm)"],
    rows: [
      ["Basic empty weight", "690", "1,310", "903,900"],
      ["Pilot and front passenger", "140", "940", "131,600"],
      ["Rear passengers", "180", "1,855", "333,900"],
      ["Baggage", "20", "3,124", "62,480"],
      ["Fuel 100 lts @ 0.72", "72", "1,420", "102,240"],
      ["Total", "1,102", "1,392", "1,534,120"],
    ],
  },
};

/**
 * Text the extractor broke beyond repair, cut where it stops making sense.
 *
 * Page 229 sets the ASI errors as a mnemonic — "Ice Tea, Perfect Cold Drink" —
 * with each initial letter as its own piece of WordArt beside the word it
 * begins. The letters became images and were rejected as fragments, so what is
 * left of the sentence is "ressure (position) and Instrument Error
 * ompressibility Error ensity Error". Nothing can be rejoined: the missing
 * characters are not in the text at all.
 *
 * So the broken tail is cut, the sentence that introduces the mnemonic is
 * kept, and the four errors are taught in an authored block — which is tagged
 * authored, because that is what it is. Keyed by page and matched on the exact
 * words, so a re-extraction that fixes the source stops applying it.
 */
export const BROKEN_TAILS = {
  229: ["ressure (position) and Instrument Error"],
};

/**
 * An equation the page split across its title and its first line.
 *
 * Page 14 prints the centripetal force equation as a fraction: the numerator
 * is the page's first line and therefore became the title, and the denominator
 * became the first body paragraph. Read in sequence they are two unrelated
 * fragments; put back together they are the equation the page then goes on to
 * discuss. Both source pieces are consumed.
 */
export const FORMULAS = {
  14: {
    consumesTitle: "Centripetal Force = Weight x Velocity2",
    consumes: ["Gravity x radius"],
    text: "Centripetal Force = (Weight × Velocity²) ÷ (Gravity × radius)",
  },
  // The lift formula reaches the extractor twice, and neither copy survives
  // the flattening: the page's first line loses the subscript and the
  // exponent entirely ("L = C 1/2 𝝆 V S"), and the body's copy loses the
  // spaces instead ("L = CL1/2𝝆V2S"). The legend beneath it — CL, ½, rho, V²,
  // S — is the page's own and is left exactly as it is.
  45: {
    consumesTitle: "L = C 1/2 𝝆 V S",
    consumes: ["L = CL1/2𝝆V2S"],
    text: "L = CL × ½ρV²S",
  },
};

/**
 * Typography the PDF flattened, put back.
 *
 * A PDF has no superscripts, no subscripts and no fraction bars — it has
 * glyphs at positions, and the extractor reads them in line order. So the
 * cubic metre arrives as "m3", metres per second as "ms-1", nitrogen as "N2"
 * and the pound as "1Ib", because the letter l was set in a font where it
 * looks like a capital I. None of that is the book being sloppy; all of it is
 * the format losing information the page had.
 *
 * Every rule here is mechanical: a character is replaced by the character it
 * stands for, or a space that should not be there is removed. Nothing changes
 * a word, a number or a claim. Rules that need judgement — restoring a
 * fraction bar, completing a truncated equation — are not here; they are keyed
 * to the page they belong to, below, so each one was looked at on that page
 * before it was written.
 */
const TYPOGRAPHY = [
  // The masculine ordinal indicator, and its lookalike, standing in for the
  // degree sign: "Degrees Celsius (ᵒC)", "bank angle = 17º".
  [/[ᵒº]/g, "°"],
  // Mathematical bold italic rho, which most fonts do not carry, for the rho
  // every aerodynamics text uses.
  [/\u{1D746}/gu, "ρ"],
  // The pound abbreviated with a capital I: "the pound (Ib)", "1Ib is equal".
  // The second form has no word boundary in front of it, the digit running
  // straight into the letter, so it needs its own rule.
  [/\bIb\b/g, "lb"],
  [/(\d)\s*Ib\b/g, "$1 lb"],
  // Squared and cubed units: "cubic metre (m3)", and the same run onto a
  // value with no space, "1m3 is equal to 1000l".
  [/\b(m|cm|km|ft|in)3\b/g, "$1³"],
  [/\b(m|cm|km|ft|in)2\b/g, "$1²"],
  [/(\d)(m|cm|km|ft|in)3\b/g, "$1$2³"],
  [/(\d)(m|cm|km|ft|in)2\b/g, "$1$2²"],
  // Metres per second, written with a flattened negative exponent — and often
  // with the value run straight into it, "0.514ms-1", so no leading boundary.
  [/ms-1\b/g, "ms⁻¹"],
  // Chemical subscripts.
  [/\bCO2\b/g, "CO₂"],
  [/\bH2O\b/g, "H₂O"],
  [/\bN2\b/g, "N₂"],
  [/\bO2\b/g, "O₂"],
  // The kinetic energy term.
  [/\bmv2\b/g, "mv²"],
  // A hyphenated compound the line break split: "self- contained",
  // "bi- metallic", "aero- engines".
  [/([a-z])- ([a-z])/g, "$1-$2"],
  // The same in a heading, where the book sets it with spaces either side:
  // "SKIN - FRICTION DRAG", "IDLE CUT - OFF", "PRE - IGNITION".
  [/\b([A-Z]{2,}) - ([A-Z]{2,})\b/g, "$1-$2"],
  // A space that drifted in front of its punctuation.
  [/\s+([,;.])(?=\s|$)/g, "$1"],
  // A full stop that lost the space after it: "Power.Reduced power decreases".
  [/([a-z])\.([A-Z][a-z])/g, "$1. $2"],
];

/**
 * Applies the typography rules to one string.
 *
 * Exported so that a check comparing stored text against the extracted page
 * can put the page through the same rules first — otherwise "N₂" in the
 * lesson and "N2" on the page look like different words.
 */
export function typeset(text) {
  let out = String(text);
  for (const [pattern, replacement] of TYPOGRAPHY) out = out.replace(pattern, replacement);
  return out;
}

/**
 * Fraction bars and truncations, restored one page at a time.
 *
 * A fraction printed with a bar comes out as its numerator followed by its
 * denominator, and the two read as one impossible sentence: "Velocity =
 * distance travelled in a given direction time taken". Restoring the division
 * needs someone to have looked at the page, so each of these names the page,
 * quotes the words exactly as the extractor produced them, and puts back only
 * the operator the bar stood for. No word is added, removed or reordered.
 */
export const SUBSTITUTIONS = {
  // A pointer to the next page of a book a student is not holding. The
  // sentence it hangs off is teaching and stays; the direction is furniture.
  287: [
    [
      "unlikely to be seen in GA aircraft. (See next slide)",
      "unlikely to be seen in GA aircraft.",
    ],
  ],
  9: [
    [
      "Velocity = distance travelled in a given direction time taken",
      "Velocity = distance travelled in a given direction ÷ time taken",
    ],
    [
      "Acceleration = change in velocity time taken",
      "Acceleration = change in velocity ÷ time taken",
    ],
  ],
  45: [
    // The legend keys the formula's own symbols, and the book writes the
    // squared velocity term flat there exactly as it does in the formula.
    ["V2 = TAS", "V² = TAS"],
  ],
  361: [
    ["Load Factor = Lift being generated", "Load Factor = Lift being generated ÷ Weight"],
  ],
};

const flat = (s) => String(s ?? "").replace(/\s+/g, " ").trim();
const key = (s) => flat(s).toLowerCase().replace(/[^a-z0-9]+/g, "");

/**
 * The CAA objective the book quotes before answering it.
 *
 * This source is written against the syllabus and prints the requirement it is
 * about to teach, code and all: "12.4.2 Name the principal gases which
 * constitute the atmosphere." followed by the teaching. Eighteen of them reach
 * the text, on nine pages.
 *
 * They must not reach a student. The whole point of archiving this subject's
 * syllabus was that a course teaches and a regulator's checklist does not, and
 * a course that prints "12.4.6 Explain how air density varies with altitude"
 * above the explanation has simply moved the checklist inside the lesson. The
 * teaching under it is untouched; only the quoted requirement goes.
 *
 * Every occurrence in this deck sits either alone in its block or at the end
 * of one, because the extractor breaks a line where the book breaks it — so
 * cutting from the code to the end of the block removes the objective and
 * nothing else. The build reports the count, and it is checked against the
 * eighteen known occurrences by scripts/ppl-atk-leak-scan.mjs.
 */
const OBJECTIVE_CODE = /\s*\b12\.\d{1,3}\.\d{1,2}\b/;

/**
 * The book's own chapter number, printed as part of a page heading.
 *
 * "CHAPTER 8 EXHAUST SYSTEM" is the eighth chapter of the source. It is part
 * of the ninth chapter of this course, and the course's chapters are not the
 * book's — several were split and several were merged. Printing the book's
 * number in a lesson heading contradicts the number in the navigation beside
 * it, so the number goes and the name stays.
 */
const BOOK_CHAPTER = /^(?:CHAPTER|SECTION)\s*\d+\s*/i;

/**
 * A mnemonic's initial letters, trailing off the end of a heading.
 *
 * Page 229 sets "ERROR OF ASI" and then the letters I P C C E D T beside it as
 * separate pieces of WordArt, for the mnemonic "Ice Tea, Perfect Cold Drink".
 * The extractor reads them as the tail of the heading. Three or more single
 * letters in a row is the signal; two could be a legitimate abbreviation.
 */
const TRAILING_INITIALS = /(?:\s+[A-Z]){3,}\s*$/;

function stripObjectives(blocks, { titleObjectiveOpen = false } = {}) {
  const out = [];
  let stripped = 0;
  // An objective that does not end in a full stop is finished on the next
  // line, and that line is left behind as a fragment when the objective goes:
  // page 20 quotes "12.4.12 Explain the basis for the International Standard"
  // and the body continues "Atmosphere (ISA)." Dropping the code alone leaves
  // a lesson opening on the word "Atmosphere". The continuation is short by
  // nature — the objectives here run onto a second line, not a second
  // paragraph — so only a short block is taken, and only immediately after an
  // objective that was left open.
  let expectContinuation = titleObjectiveOpen;
  const CONTINUATION_LIMIT = 80;

  for (const block of blocks) {
    if (block.kind !== "text") {
      out.push(block);
      expectContinuation = false;
      continue;
    }
    const at = block.text.search(OBJECTIVE_CODE);
    if (at === -1) {
      if (expectContinuation && flat(block.text).length <= CONTINUATION_LIMIT) {
        stripped += 1;
        expectContinuation = false;
        continue;
      }
      expectContinuation = false;
      out.push(block);
      continue;
    }
    stripped += 1;
    const kept = block.text.slice(0, at).trim();
    const objective = flat(block.text.slice(at));
    expectContinuation = !kept && !/[.!?]$/.test(objective);
    if (kept) out.push({ ...block, text: kept });
  }
  return { blocks: out, stripped };
}

/**
 * The bullet the book actually used, which is not a bullet character.
 *
 * The list glyphs in this deck are Wingdings, and a Wingdings glyph has no
 * Unicode meaning: it arrives as U+F084, a private use codepoint that renders
 * as nothing at all — or as a tofu box — in any font a browser has. 507 of the
 * deck's 1,636 text blocks begin with one, which is to say a third of this
 * subject is written as lists and none of it looked like a list.
 *
 * Two things follow. Each glyph starts a list item, so a block beginning with
 * one is an item rather than a paragraph; and where the extractor ran two
 * items together, the glyph in the middle is where the second one begins.
 */
/**
  * Deliberately not a global regex. A global one carries `lastIndex` between
  * calls to `.test()`, so testing block after block starts each search where
  * the previous match ended and misses a bullet at the top of the next block.
  * That left a third of the deck's list glyphs in the text, rendering as tofu.
  */
const BULLET = /[-➢•]/;
const BULLET_SPLIT = /[-➢•]/g;

/**
 * Splits blocks on their bullet glyphs and marks the pieces as list items.
 *
 * Text before the first glyph keeps its level: it is the sentence the list
 * hangs off ("Other contributing factors are:"), not part of the list.
 */
function restoreBullets(blocks) {
  const out = [];
  let restored = 0;
  for (const block of blocks) {
    if (block.kind !== "text" || !BULLET.test(block.text)) {
      out.push(block);
      continue;
    }
    const pieces = block.text.split(BULLET_SPLIT);
    const lead = flat(pieces[0]);
    if (lead) out.push({ ...block, text: lead });
    for (const piece of pieces.slice(1)) {
      const text = flat(piece);
      if (!text) continue;
      out.push({ ...block, level: Math.max(1, block.level ?? 0), text });
      restored += 1;
    }
  }
  return { blocks: out, restored };
}

/** The page number the book printed in the corner, when it reached the title. */
const TRAILING_PAGE_NUMBER = /\s+\d{1,2}\s*-\s*\d{1,2}\s*$/;

/**
 * Is this page's first line a heading, or the first half of a sentence?
 *
 * The test that decides it is whether the deck repeated the line as WordArt
 * further down the page. That repetition is the source itself saying "this is
 * a heading", and it is far more reliable than any rule about capitals or
 * length — the book has headings in title case and sentences in capitals.
 */
function findEcho(title, blocks) {
  const want = key(title);
  if (!want) return null;

  // The echo can arrive whole, or split across two or three blocks the way the
  // heading was set on two or three lines.
  for (let i = 0; i < blocks.length; i += 1) {
    if (blocks[i].kind !== "text") continue;
    let joined = "";
    const used = [];
    for (let j = i; j < blocks.length && j < i + 4; j += 1) {
      if (blocks[j].kind !== "text") break;
      joined += key(blocks[j].text);
      used.push(j);
      if (joined === want) return used;
      if (!want.startsWith(joined)) break;
    }
  }
  return null;
}

/**
 * Sentences the page break cut in half.
 *
 * A PDF text frame ends where the layout ended it, not where the sentence did,
 * so a paragraph arrives as "This will upset the mixture in the" followed by
 * "Carburettor and can result in rough running." Two signals identify the
 * halves, and either is enough: the second piece opens in lower case, or the
 * first piece stops on a word no sentence can end on.
 *
 * That second test is deliberately a closed list of function words rather than
 * "has no full stop at the end". Page 52 lists the three things skin friction
 * drag depends on — "The surface area", "Roughness of the surface", "Airspeed"
 * — and not one of them ends in punctuation either. A line ending "in the" is
 * a sentence cut in half; a line ending "area" is an item in a list.
 *
 * Only consecutive body paragraphs are considered. A list item is left alone,
 * and so is anything with a picture between it and its neighbour.
 */
const DANGLING = new Set([
  "a", "an", "the", "and", "or", "but", "if", "of", "to", "in", "on", "at", "for", "with",
  "from", "by", "as", "into", "onto", "than", "then", "that", "which", "this", "these",
  "those", "it", "its", "is", "are", "was", "were", "be", "been", "being", "has", "have",
  "had", "do", "does", "did", "will", "can", "may", "must", "should", "would", "could",
  "more", "most", "less", "least", "up", "down", "over", "under", "between", "during",
  "per", "about", "above", "below", "after", "before", "when", "where", "while", "any",
  "each", "both", "not", "no", "so", "such", "their", "his", "her", "our", "your", "we",
  "they", "he", "she", "you", "off", "out", "via", "upon", "without", "along", "across",
  "through", "around", "near", "until", "since", "unless", "though", "although",
  "whether", "either", "neither",
]);
function rejoinLines(blocks) {
  const out = [];
  let joined = 0;
  for (const block of blocks) {
    const previous = out[out.length - 1];
    // The continuation is always a plain line — the layout broke it off, so it
    // carries no bullet of its own — but what it continues may well be a list
    // item, and on this deck it usually is.
    const isBody = block.kind === "text" && (block.level ?? 0) === 0;
    const followsText = previous && previous.kind === "text";
    if (isBody && followsText) {
      const before = flat(previous.text);
      const after = flat(block.text);
      const lastWord = (before.match(/([A-Za-z']+)\s*$/) ?? [])[1] ?? "";
      const firstWord = (after.match(/^([A-Za-z']+)/) ?? [])[1] ?? "";
      const closed = /[.:;!?"”)]$/.test(before);
      const unfinished = !closed && DANGLING.has(lastWord.toLowerCase());
      const continues = /^[a-z]/.test(after);
      // "…divide by 10 (or drop the last 0) to get" + "10, add 7, so bank
      // angle = 17°". A line opening with a bare number and a comma is the
      // rest of the sentence above it; a list item would open "10." or "(10)".
      const continuesNumber = /^\d+,/.test(after);
      // A line that stops on a comma, a dash or a slash is not a sentence that
      // ended; it is a line that ran out of width.
      const dangles = /[,–—/&-]$/.test(before);
      // A name broken across the line break: "a faulty Pressure Relief" +
      // "Valve", "Ring Laser" + "Gyro", "Electronic Flight Information" +
      // "System". Both halves are capitalised mid-phrase and the first does not
      // close. Shouted lines are excluded — those are the book's headings, and
      // joining one onto the sentence under it would bury it.
      const nameSplit =
        !closed &&
        /^[A-Z]/.test(lastWord) &&
        /^[A-Z]/.test(firstWord) &&
        !isShouted(before) &&
        !isShouted(after);
      if ((unfinished || continues || continuesNumber || dangles || nameSplit) && after) {
        out[out.length - 1] = { ...previous, text: `${before} ${after}` };
        joined += 1;
        continue;
      }
    }
    out.push(block);
  }
  return { blocks: out, joined };
}

/**
 * The lists the book introduces with a colon and then forgets to mark.
 *
 * "The magnitude of the skin-friction drag depends on:" is followed by "The
 * surface area", "Roughness of the surface", "Airspeed" — three items with no
 * bullet glyph on any of them, which reach the page as three separate
 * paragraphs and read as three unfinished sentences. Two conditions keep this
 * safe: the run must follow a line that ends in a colon, and it must be at
 * least two short lines long. A single short paragraph after a colon is a
 * sentence, not a list.
 */
function restoreColonLists(blocks) {
  const out = blocks.map((b) => ({ ...b }));
  const SHORT = 60;
  let restored = 0;
  for (let i = 0; i < out.length; i += 1) {
    const lead = out[i];
    if (lead.kind !== "text" || !/:$/.test(flat(lead.text))) continue;
    const run = [];
    for (let j = i + 1; j < out.length; j += 1) {
      const next = out[j];
      if (next.kind !== "text" || (next.level ?? 0) !== 0) break;
      if (flat(next.text).length > SHORT) break;
      run.push(j);
    }
    if (run.length < 2) continue;
    for (const j of run) out[j] = { ...out[j], level: 1 };
    restored += run.length;
    i = run[run.length - 1];
  }
  return { blocks: out, restored };
}

/**
 * Is this line set in the capitals the book reserves for headings?
 *
 * The book is consistent about it: headings are shouted, prose is not. That
 * makes a run of capitals the second piece of evidence — alongside the WordArt
 * echo — that the first line of a page is a heading rather than the opening
 * half of a sentence, and it is what stops the same heading being a heading on
 * one page and a paragraph on the next because only one of them was echoed.
 */
function isShouted(text) {
  const letters = String(text).replace(/[^A-Za-z]/g, "");
  if (letters.length < 3) return false;
  const capitals = letters.replace(/[^A-Z]/g, "").length;
  return capitals / letters.length >= 0.8;
}

/**
 * The heading again, this time stuck on the end of the last paragraph.
 *
 * The WordArt copy of the heading is placed low on the page, so where the last
 * paragraph runs to the bottom the extractor reads the two as one text frame
 * and the page ends "...it is advisable to have the engine checked in this
 * case. ROUGH RUNNING". Cut on the normalised text so that a heading set as
 * "PRE - IGNITION" still matches the copy that arrives as "PRE IGNITION".
 */
function stripTrailingEcho(text, title) {
  const want = key(title);
  if (!want) return null;

  const marks = [];
  const lower = text.toLowerCase();
  for (let i = 0; i < text.length; i += 1) {
    if (/[a-z0-9]/.test(lower[i])) marks.push(i);
  }
  const normalised = marks.map((i) => lower[i]).join("");
  if (normalised.length <= want.length) return null;
  if (!normalised.endsWith(want)) return null;

  // Cut at the first character of the echo and keep the paragraph's own
  // punctuation exactly as it was; nothing is added back.
  const cut = marks[normalised.length - want.length];
  const kept = text.slice(0, cut).trimEnd();
  if (!kept) return null;

  // Guard against cutting a sentence that merely ends in the same words. Page
  // 142's heading is "ROUGH RUNNING" and its first line is "Several things can
  // cause rough running:" — which ends with the heading and is not it. What
  // distinguishes the real echo is that it starts a new sentence and arrives
  // in the WordArt's capitals.
  const suffix = text.slice(cut).trim();
  const shouted = suffix === suffix.toUpperCase();
  if (!shouted && !/[.:!?]$/.test(kept)) return null;
  return kept;
}

/**
 * Repairs one page.
 *
 * Returns the blocks to build the page from and a count of what was done, so
 * the build summary can report repairs rather than performing them silently.
 */
export function repairPage(blocks, { pageTitle, topicTitle, page } = {}) {
  const counts = {
    echoes: 0, headings: 0, joined: 0, callouts: 0,
    footers: 0, tables: 0, formulas: 0, bullets: 0, objectives: 0,
  };
  // The first line of a page is often the objective itself, and the title is
  // taken from the first line. Cutting it here means it is never joined onto
  // the teaching below it.
  const rawTitle = flat(pageTitle).replace(TRAILING_PAGE_NUMBER, "");
  // The bullet glyph comes off first. The first line of a page can be a list
  // item, and then the title carries the Wingdings glyph the rest of the
  // repair strips out of the body — left in, it reaches the page as a tofu box
  // at the start of a paragraph, and it also sits between the start of the
  // string and the objective code, which made the objective look like the
  // second thing on the line rather than the whole of it.
  const titleBulleted = BULLET.test(rawTitle);
  const plainTitle = flat(rawTitle.split(BULLET_SPLIT).join(" "));
  const titleAt = plainTitle.search(OBJECTIVE_CODE);
  const title = flat(
    (titleAt === -1 ? plainTitle : plainTitle.slice(0, titleAt))
      .replace(BOOK_CHAPTER, "")
      .replace(TRAILING_INITIALS, ""),
  );
  // The page's first line was the objective and nothing else, and it did not
  // finish there — so the line under it finishes it and is no more teaching
  // than the objective was.
  const titleObjectiveOpen =
    titleAt !== -1 && !title && !/[.!?]$/.test(plainTitle.slice(titleAt).trim());

  /* ---- the lists the Wingdings bullets hid ------------------------------- */
  const bullets = restoreBullets(blocks.map((b) => ({ ...b })));
  counts.bullets += bullets.restored;

  let out = bullets.blocks;

  /* ---- the equation split between title and body ------------------------ */
  const formula = FORMULAS[page];
  let titleConsumed = false;
  if (formula && flat(formula.consumesTitle) === title) {
    const wanted = new Set(formula.consumes.map(key));
    const before = out.length;
    out = out.filter((b) => !(b.kind === "text" && wanted.has(key(b.text))));
    if (before - out.length === formula.consumes.length) {
      out.unshift({ kind: "formula", text: formula.text });
      counts.formulas += 1;
      titleConsumed = true;
    } else {
      // The page no longer says what this repair was written against.
      throw new Error(`page ${page}: the formula repair no longer matches the source`);
    }
  }

  /* ---- the deck's own page numbers -------------------------------------- */
  const withoutFooters = out.filter((b) => !(b.kind === "text" && PAGE_NUMBER.test(b.text)));
  counts.footers += out.length - withoutFooters.length;
  out = withoutFooters;

  /* ---- labels lifted off a picture -------------------------------------- */
  const callouts = FIGURE_CALLOUTS[page];
  if (callouts) {
    const wanted = new Set(callouts.map(key));
    const kept = out.filter((b) => !(b.kind === "text" && wanted.has(key(b.text))));
    counts.callouts += out.length - kept.length;
    out = kept;
  }

  /* ---- a flattened table ------------------------------------------------- */
  const table = TABLES[page];
  if (table) {
    const wanted = new Set(table.consumes.map(key));
    const found = out.filter((b) => b.kind === "text" && wanted.has(key(b.text))).length;
    if (found !== table.consumes.length) {
      throw new Error(
        `page ${page}: the table repair expects ${table.consumes.length} cells and the source now has ${found}`,
      );
    }
    const at = out.findIndex((b) => b.kind === "text" && wanted.has(key(b.text)));
    out = out.filter((b) => !(b.kind === "text" && wanted.has(key(b.text))));
    out.splice(at, 0, { kind: "grid", headers: table.headers, rows: table.rows });
    counts.tables += 1;
  }

  /* ---- the regulator's own words, quoted by the book -------------------- */
  const objectives = stripObjectives(out, { titleObjectiveOpen });
  counts.objectives += objectives.stripped;
  out = objectives.blocks;

  /* ---- the sentences the page break cut in half -------------------------
   * After the repairs above, so that a cell of a rebuilt table or a label
   * lifted off a picture is never swallowed into the paragraph beside it.
   */
  const rejoined = rejoinLines(out);
  counts.joined += rejoined.joined;
  out = rejoined.blocks;

  /* ---- text broken beyond rejoining -------------------------------------- */
  for (const tail of BROKEN_TAILS[page] ?? []) {
    out = out.map((b) => {
      if (b.kind !== "text") return b;
      const at = b.text.indexOf(tail);
      if (at === -1) return b;
      counts.callouts += 1;
      return { ...b, text: b.text.slice(0, at).trim() };
    }).filter((b) => b.kind !== "text" || flat(b.text));
  }

  /* ---- fraction bars, restored where the page was looked at -------------- */
  for (const [from, to] of SUBSTITUTIONS[page] ?? []) {
    out = out.map((b) =>
      b.kind === "text" && b.text.includes(from)
        ? { ...b, text: b.text.replace(from, to) }
        : b,
    );
  }

  /* ---- the lists a colon introduces and nothing marks ------------------- */
  const colonLists = restoreColonLists(out);
  counts.bullets += colonLists.restored;
  out = colonLists.blocks;

  /* ---- a heading left behind when the title was consumed ----------------
   * Page 45's first line is the lift formula, so the formula repair takes the
   * title and the heading step below never runs. The line under it —
   * "VARIATION OF LIFT WITH SPEED" — is the page's real heading, and without
   * this it stays a paragraph shouting in the middle of the lesson.
   */
  if (titleConsumed) {
    const at = out.findIndex((b) => b.kind === "text");
    if (at > -1) {
      const candidate = flat(out[at].text);
      if (isShouted(candidate) && candidate.split(/\s+/).length <= 8) {
        out.splice(at, 1);
        out.unshift({ kind: "heading", text: candidate });
        counts.headings += 1;
      }
    }
  }

  /* ---- the heading, said twice, or the sentence said once ---------------- */
  if (title && !titleConsumed) {
    // The heading run onto the end of a paragraph, which is the same echo in a
    // form findEcho cannot see because it is not a block of its own.
    let trailing = false;
    for (let i = 0; i < out.length; i += 1) {
      if (out[i].kind !== "text") continue;
      const kept = stripTrailingEcho(out[i].text, title);
      if (kept === null) continue;
      out[i] = { ...out[i], text: kept };
      counts.echoes += 1;
      trailing = true;
    }

    const echo = findEcho(title, out);
    if (echo || trailing || isShouted(title)) {
      // The source marked this line as a heading by printing it again. Keep one
      // of them, as a heading rather than as a shouted paragraph.
      if (echo) {
        out = out.filter((_, i) => !echo.includes(i));
        counts.echoes += echo.length;
      }
      // At the top of the page, wherever the WordArt copy happened to sit. It
      // is the page's heading: the extractor found it on the first line, and
      // the copy was placed low down for the look of the slide.
      const heading = title;
      if (heading && key(heading) !== key(topicTitle)) {
        out.unshift({ kind: "heading", text: heading });
        counts.headings += 1;
      }
    } else {
      // Not a heading: the first line of a sentence whose rest is below it.
      const level = titleBulleted ? 1 : 0;
      const at = out.findIndex((b) => b.kind === "text");
      if (at === -1) {
        out.unshift({ kind: "text", level, text: title });
      } else if (/[.:;!?]$/.test(title) || /^[A-Z0-9(]/.test(flat(out[at].text))) {
        // Both halves stand on their own; put the first line back above the
        // second rather than running two sentences together.
        out.splice(at, 0, { kind: "text", level, text: title });
      } else {
        out[at] = { ...out[at], text: `${title} ${flat(out[at].text)}` };
        counts.joined += 1;
      }
    }
  }

  /* ---- superscripts, subscripts and the spaces that drifted -------------
   * Last, so that every earlier repair matched the text the extractor
   * actually produced. A rule that ran before this one would be looking for
   * "m3" in a string that had already become "m³".
   */
  out = out.map((b) => {
    if (b.kind === "grid") {
      return {
        ...b,
        headers: (b.headers ?? []).map(typeset),
        rows: (b.rows ?? []).map((row) => row.map(typeset)),
      };
    }
    if (typeof b.text !== "string") return b;
    return { ...b, text: typeset(b.text) };
  });

  return { blocks: out, counts };
}
