/**
 * PPL Flight Test Groundwork — what each module teaches and where it comes from.
 *
 * The eight modules are the PRD's eight, in the PRD's order, and the builder
 * checks them against `PRESCRIBED_MODULES` rather than trusting this file.
 * Everything below them describes how the client's four supplied documents are
 * turned into topics a student reads.
 *
 * A topic claims part of the source. The study document is claimed by its own
 * numbered sections, because several sections share a page; the other three
 * are claimed by page. Every block of every supplied document must be claimed
 * exactly once, skipped with a reason, or removed as the document's own
 * furniture — the build refuses to finish otherwise, so material cannot be
 * quietly dropped.
 *
 * Around each claim sits the authored teaching apparatus: the lead paragraph
 * that says what the topic is for, and where it genuinely helps, context, a
 * misconception or a takeaway. It is always marked `authored` so it never
 * blurs into the client's own words.
 */
import { isRejectedImage } from "./ppl-diagrams.mjs";

export const curriculum = {
  course: "ppl-flight-test",
  subject: "flight-test-groundwork",
  deck: "groundwork-ppl",
  isRejectedImage,

  /** The four documents supplied for PPL Groundwork. */
  documents: ["study", "questions", "weather", "airspace"],

  /**
   * Lines the PDF welded together, separated again.
   *
   * In three places the supplied document put a heading and the sentence after
   * it on one line with no space between them, so the extractor read
   * "…FunnelWhen an examiner asks…" as a single word. Nothing is reworded
   * here: a space or a line break is put back where the layout swallowed one.
   *
   * Keyed by document and page so a repair cannot drift onto another block,
   * and a repair that matches nothing fails the build.
   */
  /**
   * Shapes the supplied material arrives in that the page cannot show well.
   *
   * The client's document draws tables, callout boxes and dashed lists. The
   * PDF flattens all three into paragraphs: a table becomes a run of lines
   * with the header row welded to the first body row, a callout becomes a
   * paragraph starting with an icon and a label, a two-item list becomes one
   * long sentence. The words are right and the shape is gone, and what a
   * student meets is a wall of text where the client drew a box.
   *
   * These rules put the shape back. Each names the block it applies to by how
   * that block starts, says what to do with it, and gives a reason. A rule
   * never restates the client's prose — it strips a marker, splits on a
   * separator, or re-labels a block — and the builder checks that every word
   * it produces was already in the text it consumed, so a rule can rearrange
   * the client's words and can never add any. A rule that matches nothing
   * fails the build rather than sitting here looking like it does something.
   */
  reshape: {
    "study:p6": [
      {
        match: '"Prove to me that this aircraft is legal to fly right now."',
        bullets: /(?<=right now\.")\s+/,
        lead: true,
        level: 0,
        reason:
          "The examiner's question and the paragraph answering it were set on " +
          "one line, so the quotation ran straight into the commentary about it.",
      },
      {
        match: "⚠ Examiner Trap:",
        strip: /^⚠\s*/,
        absorb: 1,
        as: { type: "example", title: "Examiner Trap" },
        reason:
          "One of the client's callout boxes. The warning glyph is the box's " +
          "own icon rather than words, so it comes off and the box is drawn " +
          "as a callout of the kind the rest of the product uses; the trap " +
          "and the answer beneath it are one box and stay together.",
      },
    ],

    "study:p7": [
      {
        match: "The Kiwi Flight Test Secret: Aircraft Group Rating",
        strip: /^The Kiwi Flight Test Secret: Aircraft Group Rating\s*/,
        as: { type: "example", title: "The Kiwi Flight Test Secret: Aircraft Group Rating" },
        reason:
          "A callout box whose title was welded to its first sentence, so the " +
          "heading read as part of the prose and the client's framing looked " +
          "like breathless copy dropped into the middle of a paragraph. Title " +
          "and body are separated and the box is drawn as a callout.",
      },
      {
        match: "The 5-Step Airworthiness Walkthrough",
        strip: /^The 5-Step Airworthiness Walkthrough\s*/,
        as: { type: "example", title: "The 5-Step Airworthiness Walkthrough" },
        reason: "The same weld: a callout box title run into its opening sentence.",
      },
    ],

    "study:p8": [
      {
        match: "⚠ Examiner Trap:",
        strip: /^⚠\s*/,
        absorb: 1,
        as: { type: "example", title: "Examiner Trap" },
        reason:
          "The client's callout box again, with the trap and the fix beneath " +
          "it kept together as the one box they are.",
      },
    ],

    "study:p9": [
      {
        match: "💡 Quick Oral Question:",
        strip: /^💡\s*Quick Oral Question:\s*/,
        as: { type: "example", title: "Quick Oral Question" },
        reason:
          "A callout box marked with the client's lightbulb icon. The icon is " +
          "decoration; the label becomes the callout's title.",
      },
    ],

    "study:p10": [
      {
        match: "[ 1. MSL Analysis",
        bullets: /\s*▼\s*/,
        each: /^\[\s*|\s*\]$/g,
        level: 1,
        reason:
          "The eight steps of the briefing funnel, drawn in the document as " +
          "boxes joined by downward arrows and flattened by the PDF into one " +
          "line. The arrows become the list they were drawing.",
      },
    ],

    "study:p15": [
      {
        match: "- The change lasts for 28 days or longer",
        bullets: /\s*(?:;\s*OR\s*)?-\s+(?=The change)/,
        level: 2,
        reason:
          "The two criteria for issuing an AIP Supplement, set as a dashed " +
          "list and flattened into a single sentence.",
      },
    ],

    "study:p16": [
      {
        match: "💡 The Killer Exam Question:",
        strip: /^💡\s*The Killer Exam Question:\s*/,
        absorb: 1,
        as: { type: "example", title: "The Killer Exam Question" },
        reason:
          "A callout box holding a question and its model answer. The icon " +
          "comes off, the label becomes the title, and the two halves of the " +
          "box stay together.",
      },
      {
        match: "Series Scope Coverage Area Series A Domestic",
        absorb: 2,
        table: {
          headers: ["Series", "Scope", "Coverage area"],
          rows: [
            ["Series A", "Domestic", "Distributed solely within the New Zealand FIR (NZZC)."],
            [
              "Series B",
              "International",
              "Distributed within NZ and overseas; covers both the New Zealand FIR (NZZC) and Auckland Oceanic FIR (NZZO).",
            ],
            [
              "Series F",
              "Aerodrome-Specific",
              "Feeds dedicated to high-density airports (e.g., NZCH, NZWU, NZAA).",
            ],
          ],
        },
        reason:
          "The NOTAM series table. Three columns and three rows, with the " +
          "header row welded to the first body row by the PDF. The cells " +
          "divide exactly along the column names and nothing is inferred.",
      },
    ],

    // The airspace classification table is flattened past the point where its
    // cells can be put back. Class D gives three flight rules and seven
    // statements where six are needed, and Class C's six do not divide the way
    // the column order implies, so any grid built from them would be a guess
    // about which service belongs to which rule — the one thing that must not
    // be guessed on a page about separation. The class labels are separated
    // from the words welded to them so the section reads properly, and the
    // client's statements are left exactly as written. See the report: the
    // original table is worth asking the client for.
    "study:p17": [
      {
        match: "Class D (Control Zone / CTA)",
        as: { type: "subheading" },
        reason:
          "The class label is the heading for the statements beneath it, not " +
          "a paragraph of its own.",
      },
      {
        match: "Class C (Terminal / Enroute)",
        as: { type: "subheading" },
        reason: "The same label, for the second class on the page.",
      },
    ],

    // Twice in the weather walkthrough the client sets a product's name as a
    // heading and then continues the sentence beneath it, so the extractor
    // hands back a heading and a fragment that begins in the middle of a
    // clause. Put back together they are the one sentence the page shows.
    "weather:p9": [
      {
        match: "3. SIGWX",
        strip: /^3\.\s*/,
        absorb: 1,
        join: " ",
        as: { type: "paragraph" },
        reason:
          "\"SIGWX\" is the subject of the sentence under it, not a heading of " +
          "its own, so the page reads \"provides forecast information…\" with " +
          "nothing to provide it.",
      },
    ],

    "weather:p12": [
      {
        match: "5. AAW (Aviation area winds)",
        strip: /^5\.\s*/,
        absorb: 1,
        join: " ",
        as: { type: "paragraph" },
        reason:
          "The same shape: the product name is the subject of the sentence " +
          "beneath it, which otherwise starts \"are issued twice a day\".",
      },
    ],

    "airspace:p5": [
      {
        match: "Series Scale A 1:1 000 000",
        absorb: 2,
        table: {
          // The source declares two column names and then runs three columns
          // of data, so the third header is left empty rather than invented.
          headers: ["Series", "Scale", ""],
          rows: [
            [
              "A",
              "1:1 000 000",
              "A1 and A2 – VPCs to be used for planning purposes and for flight above 10,000 ft",
            ],
            [
              "B",
              "1:500 000",
              "B1 to B6 – VNCs covering the whole country, and most suited for cross‑country navigation (less airspace information than the 1:250 000 scale).",
            ],
            [
              "C",
              "1:250 000",
              "C1 to C14 – VNCs covering the whole country, and most suited to low level and local navigation.",
            ],
            [
              "D",
              "1:125 000",
              "D1 and D2 – D1 Auckland Terminal, and D2 Christchurch Terminal, VNCs depicting a larger scale of the Auckland and Christchurch airspace.",
            ],
          ],
        },
        reason:
          "The visual chart series table. Four rows, each opening with its " +
          "own series letter and scale, so the columns divide on the source's " +
          "own boundaries and nothing is inferred.",
      },
    ],

    "study:p28": [
      {
        match: "-Fly to the aerodrome of intended landing (including taxi",
        bullets: /\s*(?:;\s*AND\s*)?-\s*(?=Fly)/,
        level: 2,
        reason:
          "The two limbs of the day VFR fuel requirement, set as a dashed " +
          "list and flattened into one sentence.",
      },
      {
        match: "-Fly to the aerodrome of intended landing; AND",
        bullets: /\s*(?:;\s*AND\s*)?-\s*(?=Fly)/,
        level: 2,
        reason: "The same two limbs for the night VFR requirement.",
      },
    ],
  },

  /**
   * Sentences the page break cut in half.
   *
   * Two places in the supplied material run a sentence over a page boundary,
   * and the PDF has no way to know it continues, so the second half arrives as
   * its own block. On the page that reads as a stray fragment — a line saying
   * only "avionics." or only "91.515)". Each join names both halves so it can
   * apply to nothing else, and nothing is reworded.
   */
  joinPages: [
    {
      doc: "questions",
      endsWith: "operational capability of installed",
      startsWith: "avionics.",
      reason:
        "The model answer for the CAA 2129 question ends overleaf, leaving " +
        "\"avionics.\" alone at the top of the next page.",
    },
    {
      doc: "study",
      endsWith: "(CAR Rule 91.525 &",
      startsWith: "91.515)",
      reason:
        "The heading of the over-water equipment section carries two rule " +
        "numbers and was broken between them, so the second rule became a " +
        "line of its own reading \"91.515)\".",
    },
  ],

  splitLines: {
    "weather:p5": {
      pairs: [["frontBehind the front =after", "front\nBehind the front = after"]],
      reason:
        "The two halves of the annotation key — what \"ahead\" and \"behind\" " +
        "mean — were set on one line and ran together.",
    },
    "weather:p7": {
      pairs: [["in afternoon Land Breeze (Night):", "in afternoon\n\nLand Breeze (Night):"]],
      reason:
        "\"Land Breeze (Night):\" is the heading for the three lines that " +
        "follow it, not the end of the sea-breeze timing line. It is moved " +
        "onto its own line; nothing is removed.",
    },
    "study:p10": {
      pairs: [
        [
          "Weather Briefing Architecture: The",
          "Weather Briefing Architecture: The \"Big Picture to Small Picture\" Funnel",
        ],
        ["\"Big Picture to Small Picture\" FunnelWhen an examiner asks", "When an examiner asks"],
      ],
      reason:
        "The title of the section — Weather Briefing Architecture: The \"Big " +
        "Picture to Small Picture\" Funnel — was broken across a line, and its " +
        "second half then ran straight into the first sentence of the body " +
        "text. The heading is made whole and the body starts where it should.",
    },
  },

  /**
   * The documents' own furniture, taken off before anything is claimed.
   *
   * The airspace booklet is a printed magazine and carries a printed
   * magazine's apparatus: a page number at the foot of every page, the title
   * repeated in the running head, and a pair of angle brackets pointing from
   * each caption to the photograph beside it. Every photograph in that booklet
   * was rejected as stock imagery — see `ppl-diagrams.mjs` — so the captions
   * have nothing left to describe, and a line reading "Pictured: a drone
   * flying beside a wind turbine" on a page with no picture is worse than no
   * line at all.
   *
   * A `strip` takes a marker off the front of a block, a `cut` trims its
   * tail, and a `drop` removes it entirely.
   */
  furniture: [
    // The study document carries two notes written to whoever was going to
    // build the product — "developer to attach file", "Developer to add here"
    // — beside a mocked-up download button. They are production instructions
    // that were never meant to be read by a student, and the material they
    // point at is in this course already: the handwritten weather notes are
    // the weather walkthrough in module 3, and the airspace booklet is the
    // four topics after it. So the instruction goes and the material stays.
    {
      doc: "study",
      drop: /developer to (attach|add)\b/i,
      reason:
        "A note to whoever was building the product, telling them which file " +
        "to attach here. Not teaching, and not addressed to the reader.",
    },
    {
      doc: "study",
      drop: /^\[\s*(?:\p{Extended_Pictographic}\s*)?Download\b/u,
      reason:
        "A drawn download button for a file that is not offered — the notes " +
        "it points to are taught in this module rather than handed over as a " +
        "PDF, so a button that cannot work is worse than none.",
    },
    {
      doc: "study",
      strip: /^\u{1F449}\uFE0F?\s*/u,
      reason:
        "A pointing hand the client drew beside a paragraph sending the " +
        "reader to the CAA's airspace booklet. The glyph is the layout's " +
        "arrow rather than words, and the sentence after it is untouched. " +
        "The lightbulb and warning icons on the callout boxes are handled " +
        "where those boxes are reshaped, so they are not stripped here.",
    },
    {
      doc: "airspace",
      strip: /^[<>]\s*[<>]\s*/,
      reason:
        "An arrow at the start of a block means the block is the caption for " +
        "the photograph beside it. Several of those captions are real " +
        "teaching prose that merely happened to be set next to a picture, so " +
        "the marker comes off and the words stay; a caption that is only a " +
        "photo credit is dropped by the rule below.",
    },
    {
      doc: "airspace",
      cut: /\s*[<>]\s*[<>]\s*/,
      reason:
        "The angle brackets are the booklet's own arrow from a caption to the " +
        "photograph it describes. Everything after them captions a picture " +
        "that was rejected as stock imagery, so it is cut; anything before " +
        "them is the page's real content and is kept.",
    },
    {
      doc: "airspace",
      cut: /\s*(Pictured:|Photo courtesy of|Photo:)\s/,
      reason: "A photograph credit or caption for a picture that is not shown.",
    },
    {
      doc: "airspace",
      drop: /^ALTIMETER[\d\s]+$|^Altimeter showing QNH setting\.$/,
      reason:
        "The booklet illustrates the QNH subscale with a drawing of an " +
        "altimeter. The drawing is vector artwork and is not in the image " +
        "layer, so it cannot be shown; what the extractor reaches is its " +
        "label ring — \"ALTIMETER 0 19 8 7 6 2 1012 1013 1014 3 45\" — and " +
        "the caption beneath it. Both describe a picture the student cannot " +
        "see, and the label ring is not a sentence at all.",
    },
    {
      doc: "airspace",
      trailingPageNumber: true,
      reason:
        "Where the last line of a page runs close to the footer, the page " +
        "number comes out attached to the end of the sentence — \"…establish " +
        "reliable two-way communication 8\". Only that page's own number is " +
        "removed, so a line that genuinely ends in a number keeps it.",
    },
    {
      doc: "airspace",
      drop: /^\d{1,3}(\s+New Zealand airspace)?$/,
      reason:
        "The page number at the foot of the page, sometimes with the booklet's " +
        "title beside it in the running foot. Not content.",
    },
    {
      doc: "airspace",
      drop: /^(Pictured:|Photo courtesy of|Photo:)/i,
      reason: "A caption for a photograph that was rejected as stock imagery.",
    },
  ],

  /**
   * A page where a run of "1." "2." "3." is a numbered list rather than a run
   * of headings. The two are genuinely ambiguous in a document that uses both.
   */
  demoteHeadings: {
    "weather:p16":
      "The airspace summary numbers its classes 1. to 5. down the page. Those " +
      "are list items, not sections, and reading them as headings broke the " +
      "page into five empty stubs.",
  },

  /**
   * Single blocks skipped on pages that are otherwise kept.
   *
   * The weather walkthrough draws a before / at / after comparison table for
   * the cold and the warm front. The PDF flattens both tables into three
   * paragraphs with the two interleaved, and the cell boundaries cannot be
   * recovered: "CLOUD CS AND AS (CB. CU) AND NS Clear isolated CB CU" could be
   * split three ways and each reads as plausible meteorology. Guessing which
   * cloud belongs before, at and after a front is not a guess worth making.
   *
   * Nothing is lost by leaving them out. The same before / at / after material
   * is in the same document as the client's own hand-annotated cross-sections,
   * which the course shows in "Fronts, Troughs and What They Bring" — legible,
   * unambiguous, and in the client's own writing.
   */
  skipBlocks: [
    {
      doc: "weather",
      startsWith: "BEFORE AT AFTER PRESSURE",
      reason:
        "The cold front comparison table, flattened into one line with its " +
        "cell boundaries lost. Taught by the annotated cross-sections instead.",
    },
    {
      doc: "weather",
      startsWith: "Isolated showers VIS Fair to good",
      reason:
        "The rest of the cold front table run together with the start of the " +
        "warm front table, the two interleaved beyond separating.",
    },
    {
      doc: "weather",
      startsWith: "ST, NS, (CU, CB) Low level cloud may persist",
      reason: "The remainder of the warm front table, in the same condition.",
    },
  ],

  /** Pages that are not teaching material, each with the reason it is skipped. */
  skip: {
    "study:p1":
      "The cover page — \"What You Get: 8 Theory Modules, 36 Examiner Hot Seat " +
      "Q&As, Real NZ Flight Test Traps, Emergency Drills & Briefings\". Sales " +
      "copy for the product the student has already bought.",
    "airspace:p1":
      "The booklet cover: its title, a photograph and the CAA logo, with no " +
      "content on it.",
    "airspace:p2":
      "The booklet's own contents page, which addresses page numbers in a " +
      "printed booklet rather than topics in this course.",
    "airspace:p3":
      "Two pages of abbreviations, from ACAS to VRP. The abbreviations that " +
      "matter are explained where they are used.",
    "airspace:p23":
      "A list of the booklet's own further-reading links and subscription " +
      "addresses.",
    "airspace:p30":
      "The booklet's closing note, encouraging the reader to familiarise " +
      "themselves with the CAA website, and its list of contact addresses.",
    "airspace:p31":
      "A cross-reference index to an illustration of New Zealand airspace on " +
      "the facing page — page furniture pointing within the booklet.",
    "airspace:p32":
      "The back cover: the CAA's postal address, phone numbers and publication " +
      "code.",
    "weather:p1":
      "The walkthrough's title page, naming the products it is about to work " +
      "through.",
    "weather:p17":
      "Four pages of MET abbreviations, an A-to-Z from //1 to VRB. The ones a " +
      "student needs are decoded in the topics that use them.",
    "weather:p18": "The second page of that abbreviation list.",
    "weather:p19": "The third page of that abbreviation list.",
    "weather:p20": "The fourth page of that abbreviation list.",
    "weather:p21":
      "The footnotes to the abbreviation list, marking which entries are ICAO " +
      "and which are used only in New Zealand.",
  },

  modules: [
    {
      title: "Personal Preparation",
      intro: "The examiner's first questions are about you, not the aeroplane. This module is what you have to be able to say about your own fitness to fly, what your licence lets you do, and what has to be current before the flight test can even start.",
      topics: [
        {
          title: "The IMSAFE Checklist",
          claims: [{"doc":"study","sections":["1.1","Module 1"]}],
          intro: "Six letters, and the examiner will want more than the six words. Each one gets its baseline first and then the operational risk behind it, which is the part that is actually being tested.",
          takeaway: "Learning the six words takes a minute and will not pass this question. What the material is drilling is the second layer: for each letter, what goes wrong in the air, and what you would actually do about it on the morning. Answer at that level and the question is finished in one go.",
        },
        {
          title: "PPL Eligibility Requirements",
          claims: [{"doc":"study","sections":["1.2"]}],
          intro: "Age, medical, the hour requirements, the written credits and the flight test — the list that had to be satisfied before you could be sitting the test at all.",
        },
        {
          title: "Privileges and Limitations",
          claims: [{"doc":"study","sections":["1.3"]}],
          intro: "What the licence authorises, what it forbids, and the cost-sharing exception that sits between the two.",
          takeaway: "Every limitation on this page turns on the same question: is somebody paying, and for what. The cost-sharing conditions are worth having word for word, because they are the one place a private pilot may accept money at all and the conditions on it are specific.",
        },
        {
          title: "Recency and Currency",
          claims: [{"doc":"study","sections":["1.4"]}],
          intro: "Two words that are used interchangeably in conversation and mean quite different things here.",
          context: "Hold the difference by what each one protects. Recency is about your passengers: it asks whether you have flown this type recently enough to be carrying anybody. Currency is about your licence: it asks whether the biennial review still stands. You can be current and not recent, which means you may legally fly and may not take anyone with you — and that is exactly the case an examiner likes to construct.",
        },
        {
          title: "Medical Certificate Validity",
          claims: [{"doc":"study","sections":["1.5"]}],
          intro: "How long a Class 2 medical lasts, and what changes with age.",
          context: "Two numbers, and the part that catches people is the arithmetic rather than the recall. Work it the way you would on the morning of the flight: find the date on the certificate itself, add the period that applied when it was issued, and check that the answer is still ahead of today — not ahead of the day you booked the test. It is worth knowing why this matters so much. The medical is what makes the licence usable: without a current one the licence is still yours, but the privileges it carries are not yours to exercise.",
          takeaway: "Know both periods, and know your own expiry date without having to work it out. Being asked when your medical runs out and reaching for a calculator is not the answer an examiner is hoping for.",
        },
        {
          title: "Examiner Hot Seat",
          slug: "examiner-hot-seat-personal-preparation",
          claims: [{"doc":"questions","pages":[1,2,3]}],
          intro: "Six questions on this module, each in three parts: the prompt as an examiner would put it, the trap most candidates fall into, and what a complete answer covers.",
          takeaway: "Read the trap before the model answer. Knowing the fact is rarely the problem in an oral — the marks are lost by answering a narrower question than the one that was asked, and the trap is where that shows.",
        },
      ],
    },
    {
      title: "Aircraft Documents",
      intro: "Before the aeroplane is walked around, its paperwork has to be in order and you have to be able to say why each piece exists. This module is the documents that must be aboard, what each one certifies, and what makes one of them invalid.",
      topics: [
        {
          title: "The Documents That Must Be Carried",
          claims: [{"doc":"study","sections":["Module 2"]}],
          intro: "The list, and where it comes from.",
        },
        {
          title: "Certificate of Airworthiness",
          claims: [{"doc":"study","sections":["2.1"]}],
          intro: "What a C of A certifies, and the three categories it is issued in.",
        },
        {
          title: "Aircraft Flight Manual",
          claims: [{"doc":"study","sections":["2.2"]}],
          intro: "The manual for this individual aeroplane, its supplements, and the sections the examiner will ask you to open.",
        },
        {
          title: "The Aircraft Technical Log",
          claims: [{"doc":"study","sections":["2.3"]}],
          intro: "The document that tells you, this morning, whether the aeroplane may fly — and the five things to check on it before you accept it.",
          takeaway: "The technical log is the one document in this module you interact with on every single flight, and it is the one candidates are vaguest about. Work through it in the same order every time: the release signature, the release status, the hours to the next check, the calendar expiries, and the defect sheet.",
        },
        {
          title: "Form CAA 2173 — Weight and Balance Data",
          claims: [{"doc":"study","sections":["2.4"]}],
          intro: "Where the empty weight and arm you load against actually come from.",
        },
        {
          title: "Form CAA 2129 — Radio Station Approval",
          claims: [{"doc":"study","sections":["2.5"]}],
          intro: "What the radio approval levels mean, and the oral question they lead to.",
        },
        {
          title: "Certificate of Registration",
          claims: [{"doc":"study","sections":["2.6"]}],
          intro: "What registration establishes, and the two cases where the original document matters.",
        },
        {
          title: "Examiner Hot Seat",
          slug: "examiner-hot-seat-aircraft-documents",
          claims: [{"doc":"questions","pages":[4,5,6]}],
          intro: "Seven questions on the documents, with the traps that go with them.",
        },
      ],
    },
    {
      title: "Weather, AIP NZ, and Supplements",
      intro: "The longest module, and the one with the most moving parts: a briefing worked from the big picture down, the publication system the information comes out of, the airspace you will be flying through, and the minima that decide whether the flight happens at all.",
      topics: [
        {
          title: "The Weather Briefing Funnel",
          claims: [{"doc":"study","sections":["3.1","Module 3"]}],
          intro: "The order a professional briefing is worked in, and why it runs from the synoptic picture down to the aerodrome rather than the other way.",
          takeaway: "The funnel is the answer to “walk me through your weather briefing”, and the order is the marks. Starting at the METAR for your departure aerodrome answers a much smaller question than the one asked, and leaves you with nothing to say about what the weather is going to do next.",
        },
        {
          title: "MSL Analysis and Prognosis",
          claims: [{"doc":"study","sections":["3.1.1"]},{"doc":"weather","pages":[2,3,4]}],
          intro: "The first chart in the funnel, worked on real MetService analysis and prognosis charts.",
          diagramNotes: {
            "2b40a2980ae209675fdaeafbaf42343057a42ee9": "A MetService mean sea level analysis for New Zealand: isobars, highs and lows, and the fronts drawn on them, with the valid and issued times along the bottom. The analysis is what the atmosphere was doing at that moment.",
            "325faf796b34fd4a38cf189f6e0cb5cdd17a928d": "The prognosis chart for the same system twelve hours later. Comparing the two shows the direction and speed the features are moving, which is what turns an analysis into a forecast you can plan against.",
          },
        },
        {
          title: "Fronts, Troughs and What They Bring",
          claims: [{"doc":"weather","pages":[5,6,7]}],
          intro: "Hand-annotated cross-sections: what happens to pressure, temperature, wind, cloud and visibility before, at and after each kind of front.",
          diagramNotes: {
            "1e3dc36d352cb080077b8430ba728efd3a384ab7": "A warm front in cross-section, annotated by hand: the cloud sequence from cirrus down through cirrostratus, altostratus and nimbostratus, with the notes for ahead, at and behind the front — backing and strengthening wind, steady precipitation, poor visibility and a falling temperature.",
            "b2d9ffc9c2ad9e76f4160bb8a48a93a6c1821055": "A cold front in the same style: the line squall and cumulonimbus at the front itself, and the notes for behind it — temperature falling, pressure rising, wind veering and strengthening, heavy showers, and visibility improving.",
            "f977726b5d59d5d6e6c50c1cfbdd1ccf350e15f2": "The two kinds of occlusion side by side. In a cold-type occlusion the advancing air is the colder of the two and undercuts; in a warm-type it is less cold and rides over.",
            "81ec96a530a4a25ac110ef976979cfdbb936d21b": "A stationary front in three dimensions, with the warm air riding over the cold along a boundary that is not moving.",
          },
        },
        {
          title: "SIGMET",
          claims: [{"doc":"study","sections":["3.1.2"]},{"doc":"weather","pages":[8]}],
          intro: "The urgent filter: what a SIGMET covers, and what it means for a planned route.",
          diagramNotes: {
            "2294245065ec00c1f7f5d531d578cd1cb15b2f95": "The graphical SIGMET monitor for the New Zealand FIR, with the affected area shaded and the weather symbols keyed beside it. The text SIGMET is the authority; the graphic is how you see at a glance whether your track goes through it.",
          },
        },
        {
          title: "GNZSIGWX — The Significant Weather Chart",
          claims: [{"doc":"study","sections":["3.1.3"]},{"doc":"weather","pages":[9]}],
          intro: "Regional threat mapping between the surface and the upper levels: turbulence, icing, freezing levels and cumulonimbus.",
          diagramNotes: {
            "a73edfc7014ca6842349c0efbc5c338a15dadb81": "A GNZSIGWX chart for New Zealand, valid surface to FL100, with the areas of turbulence, icing and mountain wave outlined and annotated, and the symbol key down the left-hand side.",
          },
        },
        {
          title: "GRAFOR — The Graphical Aviation Forecast",
          claims: [{"doc":"study","sections":["3.1.4"]},{"doc":"weather","pages":[10,11]}],
          intro: "The low-level forecast a VFR flight is actually planned on, and the okta scale its cloud amounts are written in.",
          diagramNotes: {
            "b9517ee995f0972f41ef5ed474a76f0007e5f3b9": "A GRAFOR chart for New Zealand, valid surface to FL100, with each forecast area boxed and annotated with its cloud bases and tops, visibility and weather.",
          },
        },
        {
          title: "AAW — Aviation Area Winds",
          claims: [{"doc":"study","sections":["3.1.5"]},{"doc":"weather","pages":[12,13]}],
          intro: "Where the wind figures on your flight plan come from, at which levels, and in which reference — the detail that catches people.",
          takeaway: "The forecast wind is in degrees true and the wind you are given for a runway is in degrees magnetic. Every crosswind calculation a candidate gets wrong in an oral gets wrong here, and the AIP table above is the reference to quote when asked how you know.",
          diagramNotes: {
            "1a8ea0186ae476b8d38f3f73e65a32b90798c266": "The aviation area wind map: New Zealand divided into its forecast areas, each labelled with a wind direction and speed.",
            "69e70b23d686d8e0c22eaab60bfbd6b2d384b36d": "The decoded panel for one of those areas, showing the wind and temperature at 1,000, 3,000, 5,000, 7,000 and 10,000 feet, with the becoming times across the top. The note at the foot is the one to read: all times are UTC, all heights are AMSL, and the wind is true.",
            "58f347ec43cf2dc0ef6efca0e18e644e29c099de": "AIP Table GEN 3.5-1, which is the evidence for that last point: wind speed in knots, direction in degrees true in a METAR, SPECI, TAF and AAW — and in degrees magnetic in a take-off and landing report or on the ATIS.",
          },
        },
        {
          title: "TAF — The Aerodrome Forecast",
          claims: [{"doc":"study","sections":["3.1.6"]},{"doc":"weather","pages":[14]}],
          intro: "The forecast for one aerodrome, how long it is valid, and how often it is reissued.",
          diagramNotes: {
            "a934dc5bc43ac5324e018cf84c99a5d2758cefeb": "A terminal aerodrome forecast for Whanganui in its raw form, with the validity period, the wind, visibility and cloud groups, and the TEMPO and BECMG changes beneath it.",
            "061c6fb4988b1ba738dd5ba2b30cb561d4024ca2": "The AIP rules for TAF validity: 30 hours for Auckland, Wellington, Christchurch and Ohakea with routine updates, 24 hours for Hamilton, Queenstown and Dunedin, and the issue and validity table for domestic aerodromes — including the note that the times shift by an hour when daylight saving is in force.",
          },
        },
        {
          title: "METAR, AUTO METAR and SPECI",
          claims: [{"doc":"study","sections":["3.1.7"]},{"doc":"weather","pages":[15]}],
          intro: "What is actually happening at the aerodrome now, the difference between the three reports, and what an automatic one cannot tell you.",
          diagramNotes: {
            "67b83a0eaf3eb040df7a3f2f64205b0e526e5afc": "An automated meteorological aerodrome report for Whanganui in its raw form — an AUTO METAR, with the wind, variation, visibility, cloud, temperature, dew point and QNH groups.",
          },
        },
        {
          title: "AWIB, ATIS and Looking Outside",
          claims: [{"doc":"study","sections":["3.1.8","3.1.9"]}],
          intro: "The last step of the funnel, and the one that is not a document.",
          takeaway: "The material ends the funnel by telling you to look out of the window, and that is not a throwaway line. Every product above it was issued minutes or hours ago for an area, and the sky in front of you is the only observation that is current and local. If the two disagree, the window wins.",
        },
        {
          title: "The AIP New Zealand Publication System",
          claims: [{"doc":"study","sections":["3.2","3.2.1","3.2.2","3.2.3"]}],
          intro: "Amendments, supplements and circulars — three ways information reaches the AIP, each on a different timescale.",
        },
        {
          title: "The NOTAM System",
          claims: [
            { doc: "study", sections: ["3.3", "3.3.2", "3.3.3"] },
            // The series table is printed after the heading of the section
            // that follows it, so claiming by section files it under airspace
            // classification and leaves "NOTAM Series Breakdown" here with
            // nothing beneath it. It is pulled back to the heading it belongs to.
            {
              doc: "study",
              pull: [
                "Series Scope Coverage Area Series A Domestic",
                "Series B International Distributed within NZ",
                "Series F Aerodrome-Specific Feeds dedicated",
              ],
            },
            // …and the section it was printed in front of follows it.
            { doc: "study", sections: ["3.3.4"] },
          ],
          intro: "What a NOTAM is for, the trigger NOTAM, the series breakdown, and the distinction between a NOTAM and an AIP supplement.",
          takeaway: "The examiner's version of this question is almost always the comparison: what is the difference between a NOTAM and an AIP supplement. Answer it on timescale and permanence — a NOTAM is urgent and short-lived, a supplement is planned and lasts — and the rest of the answer writes itself.",
        },
        {
          title: "Airspace Classification and Separation",
          claims: [
            { doc: "study", sections: ["3.4"] },
            // The Class D and Class C rows of the same table are printed two
            // pages later under "Operational Definitions to Nail", which is
            // otherwise about broadcast zones. They are the rest of this
            // table, so they are read here with the class they belong to
            // rather than leaving a student to find them under a heading
            // about something else.
            {
              doc: "study",
              pull: { from: "Class D (Control Zone / CTA)", to: "Standard traffic advisories." },
            },
          ],
          intro: "Which classes exist in New Zealand, what each requires of you, and who is separated from whom.",
        },
        {
          title: "New Zealand Airspace in Detail",
          claims: [{"doc":"airspace","pages":[4,5,6,7,8,9,10,11,12,13]}],
          intro: "From the CAA's New Zealand Airspace booklet: how the charts are organised, what a control zone and a control area protect, the classification table, transponder mandatory airspace, general aviation areas and the area QNH zones.",
        },
        {
          title: "Special Use and Non-Designated Airspace",
          claims: [{"doc":"airspace","pages":[14,15,16,17,18,19,24,25]}],
          intro: "Restricted areas, military operating areas, danger areas, volcanic hazard zones, low flying zones, common frequency zones and parachute landing areas — what each is for and what entering one requires.",
        },
        {
          title: "Air Traffic Services",
          claims: [{"doc":"airspace","pages":[26,27,28,29]}],
          intro: "The three kinds of ATS unit in New Zealand, what each provides, and where the boundary between a control service and an information service falls.",
        },
        {
          title: "Unmanned Aircraft and Drones",
          claims: [{"doc":"airspace","pages":[20,21,22]}],
          intro: "The rules for unmanned aircraft, and the pre-flight checklist a drone operator works to.",
          context: "The airspace booklet covers this because it is written for every airspace user, not only for pilots. It earns its place in a flight test course for a different reason: drones are traffic you cannot see and cannot talk to. Knowing where they are allowed to be — and the height they are limited to — tells you which part of your circuit and departure they can legally occupy.",
        },
        {
          title: "Mandatory Broadcast Zones and Local Procedures",
          claims: [{"doc":"study","sections":["3.5","3.5.1","3.5.2","3.5.3"]}],
          intro: "The four mandatory broadcasts, the listening watch, the lighting requirement, and the definitions the examiner expects exactly.",
        },
        {
          title: "Part 91 General Operating Rules",
          claims: [{"doc":"study","sections":["3.6","3.6.1","3.6.2","3.6.3"]}],
          intro: "Minimum safe flying heights, dropping objects, and the daylight time definitions the flight has to finish inside.",
        },
        {
          title: "VFR Meteorological Minima",
          claims: [{"doc":"study","sections":["3.7"]},{"doc":"weather","pages":[16]}],
          intro: "The tables that decide whether the flight is legal, by class of airspace and by aerodrome.",
          takeaway: "These tables are the go/no-go decision in numbers, and they are the one part of this module worth being able to reproduce from memory. An examiner who asks whether you can depart is asking you to compare a forecast against a row of one of these tables and say which row.",
          diagramNotes: {
            "36a2381c5cde195f3164428686a710d976084233": "Table 4, the airspace VFR meteorological minima: for each class, the distance that must be kept from cloud and the flight visibility required — including the split in Class F and G between above and below 3,000 feet AMSL or 1,000 feet above terrain, whichever is the higher. Table 5 beneath it gives the VFR minima at an aerodrome within a control zone: 1,500 feet ceiling and 5 km flight visibility, day and night.",
            "95c51799ac5d2151164958387f6e1632f93d5625": "Table 6, the VFR minima at aerodromes in uncontrolled airspace: by day a 600 foot ceiling and 1,500 m flight visibility, and by night a 1,500 foot ceiling and 8 km.",
          },
        },
        {
          title: "Examiner Hot Seat",
          slug: "examiner-hot-seat-weather-aip-nz-and-supplements",
          claims: [{"doc":"questions","pages":[7,8,9]}],
          intro: "Six questions on the briefing, the publications and the broadcasts.",
        },
      ],
    },
    {
      title: "Performance and Operating Requirements",
      intro: "Whether the aeroplane can do what you are about to ask of it, on this runway, at this weight, in today's air. The module runs from the declared distances printed on the chart to the atmospheric conditions that change what those distances are worth.",
      topics: [
        {
          title: "Why This Module Catches People",
          claims: [{"doc":"study","sections":["Module 4"]}],
          intro: "What separates a confident answer from a stumble on this module, and why performance questions catch people out.",
        },
        {
          title: "Declared Runway Distances",
          claims: [{"doc":"study","sections":["4.1"]}],
          intro: "TORA, TODA, ASDA and LDA — four distances for one runway, each measured between different points.",
          takeaway: "Learn them from the four drawings rather than from the words. Each distance is a line between two specific points on the same runway, and the reason they differ is entirely the clearway, the stopway and the displaced threshold. Given the diagram, an examiner's “what is the physical difference between ASDA and TODA on this strip” answers itself.",
          diagramNotes: {
            "c3ddadd95693b8f2805919cab7bca4746380c0db": "TORA, the take-off run available, marked on a runway with a displaced threshold at one end and a stopway and clearway beyond the other. TORA is the usable length declared for the ground run.",
            "dbd6a449b20135deb890e5bf9e27dc9ce6e02365": "TODA, the take-off distance available, on the same runway: TORA plus the clearway, which is why it is the longest of the four.",
            "5e755fafbdaeb52554b4a5232e09db7de5449e77": "ASDA, the accelerate-stop distance available: TORA plus the stopway, the distance in which a rejected take-off must be brought to a stop.",
            "444553f3914458743473f5b085f76cc9d88f3eb1": "LDA, the landing distance available, measured from the landing threshold — which is why a displaced threshold shortens it while leaving TORA alone.",
          },
        },
        {
          title: "Runway Surface Markings",
          claims: [{"doc":"study","sections":["4.2"]}],
          intro: "What the markings on the surface are telling you about where you may and may not use.",
        },
        {
          title: "The New Zealand Group Rating System",
          claims: [{"doc":"study","sections":["4.3","4.3.1","4.3.2","4.3.3"]}],
          intro: "A New Zealand-specific scheme the examiner is likely to build a scenario around: what a group rating means, what Group 0 means, and how a P-chart differs from a plain POH table.",
        },
        {
          title: "Density Altitude",
          claims: [{"doc":"study","sections":["4.4","4.4.1"]}],
          intro: "The altitude the aeroplane behaves as though it is at, and how it is arrived at.",
        },
        {
          title: "Runway Surface and Bearing Strength",
          claims: [{"doc":"study","sections":["4.4.2"]}],
          intro: "What the surface does to the take-off run, and the separate question of whether it will carry the aeroplane at all.",
        },
        {
          title: "Seasonal Effects on Performance",
          claims: [{"doc":"study","sections":["4.4.3"]}],
          intro: "The same aerodrome in January and in July, and why the difference is worth several hundred metres.",
          takeaway: "The three effects the material lists — on the engine, on the propeller and on the wing — are one effect seen three times: there are fewer air molecules. That is why they all get worse together on a hot day, and why the answer to “what will you notice” is a longer ground roll, a flatter climb and a faster groundspeed on landing rather than any one of them.",
        },
        {
          title: "Aerodynamics and Flight Profiles",
          claims: [{"doc":"study","sections":["4.5","4.5.1","4.5.2","4.5.3","4.5.4"]}],
          intro: "Flaps and stalling speed, manoeuvring speed, what asymmetric damage does to handling, and the choice between best angle and best rate in a wind.",
        },
        {
          title: "Examiner Hot Seat",
          slug: "examiner-hot-seat-performance-and-operating-requirements",
          claims: [{"doc":"questions","pages":[10,11,12]}],
          intro: "Seven questions on distances, group ratings and the atmosphere.",
        },
      ],
    },
    {
      title: "Fuel Management",
      intro: "What is in the tanks, whether it is the right fuel and free of water, how much of it the rules require you to carry, and what the system around it can do to you if it is misunderstood.",
      topics: [
        {
          title: "Aviation Fuels and Contamination",
          claims: [{"doc":"study","sections":["5.1","5.1.1","5.1.2","Module 5"]}],
          intro: "Identifying the grade by colour, and the misfuelling case that the material treats as the worst outcome in the module.",
          takeaway: "The Jet A-1 case is in here because it is survivable only if it is caught on the ground. Colour, smell and feel are all checks you make yourself at the tank, and none of them takes longer than the walk-around you are already doing.",
        },
        {
          title: "Pre-Flight Water Sampling",
          claims: [{"doc":"study","sections":["5.1.3"]}],
          intro: "Where water collects, how to get it out, and what a clear sample does and does not prove.",
        },
        {
          title: "Minimum Fuel Reserves",
          claims: [{"doc":"study","sections":["5.2"]}],
          intro: "What the rule requires you to have on board before you start.",
          takeaway: "The reserve is a minimum and not a plan. Everything unplanned — a hold, an orbit, a diversion, a stronger headwind than forecast — comes out of it, so a flight planned to the legal minimum is a flight planned to land with nothing.",
        },
        {
          title: "Refuelling and Static Electricity",
          claims: [{"doc":"study","sections":["5.3","5.3.1"]}],
          intro: "Why the bonding wire goes on first and comes off last.",
        },
        {
          title: "Condensation and Tank Venting",
          claims: [{"doc":"study","sections":["5.3.2","5.3.3"]}],
          intro: "Two failures that begin on the ground: water condensing in a half-empty tank overnight, and a blocked vent starving the engine in flight.",
        },
        {
          title: "Mixture Leaning",
          claims: [{"doc":"study","sections":["5.3.4"]}],
          intro: "Why the mixture has to be leaned as you climb, and what happens if it is not.",
        },
        {
          title: "Examiner Hot Seat",
          slug: "examiner-hot-seat-fuel-management",
          claims: [{"doc":"questions","pages":[13,14]}],
          intro: "Five questions on fuel, contamination and the system.",
        },
      ],
    },
    {
      title: "Loading",
      intro: "The examiner hands you a loading scenario and watches you work it. This module is the vocabulary, the two limits that both have to be met, and what the aeroplane does when the centre of gravity is at either end of its range.",
      topics: [
        {
          title: "Core Definitions and Terminology",
          claims: [{"doc":"study","sections":["6.1","Module 6"]}],
          intro: "MAUW, basic empty weight, useful load, arm, moment and centre of gravity — the words every part of the calculation is written in.",
          takeaway: "Two separate limits have to be satisfied and meeting one says nothing about the other. The aeroplane must not be too heavy, and the centre of gravity must fall inside the envelope. A load can be comfortably under maximum all-up weight and still be illegal, and that is the case an examiner will build.",
        },
        {
          title: "Normal Category and Utility Category",
          claims: [{"doc":"study","sections":["6.2"]}],
          intro: "The same aeroplane in two certification categories, and what has to be true before you may use the second.",
        },
        {
          title: "The Forward CG Limit",
          claims: [{"doc":"study","sections":["6.3","6.3.1"]}],
          intro: "What a nose-heavy aeroplane does, and why the limit is where it is.",
        },
        {
          title: "The Aft CG Limit",
          claims: [{"doc":"study","sections":["6.3.2"]}],
          intro: "The more dangerous end of the envelope, and what it does to the stall and the spin.",
          context: "Both limits matter and they do not matter equally. A forward CG costs you elevator authority and performance — the aeroplane is heavy in pitch and lands flat. An aft CG costs you stability and the recovery itself: the material's point about a flattening spin is the reason the aft limit is the one that kills people.",
        },
        {
          title: "Fuel Burn and In-Flight CG Movement",
          claims: [{"doc":"study","sections":["6.3.3"]}],
          intro: "The centre of gravity does not stay where you calculated it, and which way it moves depends on where the tanks are.",
          context:
            "Fuel is not the only thing that moves. Every figure in a loading " +
            "calculation assumes that what you put in the aircraft stays where " +
            "you put it, and a bag that slides aft in the climb moves the " +
            "centre of gravity with it — the same arithmetic as fuel burn, but " +
            "unplanned and unmeasured. That is why the rules treat securing " +
            "the load as part of loading it. Baggage has to be stowed in a " +
            "locker, or under a seat so that it cannot slide forward in an " +
            "impact or get in the way of anyone getting out. Cargo has to sit " +
            "on a seat, in a rack or bin, or in a baggage compartment, held by " +
            "a belt or another restraint strong enough that it will not shift " +
            "in any flight or ground condition you would normally expect, and " +
            "packaged so it cannot injure anyone. It must not exceed the " +
            "weight the flight manual or the placard allows for that seat or " +
            "that floor, and it must not block an emergency exit or the aisle.",
          takeaway:
            "Two numbers govern a compartment: how much may go in it, and " +
            "where that puts the centre of gravity. Both come off the flight " +
            "manual and the placards for your aircraft, and neither survives a " +
            "load that is free to move.",
        },
        {
          title: "Examiner Hot Seat",
          slug: "examiner-hot-seat-loading",
          claims: [{"doc":"questions","pages":[15,16]}],
          intro: "Five questions on the calculation and on what to do when it comes out wrong.",
        },
      ],
    },
    {
      title: "Pre-Flight Inspection",
      intro: "The walk-around and everything that has to be understood before it means anything: what the electrical system is doing, what the pitot-static instruments are reading, the equipment the rules require to be fitted, and the flows that get you from the door to the run-up.",
      topics: [
        {
          title: "Electrical System Architecture",
          claims: [{"doc":"study","sections":["7.1","7.1.1","Module 7"]}],
          intro: "How the system is arranged in a light trainer, and the difference between an ammeter and a loadmeter — which decides what a deflection is telling you.",
        },
        {
          title: "Over-Voltage Protection and Alternator Control",
          claims: [{"doc":"study","sections":["7.1.2"]}],
          intro: "What trips the alternator off line, what warns you, and what to do about it.",
        },
        {
          title: "Flight Instruments and the Pitot-Static System",
          claims: [{"doc":"study","sections":["7.2"]}],
          intro: "Which instrument is fed by which line, and therefore which instruments a single blockage takes with it.",
        },
        {
          title: "Minimum Day VFR Instruments",
          claims: [{"doc":"study","sections":["7.3","7.3.1"]}],
          intro: "The equipment the rule requires before a day VFR flight may begin.",
        },
        {
          title: "Additional Equipment for Night VFR",
          claims: [{"doc":"study","sections":["7.3.2"]}],
          intro: "What is added to the day list once the flight will be at night.",
        },
        {
          title: "The SAFDIE Pre-Taxi Flow",
          claims: [{"doc":"study","sections":["7.4","7.4.1"]}],
          intro: "A cockpit flow rather than a list, and the order it runs in.",
          context:
            "A flow like this is the interior half of the pre-flight " +
            "inspection: the part you do sitting in the aircraft, as distinct " +
            "from the exterior walk-around. The checklist for your type is the " +
            "authority on what it contains and the order it runs in, and it is " +
            "worth being clear about why the interior check exists at all. " +
            "Before a flight you are required to be familiar with the flight " +
            "manual for that aircraft, with the placards and instrument " +
            "markings that carry its limitations, and with the emergency " +
            "equipment on board — where it is, who operates it and how it is " +
            "used. The cabin is where all three of those are confirmed rather " +
            "than assumed.",
          keyPoints: [
            "The interior check is the cockpit and cabin: documents on board, controls free and correct through full travel, trim and flaps set, seats and harnesses adjusted and locked, doors and windows secure.",
            "Load security is checked here, not calculated here — baggage in its locker or stowed so it cannot slide forward or block the way out, cargo restrained so it will not shift.",
            "Emergency equipment is confirmed present and reachable from a seat rather than merely known to be somewhere on board.",
            "Anything loose in the cabin is a loose article: it can move the centre of gravity, foul a control, or become a projectile in turbulence.",
            "The flight manual for the type, and the placards in the aircraft, are what settle any of this for your aeroplane.",
          ],
        },
        {
          title: "Engine Start and Static RPM",
          claims: [{"doc":"study","sections":["7.4.2"]}],
          intro: "The figures the run-up is checked against, and what an out-of-tolerance one means.",
        },
        {
          title: "Examiner Hot Seat",
          slug: "examiner-hot-seat-pre-flight-inspection",
          claims: [{"doc":"questions","pages":[17,18]}],
          intro: "Five questions on the systems behind the walk-around.",
        },
      ],
    },
    {
      title: "Emergency Equipment",
      intro: "What has to be carried, what it is for, and the drills that have to be recalled rather than looked up. The module closes with the passenger briefing, which is the part of it a passenger actually experiences.",
      topics: [
        {
          title: "Over-Water Flight Equipment",
          claims: [{"doc":"study","sections":["8.1","8.1.1","8.1.2","8.1.3","8.1.4","Module 8"]}],
          intro: "Four distance thresholds, each adding to what must be on board.",
          takeaway: "Work the requirement out from the route rather than from the aeroplane. A coastal flight that cuts a corner across a bay can cross a threshold without ever feeling like an over-water flight, and the equipment requirement does not care how it felt.",
        },
        {
          title: "Emergency Locator Transmitters",
          claims: [{"doc":"study","sections":["8.2","8.2.1"]}],
          intro: "The standard the ELT has to meet, and the rules about testing one.",
        },
        {
          title: "Transponder Emergency Codes",
          claims: [{"doc":"study","sections":["8.2.2"]}],
          intro: "Three codes, and the situations that are too busy to look them up in.",
          context: "This is the one part of the module worth committing to memory rather than understanding, because every situation that calls for it is a situation with no time to look anything up. The old mnemonic is crude and it survives adrenaline, which is the only test that matters: seven-five, taken alive; seven-six, radio fix; seven-seven, going to heaven. What is worth understanding is why a code is useful at all — selecting one puts your situation in front of a controller without a word being spoken, which is precisely its value when you are too busy to talk, or unable to.",
          takeaway: "Learn the three by number, not by reasoning them out. If you ever need one you will be doing something else at the time.",
        },
        {
          title: "Fire Extinguishers and First Aid Kits",
          claims: [{"doc":"study","sections":["8.2.3"]}],
          intro: "What has to be carried, and where it has to be reachable from.",
        },
        {
          title: "Engine Fire on the Ground and in Flight",
          claims: [{"doc":"study","sections":["8.3","8.3.1","8.3.2"]}],
          intro: "Two drills, both from memory, and the reasoning behind the order of the actions.",
          context: "Both drills work by taking something away from the fire. On the ground the starter is kept cranking to draw the fire into the engine while the fuel is cut off; in the air the aim is the same — isolate the fuel, kill the ignition, close the vents — and the dive that follows is there to blow the flames out. Understanding that is what lets you recall the order under pressure instead of reciting it.",
        },
        {
          title: "Electrical and Wing Fire in Flight",
          claims: [{"doc":"study","sections":["8.3.3","8.3.4"]}],
          intro: "Two more memory drills, and the different hazard each is aimed at.",
        },
        {
          title: "The Passenger Safety Briefing",
          claims: [{"doc":"study","sections":["8.4"]}],
          intro: "Everything a passenger has to be told before the flight, and how the doors, harnesses and exits actually work.",
          takeaway: "The briefing is the one piece of emergency preparation your passengers take part in, and it is examined because it is so often rushed. Give it as though the person beside you has never been in a light aircraft, because on the day of your flight test they may not have been.",
        },
        {
          title: "Examiner Hot Seat",
          slug: "examiner-hot-seat-emergency-equipment",
          claims: [{"doc":"questions","pages":[19,20]}],
          intro: "Five questions on the equipment and the drills.",
        },
      ],
    },
  ],
};
