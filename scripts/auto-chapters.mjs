/**
 * Builds a chapter structure for a deck that has none.
 *
 * Most lecture decks announce their sections: a divider slide, or a chapter
 * name printed above every slide's own heading. Some do not, and those arrive
 * as one flat run of three hundred lessons — navigable only by scrolling, and
 * useless as a course index.
 *
 * The structure is still there; it is just implicit. A deck teaches one subject
 * at a time, so consecutive lessons share vocabulary: forty slides in a row
 * mention VOR, then a run mentions ILS, then GNSS. Those runs are the chapters,
 * and this finds them by watching where the vocabulary turns over.
 *
 * Deliberately conservative. A boundary is only called where the vocabulary
 * genuinely changes and the run either side is long enough to be a chapter;
 * everything else stays with the run before it. Over-segmenting a course index
 * is worse than under-segmenting it — a reader can scan a long chapter, but a
 * chapter that starts in the middle of a topic misleads.
 */
import { terms, buildIdf } from "./syllabus-match.mjs";

/**
 * Below this a run is a tail of the chapter before it, not a chapter.
 *
 * Set where a chapter starts being worth having. Four lessons is a paragraph
 * break, not a section: a course index of seventy four-lesson chapters is as
 * unusable as the flat list it replaced, just longer.
 */
const MIN_RUN = 8;

/** Above this a chapter is too big to help, and a weaker boundary will do. */
const MAX_RUN = 45;

/**
 * How many consecutive off-theme lessons it takes to call a boundary.
 *
 * One lesson that shares no vocabulary with its neighbours is usually a
 * diagram page, a summary, or a worked example — not the start of a new
 * chapter. Requiring two in a row stops the index fracturing on those.
 */
const TURNOVER = 2;

/** A term must be at least this rare within the deck to name a chapter. */
const RARITY = Math.log(1 / 0.25);

/** Words that recur across every aviation deck and name nothing. */
const WEAK = new Set(
  `aircraft flight pilot system systems use used using operation operations
   information required requirement requirements must may can will shall
   above below within between during type types class classes level levels
   figure diagram example examples note notes page slide
   based continued provides provide provided following follows general
   review summary introduction overview part section further other another
   given includes including consider considered applies applied`
    .split(/\s+/)
    .filter(Boolean),
);

/** The terms that say what a lesson is about. */
function keyTerms(lesson, idf) {
  const title = terms(lesson.title).filter((t) => !WEAK.has(t));
  const scored = title
    .map((t) => ({ t, w: idf.get(t) ?? 0 }))
    .filter((x) => x.w >= RARITY)
    .sort((a, b) => b.w - a.w);
  return new Set(scored.slice(0, 3).map((x) => x.t));
}

/** A chapter name has to read like a chapter, not like a word. */
const NAME_MIN = 4;
const NAME_MAX = 60;

/**
 * Names a chapter after one of its own headings.
 *
 * The theme term says what the chapter is about, but on its own it makes a
 * poor name: "Datum", "Sector", "Based". The source already contains a
 * well-formed phrase for the same idea — one of the chapter's topic headings
 * — so the term is used to choose among those headings rather than to be the
 * name itself. The earliest heading that carries the theme wins, because a
 * chapter is named after what it opens with.
 *
 * Falls back to the term where no heading contains it, which happens when the
 * theme comes from body text rather than from any title.
 */
function nameFor(term, lessons) {
  const pattern = new RegExp(`\\b${term}[a-z]*\\b`, "i");

  const candidates = lessons
    .map((lesson) => (lesson.title ?? "").trim())
    .filter((title) => title.length >= NAME_MIN && title.length <= NAME_MAX)
    .filter((title) => pattern.test(title));

  // Prefer a phrase over a bare word, but never a whole sentence.
  const phrase = candidates.find((title) => title.split(/\s+/).length >= 2);
  if (phrase) return phrase;
  if (candidates.length) return candidates[0];

  for (const lesson of lessons) {
    const match = (lesson.title ?? "").match(pattern);
    if (match) {
      const word = match[0];
      return word === word.toUpperCase() ? word : word[0].toUpperCase() + word.slice(1);
    }
  }
  return term[0].toUpperCase() + term.slice(1);
}

