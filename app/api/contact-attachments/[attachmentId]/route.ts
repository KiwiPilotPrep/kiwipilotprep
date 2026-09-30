import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { readFile } from "@/lib/storage";
import { fileResponse } from "@/lib/storage/serve";

/**
 * GET /api/contact-attachments/[attachmentId]
 *
 * Serves a file sent with a contact message — in practice the result sheet
 * on a pass-guarantee enquiry.
 *
 * Admins may read any of them, because answering the queue is the job. The
 * sender may read their own, but only when they were signed in at the time:
 * a message sent from the public site has no account behind it, and there
 * is nobody to grant it to. Everyone else gets a 404 rather than a 403, so
 * guessing an id tells you nothing about whether it exists.
 *
 * `?disposition=inline` opens it rather than saving it. The shared
 * responder decides what may be shown that way and sandboxes it either way.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ attachmentId: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const { attachmentId } = await params;
  if (!/^[A-Za-z0-9_-]{1,64}$/.test(attachmentId)) {
    return new NextResponse(null, { status: 404 });
  }

  const attachment = await db.contactAttachment.findUnique({
    where: { id: attachmentId },
    select: {
      storageKey: true,
      filename: true,
      mimeType: true,
      message: { select: { userId: true } },
    },
  });
  if (!attachment) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const isAdmin = user.role === "ADMIN";
  const isSender = attachment.message.userId !== null && attachment.message.userId === user.id;
  if (!isAdmin && !isSender) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  let bytes: Buffer;
  try {
    bytes = await readFile(attachment.storageKey);
  } catch {
    return NextResponse.json({ error: "That file is no longer available." }, { status: 410 });
  }

  const inline = new URL(request.url).searchParams.get("disposition") === "inline";
  return fileResponse(bytes, attachment, { inline });
}
