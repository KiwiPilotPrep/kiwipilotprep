"use client";

import Link from "next/link";
import { useState } from "react";

import type { SyllabusNavTopic } from "@/lib/syllabus";
import { codeToSlug } from "@/lib/syllabus-codes";

/**
 * The syllabus index.
 *
 * Two hundred items is too many to scroll, so topics collapse and the one
 * containing the current item opens itself. On a phone the whole panel
 * collapses behind a button — the brief is explicit that the content, not the
 * navigation, is the primary thing on a small screen.
 *
 * Every row shows its official code because that is what a student is given on
 * a knowledge deficiency report: "you lost marks on 12.6.24" has to be
 * findable here without translation.
 */
export default function SyllabusNav({
  topics,
  courseSlug,
  subjectSlug,
  activeCode,
}: {
  topics: SyllabusNavTopic[];
  courseSlug: string;
  subjectSlug: string;
  activeCode?: string;
}) {
  const activeTopic = activeCode
    ? topics.find((t) => t.items.some((i) => i.code === activeCode))?.code
    : undefined;

  const [open, setOpen] = useState<Set<string>>(
    () => new Set(activeTopic ? [activeTopic] : topics.length <= 3 ? topics.map((t) => t.code) : []),
  );
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggle = (code: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });

  // Which topics open a new section, derived once rather than tracked with a
  // variable mutated during the map — that reads as a running total but is
  // recomputed on every render, and React rightly warns about it.
  const startsSection = new Set(
    topics
      .filter((t, i) => t.sectionTitle && t.sectionTitle !== topics[i - 1]?.sectionTitle)
      .map((t) => t.code),
  );

  return (
    <nav className={`syl-nav${mobileOpen ? " is-open" : ""}`} aria-label="Syllabus index">
      <button
        className="syl-toggle"
        type="button"
        onClick={() => setMobileOpen((o) => !o)}
        aria-expanded={mobileOpen}
      >
        <span>{mobileOpen ? "Hide" : "Browse"} syllabus index</span>
        <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      <div className="syl-scroll">
        {topics.map((topic) => {
          const isOpen = open.has(topic.code);
          const done = topic.items.filter((i) => i.completed).length;
          const showSection = startsSection.has(topic.code);

          return (
            <div key={topic.code}>
              {showSection && (
                <div className="syl-section">
                  Section {topic.sectionNumber} · {topic.sectionTitle}
                </div>
              )}

              <button
                className={`syl-topic${isOpen ? " is-open" : ""}`}
                type="button"
                onClick={() => toggle(topic.code)}
                aria-expanded={isOpen}
              >
                <span className="syl-code">{topic.code}</span>
                <span className="syl-title">{topic.title}</span>
                <span className="syl-count">
                  {done}/{topic.items.length}
                </span>
              </button>

              {isOpen && (
                <ul className="syl-items">
                  {topic.items.map((item) => {
                    const isActive = item.code === activeCode;
                    return (
                      <li key={item.code}>
                        <Link
                          className={`syl-item${isActive ? " is-active" : ""}${
                            item.completed ? " is-done" : ""
                          }${item.hasContent ? "" : " is-empty"}`}
                          href={`/study/${courseSlug}/${subjectSlug}/${codeToSlug(item.code)}`}
                          aria-current={isActive ? "page" : undefined}
                          onClick={() => setMobileOpen(false)}
                        >
                          <span className="syl-mark" aria-hidden="true">
                            {item.completed ? "✓" : "·"}
                          </span>
                          <span className="syl-code">{item.code}</span>
                          <span className="syl-req">
                            {/* First line only: requirements run to several
                                lettered clauses and the index is for finding,
                                not for reading. */}
                            {item.requirement.split("\n")[0]}
                          </span>
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
