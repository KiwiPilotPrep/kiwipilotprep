import "server-only";

import PDFDocument from "pdfkit";

import { resultStatus, type KdrReport, type RevisionArea } from "./kdr-report";

/**
 * The Knowledge Deficiency Report as a PDF.
 *
 * Rendered with pdfkit rather than a headless browser: the report is
 * structured text, a browser would mean shipping Chromium onto the server
 * for one document a student downloads occasionally, and pdfkit's core fonts
 * carry their own metrics so wrapping and pagination are exact rather than
 * hopeful. Helvetica is the typeface for the same reason — a core PDF font
 * needs no embedding, renders identically in every reader, and is a clean
 * professional sans in its own right.
 *
 * Everything is laid out through the small set of primitives below, and all
 * of them measure before they draw. That is the whole defence against the
 * two failures that make a generated report look amateur: text clipped at
 * the bottom margin, and a heading stranded alone at the foot of a page.
 *
 * The design is KiwiPilotPrep's own — the cockpit navy of the site masthead,
 * the same blue accent, colour used only where it carries meaning. No
 * external logo, no external layout, and nothing that would let the document
 * be mistaken for an official result slip.
 */

const PAGE = { size: "A4" as const, margin: 52 };

/* The palette. Body text is far past 4.5:1 on white; the muted grey is used
   for labels and the two accent colours for figures, never for running
   text. */
const NAVY = "#0E2338";
const INK = "#12263A";
const BODY = "#33475B";
const MUTED = "#64768A";
const RULE = "#DCE4EC";
const WASH = "#F4F7FA";
const BLUE = "#17558C";
const GOOD = "#1C6B4B";
const BAD = "#9C3A28";
const WHITE = "#FFFFFF";
const BAND = "#9FB8CE";

const nz = (d: Date | null) =>
  d
    ? new Intl.DateTimeFormat("en-NZ", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "Pacific/Auckland",
      }).format(d)
    : "—";

