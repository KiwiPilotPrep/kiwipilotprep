/**
 * Security regression suite — the adversary's playbook, run on every test pass.
 *
 * Each check is a real attack attempted against the running app: open redirect,
 * IDOR, privilege escalation, session forgery, CSRF, price tampering, user
 * enumeration, reflected XSS, and malformed-id handling. They were found and
 * closed during a security audit; this file exists so they cannot quietly come
 * back. Read-only against real data; two throwaway accounts, removed at both
 * ends.
 *
 *   node tests/security.mjs
 */
import { PrismaClient } from "@prisma/client";

const BASE = process.env.TEST_BASE ?? "http://127.0.0.1:3100";
const db = new PrismaClient();
const checks = [];
const t = (name, pass, extra = "") =>
  checks.push(`${pass ? "PASS  " : "FAIL  "}${name}${pass ? "" : `  ← ${extra}`}`);

function jar() {
  return { cookie: "" };
}
async function req(path, { j, method, body, headers, ip } = {}) {
  const res = await fetch(BASE + path, {
    method: method ?? (body ? "POST" : "GET"),
    redirect: "manual",
    headers: {
      ...(typeof body === "string" ? { "content-type": "application/json" } : {}),
      ...(headers ?? {}),
      cookie: j?.cookie ?? "",
      "x-forwarded-for": ip ?? "198.51.100.61",
    },
    body,
  });
  if (j) {
    for (const c of res.headers.getSetCookie?.() ?? []) {
      const [pair] = c.split(";");
      const [n] = pair.split("=");
      const rest = j.cookie.split("; ").filter((x) => x && !x.startsWith(`${n}=`));
      j.cookie = [...rest, pair].join("; ");
    }
  }
  return res;
}
async function actionId(path, j) {
  return (await (await req(path, { j })).text()).match(/ACTION_ID_([a-f0-9]+)/)?.[1];
}
async function signup(j, name, email, ip, extra = {}) {
  const id = await actionId("/signup", j);
  const fd = new FormData();
  fd.set("name", name);
  fd.set("email", email);
  fd.set("password", "Southerly7!wind");
  fd.set("consent", "on");
  for (const [k, v] of Object.entries(extra)) fd.set(k, v);
  fd.set(`$ACTION_ID_${id}`, "");
  await req("/signup", { j, method: "POST", body: fd, ip });
  await db.user.update({ where: { email }, data: { emailVerifiedAt: new Date() } });
}

const stamp = Date.now().toString(36).slice(-5);
const A = `sec-a-${stamp}@example.com`;
const V = `sec-v-${stamp}@example.com`;

async function cleanup() {
  const users = await db.user.findMany({ where: { email: { startsWith: "sec-" } }, select: { id: true } });
  const ids = users.map((u) => u.id);
  if (ids.length) {
    await db.couponRedemption.deleteMany({ where: { userId: { in: ids } } });
    await db.entitlement.deleteMany({ where: { userId: { in: ids } } });
    await db.payment.deleteMany({ where: { order: { userId: { in: ids } } } });
    await db.order.deleteMany({ where: { userId: { in: ids } } });
    await db.emailLog.deleteMany({ where: { userId: { in: ids } } });
    await db.user.deleteMany({ where: { id: { in: ids } } });
  }
}

