/**
 * Keeps the free mock pool to the questions that were designed for it.
 *
 * The intended bank is ten questions per theory subject, authored in
 * `content/free-trial/`. Anything else that happens to carry the eligibility
 * flag — older seeded questions, one-off additions — is withdrawn from the
 * pool rather than deleted: those questions are still perfectly good paid
 * mock content, and the only thing being taken away is their place in the
 * free sample.
 *
 * A question is recognised by its seed key, so one that an admin has since
 * rewritten is still recognised and still kept. Anything an admin has
 * deliberately marked eligible by hand is not from a seed file and will be
 * listed here — read the list before applying.
 *
 *   node scripts/tidy-free-trial-pool.mjs [--apply]
 */
import { PrismaClient } from "@prisma/client";

import { SUBJECTS } from "../content/free-trial/index.mjs";
import { seedKeyFor } from "./build-free-trial-questions.mjs";

const db = new PrismaClient();

async function main() {
  const apply = process.argv.includes("--apply");

  // Every seed key the authored bank owns. Keyed, not matched on wording:
  // a question an admin has rephrased is still the seeded question, and
  // withdrawing it from the pool because the words changed would be exactly
  // the kind of silent damage this pass is about.
  const intended = new Set(
    SUBJECTS.flatMap((s) => s.questions.map((_q, i) => seedKeyFor(s, i))),
  );

  const eligible = await db.question.findMany({
    where: { freeTrialEligible: true },
    select: {
      id: true,
      prompt: true,
      status: true,
      seedKey: true,
      subject: { select: { title: true } },
      chapter: { select: { subject: { select: { title: true } } } },
    },
  });

  const extra = eligible.filter((q) => !q.seedKey || !intended.has(q.seedKey));

  console.log(`${eligible.length} questions are currently in the free mock pool.`);
  console.log(`${intended.size} seed entries belong to the authored bank.`);
  console.log(`${extra.length} do not:\n`);

  for (const q of extra) {
    const subject = q.subject?.title ?? q.chapter?.subject?.title ?? "(no subject)";
    console.log(`   ${subject.padEnd(36)} ${q.status.padEnd(10)} ${q.prompt.slice(0, 62)}`);
  }

  if (!extra.length) {
    console.log("\nnothing to do — the pool is exactly the authored bank.");
    await db.$disconnect();
    return;
  }

  if (apply) {
    await db.question.updateMany({
      where: { id: { in: extra.map((q) => q.id) } },
      data: { freeTrialEligible: false },
    });
    console.log(`\napplied — ${extra.length} question(s) withdrawn from the free mock pool.`);
    console.log("They keep their status, subject, section and options, and paid mocks still draw on them.");
  } else {
    console.log(`\ndry run — ${extra.length} question(s) would be withdrawn. Pass --apply.`);
  }

  await db.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await db.$disconnect();
  process.exit(1);
});
