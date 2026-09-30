import "server-only";

import { resultStatus, type KdrReport, type RevisionArea } from "@/lib/report/kdr-report";

/**
 * The mock result email, as HTML.
 *
 * Written for mail clients, not for browsers. That means tables for layout,
 * every style inline, no stylesheet, no web font, no external image, no
 * flexbox, no grid, no media query doing anything load-bearing. Outlook's
 * renderer is Word's, Gmail strips a <style> block on forward, and half of
 * mobile reads this at 320px wide — so the page is one column that
 * is 600px at most and full width below that, and nothing in it depends on
 * CSS that might not arrive.
 *
 * The design is KiwiPilotPrep's: the cockpit navy of the site masthead, the
 * same blue accent, generous white space, and colour used only where it
 * carries meaning — a score, a band, a button. No gradients, no drop shadows
 * in the body, no decoration standing in for hierarchy.
 *
 * Everything shown comes from the report. There is no readiness claim, no
 * invented statistic, and no external authority named anywhere except the
 * approved independence disclaimer at the foot, whose purpose is to deny a
 * relationship rather than to imply one.
 */

/* KiwiPilotPrep's palette, as literal hex — a mail client resolves no
   variables. Contrast against the surface each is used on is at least 4.5:1,
   except the two large-type cases noted where they are used. */
const NAVY = "#0E2338";
const NAVY_SOFT = "#16324C";
const INK = "#12263A";
const BODY = "#33475B";
const MUTED = "#64768A";
const LINE = "#DCE4EC";
const WASH = "#F4F7FA";
const BLUE = "#17558C";
const GREEN = "#1C6B4B";
const RED = "#9C3A28";
const PAPER = "#FFFFFF";
const CANVAS = "#EEF2F6";

const FONT =
  "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif";

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** The colour a band is shown in. Weak reads as a warning, strong as settled. */
function bandColour(band: RevisionArea["band"]): string {
  if (band === "strong") return GREEN;
  if (band === "weak") return RED;
  return BLUE;
}

/** One row of a section list: the label, then its figure, right aligned. */
function areaRow(
  label: string,
  figure: string,
  colour: string,
  last: boolean,
  chapter: string | null = null,
): string {
  const border = last ? "none" : `1px solid ${LINE}`;
  // The chapter above the point, in the muted colour, so a student reading
  // "27.3" on their phone can see what 27 is without opening the report.
  const chapterLine = chapter
    ? `<span style="display:block;font-size:12px;line-height:17px;color:${MUTED};">${escapeHtml(chapter)}</span>`
    : "";
  return `<tr>
<td style="padding:11px 0;border-bottom:${border};font-family:${FONT};font-size:14px;line-height:20px;color:${INK};">${chapterLine}${escapeHtml(label)}</td>
<td align="right" style="padding:11px 0 11px 12px;border-bottom:${border};font-family:${FONT};font-size:13px;line-height:20px;font-weight:700;color:${colour};white-space:nowrap;">${escapeHtml(figure)}</td>
</tr>`;
}

function areaTable(rows: string[]): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;">${rows.join("")}</table>`;
}

/** A section heading inside the body: small, spaced, KiwiPilotPrep blue. */
function heading(text: string): string {
  return `<p style="margin:0 0 10px;font-family:${FONT};font-size:11px;line-height:16px;letter-spacing:.09em;text-transform:uppercase;font-weight:700;color:${BLUE};">${escapeHtml(text)}</p>`;
}

/** A bordered card. The one container the whole body is built from. */
function card(inner: string, background = PAPER): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:separate;background:${background};border:1px solid ${LINE};border-radius:10px;">
<tr><td style="padding:20px 22px;">${inner}</td></tr>
</table>`;
}

function spacer(height: number): string {
  return `<div style="line-height:${height}px;font-size:${height}px;height:${height}px;">&nbsp;</div>`;
}

/**
 * One statistic in the figures row.
 *
 * Laid out as table cells rather than inline-blocks because Outlook collapses
 * the whitespace between inline-blocks unpredictably and the three would not
 * line up.
 */
function stat(label: string, value: string, colour = INK): string {
  return `<td width="33%" style="padding:0 6px;font-family:${FONT};" align="center">
<div style="font-size:20px;line-height:26px;font-weight:700;color:${colour};">${escapeHtml(value)}</div>
<div style="font-size:11px;line-height:16px;letter-spacing:.06em;text-transform:uppercase;color:${MUTED};padding-top:2px;">${escapeHtml(label)}</div>
</td>`;
}

export function renderScorecardHtml(report: KdrReport, reportUrl: string, attached: boolean): string {
  const r = report.result;
  const first = report.student.name.split(" ")[0] || report.student.name;
  const status = resultStatus(report);
  const statusColour = r.passed === null ? BLUE : r.passed ? GREEN : RED;

  /* -------------------------------------------------------------- header */
  const header = `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;background:${NAVY};border-radius:10px 10px 0 0;">
