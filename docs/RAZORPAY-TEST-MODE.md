# Razorpay — Test Mode setup

**Live Mode is intentionally not configured.** Everything below is Test Mode
only. No live credentials exist in this project, and none should be added until
Test Mode has been proved end to end with a real card.

---

## 1. Environment variables

All three are server-side only. None reaches the browser, and the build is
checked for that.

| Variable | Where to find it | Notes |
|---|---|---|
| `RAZORPAY_KEY_ID` | Dashboard → Settings → API Keys | Starts `rzp_test_`. Sent to the browser for Checkout — this one is *meant* to be public. |
| `RAZORPAY_KEY_SECRET` | Shown **once**, when the key is generated | **Never** starts with `rzp_`. If yours does, you have pasted a Key ID. |
| `RAZORPAY_WEBHOOK_SECRET` | Dashboard → Settings → Webhooks, when you add the endpoint | Only needed once a public URL exists. |

They can live in `.env` or `.env.local` — Next reads both, and `.env.local`
wins. Both are covered by `.gitignore`.

### The mistake that costs an afternoon

A Razorpay **Key ID** and **Key Secret** look nothing alike:

```
RAZORPAY_KEY_ID="rzp_test_AbCdEfGhIjKlMn"      ← prefix + 14 characters
RAZORPAY_KEY_SECRET="AbCdEfGhIjKlMnOpQrStUvWx" ← 24 characters, NO prefix
```

Pasting a Key ID into the secret gives `Authentication failed` from Razorpay
and a `502 Could not start checkout` in the app.

**A wrong key is worse than no key.** With `RAZORPAY_KEY_ID` present the app
stops using the local sandbox and calls the real Razorpay, so an invalid secret
takes checkout down entirely rather than falling back. That is deliberate —
silently serving a fake gateway would be far more dangerous — but it means the
credentials must be right before checkout works at all.

### Switching off the sandbox

Once real test keys are in place, remove `ALLOW_SANDBOX_PAYMENTS` so the
sandbox adapter cannot be reached:

```bash
# .env — delete this line once Razorpay test keys are working
ALLOW_SANDBOX_PAYMENTS="true"
```

---

## 2. Making a test purchase

1. Start the app: `npm run build && npm start -- -p 3100`
2. Sign up, **confirm the email**, and sign in. An unverified account is
   refused at the API, not just in the UI.
3. Open `/pricing` and buy any package.
4. Razorpay Checkout opens with the server-created order.

**Razorpay's own test instruments** — do not invent card numbers:

| Method | Value |
|---|---|
| UPI success | `success@razorpay` |
| UPI failure | `failure@razorpay` |
| Cards | Razorpay's published test card list |

Their test cards change; take them from Razorpay's current documentation rather
than from any list copied into a repository.

---

## 3. Verifying a payment worked

After a successful test payment, check the database rather than the screen:

```sql
SELECT o.reference, o.status, o."amountMinor", o.currency,
       p."gatewayPaymentId", p.status AS payment_status
FROM "Order" o
LEFT JOIN "Payment" p ON p."orderId" = o.id
ORDER BY o."createdAt" DESC LIMIT 5;
```

You should see `Order.status = PAID`, a `Payment` row with a
`gatewayPaymentId`, an `Entitlement` for the buyer, and one `EmailLog` row with
`template = 'payment-receipt'`.

The UI never decides access. The success page reads the entitlement the server
created — refreshing it changes nothing.

---

## 4. Webhooks

The endpoint exists and is ready: **`POST /api/webhooks/razorpay`**

- POST only
- Reads the raw body (parsing and re-stringifying would break the signature)
- Verifies `x-razorpay-signature` against `RAZORPAY_WEBHOOK_SECRET`
- Rejects an unverifiable signature with **401** — the status Razorpay retries
  on, which is what you want if the secret was briefly wrong
- Handles `payment.authorized`, `payment.captured`, `order.paid`,
  `payment.failed`
- Idempotent: `Payment.gatewayPaymentId` is unique, entitlements upsert on
  `(userId, scopeKey)`, and the receipt email is sent once per order

**Do not configure the dashboard webhook yet.** The site is not publicly
deployed, so Razorpay has nowhere to deliver to.

### After deployment, in the Razorpay dashboard

1. Settings → **Webhooks** → Add New Webhook
2. URL: `https://kiwipilotprep.co.nz/api/webhooks/razorpay`
3. Select events: `payment.authorized`, `payment.captured`, `payment.failed`,
   `order.paid`
4. Copy the **webhook secret** it generates into `RAZORPAY_WEBHOOK_SECRET`
5. Redeploy so the app picks up the secret
6. Make one test payment and confirm the delivery shows 200 in the dashboard's
   webhook log

Until step 4 is done, `RAZORPAY_WEBHOOK_SECRET` is unset and the endpoint falls
back to the gateway secret — fine locally, wrong in production.

---

## 5. What is enforced server-side

None of this depends on the browser behaving:

- Authenticated, **active**, and **email-verified** — checked before the
  product is even looked up, so an unverified account cannot cause a Razorpay
  order to exist
- Price, currency and product read from the database; an amount in the request
  body is ignored
- Duplicate purchase refused with `alreadyOwned`
- Signature recomputed server-side with `timingSafeEqual`
- A payment is never marked paid because Checkout closed
- No card number, CVV or bank credential is ever stored

---

## 6. Running the tests

```bash
npm run build
npm start -- -p 3100
npm run test:razorpay
```

41 checks covering the brief's twenty cases: order creation permissions, price
tampering, signature verification both ways, entitlement creation, failed and
cancelled payments, replayed callbacks and webhooks, duplicate purchase,
the Complete Aviator Pass, success-page refresh, unknown orders, and receipt
email idempotency.

They run against whichever adapter is configured. The signature scheme,
verification, fulfilment, idempotency constraints and entitlement grant are the
same either way — only the network call to Razorpay differs.
