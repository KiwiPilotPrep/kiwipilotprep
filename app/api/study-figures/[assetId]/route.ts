import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { canAccessSubject } from "@/lib/entitlements";
import { readFile } from "@/lib/storage";

/**
 * GET /api/study-figures/[assetId]
 *
 * Serves a diagram from the study material.
 *
 * Figures are paid content, so they sit behind the same entitlement check as
 * the text they illustrate — there is no public URL for them, and the bytes
 * live outside the web root. The check is by subject: a student entitled to
 * the subject a figure is used in may read it.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ assetId: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return new NextResponse(null, { status: 401 });

  const { assetId } = await params;
  if (!/^[A-Za-z0-9_-]{1,64}$/.test(assetId)) {
    return new NextResponse(null, { status: 404 });
  }

  const asset = await db.mediaAsset.findUnique({
    where: { id: assetId },
    select: { id: true, storageKey: true, mimeType: true, isPublic: true },
  });
  // 404 rather than 403: whether a figure exists is not disclosed to someone
  // who may not read it.
  if (!asset || !asset.storageKey.startsWith("study/")) {
    return new NextResponse(null, { status: 404 });
  }

  if (!asset.isPublic) {
    // Inverted on purpose: start from the subjects this student is entitled
    // to — usually one or two — and ask whether any of them uses this figure.
    // Starting from the figure would mean a JSON containment query across
    // every topic in the platform on every image request.
    const entitledSubjects = await db.subject.findMany({
      where: {
        status: "PUBLISHED",
        // Either kind of material can carry a figure: the syllabus-indexed
        // notes, or the imported lecture lessons. A subject with only one of
        // the two must not be skipped, or its diagrams 404 for the student
        // who paid for them.
        OR: [
          { syllabusTopics: { some: { status: "PUBLISHED" } } },
          { modules: { some: { status: "PUBLISHED" } } },
        ],
      },
      select: { id: true },
    });

    let allowed = false;
    for (const subject of entitledSubjects) {
      if (!(await canAccessSubject(user, subject.id))) continue;

      // Does this subject's material actually reference the figure? Matched on
      // the id appearing in the stored blocks, which is a plain string search
      // the database can answer quickly.
      const uses = await db.$queryRaw<Array<{ n: number }>>`
        SELECT COUNT(*)::int AS n
        FROM "StudyContent" sc
        LEFT JOIN "SyllabusTopic" t  ON t.id  = sc."syllabusTopicId"
        LEFT JOIN "SyllabusItem"  i  ON i.id  = sc."syllabusItemId"
        LEFT JOIN "SyllabusTopic" it ON it.id = i."syllabusTopicId"
        LEFT JOIN "Lesson"        l  ON l.id  = sc."lessonId"
        LEFT JOIN "CourseModule"  m  ON m.id  = l."moduleId"
        WHERE sc."blocks"::text LIKE ${"%" + assetId + "%"}
          AND COALESCE(t."subjectId", it."subjectId", m."subjectId") = ${subject.id}
      `;
      if ((uses[0]?.n ?? 0) > 0) {
        allowed = true;
        break;
      }
    }

    if (!allowed) return new NextResponse(null, { status: 404 });
  }

  let bytes: Buffer;
  try {
    bytes = await readFile(asset.storageKey);
  } catch {
    return new NextResponse(null, { status: 410 });
  }

  return new NextResponse(new Uint8Array(bytes), {
    headers: {
      "content-type": asset.mimeType,
      // Private to this student, but worth caching in their own browser: a
      // technical manual is re-read, and these are large images.
      "cache-control": "private, max-age=86400",
      "x-content-type-options": "nosniff",
    },
  });
}
