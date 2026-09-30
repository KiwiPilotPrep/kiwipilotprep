/**
 * Putting the shape back into text a slide deck took out of it.
 *
 * The CPL decks come from PowerPoint rather than from a PDF, so they arrive in
 * better condition than the IR manuals did: a text frame is one block, a bullet
 * level is recorded, and a native table survives as a table. What PowerPoint
 * does instead is scatter. A diagram is assembled by dropping a picture down
 * and typing labels around it, and every one of those labels reaches the
 * extractor as an ordinary paragraph, indistinguishable from prose. Read in
 * order, slide 113 tells a student:
 *
 *     At a ground speed of 150kt, how far will you travel in 30mins?
 *     ...
 *     Answer: 75 kt
 *     150 kt
 *     30 min
 *     60 min
 *
 * The last four of those are not sentences. They are the numbers written beside
 * the flight computer in the photograph, and the photograph is on the page.
 *
 * Everything here removes or rejoins. Nothing rewrites: where a fact needs
 * explaining rather than repairing, it is explained in an authored block, which
 * is tagged as authored and stays that way.
 */

/**
 * Talk addressed to a classroom rather than to a reader.
 *
 * These decks were written to be presented. A line telling the instructor to
 * demonstrate something is a real instruction to a real person, but not to the
 * person reading this course at home, and left in it reads as a broken promise.
 * The surrounding teaching stays; only the aside goes.
 */
export const CLASSROOM_ASIDES = [
  /^\s*(?:the\s+)?instructor(?:\s+will)?\s+to\s+demonstrate.*$/i,
  /^\s*instructor\s+to\s+demonstrate.*$/i,
  /^\s*instructor\s+will\s+demonstrate.*$/i,
  /^\s*student\s+to\s+demonstrate.*$/i,
  /^\s*see\s+diagram\s+next\s+page\.?\s*$/i,
  /^\s*you\s+can\s+see\s+from\s+the\s+diagram\s+on\s+the\s+next\s+page.*$/i,
];

/** The same, but embedded at the end of a sentence rather than standing alone. */
export const TRAILING_ASIDES = [
  /,?\s*instructor to demonstrate(?: if needed)?\.?$/i,
  /\s*Instructor will demonstrate how to fully prepare a chart\.?$/i,
];

/**
 * Slide-master footers that the extractor read as body text.
 *
 * The Principles of Flight deck was assembled by copying slides out of a
 * CPL(H) deck and a PPL technical knowledge deck into a CPL(A) one, and nobody
 * updated the footers afterwards. They are furniture in the literal sense —
 * printed in the corner of the slide, not addressed to the reader — and they
 * are the reason eighteen topics in the old course were named "Slide No.
 * 44PPL Air Technical Knowledge".
 *
 * Reading the slides they sit on shows the teaching itself is sound and
 * belongs where it is: aerofoil terminology captioned "Aeroplane Wing", the
 * lift equation, profile drag, the boundary layer, rate-one turns. So the
 * footer is removed and the slide is kept.
 */
// The PDF conversion sometimes interleaves the footer with labels lifted off a
// diagram, so the deck name arrives truncated: "Slide No. 65Principles of
// Flight and Aircraft rotates Lift". The deck-name part is therefore optional
// and matched as far as it goes — what always identifies the furniture is
// "Slide No." followed by a number.
const SLIDE_FOOTER =
  /Slide No\.?\s*\d+\s*(?:PPL Air Technical Knowledge|Principles of Flight and Aircraft(?:\s*Performance)?(?:\s*\([AH]\))?)?/gi;

/**
 * A bare web address on a slide.
 *
 * Slide 129 links a third-party flight-computer simulator. It may or may not
 * still resolve, it is not KiwiPilotPrep's, and a raw URL in the middle of a
 * paragraph is not something a reader can use. The teaching around it stays.
 */
const BARE_URL = /^\s*https?:\/\/\S+\s*$/i;

