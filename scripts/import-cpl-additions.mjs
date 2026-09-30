/**
 * Files the authored gap-filling sections into the CMS.
 *
 * Three things this does that a plain insert would not:
 *
 *   1. **Places each section where it belongs.** `anchorModule` names the
 *      existing module the material reads on from, and the section is filed
 *      immediately after it. Deck modules are numbered in tens, so an authored
 *      module slots between two of them without renumbering anything.
 *
 *   2. **Keeps provenance off the page.** The source is written to the
 *      mapping's evidence field, which only the admin console renders, and
 *      `StudyContent.references` is left null — that field *is* rendered to
 *      students, and the brief rules out source notes on teaching pages.
 *
 *   3. **Confirms the syllabus link.** These sections were written to answer a
 *      specific requirement, so the link is not a guess and does not belong in
 *      the review queue. It is written CONFIRMED, which is what makes the item
 *      reachable from its code.
 *
 * Re-running replaces the authored modules and nothing else.
 *
 *   node scripts/import-cpl-additions.mjs [--publish]
 */
import { PrismaClient } from "@prisma/client";

import { CPL_ADDITIONS, OPEN_GAPS } from "../content/cpl-additions.mjs";

const db = new PrismaClient();

/** Nothing that looks like a citation may reach a teaching page. */
const SOURCE_MARKERS = [
  /https?:\/\//i,
  /\bwww\./i,
  /\baccording to\b/i,
  /\bsee (?:page|p\.|chapter)\b/i,
  /\.pdf\b/i,
  /\[\d+\]/,
];

function slugify(text) {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);
}

/**
 * Refuses to file a section that carries a source reference in its text.
 *
 * Checked here rather than trusted to the author, because this is the one rule
 * whose breach is invisible until a student is looking at a teaching page with
 * a URL on it.
 */
function assertNoSources(addition) {
  for (const block of addition.blocks) {
    const text = [block.text, block.title, ...(block.rows ?? []).flat(), ...(block.headers ?? [])]
      .filter((v) => typeof v === "string")
      .join(" ");
    for (const marker of SOURCE_MARKERS) {
      if (marker.test(text)) {
        throw new Error(
          `"${addition.title}" carries a source reference in its student-facing text: ${marker}`,
        );
      }
    }
  }
}

async function fileAddition(addition, publish) {
  const status = publish ? "PUBLISHED" : "DRAFT";
  assertNoSources(addition);

  const subject = await db.subject.findFirst({
    where: { slug: addition.subject, course: { slug: addition.course } },
    select: { id: true, title: true },
  });
  if (!subject) throw new Error(`Subject not found: ${addition.course}/${addition.subject}`);

  // Where does it read on from? The anchor is matched loosely because a deck
  // module's title is the deck's wording, not ours.
  const anchor = addition.anchorModule
    ? await db.courseModule.findFirst({
        where: {
          subjectId: subject.id,
          origin: "DECK",
          title: { contains: addition.anchorModule, mode: "insensitive" },
        },
        orderBy: { displayOrder: "asc" },
        select: { title: true, displayOrder: true },
      })
    : null;

  // Deck modules sit on multiples of ten, so +1 lands immediately after the
  // anchor and before the next deck module. With no anchor it goes to the end,
  // which is the appendix the brief warns against — hence the warning.
  const last = await db.courseModule.findFirst({
    where: { subjectId: subject.id },
    orderBy: { displayOrder: "desc" },
    select: { displayOrder: true },
  });
  const displayOrder = anchor ? anchor.displayOrder + 1 : (last?.displayOrder ?? 0) + 10;

  const moduleTitle = `${addition.title} — syllabus addition`;
  await db.courseModule.deleteMany({
    where: { subjectId: subject.id, origin: "AUTHORED", title: moduleTitle },
  });

  const authoredModule = await db.courseModule.create({
    data: {
      subjectId: subject.id,
      title: moduleTitle,
      origin: "AUTHORED",
      displayOrder,
      status,
    },
    select: { id: true },
  });

  const lesson = await db.lesson.create({
    data: {
      moduleId: authoredModule.id,
      slug: slugify(addition.title),
      title: addition.title,
      displayOrder: 0,
      status,
      content: {
        create: {
          blocks: addition.blocks,
          // Deliberately null. This field is rendered to students, and the
          // brief rules out source notes on teaching pages. Provenance lives
          // on the mapping's evidence field, which is admin-only.
          references: null,
          status,
        },
      },
    },
    select: { id: true },
  });

  let linked = 0;
  for (const code of addition.items) {
    const item = await db.syllabusItem.findUnique({ where: { code }, select: { id: true } });
    if (!item) throw new Error(`No syllabus item ${code} for "${addition.title}"`);

    await db.lessonSyllabusItem.upsert({
      where: { lessonId_syllabusItemId: { lessonId: lesson.id, syllabusItemId: item.id } },
      update: {
        status: "CONFIRMED",
        method: "authored",
        confidence: 1,
        evidence: `written to answer ${code} — source: ${addition.provenance}`,
      },
      create: {
        lessonId: lesson.id,
        syllabusItemId: item.id,
        status: "CONFIRMED",
        method: "authored",
        confidence: 1,
        evidence: `written to answer ${code} — source: ${addition.provenance}`,
        reviewedAt: new Date(),
      },
    });
    linked += 1;
  }

  return {
    subject: subject.title,
    section: addition.title,
    placedAfter: anchor ? anchor.title.slice(0, 34) : "(end — no anchor matched)",
    blocks: addition.blocks.length,
    items: linked,
    status,
  };
}

async function main() {
  const publish = process.argv.includes("--publish");
  const results = [];

  for (const addition of CPL_ADDITIONS) {
    process.stdout.write(`filing "${addition.title}" ... `);
    const result = await fileAddition(addition, publish);
    process.stdout.write(`${result.items} syllabus item(s), after ${result.placedAfter}\n`);
    results.push(result);
  }

  console.table(results);

  console.log("\nDeliberately left open:");
  for (const gap of OPEN_GAPS) {
    console.log(`  ${gap.items.join(", ")} — ${gap.reason.split(".")[0]}.`);
    console.log(`      needs: ${gap.needs}`);
  }

  await db.$disconnect();
}

main().catch(async (error) => {
  console.error(error.message);
  await db.$disconnect();
  process.exit(1);
});
