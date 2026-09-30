"use client";

import Link from "next/link";
import { useState } from "react";

import type { LessonNavModule } from "@/lib/lessons";

/**
 * The course-material index: modules, and the lessons inside them.
 *
 * Deliberately the same furniture as the syllabus index it sits beside — a
 * student should not have to learn two navigation patterns inside one subject.
 * Modules collapse because a subject runs to a couple of hundred lessons, the
 * module holding the open lesson expands itself, and on a phone the whole
 * panel folds behind a button so the material stays the primary thing.
 *
 * Where the syllabus index shows a CAA code, this shows the topic's number
 * within the course — 3.4 is the fourth topic of chapter three. That is the
 * honest identifier here: this tree is the order the subject is taught in, not
 * the examinable index.
 */
export default function LessonNav({
  modules,
  courseSlug,
  subjectSlug,
  activeSlug,
}: {
  modules: LessonNavModule[];
  courseSlug: string;
  subjectSlug: string;
  activeSlug?: string;
}) {
  const activeModule = activeSlug
    ? modules.find((m) => m.lessons.some((l) => l.slug === activeSlug))?.id
    : undefined;

  const [open, setOpen] = useState<Set<string>>(
    () =>
      new Set(
        activeModule ? [activeModule] : modules.length <= 3 ? modules.map((m) => m.id) : [],
      ),
  );
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggle = (id: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const base = `/study/${courseSlug}/${subjectSlug}/lessons`;

  return (
    <nav className={`syl-nav${mobileOpen ? " is-open" : ""}`} aria-label="Course material">
      <button
        className="syl-toggle"
        type="button"
        onClick={() => setMobileOpen((o) => !o)}
        aria-expanded={mobileOpen}
      >
        <span>{mobileOpen ? "Hide" : "Browse"} course material</span>
        <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      <div className="syl-scroll">
        {modules.map((module) => {
          const isOpen = open.has(module.id);
          const done = module.lessons.filter((l) => l.completed).length;

          return (
            <div key={module.id}>
              <button
                className={`syl-topic${isOpen ? " is-open" : ""}`}
                type="button"
                onClick={() => toggle(module.id)}
                aria-expanded={isOpen}
              >
                <span className="syl-code">{module.number.padStart(2, "0")}</span>
                <span className="syl-title">{module.title}</span>
                <span className="syl-count">
                  {done}/{module.lessons.length}
                </span>
              </button>

              {isOpen && (
                <ul className="syl-items">
                  {module.lessons.map((lesson) => {
                    const isActive = lesson.slug === activeSlug;
                    return (
                      <li key={lesson.slug}>
                        <Link
                          className={`syl-item${isActive ? " is-active" : ""}${
                            lesson.completed ? " is-done" : ""
                          }${lesson.blockCount ? "" : " is-empty"}`}
                          href={`${base}/${lesson.slug}`}
                          aria-current={isActive ? "page" : undefined}
                          onClick={() => setMobileOpen(false)}
                        >
                          <span className="syl-mark" aria-hidden="true">
                            {lesson.completed ? "✓" : "·"}
                          </span>
                          <span className="syl-code">{lesson.number}</span>
                          <span className="syl-req">{lesson.title}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}
