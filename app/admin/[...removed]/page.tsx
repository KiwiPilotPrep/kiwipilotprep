import { notFound } from "next/navigation";

import { requireRole } from "@/lib/auth";

/**
 * Anything under /admin that no longer exists.
 *
 * Courses, subjects, chapters, syllabus, syllabus coverage, refunds and
 * policy were removed as admin screens: the curriculum is built from
 * `content/` and reviewed in code, and the policy pages are code too. Their
 * data is untouched and every student-facing page that reads it still works
 * — only the management UI is gone.
 *
 * A bookmark to one of them lands on a 404 rather than a blank page or a
 * half-working screen. The admin check runs first, so an old URL tells a
 * signed-out visitor nothing about what used to be there.
 */
export default async function RemovedAdminPage() {
  await requireRole("ADMIN");
  notFound();
}
