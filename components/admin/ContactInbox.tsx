import type { ContactStatus, ContactTopic } from "@prisma/client";

import { db } from "@/lib/db";
import ContactStatusActions from "@/components/admin/ContactStatusActions";
import { AttachmentList } from "@/components/admin/Attachments";

/**
 * One queue of contact form messages.
 *
 * Guarantee claims and general queries are the same records split on the
 * topic the sender chose, so they are the same component with a different
 * filter. Nothing is fabricated and nothing is summarised: what is shown is
 * what the student typed, who they are, when they sent it and whether
 * anyone has dealt with it.
 */

const TOPIC_LABEL: Record<ContactTopic, string> = {
  GENERAL: "General enquiry",
  ENTERPRISE: "Flight school",
  QUESTION_ERROR: "Question error",
  GUARANTEE: "Guarantee claim",
};

const STATUS_PILL: Record<ContactStatus, string> = {
  NEW: "draft",
  IN_PROGRESS: "published",
  RESOLVED: "archived",
};

export default async function ContactInbox({
  topics,
  emptyTitle,
  emptyHint,
}: {
  topics: ContactTopic[];
  emptyTitle: string;
  emptyHint: string;
}) {
  const [messages, counts] = await Promise.all([
    db.contactMessage.findMany({
      where: { topic: { in: topics } },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      take: 200,
      select: {
        id: true,
        name: true,
        email: true,
        topic: true,
        message: true,
        attachments: true,
        status: true,
        createdAt: true,
        user: { select: { id: true, name: true } },
        files: {
          orderBy: { createdAt: "asc" },
          select: {
            id: true,
            filename: true,
            mimeType: true,
            sizeBytes: true,
            createdAt: true,
          },
        },
      },
    }),
    db.contactMessage.groupBy({
      by: ["status"],
      where: { topic: { in: topics } },
      _count: { _all: true },
    }),
  ]);


  const byStatus = (s: ContactStatus) => counts.find((c) => c.status === s)?._count._all ?? 0;

  return (
    <>
      <div className="tiles">
        <div className="tile">
          <div className="v">{byStatus("NEW")}</div>
          <div className="l">New</div>
        </div>
        <div className="tile">
          <div className="v">{byStatus("IN_PROGRESS")}</div>
          <div className="l">In progress</div>
        </div>
        <div className="tile">
          <div className="v">{byStatus("RESOLVED")}</div>
          <div className="l">Resolved</div>
        </div>
      </div>

      <div className="panel mt-m">
        <div className="panel-hd">
          <h2>
            {messages.length} message{messages.length === 1 ? "" : "s"}
          </h2>
        </div>

        {messages.length === 0 ? (
          <div className="empty">
            <b>{emptyTitle}</b>
            {emptyHint}
          </div>
        ) : (
          <table className="atable">
            <thead>
              <tr>
                <th>From</th>
                <th>About</th>
                <th>Message</th>
                <th>Received</th>
                <th>Attachments</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {messages.map((m) => (
                <tr key={m.id}>
                  <td>
                    <span className="nm">{m.name}</span>
                    <div className="xs">
                      <a href={`mailto:${m.email}`}>{m.email}</a>
                      {m.user && <> · account</>}
                    </div>
                  </td>
                  <td className="xs">
                    {TOPIC_LABEL[m.topic]}
                    {m.files.length > 0 && (
                      <div className="xs">
                        {m.files.length} attachment{m.files.length === 1 ? "" : "s"}
                      </div>
                    )}
                  </td>
                  {/* The message in full. It is the only thing on this page
                      that matters, so it is not truncated to fit a column. */}
                  <td style={{ minWidth: "190px", maxWidth: "400px", whiteSpace: "pre-wrap" }}>
                    {m.message}
                  </td>
                  {/* Date over time: one long unbreakable string here pushed
                      the status and its buttons off the end of the table. */}
                  <td className="xs">
                    {m.createdAt.toLocaleDateString("en-NZ")}
                    <div className="xs">{m.createdAt.toLocaleTimeString("en-NZ")}</div>
                  </td>
                  {/* Beside the message that carried them, never pooled with
                      everybody else's. Matching an attachment to a sender by
                      name is not a thing an admin should have to do. */}
                  <td style={{ minWidth: "220px" }}>
                    {m.files.length === 0 && m.attachments > 0 ? (
                      <span className="xs">Attachment not retained</span>
                    ) : (
                      <AttachmentList
                        files={m.files}
                        basePath="/api/contact-attachments"
                        compact
                      />
                    )}
                  </td>
                  <td>
                    <span className={`pill-s ${STATUS_PILL[m.status]}`}>
                      {m.status.replace("_", " ")}
                    </span>
                  </td>
                  <td>
                    <ContactStatusActions id={m.id} status={m.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </>
  );
}
