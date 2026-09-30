/**
 * Repairs the presentation of extracted source text, without changing a word of
 * it.
 *
 * A PDF text layer has no structure. A slide that showed
 *
 *     Height:
 *     The vertical distance of a level, a point or an object ...
 *
 * comes out as two separate paragraphs, and the label reads as an orphan. A
 * definition the author set across three lines —
 *
 *     MFA= The lowest level at or above
 *     MSA/MRA/MEA or upper limit of a
 *     VHA/Danger area/Restricted area.
 *
 * — comes out as three sentence fragments, none of which is a sentence. The
 * words are all correct and all present; the shape is wrong.
 *
 * These rules put the shape back. Every one of them either joins text that
 * belongs together, labels text that had a label, or removes something that was
 * never addressed to the reader. None of them rewrites source wording, and none
 * invents anything: a repaired paragraph contains exactly the words the manual
 * contained, in the order the manual had them.
 *
 * The one thing that is removed outright is the author talking to themselves —
 * "FOR Review AGAIN until its in there?", "(Check this out people.)" — which is
 * listed explicitly rather than matched by a pattern, so nothing can be dropped
 * by accident.
 */

/**
 * Asides the author left in the deck. Removed from the text they are embedded
 * in; the surrounding sentence is kept.
 *
 * Listed literally, not as patterns, because the cost of a false positive here
 * is deleting teaching.
 */
export const REVIEWER_ASIDES = [
  "FOR Review AGAIN until its in there?",
  "FOR Review AGAIN until its in there? ",
  "(Check this out people.)",
  "(Check this out people)",
  "NOW CONTINUE QUIETLY",
  "NOW CONTINUE QUIETLY YOURSELF",
  "So here goes!",
];

/**
 * Tables the source drew as a grid and the text layer delivered as a list of
 * lines.
 *
 * A grid carries meaning in its columns. "VLF 3-30 kHz Too weak 1000s miles" is
 * four cells, and read as a sentence it is four facts run together with no
 * indication which is which. These entries put the columns back.
 *
 * Every cell below is the source's own text, unedited — including its own
 * abbreviations and its own spacing. `consumes` lists the exact lines the table
 * replaces, so if the extraction ever changes the repair stops applying rather
 * than silently attaching to the wrong page.
 */
