# KiwiPilotPrep — operations runbook

What an operator needs in order to deploy this safely and get it back after a
bad day. Everything here has been run against a real copy of the database
except where it says otherwise.

---

## 1. Deployment platform

**CONFIGURATION REQUIRED.** The repository carries no deployment manifest —
no Dockerfile, no `vercel.json`, `fly.toml`, `render.yaml`, `Procfile` or CI
workflow — so the hosting platform has not been chosen yet. Every section
below that depends on the platform says so.

What exists today is a local development stack: Next.js on port 3100 and a
portable PostgreSQL 16.4 under `.dev/pgsql`, listening on 127.0.0.1:5433.
There is no PgBouncer or other pooler in front of it.

---

## 2. Database connection pool

Prisma sizes its pool at `cpus * 2 + 1` unless told otherwise. On the
16-core machine this was measured on that is **33 connections per instance**,
against a `max_connections` of 100 — so a third instance cannot connect.

`DATABASE_URL` therefore carries an explicit budget:

```
?schema=public&connection_limit=10&pool_timeout=10
```

Size it for your own deployment:

```
instances x connection_limit  <=  max_connections
                                  - superuser_reserved_connections   (3)
                                  - migrations                       (2)
                                  - admin psql and monitoring        (~7)
```

With `max_connections=100` that leaves roughly 88 to share out. At 10 per
instance, eight instances fit with room to spare.

Measured on one instance, 100 concurrent students, 600 requests:

| `connection_limit` | Postgres connections | p95 | 5xx |
| --- | --- | --- | --- |
| 33 (Prisma default) | 34 | 1026 ms | 0 |
| 20 | 21 | 1069 ms | 0 |
| **10** | **11** | **1160 ms** | **0** |

The database is not the bottleneck — the hot queries run in under 0.15 ms —
so the smaller pool costs about 13% at the 95th percentile and buys four
times the instance headroom. No pool timeout occurred at any size, including
through a 1,200-request burst.

If you deploy behind PgBouncer or a platform-managed pooler, point
`DATABASE_URL` at the pooler, add `&pgbouncer=true`, and size
`connection_limit` to the pooler's per-client budget instead.

In production also append `&sslmode=require`.

---

## 3. Migrations

```
npm run db:migrate:status     # what is applied, what is pending
npm run db:migrate:deploy     # production: plays pending migrations forward
npm run db:migrate            # development only, refuses under NODE_ENV=production
```

`prisma migrate dev` can decide the schema has drifted and offer to reset the
database. That prompt must never appear near production data, so
`scripts/no-prod-migrate-dev.mjs` refuses to run it when `NODE_ENV=production`.

**Deploy order:** run `db:migrate:deploy` *before* the new application
version starts serving. Migrations in this repository are additive —
`ADD COLUMN IF NOT EXISTS`, new tables, new indexes — so an older instance
can keep serving while they run.

**Rollback:** Prisma has no down-migrations. To undo a release, deploy the
previous application build; the extra columns it does not know about are
harmless. To undo a *schema* change, write a new forward migration that
reverses it. Never edit or delete a migration that has been applied.

One historical migration, `20260916090000_course_module_summary`, is recorded
as rolled back with `applied_steps_count: 0`. It left no partial state and
must be left exactly as it is.

---

## 4. Health and readiness

```
GET /api/health
```

- `200` — the process is up and the database answered `SELECT 1`.
- `503` — the process is up but the database is not reachable.

```json
{"status":"ok","checks":{"application":"ok","database":"ok"},"databaseLatencyMs":0}
```

No authentication, no caching, and nothing in the body but those three
fields — it is a public endpoint, so the reason for a failure goes to the
server log rather than to the caller.

Point the load balancer's readiness probe at it so an instance that cannot
reach Postgres is taken out of rotation instead of being restarted forever.
Covered by `tests/health.mjs` (18 checks, both the 200 and the 503 path).

---

## 5. Backup

**CONFIGURATION REQUIRED for scheduling and retention** — that belongs to
whichever managed Postgres you deploy on. Before going live, record here:

- provider and plan
- automated backup frequency
- point-in-time recovery window
- retention period
- where backups are stored, and who can read them

Most managed Postgres services (RDS, Cloud SQL, Neon, Supabase, Render,
Railway) provide daily snapshots and PITR on paid tiers. **Use the
platform's own mechanism.** Do not build a backup system inside the
application, and never commit a dump to the repository.

