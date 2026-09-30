import type { MetadataRoute } from "next";

import { db } from "@/lib/db";
import { SITE_URL } from "./layout";

export const revalidate = 3600;

/**
 * The sitemap is generated from the database, not a hand-kept list: publishing
 * a course in the admin console is what puts it here, and unpublishing takes
 * it out. Only public marketing and syllabus pages are listed — the chapter
 * bodies themselves are paid content and are deliberately absent.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/courses`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/pricing`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/pricing/subject`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/flight-schools`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/guarantee`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/contact`, changeFrequency: "yearly", priority: 0.4 },
    { url: `${SITE_URL}/terms`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/refunds`, changeFrequency: "yearly", priority: 0.3 },
  ];

  try {
    const courses = await db.course.findMany({
      where: { status: "PUBLISHED" },
      select: {
        slug: true,
        updatedAt: true,
        subjects: {
          where: { status: "PUBLISHED" },
          select: { slug: true, updatedAt: true },
        },
      },
      orderBy: { order: "asc" },
    });

    const dynamicEntries: MetadataRoute.Sitemap = courses.flatMap((course) => [
      {
        url: `${SITE_URL}/courses/${course.slug}`,
        lastModified: course.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      },
      ...course.subjects.map((subject) => ({
        url: `${SITE_URL}/courses/${course.slug}/subjects/${subject.slug}`,
        lastModified: subject.updatedAt,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      })),
    ]);

    return [...staticEntries, ...dynamicEntries];
  } catch {
    // A sitemap is not worth a 500. If the database is unreachable, serve the
    // static pages rather than nothing at all.
    return staticEntries;
  }
}
