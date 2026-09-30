import Link from "next/link";
import type { ContentStatus } from "@prisma/client";

import { setStatus, move } from "@/app/admin/actions";

export function StatusPill({ status }: { status: ContentStatus }) {
  return <span className={`pill-s ${status.toLowerCase()}`}>{status}</span>;
}

export function Crumb({ trail }: { trail: Array<{ href?: string; label: string }> }) {
  return (
    <div className="crumb">
      {trail.map((t, i) => (
        <span key={`${t.label}-${i}`}>
          {i > 0 && <span aria-hidden> / </span>}
          {t.href ? <Link href={t.href}>{t.label}</Link> : t.label}
        </span>
      ))}
    </div>
  );
}

/** Publish / unpublish / archive, plus reordering — all via server actions. */
export function RowControls({
  entity,
  id,
  status,
  orderable = true,
}: {
  entity: "course" | "subject" | "chapter";
  id: string;
  status: ContentStatus;
  orderable?: boolean;
}) {
  return (
    <>
      {orderable && (
        <div className="ord">
          <form action={move.bind(null, entity, id, "up")}>
            <button title="Move up" type="submit">
              ↑
            </button>
          </form>
          <form action={move.bind(null, entity, id, "down")}>
            <button title="Move down" type="submit">
              ↓
            </button>
          </form>
        </div>
      )}

      <div className="acts">
        {status !== "PUBLISHED" && (
          <form action={setStatus.bind(null, entity, id, "PUBLISHED")}>
            <button className="btn btn-g btn-sm" type="submit">
              Publish
            </button>
          </form>
        )}
        {status === "PUBLISHED" && (
          <form action={setStatus.bind(null, entity, id, "DRAFT")}>
            <button className="btn btn-g btn-sm" type="submit">
              Unpublish
            </button>
          </form>
        )}
        {status !== "ARCHIVED" ? (
          <form action={setStatus.bind(null, entity, id, "ARCHIVED")}>
            <button className="btn btn-g btn-sm" type="submit">
              Archive
            </button>
          </form>
        ) : (
          <form action={setStatus.bind(null, entity, id, "DRAFT")}>
            <button className="btn btn-g btn-sm" type="submit">
              Restore
            </button>
          </form>
        )}
      </div>
    </>
  );
}

export function StatusSelect({ value }: { value?: ContentStatus }) {
  return (
    <div className="fld">
      <label htmlFor="status">Status</label>
      <div className="selwrap">
        <select id="status" name="status" defaultValue={value ?? "DRAFT"}>
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      </div>
    </div>
  );
}

export function Empty({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="empty">
      <b>{title}</b>
      {hint}
    </div>
  );
}
