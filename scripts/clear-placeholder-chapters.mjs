/**
 * Takes the seeded placeholder text off the chapter pages.
 *
 * Every course carries a set of `Chapter` rows from the original seed. They
 * were never filled in, and what they say to a student who reaches one — the
 * dashboard resumes into one, and the course page lists them — is:
 *
 *   "Placeholder study material. The client's own content for this chapter is
 *    uploaded through the admin console — see the CMS content editor."
 *
 * That is internal vocabulary addressed to whoever was going to build the
 * product, shown to a paying student on a published page. The `description`
 * beneath the title says "Content to be supplied by the client." for the same
 * reason.
 *
 * The rows themselves are left alone: ids, slugs, titles, order, status and
 * the progress that hangs off them all survive. Only the placeholder text goes,
 * and it is replaced with something true — where the subject's material
 * actually is, and how much of it there is — counted from the database rather
 * than written here, so no teaching is invented to fill the space.
 *
 * Nothing is touched unless it is *exactly* the seeded placeholder. A chapter
 * that has been edited since, or that carries anything else at all, is skipped
 * and reported, because this must not be able to delete real work.
 *
 *   node scripts/clear-placeholder-chapters.mjs [--apply] [--course <slug>]
 */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const PLACEHOLDER_PARAGRAPH =
  "Placeholder study material. The client's own content for this chapter is " +
  "uploaded through the admin console — see the CMS content editor.";
const PLACEHOLDER_NOTE = "Content to be supplied by the client.";

/** True only for the seeded placeholder, exactly as the seed wrote it. */
function isSeededPlaceholder(chapter) {
  const blocks = chapter.content?.blocks ?? [];
  if (blocks.length !== 3) return false;
  const [heading, paragraph, note] = blocks;
  return (
    heading?.type === "heading" &&
    heading.text === chapter.title &&
    paragraph?.type === "paragraph" &&
    paragraph.text === PLACEHOLDER_PARAGRAPH &&
    note?.type === "note" &&
    note.text === PLACEHOLDER_NOTE
  );
}

const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

async function main() {
  const apply = process.argv.includes("--apply");
  const only = process.argv[process.argv.indexOf("--course") + 1];
  const courses = process.argv.includes("--course")
    ? [only]
    : ["ppl-theory", "cpl-theory", "ir-theory"];

  const chapters = await db.chapter.findMany({
    where: { subject: { course: { slug: { in: courses } } } },
    orderBy: [{ subject: { order: "asc" } }, { order: "asc" }],
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      subjectId: true,
      subject: { select: { slug: true, title: true, course: { select: { slug: true } } } },
      content: { select: { blocks: true } },
    },
  });

  // Counted, not written: how much material the subject actually holds.
  const sizes = new Map();
  for (const id of new Set(chapters.map((c) => c.subjectId))) {
    const modules = await db.courseModule.count({ where: { subjectId: id } });
    const lessons = await db.lesson.count({ where: { module: { subjectId: id } } });
    sizes.set(id, { modules, lessons });
  }

  const changed = [];
  const skipped = [];

  for (const c of chapters) {
    if (!isSeededPlaceholder(c)) {
      skipped.push({ chapter: c, why: "not the seeded placeholder — left untouched" });
      continue;
    }

    const { modules, lessons } = sizes.get(c.subjectId) ?? { modules: 0, lessons: 0 };
    const where = c.subject.title;

    // A subject with material gets pointed at it. One without — an archived
    // subject that was never built — gets a line saying so, which is at least
    // true, rather than a line telling a student about the admin console.
    const blocks = lessons
      ? [
          {
            type: "paragraph",
            text:
              `${where} is taught in ${plural(modules, "chapter", "chapters")} and ` +
              `${plural(lessons, "topic", "topics")}, each with the material it was built from.`,
          },
          {
            type: "note",
            variant: "info",
            title: "Where to read this",
            text: `Open ${where} from the course page to work through the topics in order.`,
          },
        ]
      : [
          {
            type: "note",
            variant: "info",
            title: "In preparation",
            text: `The material for ${where} is being prepared.`,
          },
        ];

    changed.push({
      chapter: c,
      blocks,
      description: lessons ? `${where} — ${plural(lessons, "topic", "topics")}.` : `${where} — in preparation.`,
    });
  }

  console.log(`${chapters.length} chapter(s) in ${courses.join(", ")}`);
  console.log(`   ${changed.length} carrying the seeded placeholder`);
  console.log(`   ${skipped.length} left alone\n`);

  for (const { chapter: s, why } of skipped) {
    console.log(`   left: ${s.subject.course.slug}/${s.subject.slug}/${s.slug} — ${why}`);
  }

  if (changed.length) {
    const first = changed[0];
    console.log(`\nexample — ${first.chapter.subject.course.slug}/${first.chapter.subject.slug}/${first.chapter.slug}`);
    console.log(`   description: "${first.chapter.description}"  ->  "${first.description}"`);
    for (const b of first.chapter.content.blocks) console.log(`   was: [${b.type}] ${String(b.text).slice(0, 90)}`);
    for (const b of first.blocks) console.log(`   now: [${b.type}] ${String(b.text).slice(0, 90)}`);
  }

  if (!apply) {
    console.log("\ndry run — nothing written. Pass --apply to make the change.");
    await db.$disconnect();
    return;
  }

  for (const { chapter, blocks, description } of changed) {
    await db.chapterContent.upsert({
      where: { chapterId: chapter.id },
      create: { chapterId: chapter.id, blocks },
      update: { blocks },
    });
    await db.chapter.update({ where: { id: chapter.id }, data: { description } });
  }
  console.log(`\napplied — ${changed.length} chapter(s) updated. No id, slug, title, order or status was touched.`);
  await db.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await db.$disconnect();
  process.exit(1);
});