<tr><td style="padding:26px 22px 24px;">
<div style="font-family:${FONT};font-size:19px;line-height:24px;font-weight:700;color:#FFFFFF;letter-spacing:-.2px;">KiwiPilotPrep</div>
<div style="font-family:${FONT};font-size:11px;line-height:16px;letter-spacing:.12em;text-transform:uppercase;color:#9FB8CE;padding-top:5px;">Mock exam result</div>
</td></tr>
</table>`;

  /* ------------------------------------------------------------ greeting */
  const greeting = `<p style="margin:0 0 6px;font-family:${FONT};font-size:17px;line-height:24px;font-weight:700;color:${INK};">Hi ${escapeHtml(first)},</p>
<p style="margin:0;font-family:${FONT};font-size:15px;line-height:23px;color:${BODY};">Your KiwiPilotPrep mock exam result is ready.</p>`;

  /* -------------------------------------------------------- result card */
  const subjectLine = report.exam.subject
    ? `<p style="margin:6px 0 0;font-family:${FONT};font-size:13px;line-height:19px;color:${MUTED};">${escapeHtml(report.exam.subject)}</p>`
    : "";

  // The score is set large on a pale wash. At 40px it is well past the size
  // where a 3:1 ratio is the accessible threshold, and navy on #F4F7FA is far
  // beyond that.
  const resultCard = card(
    `<p style="margin:0;font-family:${FONT};font-size:16px;line-height:23px;font-weight:700;color:${INK};">${escapeHtml(report.exam.title)}</p>
${subjectLine}
${spacer(16)}
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;background:${WASH};border-radius:8px;">
<tr><td style="padding:18px 16px;" align="center">
<div style="font-family:${FONT};font-size:40px;line-height:44px;font-weight:700;color:${NAVY};">${r.scorePercent}%</div>
<div style="font-family:${FONT};font-size:13px;line-height:19px;font-weight:700;color:${statusColour};padding-top:6px;">${escapeHtml(status)}</div>
${
  r.passingPercent !== null
    ? `<div style="font-family:${FONT};font-size:12px;line-height:18px;color:${MUTED};padding-top:2px;">Pass mark ${r.passingPercent}%</div>`
    : ""
}
</td></tr>
</table>
${spacer(16)}
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;">
<tr>
${stat("Correct", `${r.correct} / ${r.total}`, GREEN)}
${stat("Incorrect", `${r.incorrect}`, r.incorrect > 0 ? RED : INK)}
${stat("Unanswered", `${r.unanswered}`, r.unanswered > 0 ? RED : INK)}
</tr>
</table>`,
  );

  /* ------------------------------------------------------- auto-submitted */
  const autoNote = report.autoSubmitted
    ? spacer(14) +
      `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;background:${WASH};border-left:3px solid ${BLUE};border-radius:0 6px 6px 0;">