/**
 * Diagram labels, listed per slide, that the extractor emitted as prose.
 *
 * Each of these is a word or number printed next to a picture on the slide it
 * belongs to. They are not removed by pattern, because "60 min" is a perfectly
 * good thing for a sentence to say — they are removed by knowing which slide
 * they came off, which is why every entry is keyed by slide number and was
 * checked against that slide.
 */
export const FIGURE_CALLOUTS = {
  // Keyed "<deck>:<slide>", the same as the tables below. Slide numbers repeat
  // across six decks, so a bare number would strip a label off the wrong deck.

  /* ================= Flight Navigation General ========================== */
  // The flight computer worked examples: the values written on the wheel.
  "cpl-navigation:110": ["Temp -10", "CAS 120", "PA 7000"],
  "cpl-navigation:111": ["4.28", "Answer: 21.4"],
  "cpl-navigation:112": ["Answer: 7"],
  "cpl-navigation:113": ["Answer: 75 kt", "150 kt", "30 min", "60 min"],
  "cpl-navigation:114": ["Answer: 112 nm", "60 min", "15 min", "28 nm"],
  "cpl-navigation:115": ["112 kt", "10 min", "Answer:", "18.6 nm"],
  "cpl-navigation:116": ["Answer: 10.5 litres", "14 min", "60 min", "45 litres"],
  "cpl-navigation:117": ["Answer: 65 litres", "34 mins", "12 mins", "23 litres"],
  "cpl-navigation:118": ["67 litres", "Answer: 212 mins (3 hrs 32 mins)", "60 mins", "19 litres/hour"],
  "cpl-navigation:119": ["20°C", "0°C", "68°F", "32°F"],
  "cpl-navigation:120": ["90 NM", "166 KM"],
  "cpl-navigation:122": ["110 lbs", "50Kg", "1 Kg", "2.2 lbs"],
  "cpl-navigation:123": ["6.6 IMP Gal", "7.9 US Gal", "30 litres"],
  "cpl-navigation:126": ["Answer: 107.6 Kg", "40 US Gal", "1 US Gal", "2.69 Kg"],
  // The 1 in 60 worked example: the distances written on the drawing.
  "cpl-navigation:159": ["Distance Off: 10 nm", "Track Error = 12°", "60 nm", "Distance Gone: 50 nm"],
  "cpl-navigation:161": ["B", "A"],
  // The equi-time point worked examples: the terms written on the wheel.
  "cpl-navigation:216": ["2.27", "3.95", "6.7", "3.1", "3.68", "2.03", "3.64", "1.99", "8.1", "3.36"],
  "cpl-navigation:220": ["H 170 kt", "O + H 300 kt", "Distance 450 nm", "ETP 255 nm", "= 76500"],
  "cpl-navigation:223": ["170 kt", "106 mins", "302 nm"],
  // The magnetic-bearing conversion drawing.
  "cpl-navigation:35": ["20°E Variation"],
  // Two labels naming the ends of a diagram that is not on the slide.
  "cpl-navigation:89": ["North Pole", "South Pole"],

  /* ================= CPL Air Law ======================================== */
  // An editing note the author left on a diagram slide.
  "cpl-air-law:265": ["REPLACE"],
  // Chart-symbol labels printed beside the transponder airspace diagram.
  "cpl-air-law:198": ["D", "TM"],
};

/**
 * Tables the slide flattened into a run of lines.
 *
 * Only reconstructed where the slide's own layout makes the grid unambiguous —
 * a header row and a fixed number of columns per line. Values are copied, never
 * computed: `consumes` lists the exact lines the table replaces, so if the
 * source text ever changes the repair stops matching and is skipped rather than
 * silently attaching a stale table to a page.
 */
