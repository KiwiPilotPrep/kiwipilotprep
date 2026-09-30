import "server-only";

/**
 * Branded email templates.
 *
 * One layout, used by every transactional message, so the mock scorecards and
 * guarantee notices from Phases 4 and 5 can adopt it without a second system.
 *
 * Written for email clients, not browsers: tables for layout, inline styles
 * only, no external stylesheet, no web font, no image. Outlook ignores most of
 * what a modern page relies on, and a logo image blocked by default would
 * leave the message looking broken rather than branded.
 */

const BRAND = "#0F4C81";
const INK = "#0C1B2A";
const BODY = "#41556A";
const MUTED = "#6C8098";
const LINE = "#E4E7EB";
const PAPER = "#F4F6F9";

/** Email bodies are assembled from our own strings, but never assume that. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export type LayoutOptions = {
  /** Shown large at the top of the message. */
  heading: string;
  /** One paragraph per string. */
  paragraphs: string[];
  action?: { label: string; url: string };
  /** Repeated under the button, because buttons do not survive every client. */
  fallbackNote?: string;
  /** Small print above the footer — expiry, what to do if it wasn't you. */
  footnotes?: string[];
};

export function renderEmail(options: LayoutOptions): string {
  const { heading, paragraphs, action, fallbackNote, footnotes = [] } = options;

  const paragraphHtml = paragraphs
    .map(
      (text) =>
        `<p style="margin:0 0 16px;font-size:15px;line-height:1.65;color:${BODY};">${escapeHtml(
          text,
        )}</p>`,
    )
    .join("");

  const buttonHtml = action
    ? `
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:26px 0;">
        <tr>
          <td align="center" bgcolor="${BRAND}" style="border-radius:8px;">
            <a href="${escapeHtml(action.url)}"
               style="display:inline-block;padding:13px 28px;font-family:Helvetica,Arial,sans-serif;
                      font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;">
              ${escapeHtml(action.label)}
            </a>
          </td>
        </tr>
      </table>`
    : "";

  // The raw URL, always. A button is a convenience; this is what actually
  // gets the person where they are going when the button does not render.
  const fallbackHtml = action
    ? `
      <p style="margin:0 0 8px;font-size:13px;line-height:1.6;color:${MUTED};">
        ${escapeHtml(fallbackNote ?? "If the button doesn't work, copy this link into your browser:")}
      </p>
      <p style="margin:0 0 22px;font-size:13px;line-height:1.6;word-break:break-all;">
        <a href="${escapeHtml(action.url)}" style="color:${BRAND};">${escapeHtml(action.url)}</a>
      </p>`
    : "";

  const footnoteHtml = footnotes.length
    ? footnotes
        .map(
          (text) =>
            `<p style="margin:0 0 8px;font-size:13px;line-height:1.6;color:${MUTED};">${escapeHtml(
              text,
            )}</p>`,
        )
        .join("")
    : "";

  return `<!doctype html>
<html lang="en-NZ">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<title>${escapeHtml(heading)}</title>
</head>
<body style="margin:0;padding:0;background:${PAPER};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${PAPER};">
  <tr>
    <td align="center" style="padding:32px 16px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
             style="max-width:560px;background:#ffffff;border:1px solid ${LINE};border-radius:12px;
                    font-family:Helvetica,Arial,sans-serif;">

        <tr>
          <td style="padding:26px 32px 0;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="font-size:17px;font-weight:700;color:${INK};letter-spacing:-0.01em;">
                  KiwiPilotPrep
                </td>
              </tr>
              <tr>
                <td style="padding-top:3px;font-size:11px;letter-spacing:0.12em;
                           text-transform:uppercase;color:${MUTED};">
                  Pilot Theory Prep
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <tr><td style="padding:22px 32px 0;"><hr style="border:0;border-top:1px solid ${LINE};margin:0;"></td></tr>

        <tr>
          <td style="padding:24px 32px 4px;">
            <h1 style="margin:0 0 16px;font-size:21px;line-height:1.3;font-weight:700;color:${INK};">
              ${escapeHtml(heading)}
            </h1>
            ${paragraphHtml}
            ${buttonHtml}
            ${fallbackHtml}
            ${footnoteHtml}
          </td>
        </tr>

        <tr><td style="padding:8px 32px 0;"><hr style="border:0;border-top:1px solid ${LINE};margin:0;"></td></tr>

        <tr>
          <td style="padding:18px 32px 28px;">
            <p style="margin:0 0 8px;font-size:12px;line-height:1.6;color:${MUTED};">
              Need a hand? Reply to this email or use the contact form on our website. We reply
              within three working days.
            </p>
            <p style="margin:0;font-size:12px;line-height:1.6;color:${MUTED};">
              KiwiPilotPrep is an independent educational tool. Not affiliated with Aspeq or CAANZ.
            </p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

/** The plain-text counterpart, so both parts of a message say the same thing. */
export function renderText(options: LayoutOptions): string {
  const { heading, paragraphs, action, footnotes = [] } = options;
  const lines = [heading, "", ...paragraphs.flatMap((p) => [p, ""])];

  if (action) {
    lines.push(`${action.label}:`, action.url, "");
  }
  if (footnotes.length) {
    lines.push(...footnotes, "");
  }

  lines.push(
    "Need a hand? Reply to this email or use the contact form on our website.",
    "We reply within three working days.",
    "",
    "KiwiPilotPrep — independent educational tool.",
    "Not affiliated with Aspeq or CAANZ.",
  );

  return lines.join("\n");
}
