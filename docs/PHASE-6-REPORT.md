# Phase 6 — Production Readiness Report

KiwiPilotPrep · 6 September 2026

---

## 1. Overall status

**READY WITH CONDITIONS.**

The application builds, type-checks and lints clean, and 806 automated checks
pass across ten suites. Migrations apply to an empty database and the app
boots against it. Every workflow in Phases 1–5 still works.

The conditions are not code. They are four external facts nobody can verify
from inside the repository — Razorpay international approval, a configured
backup schedule, the email provider, and the production domain. They are listed
in §15 and §16.

One thing worth stating plainly: Phase 6 found ten genuine defects and eight
security gaps. Three of the defects would have been visible to the first paying
customer, and one of them meant the homepage could not sell anything at all.
They are in §2 and §3 rather than buried.

---

## 2. Bugs found and fixed

| # | What was wrong | Why it mattered |
|---|---|---|
| 1 | The homepage pricing cards rendered literal **`$XXX`** | Every visitor to the homepage saw placeholder prices. The currency toggle only changed the currency label, never a figure, so this would never have self-corrected. Prices now come from the same product rows the checkout charges against, in both currencies, and a test fails if a placeholder returns. |
| 2 | The homepage "Have a coupon code?" box was **inert** | An input and an Apply button wired to nothing. Anyone who typed a code got silence. It now points to where a code can actually be applied. |
| 3 | Admin question bank silently truncated at **100 rows** | With 115 questions, 15 were unreachable through the UI — no pagination, no indication. Now paged at 50 with a count and prev/next. |
| 4 | Admin tables were **clipped, not scrollable**, on phones | `.atable` inside `.panel{overflow:hidden}` meant the right-hand columns — including every action button — could not be reached below ~900px. Now scrolls within the panel. |
| 5 | Skip link was **not the first tab stop** | Added in this phase, then measured: it sat after the header, so a keyboard user still tabbed through the whole navigation. Now first in every layout. |
| 6 | Heading levels **skipped** on three page types | `h2 → h4` in the founder story and footer, `h1 → h3` on `/pricing`. Fixed at the element level; the visual design is byte-identical. |
| 7 | The hero image was **hot-linked from Unsplash** | A third party could change or remove the largest element on the homepage. Also the LCP element. Now self-hosted and served through `next/image` — 309 KB → 104 KB. |
| 8 | `prisma/seed.ts` had **no production guard** | It creates an admin whose password is published in this repository. It now refuses to run against a non-local `DATABASE_URL`. |
| 9 | `.gitignore` excluded **`.env.example`** | `.env*` matched the template too, so a fresh checkout had nothing to copy from. |
| 10 | The **six homepage "Get ..." buttons sold nothing** | Every package button on the homepage was hardcoded to `#contact` — a Phase 1 leftover from before payments existed. The homepage's entire pricing section led to an enquiry form, not a purchase. They now land on the matching card on `/pricing`. |

**Found and deliberately not changed:** the coupon migration is timestamped
before the Phase 4 and 5 migrations, so it applies third rather than last. It
depends only on tables from Phases 2–3 and applies cleanly on a fresh database
(verified). Renaming it now would break the checksum on every database where it
is already applied, which is a worse outcome than a confusing filename.

---

## 3. Security issues found and fixed

| # | Issue | Fix |
|---|---|---|
| 1 | **Host-header injection into outgoing email.** Invitation and scorecard links were built from the request's `Host` header, which the client controls. An attacker could have sent `Host: evil.example` and had our own invitation email carry their domain to the recipient. | `lib/site-url.ts` prefers `NEXT_PUBLIC_SITE_URL` and only falls back to the header when it is unset. |
| 2 | **No throttling on sign-in.** Unlimited password guessing against any known email address. | 8 failed attempts per address per 10 minutes, plus a per-source ceiling. |
| 3 | **No throttling on registration.** Scripted account creation and free-trial farming were unbounded. | 20 per source per hour. |
| 4 | **No throttling on checkout or coupon entry.** Discount codes could be brute-forced. | 30 order creations per user per minute; 10 *failed* coupon attempts per user per 10 minutes. |
| 5 | **No throttling on claim document upload.** Disk that is never automatically reclaimed. | 12 uploads per user per hour. |
| 6 | **No security headers.** No CSP, no framing protection, and the framework version was advertised. | Full header set in `next.config.ts`; `poweredByHeader: false`. |
| 7 | **Single-use tokens were stored in plaintext in the email log.** Every message wrote its full body to `EmailLog`, including flight-school invitations — so anyone with database read access could lift a live invitation token and accept it. | Messages carrying a credential are marked sensitive and their body is redacted from the log. A migration scrubbed the 21 historical rows that already held one. |
| 8 | **No email verification.** An account could be created, and a course bought, against an address nobody could read. | Confirmation is now required before the free trial and before checkout. |

