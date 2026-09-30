import type { Block } from "@/lib/content";

/**
 * Renders chapter blocks. Everything is escaped by React, so admin-entered
 * text can never become markup on a student's page.
 */
export default function ContentRenderer({ blocks }: { blocks: Block[] }) {
  if (blocks.length === 0) {
    return (
      <div className="empty">
        <b>No content yet</b>
        The study material for this chapter has not been published.
      </div>
    );
  }

  return (
    <div className="chapter-body">
      {blocks.map((block, i) => {
        switch (block.type) {
          case "heading":
            return <h2 key={i}>{block.text}</h2>;

          case "subheading":
            return <h3 key={i}>{block.text}</h3>;

          case "paragraph":
            return <p key={i}>{block.text}</p>;

          case "list":
            return block.ordered ? (
              <ol key={i}>
                {block.items.map((it, n) => (
                  <li key={n}>{it}</li>
                ))}
              </ol>
            ) : (
              <ul key={i}>
                {block.items.map((it, n) => (
                  <li key={n}>{it}</li>
                ))}
              </ul>
            );

          case "table":
            return (
              // Wide tables scroll inside their own box rather than breaking
              // the page on mobile (§24).
              <div className="tablewrap" key={i}>
                <table>
                  <thead>
                    <tr>
                      {block.headers.map((h, n) => (
                        <th key={n}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.map((row, n) => (
                      <tr key={n}>
                        {row.map((cell, m) => (
                          <td key={m}>{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );

          case "image":
            return (
              <figure key={i}>
                {/* Admin-supplied URLs are arbitrary, so next/image optimisation
                    is deliberately skipped here. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={block.url} alt={block.alt ?? ""} loading="lazy" />
                {block.caption && <figcaption>{block.caption}</figcaption>}
              </figure>
            );

          case "note":
            return (
              <aside className={`cnote ${block.variant ?? "info"}`} key={i}>
                {block.title && <b>{block.title}</b>}
                <p>{block.text}</p>
              </aside>
            );

          case "link":
            return (
              <p key={i}>
                <a href={block.url} target="_blank" rel="noopener noreferrer">
                  {block.label || block.url}
                </a>
              </p>
            );

          case "pdf":
            return (
              <p key={i}>
                <a className="filelink" href={block.url} target="_blank" rel="noopener noreferrer">
                  📄 {block.label || "Download file"}
                </a>
              </p>
            );

          case "video":
            return (
              <div className="videowrap" key={i}>
                <iframe
                  src={block.url}
                  title={block.title ?? "Video"}
                  allowFullScreen
                  loading="lazy"
                />
              </div>
            );

          default:
            return null;
        }
      })}
    </div>
  );
}
