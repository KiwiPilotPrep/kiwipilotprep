import Link from "next/link";

import { setChapterComplete } from "@/app/(student)/actions";

/**
 * Previous / Mark as Complete / Next (§21).
 *
 * The completion control is a real <form> bound to a server action rather than
 * an onClick handler, so it works before hydration and without client JS.
 */
export default function ChapterFooter({
  chapterId,
  isComplete,
  path,
  prevHref,
  nextHref,
}: {
  chapterId: string;
  isComplete: boolean;
  path: string;
  prevHref: string | null;
  nextHref: string | null;
}) {
  return (
    <div className="chapter-nav">
      {prevHref ? (
        <Link className="btn btn-g" href={prevHref}>
          ← Previous
        </Link>
      ) : (
        <span />
      )}

      <form action={setChapterComplete.bind(null, chapterId, !isComplete, path)}>
        <button className={isComplete ? "btn btn-g" : "btn btn-p"} type="submit">
          {isComplete ? "✓ Completed — undo" : "Mark as Complete"}
        </button>
      </form>

      {nextHref ? (
        <Link className="btn btn-g" href={nextHref}>
          Next →
        </Link>
      ) : (
        <span />
      )}
    </div>
  );
}