Two of these deserve a note on how they were tuned.

**Rate limits were relaxed after the first attempt, on purpose.** The initial
per-source signup cap was 5/hour. That is tight enough to be interesting to an
attacker, and it would also have locked out the second half of a flight-school
class signing up together from one NAT address — the exact "do not make normal
student usage frustrating" failure the brief warns about. The per-source limits
are now loose; the limits that actually stop attacks are per-account and
per-code.

**Only failed logins are charged.** Counting successes as well would eventually
lock out someone signing in from several devices, and it protects nothing: an
attacker who already knows the password does not need a ninth guess. A correct
password clears the run of failures before it. Both behaviours are pinned by
tests.

**Verified as already correct, not changed:** passwords are bcrypt at cost 12
and never logged; sessions are signed, `httpOnly`, `sameSite`, and `secure` in
production; the role is re-read from the database on every request rather than
trusted from the token; payment signatures use `timingSafeEqual`; uploaded
documents live outside the web root under generated keys and are served
`attachment` with `nosniff`; unauthorised object access returns 404 rather than
403 so existence is never disclosed. No secrets are committed.

---

## 4. Payment verification

Verified end to end against the sandbox gateway (`tests/payments.mjs`, 40
checks; `tests/coupons.mjs`, 39 checks):

- Orders are created server-side; a price sent by the client is ignored
- Currency must be one the product is actually priced in
- Signatures are recomputed server-side; a forged one grants nothing
- Webhook signatures are verified against `RAZORPAY_WEBHOOK_SECRET`
- Fulfilment is idempotent by database constraint — a replayed webhook is a
  no-op, and a captured payment can never come to rest without access
- Failed and cancelled payments grant nothing and leave the order recoverable
- Duplicate purchase is refused with `alreadyOwned`
- Refunds flow through the guarantee workflow with an audit trail

**Coupons.** The code is a claim; the discount is computed server-side from the
product's own price. A discount can reduce a price to zero but never below it.
Redemptions are counted on confirmed payment, in the same transaction that
grants access. One redemption per person per code, enforced by unique index.

**The purchase path now works from the homepage.** Sign up → confirm email →
`/pricing` (or straight to a package from a homepage button) → optional coupon
→ gateway → access granted → dashboard. Before this pass the homepage sold
nothing: all six package buttons went to the contact form.

**"Get course" now goes straight to the gateway.** Previously: pricing → order
page → second click to pay. Now the buy button creates the order and the
checkout page opens the payment window on arrival.

**NZD is built and tested but not commercially verified** — see §16.

---

## 5. Mock engine verification

`tests/mocks.mjs`, 58 checks. The properties that matter:

- The timer is **server-authoritative**. `expiresAt` is stored on the attempt;
  the browser clock, `localStorage`, client state and request payloads were all
  manipulated in testing and none moved it.
- The question set is **stable across refresh** and snapshotted at start.
- Live attempts never receive `isCorrect` — the answer key is not in the
  payload.
- Auto-submit on expiry, manual submit, and double-submit all converge on one
  finalised attempt.
- Scoring, pass/fail and unanswered counts are computed server-side.
- **Historical attempts are immutable.** Editing a question's text, its correct
  answer, its explanation or its KDR code afterwards does not alter a completed
  attempt or its scorecard. Verified explicitly.

---

## 6. Guarantee and refund verification

`tests/guarantee.mjs`, 65 checks.

Eligibility is recalculated at submission rather than trusted from the page
that rendered the button. Duplicate claims are blocked by unique index. Invalid
state transitions are refused by a declared transition map — `REFUNDED →
APPROVED` is not expressible. Every transition writes an audit row. Documents
are private (see §3). Refund amounts are validated and duplicate refunds
blocked.

The six-step student-facing workflow is on `/refunds`.

---

## 7. Flight School verification

Organisation isolation is resolved **from the session**, never from an
`organizationId` in the request. Seats, licences, invitations, student lists and
progress reports are all scoped that way, and `tests/idor.mjs` confirms a
non-member is refused each one.

Removing a student revokes their seat but leaves their historical progress and
attempts intact. `revokeSeat` is scoped to `source: "ADMIN"`, so a student who
also bought their own access keeps it.