export const FLATTENED_TABLES = {
  // Slide 194: the GA forecast winds and temperatures for the worked flight
  // plan, printed as two columns of "direction/speed temperature" per level.
  "cpl-navigation:194": {
    headers: ["Level", "WR–Kaikohe", "Kaikohe–KT"],
    rows: [
      ["3000 ft", "225/05  +12°", "230/15  +14°"],
      ["5000 ft", "210/12  +9°", "210/16  +10°"],
      ["7000 ft", "200/18  +5°", "200/23  +5°"],
      ["9000 ft", "190/24  +2°", "200/30  +1°"],
    ],
    consumes: [
      "WR-Kaikohe Kaikohe-KT",
      "3000ft 225/05 +12° 230/15 +14°",
      "5000ft 210/12 +9° 210/16 +10°",
      "7000ft 200/18 +5° 200/23 +5°",
      "9000ft 190/24 +2° 200/30 +1°",
    ],
  },

  // Slide 40: the airspeed chain. The slide draws IAS → CAS → EAS → TAS as a
  // column of boxes with the correction between each pair written alongside,
  // and the text layer returns the boxes and the corrections interleaved one
  // character group at a time: "AS", "P", "ressure and instrument error", "C",
  // "AS", and so on. The chain is unambiguous; the fragments are unreadable.
  "cpl-navigation:40": {
    headers: ["From", "Correct for", "Gives"],
    rows: [
      ["IAS", "Pressure and instrument error", "CAS"],
      ["CAS", "Compressibility error", "EAS"],
      ["EAS", "Density error", "TAS"],
      ["TAS", "Wind", "Ground speed"],
    ],
    consumes: [
      "AS", "P", "ressure and instrument error", "C", "AS", "C",
      "ompressibility error", "E", "AS", "D", "ensity error", "T", "AS",
      "Wind", "Ground Speed",
    ],
  },

  // Slide 100: a scale calculation set as a fraction. The text layer returns
  // the numerator and the denominator as two consecutive lines, so the reader
  // gets "1 = 12 cm" followed by "250,000 ?cm" — neither a sentence nor a sum.
  // Laid out as the ratio it actually is, it reads.
  "cpl-navigation:100": {
    headers: ["", "Chart length", "Earth distance"],
    rows: [
      ["The scale", "1", "250,000"],
      ["This question", "12 cm", "? cm"],
    ],
    consumes: ["1 = 12 cm", "250,000 ?cm"],
  },

  // Slide 34: the bearing conversion chain, drawn as a flow of boxes.
  "cpl-navigation:34": {
    headers: ["Step", "Apply", "Gives"],
    rows: [
      ["Aircraft heading", "+ relative bearing", "True bearing TO (TBT)"],
      ["True bearing TO", "± 180°", "True bearing FROM (TBF)"],
    ],
    consumes: ["HDG", "+RB", "TBT", "+/- 180", "TBF"],
  },
};

/** A rule drawn with underscores or dashes, left over from a slide's layout. */
function isDrawnRule(text) {
  return /^[_\-–—\s]{4,}$/.test(text.trim());
}

/**
 * A label with nothing attached to it.
 *
 * Short, all upper case or ending in a colon, and carrying no sentence. On a
 * slide it headed something; in a stream of paragraphs it heads nothing.
 */
function isStrayLabel(text) {
  const t = text.trim();
  if (!t || t.length > 22) return false;
  if (/^[A-Z]{2,6}(?:\s*[/+-]\s*[A-Z]{2,6})*$/.test(t)) return true;
  if (/^[+-]?\s*\d{1,3}\s*°?$/.test(t)) return true;
  return false;
}

/** Comparable form of a heading, so an echo of it can be recognised. */
function shapeOf(text) {
  return (text ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "");
}

/**
 * A block that continues the sentence in the block before it.
 *
 * PowerPoint breaks a sentence wherever the text box ended, so "A Relative
 * Bearing is the bearing" / "of an object measured" / "CLOCKWISE in degrees
 * from the" / "nose of an aircraft." arrives as four blocks. Rejoining is safe
 * only when the previous block clearly did not finish: it ends on a word that
 * cannot end a sentence, and the next one does not start like a new one.
 */