If you must take one by hand — before a risky migration, say — use
`pg_dump`'s custom format:

```bash
pg_dump -h HOST -p PORT -U USER -Fc -f kpp-$(date +%Y%m%d-%H%M).dump kiwipilotprep
```

It is read-only against the source. Store it outside the repository, treat it
as containing personal data, and delete it when it is no longer needed.

### Files are not in the database

`MEDIA_DIR` holds guarantee documents, contact attachments and study
figures. **A database backup does not include them.** Back that directory up
on the same schedule, or move it to object storage — `lib/storage/index.ts`
is written so an S3 or R2 driver slots in without callers changing.

---

## 6. Restore — verified

This procedure was run end to end against a copy of the live database. The
real database was never written to, and the copy was dropped afterwards.

```bash
# 1. Dump the source. Read-only.
pg_dump -h HOST -p PORT -U USER -Fc -f kpp.dump kiwipilotprep

# 2. Create an isolated target. Never restore over a live database.
createdb -h HOST -p PORT -U USER kpp_restore_test

# 3. Restore.
pg_restore -h HOST -p PORT -U USER -d kpp_restore_test \
  --no-owner --no-privileges kpp.dump

# 4. Verify: tables, row counts, indexes, foreign keys, migration history.
psql -d kpp_restore_test -c "SELECT count(*) FROM information_schema.tables WHERE table_schema='public'"
psql -d kpp_restore_test -c "ANALYZE; SELECT relname, n_live_tup FROM pg_stat_user_tables ORDER BY relname"
psql -d kpp_restore_test -c "SELECT count(*) FROM _prisma_migrations WHERE finished_at IS NOT NULL"

# 5. Point the application at the copy and check it serves.
DATABASE_URL="postgresql://…/kpp_restore_test?schema=public" npx next start -p 3212
curl http://127.0.0.1:3212/api/health

# 6. Drop the copy and delete the dump.
dropdb -h HOST -p PORT -U USER kpp_restore_test
```

Measured on 2026-09-13 against the development database:

| | Source | Restored |
| --- | --- | --- |
| Tables | 53 | 53 |
| Rows | 30,669 | 30,669 (identical table by table) |
| Indexes | 188 | 188 |
| Foreign keys | 100 | 100 |
| Applied migrations | 28 | 28 |
| Dump | 2,263,956 bytes in 0.55 s | restored in 1.69 s |

The application served `/api/health` → 200, and `/`, `/pricing` and `/login`
→ 200 from the restored copy, with `/pricing` rendering the real `$699`.

**Repeat this drill against the production provider once it is chosen** — a
restore that has only been proven on a development database is not yet proof
about production.

---

## 7. Environment

`.env` is gitignored; `.env.example` carries placeholders only and is the
reference for every variable. Never commit a filled-in `.env`.

Before going live, confirm:

- `NODE_ENV=production`
- `DATABASE_URL` — production database, `sslmode=require`, pool sized as above
- `AUTH_SECRET` — 32 random bytes, unique to production. Rotating it signs everyone out
- `NEXT_PUBLIC_SITE_URL` — the public origin, no trailing slash, **not** localhost
- `MEDIA_DIR` — a persistent volume, **outside** the web root, backed up (§5)
- `RESEND_API_KEY`, `EMAIL_FROM` — a verified sending domain
- `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` — **live** keys (`rzp_live_`), not `rzp_test_`
- `RAZORPAY_WEBHOOK_SECRET` — **required.** Left empty the app falls back to a
  sandbox secret derived from `AUTH_SECRET`, so every real webhook is rejected
  as a forgery and paid orders are never settled by it
- `ALLOW_SANDBOX_PAYMENTS` — absent, or `false`

---

## 8. Deployment checklist

1. `npm ci`
2. `npm run db:migrate:status` — confirm what is pending
3. `npm run db:migrate:deploy`
4. `npm run build`
5. Start the new version
6. `curl https://<host>/api/health` → `200` with `"database":"ok"`
7. Smoke test: `/`, `/pricing`, `/login`, sign in, open a mock
8. Register the Razorpay webhook at `POST /api/webhooks/razorpay` and confirm
   `RAZORPAY_WEBHOOK_SECRET` matches the dashboard
9. Confirm the readiness probe is wired to `/api/health`
10. Confirm backups are scheduled and record the settings in §5
