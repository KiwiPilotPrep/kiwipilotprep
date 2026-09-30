import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { readFile } from "@/lib/storage";
import { fileResponse } from "@/lib/storage/serve";

/**
 * GET /api/documents/[documentId]
 *
 * Serves a guarantee document to the student who uploaded it, or to a platform
 * admin reviewing the claim. There is no public URL: the bytes live outside
 * the web root and every read passes this check (§7).
 *
 * The response is forced to download rather than render, so an uploaded file
 * can never execute in the origin's context.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ documentId: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const { documentId } = await params;
  if (!/^[A-Za-z0-9_-]{1,64}$/.test(documentId)) {
    return new NextResponse(null, { status: 404 });
  }

  const document = await db.guaranteeDocument.findUnique({
    where: { id: documentId },
    include: { claim: { select: { userId: true } } },
  });
  // 404 rather than 403 — existence is not disclosed to someone who may not read it.
  if (!document) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const isOwner = document.claim.userId === user.id;
  const isAdmin = user.role === "ADMIN";
  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  let bytes: Buffer;
  try {
    bytes = await readFile(document.storageKey);
  } catch {
    return NextResponse.json({ error: "That file is no longer available." }, { status: 410 });
  }

  const inline = new URL(request.url).searchParams.get("disposition") === "inline";
  return fileResponse(bytes, document, { inline });
}
