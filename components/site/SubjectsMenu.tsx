"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type Track = {
  id: string;
  slug: string;
  title: string;
  subjectCount: number;
  /** Whether the course has any material yet. */
  ready: boolean;
};

export default function SubjectsMenu({ tracks }: { tracks: Track[] }) {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("click", onDocClick);
    addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onDocClick);
      removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div className="hasmenu" ref={wrap}>
      <button
        className="navbtn"
        aria-expanded={open}
        aria-controls="subjmenu"
        onClick={() => setOpen((v) => !v)}
      >
        Subjects
        <svg viewBox="0 0 24 24">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      <div className={`menu${open ? " on" : ""}`} id="subjmenu" role="menu">
        {tracks.length === 0 && (
          <Link href="/courses" role="menuitem">
            <span className="mk">—</span>
            <span>
              <b>No courses published yet</b>
              <span>Add one in the admin console</span>
            </span>
          </Link>
        )}

        {tracks.map((t) =>
          t.ready ? (
            <Link
              key={t.id}
              href={`/courses/${t.slug}`}
              role="menuitem"
              onClick={() => setOpen(false)}
            >
              <span className="mk">{t.slug.slice(0, 3).toUpperCase()}</span>
              <span>
                <b>{t.title}</b>
                <span>
                  {t.subjectCount} {t.subjectCount === 1 ? "subject" : "subjects"}
                </span>
              </span>
            </Link>
          ) : (
            // Shown, but not a link. Opening a course with nothing in it is a
            // worse answer than being told it is on the way.
            <span key={t.id} className="soon" role="menuitem" aria-disabled="true">
              <span className="mk">{t.slug.slice(0, 3).toUpperCase()}</span>
              <span>
                <b>{t.title}</b>
                <span>Coming soon</span>
              </span>
            </span>
          ),
        )}
      </div>
    </div>
  );
}
