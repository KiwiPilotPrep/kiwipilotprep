"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { User } from "@prisma/client";

type Track = {
  id: string;
  slug: string;
  title: string;
  subjectCount: number;
  /** Whether the course has any material yet. */
  ready: boolean;
};

export default function MobileNav({
  user,
  tracks,
}: {
  user: User | null;
  tracks: Track[];
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        className={`burger${open ? " on" : ""}`}
        aria-label="Menu"
        aria-expanded={open}
        aria-controls="mnav"
        onClick={() => setOpen((v) => !v)}
      >
        <span />
        <span />
        <span />
      </button>

      <div
        className={`mnav${open ? " on" : ""}`}
        id="mnav"
        onClick={(e) => {
          if ((e.target as Element).closest("a")) setOpen(false);
        }}
      >
        {tracks.map((t) =>
          t.ready ? (
            <Link className="mitem" key={t.id} href={`/courses/${t.slug}`}>
              {t.title}{" "}
              <em>
                {t.subjectCount} {t.subjectCount === 1 ? "subject" : "subjects"}
              </em>
            </Link>
          ) : (
            <span className="mitem is-soon" key={t.id} aria-disabled="true">
              {t.title} <em>Coming soon</em>
            </span>
          ),
        )}
        <Link className="mitem" href="/#guarantee">
          Guarantee <em>1st attempt</em>
        </Link>
        <Link className="mitem" href="/flight-schools">
          Flight Schools <em>Enterprise</em>
        </Link>
        <Link className="mitem" href="/#pricing">
          Pricing <em>NZD / INR</em>
        </Link>
        <Link className="mitem" href="/contact">
          Contact
        </Link>

        <div className="mact">
          {user ? (
            <>
              <Link className="btn btn-p btn-w" href="/dashboard">
                Go to Dashboard
              </Link>
              {user.role === "ADMIN" && (
                <Link className="btn btn-g btn-w" href="/admin">
                  Admin Console
                </Link>
              )}
            </>
          ) : (
            <>
              <Link className="btn btn-p btn-w" href="/signup">
                Start Free Trial
              </Link>
              <Link className="btn btn-g btn-w" href="/login">
                Log In
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
}
