import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { hashToken, canResend, RESEND_COOLDOWN_MS } from "@/lib/verification";
import { renderEmail, renderText } from "@/lib/email/templates";

/**
 * The properties that make a verification link safe: the stored value is not
 * the link, the cooldown is real, and the message carries what a person needs
 * without carrying anything they shouldn't have.
 */

describe("hashToken", () => {
  it("never returns the token it was given", () => {
    const raw = "Zm9vYmFyYmF6cXV4LXRoaXMtaXMtYS10b2tlbg";
    expect(hashToken(raw)).not.toBe(raw);
  });

  it("produces a sha256 hex digest", () => {
    expect(hashToken("anything")).toMatch(/^[0-9a-f]{64}$/);
  });

  it("is deterministic, so a link can be looked up", () => {
    expect(hashToken("same-token")).toBe(hashToken("same-token"));
  });

  it("gives different tokens different hashes", () => {
    expect(hashToken("token-a")).not.toBe(hashToken("token-b"));
  });

  it("is sensitive to a single changed character", () => {
    // A near-miss must not resolve — this is what stops a truncated or
    // mistyped link from matching somebody else's account.
    expect(hashToken("token-a")).not.toBe(hashToken("token-A"));
  });
});

describe("canResend", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("allows a first send, when nothing has been sent yet", () => {
    expect(canResend(null)).toBe(true);
  });

  it("refuses a second send inside the cooldown", () => {
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
    const justNow = new Date(Date.now() - 1_000);
    expect(canResend(justNow)).toBe(false);
  });

  it("allows a send once the cooldown has passed", () => {
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
    const old = new Date(Date.now() - RESEND_COOLDOWN_MS - 1);
    expect(canResend(old)).toBe(true);
  });

  it("treats the exact boundary as allowed", () => {
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
    expect(canResend(new Date(Date.now() - RESEND_COOLDOWN_MS))).toBe(true);
  });

  it("has a cooldown long enough to matter", () => {
    expect(RESEND_COOLDOWN_MS).toBeGreaterThanOrEqual(30_000);
  });
});

describe("the verification email", () => {
  const link = "https://kiwipilotprep.co.nz/verify/AbC123-token_value";
  const content = {
    heading: "Verify your email address",
    paragraphs: ["Kia ora Jordan,", "Welcome to KiwiPilotPrep."],
    action: { label: "Verify My Email", url: link },
    fallbackNote: "If the button doesn't work, copy this link into your browser:",
    footnotes: [
      "This link can only be used once and expires 24 hours after it was sent.",
      "Security note: if you did not create a KiwiPilotPrep account, you can safely ignore this email.",
    ],
  };

  const html = renderEmail(content);
  const text = renderText(content);

  it("carries KiwiPilotPrep branding", () => {
    expect(html).toContain("KiwiPilotPrep");
  });

  it("has a Verify My Email button pointing at the link", () => {
    expect(html).toContain("Verify My Email");
    expect(html).toContain(`href="${link}"`);
  });

  it("repeats the link as plain text, for clients that drop the button", () => {
    // The button is a styled anchor; some clients strip it. The raw URL has to
    // appear as well or the message becomes a dead end.
    const occurrences = html.split(link).length - 1;
    expect(occurrences).toBeGreaterThanOrEqual(2);
  });

  it("states the expiry", () => {
    expect(html).toMatch(/expires/i);
    expect(html).toContain("24 hours");
  });

  it("carries a security note", () => {
    expect(html).toMatch(/security note/i);
    expect(html).toMatch(/did not create/i);
  });

  it("sends a plain-text part saying the same things", () => {
    expect(text).toContain(link);
    expect(text).toContain("Verify My Email");
    expect(text).toMatch(/expires/i);
  });

  it("carries the mandated disclaimer", () => {
    expect(html).toContain("Not affiliated with Aspeq or CAANZ");
  });

  it("never mentions a password", () => {
    // Beyond the reassurance that we will never ask for one.
    expect(html).not.toMatch(/your password is/i);
    expect(text).not.toMatch(/your password is/i);
  });

  it("escapes any markup in the content it is given", () => {
    const nasty = renderEmail({
      ...content,
      paragraphs: ['<script>alert("x")</script>'],
    });
    expect(nasty).not.toContain("<script>alert");
    expect(nasty).toContain("&lt;script&gt;");
  });

  it("declares a light colour scheme, so dark-mode clients do not invert it", () => {
    expect(html).toContain('name="color-scheme"');
  });
});
