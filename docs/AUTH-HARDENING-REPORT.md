# Authentication & Account Security — Final Report

KiwiPilotPrep · 8 September 2026

**912 automated checks pass.** Build, type-check and lint are clean. Phases 1–6
still work.

The authoritative rule now holds end to end, and is enforced in one place on
the server:

> **Unverified email → cannot purchase.**
> Authenticated + active + verified + valid product + valid price → can purchase.

---

## 1. Authentication changes

The existing architecture was kept: bcrypt at cost 12, a signed JWT in an
httpOnly cookie, and the role re-read from the database on every request. No
second authentication system was introduced.

What changed inside it:

- **`getCurrentUser` now refuses two more cases.** A **disabled** account no
  longer resolves to a session at all, and a session issued before the user's
  `sessionsValidFrom` cutoff is refused. The second is how "sign out
  everywhere" is expressed without a session table.
- **Three named account conditions** (§16), independent by design:
  authenticated, active (`User.status`), verified (`User.emailVerifiedAt`). A
  verified address on a disabled account still buys nothing — verification is
  never the only authorization check.
- **Login rejects disabled accounts** with the same message as a wrong
  password. Distinguishing them would turn the form into a way to enumerate
  accounts and learn their state.
- **`next` is honoured after sign-in**, restricted to relative paths so it can
  never become an open redirect.

## 2. Email verification changes

The flow already existed; this pass finished it.

- **Branded HTML email** with a Verify Email button, the raw link underneath as
  a fallback, and the expiry stated. Plain text is always sent alongside.
- **Subject is now** `Verify your KiwiPilotPrep email`, as specified.
- **Honest delivery reporting** (§19). `sendVerificationEmail` returns what
  actually happened. If the provider rejects the message the page says so and
  offers a retry, instead of telling someone to check an inbox nothing was sent
  to.
- **The development note is gone from production** (§5). It renders only when
  no provider is configured *and* `NODE_ENV !== "production"`.
- **Resend is properly protected** (§6): a 60-second per-account cooldown plus
  15 requests per source per hour, and the button disappears entirely once the
  address is confirmed.

## 3. Resend integration

Resend was already the delivery layer; it stays purely that. Authentication,
verification state, authorization and rate limiting remain in the application
and the database.

- `RESEND_API_KEY` and `EMAIL_FROM` are read server-side only. Verified: no
  secret value appears in any client bundle.
- The sender now supports an HTML part alongside text.
- Provider errors are truncated, logged server-side, and never returned to a
  browser — Resend's error text can name the account and key that failed.
- One email service for everything (§20): verification, password reset,
  invitations, scorecards, guarantee and refund mail all go through
  `sendEmail`, and the branded layout in `lib/email/templates.ts` is available
  to all of them. Verification, reset and invitations use it today.

## 4. Password policy

`lib/password-policy.ts`, applied at signup and reset — **never at login**, so
nobody who set a weak password before this existed is locked out of a course
they paid for. Verified explicitly by test.

