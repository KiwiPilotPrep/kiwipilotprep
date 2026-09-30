# Deployment

Everything needed to put KiwiPilotPrep into production, and to get it back if
something goes wrong. Written to be followed by someone who did not build it.

---

## 1. What you are deploying

One Next.js application serving three audiences from one process:

| Surface | Routes | Who reaches it |
|---|---|---|
| Public site | `/`, `/courses`, `/pricing`, `/flight-schools`, `/terms`, `/privacy`, `/refunds` | anyone |
| Student platform | `/dashboard`, `/courses/**`, `/mocks/**`, `/progress`, `/checkout/**`, `/guarantee` | signed-in students |
| Admin console | `/admin/**` | users with `role = ADMIN` |
| Flight school portal | `/org/**` | users with an `OrganizationMember` row |

There is no second service to deploy. The admin console is not a separate app
and must not be exposed on a separate hostname without also moving the session
cookie, which is scoped to the origin.

**Requirements**

- Node.js 20 LTS or newer
- PostgreSQL 16 or newer, with TLS
- Persistent disk for `MEDIA_DIR` (guarantee-claim documents)
- Outbound HTTPS to `api.razorpay.com` and the email provider

---

## 2. Environment

Copy `.env.example` and fill it in. The variables that will hurt you if they
are wrong:

| Variable | Consequence of getting it wrong |
|---|---|
| `AUTH_SECRET` | A weak or shared secret means forgeable sessions. Generate with `openssl rand -base64 32`. Rotating it signs everyone out — which is the correct response to a suspected leak. |
| `DATABASE_URL` | Add `?sslmode=require` in production. |
| `NEXT_PUBLIC_SITE_URL` | Canonical URLs, Open Graph tags, `robots.txt` and the sitemap all derive from it. Leave it unset and they point at localhost. |
| `ALLOW_SANDBOX_PAYMENTS` | **Must be absent or `false`.** Set in production it would let anyone grant themselves paid access with a locally-signed payment. |
| `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` | Server-side only. Never in client code, a build log, or a screenshot. |
| `MEDIA_DIR` | Must be outside the web root and outside the repository, on a disk included in backups. |

Verify before going live:

```bash
node -e "if (process.env.ALLOW_SANDBOX_PAYMENTS === 'true') { console.error('SANDBOX PAYMENTS ARE ON'); process.exit(1) } else console.log('sandbox off — ok')"
```

---

## 3. First deployment

```bash
npm ci
npx prisma migrate deploy        # applies migrations; never use `db push`
npx prisma generate
npm run build
npm start                        # or your process manager
```

**Seeding.** Do **not** run `prisma/seed.ts` against production — it creates
accounts with passwords published in this repository and refuses to run against
a non-local `DATABASE_URL` for that reason. Seed real content this way:

```bash
npx tsx prisma/seed-syllabus.ts   # course/subject structure
npx tsx prisma/seed-subjects.ts   # single-subject products
```

Then create the first admin by hand:

```bash
node -e "
const {PrismaClient}=require('@prisma/client');const bcrypt=require('bcryptjs');
const db=new PrismaClient();
(async()=>{
  await db.user.create({data:{
    email: process.env.ADMIN_EMAIL,
    name: 'Administrator',
    role: 'ADMIN',
    passwordHash: await bcrypt.hash(process.env.ADMIN_PASSWORD, 12),
  }});
  await db.\$disconnect();
})()"
```

Pass `ADMIN_EMAIL` and `ADMIN_PASSWORD` as environment variables for that one
command so the password never lands in your shell history. Change it after the
first sign-in.

---

## 4. Razorpay

1. In the Razorpay dashboard, create the API key pair. Live keys begin
   `rzp_live_`; test keys begin `rzp_test_`.
2. Register a webhook at `https://<your-domain>/api/webhooks/razorpay` for the
   events `payment.captured` and `payment.failed`.
3. Copy the webhook secret into `RAZORPAY_WEBHOOK_SECRET`.

The webhook is not optional. The browser-side confirmation and the webhook both
call the same fulfilment path, which is idempotent by database constraint — so
if a student closes the tab immediately after paying, the webhook still grants
their access.

**Verify after deploying:** make one real low-value purchase, confirm the order
reaches `PAID`, the entitlement is granted, and the receipt email arrives. Then
refund it from the Razorpay dashboard.

### NZD is not automatically available

The application is built to charge in NZD and INR, and both are exercised end
to end by the test suite against the sandbox gateway. That is not the same as
the Razorpay account being able to take them.

A Razorpay account is INR-first. Accepting NZD — and accepting cards issued
outside India at all — requires **International Payments to be separately
enabled on the account**, which Razorpay grants after reviewing the business.
Expect to supply KYC documents, business registration, a website URL with
visible pricing, and Terms/Privacy/Refund pages (all three now exist at
`/terms`, `/privacy` and `/refunds`, which is one of the things the review
looks for). Settlement currency, FX handling and any additional fee are set by
Razorpay on approval.

**Confirm before launch,** because none of it can be checked from the code:

- [ ] International Payments is enabled and approved on the live account
- [ ] NZD is an accepted presentment currency on that account
- [ ] A test transaction in NZD settles, not just authorises
- [ ] The settlement currency and FX treatment are understood and acceptable

