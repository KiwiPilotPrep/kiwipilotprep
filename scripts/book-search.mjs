/**
 * Searching the reference books for a syllabus requirement.
 *
 * The brief sets an order: check the book before writing anything new. That
 * only works if the book can be searched by *requirement* rather than by
 * keyword — "State the normal inspection period for an ELT" has to find the
 * ELT maintenance page even though the book never uses the word "state".
 *
 * So the same scoring the lesson matcher uses is applied here: instruction
 * verbs dropped, terms weighted by how rare they are in that book, and a page
 * scored on how much of the requirement it accounts for. Headings count for
 * more than body text, for the same reason a lesson title does — a page headed
 * "Emergency Locator Transmitters" is about ELTs; a page that mentions them in
 * passing is not.
 */
import fs from "node:fs";
import path from "node:path";

import { terms, buildIdf, coverage, headClause, clausesOf } from "./syllabus-match.mjs";

const BOOKS_ROOT = ".cache/books";

/** Loads every extracted book, with a per-book term-rarity model. */
export function loadBooks() {
  if (!fs.existsSync(BOOKS_ROOT)) return [];

  const books = [];
  for (const dir of fs.readdirSync(BOOKS_ROOT)) {
    const file = path.join(BOOKS_ROOT, dir, "book.json");
    if (!fs.existsSync(file)) continue;

    const data = JSON.parse(fs.readFileSync(file, "utf8"));
    // Rarity is measured within the book. A term that is distinctive in an air
    // law text is not distinctive in a meteorology one, and a pooled corpus
    // would blunt exactly the words doing the work.
    const idf = buildIdf(data.pages.map((p) => `${p.headings.join(" ")} ${p.text}`));
    books.push({
      slug: dir,
      source: data.source_file,
      pages: data.pages,
      idf,
    });
  }
  return books;
}

/**
 * The best page of one book for a requirement, or null.
 *
 * `preferred` names the book to search — the subject's own text. Passing it is
 * not a filter for tidiness: the air law book will happily half-match a
 * meteorology requirement, and a cross-subject hit is nearly always wrong.
 */
/**
 * The syllabus code a book page announces itself with, if any.
 *
 * Three of the five books are written to the syllabus and print its topic
 * numbers as their headings — "16.58 Enroute Limitations". Where that is true
 * it is decisive evidence, far better than any amount of word overlap, so it
 * is looked for first and everything else is a fallback.
 */
const PAGE_CODE = /^(\d{1,3}\.\d{1,3})(?:\.\d{1,3})?(?:\s|$)/;

function pageCodes(page) {
  const codes = new Set();
  for (const heading of page.headings) {
    const match = PAGE_CODE.exec(heading.trim());
    if (match) codes.add(match[1]);
  }
  // A page can open mid-topic, so the first few lines count too.
  for (const line of page.text.split("\n").slice(0, 4)) {
    const match = PAGE_CODE.exec(line.trim());
    if (match) codes.add(match[1]);
  }
  return codes;
}

export function searchBooks(books, requirement, preferred = null, itemCode = null) {
  const candidates = preferred
    ? books.filter((b) => b.source === preferred || b.slug === preferred)
    : books;
  if (!candidates.length) return null;

  const need = terms(requirement);
  if (!need.length) return null;
  const head = terms(headClause(requirement));
  const clauses = clausesOf(requirement)
    .map((c) => terms(c))
    .filter((t) => t.length);

  let best = null;

  for (const book of candidates) {
    for (const page of book.pages) {
      if (!page.text || page.is_questions) continue;

      const headingTerms = terms(page.headings.join(" "));
      const bodyTerms = terms(page.text);

      // Whichever reading of the requirement this page answers best — the
      // whole thing, its head clause, or one lettered entry of a list.
      const readings = [
        { t: need, w: 1 },
        ...(head.length ? [{ t: head, w: 1 }] : []),
        ...clauses.map((t) => ({ t, w: 0.9 })),
      ];

      let headingScore = 0;
      let bodyScore = 0;
      for (const reading of readings) {
        headingScore = Math.max(headingScore, coverage(reading.t, headingTerms, book.idf) * reading.w);
        bodyScore = Math.max(bodyScore, coverage(reading.t, bodyTerms, book.idf) * reading.w);
      }

      // A heading is a claim about what the page is for; the body only shows
      // the words appear somewhere on it.
      let score = headingScore * 0.55 + bodyScore * 0.45;

      // A page headed with this item's own topic number is about this item,
      // whatever its wording overlap happens to be. Applied as a floor rather
      // than a bonus, so it cannot push an unrelated page above a genuinely
      // better one.
      let anchored = false;
      if (itemCode) {
        const topicCode = itemCode.split(".").slice(0, 2).join(".");
        if (pageCodes(page).has(topicCode)) {
          score = Math.max(score, 0.6 + bodyScore * 0.4);
          anchored = true;
        }
      }

      if (!best || score > best.score) {
        best = {
          book: book.source,
          page: page.n,
          heading: page.headings[0] ?? null,
          score,
          headingScore,
          bodyScore,
          anchored,
          figures: page.figures.length,
        };
      }
    }
  }

  return best;
}

/** Every page of a book above a score, for reading a topic rather than an item. */
export function searchBookPages(books, requirement, preferred, { limit = 5, min = 0.35 } = {}) {
  const hits = [];
  const candidates = preferred
    ? books.filter((b) => b.source === preferred || b.slug === preferred)
    : books;

  const need = terms(requirement);
  if (!need.length) return hits;

  for (const book of candidates) {
    for (const page of book.pages) {
      if (!page.text || page.is_questions) continue;
      const headingScore = coverage(need, terms(page.headings.join(" ")), book.idf);
      const bodyScore = coverage(need, terms(page.text), book.idf);
      const score = headingScore * 0.55 + bodyScore * 0.45;
      if (score >= min) {
        hits.push({
          book: book.source,
          page: page.n,
          heading: page.headings[0] ?? null,
          score,
          figures: page.figures.length,
        });
      }
    }
  }

  return hits.sort((a, b) => b.score - a.score).slice(0, limit);
}