---

## 8. Responsive and browser QA

**Measured, not asserted.** `tests/responsive.mjs` drives a real Chromium and
reads the rendered geometry.

- **250 checks passing** across 1440, 1280, 1024, 768, 430, 390 and 375 px
- Public, student and admin pages at each width
- **Zero horizontal overflow** anywhere. The check ignores elements inside a
  deliberate horizontal scroller, so a scrollable table passes and a clipped
  one does not
- **Zero console errors and zero page errors** on every page at every width —
  this is also the hydration check, since a mismatch reports as a console error
- Touch targets on `/pricing` are ≥40 px at 375 px
- Every form control is programmatically labelled; focus is visible; the skip
  link is the first tab stop and appears when focused; heading order is correct

**Firefox and Safari have not been tested** — see §15.

---

## 9. Performance improvements

- Fonts self-hosted via `next/font` — one render-blocking third-party request
  removed, and no font request leaves the origin
- Hero image self-hosted and served through `next/image`: **309 KB → 104 KB**,
  with `priority` set since it is the LCP element
- Admin question bank paginated (50/page) — was loading 100 rows unconditionally
- `no-store` on all `/api/*` responses so exam material and scorecards are never
  cached
- Sitemap revalidates hourly rather than querying per request

No N+1 queries were found; list pages already use `include`/`_count` rather than
per-row lookups.

---

## 10. Database and migration status

- **39 models, 5 migrations.** All applied.
- **Fresh-database test passed:** dropped a database, ran `prisma migrate
  deploy`, all five applied in order, `prisma migrate diff` reported **no
  drift**, and the application booted against it and served every public page
  with no errors.
- 40 tables, 73 foreign keys, 74 unique indexes, 131 indexes, 20 enums.
- The constraints that carry the guarantees are present on a fresh database:
  `Payment.gatewayPaymentId` (replay-safe payments),
  `Entitlement (userId, scopeKey)` (idempotent access),
  `CouponRedemption.orderId` (one redemption per order),
  `GuaranteeClaim (userId, orderId)` (one claim per purchase).
- Two destructive statements exist in history. Both are legitimate: the Phase 3
  `DROP TABLE "CourseAccess"` runs *after* migrating its rows into
  `Entitlement`, and the Phase 5 `DROP COLUMN "reviewedBy"` removes a column
  replaced by `processedById`. Both were validated in their own phase.
- The Phase 6 coupon migration is purely additive and backfills
  `listAmountMinor` from existing order amounts.

---

## 11. Environment variables required

Documented in full in `.env.example`. The ones that cause damage if wrong:

| Variable | Required | Note |
|---|---|---|
| `DATABASE_URL` | yes | add `?sslmode=require` in production |
| `AUTH_SECRET` | yes | 32 random bytes; rotating signs everyone out |
| `NEXT_PUBLIC_SITE_URL` | yes | canonical URLs, OG tags, sitemap, **and email links** |
| `MEDIA_DIR` | yes | outside the web root, on a backed-up disk |
| `RAZORPAY_KEY_ID` / `_SECRET` | yes | server-side only |
| `RAZORPAY_WEBHOOK_SECRET` | yes | the webhook is not optional |
| `RESEND_API_KEY` | yes | empty = emails are logged, not sent |
| `EMAIL_FROM` | yes | must be a verified sender |
| `ALLOW_SANDBOX_PAYMENTS` | **must be off** | set in production, anyone can grant themselves paid access |

---

## 12. External services required

| Service | Purpose | Blocks launch? |
|---|---|---|
| PostgreSQL 16+ | everything | yes |
| Razorpay | payments and refunds | yes — including international approval for NZD |
| Resend (or equivalent) | scorecards, invitations, claim and refund notices | yes — without it, emails are only logged |
| Persistent disk | guarantee-claim documents | yes |
| TLS certificate | HSTS is served with a two-year max-age | yes |

---

## 13. Deployment steps

Full runbook in [`docs/DEPLOYMENT.md`](DEPLOYMENT.md). In short:

```bash
npm ci
npx prisma migrate deploy
npx prisma generate
npm run build
npm start
```

Then: seed the syllabus with `seed-syllabus.ts` and `seed-subjects.ts` (**not**
`seed.ts`), create the first admin with the documented one-liner that takes the
password from the environment, register the Razorpay webhook, and make one real
low-value purchase to confirm the whole path before announcing anything.

---

## 14. Backup and recovery requirements