export const FLATTENED_TABLES = {
  "ir-navaids:146": {
    headers: ["Abbreviation", "Band"],
    rows: [
      ["VLF", "Very Low Frequency"],
      ["LF", "Low Frequency"],
      ["MF", "Medium Frequency"],
      ["HF", "High Frequency"],
      ["VHF", "Very High Frequency"],
      ["UHF", "Ultra High Frequency"],
      ["SHF", "Super High Frequency"],
    ],
    consumes: [
      "VLF Very Low Frequency",
      "LF Low Frequency",
      "MF Medium Frequency",
      "HF High Frequency",
      "VHF Very High Frequency",
      "UHF Ultra High Frequency",
      "SHF Super High Frequency",
    ],
  },

  // The source merges the last three rows' sky-wave and surface-wave cells:
  // VHF, UHF and SHF all read "Direct waves only" and "Line sight". The merged
  // value is repeated in each row, which is what a merged cell means.
  "ir-navaids:147": {
    headers: ["Band", "Frequency", "Sky wave", "Surface wave"],
    rows: [
      ["VLF", "3-30 kHz", "Too weak", "1000s miles"],
      ["LF", "30-300 kHz", "1 or 2 returns", "1500-2000nm"],
      ["MF", "300-3000kHz", "Little beyond surface wave", "300-500 nm"],
      ["HF", "3-30 MHz", "Long range", "100 nm"],
      ["VHF", "30-300 MHz", "Direct waves only", "Line sight"],
      ["UHF", "300-3000 MHz", "Direct waves only", "Line sight"],
      ["SHF", "3000- 30,000 MHz", "Direct waves only", "Line sight"],
    ],
    consumes: [
      "Wave Surface Wave",
      "VLF 3-30 kHz Too weak 1000s miles",
      "LF 30-300 kHz 1 or 2 returns 1500-2000nm",
      "MF 300-3000kHz Little beyond surface wave 300-500 nm",
      "HF 3-30 MHz Long range 100 nm",
      "VHF 30-300 MHz",
      "Direct waves only",
      "Line sight",
      "UHF 300-3000 MHz",
      "SHF 3000- 30,000 MHz",
    ],
  },

  // Three forecast tables for the worked flight-planning question. Cells are
  // in the order the manual printed them, including the third table, where the
  // source itself puts the temperature before the wind on some rows and gives
  // no temperature at all on the last. Reproduced as printed rather than
  // tidied, because tidying it would be guessing which column the author meant.
  "ir-navigation:202": {
    headers: ["Leg", "Altitude", "Wind", "Temp"],
    rows: [
      ["RO - TG", "3000", "240/15", "+07"],
      ["", "5000", "240/15", "+07"],
      ["", "7000", "255/20", "+03"],
      ["", "9000", "265/25", "-02"],
      ["", "11000", "265/33", "-06"],
      ["", "FL130", "265/35", "-12"],
      ["", "FL180", "265/35", "-15"],
      ["NP \u2013 RO", "3000", "240/15", "+07"],
      ["", "5000", "240/15", "+07"],
      ["", "7000", "255/20", "+03"],
      ["", "9000", "265/25", "-02"],
      ["", "11000", "265/33", "-06"],
      ["", "FL130", "265/35", "-12"],
      ["", "FL180", "265/35", "-15"],
      ["RO \u2013 NP", "3000", "260/12", "+13"],
      ["", "5000", "265/15", "+10"],
      ["", "7000", "265/23", "+02"],
      ["", "9000", "-06", "290/23"],
      ["", "11000", "-10", "305/39"],
      ["", "FL130", "-14", "305/39"],
      ["", "FL180", "305/39", ""],
    ],
    consumes: [
      "RO -TG",
      "Altitude Wind Temp",
      "3000 240/15 +07",
      "5000 240/15 +07",
      "7000 255/20 +03",
      "9000 265/25 -02",
      "11000 265/33 -06",
      "FL130 265/35 -12",
      "FL180 265/35 -15",
      "Enroute Weather",
      "NP \u2013 RO",
      "RO \u2013 NP",
      "3000 260/12 +13",
      "5000 265/15 +10",
      "7000 265/23 +02",
      "9000 -06 290/23",
      "11000 -10 305/39",
      "FL130 -14 305/39",
      "FL180 305/39",
    ],
  },

  "ir-navigation:87": {
    headers: ["ALT", "TEMP", "CAS", "TAS"],
    rows: [
      ["FL170", "-16", "130", "172kts"],
      ["FL150", "-9", "160", "?"],
      ["FL180", "-15", "130", "?"],
    ],
    consumes: [
      "ALT TEMP CAS TAS",
      "FL170 -16 130 172kts",
      "FL150 -9 160 ?",
      "FL180 -15 130 ?",
    ],
  },

  // Here the grid was run onto the end of a sentence, so the sentence is kept
  // and only the table part of that line is taken.
  "ir-navigation:88": {
    headers: ["ALT", "TEMP", "CAS", "TAS"],
    rows: [
      ["FL160", "ISA -3", "160", "?"],
      ["FL140", "ISA +4", "140", "?"],
      ["FL290", "-23", "240", "?"],
      ["FL250", "-12", "230", "?"],
    ],
    trims: [
      {
        from: "This equals - 23\u00b0 Celsius. ALT TEMP CAS TAS FL160 ISA -3 160 ? FL140 ISA +4 140 ? FL290 -23 240 ? FL250 -12 230 ?",
        keep: "This equals - 23\u00b0 Celsius.",
      },
    ],
  },
};

/**
 * Callouts printed inside a figure, which the text layer returns as lines.
 *
 * The worked-example pages of the Navigation manual carry a plotting diagram
 * whose labels — "NDB", "TMG", "0123Z" — come out above the prose that
 * explains it. They read as a column of fragments. Listed per page rather than
 * matched by a rule, because "NDB" on its own is a legitimate line elsewhere.
 */
export const FIGURE_CALLOUTS = {
  "ir-navigation:140": ["NDB", "TMG", "0123Z", "0125Z", "0129Z", "0115Z", "CDI CENTERED"],
  "ir-navigation:142": ["NDB", "TMG", "0123Z", "0125Z", "0129Z", "0115Z", "CDI CENTERED"],
  "ir-navigation:143": ["NDB", "TMG", "0123Z", "0125Z", "0129Z", "0115Z", "CDI CENTERED"],
  "ir-navigation:144": ["NDB", "TMG", "0123Z", "0125Z", "0129Z", "0115Z", "Fix at 0129Z"],
  "ir-navigation:131": ["NDB", "VOR"],
  "ir-navigation:135": ["NDB", "VOR", "TMG", "Cocked hat"],
};

