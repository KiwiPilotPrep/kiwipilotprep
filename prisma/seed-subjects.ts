/**
 * Creates a single-subject product for every published theory subject.
 *
 * Single subjects carry a 1 month access window — deliberately shorter than
 * the 3 month packages, which is stated on the pricing card and again on the
 * confirmation step before checkout.
 *
 * Prices here are development placeholders; the client sets real figures in
 * the admin console.
 *
 *   npx tsx prisma/seed-subjects.ts
 */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const ACCESS_MONTHS = 1;
const PRICE_NZD_MINOR = 14900;
const PRICE_INR_MINOR = 760000;

async function main() {
  const subjects = await db.subject.findMany({
    where: {
      status: "PUBLISHED",
      course: { status: "PUBLISHED" },
      // Flight test groundwork is sold as a track, not as single subjects.
      NOT: { course: { slug: { contains: "flight-test" } } },
    },
    include: { course: { select: { title: true, slug: true } } },
    orderBy: [{ courseId: "asc" }, { order: "asc" }],
  });

  let created = 0;
  let updated = 0;

  for (const [index, subject] of subjects.entries()) {
    // Keyed on the SUBJECT slug, which is stable. Deriving it from the title
    // would mint a duplicate product every time a subject is renamed.
    const slug = `subject-${subject.course.slug}-${subject.slug}`;
    const title = `${subject.title} (${subject.course.title})`;

    const existing = await db.product.findUnique({ where: { slug } });

    if (existing) {
      await db.product.update({
        where: { id: existing.id },
        data: { accessMonths: ACCESS_MONTHS, status: "PUBLISHED" },
      });
      updated++;
      continue;
    }

    const product = await db.product.create({
      data: {
        slug,
        title,
        description: `${subject.title} on its own — full material, practice questions and its mock exam.`,
        accessMonths: ACCESS_MONTHS,
        // Ordered after the packages so the pricing page keeps its shape.
        order: 100 + index,
        status: "PUBLISHED",
        prices: {
          create: [
            { currency: "NZD", amountMinor: PRICE_NZD_MINOR },
            { currency: "INR", amountMinor: PRICE_INR_MINOR },
          ],
        },
        items: { create: { subjectId: subject.id } },
      },
    });
    created += product ? 1 : 0;
  }

  // The Phase 3 sample single-subject product is superseded by these.
  await db.product
    .updateMany({ where: { slug: "ppl-meteorology" }, data: { status: "ARCHIVED" } })
    .catch(() => null);

  console.log("Single-subject products:", {
    created,
    updated,
    accessMonths: ACCESS_MONTHS,
    total: await db.product.count({ where: { slug: { startsWith: "subject-" } } }),
  });
}

main()
  .then(() => db.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