Documented in `docs/DEPLOYMENT.md` §6. **No backups are currently configured** —
the document states the requirement, it does not describe an existing setup.

Two things must be backed up: the PostgreSQL database, and `MEDIA_DIR` (the
uploaded Aspeq result sheets, which are the evidence behind every refund
decision). Everything else rebuilds from source.

Recommended: nightly dump retained 30 days, weekly retained 12 weeks, plus a
manual dump before any release carrying a migration. Restore into a *new*
database and verify before repointing production.

A backup that has never been restored is not a backup. Run the drill quarterly
and record how long it takes — that number is the real recovery time.

---

## 15. Remaining blockers

Nothing in the code blocks launch. These are open:

1. **No backups configured.** Highest priority. Everything else can be fixed
   after launch; data cannot be un-lost.
2. **Firefox and Safari untested.** Chromium is verified at seven widths. The
   application uses no Chromium-specific APIs, but that is reasoning, not
   evidence.
3. **Email deliverability unverified — and now on the critical path.** Since
   verification was added, the signup funnel does not work without a working
   mail provider: a student who never receives the link cannot start a trial or
   buy. SPF, DKIM and DMARC for the sending domain have not been set up or
   tested, and confirmation mail is exactly what lands in spam without them.
4. **Load behaviour unknown.** No load testing was performed. The rate limiter
   is in-process, so behind multiple instances each keeps its own counter — a
   speed bump, not a hard quota. If the platform is scaled horizontally, move
   it to Redis.
5. **Legal wording is drafted, not approved.** See §16.

---

## 16. Items requiring client confirmation

1. **Razorpay international payments.** A Razorpay account is INR-first.
   Accepting NZD requires International Payments to be separately enabled and
   approved, with KYC and business documents. The NZD path is built and tested;
   it is not commercially verified. If approval is delayed, NZD can be withdrawn
   from the pricing page by deleting price rows in the admin console — prices
   are data, so no code change is needed.
2. **Legal page wording.** `/terms`, `/privacy` and `/refunds` were drafted for
   this phase against New Zealand law (Privacy Act 2020, Consumer Guarantees
   Act, Fair Trading Act). **They have not been reviewed by a lawyer and they
   should be before launch.** They invent no claims about the guarantee beyond
   what the guarantee page already states, and the mandated Aspeq/CAANZ
   disclaimer appears on all three.
3. **Retention periods.** The privacy policy commits to specific figures — 12
   months after account closure, 7 years for tax records, 2 years for claim
   documents, 90 days for logs. These are defensible defaults, not your stated
   policy. Confirm or change them.
4. **Contact details.** The pages point at the contact form. Add a postal
   address and a company/GST number if you are trading as a registered entity.
5. **Social links.** The footer's Instagram, Facebook, YouTube and email icons
   still point at `#`.
6. **The production domain** for `NEXT_PUBLIC_SITE_URL`.

---

## 17. Items that are production-ready

- Build, type-check and lint: **clean**, zero errors, zero warnings
- **806 automated checks passing** across ten suites, stable across
  consecutive runs
- Authentication, authorization and the IDOR audit (32 checks, no skips)
- Payments, entitlements, refunds, coupons
- Mock engine, server timer, scoring, KDR, scorecards, historical immutability
- Guarantee claims and the refund workflow
- Flight School portal, seats, invitations, organisation isolation
- Admin CMS across courses, subjects, chapters, questions, mocks, products,
  orders, coupons, claims, refunds, organisations and students
- File upload security
- Security headers, rate limiting, error boundaries
- SEO: metadata, Open Graph, canonical URLs, `robots.txt`, database-driven
  sitemap, favicon, correct heading hierarchy
- Legal pages (drafted — see §16)
- Responsive and accessibility QA, measured in a real browser
- Migrations verified against a fresh database
- Deployment, backup and recovery documentation

---

## 18. Final recommendation

### READY WITH CONDITIONS

Ship it once these four are done:

1. **Configure and test database and `MEDIA_DIR` backups.** Restore one before
   launch, not after.
2. **Confirm Razorpay international approval**, or withdraw NZD from the pricing
   page until it comes through.
3. **Have the legal pages reviewed**, and confirm the retention periods.
4. **Set `NEXT_PUBLIC_SITE_URL`, configure the mail provider and prove a
   verification email reaches a real inbox, and confirm
   `ALLOW_SANDBOX_PAYMENTS` is unset in the production environment.**

Then make one real purchase end to end before announcing anything. The webhook,
the entitlement and the receipt email are the three things that can only be
proven with real money.

The code is not what is holding this back.
