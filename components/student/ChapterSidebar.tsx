"use client";

import Link from "next/link";
import { useState } from "react";

type Item = { slug: string; title: string; done: boolean; current: boolean };

/**
 * Chapter index. A persistent sidebar on desktop; on tablet and mobile it
 * collapses into a drawer toggled by the button (§24).
 */
export default function ChapterSidebar({
  subjectTitle,
  courseTitle,
  courseHref,
  base,
  chapters,
  progress,
}: {
  subjectTitle: string;
  courseTitle: string;
  courseHref: string;
  base: string;
  chapters: Item[];
  progress: { completed: number; total: number; percent: number };
}) {
  const [open, setOpen] = useState(false);
  const current = chapters.find((c) => c.current);

  return (
    <>
      <button
        className="chapters-toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="chapter-index"
      >
        <span>
          <b>Chapters</b>
          <em>{current ? current.title : subjectTitle}</em>
        </span>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      <aside className={`chapters${open ? " open" : ""}`} id="chapter-index">
        <div className="chapters-hd">
          <Link className="xs" href={courseHref}>
            {courseTitle}
          </Link>
          <h2 className="h4">{subjectTitle}</h2>
          <div className="bar mt-s">
            <i style={{ width: `${progress.percent}%` }} />
          </div>
          <p className="xs" style={{ marginTop: "6px" }}>
            {progress.completed} / {progress.total} complete
          </p>
        </div>

        <nav className="chapters-list">
          {chapters.map((c, i) => (
            <Link
              key={c.slug}
              href={`${base}/${c.slug}`}
              className={`chapter-link${c.current ? " current" : ""}${c.done ? " done" : ""}`}
              onClick={() => setOpen(false)}
              aria-current={c.current ? "page" : undefined}
            >
              <span className="mark" aria-hidden="true">
                {c.done ? "✓" : c.current ? "→" : "○"}
              </span>
              <span className="tx">
                <em>Chapter {i + 1}</em>
                {c.title}
              </span>
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
}
