import { NextResponse } from "next/server";

import { db } from "@/lib/db";

/**
 * GET /api/health
 *
 * Liveness and readiness in one answer, for a load balancer or an uptime
 * check. No session is required: a health probe has no credentials, and an
 * endpoint that only answers to a signed-in user cannot tell an orchestrator
 * anything.
 *
 * 200 means the process is up AND the database answered. 503 means the
 * process is up but a dependency it cannot work without is not. The
 * distinction is the point: a container that is alive but cannot reach
 * Postgres should be taken out of rotation, not restarted forever.
 *
 * The body says whether each check passed and how long the database took,
 * and nothing else. No connection string, no error text from the driver, no
 * schema, no versions — a health endpoint is unauthenticated, so anything it
 * returns is public. The reason for a failure goes to the server log, where
 * an operator can read it and a stranger cannot.
 */

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const startedAt = Date.now();
  let databaseOk = false;

  try {
    // The cheapest question that still proves a real round trip: it uses a
    // pooled connection and returns without touching a table.
    await db.$queryRaw`SELECT 1`;
    databaseOk = true;
  } catch (error) {
    // Logged for the operator, never returned to the caller.
    console.error(
      "[health] database check failed:",
      error instanceof Error ? error.message : "unknown error",
    );
  }

  const body = {
    status: databaseOk ? "ok" : "degraded",
    checks: {
      application: "ok",
      database: databaseOk ? "ok" : "unavailable",
    },
    databaseLatencyMs: Date.now() - startedAt,
  };

  return NextResponse.json(body, {
    status: databaseOk ? 200 : 503,
    headers: {
      // Never let a proxy or CDN answer a health check from cache.
      "cache-control": "no-store, no-cache, must-revalidate",
      "x-content-type-options": "nosniff",
    },
  });
}
