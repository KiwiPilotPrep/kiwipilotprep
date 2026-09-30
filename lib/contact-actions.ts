"use server";

import { z } from "zod";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { putFile, validateUpload } from "@/lib/storage";

/**
 * Receives a contact form submission.
 *
 * The form used to validate in the browser, tell the sender their message
 * was on its way and then discard it. Nothing was stored and nothing was
 * sent. This writes it down, which is the whole point of a contact form and
 * the thing the admin console needs in order to answer anybody.
 *
 * Attachments are kept. They used to be counted and discarded, which meant
 * a student who attached their result sheet to a pass-guarantee enquiry —
 * the one topic the form insists on an attachment for — sent it into
 * nothing, and an admin opening the message was told a file had been
 * "offered" that had never existed.
 *
 * They go through the same storage layer a guarantee document uses: the
 * bytes land outside the web root under a generated key, the row holds the
 * metadata, and reading one goes through an authorised route. Nothing the
 * sender controls reaches the filesystem, and the type and size rules are
 * the shared ones rather than a second opinion written here.
 *
 * A file that fails to store does not fail the message. The words are the
 * thing that must survive; losing an attachment is recoverable by asking
 * for it again, and losing the enquiry is not.
 */

const TOPICS = {
  general: "GENERAL",
  enterprise: "ENTERPRISE",
  error: "QUESTION_ERROR",
  refund: "GUARANTEE",
} as const;

const schema = z.object({
  name: z.string().trim().min(1, "Please enter your full name.").max(120),
  email: z.string().trim().email("Please enter a valid email address.").max(200),
  subject: z.enum(["general", "enterprise", "error", "refund"], {
    message: "Please choose what your message is about.",
  }),
  message: z.string().trim().min(10, "Please tell us a little about your enquiry.").max(5000),
  // Affirmative consent, validated on the server too — a client checkbox can
  // be bypassed, and we should not process a message and its attachments
  // without it.
  consent: z.literal("on", { message: "Please agree to the Privacy Policy so we can respond." }),
});

/** No more than this many files on one message. */
const MAX_FILES = 5;

export type ContactResult = { ok: true; name: string } | { ok: false; error: string } | null;

/**
 * Usable with `useActionState`, so the form works whether or not the page
 * has hydrated. A contact form that only submits once React has attached a
 * handler is a contact form that silently loses messages on a slow
 * connection — which is the same failure as validating and discarding, just
 * harder to notice.
 */
export async function submitContactMessage(
  _previous: ContactResult,
  formData: FormData,
): Promise<ContactResult> {
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }
  const d = parsed.data;

  // Anything that is actually a file with bytes in it. A browser sends an
  // empty File for an untouched input, and those are not attachments.
  const offered = formData
    .getAll("files")
    .filter((v): v is File => v instanceof File && v.size > 0)
    .slice(0, MAX_FILES);

  // Checked before the message is written, so a sender is told about a bad
  // file instead of having it silently dropped after a success message.
  for (const file of offered) {
    const problem = validateUpload(file);
    if (problem) return { ok: false, error: problem };
  }

  // Tied to the account when there is one, so a reply can be matched to a
  // student. Absent for anyone writing in from the public site, which is
  // most of them, and that is fine.
  const user = await getCurrentUser().catch(() => null);

  try {
    const created = await db.contactMessage.create({
      data: {
        name: d.name,
        email: d.email,
        topic: TOPICS[d.subject],
        message: d.message,
        attachments: 0,
        userId: user?.id ?? null,
      },
      select: { id: true },
    });

    // Stored after the message so an attachment can never be orphaned, and
    // one at a time so one bad file does not take the others with it.
    let stored = 0;
    for (const file of offered) {
      try {
        const put = await putFile(`contact/${created.id}`, file);
        await db.contactAttachment.create({
          data: {
            messageId: created.id,
            storageKey: put.storageKey,
            filename: put.filename,
            mimeType: put.mimeType,
            sizeBytes: put.sizeBytes,
          },
        });
        stored += 1;
      } catch {
        // Left for the next line to report honestly as a lower count.
      }
    }

    // The count is what was actually kept, never what was offered.
    if (stored !== 0) {
      await db.contactMessage.update({
        where: { id: created.id },
        data: { attachments: stored },
      });
    }
  } catch {
    // The sender is told the truth: nothing was saved and they should try
    // again. Telling them it worked is how a message disappears silently.
    return { ok: false, error: "We could not save your message. Please try again." };
  }

  return { ok: true, name: d.name };
}
