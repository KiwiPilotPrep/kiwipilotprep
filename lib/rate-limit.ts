import "server-only";

/**
 * In-process rate limiting for sensitive endpoints (phase 6 §25).
 *
 * A fixed window per key, held in memory. That is deliberately modest: it
 * protects a single instance against scripted abuse without adding Redis to
 * the stack for this phase. Behind multiple instances each one keeps its own
 * counter, so treat these as a speed bump, not a hard quota — the note in
 * README says the same rather than implying stronger protection than exists.
 */

type Window = { count: number; resetAt: number };

const WINDOWS = new Map<string, Window>();

/** Stops the map growing without bound on a long-lived process. */
function sweep(now: number) {
  if (WINDOWS.size < 5000) return;
  for (const [key, win] of WINDOWS) {
    if (win.resetAt <= now) WINDOWS.delete(key);
  }
}

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

export async function rateLimit(
  key: string,
  { limit, windowMs, count = true }: { limit: number; windowMs: number; count?: boolean },
): Promise<RateLimitResult> {
  const now = Date.now();
  sweep(now);

  const win = WINDOWS.get(key);

  if (!win || win.resetAt <= now) {
    if (count) WINDOWS.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - (count ? 1 : 0), retryAfterSeconds: 0 };
  }

  // `count: false` asks whether the caller is currently over the line without
  // spending any of the budget. It lets a login check the limit before doing
  // the work and then charge only the attempts that actually failed.
  const next = win.count + (count ? 1 : 0);
  if (count) win.count = next;

  if (next > limit) {
    return {
      ok: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((win.resetAt - now) / 1000)),
    };
  }

  return { ok: true, remaining: limit - next, retryAfterSeconds: 0 };
}

/** Forgets a key entirely — used to clear a failure budget on success. */
export function clearRateLimit(key: string) {
  WINDOWS.delete(key);
}

/**
 * Identifier for an unauthenticated caller. Falls back to a constant when no
 * proxy header is present, which throttles anonymous traffic as a group rather
 * than not at all.
 */
export function clientKey(request: Request, prefix: string): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "anon";
  return `${prefix}:${ip}`;
}

/**
 * Caller identity inside a Server Action, where there is no Request object.
 *
 * Reads the same proxy headers as `clientKey`. Behind a proxy that does not
 * set them everyone shares one bucket, which throttles anonymous traffic as a
 * group rather than not at all — deliberately the safe direction to fail.
 */
export async function actionKey(prefix: string): Promise<string> {
  const { headers } = await import("next/headers");
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || h.get("x-real-ip") || "anon";
  return `${prefix}:${ip}`;
}
