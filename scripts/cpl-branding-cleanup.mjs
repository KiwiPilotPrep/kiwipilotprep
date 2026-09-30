/**
 * Take another provider's branding out of the CPL Theory lessons.
 *
 * This is a surgical edit, not a rebuild. It reads each affected lesson's
 * blocks, drops the figures whose images carry academy or third-party
 * branding, and writes the blocks back. Nothing else is touched: no lesson is
 * deleted and recreated, so every lesson id, slug, ordering, syllabus mapping
 * and entitlement is exactly what it was before the script ran.
 *
 * The list of images lives in content/cpl/diagram-decisions.mjs as BRANDED,
 * so a later rebuild from the decks excludes the same set for the same stated
 * reasons rather than depending on this script having been run.
 *
 * Two lessons lose teaching along with the branding, because on those two the
 * branded image was carrying a fact the words never state. Each gets one
 * authored definition in its place — written for this course, not lifted from
 * anywhere, and marked authored so it is never mistaken for the deck's own words.
 *
 *   node scripts/cpl-branding-cleanup.mjs            # dry run
 *   node scripts/cpl-branding-cleanup.mjs --apply
 */
import { PrismaClient } from "@prisma/client";

import { BRANDED } from "../content/cpl/diagram-decisions.mjs";
import { SUBJECTS } from "../content/cpl/index.mjs";

const db = new PrismaClient();
const COURSE = "cpl-theory";
const apply = process.argv.includes("--apply");

/**
 * Teaching that goes back in where removing the branded image would leave a
 * hole rather than a gap in the decoration.
 *
 * Only two qualified. Everywhere else the branded picture was either
 * decorative, or one of several figures on the same point, or an illustration
 * of something the slide already said in words — and putting text in those
 * places would be padding, which is worse than the empty space.
 *
 * The words themselves live in the curriculum, on the topic, as its
 * `definition`, which is where a rebuild would find them; this script only
 * says which two topics they belong to and why. Keeping one copy is the point:
 * a paragraph written here and nowhere else would quietly disappear the next
 * time a subject was rebuilt from its deck.
 */
const GAP_FILLS = [
  {
    lesson: "papi-t-vasis-and-vasis",
    topic: "PAPI, T-VASIS and VASIS",
    reason:
      "The removed figure was the only place the PAPI light patterns appeared. " +
      "The slide text beneath it is a bare list of labels — “Well Above”, “On " +
      "Glideslope” — that named the parts of that diagram, and on its own it " +
      "says nothing about what the pilot actually sees.",
  },
  {
    lesson: "composition-of-the-atmosphere-and-dalton-s-law",
    topic: "Composition of the Atmosphere and Dalton's Law",
    reason:
      "The removed pie chart held the composition figures, and the lesson is " +
      "named for them. Without it the page opens on Dalton's Law with nothing " +
      "to apply it to.",
  },
];

/** The topic's authored definition, shaped the way the builder emits it. */
function definitionBlock(title) {
  const topic = SUBJECTS.flatMap((s) => s.chapters)
    .flatMap((c) => c.topics)
    .find((t) => t.title === title);
  if (!topic?.definition) throw new Error(`${title}: the curriculum carries no definition to restore`);
  return { type: "definition", term: topic.term ?? topic.title, text: topic.definition, origin: "authored" };
}

function short(text, n = 64) {
  return (text ?? "").replace(/\s+/g, " ").slice(0, n);
}

/**
 * Blocks compared by value, not by byte.
 *
 * jsonb does not keep the key order it was given, so a block that came back
 * out of the database never stringifies the way the one going in does. Sorting
 * the keys is what makes "did this change anything?" answerable, and that is
 * what stops a second run from rewriting rows it has nothing to say about.
 */
function canonical(blocks) {
  return JSON.stringify(blocks.map((b) => Object.fromEntries(Object.entries(b).sort(([a], [c]) => a.localeCompare(c)))));
}

async function main() {
  const shas = Object.keys(BRANDED);

  // sha1 -> asset id. An image the course never rendered has no asset row,
  // which is not an error: BRANDED also covers copies caught on skipped
  // slides.
  const assets = await db.mediaAsset.findMany({
    where: { OR: shas.map((sha) => ({ storageKey: { contains: sha } })) },
    select: { id: true, storageKey: true },
  });
  const shaOf = new Map(
    assets.map((a) => [a.id, a.storageKey.replace(/^.*\//, "").replace(/\.[^.]+$/, "")]),
  );
  const targets = new Set(assets.map((a) => a.id));
  const unrendered = shas.filter((s) => !assets.some((a) => a.storageKey.includes(s)));

  const lessons = await db.lesson.findMany({
    where: { module: { subject: { course: { slug: COURSE } } } },
    select: {
      id: true,
      slug: true,
      title: true,
      module: { select: { title: true, subject: { select: { slug: true, title: true } } } },
      content: { select: { id: true, blocks: true } },
    },
  });

  let removed = 0;
  let inserted = 0;
  const edits = [];

  for (const lesson of lessons) {
    const blocks = lesson.content?.blocks;
    if (!Array.isArray(blocks)) continue;

    const hits = blocks.filter((b) => b.type === "figure" && targets.has(b.assetId));
    const fill = GAP_FILLS.find((g) => g.lesson === lesson.slug);
    // Run twice and the second run is a no-op: the figures are already gone
    // and the definition is already in place, so nothing is queued.
    if (!hits.length && !fill) continue;

    let next = blocks.filter((b) => !(b.type === "figure" && targets.has(b.assetId)));

    if (fill) {
      // Where the builder puts a definition: straight after the lead
      // paragraph, ahead of anything that came off a slide.
      const block = definitionBlock(fill.topic);
      next = next.filter((b) => !(b.type === "definition" && b.origin === "authored"));
      const at = next.findIndex((b) => b.lead) + 1;
      if (at <= 0) throw new Error(`${lesson.slug}: no lead paragraph to place the definition after`);
      next = [...next.slice(0, at), block, ...next.slice(at)];
    }

    if (canonical(next) === canonical(blocks)) continue;
    removed += hits.length;
    if (fill) inserted += 1;
    edits.push({ lesson, hits, next, fill });
  }

  for (const { lesson, hits, next, fill } of edits) {
    console.log(`\n${lesson.module.subject.title} › ${lesson.module.title} › ${lesson.title}`);
    console.log(`  lesson ${lesson.id}  /${lesson.slug}`);
    for (const h of hits) {
      const sha = shaOf.get(h.assetId);
      console.log(`  − slide ${String(h.sourcePage).padStart(3)}  ${sha}`);
      console.log(`      ${BRANDED[sha].replace(/\s+/g, " ").slice(0, 150)}`);
    }
    console.log(`  blocks ${lesson.content.blocks.length} → ${next.length}`);
    if (fill) console.log(`  + authored definition: ${short(definitionBlock(fill.topic).text, 90)}…`);
  }

  console.log(
    `\n${removed} branded figure(s) across ${edits.length} lesson(s); ${inserted} authored definition(s) restored.`,
  );
  if (unrendered.length) {
    console.log(`${unrendered.length} listed image(s) were never rendered into a lesson — nothing to remove there.`);
  }

  if (!apply) {
    console.log("\nDry run. Re-run with --apply to write.");
    await db.$disconnect();
    return;
  }

  await db.$transaction(
    async (tx) => {
      for (const { lesson, next } of edits) {
        await tx.studyContent.update({ where: { id: lesson.content.id }, data: { blocks: next } });
      }
    },
    { timeout: 120_000 },
  );
  console.log("\nWritten.");
  await db.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await db.$disconnect();
  process.exit(1);
});