/**
 * Groups a flat lesson list into chapters.
 *
 * Returns the same lessons, in the same order, partitioned. Nothing is dropped
 * or reordered — the only thing added is where the boundaries fall.
 */
export function autoChapters(lessons, firstSlide = null) {
  if (lessons.length < MIN_RUN * 2) {
    return [{ module: "Course Material", source_slide: firstSlide, lessons }];
  }

  const idf = buildIdf(lessons.map((l) => `${l.title} ${textOf(l)}`));
  const keys = lessons.map((l) => keyTerms(l, idf));

  const chapters = [];
  let current = { lessons: [], theme: new Map() };
  let offTheme = 0;

  const flush = () => {
    if (!current.lessons.length) return;
    // Name the chapter after the term that runs through it.
    const ranked = [...current.theme].sort((a, b) => b[1] - a[1]);
    const [top, count] = ranked[0] ?? [];
    const name =
      top && count >= 2
        ? nameFor(top, current.lessons)
        : (current.lessons[0].title ?? "Course Material").slice(0, NAME_MAX);
    chapters.push({
      module: name,
      // The first chapter inherits the original module's own opening slide, so
      // a divider or cover page that opened the deck stays accounted for.
      source_slide: chapters.length === 0 && firstSlide !== null
        ? Math.min(firstSlide, ...current.lessons.flatMap((l) => l.source_slides))
        : Math.min(...current.lessons.flatMap((l) => l.source_slides)),
      lessons: current.lessons,
    });
    current = { lessons: [], theme: new Map() };
    offTheme = 0;
  };

  for (let i = 0; i < lessons.length; i += 1) {
    const shares = [...keys[i]].some((t) => current.theme.has(t));
    const longEnough = current.lessons.length >= MIN_RUN;
    const tooLong = current.lessons.length >= MAX_RUN;

    // A lesson with no distinctive terms of its own — a summary, a diagram
    // page, a continuation — says nothing about where it belongs, so it never
    // counts towards a turnover.
    if (current.lessons.length && keys[i].size > 0) {
      offTheme = shares ? 0 : offTheme + 1;
    }

    // A boundary needs a sustained change of subject and a chapter worth
    // closing, or a chapter that has simply run too long to help.
    if (current.lessons.length && ((offTheme >= TURNOVER && longEnough) || tooLong)) {
      // The lessons that signalled the turnover open the new chapter, not close
      // the old one — the subject changed when they started.
      const carry = current.lessons.splice(current.lessons.length - (offTheme - 1) || 0);
      flush();
      for (const lesson of carry) {
        current.lessons.push(lesson);
        for (const t of keyTerms(lesson, idf)) {
          current.theme.set(t, (current.theme.get(t) ?? 0) + 1);
        }
      }
    }

    current.lessons.push(lessons[i]);

    // A lesson only teaches the chapter its vocabulary. An off-theme lesson
    // that is being tolerated must not widen the theme to include itself, or
    // the lesson after it "shares" with it, the turnover resets, and a boundary
    // can never be reached — the chapter runs on until it hits the length cap
    // instead of ending where the subject actually changed.
    const establishing = current.lessons.length <= MIN_RUN;
    if (shares || establishing) {
      for (const t of keys[i]) current.theme.set(t, (current.theme.get(t) ?? 0) + 1);
    }
  }
  flush();

  return mergeStragglers(chapters);
}

function textOf(lesson) {
  return lesson.content
    .filter((b) => b.type === "text")
    .map((b) => b.content)
    .join(" ");
}

/**
 * Folds a chapter too short to stand on its own into its neighbour.
 *
 * Runs after the pass rather than inside it, because whether a run is a
 * straggler is only knowable once the run after it has been seen.
 */
function mergeStragglers(chapters) {
  const out = [];
  for (const chapter of chapters) {
    const previous = out[out.length - 1];
    if (previous && chapter.lessons.length < MIN_RUN) {
      previous.lessons.push(...chapter.lessons);
      continue;
    }
    out.push(chapter);
  }
  return out;
}
