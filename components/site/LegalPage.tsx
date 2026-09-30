import type { ReactNode } from "react";

/**
 * Shared shell for Terms, Privacy and Refunds.
 *
 * These pages are read when something has gone wrong — a student wants their
 * money back, or wants to know what happened to their exam data. They get the
 * same typography as the rest of the site and a stated review date, so nobody
 * has to guess how current the wording is.
 */
export default function LegalPage({
  eyebrow,
  title,
  lede,
  updated,
  children,
}: {
  eyebrow: string;
  title: string;
  lede: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <section className="sec">
      <div className="wrap legal">
        <div className="sec-head r in">
          <div className="eyebrow">{eyebrow}</div>
          <h1 className="h2">{title}</h1>
          <p className="lede mt-s">{lede}</p>
          <p className="xs mt-s">Last updated {updated}</p>
        </div>

        <div className="legal-body">{children}</div>

        <div className="ftdisc" style={{ marginTop: "34px" }}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v5M12 16.2h.01" />
          </svg>
          <p>
            <b>Disclaimer:</b> KiwiPilotPrep is an independent educational tool. Not affiliated
            with Aspeq or CAANZ.
          </p>
        </div>
      </div>
    </section>
  );
}