<tr><td style="padding:12px 14px;font-family:${FONT};font-size:13px;line-height:19px;color:${BODY};">This attempt was submitted automatically when the time ran out.</td></tr>
</table>`
    : "";

  /* -------------------------------------------------- performance summary */
  const strong = report.strongAreas.slice(0, 4);
  const weak = report.weakAreas.slice(0, 4);

  const strongBlock = strong.length
    ? heading("Strong areas") +
      areaTable(
        strong.map((a, i) =>
          areaRow(a.area, `${a.accuracy}%`, bandColour(a.band), i === strong.length - 1, a.chapter),
        ),
      )
    : "";

  const weakBlock = weak.length
    ? heading("Weak areas") +
      areaTable(
        weak.map((a, i) =>
          areaRow(
            a.area,
            a.missed > 0 ? `${a.accuracy}% · ${a.missed} missed` : `${a.accuracy}%`,
            bandColour(a.band),
            i === weak.length - 1,
            a.chapter,
          ),
        ),
      )
    : "";

  const performance =
    strong.length || weak.length
      ? spacer(14) +
        card(
          heading("Performance summary") +
            `<p style="margin:0 0 16px;font-family:${FONT};font-size:14px;line-height:21px;color:${BODY};">${escapeHtml(report.summary)}</p>` +
            strongBlock +
            (strongBlock && weakBlock ? spacer(16) : "") +
            weakBlock,
        )
      : spacer(14) +
        card(
          heading("Performance summary") +
            `<p style="margin:0;font-family:${FONT};font-size:14px;line-height:21px;color:${BODY};">${escapeHtml(report.summary)}</p>`,
        );

  /* --------------------------------------------------------- revision areas */
  const revision = report.revisionAreas.slice(0, 6);
  const revisionCard = revision.length
    ? spacer(14) +
      card(
        heading("Revision areas") +
          areaTable(
            revision.map((a, i) =>
              areaRow(
                a.area,
                `${a.missed} question${a.missed === 1 ? "" : "s"} missed`,
                RED,
                i === revision.length - 1,
                a.chapter,
              ),
            ),
          ),
      )
    : "";

  /* ---------------------------------------------------------------- CTA */
  //
  // A bulletproof button: the anchor carries the colour and the padding, so
  // it still renders as a button where a background image would be stripped,
  // and the VML fallback gives Outlook's Word renderer the rounded fill it
  // otherwise refuses. The long signed URL is never printed as text — the
  // plain-text part is where a reader who needs the address finds it.
  const url = escapeHtml(reportUrl);
  const cta = `${spacer(18)}
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;">
<tr><td align="center" style="padding:0;">
<!--[if mso]>
<v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${url}" style="height:46px;v-text-anchor:middle;width:260px;" arcsize="18%" strokecolor="${BLUE}" fillcolor="${BLUE}">
<w:anchorlock/><center style="color:#ffffff;font-family:${FONT};font-size:15px;font-weight:700;">View My Result</center>
</v:roundrect>
<![endif]-->
<!--[if !mso]><!-- -->
<a href="${url}" style="display:inline-block;background:${BLUE};color:#FFFFFF;font-family:${FONT};font-size:15px;line-height:20px;font-weight:700;text-decoration:none;padding:13px 30px;border-radius:8px;">View My Result</a>
<!--<![endif]-->
</td></tr>
<tr><td align="center" style="padding:10px 0 0;font-family:${FONT};font-size:12px;line-height:18px;color:${MUTED};">
Opens your Knowledge Deficiency Report${attached ? ", the same document attached to this email" : ""}.
</td></tr>
</table>`;

  /* ------------------------------------------------------------- report note */
  const reportNote = `${spacer(16)}
<p style="margin:0;font-family:${FONT};font-size:13px;line-height:20px;color:${MUTED};">
Your report covers your overall result, every question you missed with the correct answer and any explanation it carries, and the revision area each one belongs to.
</p>`;

  /* ------------------------------------------------------------------ foot */
  const footer = `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;background:${NAVY_SOFT};border-radius:0 0 10px 10px;">
<tr><td style="padding:20px 22px;">
<div style="font-family:${FONT};font-size:14px;line-height:20px;font-weight:700;color:#FFFFFF;">KiwiPilotPrep</div>
<div style="font-family:${FONT};font-size:12px;line-height:18px;color:#A9C0D4;padding-top:3px;">Independent aviation exam preparation.</div>
<div style="font-family:${FONT};font-size:11px;line-height:17px;color:#8FA9C0;padding-top:12px;">KiwiPilotPrep is an independent educational tool. Not affiliated with Aspeq or CAANZ.</div>
</td></tr>
</table>`;

  /* ------------------------------------------------------------- assembly */
  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta name="x-apple-disable-message-reformatting" />
<meta name="color-scheme" content="light" />
<meta name="supported-color-schemes" content="light" />
<title>Your KiwiPilotPrep mock exam result</title>
<!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml><![endif]-->
</head>
<body style="margin:0;padding:0;background:${CANVAS};-webkit-text-size-adjust:100%;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">Your ${escapeHtml(report.exam.subject ?? report.exam.title)} mock scored ${r.scorePercent}%. Your report is attached.</div>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;background:${CANVAS};">
<tr><td align="center" style="padding:24px 12px;">
<!--[if mso]><table role="presentation" align="center" cellpadding="0" cellspacing="0" border="0" width="600"><tr><td><![endif]-->
<!-- A block container, not a nested table: a table with width:100% inside a
     cell makes the cell size to its own maximum, which is what leaves the
     column stuck at 600px on a phone. A div shrinks. -->
<div style="max-width:600px;margin:0 auto;">
${header}
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse;background:${PAPER};border-left:1px solid ${LINE};border-right:1px solid ${LINE};">
<tr><td style="padding:26px 22px 28px;">
${greeting}
${spacer(18)}
${resultCard}
${autoNote}
${performance}
${revisionCard}
${cta}
${reportNote}
</td></tr>
</table>
${footer}
</div>
<!--[if mso]></td></tr></table><![endif]-->
</td></tr>
</table>
</body>
</html>`;
}