export function renderKdrPdf(report: KdrReport): Promise<Buffer> {
  const doc = new PDFDocument({
    size: PAGE.size,
    margin: PAGE.margin,
    // The footer is written onto every page after the body is laid out,
    // which needs the pages still to be open.
    bufferPages: true,
    info: {
      Title: "KiwiPilotPrep Knowledge Deficiency Report",
      Author: "KiwiPilotPrep",
      Subject: report.exam.title,
      Creator: "KiwiPilotPrep",
      // Stamped with when the paper was finished, not when the file was
      // made. The report is rendered fresh on every download, and a clock in
      // the metadata would make two downloads of the same fixed history
      // differ byte for byte — which is exactly the property worth being
      // able to check when a student asks whether this is the report they
      // were sent.
      ...(report.completedAt ? { CreationDate: report.completedAt, ModDate: report.completedAt } : {}),
    },
  });

  const chunks: Buffer[] = [];
  const done = new Promise<Buffer>((resolve, reject) => {
    doc.on("data", (c: Buffer) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });

  const left = PAGE.margin;
  const right = doc.page.width - PAGE.margin;
  const width = right - left;
  const bottom = doc.page.height - PAGE.margin;
  /** Pages after the first carry a slim band, so the text starts lower. */
  const TOP_ON_CONTINUATION = 44;

  /* ------------------------------------------------------------ primitives */

  const room = () => bottom - doc.y;

  /** Starts a new page when `need` points will not fit. */
  const reserve = (need: number) => {
    if (room() < need) {
      doc.addPage();
      doc.y = TOP_ON_CONTINUATION;
    }
  };

  /**
   * Draws a paragraph, moving to a new page first when it would not fit
   * whole. `keepWith` reserves room for whatever follows it.
   */
  const para = (
    text: string,
    opts: {
      font?: string;
      size?: number;
      colour?: string;
      gap?: number;
      indent?: number;
      keepWith?: number;
      lineGap?: number;
    } = {},
  ) => {
    const font = opts.font ?? "Helvetica";
    const size = opts.size ?? 10.5;
    const indent = opts.indent ?? 0;
    const lineGap = opts.lineGap ?? 2.5;
    doc.font(font).fontSize(size).fillColor(opts.colour ?? BODY);

    const w = width - indent;
    const h = doc.heightOfString(text, { width: w, lineGap });
    reserve(h + (opts.keepWith ?? 0));

    doc.text(text, left + indent, doc.y, { width: w, lineGap });
    if (opts.gap) doc.y += opts.gap;
  };

  /** A hairline across the text column. */
  const rule = (gap = 12) => {
    reserve(gap + 2);
    doc
      .moveTo(left, doc.y + gap / 2)
      .lineTo(right, doc.y + gap / 2)
      .lineWidth(0.75)
      .strokeColor(RULE)
      .stroke();
    doc.y += gap;
  };

  /**
   * A section heading: small, letter-spaced, in the accent, with a short
   * underline beneath it. `keepWith` stops it being the last thing on a page.
   */
  const heading = (label: string, keepWith = 72) => {
    reserve(26 + keepWith);
    const y = doc.y;
    doc
      .font("Helvetica-Bold")
      .fontSize(8.5)
      .fillColor(BLUE)
      .text(label.toUpperCase(), left, y, { characterSpacing: 1.1 });
    const after = doc.y;
    doc.moveTo(left, after + 3).lineTo(left + 26, after + 3).lineWidth(1.4).strokeColor(BLUE).stroke();
    doc.y = after + 11;
  };

  /**
   * A label and a value on one line, the label in a fixed left column.
   * `indent` moves the whole pair right, clear of the accent rule that runs
   * down the side of a missed-question block.
   */
  const field = (
    label: string,
    value: string,
    colour = INK,
    labelWidth = 100,
    indent = 0,
  ) => {
    doc.font("Helvetica").fontSize(10.2);
    const valueWidth = width - indent - labelWidth - 8;
    const h = doc.heightOfString(value, { width: valueWidth, lineGap: 2 });
    reserve(h + 6);
    const top = doc.y;
    doc
      .font("Helvetica")
      .fontSize(8.6)
      .fillColor(MUTED)
      .text(label.toUpperCase(), left + indent, top + 1.5, {
        width: labelWidth,
        characterSpacing: 0.5,
      });
    doc
      .font("Helvetica")
      .fontSize(10.2)
      .fillColor(colour)
      .text(value, left + indent + labelWidth + 8, top, { width: valueWidth, lineGap: 2 });
    doc.y = top + h + 5;
  };

  /** One row of a section list: the label, and its figure right-aligned. */
  const areaRow = (
    label: string,
    figure: string,
    colour: string,
    last: boolean,
    chapter: string | null = null,
  ) => {
    reserve(chapter ? 38 : 26);
    const top = doc.y + 4;
    const figureWidth = 160;
    // The chapter first, quietly, then the point under it. A chapter-mapped
    // area has no chapter above it and prints as one line, as before.
    if (chapter) {
      doc
        .font("Helvetica")
        .fontSize(8.6)
        .fillColor(MUTED)
        .text(chapter, left, top, { width: width - figureWidth - 10 });
    }
    doc
      .font("Helvetica")
      .fontSize(10.2)
      .fillColor(INK)
      .text(label, left, chapter ? doc.y + 1 : top, { width: width - figureWidth - 10 });
    const afterLabel = doc.y;
    doc
      .font("Helvetica-Bold")
      .fontSize(9.6)
      .fillColor(colour)
      .text(figure, right - figureWidth, top + 0.5, { width: figureWidth, align: "right" });
    doc.y = Math.max(afterLabel, top) + 5;
    if (!last) {
      doc.moveTo(left, doc.y).lineTo(right, doc.y).lineWidth(0.5).strokeColor(RULE).stroke();
    }
    doc.y += 1;
  };

  /** A list of sections under a heading, or nothing when it is empty. */
  const areaList = (
    label: string,
    rows: RevisionArea[],
    figure: (a: RevisionArea) => string,
    colour: string,
  ) => {
    if (!rows.length) return;
    heading(label, 32);
    rows.forEach((a, i) => areaRow(a.area, figure(a), colour, i === rows.length - 1, a.chapter));
    doc.y += 12;
  };

  /* ------------------------------------------------------------- masthead */

  const MASTHEAD_H = 76;
  doc.rect(0, 0, doc.page.width, MASTHEAD_H).fill(NAVY);
  doc
    .font("Helvetica-Bold")
    .fontSize(19)
    .fillColor(WHITE)
    .text("KiwiPilotPrep", left, 22, { characterSpacing: -0.2, lineBreak: false });
  doc
    .font("Helvetica")
    .fontSize(8.5)
    .fillColor(BAND)
    .text("KNOWLEDGE DEFICIENCY REPORT", left, 48, { characterSpacing: 1.4, lineBreak: false });
  doc
    .font("Helvetica")
    .fontSize(8.5)
    .fillColor(BAND)
    .text(nz(report.completedAt), right - 220, 48, { width: 220, align: "right", lineBreak: false });
  doc.y = MASTHEAD_H + 26;

  /* ---------------------------------------------------------------- facts */

  field("Student", report.student.name);
  field("Exam", report.exam.title);
  field("Subject", report.exam.subject ?? "—");
  field("Attempt", `${report.exam.attemptNumber}`);
  doc.y += 8;

  /* --------------------------------------------------------------- result */

  const r = report.result;
  const status = resultStatus(report);
  const statusColour = r.passed === null ? BLUE : r.passed ? GOOD : BAD;

  {
    const cardH = 94;
    reserve(cardH + 16);
    const top = doc.y;
    doc.roundedRect(left, top, width, cardH, 8).fill(WASH);

    // The score, set large on the wash. At 42pt the contrast requirement is
    // the large-text one, and navy on #F4F7FA is far beyond it.
    doc
      .font("Helvetica-Bold")
      .fontSize(42)
      .fillColor(NAVY)
      .text(`${r.scorePercent}%`, left + 24, top + 20, { lineBreak: false });
    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .fillColor(statusColour)
      .text(status, left + 24, top + 66, { width: 150, lineBreak: false });
    if (r.passingPercent !== null) {
      doc
        .font("Helvetica")
        .fontSize(8.5)
        .fillColor(MUTED)
        .text(`Pass mark ${r.passingPercent}%`, left + 24, top + 79, { width: 160, lineBreak: false });
    }

    // Three statistics, evenly spaced across the right of the card.
    const stats: Array<[string, string, string]> = [
      ["CORRECT", `${r.correct} / ${r.total}`, GOOD],
      ["INCORRECT", `${r.incorrect}`, r.incorrect > 0 ? BAD : INK],
      ["UNANSWERED", `${r.unanswered}`, r.unanswered > 0 ? BAD : INK],
    ];
    const statsLeft = left + 196;
    const colWidth = (width - 196 - 24) / stats.length;
    stats.forEach(([label, value, colour], i) => {
      const x = statsLeft + i * colWidth;
      doc
        .font("Helvetica-Bold")
        .fontSize(17)
        .fillColor(colour)
        .text(value, x, top + 28, { width: colWidth, align: "center", lineBreak: false });
      doc
        .font("Helvetica")
        .fontSize(7.8)
        .fillColor(MUTED)
        .text(label, x, top + 52, {
          width: colWidth,
          align: "center",
          characterSpacing: 0.8,
          lineBreak: false,
        });
    });

    doc.y = top + cardH + 20;
  }

  if (report.autoSubmitted) {
    reserve(38);
    const top = doc.y;
    doc.rect(left, top, 3, 26).fill(BLUE);
    doc
      .font("Helvetica")
      .fontSize(9.6)
      .fillColor(BODY)
      .text("This attempt was submitted automatically when the time ran out.", left + 14, top + 7, {
        width: width - 14,
      });
    doc.y = top + 38;
  }

  /* -------------------------------------------------- performance summary */

  heading("Performance summary", 42);
  para(report.summary, { size: 10.8, gap: 18, lineGap: 3 });

  areaList("Strong areas", report.strongAreas.slice(0, 4), (a) => `${a.accuracy}%`, GOOD);
  areaList(
    "Weak areas",
    report.weakAreas.slice(0, 4),
    (a) => (a.missed > 0 ? `${a.accuracy}%    ${a.missed} missed` : `${a.accuracy}%`),
    BAD,
  );
  areaList(
    "Revision areas",
    report.revisionAreas.slice(0, 6),
    (a) => `${a.missed} question${a.missed === 1 ? "" : "s"} missed`,
    BAD,
  );

  /* ---------------------------------------------------- missed questions */

  if (report.missed.length) {
    rule(14);
    heading("Missed questions", 110);

    for (const [i, m] of report.missed.entries()) {
      // The number, the prompt and the first answer line stay together.
      reserve(104);
      const top = doc.y;
      const startedOnPage = doc.bufferedPageRange().count;

      doc
        .font("Helvetica-Bold")
        .fontSize(8.8)
        .fillColor(BLUE)
        .text(`QUESTION ${i + 1}`, left + 14, top, { characterSpacing: 0.9, lineBreak: false });
      doc.y = top + 13;

      para(m.prompt, {
        font: "Helvetica-Bold",
        size: 10.8,
        colour: INK,
        indent: 14,
        gap: 9,
        lineGap: 2.5,
      });

      const QI = 14;
      field("Your answer", m.yourAnswer ?? "Not answered", m.yourAnswer ? BAD : MUTED, 94, QI);
      if (m.correctAnswer) field("Correct answer", m.correctAnswer, GOOD, 94, QI);
      // Only where the question carries one. Nothing is written to fill a gap.
      if (m.explanation) field("Explanation", m.explanation, BODY, 94, QI);
      field("Revision area", m.revisionArea, INK, 94, QI);

      // The accent rule runs the height of the block, drawn last now that
      // the height is known. A block that spilled onto a new page gets no
      // rule rather than one in the wrong place.
      const end = doc.y;
      if (doc.bufferedPageRange().count === startedOnPage && end > top + 4) {
        doc.rect(left, top, 2.5, end - top - 4).fill(BLUE);
      }

      doc.y = end + 8;
      if (i < report.missed.length - 1) rule(12);
    }
  }

  /* ----------------------------------------------------------- next step */

  rule(14);
  heading("Next step", 36);
  para(
    report.missed.length
      ? "Review the revision areas above before your next mock. Each missed question is listed with the correct answer and, where the question carries one, an explanation."
      : "Nothing to revise from this paper. Keep the run going with another mock.",
    { size: 10.5, gap: 16, lineGap: 3 },
  );

  /* ---------------------------------------------------------------- foot */

  /**
   * The footer sits in the bottom margin, which pdfkit treats as off-limits:
   * writing below `margins.bottom` makes it helpfully add a page, which is
   * how a footer pass can leave a document with a blank final page carrying
   * nothing but the disclaimer. The margin is dropped for the duration of
   * the write and put back afterwards.
   */
  const footer = (pageNumber: number, of: number) => {
    const saved = doc.page.margins.bottom;
    doc.page.margins.bottom = 0;

    const y = doc.page.height - PAGE.margin + 16;
    doc.moveTo(left, y - 9).lineTo(right, y - 9).lineWidth(0.5).strokeColor(RULE).stroke();

    doc
      .font("Helvetica-Bold")
      .fontSize(7.5)
      .fillColor(MUTED)
      .text("KiwiPilotPrep", left, y, { lineBreak: false, continued: true })
      .font("Helvetica")
      .text("   independent aviation exam preparation", { lineBreak: false });
    doc
      .font("Helvetica")
      .fontSize(7.5)
      .fillColor(MUTED)
      .text(`Page ${pageNumber} of ${of}`, right - 70, y, {
        width: 70,
        align: "right",
        lineBreak: false,
      });
    doc
      .font("Helvetica")
      .fontSize(7)
      .fillColor(MUTED)
      .text(
        "KiwiPilotPrep is an independent educational tool. Not affiliated with Aspeq or CAANZ.",
        left,
        y + 11,
        { width, lineBreak: false },
      );

    doc.page.margins.bottom = saved;
  };

  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i += 1) {
    doc.switchToPage(i);
    // Every page after the first carries a slim navy band, so a report that
    // runs to several pages reads as one document rather than a first page
    // and some continuations.
    if (i > range.start) {
      doc.rect(0, 0, doc.page.width, 22).fill(NAVY);
      doc
        .font("Helvetica-Bold")
        .fontSize(8)
        .fillColor(WHITE)
        .text("KiwiPilotPrep", left, 7, { lineBreak: false, characterSpacing: 0.3 });
      doc
        .font("Helvetica")
        .fontSize(7.5)
        .fillColor(BAND)
        .text("Knowledge Deficiency Report", right - 220, 7.5, {
          width: 220,
          align: "right",
          lineBreak: false,
        });
    }
    footer(i - range.start + 1, range.count);
  }

  doc.end();
  return done;
}
