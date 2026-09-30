import { describe, it, expect } from "vitest";

import { checkPassword, RULES, MIN_LENGTH, MAX_LENGTH } from "@/lib/password-policy";

/**
 * The policy is the only thing standing between an account and a guessable
 * password, so the tests are about what it *refuses* as much as what it takes.
 */

/** A password that satisfies every rule, used as the baseline to break. */
const GOOD = "Southerly7!wind";

describe("checkPassword — acceptance", () => {
  it("accepts a password meeting every rule", () => {
    expect(checkPassword(GOOD)).toEqual({ ok: true });
  });

  it("accepts a long passphrase with the required variety", () => {
    expect(checkPassword("correct-Horse-Battery-9!").ok).toBe(true);
  });

  it("accepts unusual punctuation as the special character", () => {
    expect(checkPassword("Southerly7~wind").ok).toBe(true);
    expect(checkPassword("Southerly7£wind").ok).toBe(true);
  });

  it("does not require the password to be longer than the stated minimum", () => {
    const exact = "Ab3!efgh";
    expect(exact).toHaveLength(MIN_LENGTH);
    expect(checkPassword(exact).ok).toBe(true);
  });
});

describe("checkPassword — the four rules", () => {
  it("rejects a password below the minimum length", () => {
    expect(checkPassword("Ab3!ef").ok).toBe(false);
  });

  it("accepts a password with no uppercase letter", () => {
    // Removed on purpose: it pushed people towards "Password1!" shapes
    // without making anything harder to guess.
    expect(checkPassword("southerly7!wind").ok).toBe(true);
  });

  it("rejects a password with no lowercase letter", () => {
    expect(checkPassword("SOUTHERLY7!WIND").ok).toBe(false);
  });

  it("rejects a password with no number", () => {
    expect(checkPassword("Southerly!wind").ok).toBe(false);
  });

  it("rejects a password with no special character", () => {
    expect(checkPassword("Southerly7wind").ok).toBe(false);
  });

  it("names what is still missing rather than restating the whole policy", () => {
    const result = checkPassword("southerly7wind");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toContain("special");
      // It should not complain about the parts that are already satisfied.
      expect(result.message).not.toContain("a number");
    }
  });
});

describe("checkPassword — predictable passwords", () => {
  it("rejects a common password even though it satisfies every rule", () => {
    // Meets length, upper, lower, number and special — and is worthless.
    const result = checkPassword("Password1!");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.message).toMatch(/first any attacker tries/i);
  });

  it("rejects common passwords regardless of capitalisation", () => {
    expect(checkPassword("PASSWORD1!").ok).toBe(false);
    expect(checkPassword("PaSsWoRd1!").ok).toBe(false);
  });

  it("rejects a single character repeated", () => {
    expect(checkPassword("aaaaaaaa").ok).toBe(false);
  });

  it("rejects a straight alphabetical run", () => {
    expect(checkPassword("abcdefghij").ok).toBe(false);
  });

  it("rejects a straight numeric run", () => {
    expect(checkPassword("12345678").ok).toBe(false);
  });

  it("does not mistake an ordinary password for a sequence", () => {
    expect(checkPassword("Bcd3!xyzq").ok).toBe(true);
  });
});

describe("checkPassword — the person's own details", () => {
  it("rejects a password containing the email local part", () => {
    const result = checkPassword("Jordan99!x", { email: "jordan@example.com" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.message).toMatch(/email/i);
  });

  it("accepts a password containing the person's own name", () => {
    // Removed on purpose. A passphrase is not weak because four letters of
    // someone's name appear inside it, and the rule turned people away from
    // the form. Their email address is still refused, just above.
    expect(checkPassword("ngata7!wind", { name: "Jordan Ngata" }).ok).toBe(true);
  });

  it("still accepts a password unrelated to the name it is given", () => {
    expect(checkPassword("Southerly7!wind", { name: "Ana de Vries" }).ok).toBe(true);
  });

  it("matches the person's details case-insensitively", () => {
    expect(checkPassword("JORDAN99!x", { email: "jordan@example.com" }).ok).toBe(false);
  });

  it("applies with no identity supplied at all", () => {
    expect(checkPassword(GOOD, {}).ok).toBe(true);
  });
});

describe("checkPassword — boundaries", () => {
  it("rejects an empty password", () => {
    expect(checkPassword("").ok).toBe(false);
  });

  it("rejects a password past the maximum, so bcrypt is never handed a novel", () => {
    const huge = `Aa1!${"x".repeat(MAX_LENGTH)}`;
    const result = checkPassword(huge);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.message).toMatch(/or fewer/);
  });

  it("accepts a password exactly at the maximum", () => {
    const atLimit = `Aa1!${"x".repeat(MAX_LENGTH - 4)}`;
    expect(atLimit).toHaveLength(MAX_LENGTH);
    expect(checkPassword(atLimit).ok).toBe(true);
  });

  it("does not treat whitespace as the special character", () => {
    // A space is not punctuation; requiring a real symbol is the point.
    expect(checkPassword("Southerly7 wind").ok).toBe(false);
  });
});

describe("RULES — the list the signup form renders", () => {
  it("exposes every rule the server enforces, so the UI cannot drift", () => {
    expect(RULES.map((r) => r.id)).toEqual(["length", "lower", "number", "special"]);
  });

  it("each rule agrees with the server for a password that satisfies all of them", () => {
    for (const rule of RULES) {
      expect(rule.test(GOOD)).toBe(true);
    }
  });

  it("each rule has a label a person can act on", () => {
    for (const rule of RULES) {
      expect(rule.label.length).toBeGreaterThan(3);
    }
  });
});
