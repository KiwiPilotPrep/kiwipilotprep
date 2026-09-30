/**
 * Password policy.
 *
 * Deliberately importable from the browser as well as the server: the signup
 * form ticks the same rules off as you type, and the server then applies them
 * again. The client copy is a courtesy; the server copy is the rule.
 *
 * Applied when a password is *chosen* — signup and reset — and never at login.
 * Someone who set a weak password before this policy existed must still be
 * able to sign in; tightening the rules is not a reason to lock people out of
 * courses they have paid for.
 */

/** Kept at the project's existing minimum rather than raised arbitrarily. */
export const MIN_LENGTH = 8;

/** A cap, so a pasted megabyte cannot become a denial of service via bcrypt. */
export const MAX_LENGTH = 200;

export type Rule = {
  id: string;
  label: string;
  test: (password: string) => boolean;
};

export const RULES: Rule[] = [
  {
    id: "length",
    label: `${MIN_LENGTH}+ characters`,
    test: (p) => p.length >= MIN_LENGTH,
  },
  {
    id: "lower",
    label: "a lowercase letter",
    test: (p) => /[a-z]/.test(p),
  },
  {
    id: "number",
    label: "a number",
    test: (p) => /[0-9]/.test(p),
  },
  {
    id: "special",
    label: "a special character",
    // Anything that is not a letter, a digit or whitespace. Broad on purpose:
    // telling someone which punctuation is allowed narrows their choice for
    // no benefit.
    test: (p) => /[^A-Za-z0-9\s]/.test(p),
  },
];

/**
 * Passwords that meet every rule above and are still worthless, because they
 * are the first things any list tries. Short and hand-picked rather than a
 * bundled corpus: the aim is to catch "Password1!", not to be a dictionary.
 */
const COMMON = new Set(
  [
    "password1!",
    "password123!",
    "password@123",
    "passw0rd!",
    "qwerty123!",
    "qwerty@123",
    "welcome1!",
    "welcome@123",
    "admin@123",
    "admin123!",
    "letmein1!",
    "abc@1234",
    "abcd1234!",
    "iloveyou1!",
    "monkey123!",
    "dragon123!",
    "football1!",
    "sunshine1!",
    "princess1!",
    "aviation1!",
    "pilot@123",
    "pilot123!",
    "kiwipilot1!",
    "kiwipilotprep1!",
    "changeme1!",
    "temp@1234",
    "test@1234",
    "1qaz@wsx",
    "zaq1@wsx",
    "p@ssw0rd",
    "p@ssword1",
  ].map((p) => p.toLowerCase()),
);

export type PasswordCheck = { ok: true } | { ok: false; message: string };

/**
 * The authoritative check.
 *
 * `identity` carries the person's email. A password containing the local part
 * of their own address is guessable by anyone who knows it, which for a
 * platform with a public contact form is everyone.
 *
 * Their *name* is deliberately not checked. It rejected ordinary passwords
 * that were perfectly strong — a long passphrase is not weak because a
 * four-letter name appears somewhere inside it — and the cost of that was
 * people bouncing off the signup form. `name` is still accepted so callers
 * need not change.
 */
export function checkPassword(
  password: string,
  identity: { name?: string; email?: string } = {},
): PasswordCheck {
  if (password.length > MAX_LENGTH) {
    return { ok: false, message: `Passwords must be ${MAX_LENGTH} characters or fewer.` };
  }

  const failed = RULES.filter((rule) => !rule.test(password));
  if (failed.length > 0) {
    return {
      ok: false,
      message: `Your password still needs ${listWords(failed.map((r) => r.label))}.`,
    };
  }

  const lower = password.toLowerCase();

  if (COMMON.has(lower)) {
    return {
      ok: false,
      message: "That password is one of the first any attacker tries. Please choose another.",
    };
  }

  // A single repeated character, or a plain run like "abcdefgh" / "12345678".
  if (/^(.)\1+$/.test(password) || isSequential(lower)) {
    return {
      ok: false,
      message: "That password is too predictable. Please choose another.",
    };
  }

  const localPart = identity.email?.split("@")[0]?.toLowerCase() ?? "";
  if (localPart.length >= 4 && lower.includes(localPart)) {
    return { ok: false, message: "Please choose a password that does not contain your email." };
  }

  return { ok: true };
}

/** "a lowercase letter, a number and a special character" */
function listWords(items: string[]): string {
  if (items.length === 1) return items[0];
  return `${items.slice(0, -1).join(", ")} and ${items.at(-1)}`;
}

/** True for "abcdef" / "123456" and their reverses, of length 6 or more. */
function isSequential(value: string): boolean {
  if (value.length < 6) return false;
  let ascending = true;
  let descending = true;
  for (let i = 1; i < value.length; i++) {
    const step = value.charCodeAt(i) - value.charCodeAt(i - 1);
    if (step !== 1) ascending = false;
    if (step !== -1) descending = false;
  }
  return ascending || descending;
}
