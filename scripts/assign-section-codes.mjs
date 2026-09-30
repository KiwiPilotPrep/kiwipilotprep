/**
 * Assigns the canonical chapter and point numbers.
 *
 * A chapter is numbered inside its own subject; a point is numbered inside
 * its own chapter. Nothing is numbered from a position in a course, a row
 * id, a creation order or an index into any list that is not the list being
 * numbered — an earlier version prefixed the subject's position in its
 * course, which is how Air Law chapter 27 came to be written "1.27".
 *
 * Numbers already stored are left alone. Only a chapter or point that has
 * none is given one, taking the next free number in its parent, so running
 * this after adding a chapter numbers the new chapter and renumbers nothing
 * that a report may already have been printed with. `--renumber` overrides
 * that and rewrites every number from curriculum order; use it only when the
 * curriculum itself has been reordered on purpose.
 *
 *   node scripts/assign-section-codes.mjs [--apply] [--renumber]
 */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  const apply = process.argv.includes("--apply");
  const renumber = process.argv.includes("--renumber");

  const subjects = await db.subject.findMany({
    orderBy: [{ course: { order: "asc" } }, { order: "asc" }],
    select: {
      id: true,
      title: true,
      course: { select: { slug: true } },
      modules: {
        orderBy: [{ chapterNumber: "asc" }, { displayOrder: "asc" }],
        select: {
          id: true,
          title: true,
          chapterNumber: true,
          sectionCode: true,
          lessons: {
            orderBy: [{ pointNumber: "asc" }, { displayOrder: "asc" }],
            select: { id: true, title: true, pointNumber: true },
          },
        },
      },
    },
  });

  let chaptersTouched = 0;
  let pointsTouched = 0;
  let codesTouched = 0;
  let questionsTouched = 0;

  for (const subject of subjects) {
    if (subject.modules.length === 0) continue;

    const taken = new Set(
      renumber ? [] : subject.modules.map((m) => m.chapterNumber).filter((n) => n != null),
    );
    let next = 1;
    const nextChapter = () => {
      while (taken.has(next)) next += 1;
      taken.add(next);
      return next;
    };

    for (const m of subject.modules) {
      const number = renumber || m.chapterNumber == null ? nextChapter() : m.chapterNumber;
      const code = String(number);

      if (m.chapterNumber !== number || m.sectionCode !== code) {
        console.log(
          `  ${subject.course.slug}/${subject.title} — ${m.title}: ` +
            `${m.sectionCode ?? "none"} → ${code}`,
        );
        chaptersTouched += 1;
        if (apply) {
          await db.courseModule.update({
            where: { id: m.id },
            data: { chapterNumber: number, sectionCode: code },
          });
          const { count } = await db.question.updateMany({
            where: { moduleId: m.id, lessonId: null },
            data: { kdrCode: code, kdrTopic: m.title },
          });
          questionsTouched += count;
        }
        codesTouched += 1;
      }

      // Points inside this chapter, by the same rule.
      const used = new Set(
        renumber ? [] : m.lessons.map((l) => l.pointNumber).filter((n) => n != null),
      );
      let p = 1;
      const nextPoint = () => {
        while (used.has(p)) p += 1;
        used.add(p);
        return p;
      };

      for (const lesson of m.lessons) {
        const pn = renumber || lesson.pointNumber == null ? nextPoint() : lesson.pointNumber;
        if (lesson.pointNumber === pn) continue;
        pointsTouched += 1;
        if (apply) {
          await db.lesson.update({ where: { id: lesson.id }, data: { pointNumber: pn } });
          const { count } = await db.question.updateMany({
            where: { lessonId: lesson.id },
            data: { kdrCode: `${number}.${pn}`, kdrTopic: lesson.title },
          });
          questionsTouched += count;
        }
      }
    }
  }

  console.log(
    `\n${apply ? "applied" : "dry run"} — ${chaptersTouched} chapter(s), ` +
      `${pointsTouched} point(s), ${codesTouched} code(s), ` +
      `${questionsTouched} denormalised question copy(ies).`,
  );
  if (!apply) console.log("Pass --apply to write.");
  await db.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await db.$disconnect();
  process.exit(1);
});