/**
 * Whether a leading run of lines is the page heading, printed again as body.
 *
 * The heading is read off the page by font size and comes back whole. The same
 * words are also in the text layer, one rendered line at a time, so a title set
 * across four lines arrives as four fragments above the real content. Two
 * shapes are recognised: a run whose words are all in the title, and a run set
 * entirely in capitals under a title that is also entirely in capitals — which
 * is the case where the heading was too long for the title detector to take all
 * of it.
 */
function leadingTitleEcho(blocks, pageTitle) {
  if (!pageTitle) return 0;
  const titleWords = new Set(
    pageTitle.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean),
  );
  const titleIsCaps = pageTitle === pageTitle.toUpperCase() && /[A-Z]/.test(pageTitle);

  let run = 0;
  let allInTitle = true;
  let allCaps = true;
  while (run < 6 && blocks[run] && blocks[run].kind === "text") {
    const t = blocks[run].text.trim();
    if (!t || t.split(/\s+/).length > 6 || /[.!?]$/.test(t)) break;
    const words = t.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
    if (!words.every((w) => titleWords.has(w))) allInTitle = false;
    if (t !== t.toUpperCase()) allCaps = false;
    if (!allInTitle && !(titleIsCaps && allCaps)) break;
    run += 1;
  }
  if (run === 0) return 0;

  // Only where real prose follows. A page that is nothing but short lines is
  // a page of short lines, not a heading with a body under it.
  const next = blocks[run];
  if (!next || next.kind !== "text") return 0;
  if (next.text.trim().split(/\s+/).length < 8) return 0;
  return run;
}

/**
 * The rest of a heading the title detector only got the start of.
 *
 * Where the largest text on a page is one word — "ADF" — the title comes back
 * as "ADF" and the line "ADF Tracking To An NDB (Fixed Card" is left at the top
 * of the body. It opens with the title, carries no sentence punctuation, and is
 * too short to be prose: it is the heading, continued.
 */
function isHeadingRemnant(block, pageTitle) {
  if (!pageTitle || block?.kind !== "text") return false;
  const title = pageTitle.trim();
  if (title.split(/\s+/).length > 3) return false;
  const t = block.text.trim();
  if (!t.startsWith(title) || t === title) return false;
  if (/[.!?]$/.test(t)) return false;
  return t.split(/\s+/).length <= 10;
}

/** Words that cannot end an English sentence, so the line must continue. */
const DANGLING = new Set(
  `a an the of to in on at for with and or but is are was were be been being by
   from that which who whom whose when while if as than then into onto upon per
   via between within without above below over under after before during about
   against along among around because since unless until whether both either
   neither not no nor its it this these those such any all each every
   beyond toward towards throughout beneath alongside regarding concerning
   including excluding involving containing exceeding following against`
    .split(/\s+/)
    .filter(Boolean),
);

/**
 * A line that is nothing but a rule or paragraph number.
 *
 * "91.423." on its own is never a paragraph — it is the tail of the citation on
 * the line above, which the text layer split. Joined regardless of whether the
 * line above looks unfinished, because a citation can end on an ordinary noun
 * ("... prescribed under rule").
 */
function isBareReference(text) {
  const t = text.trim();
  return t.length <= 14 && /^\d+[\d.]*\.?$/.test(t);
}

/**
 * A line the source broke mid-thought, and how certain that is.
 *
 * "strong" means the line ends on a word that cannot end an English sentence —
 * "of the", "and the", "by an". Nothing follows that except its own
 * continuation, so the next line is joined whatever it looks like.
 *
 * "weak" means only that a bracket is still open. That also happens to a
 * heading the extractor cut — "Tracking To An NDB (Fixed Card" — so a weak
 * signal joins only where the next line plainly continues it.
 */
