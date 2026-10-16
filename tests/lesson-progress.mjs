/**
 * The Next control: completes the topic being read, then opens the next one.
 *
 * One control replaced two. The thing to prove is not that a button exists but
 * that the completion it writes is the right one: this topic and no other,
 * written when Next is pressed and not when the page is opened, written once
 * however many times it is pressed, and still there after a reload.
 *
 * Driven through a real browser, because the control is a form posting a
 * server action and the redirect that follows it is the half most likely to
 * break.
 *
 *   node tests/lesson-progress.mjs
 */
import fs from "node:fs";
import { chromium } from "playwright";
import { SignJWT } from "jose";
import { PrismaClient } from "@prisma/client";

const BASE = process.env.TEST_BASE ?? "http://localhost:3100";
const db = new PrismaClient();

const checks = [];
const t = (name, ok, extra = "") =>
  checks.push(`${ok ? "PASS  " : "FAIL  "}${name}${ok ? "" : `  ← ${extra}`}`);

const AUTH_SECRET = fs
  .readFileSync(".env", "utf8")
  .match(/^AUTH_SECRET=(.*)$/m)?.[1]
  ?.trim()
  .replace(/^["']|["']$/g, "");

/** A session for a student who can actually open the material. */
async function sessionFor(email) {
  const user = await db.user.findUnique({ where: { email }, select: { id: true } });
  if (!user) return null;
  const token = await new SignJWT({ sub: user.id })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1800s")
    .sign(new TextEncoder().encode(AUTH_SECRET));
  return { id: user.id, cookie: { name: "kpp_session", value: token, domain: "localhost", path: "/" } };
}

/** Three consecutive lessons of one published subject, and the subject's last. */
async function pickLessons() {
  const subject = await db.subject.findFirst({
    where: {
      status: "PUBLISHED",
      course: { slug: "ppl-theory" },
      modules: { some: { status: "PUBLISHED", lessons: { some: { status: "PUBLISHED" } } } },
    },
    select: { id: true, slug: true, course: { select: { slug: true } } },
    orderBy: { order: "asc" },
  });
  if (!subject) return null;

  const lessons = await db.lesson.findMany({
    where: { status: "PUBLISHED", module: { subjectId: subject.id, status: "PUBLISHED" } },
    orderBy: [{ module: { displayOrder: "asc" } }, { displayOrder: "asc" }],
    select: { id: true, slug: true, title: true },
  });
  if (lessons.length < 3) return null;

  return {
    courseSlug: subject.course.slug,
    subjectSlug: subject.slug,
    subjectId: subject.id,
    first: lessons[0],
    second: lessons[1],
    third: lessons[2],
    last: lessons[lessons.length - 1],
    count: lessons.length,
  };
}

const progressOf = (userId, lessonId) =>
  db.lessonProgress.findUnique({
    where: { userId_lessonId: { userId, lessonId } },
    select: { completedAt: true, id: true },
  });

async function main() {
  const session = await sessionFor("qa@example.com");
  if (!session) {
    console.log("SKIP  no qa@example.com on this database");
    return;
  }
  const pick = await pickLessons();
  if (!pick) {
    console.log("SKIP  no published subject with three lessons");
    return;
  }

  const base = `${BASE}/study/${pick.courseSlug}/${pick.subjectSlug}/lessons`;

  // Start from a known state: these four lessons not completed.
  await db.lessonProgress.deleteMany({
    where: {
      userId: session.id,
      lessonId: { in: [pick.first.id, pick.second.id, pick.third.id, pick.last.id] },
    },
  });

  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await context.addCookies([session.cookie]);
  const page = await context.newPage();

  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));

  /* ---------------- opening a lesson records nothing ---------------------- */

  const opened = await page.goto(`${base}/${pick.first.slug}`, { waitUntil: "networkidle" });
  t("the lesson opens", opened?.status() === 200, `status ${opened?.status()}`);
  await page.waitForTimeout(400);
  t("opening a lesson does not complete it",
    (await progressOf(session.id, pick.first.id)) === null,
    "a progress row appeared merely from rendering the page");

  /* ---------------- the control is Next, not Mark complete --------------- */

  const nextButton = page.locator("form.pager-form button.pager-next");
  t("the pager carries a Next control that submits", (await nextButton.count()) === 1,
    `${await nextButton.count()} found`);
  t("there is no separate Mark complete button",
    (await page.getByRole("button", { name: /mark complete/i }).count()) === 0,
    "the old control is still on the page");
  t("the tool rail reports the state instead",
    (await page.locator(".tool-state").count()) === 1,
    `${await page.locator(".tool-state").count()} state chips`);
  t("and no Mark as unread control was added",
    (await page.getByRole("button", { name: /unread|incomplete|undo/i }).count()) === 0,
    "something offers to un-complete the lesson");

  /* ---------------- Next completes this lesson and moves on -------------- */

  await nextButton.click();
  await page.waitForURL(`**/lessons/${pick.second.slug}`, { timeout: 20_000 }).catch(() => {});
  await page.waitForTimeout(600);

  t("Next navigates to the following lesson",
    page.url().endsWith(`/lessons/${pick.second.slug}`), `landed ${page.url()}`);

  const firstDone = await progressOf(session.id, pick.first.id);
  t("Next completed the lesson it was pressed on", Boolean(firstDone?.completedAt),
    "no completion was recorded");
  t("and did not complete the one it moved to",
    (await progressOf(session.id, pick.second.id))?.completedAt == null,
    "the next lesson was marked complete too");
  t("nor any later lesson",
    (await progressOf(session.id, pick.third.id)) === null &&
      (await progressOf(session.id, pick.last.id)) === null,
    "a lesson further on was marked complete");

  /* ---------------- pressing it again changes nothing -------------------- */

  const stamp = firstDone.completedAt.getTime();
  const rowId = firstDone.id;
  await page.goto(`${base}/${pick.first.slug}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(300);
  await page.locator("form.pager-form button.pager-next").click();
  await page.waitForTimeout(900);
  const again = await progressOf(session.id, pick.first.id);
  t("pressing Next on a completed lesson keeps the original completion time",
    again?.completedAt?.getTime() === stamp,
    `${stamp} -> ${again?.completedAt?.getTime()}`);
  t("and writes no second row", again?.id === rowId, "the progress row was replaced");

  const rows = await db.lessonProgress.count({
    where: { userId: session.id, lessonId: pick.first.id },
  });
  t("exactly one progress row exists for that lesson", rows === 1, `${rows} rows`);

  /* ---------------- it survives a reload and a revisit ------------------- */

  await page.goto(`${base}/${pick.first.slug}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  t("a completed lesson still reads as completed after a reload",
    (await page.locator(".tool-state.is-done").count()) === 1,
    "the state chip does not show it complete");
  t("and the index marks it done",
    (await page.locator(".syl-item.is-done").count()) >= 1,
    "no completed lesson in the course index");

  /* ---------------- Previous navigates without completing ---------------- */

  await page.goto(`${base}/${pick.second.slug}`, { waitUntil: "networkidle" });
  const prev = page.locator("a.pager-prev");
  if (await prev.count()) {
    await prev.click();
    await page.waitForTimeout(700);
    t("Previous moves back without completing the lesson it left",
      (await progressOf(session.id, pick.second.id))?.completedAt == null,
      "going back completed the lesson");
  }

  /* ---------------- the last lesson has nowhere to go ------------------- */

  await page.goto(`${base}/${pick.last.slug}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  const lastLabel = await page.locator("form.pager-form button.pager-next small").innerText().catch(() => "");
  t("the last lesson offers Finish rather than Next", /finish/i.test(lastLabel), `label "${lastLabel}"`);

  const urlBefore = page.url();
  await page.locator("form.pager-form button.pager-next").click();
  await page.waitForTimeout(1200);
  t("finishing the last lesson completes it",
    Boolean((await progressOf(session.id, pick.last.id))?.completedAt),
    "the last lesson was not completed");
  t("and stays on a real page rather than navigating nowhere",
    page.url() === urlBefore || page.url().startsWith(`${base}/`),
    `landed ${page.url()}`);
  t("the page still renders after finishing",
    (await page.locator(".prose").count()) >= 1,
    "the reader is gone");

  t("no page errors during the run", errors.length === 0, errors.slice(0, 2).join(" | "));

  await context.close();
  await browser.close();

  /* ---------------- leave the account as it was found -------------------- */
  await db.lessonProgress.deleteMany({
    where: {
      userId: session.id,
      lessonId: { in: [pick.first.id, pick.second.id, pick.third.id, pick.last.id] },
    },
  });
}

try {
  await main();
} finally {
  await db.$disconnect();
}

for (const line of checks) console.log(line);
const failed = checks.filter((c) => c.startsWith("FAIL")).length;
console.log(`${checks.length - failed}/${checks.length} passed`);
process.exit(failed ? 1 : 0);
