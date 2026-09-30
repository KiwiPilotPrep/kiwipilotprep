/**
 * Uploaded files, as an admin needs to deal with them.
 *
 * A filename printed as text is not an attachment — it is a claim that one
 * exists. This shows what the file actually is and gives the two things a
 * reviewer does with it: open it to read, or download it to keep.
 *
 * Both go through an authorised route; neither is a filesystem path, and
 * neither is guessable from the claim. An image is previewed inline because
 * a result sheet photographed on a phone is read faster than it is
 * described, and the preview is served by the same sandboxed route as the
 * download.
 */

export type AdminAttachment = {
  id: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: Date;
};

function humanSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function kindOf(mimeType: string): string {
  if (mimeType === "application/pdf") return "PDF";
  if (mimeType === "image/jpeg") return "JPG";
  if (mimeType === "image/png") return "PNG";
  return mimeType || "File";
}

/**
 * The files themselves, as a list.
 *
 * Separated from the panel so it can be dropped straight into a table cell
 * beside the message that carried the files — an admin should never have to
 * match an attachment to a message by name.
 */
export function AttachmentList({
  files,
  basePath,
  compact = false,
}: {
  files: AdminAttachment[];
  basePath: string;
  compact?: boolean;
}) {
  if (files.length === 0) {
    return <span className="xs">No attachment uploaded</span>;
  }

  return (
    <ul className="attlist">
      {files.map((f) => {
        const href = `${basePath}/${f.id}`;
        const kind = kindOf(f.mimeType);
        const isImage = f.mimeType === "image/jpeg" || f.mimeType === "image/png";
        return (
          <li key={f.id}>
            <div className="attname">
              <span aria-hidden="true">📎</span>
              <span className="nm">{f.filename}</span>
            </div>
            <div className="xs">
              {kind} · {humanSize(f.sizeBytes)}
              {!compact && <> · uploaded {f.createdAt.toLocaleString("en-NZ")}</>}
            </div>
            {!compact && isImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                className="attpreview"
                src={`${href}?disposition=inline`}
                alt={`Preview of ${f.filename}`}
              />
            )}
            <div className="acts" style={{ gap: "6px", marginTop: "6px", flexWrap: "wrap" }}>
              {/* Plain anchors: these are files, not routes. Images say
                  View, because that is what happens; a PDF says Open PDF. */}
              <a
                className="btn btn-g btn-sm"
                href={`${href}?disposition=inline`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {isImage ? "View" : `Open ${kind}`}
              </a>
              <a className="btn btn-g btn-sm" href={href}>
                Download
              </a>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export default function Attachments({
  files,
  basePath,
  heading = "Uploaded document",
  emptyHint = "Nothing has been uploaded against this claim.",
}: {
  files: AdminAttachment[];
  /** The authorised route that serves one of these by id. */
  basePath: string;
  heading?: string;
  emptyHint?: string;
}) {
  if (files.length === 0) {
    return (
      <div className="panel">
        <div className="panel-hd">
          <h2>{heading}</h2>
        </div>
        <div className="empty">
          <b>No attachment uploaded</b>
          {emptyHint}
        </div>
      </div>
    );
  }

  return (
    <div className="panel">
      <div className="panel-hd">
        <h2>
          {heading}
          {files.length > 1 ? ` (${files.length})` : ""}
        </h2>
        <span className="xs">Opens through an admin-only route</span>
      </div>
      <div className="panel-bd">
        <AttachmentList files={files} basePath={basePath} />
      </div>
    </div>
  );
}
