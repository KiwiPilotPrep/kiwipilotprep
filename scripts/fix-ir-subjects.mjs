/**
 * Brings the IR course's subjects into line with the material that exists.
 *
 * The course was seeded with three subjects — Navigation & Flight Planning,
 * Operations & Procedures, Meteorology — chosen before anyone had the study
 * manuals. Two of them have no source material and never will under that name;
 * the two manuals that do exist (Navaids, Air Law) had to be added beside them.
 * The result was a five-subject course built from three books, three of whose
 * cards were either empty or misnamed.
 *
 * This corrects the records. `prisma/seed.ts` is corrected in the same change,
 * so a reseed produces the right three rather than putting the wrong ones back.
 *
 * Nothing is deleted. The two subjects with no material are archived, along
 * with the products that sell them — each is referenced by a product and one by
 * a live entitlement, and deleting the row would take a customer's purchase
 * with it. Archived is reversible; deleted is not.
 *
 *   node scripts/fix-ir-subjects.mjs [--apply]
 */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();
const COURSE = "ir-theory";

/** The three supplied manuals, one subject each. */
const INTENDED = [
  { slug: "ifr-navigation", title: "IFR Navigation",
    description: "Altimetry, charts, tracking, holds and IFR flight planning.",
    // The subject that already holds this manual's content, under its old name.
    renameFrom: "instrument-flight-navigation-and-flight-planning" },
  { slug: "ifr-navaids", title: "IFR Navaids",
    description: "Flight instruments and the radio navigation aids used under IFR." },
  { slug: "ir-air-law", title: "IR Air Law",
    description: "The rules, airspace and procedures that govern instrument flight." },
];

async function main() {
  const apply = process.argv.includes("--apply");
  const course = await db.course.findUnique({ where: { slug: COURSE }, select: { id: true } });
  if (!course) throw new Error(`No course ${COURSE}`);

  const subjects = await db.subject.findMany({
    where: { courseId: course.id },
    orderBy: { order: "asc" },
    select: {
      id: true, slug: true, title: true, status: true,
      _count: { select: { modules: true, chapters: true, productItems: true, entitlements: true } },
    },
  });

  const plan = [];
  const keep = new Set();

  for (const [index, want] of INTENDED.entries()) {
    const existing =
      subjects.find((s) => s.slug === want.slug) ??
      (want.renameFrom ? subjects.find((s) => s.slug === want.renameFrom) : undefined);

    if (!existing) {
      plan.push({ action: "create", slug: want.slug, why: "intended subject is missing" });
      if (apply) {
        await db.subject.create({
          data: {
            courseId: course.id, slug: want.slug, title: want.title,
            description: want.description, order: index, status: "PUBLISHED",
          },
        });
      }
      continue;
    }

    keep.add(existing.id);
    const renaming = existing.slug !== want.slug;
    plan.push({
      action: renaming ? "rename" : "keep",
      slug: renaming ? `${existing.slug} → ${want.slug}` : existing.slug,
      why: renaming ? "holds the IFR Navigation manual under an invented name" : "already correct",
    });

    if (apply) {
      await db.subject.update({
        where: { id: existing.id },
        data: {
          slug: want.slug, title: want.title, description: want.description,
          order: index, status: "PUBLISHED",
        },
      });
      // The seeded placeholder chapters are not this subject's content — its
      // chapters come from the manual — and leaving them puts a chapter count
      // on the card that has nothing behind it.
      await db.chapter.deleteMany({ where: { subjectId: existing.id } });

      // The single-subject product is keyed on the subject slug, so a rename
      // leaves it stranded under the old key. `prisma/seed-subjects.ts` mints a
      // second product for the same subject on its next run, and the subject
      // ends up on sale twice under two names — which is what happened here.
      //
      // Run unconditionally rather than only on the rename, so it also repairs
      // a database where both products already exist. The correctly-keyed one
      // is kept; a stale duplicate is archived rather than deleted, because a
      // product can have orders against it.
      const wantSlug = `subject-${COURSE}-${want.slug}`;
      const products = await db.product.findMany({
        where: { items: { some: { subjectId: existing.id } } },
        select: { id: true, slug: true, status: true, _count: { select: { orders: true } } },
      });
      const correct = products.find((product) => product.slug === wantSlug);

      if (!correct && products.length === 1) {
        // Only the stale one exists: rename it, so its orders and entitlements
        // stay attached to the product the customer actually bought.
        await db.product.update({
          where: { id: products[0].id },
          data: { slug: wantSlug, title: `${want.title} (IR Theory)` },
        });
      } else if (correct) {
        for (const product of products) {
          if (product.id === correct.id || product.status === "ARCHIVED") continue;
          await db.product.update({
            where: { id: product.id },
            data: { status: "ARCHIVED" },
          });
          plan.push({
            action: "archive product",
            slug: product.slug,
            why: `duplicate of ${wantSlug} · ${product._count.orders} order(s)`,
          });
        }
      }
    }
  }

  // Anything else in the course is a subject with no supplied material.
  for (const subject of subjects) {
    if (keep.has(subject.id)) continue;
    plan.push({
      action: subject._count.modules > 0 ? "REVIEW — has content" : "archive",
      slug: subject.slug,
      why: `no supplied manual · ${subject._count.productItems} product(s), ${subject._count.entitlements} entitlement(s)`,
    });

    if (apply && subject._count.modules === 0) {
      await db.subject.update({ where: { id: subject.id }, data: { status: "ARCHIVED" } });
      // Its placeholder chapters are archived rather than deleted: a few carry
      // a student's progress row, and deleting the chapter would cascade that
      // away for the sake of tidiness.
      await db.chapter.updateMany({ where: { subjectId: subject.id }, data: { status: "ARCHIVED" } });
      // A product that sells an empty subject should not be on sale.
      const items = await db.productItem.findMany({
        where: { subjectId: subject.id }, select: { productId: true },
      });
      for (const item of items) {
        await db.product.update({
          where: { id: item.productId },
          data: { status: "ARCHIVED" },
        });
      }
    }
  }

  console.table(plan);

  if (!apply) {
    console.log("\ndry run — pass --apply to make the changes");
  } else {
    const after = await db.subject.findMany({
      where: { courseId: course.id, status: "PUBLISHED" },
      orderBy: { order: "asc" },
      select: { slug: true, title: true, _count: { select: { modules: true, chapters: true } } },
    });
    console.log("\nIR now publishes:");
    for (const s of after) {
      console.log(`  ${s.slug.padEnd(18)} ${s.title.padEnd(20)} ${s._count.modules} chapters, ${s._count.chapters} placeholder`);
    }
  }

  await db.$disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await db.$disconnect();
  process.exit(1);
});
