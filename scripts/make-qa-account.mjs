/**
 * Creates (or refreshes) the QA account: one login that can see every
 * published course.
 *
 * It exists so that checking the site does not mean touching the fixtures. The
 * suites assert things about `student@example.com` — that it holds these
 * courses and not that one — so widening that account to look around breaks
 * tests, and narrowing it again afterwards is the kind of housekeeping nobody
 * remembers. A separate account with everything granted removes the conflict.
 *
 * Deliberately a STUDENT, not an admin: the point is to see what a paying
 * student sees. Admin screens have their own login.
 *
 * Safe to re-run. It upserts the user, leaves the password alone unless
 * --reset-password is passed, and grants any course that has appeared since
 * the last run.
 *
 *   node scripts/make-qa-account.mjs [--reset-password]
 */
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

// example.com is reserved for documentation and testing, so this address can
// never reach a real inbox even if something tries to mail it. The password
// satisfies the signup policy: length, upper, lower, digit, symbol.
const EMAIL = "qa@example.com";
const PASSWORD = "KiwiQA@2026";
const NAME = "QA Tester";

async function main() {
  const resetPassword = process.argv.includes("--reset-password");
  const passwordHash = await bcrypt.hash(PASSWORD, 12);

  const existing = await db.user.findUnique({ where: { email: EMAIL }, select: { id: true } });

  const user = await db.user.upsert({
    where: { email: EMAIL },
    update: {
      name: NAME,
      // Verified outright: this account is not testing the verification flow,
      // and an unverified one is refused at the API before it reaches a page.
      emailVerifiedAt: new Date(),
      verifyTokenHash: null,
      status: "ACTIVE",
      ...(resetPassword ? { passwordHash } : {}),
    },
    create: {
      email: EMAIL,
      name: NAME,
      passwordHash,
      role: "STUDENT",
      emailVerifiedAt: new Date(),
      status: "ACTIVE",
    },
    select: { id: true, name: true, role: true },
  });

  const courses = await db.course.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { title: "asc" },
    select: { id: true, slug: true, title: true },
  });

  const granted = [];
  for (const course of courses) {
    await db.entitlement.upsert({
      where: { userId_scopeKey: { userId: user.id, scopeKey: `course:${course.id}` } },
      update: { status: "ACTIVE", expiresAt: null },
      create: {
        userId: user.id,
        scopeKey: `course:${course.id}`,
        courseId: course.id,
        source: "ADMIN",
        status: "ACTIVE",
        // Never dated: a QA account that silently expires is a QA account that
        // reports a bug which is really an expired entitlement.
        expiresAt: null,
        note: "QA account — full catalogue access for checking the site",
      },
    });
    granted.push(course.slug);
  }

  console.log(`${existing ? "refreshed" : "created"} ${user.name} <${EMAIL}> as ${user.role}`);
  console.log(`password: ${resetPassword || !existing ? PASSWORD : "(unchanged — pass --reset-password to set it)"}`);
  console.log(`\ngranted ${granted.length} published course(s):`);
  for (const slug of granted) console.log(`  ${slug}`);

  await db.$disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await db.$disconnect();
  process.exit(1);
});
