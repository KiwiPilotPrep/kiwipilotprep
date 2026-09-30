/**
 * The content pipeline: what is in the database is what the public site
 * shows, and archiving something takes it away again.
 *
 * This used to drive the admin course forms over HTTP. Those screens were
 * removed — the curriculum is built from `content/` by the build scripts and
 * reviewed in code, not typed into a console — so the fixture is written
 * directly now. The assertions are unchanged: they were never about the
 * forms, they were about the rows reaching the student site without a
 * deployment.
 *
 * Run against a started server:  node tests/admin-cms.mjs
 */
import { PrismaClient } from "@prisma/client";

const BASE = process.env.TEST_BASE ?? "http://localhost:3100";
const db = new PrismaClient();

const checks = [];
const t = (name, ok, extra = "") =>
  checks.push(`${ok ? "PASS  " : "FAIL  "}${name}${ok ? "" : `  ← ${extra}`}`);

/**
 * Each simulated person gets their own source address. Real students arrive
 * from different connections; without this the whole suite shares one bucket
 * and trips the per-source rate limits that exist to stop scripted abuse.
 */
let ipCounter = 0;
// Its own slice of the documentation range. Every suite used to start at
// 203.0.113.1, and the signup form allows twenty accounts an hour from one
// address -- so running the suite twice in an hour failed on a rate limit
// rather than on anything under test.
const IP_BASE = 31;
const nextIp = () => `203.0.113.${IP_BASE + (ipCounter++ % 25)}`;

class Session {
  constructor() {
    this.ip = nextIp();
    this.cookie = "";
  }
  async go(path, init = {}) {
    const res = await fetch(BASE + path, {
      ...init,
      redirect: "manual",
      headers: { ...(init.headers ?? {}), cookie: this.cookie, "x-forwarded-for": this.ip },
    });
    for (const c of res.headers.getSetCookie?.() ?? []) {
      const [pair] = c.split(";");
      const [k] = pair.split("=");
      const rest = this.cookie.split("; ").filter((x) => x && !x.startsWith(`${k}=`));
      this.cookie = [...rest, pair].join("; ");
    }
    return res;
  }
  async html(path) {
    let res = await this.go(path);
    let hops = 0;
    while (res.status >= 300 && res.status < 400 && hops++ < 5) {
      const loc = res.headers.get("location");
      const next = loc.startsWith("http") ? new URL(loc).pathname + new URL(loc).search : loc;
      res = await this.go(next);
    }
    return { status: res.status, body: await res.text() };
  }

  /**
   * Submits a server-action form the way a browser without JS would.
   *
   * Next serialises a plain action as a single $ACTION_ID_<hash> field, and a
   * .bind()-ed one as a $ACTION_REF_<n> triplet carrying its bound arguments.
   * `pick` chooses among the bound envelopes found on the page.
   */
  async submit(path, fields, { pick } = {}) {
    const page = await this.go(path);
    const body = await page.text();
    const unescape = (v) =>
      v.replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&#x27;/g, "'");

    const bound = [];
    for (const m of body.matchAll(/name="\$ACTION_REF_(\d+)"/g)) {
      const n = m[1];
      const desc = body.match(new RegExp(`name="\\$ACTION_${n}:0" value="([^"]*)"`))?.[1];
      const args = body.match(new RegExp(`name="\\$ACTION_${n}:1" value="([^"]*)"`))?.[1];
      if (desc) bound.push({ n, desc: unescape(desc), args: args ? unescape(args) : "[]" });
    }

    const fd = new FormData();
    for (const [k, v] of Object.entries(fields)) fd.set(k, v);

    if (bound.length && pick) {
      const chosen = pick(bound);
      if (!chosen) throw new Error(`no matching bound action on ${path}`);
      fd.set(`$ACTION_REF_${chosen.n}`, "");
      fd.set(`$ACTION_${chosen.n}:0`, chosen.desc);
      fd.set(`$ACTION_${chosen.n}:1`, chosen.args);
    } else {
      const id = body.match(/ACTION_ID_([a-f0-9]+)/)?.[1];
      if (!id) throw new Error(`no server action found on ${path}`);
      fd.set(`$ACTION_ID_${id}`, "");
    }

    return this.go(path, { method: "POST", body: fd });
  }

  async login(email, password) {
    return this.submit("/login", { email, password });
  }
}

const stamp = Date.now().toString(36).slice(-5);
const COURSE = `CMS Test ${stamp}`;
const SUBJECT = `CMS Subject ${stamp}`;

const admin = new Session();
await admin.login("admin@kiwipilotprep.com", "admin12345");

const home = await admin.html("/admin");
t("admin authenticated", home.status === 200 && home.body.includes("Dashboard"), `status ${home.status}`);

// ---- the curriculum row, written the way the build scripts write it ----
const course = await db.course.create({
  data: {
    title: COURSE,
    slug: `cms-test-${stamp}`,
    description: "Created by the CMS test.",
    accessMonths: 6,
    status: "PUBLISHED",
    order: 90,
    subjects: {
      create: {
        title: SUBJECT,
        slug: `cms-subject-${stamp}`,
        description: "Added by the CMS test.",
        status: "PUBLISHED",
      },
    },
  },
  include: { subjects: true },
});
t("a published course exists", Boolean(course.id));
t("it has a published subject", course.subjects.length === 1);

// ---- the admin console counts it, without a course screen ----
const dash = await admin.html("/admin");
t("the dashboard counts live content", /Courses/.test(dash.body) && dash.status === 200);
const removedConsole = await admin.html("/admin/courses");
t("the removed course console is gone", removedConsole.status === 404,
  `status ${removedConsole.status}`);

// ---- the public site must reflect it with no code change ----
const pub = await new Session().html("/");
t("published course reaches the public site", pub.body.includes(COURSE));
t("published subject reaches the public site", pub.body.includes(SUBJECT));

// ---- archive it; it should leave active navigation ----
await db.course.update({ where: { id: course.id }, data: { status: "ARCHIVED" } });
const after = await new Session().html("/");
t("archived course leaves the public site", !after.body.includes(COURSE));

// ---- and the data is still there, which is the point of archiving ----
const stillThere = await db.course.findUnique({
  where: { id: course.id },
  select: { status: true, _count: { select: { subjects: true } } },
});
t("archiving hides without deleting",
  stillThere?.status === "ARCHIVED" && stillThere._count.subjects === 1);

await db.subject.deleteMany({ where: { courseId: course.id } });
await db.course.delete({ where: { id: course.id } });
await db.$disconnect();

console.log(checks.join("\n"));
const failed = checks.filter((c) => c.startsWith("FAIL")).length;
console.log(`\n${checks.length - failed}/${checks.length} passed`);
process.exit(failed ? 1 : 0);
