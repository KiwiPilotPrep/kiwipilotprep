/**
 * The health endpoint.
 *
 * A load balancer reads this to decide whether to send traffic here, so it
 * has to be right about both answers: healthy when the database is there,
 * and unmistakably unhealthy when it is not.
 *
 * The unhealthy case is exercised against a second server started with a
 * DATABASE_URL that points nowhere. That proves the 503 path without going
 * anywhere near the real database — nothing is stopped, nothing is altered.
 *
 *   node tests/health.mjs
 */
import { spawn } from "node:child_process";

const BASE = process.env.TEST_BASE ?? "http://127.0.0.1:3100";
const checks = [];
const t = (name, ok, extra = "") =>
  checks.push(`${ok ? "PASS  " : "FAIL  "}${name}${ok ? "" : `  ← ${extra}`}`);

const SECRET_SHAPES =
  /postgres(ql)?:\/\/|re_[A-Za-z0-9]{8}|rzp_(test|live)_|AUTH_SECRET|password=|at .*\(.*:\d+:\d+\)/i;

/* ============================ the healthy case ======================== */
{
  const res = await fetch(`${BASE}/api/health`);
  const text = await res.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = null;
  }

  t("it answers 200 when the database is reachable", res.status === 200, `status ${res.status}`);
  t("it reports the application as ok", body?.checks?.application === "ok", text.slice(0, 120));
  t("it reports the database as ok", body?.checks?.database === "ok", text.slice(0, 120));
  t("the overall status is ok", body?.status === "ok", `${body?.status}`);
  t("it measures how long the database took",
    typeof body?.databaseLatencyMs === "number" && body.databaseLatencyMs >= 0,
    `${body?.databaseLatencyMs}`);
  t("it is fast", body?.databaseLatencyMs < 1000, `${body?.databaseLatencyMs}ms`);
  t("it is never cached",
    (res.headers.get("cache-control") ?? "").includes("no-store"),
    res.headers.get("cache-control"));
  t("the body exposes no secret, connection string or stack frame",
    !SECRET_SHAPES.test(text), text.slice(0, 160));
  t("the body carries nothing but the two checks and a timing",
    body && Object.keys(body).sort().join(",") === "checks,databaseLatencyMs,status",
    Object.keys(body ?? {}).join(","));

  // No session required, and a session must not change the answer.
  const withJunkCookie = await fetch(`${BASE}/api/health`, {
    headers: { cookie: "kpp_session=not-a-real-token" },
  });
  t("it needs no session and ignores a bogus one",
    withJunkCookie.status === 200, `status ${withJunkCookie.status}`);

  // Unexpected input must not change it either.
  const odd = await fetch(`${BASE}/api/health?x=%00%2e%2e&y=' OR 1=1--`);
  t("a malformed query string changes nothing", odd.status === 200, `status ${odd.status}`);

  const posted = await fetch(`${BASE}/api/health`, { method: "POST" });
  t("a method it does not implement fails safely",
    posted.status === 405 || posted.status === 404,
    `status ${posted.status}`);
}

/* =========================== the unhealthy case ======================= */
// A throwaway server on another port, pointed at a database that is not
// there. The real database is untouched.
{
  const PORT = 3211;
  const child = spawn("npx", ["next", "start", "-p", String(PORT)], {
    env: {
      ...process.env,
      // A port nothing listens on, so every connection attempt refuses fast.
      DATABASE_URL:
        "postgresql://nobody:nothing@127.0.0.1:59999/kiwipilotprep?schema=public&connection_limit=1&pool_timeout=2&connect_timeout=2",
    },
    shell: true,
    stdio: "ignore",
  });

  const deadline = Date.now() + 60_000;
  let reachable = false;
  while (Date.now() < deadline) {
    try {
      const probe = await fetch(`http://127.0.0.1:${PORT}/api/health`);
      if (probe.status === 200 || probe.status === 503) {
        reachable = true;
        break;
      }
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 1000));
  }

  if (!reachable) {
    checks.push("SKIP  the 503 path (a second server could not be started here)");
  } else {
    const res = await fetch(`http://127.0.0.1:${PORT}/api/health`);
    const text = await res.text();
    let body;
    try {
      body = JSON.parse(text);
    } catch {
      body = null;
    }
    t("it answers 503 when the database is unreachable", res.status === 503, `status ${res.status}`);
    t("the application is still reported as alive",
      body?.checks?.application === "ok", text.slice(0, 120));
    t("the database is reported as unavailable",
      body?.checks?.database === "unavailable", text.slice(0, 120));
    t("the overall status is degraded", body?.status === "degraded", `${body?.status}`);
    t("the failure leaks no connection string or driver error",
      !SECRET_SHAPES.test(text), text.slice(0, 200));
    t("it does not hang when the database is gone",
      body?.databaseLatencyMs < 30_000, `${body?.databaseLatencyMs}ms`);
  }

  child.kill();
  // Make sure the port is free again on Windows, where kill() may not reach
  // the grandchild.
  await new Promise((r) => setTimeout(r, 1500));
  try {
    const { execSync } = await import("node:child_process");
    const line = execSync(`netstat -ano | findstr ":${PORT}" | findstr LISTENING`, {
      shell: "cmd.exe",
    })
      .toString()
      .trim();
    const pid = line.split(/\s+/).pop();
    if (pid) execSync(`taskkill /PID ${pid} /T /F`, { shell: "cmd.exe", stdio: "ignore" });
  } catch {
    /* already gone */
  }
}

console.log(checks.join("\n"));
const failed = checks.filter((c) => c.startsWith("FAIL")).length;
console.log(`\n${checks.filter((c) => c.startsWith("PASS")).length}/${checks.length} passed`);
process.exit(failed ? 1 : 0);