const DANGLING = new Set(
  ("the a an of to in on at for with and or but is are was were be by from that " +
   "which when if as than then into onto per via each its their this these those " +
   "not no any all both either neither between among against about above below " +
   "over under during before after").split(" "),
);

function isUnfinished(text) {
  const t = text.trim();
  if (!t) return false;
  // A line that stops on an equals sign has had its answer put in the next text
  // box: "a 6kt difference in 2000 ft =" / "1.5 kt per 500 ft."
  if (/=\s*$/.test(t)) return true;
  // Air law is written as lists whose items end "; or" and "; and". Those are
  // complete items with a conjunction attached, not sentences cut in half, and
  // joining them turns a list of alternatives into one unreadable paragraph.
  if (/[;,]\s*(?:and|or)$/i.test(t)) return false;
  if (/[.!?:;)\]]$/.test(t)) return false;
  const last = t.split(/\s+/).pop().toLowerCase().replace(/[^a-z]/g, "");
  return DANGLING.has(last);
}

/**
 * Can this block be the rest of the sentence before it?
 *
 * The gate that matters is `isUnfinished`, which is deliberately strict: the
 * previous block has to end on a preposition, article or conjunction, which no
 * finished sentence and almost no bullet does. Once that holds, what follows is
 * the rest of it whatever it starts with — "Kaitaia airfield (NZKT)." begins
 * with a capital and is still the end of "...from Whangarei airfield (NZWR) to".
 *
 * The one thing that is never a continuation is another label: a line ending in
 * a colon introduces what comes after it rather than completing what came
 * before.
 */
function isContinuation(text) {
  const t = text.trim();
  if (!t) return false;
  if (/:$/.test(t)) return false;
  return true;
}

/**
 * Repairs one slide's blocks.
 *
 * Returns the repaired blocks and a count of what was done, so the build can
 * report how much repair a subject needed rather than leaving it invisible.
 */
