"use client";

import { useState } from "react";

import type { Block } from "@/lib/content";

/**
 * Renders study material as a technical textbook rather than as dashboard
 * cards.
 *
 * Two things drive every decision here:
 *
 *   1. **Sub-items get their own block.** The source runs "(a) distance;
 *      (b) time; (c) velocity;" together, and rendering that as prose is what
 *      made the material unreadable. Each lettered clause is its own row with
 *      its own label column, so they can never collapse into one line.
 *
 *   2. **Figures sit where they belong.** A diagram is placed in the flow at
 *      the point the source put it, at its natural aspect ratio, with a
 *      click-to-enlarge for the ones whose labels are small.
 *
 *   3. **The teaching apparatus reads as apparatus.** A definition, a set of
 *      key points, a common mistake and a takeaway are not paragraphs — a
 *      reader skims for them, so each has a form of its own and can be found
 *      without reading the prose around it.
 *
 * Nothing here is in a card except the blocks that are genuinely asides. The
 * running text stays running text; hierarchy comes from type, spacing and
 * rules.
 */
export default function StudyContentRenderer({ blocks }: { blocks: Block[] }) {
  const [zoomed, setZoomed] = useState<{ src: string; caption?: string } | null>(null);

  if (blocks.length === 0) {
    return (
      <div className="empty">
        <b>No notes written against this code yet</b>
        The official requirement above is complete and examinable. Where the course covers the
        topic, the section that teaches it is linked above.
      </div>
    );
  }

  return (
    <>
      <div className="prose">
        {blocks.map((block, i) => {
          switch (block.type) {
            case "heading":
              return <h2 key={i}>{titleCase(block.text)}</h2>;

            case "subheading":
              return <h3 key={i}>{block.text}</h3>;

            case "paragraph":
              // A lead paragraph opens a topic and says what it is for, so it
              // is set slightly larger than the material it introduces.
              return (
                <p key={i} className={"lead" in block && block.lead ? "topic-lead" : undefined}>
                  {block.text}
                </p>
              );

            case "definition":
              return (
                <div className="definition" key={i}>
                  <dfn>{block.term}</dfn>
                  <p>{block.text}</p>
                </div>
              );

            case "keypoints":
              return (
                <aside className="keypoints" key={i}>
                  <b>Key points</b>
                  <ul>
                    {block.items.map((item, n) => (
                      <li key={n}>{item}</li>
                    ))}
                  </ul>
                </aside>
              );

            case "example":
              return (
                <aside className="worked-example" key={i}>
                  <b>{block.title ?? "Worked example"}</b>
                  {block.text.split("\n").map((line, n) => (
                    <p key={n}>{line}</p>
                  ))}
                </aside>
              );

            case "context":
              return (
                <aside className="in-the-aircraft" key={i}>
                  <b>In the aircraft</b>
                  <p>{block.text}</p>
                </aside>
              );

            case "misconception":
              return (
                <aside className="common-mistake" key={i}>
                  <b>Where this goes wrong</b>
                  <p>{block.text}</p>
                </aside>
              );

            case "takeaway":
              return (
                <aside className="takeaway" key={i}>
                  <b>Remember</b>
                  <p>{block.text}</p>
                </aside>
              );

            /* The fix for the collapsing (a)/(b)/(c) problem. */
            case "subitem":
              return (
                <div className="subitem" key={i}>
                  <span className="subitem-label" aria-hidden="true">
                    {block.label}
                  </span>
                  <div className="subitem-body">
                    {block.title && <strong>{block.title}</strong>}
                    {block.text && <p>{block.text}</p>}
                  </div>
                </div>
              );

            case "formula":
              return (
                <div className="formula" key={i}>
                  <code>{block.text}</code>
                  {block.note && <small>{block.note}</small>}
                </div>
              );

            case "objective":
              return (
                <div className="objective" key={i}>
                  <div className="objective-label">
                    <span className="num">{block.code}</span> What you need to know
                  </div>
                  {block.text.split("\n").map((line, n) => (
                    <p key={n}>{line}</p>
                  ))}
                </div>
              );

            case "figure": {
              const src = `/api/study-figures/${block.assetId}`;
              return (
                <figure className="study-figure" key={i}>
                  <button
                    type="button"
                    className="figure-zoom"
                    onClick={() => setZoomed({ src, caption: block.caption })}
                    aria-label={`Enlarge: ${block.caption ?? block.alt ?? "diagram"}`}
                  >
                    {/* Deliberately a plain <img>: these are private,
                        authenticated bytes of unknown intrinsic size, which
                        the image optimiser cannot pre-measure. Lazy loading
                        matters more here — a topic can carry 40 diagrams. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt={block.alt ?? "Technical diagram"} loading="lazy" />
                    <span className="figure-hint">Click to enlarge</span>
                  </button>
                  {block.caption && <figcaption>{block.caption}</figcaption>}
                </figure>
              );
            }

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

            case "note":
              return (
                <aside className={`callout ${block.variant ?? "info"}`} key={i}>
                  {block.title && <b>{block.title}</b>}
                  <p>{block.text}</p>
                </aside>
              );

            case "table":
              return (
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

            default:
              return null;
          }
        })}
      </div>

      {/* Lightbox. Escape closes it, the backdrop closes it, and focus goes to
          the close button so a keyboard user is not stranded behind it. */}
      {zoomed && (
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={zoomed.caption ?? "Enlarged diagram"}
          onClick={() => setZoomed(null)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setZoomed(null);
          }}
        >
          <button
            className="lightbox-close"
            type="button"
            onClick={() => setZoomed(null)}
            autoFocus
          >
            Close
          </button>
          <div className="lightbox-inner" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={zoomed.src} alt={zoomed.caption ?? "Enlarged technical diagram"} />
            {zoomed.caption && <p className="lightbox-caption">{zoomed.caption}</p>}
          </div>
        </div>
      )}
    </>
  );
}

/**
 * The source sets slide headings in full capitals. Capitals are harder to read
 * in running text, so they are cased down for display — the words themselves
 * are untouched, and known aviation abbreviations keep their capitals.
 */
const KEEP_CAPS = new Set([
  "SI", "ICAO", "CAA", "NZ", "TR", "CP", "CL", "CD", "IAS", "TAS", "EAS", "CAS",
  "L/D", "RPM", "DC", "AC", "GNSS", "TCAS", "TAWS", "EFIS", "ELT", "MAUW", "AIP",
  "CG", "ISA", "SL", "MSL", "QNH", "QFE", "AOA", "GA", "PIC", "VFR", "IFR", "TAF",
  "METAR", "NOTAM", "NM", "KT", "EGT", "CHT", "MP", "ATC",
]);

function titleCase(text: string): string {
  if (text !== text.toUpperCase()) return text;
  return text
    .split(/\s+/)
    .map((word) => {
      const bare = word.replace(/[^A-Z/]/g, "");
      if (KEEP_CAPS.has(bare)) return word;
      if (word.length <= 2 && /^[A-Z]+$/.test(word)) return word;
      return word.charAt(0) + word.slice(1).toLowerCase();
    })
    .join(" ");
}
