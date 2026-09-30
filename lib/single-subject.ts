import "server-only";

import { db } from "./db";
import { formatMinor } from "./money";

/**
 * The subjects that are sold on their own, shaped for the single-subject
 * picker.
 *
 * The pricing page and the home page both offer "buy one subject", and both
 * need the same list — a subject product is one whose grants are all subjects
 * and no whole course. Computing it in one place keeps the two surfaces from
 * drifting: they read the same rows the same way.
 *
 * Prices come straight from ProductPrice in both currencies; the caller shows
 * whichever the visitor has chosen. Nothing here is converted.
 */

export type SubjectOption = {
  productId: string;
  title: string;
  subjectTitle: string;
  courseId: string;
  courseTitle: string;
  chapters: number;
  accessMonths: number | null;
  priceNZD: string | null;
  priceINR: string | null;
};

export async function singleSubjectData(): Promise<{
  options: SubjectOption[];
  courses: Array<{ id: string; title: string }>;
}> {
  const products = await db.product.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { order: "asc" },
    include: {
      prices: true,
      items: {
        include: {
          subject: {
            select: {
              title: true,
              course: { select: { id: true, title: true } },
              _count: {
                select: {
                  chapters: { where: { status: "PUBLISHED" } },
                  modules: {
                    where: { status: "PUBLISHED", lessons: { some: { status: "PUBLISHED" } } },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  // A single-subject product grants subjects only — no whole course.
  const singles = products.filter(
    (p) => p.items.length > 0 && p.items.every((i) => i.courseId === null && i.subjectId !== null),
  );

  const options = singles
    .map((p): SubjectOption | null => {
      const subject = p.items[0]?.subject;
      if (!subject) return null;
      const nzd = p.prices.find((x) => x.currency === "NZD");
      const inr = p.prices.find((x) => x.currency === "INR");
      return {
        productId: p.id,
        title: p.title,
        subjectTitle: subject.title,
        courseId: subject.course.id,
        courseTitle: subject.course.title,
        chapters: Math.max(subject._count.modules, subject._count.chapters),
        accessMonths: p.accessMonths,
        priceNZD: nzd ? formatMinor(nzd.amountMinor, "NZD") : null,
        priceINR: inr ? formatMinor(inr.amountMinor, "INR") : null,
      };
    })
    .filter((o): o is SubjectOption => o !== null);

  const courses = [
    ...new Map(options.map((o) => [o.courseId, { id: o.courseId, title: o.courseTitle }])).values(),
  ];

  return { options, courses };
}