export function repairPage(blocks, { pageTitle, topicTitle, deck, page } = {}) {
  const counts = { asides: 0, joined: 0, callouts: 0, echoes: 0, strays: 0, tables: 0, urls: 0, labelled: 0, footers: 0 };
  const headings = new Set([shapeOf(pageTitle), shapeOf(topicTitle)].filter(Boolean));

  /* ---- 1. tables the slide flattened into lines ------------------------ */
  let input = blocks;
  const table = FLATTENED_TABLES[`${deck}:${page}`];
  if (table) {
    const consumes = new Set(table.consumes.map((t) => t.trim()));
    const rebuilt = [];
    const seen = new Set();
    let placed = false;
    for (const block of input) {
      if (block.kind === "text" && consumes.has(block.text.trim())) {
        // A fragment may legitimately occur more than once — the airspeed chain
        // on slide 40 emits "AS" three times, once per box — so what is checked
        // is that every declared line was found, not how many times.
        seen.add(block.text.trim());
        if (!placed) {
          rebuilt.push({ kind: "grid", headers: table.headers, rows: table.rows });
          placed = true;
        }
        continue;
      }
      rebuilt.push(block);
    }
    // A repair that matched only part of what it claims to replace is pointing
    // at text that has changed. Leaving the slide alone beats attaching a table
    // to it that no longer describes it.
    if (placed && seen.size === consumes.size) {
      input = rebuilt;
      counts.tables += 1;
    }
  }

  /* ---- 2. diagram labels the extractor read as prose ------------------- */
  const callouts = new Set((FIGURE_CALLOUTS[`${deck}:${page}`] ?? []).map((t) => t.trim()));
  if (callouts.size) {
    const kept = input.filter(
      (block) => !(block.kind === "text" && callouts.has(block.text.trim())),
    );
    counts.callouts += input.length - kept.length;
    input = kept;
  }

  /* ---- 3. classroom asides, URLs, drawn rules, stray labels ------------ */
  let work = [];
  for (const block of input) {
    if (block.kind !== "text") { work.push(block); continue; }
    let text = block.text.replace(/\s+/g, " ").trim();
    if (!text) continue;

    if (SLIDE_FOOTER.test(text)) {
      SLIDE_FOOTER.lastIndex = 0;
      text = text.replace(SLIDE_FOOTER, " ").replace(/\s+/g, " ").trim();
      counts.footers += 1;
      if (!text) continue;
    }
    SLIDE_FOOTER.lastIndex = 0;
    if (CLASSROOM_ASIDES.some((p) => p.test(text))) { counts.asides += 1; continue; }
    if (BARE_URL.test(text)) { counts.urls += 1; continue; }
    for (const trailing of TRAILING_ASIDES) {
      if (trailing.test(text)) { text = text.replace(trailing, "").trim(); counts.asides += 1; }
    }
    if (!text) continue;
    if (isDrawnRule(text)) { counts.strays += 1; continue; }
    if (isStrayLabel(text)) { counts.strays += 1; continue; }

    work.push({ ...block, text });
  }

  /* ---- 4. the slide heading, also emitted as body text ----------------- */
  const textCount = work.filter((b) => b.kind === "text").length;
  if (textCount > 1) {
    work = work.filter((block) => {
      if (block.kind !== "text") return true;
      if (!headings.has(shapeOf(block.text))) return true;
      counts.echoes += 1;
      return false;
    });
  }

  /* ---- 5. a label and the definition indented under it ----------------- */
  // "The Nautical Mile:" at the top level with its definition as a sub-bullet
  // is a definition list that lost its shape on the way out of PowerPoint.
  // Pairing them back gives the reader a labelled entry instead of a colon
  // hanging over a bullet.
  //
  // Air Law writes the same structure without the indent — "Appropriate:" and
  // its definition are both top-level paragraphs — so a same-level pair is
  // taken too, but only inside a run of them. The test for a run is that the
  // block two ahead is another label, or that the previous pair was one: that
  // distinguishes a definition list from a lead-in like "Three basic segments:"
  // introducing several items, which must stay as a lead-in.
  const isLabel = (b) =>
    b?.kind === "text" && /:$/.test(b.text.trim()) && b.text.trim().length <= 40;

  const paired = [];
  let inRun = false;
  for (let i = 0; i < work.length; i += 1) {
    const block = work[i];
    const next = work[i + 1];
    const sameLevelPair =
      isLabel(block) &&
      (block.level ?? 0) === (next?.level ?? -1) &&
      next?.kind === "text" &&
      !isLabel(next) &&
      (inRun || isLabel(work[i + 2]));
    if (
      block.kind === "text" &&
      (block.level ?? 0) === 0 &&
      /:$/.test(block.text.trim()) &&
      block.text.trim().length <= 40 &&
      next?.kind === "text" &&
      (next.level ?? 0) > 0
    ) {
      paired.push({
        kind: "term",
        label: block.text.trim().replace(/:$/, ""),
        text: next.text.trim(),
      });
      counts.labelled += 1;
      inRun = true;
      i += 1;
      continue;
    }
    if (sameLevelPair) {
      paired.push({
        kind: "term",
        label: block.text.trim().replace(/:$/, ""),
        text: next.text.trim(),
        level: block.level ?? 0,
      });
      counts.labelled += 1;
      inRun = true;
      i += 1;
      continue;
    }
    inRun = false;
    paired.push(block);
  }
  work = paired;

  /* ---- 6. sentences the text boxes cut in half ------------------------- */
  const joined = [];
  for (const block of work) {
    const previous = joined[joined.length - 1];
    if (
      block.kind === "text" &&
      previous?.kind === "text" &&
      (previous.level ?? 0) === (block.level ?? 0) &&
      isUnfinished(previous.text) &&
      isContinuation(block.text)
    ) {
      previous.text = `${previous.text} ${block.text.trim()}`.replace(/\s+/g, " ");
      counts.joined += 1;
      continue;
    }
    joined.push(block.kind === "text" ? { ...block } : block);
  }

  return { blocks: joined, counts };
}