Until that is confirmed, treat the NZD path as **built and tested but not
commercially verified**. If approval is delayed, the pricing page can be
limited to INR by removing the NZD price rows in the admin console — no code
change is needed, because prices are data.

---

## 4a. Email is now on the critical path

Since email verification was added, **the signup funnel does not work without a
working mail provider.** A new account is asked to confirm its address before
it can start a free trial or buy anything. With `RESEND_API_KEY` unset, nothing
is delivered — the link is printed to the server console instead, which is
correct for development and useless in production.

Set up before launch:

1. `RESEND_API_KEY` and an `EMAIL_FROM` address on a domain you control.
2. **SPF, DKIM and DMARC** on that domain. Confirmation mail is exactly the
   kind of message that lands in spam without them, and a student who never
   sees the link cannot buy.
3. Send one real verification to an address on a different provider — Gmail,
   Outlook — and confirm it arrives in the inbox, not the spam folder.

**What a person does if the mail never arrives:** they can resend from
`/verify/sent` (throttled to once a minute), and the reminder banner on every
signed-in page links there. If they mistyped the address entirely, they contact
you and an admin corrects it. There is no way for them to get stuck silently.

**Tokens are never stored.** Only a SHA-256 hash of the verification token is
kept, and the message body is redacted out of `EmailLog` for anything carrying
a single-use link — verification and flight-school invitations both. Someone
with read access to the database cannot verify an account or accept an
invitation they were not sent.

### Verifying the sending domain in Resend

Delivery is only reliable once Resend has verified the domain in `EMAIL_FROM`.
Until then, messages are far more likely to be filed as spam or rejected
outright — and a confirmation link a student never sees is a student who
cannot buy.

The steps, in order:

1. Add the domain in the Resend dashboard (Domains → Add Domain).
2. Resend generates the exact DNS records for that domain. **Add the records
   Resend gives you** — do not copy records from anywhere else, including this
   document. They are specific to your domain and account.
3. Wait for Resend to show the domain as Verified.
4. Set `EMAIL_FROM` to an address on that domain.
5. Send one real verification to an inbox on a different provider (Gmail,
   Outlook) and confirm it lands in the inbox, not the spam folder.

**Production email is not ready until all five are done.** Steps 1–4 can be
seen from the dashboard; step 5 cannot be inferred from anything in this
repository, which is why it is on the pre-launch checklist rather than being
assumed.

---

## 5. Releasing a change

```bash
npm ci
npx prisma migrate deploy
npm run build
# restart the process
```

Migrations run before the new code starts. Every migration in this repository
is additive; if you ever write one that drops a column, take a backup first and
deploy it in two releases (stop writing the column, then drop it).

---

## 6. Backups

**What must be backed up**

| Data | Where | Why it cannot be recreated |
|---|---|---|
| PostgreSQL database | your database host | students' progress, purchases, mock attempts, guarantee claims |
| `MEDIA_DIR` | application disk | uploaded Aspeq result sheets — the evidence behind refund decisions |

The `.next` build directory and `node_modules` are rebuilt from source and do
not need backing up.

**Taking a backup**

```bash
pg_dump --format=custom --no-owner "$DATABASE_URL" > kpp-$(date +%F).dump
tar czf kpp-media-$(date +%F).tar.gz "$MEDIA_DIR"
```

**Suggested schedule:** nightly automated dump retained 30 days, weekly
retained 12 weeks, plus a manual dump immediately before any release that
carries a migration.

**Restoring**

```bash
createdb kiwipilotprep_restore
pg_restore --no-owner --dbname=kiwipilotprep_restore kpp-2026-09-06.dump
tar xzf kpp-media-2026-09-06.tar.gz -C /
```

Restore into a *new* database first and point a staging instance at it. Only
repoint production once you have confirmed the data is what you expected.

**A backup you have not restored is not a backup.** Run the restore drill
quarterly and write down how long it took — that number is your real recovery
time objective.

---

## 7. If something goes wrong

| Symptom | First thing to check |
|---|---|
| Students paid but have no access | `Order.status` vs `Entitlement` rows for that user; re-deliver the webhook from the Razorpay dashboard — fulfilment is idempotent, so replaying is safe |
| Everyone signed out at once | `AUTH_SECRET` changed or is missing |
| Checkout returns 502 | Razorpay credentials, or outbound network |
| Payment succeeds but signature fails | `RAZORPAY_KEY_SECRET` does not match the key that created the order |
| Claim documents 404 | `MEDIA_DIR` not mounted, or pointing somewhere new |
| Mock timers expiring instantly | server clock drift — timers are server-authoritative |

**Suspected credential leak:** rotate `AUTH_SECRET` (signs everyone out), roll
the Razorpay key pair and webhook secret in the dashboard, then redeploy. Do
this in that order so no window exists where old sessions still work against
new keys.

---

## 8. Monitoring

Watch, at minimum:

- `Order` rows sitting in `PENDING` for more than an hour — a fulfilment path
  that is failing silently
- Failed webhook deliveries in the Razorpay dashboard
- 5xx rate on `/api/checkout/*`
- Disk usage on `MEDIA_DIR`
- Database connection count

Expired mock attempts are swept on read rather than by a cron job, so no
scheduled task is required for the exam engine.