function unfinishedStrength(text) {
  const t = text.trim();
  if (!t) return null;
  if (t.endsWith("=")) return "strong";
  if (/[.!?:;]$/.test(t)) {
    return (t.match(/\(/g) ?? []).length > (t.match(/\)/g) ?? []).length ? "weak" : null;
  }
  if (/[;,]\s+(?:and|or)$/i.test(t)) return null;
  const last = t.split(/\s+/).pop().toLowerCase().replace(/[^a-z']/g, "");
  if (DANGLING.has(last)) return "strong";
  if ((t.match(/\(/g) ?? []).length > (t.match(/\)/g) ?? []).length) return "weak";
  return null;
}

/** A line the source broke mid-thought. */
function isUnfinished(text) {
  const t = text.trim();
  if (!t) return false;
  if (t.endsWith("=")) return true;
  if ((t.match(/\(/g) ?? []).length > (t.match(/\)/g) ?? []).length) return true;
  if (/[.!?:;]$/.test(t)) return false;
  // "Between aircraft; and" is a list item, not a broken sentence. Joining it
  // to the next item would run two entries of a list together.
  if (/[;,]\s+(?:and|or)$/i.test(t)) return false;
  const last = t.split(/\s+/).pop().toLowerCase().replace(/[^a-z']/g, "");
  return DANGLING.has(last);
}

/** A line that is plainly the continuation of the one before it. */
function isContinuation(text) {
  const t = text.trim();
  if (!t) return false;
  // Starts lower case, or with a symbol, or with a digit continuing a
  // reference ("... under rule" / "91.423."), or with an abbreviation followed
  // by a slash ("VHA/Danger area"), none of which opens a new sentence.
  if (/^[a-z]/.test(t)) return true;
  if (/^[/(),;:-]/.test(t)) return true;
  if (/^\d/.test(t)) return true;
  if (/^[A-Z]{2,6}\//.test(t)) return true;
  // A bare abbreviation completing the sentence above — "... IAS could be
  // greater than" / "TAS."
  if (/^[A-Z]{2,6}[.,;:)]?$/.test(t)) return true;
  // A word that closes a bracket opened on the line above — "RNP (Required
  // Navigation" / "Performance) performance requirements ...".
  if (/^[A-Za-z][A-Za-z-]*\)/.test(t)) return true;
  return false;
}

/** A horizontal rule the author drew with underscores or dashes. */
function isDrawnRule(text) {
  return /^[_\-–—\s]{4,}$/.test(text.trim());
}

/** "Height:", "ISA conditions:", "Day:" — a term with its definition below. */
function asLabel(text) {
  const t = text.trim();
  if (t.length > 34 || !t.endsWith(":")) return null;
  const label = t.slice(0, -1).trim();
  if (!label || !/^[A-Z]/.test(label)) return null;
  if (label.split(/\s+/).length > 4) return null;
  return label;
}

/** "VSO", "VNE", "IAS" — an abbreviation standing alone on its own line. */
function isBareAbbreviation(text) {
  const t = text.trim();
  return t.length <= 12 && /^[A-Z][A-Z0-9]{1,7}$/.test(t);
}

/** Comparable form of a heading, for spotting one emitted twice. */
const shapeOf = (text) => (text ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "");

/**
 * Rewrites one page's text blocks into the shape the page actually had.
 *
 * `blocks` are the manifest's own blocks for a single page; pictures and tables
 * pass through untouched and in place. Returns the repaired list plus a count
 * of what was done, so the build can report it rather than doing it silently.
 */
export function repairPage(blocks, { pageTitle, topicTitle, deck, page } = {}) {
  const counts = { asides: 0, joined: 0, labelled: 0, listed: 0, echoes: 0, orphans: 0, tables: 0 };
  const headings = new Set([shapeOf(pageTitle), shapeOf(topicTitle)].filter(Boolean));

  /* ---- 0. grids the text layer flattened into lines -------------------- */
  let input = blocks;
  const table = FLATTENED_TABLES[`${deck}:${page}`];
  if (table) {
    const consumes = new Set(table.consumes ?? []);
    const trims = new Map((table.trims ?? []).map((t) => [t.from, t.keep]));
    const rebuilt = [];
    let placed = false;
    for (const block of input) {
      if (block.kind === "text") {
        const text = block.text.trim();
        if (consumes.has(text)) {
          if (!placed) {
            rebuilt.push({ kind: "grid", headers: table.headers, rows: table.rows });
            placed = true;
            counts.tables += 1;
          }
          continue;
        }
        if (trims.has(text)) {
          rebuilt.push({ ...block, text: trims.get(text) });
          if (!placed) {
            rebuilt.push({ kind: "grid", headers: table.headers, rows: table.rows });
            placed = true;
            counts.tables += 1;
          }
          continue;
        }
      }
      rebuilt.push(block);
    }
    // A repair that matched nothing is a repair pointing at text that has
    // changed. Better to leave the page alone than to attach a table to it.
    if (placed) input = rebuilt;
  }

  /* ---- 0b. the heading, and any figure callouts, printed as body ------- */
  const echoed = leadingTitleEcho(input, pageTitle);
  if (echoed > 0) {
    input = input.slice(echoed);
    counts.echoes += echoed;
  }

  if (input.length > 1 && isHeadingRemnant(input[0], pageTitle)) {
    input = input.slice(1);
    counts.echoes += 1;
  }

  const callouts = new Set(FIGURE_CALLOUTS[`${deck}:${page}`] ?? []);
  if (callouts.size) {
    const kept = input.filter(
      (block) => !(block.kind === "text" && callouts.has(block.text.trim())),
    );
    counts.orphans += input.length - kept.length;
    input = kept;
  }

  /* ---- 1. the author's own notes, removed from the text around them ---- */
  let work = [];
  for (const block of input) {
    if (block.kind !== "text") { work.push(block); continue; }
    let text = block.text;
    for (const aside of REVIEWER_ASIDES) {
      if (text.includes(aside)) {
        text = text.split(aside).join(" ");
        counts.asides += 1;
      }
    }
    text = text.replace(/\s{2,}/g, " ").trim();
    if (!text) continue;
    if (isDrawnRule(text)) { counts.orphans += 1; continue; }
    work.push({ ...block, text });
  }

  /* ---- 2. a heading the extractor also emitted as body text ------------ */
  const textCount = work.filter((b) => b.kind === "text").length;
  if (textCount > 1) {
    work = work.filter((block) => {
      if (block.kind !== "text") return true;
      if (!headings.has(shapeOf(block.text))) return true;
      counts.echoes += 1;
      return false;
    });
  }

  // The same heading run onto the end of a paragraph — "... from the associated
  // beacon. Distances and DME Steps". The text layer put the rendered heading
  // after the body on those pages, and the paragraph swallowed it.
  const titles = [pageTitle, topicTitle].filter(Boolean);
  work = work.map((block) => {
    if (block.kind !== "text") return block;
    let text = block.text;
    for (const title of titles) {
      const trimmed = title.trim();
      if (trimmed.length < 8) continue;
      if (text.length > trimmed.length + 20 && text.trim().endsWith(trimmed)) {
        text = text.trim().slice(0, -trimmed.length).trim();
        counts.echoes += 1;
      }
    }
    return text === block.text ? block : { ...block, text };
  });

  /* ---- 3. sentences the source broke across lines ---------------------- */
  const joined = [];
  for (const block of work) {
    const previous = joined[joined.length - 1];
    if (
      block.kind === "text" &&
      previous &&
      previous.kind === "text" &&
      (previous.level ?? 0) === (block.level ?? 0) &&
      (unfinishedStrength(previous.text) === "strong" ||
        (unfinishedStrength(previous.text) === "weak" && isContinuation(block.text)) ||
        isBareReference(block.text))
    ) {
      previous.text = `${previous.text} ${block.text}`.replace(/\s{2,}/g, " ");
      counts.joined += 1;
      continue;
    }
    joined.push(block.kind === "text" ? { ...block } : block);
  }

  /* ---- 4. a term and the definition that belonged under it ------------- */
  const labelled = [];
  for (let i = 0; i < joined.length; i += 1) {
    const block = joined[i];
    const next = joined[i + 1];
    const label = block.kind === "text" ? asLabel(block.text) : null;
    if (label && next && next.kind === "text" && !asLabel(next.text)) {
      labelled.push({ kind: "term", label, text: next.text });
      counts.labelled += 1;
      i += 1;
      continue;
    }
    labelled.push(block);
  }

  /* ---- 5. a run of bare abbreviations is a list, not five paragraphs --- */
  const listed = [];
  for (let i = 0; i < labelled.length; i += 1) {
    let run = 0;
    while (
      labelled[i + run] &&
      labelled[i + run].kind === "text" &&
      isBareAbbreviation(labelled[i + run].text)
    ) {
      run += 1;
    }
    if (run >= 3) {
      listed.push({ kind: "abbrevs", items: labelled.slice(i, i + run).map((b) => b.text.trim()) });
      counts.listed += 1;
      i += run - 1;
      continue;
    }
    listed.push(labelled[i]);
  }

  /* ---- 6. a diagram's own labels, left at the end of the page ---------- */
  //
  // The last lines of a page are sometimes the words printed inside the figure
  // above them. They are only dropped where the same token already appears in
  // the page's prose, so nothing that is only said once can be lost.
  const said = new Set();
  for (const block of listed) {
    if (block.kind === "text") {
      for (const token of block.text.match(/\b[A-Z]{2,6}\b/g) ?? []) said.add(token);
    }
    if (block.kind === "abbrevs") for (const item of block.items) said.add(item);
  }
  //
  // Searched past any trailing pictures, because the labels usually sit in the
  // text layer *after* the figure they belong to.
  const out = [...listed];
  for (;;) {
    let at = out.length - 1;
    while (at >= 0 && out[at].kind !== "text") at -= 1;
    if (at < 1) break;
    const t = out[at].text.trim();
    if (!isBareAbbreviation(t) || !said.has(t)) break;
    out.splice(at, 1);
    counts.orphans += 1;
  }

  return { blocks: out, counts };
}
