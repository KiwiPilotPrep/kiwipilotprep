import "server-only";

import { Resend } from "resend";

import { db } from "@/lib/db";

/**
 * Transactional email.
 *
 * A provider is injected through environment variables. With none configured,
 * messages are recorded in EmailLog with status LOGGED instead of being sent —
 * so the flow is exercisable in development, and nothing silently pretends to
 * have delivered mail it did not send (§16).
 *
 * No API key ever reaches the browser: this module is server-only.
 */

export type Message = {
  to: string;
  subject: string;
  /** Plain text. Always sent — it is the fallback every client can render. */
  body: string;
  /**
   * Optional branded HTML. When present it is sent alongside the text part,
   * so a client that cannot or will not render HTML still gets a usable
   * message. Never stored in EmailLog: the text part is the record.
   */
  html?: string;
  template: string;
  userId?: string | null;
  attemptId?: string | null;
  /**
   * Set for a message whose body contains a single-use credential — a
   * verification link, an invitation token, a password reset.
   *
   * The body of such a message is NOT written to EmailLog. Storing it would
   * undo the reason those tokens are hashed in the first place: anyone able to
   * read the database could lift a live link straight out of the mail log and
   * use it. The log still records that the message was sent, to whom, and
   * whether it succeeded, which is what the audit trail is actually for.
   */
  sensitive?: boolean;
  /**
   * Files to send with the message. Never written to EmailLog — the log is a
   * record that a message was sent and to whom, not a second copy of a
   * student's report, and attachments would make that table grow without
   * bound.
   */
  attachments?: Attachment[];
};

export type Attachment = {
  filename: string;
  content: Buffer;
  /** Defaults to application/pdf, the only kind this product sends today. */
  contentType?: string;
};

export type SendResult = {
  status: "SENT" | "LOGGED" | "FAILED";
  provider: string;
  error?: string;
  /** Resend's id for the accepted message, useful when chasing a delivery. */
  providerMessageId?: string;
};

function providerName(): "resend" | "none" {
  return process.env.RESEND_API_KEY ? "resend" : "none";
}

export function emailConfigured(): boolean {
  return providerName() !== "none";
}

/**
 * The Resend client, created once.
 *
 * Constructed lazily so that importing this module never requires a key —
 * builds, tests and any environment without mail configured still load it
 * cleanly. `server-only` at the top of this file is what guarantees the key
 * cannot reach a browser bundle.
 */
let client: Resend | null = null;
function resend(): Resend {
  if (!client) client = new Resend(process.env.RESEND_API_KEY);
  return client;
}

async function sendViaResend(message: Message): Promise<SendResult> {
  const from = process.env.EMAIL_FROM ?? "KiwiPilotPrep <no-reply@kiwipilotprep.co.nz>";

  const { data, error } = await resend().emails.send({
    from,
    to: [message.to],
    subject: message.subject,
    text: message.body,
    ...(message.html ? { html: message.html } : {}),
    ...(message.attachments?.length
      ? {
          attachments: message.attachments.map((a) => ({
            filename: a.filename,
            content: a.content,
            contentType: a.contentType ?? "application/pdf",
          })),
        }
      : {}),
  });

  if (error) {
    // Resend's message can name the account, the domain and the key that
    // failed, so it is recorded server-side and never returned to a browser.
    return {
      status: "FAILED",
      provider: "resend",
      error: `${error.name}: ${error.message}`.slice(0, 500),
    };
  }

  return { status: "SENT", provider: "resend", providerMessageId: data?.id };
}

/**
 * Sends, or logs when no provider is configured. Always writes an EmailLog row
 * so there is a record either way, and never throws into the caller's
 * transaction — a failed email must not fail a submitted exam.
 */
export async function sendEmail(message: Message): Promise<SendResult> {
  let result: SendResult;

  try {
    result =
      providerName() === "resend"
        ? await sendViaResend(message)
        : { status: "LOGGED", provider: "none" };
  } catch (error) {
    result = {
      status: "FAILED",
      provider: providerName(),
      error: error instanceof Error ? error.message : String(error),
    };
  }

  await db.emailLog
    .create({
      data: {
        userId: message.userId ?? null,
        attemptId: message.attemptId ?? null,
        to: message.to,
        subject: message.subject,
        template: message.template,
        body: message.sensitive
          ? "[redacted — this message contained a single-use link]"
          : message.body,
        status: result.status,
        provider: result.provider,
        error: result.error ?? null,
      },
    })
    .catch(() => null);

  if (result.status === "LOGGED") {
    console.info(`[email:not-sent] to=${message.to} subject="${message.subject}"`);
  }

  // The development fallback that printed verification links is gone. What
  // remains is an explicit opt-in used by the automated suites: the tokens are
  // stored only as hashes, so a black-box test has no other way to walk a
  // verification or reset journey end to end.
  //
  // The guard is the variable itself, deliberately NOT NODE_ENV. A production
  // build sets NODE_ENV=production when run locally too, so keying off it both
  // breaks local testing and gives a false sense of safety — the same reasoning
  // already applied to ALLOW_SANDBOX_PAYMENTS. A variable nobody sets by
  // accident is the stronger guarantee, and it is absent from .env by default.
  if (message.sensitive && process.env.EMAIL_DEV_LOG_LINKS === "1") {
    console.info(`[email:dev-link] ${message.body}`);
  }

  return result;
}
