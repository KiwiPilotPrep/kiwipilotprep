/**
 * The KiwiPilotPrep watermark on rendered study material.
 *
 * Uses the project's existing brand mark — the same four-point star as the
 * header and footer — rather than a new logo invented for this feature (§8).
 * The source material carried no other academy's branding in its text, and
 * none is reproduced here.
 *
 * Deliberately quiet: it sits behind the content at low opacity, is
 * `aria-hidden` so it is never read aloud, and carries `pointer-events: none`
 * so it cannot intercept a tap. A watermark that interferes with reading has
 * failed at the only job it has.
 */
export default function StudyWatermark() {
  return (
    <div className="study-watermark" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"
        strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2 L14.2 9.4 L22 12 L14.2 14.6 L12 22 L9.8 14.6 L2 12 L9.8 9.4 Z" />
      </svg>
      <span>KiwiPilotPrep</span>
    </div>
  );
}