Minimum 8 characters (the project's existing minimum, not raised arbitrarily),
plus uppercase, lowercase, a number and a special character. Beyond the five
rules it also refuses:

- well-known passwords that pass every rule (`Password1!` and friends),
- a single repeated character, and straight runs like `abcdefgh` / `12345678`,
- anything containing the person's own name or email local part.

The signup and reset forms render the checklist from the **same `RULES` array
the server enforces**, so the UI cannot drift from the rule. The form is UX;
the server decides. 28 unit tests cover the policy directly.

## 5. Forgot-password implementation

New: `/forgot` → email → `/reset/[token]` → new password → sign in.

- Cryptographically secure token (32 random bytes), **stored only as a
  SHA-256 hash**.
- **Expires in one hour** — shorter than a verification link on purpose:
  someone resetting a password is at their keyboard now.
- **Single-use.** The hash is cleared on success, so a replayed link is
  indistinguishable from an invented one.
- **Completing a reset moves `sessionsValidFrom`**, invalidating every session
  issued before that moment. If the reset is because of a compromise, a stolen
  session cookie stops working immediately. This is the point of resetting;
  anything less is theatre.
- **Resetting through the link also confirms the address**, since opening it
  proves the inbox works. No reason to make someone do the same thing twice.
- The password is never emailed, and never appears in a log or a response.

**Enumeration (§12):** the response is byte-identical whether the address has
an account, has a *disabled* account, is malformed, or was throttled — all four
land on the same page with the same wording. Verified by comparing the actual
redirects.

## 6. Rate limiting

Built on the existing limiter; no new infrastructure.

| Surface | Limit | Why that shape |
|---|---|---|
| Login, per address | 8 **failed** attempts / 10 min | Only failures count. Counting successes would lock out someone using several devices and protects nothing. |
| Login, per source | 100 / 10 min | Loose: a shared address may be a whole classroom. |
| Signup, per source | 20 / hour | Stops scripted account creation without blocking a class signing up together. |
| Verification resend | 60s cooldown + 15/hr per source | Cooldown is per account, so the button cannot be leaned on. |
| Reset request | per-account cooldown + 12/hr per source | The endpoint mails an address the requester need not own. |
| Reset submission | 20 / hour per source | Stops token grinding. |
| Order creation | 30 / min per user | Each one can hit the gateway. |
| Coupon failures | 10 / 10 min per user | Guessing codes is how a discount gets stolen. |

## 7. Purchase protection

`/api/checkout/create-order` now calls `verifiedUserOrProblem()` **first** —
before parsing the body, before looking up the product, and long before
contacting the gateway. An unverified or disabled account cannot cause a
Razorpay order to exist, whatever it posts.

Order creation itself moved into `lib/checkout.ts`, shared by the API route and
the new `/checkout/start` page, so the two paths cannot drift apart and offer
different terms.

**§17 — the chosen product survives the detour.** "Get PPL Package" while
logged out now goes to `/checkout/start?product=…`, which redirects through
login and, if needed, email confirmation, and comes back to *that* purchase.
The id travels in the URL; the price, currency and availability are re-read
from the database afterwards, because an id is a claim about what to sell, not
what it costs.

Razorpay signature verification, webhook handling and idempotency are
untouched. 40 payment checks and 39 coupon checks still pass.

## 8. Server-side security checks

One reusable gate, two shapes:

- `requireVerifiedEmail(next?)` for pages — redirects to login or to
  confirmation, carrying the destination.
- `verifiedUserOrProblem()` for JSON endpoints — returns the user or the status
  code and message to send back.

Applied to: checkout order creation, the checkout page, `/checkout/start`, and
the per-subject free trial.

**Attack simulation (§30-D).** Five crafted payloads were posted directly to
the order API by an unverified account, including ones asserting
`emailVerified: true`, `role: "ADMIN"`, and a price of 1 cent. All five were
refused with 403; no order row, no payment row, no change to the account's role
or verification state.

## 9. Database changes

One additive migration, `20260908090000_auth_hardening`. No column dropped, no
row deleted:

| Field | Purpose |
|---|---|
| `status` (`UserStatus`), `disabledAt`, `disabledNote` | Account state (§16) |
| `resetTokenHash` (unique), `resetTokenExpiresAt`, `resetSentAt` | Password reset |
| `sessionsValidFrom` | Session invalidation cutoff |

Every existing account keeps working: `status` defaults to `ACTIVE`, reset
fields start empty, and `sessionsValidFrom` stays `NULL`, which means no
cutoff — every session valid before the migration stays valid.

**Cleanup (§27):** tokens live on the user row, so each account holds at most
one verification and one reset token and issuing a new one overwrites the last.
Nothing accumulates and no scheduler is needed. A small sweep clears expired
remains opportunistically from `/forgot`.

**No duplicate token system:** verification and reset use the same shape, the
same hashing, and the same storage strategy.

## 10. Tests performed

**912 checks.** New in this pass: 28 unit tests for the policy, and 76
end-to-end auth checks covering the brief's §28 matrix and §30 tests A–E.

| Suite | Checks |
|---|---|
| Unit (vitest) | 152 |
| Auth — policy, reset, account state, purchase gate | 76 |
| Email verification | 35 |
| Authorization / IDOR | 32 |
| Payments · Coupons | 40 · 39 |
| Mocks · Guarantee | 58 · 65 |
| CMS · Dynamic content | 10 · 24 |
| UAT acceptance criteria | 131 |
| Responsive / browser / a11y (real Chromium, 7 widths) | 250 |

Acceptance tests, all passing: **A** strong password → verification email →
confirm → buy. **B** unverified → blocked, no Razorpay order. **C** forgot →
reset → old password dead, new one works. **D** direct API attack → refused.
**E** token reuse (both kinds) → refused.

Also verified: a legacy account with a weak password still signs in and reaches
its dashboard; no secret value appears in any client bundle; security headers
unchanged; all 15 public routes respond.

## 11. Environment variables required

Unchanged except for emphasis. Full list in `.env.example`.

| Variable | Note |
|---|---|
| `RESEND_API_KEY` | **Now required in production.** Signup does not complete without it. |
| `EMAIL_FROM` | Must be on a domain verified in Resend. |
| `NEXT_PUBLIC_SITE_URL` | Verification and reset links are built from it. |
| `AUTH_SECRET` | Rotating it signs everyone out. |
| `DATABASE_URL` | Add `?sslmode=require`. |
| `ALLOW_SANDBOX_PAYMENTS` | Must be absent or false in production. |

## 12. Resend domain setup still required

**Not done, and not doable from here.** Documented step by step in
`docs/DEPLOYMENT.md`:

1. Add the domain in the Resend dashboard.
2. Add **the exact DNS records Resend gives you** — none are invented here.
3. Wait for Resend to report the domain Verified.
4. Point `EMAIL_FROM` at an address on it.
5. Send one real verification to an inbox on another provider and confirm it
   arrives in the inbox, not spam.

## 13. Remaining production blockers

1. **No real verification email has been delivered through Resend.** The flow
   is proved end to end against the local sender; the round trip through
   Resend to a real inbox has not happened, because no API key is configured
   here. **Production email must not be called ready until it has.**
2. **No backups configured** (carried over from Phase 6). Still the highest
   priority — everything else can be fixed after launch; data cannot.
3. **Razorpay international approval** for NZD, unchanged.
4. **Legal pages** still need a lawyer's review.
5. **Firefox and Safari untested** — Chromium is verified at seven widths.
6. **The rate limiter is per-instance.** Behind multiple instances each keeps
   its own counter. Move it to Redis before scaling horizontally.

---

## What is not claimed

The brief is explicit that production readiness must not be claimed until a
real verification email has arrived in a real test inbox through Resend. That
has not happened, so it is not claimed. Everything else on the Definition of
Done is implemented and tested; that one line is the gap, and it needs an API
key and a verified domain rather than more code.