async function main() {
  await cleanup();
  const attacker = jar();
  const victim = jar();
  await signup(attacker, "Attacker", A, "198.51.100.61", { role: "ADMIN", emailVerifiedAt: new Date().toISOString() });
  await signup(victim, "Victim", V, "203.0.113.31");

  /* --- privilege escalation via mass assignment --- */
  const au = await db.user.findUnique({ where: { email: A }, select: { role: true, emailVerifiedAt: true } });
  t("injected role=ADMIN on signup is ignored", au?.role === "STUDENT", `role=${au?.role}`);

  /* --- anonymous access to protected areas --- */
  for (const path of ["/dashboard", "/admin", "/mocks", "/profile"]) {
    const res = await req(path);
    const loc = res.headers.get("location") ?? "";
    t(`anonymous is refused ${path}`, (res.status >= 300 && res.status < 400 && /\/login/.test(loc)) || res.status === 401 || res.status === 404, `${res.status} → ${loc}`);
  }

  /* --- ordinary user cannot reach admin --- */
  for (const path of ["/admin", "/admin/orders", "/admin/coupons"]) {
    const res = await req(path, { j: attacker });
    const loc = res.headers.get("location") ?? "";
    t(`ordinary user denied ${path}`, (res.status >= 300 && res.status < 400 && !/\/admin/.test(loc)) || res.status === 404, `${res.status} → ${loc}`);
  }

  /* --- open redirect (the audit finding) --- */
  for (const evil of ["//evil.example", "https://evil.example", "/\\evil.example", "\\/evil.example"]) {
    const id = await actionId(`/login?next=${encodeURIComponent(evil)}`, jar());
    const j = jar();
    const fd = new FormData();
    fd.set("email", A);
    fd.set("password", "Southerly7!wind");
    fd.set("next", evil);
    fd.set(`$ACTION_ID_${id}`, "");
    const res = await req("/login", { j, method: "POST", body: fd });
    const loc = res.headers.get("location") ?? "";
    t(`open redirect blocked: next=${evil}`, !loc.includes("evil.example"), `→ ${loc}`);
  }

  /* --- forged / alg:none session tokens are rejected --- */
  const vId = (await db.user.findUnique({ where: { email: V }, select: { id: true } }))?.id;
  for (const forged of ["planted", "eyJhbGciOiJub25lIn0.eyJzdWIiOiJ4In0.", `${vId}`]) {
    const res = await req("/dashboard", { j: { cookie: `kpp_session=${forged}` } });
    const loc = res.headers.get("location") ?? "";
    t(`forged session rejected: ${forged.slice(0, 16)}`, (res.status >= 300 && res.status < 400 && /\/login/.test(loc)) || res.status === 401, `${res.status} → ${loc}`);
  }

  /* --- IDOR on private files --- */
  const vAtt = await db.contactAttachment.findFirst({ select: { id: true } });
  const vFig = await db.mediaAsset.findFirst({ select: { id: true } });
  const vDoc = await db.guaranteeDocument.findFirst({ select: { id: true } });
  if (vAtt) t("IDOR: contact attachment not served to a non-owner", (await req(`/api/contact-attachments/${vAtt.id}`, { j: attacker })).status !== 200);
  if (vFig) t("IDOR: study figure not served without entitlement", (await req(`/api/study-figures/${vFig.id}`, { j: attacker })).status !== 200);
  if (vDoc) t("IDOR: guarantee document not served to a non-owner", (await req(`/api/documents/${vDoc.id}`, { j: attacker })).status !== 200);

  /* --- malformed file ids return 404, never 500 --- */
  for (const bad of ["%00", "..%2f..%2fetc", "'%20OR%201=1--"]) {
    const res = await req(`/api/documents/${bad}`, { j: attacker });
    t(`malformed file id is a clean reject: ${bad}`, res.status === 404 || res.status === 401 || res.status === 400, `status ${res.status}`);
  }

  /* --- IDOR + tampering on checkout --- */
  const product = await db.product.findFirst({ where: { status: "PUBLISHED", prices: { some: { currency: "NZD" } } }, select: { id: true } });
  await req("/api/checkout/create-order", { j: victim, body: JSON.stringify({ productId: product.id, currency: "NZD" }) });
  const vOrder = await db.order.findFirst({ where: { user: { email: V } }, orderBy: { createdAt: "desc" }, select: { id: true, gatewayOrderId: true, status: true } });
  if (vOrder) {
    const s = await req("/api/checkout/sandbox", { j: attacker, body: JSON.stringify({ orderId: vOrder.id, outcome: "success" }) });
    t("IDOR: attacker cannot settle a victim's order", s.status === 403 || s.status === 404, `status ${s.status}`);
    await req("/api/checkout/verify", { j: victim, body: JSON.stringify({ orderId: vOrder.id, razorpayOrderId: vOrder.gatewayOrderId ?? "x", razorpayPaymentId: "pay_x", razorpaySignature: "0".repeat(64) }) });
    const after = await db.order.findUnique({ where: { id: vOrder.id }, select: { status: true } });
    t("payment: a forged signature grants nothing", after?.status !== "PAID", `order ${after?.status}`);
  }
  await req("/api/checkout/create-order", { j: attacker, body: JSON.stringify({ productId: product.id, currency: "NZD", amountMinor: 1, discountMinor: 999999 }) });
  const tOrder = await db.order.findFirst({ where: { user: { email: A }, productId: product.id }, orderBy: { createdAt: "desc" } });
  const realPrice = await db.productPrice.findFirst({ where: { productId: product.id, currency: "NZD" } });
  t("price tampering: server price is used, client amount ignored", tOrder === null || (tOrder.amountMinor === realPrice.amountMinor && tOrder.discountMinor === 0), `${tOrder?.amountMinor}/${tOrder?.discountMinor}`);

  /* --- CSRF: server action from a foreign origin --- */
  const cid = await actionId("/login", jar());
  const cf = new FormData();
  cf.set("email", A);
  cf.set("password", "Southerly7!wind");
  cf.set(`$ACTION_ID_${cid}`, "");
  const csrf = await fetch(`${BASE}/login`, { method: "POST", redirect: "manual", headers: { origin: "https://evil.example" }, body: cf });
  t("CSRF: server action from a foreign origin is refused", csrf.status === 403 || csrf.status >= 400, `status ${csrf.status}`);

  /* --- no user enumeration on password reset --- */
  const mk = async (email) => {
    const id = await actionId("/forgot", jar());
    const j = jar();
    const fd = new FormData();
    fd.set("email", email);
    fd.set(`$ACTION_ID_${id}`, "");
    return req("/forgot", { j, method: "POST", body: fd });
  };
  const un = await mk(`nobody-${stamp}@example.com`);
  const kn = await mk(A);
  t("no user enumeration on password reset", un.status === kn.status, `${un.status} vs ${kn.status}`);

  /* --- reflected XSS --- */
  const xss = await (await req(`/pricing?currency=%22%3E%3Cscript%3Ealert(1)%3C/script%3E`)).text();
  t("reflected XSS in a query param is escaped", !xss.includes("<script>alert(1)</script>"));

  /* --- session cookie flags + security headers --- */
  const loginJar = jar();
  const lid = await actionId("/login", loginJar);
  const lf = new FormData();
  lf.set("email", A);
  lf.set("password", "Southerly7!wind");
  lf.set(`$ACTION_ID_${lid}`, "");
  const lr = await req("/login", { j: loginJar, method: "POST", body: lf });
  const sess = (lr.headers.getSetCookie?.() ?? []).find((c) => c.startsWith("kpp_session="));
  t("session cookie is HttpOnly + SameSite", Boolean(sess) && /httponly/i.test(sess) && /samesite/i.test(sess), sess?.slice(0, 70));

  const pg = await req("/pricing");
  t("CSP restricts to self", (pg.headers.get("content-security-policy") ?? "").includes("default-src 'self'"));
  t("clickjacking blocked (X-Frame-Options DENY)", pg.headers.get("x-frame-options") === "DENY");
  t("MIME sniffing blocked (nosniff)", pg.headers.get("x-content-type-options") === "nosniff");

  await cleanup();
  console.log(checks.join("\n"));
  const failed = checks.filter((c) => c.startsWith("FAIL")).length;
  console.log(`\n${checks.filter((c) => c.startsWith("PASS")).length}/${checks.length} passed`);
  await db.$disconnect();
  process.exit(failed ? 1 : 0);
}

main().catch(async (e) => {
  console.error(e);
  await cleanup().catch(() => {});
  await db.$disconnect();
  process.exit(1);
});
