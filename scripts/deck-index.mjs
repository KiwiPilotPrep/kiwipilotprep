/**
 * Turns an extracted deck manifest into the CMS tree:
 *
 *   COURSE -> MODULE / SECTION -> LESSON -> CONTENT BLOCKS -> DIAGRAMS
 *
 * The rule is that the tree is derived from the deck, never imposed on it.
 * Slide order is the authority: a slide either opens a module, opens a lesson,
 * or continues the lesson before it, and in every case its blocks are carried
 * across untouched and in order. No slide can fall outside the tree — a slide
 * that arrives before any heading gets an "Introduction" module rather than
 * being dropped, and a slide the extractor found nothing on is recorded by
 * number so the coverage count still reconciles against the source — but it is
 * not turned into a page. A topic whose entire content was the words "no
 * content in source" is an empty topic with extra steps.
 */
import fs from "node:fs";
import path from "node:path";

import { autoChapters } from "./auto-chapters.mjs";

/** Titles that mark the deck's own front matter rather than a teaching topic. */
const FRONT_MATTER = /^(subject no\.?\s*\d+|ppl\s|exam[:\s]|contents?$|introduction$)/i;

export function buildIndex(manifest) {
  const modules = [];
  let currentModule = null;
  let currentLesson = null;

  const openModule = (title, slide) => {
    // `orphan_slides` holds slide numbers that belong to this module but to no
    // lesson in it — a cover page, or a divider whose slide carried nothing.
    // They exist so the coverage check can still reconcile every slide in the
    // deck without a content-free lesson being invented to hold them.
    currentModule = { module: title, source_slide: slide, orphan_slides: [], lessons: [] };
    modules.push(currentModule);
    currentLesson = null;
    return currentModule;
  };

  const openLesson = (title, slide) => {
    if (!currentModule) openModule("Introduction", slide);
    currentLesson = {
      title,
      source_slides: [slide],
      /** Slides inside this lesson's span that the extractor found nothing on. */
      empty_slides: [],
      content: [],
      diagrams: [],
      tables: [],
      media: [],
    };
    currentModule.lessons.push(currentLesson);
    return currentLesson;
  };

  for (const slide of manifest.slides) {
    // Some decks print the chapter name above every slide's own title instead
    // of using divider slides. Where the extractor found one, a change of
    // label opens a module — otherwise a deck like that arrives as one flat
    // run of two hundred lessons with no structure at all.
    if (slide.section && slide.section !== currentModule?.module) {
      openModule(slide.section, slide.n);
    }

    // A slide carrying nothing but a heading is a section divider. If the
    // extractor ever calls one wrong and it does carry blocks, they are kept
    // under a lesson of the same name rather than discarded with the slide.
    if (slide.is_section) {
      // A cover or exam-information slide puts its whole message in the one
      // large text frame. Read as a divider it would become a module name
      // several lines long with no lesson under it, so the exam details end up
      // in the table of contents instead of in front of the student. Keep it
      // as a lesson, with every line preserved as content.
      const multiLine = slide.title.includes("\n");
      if (multiLine || isFrontMatter(slide.title)) {
        if (!currentModule) openModule("Course Information", slide.n);
        openLesson(slide.title.split("\n")[0].trim(), slide.n);
        for (const line of slide.title.split("\n")) {
          if (line.trim()) {
            currentLesson.content.push({
              type: "text",
              level: 0,
              content: line.trim(),
              source_slide: slide.n,
            });
          }
        }
        continue;
      }

      openModule(slide.title, slide.n);
      if (!slide.blocks.length && !slide.notes) continue;
      openLesson(slide.title, slide.n);
    }

    if (slide.title) {
      // The same heading repeated on the next slide is a continuation of one
      // long lesson, not a second lesson with the same name.
      if (currentLesson && currentLesson.title === slide.title) {
        currentLesson.source_slides.push(slide.n);
      } else {
        openLesson(slide.title, slide.n);
      }
    } else if (currentLesson) {
      currentLesson.source_slides.push(slide.n);
    } else {
      // Untitled with no lesson open — the slide straight after a section
      // divider. It belongs to that section, so the section names it. Falling
      // back to the source filename (the obvious thing) puts a lesson called
      // "PPLMeteorology2024_Professional" in front of the student and, worse,
      // gives the syllabus matcher a title with no meaning in it at all.
      // A cover page reaches here: no title, no lesson open. Naming a lesson
      // after the PDF gave the IR course a first topic called
      // "IFRNavigation2020_Branding_Removed" with nothing in it. If the slide
      // has nothing on it either, record the number and move on.
      if (!slide.blocks.length && !slide.notes) {
        if (!currentModule) openModule("Introduction", slide.n);
        currentModule.orphan_slides.push(slide.n);
        continue;
      }
      openLesson(
        currentModule?.module ?? manifest.source_file.replace(/\.[^.]+$/, ""),
        slide.n,
      );
    }

    for (const block of slide.blocks) {
      if (block.kind === "text") {
        currentLesson.content.push({
          type: "text",
          level: block.level ?? 0,
          content: block.text,
          source_slide: slide.n,
        });
      } else if (block.kind === "picture") {
        const picture = slide.pictures.find((p) => p.sha1 === block.sha1);
        const entry = {
          type: "diagram",
          asset: picture ? picture.asset : null,
          sha1: block.sha1,
          source_slide: slide.n,
        };
        currentLesson.content.push(entry);
        currentLesson.diagrams.push(entry);
      } else if (block.kind === "table") {
        const entry = { type: "table", rows: block.rows, source_slide: slide.n };
        currentLesson.content.push(entry);
        currentLesson.tables.push(entry);
      } else if (block.kind === "media") {
        const entry = {
          type: "media",
          note: "[MEDIA — PRESERVE FROM SOURCE]",
          poster: block.poster ?? null,
          source_slide: slide.n,
        };
        currentLesson.content.push(entry);
        currentLesson.media.push(entry);
      }
    }

    if (slide.notes) {
      currentLesson.content.push({
        type: "note",
        content: slide.notes,
        source_slide: slide.n,
      });
    }

    if (!slide.blocks.length && !slide.notes) {
      // Noted, not rendered. The student gained nothing from a paragraph
      // reading "[NO CONTENT IN SOURCE]", and the audit needs only the number.
      currentLesson.empty_slides.push(slide.n);
    }
  }

  // A run of lessons too long to scan is not an index whether it is the whole
  // deck or one oversized section of it — a ninety-lesson "Introduction" helps
  // a reader no more than a flat list does. Any such run is split on where the
  // deck's own vocabulary turns over. Sections the deck did mark are kept: only
  // the oversized ones are subdivided, and the lessons inside them stay in
  // order.
  // A lesson with no content is a divider slide that opened a topic and then
  // had nothing to put in it. Its slide numbers move up to the module so the
  // coverage check still sees them; the empty topic itself does not ship.
  for (const module of modules) {
    const empty = module.lessons.filter((lesson) => lesson.content.length === 0);
    if (!empty.length) continue;
    module.lessons = module.lessons.filter((lesson) => lesson.content.length > 0);
    for (const lesson of empty) module.orphan_slides.push(...lesson.source_slides);
  }

  // A chapter with no topics left in it is a divider the deck printed for a
  // section it never filled. Its own slide moves to the chapter before it so
  // the coverage check still sees it, and the empty chapter does not ship.
  for (let i = modules.length - 1; i >= 0; i -= 1) {
    if (modules[i].lessons.length > 0) continue;
    const orphans = [modules[i].source_slide, ...modules[i].orphan_slides].filter(
      (n) => n !== null && n !== undefined,
    );
    const host = modules[i - 1] ?? modules[i + 1];
    if (!host) continue;
    host.orphan_slides.push(...orphans);
    modules.splice(i, 1);
  }

  const OVERSIZED = 24;
  const structured = modules.flatMap((module) => {
    if (module.lessons.length < OVERSIZED) return [module];
    const recovered = autoChapters(module.lessons, module.source_slide);
    if (recovered.length <= 1) return [module];
    // The split module's orphan slides belong to the first chapter out of it,
    // otherwise they leave the tree and the coverage check fails on slides
    // that were never actually lost.
    for (const chapter of recovered) chapter.orphan_slides = [];
    // The divider slide that opened the original module belongs to the first
    // chapter out of it. It is nobody's lesson — a divider carries only its
    // heading — so unless it is recorded here it leaves the tree entirely and
    // the coverage check reports a slide that was never lost.
    recovered[0].orphan_slides = [...module.orphan_slides];
    if (module.source_slide !== null && module.source_slide !== undefined) {
      recovered[0].orphan_slides.push(module.source_slide);
    }
    return recovered;
  });

  // A divider whose whole content is one page called "Introduction" is not a
  // chapter — it is the opening of the chapter that follows it, and left alone
  // it puts two chapters called "Introduction" in one subject's index. Merged
  // forward, in order, so nothing moves except the boundary.
  const GENERIC = /^(introduction|overview|contents?|general)$/i;
  for (let i = structured.length - 2; i >= 0; i -= 1) {
    const module = structured[i];
    if (module.lessons.length !== 1 || !GENERIC.test(module.module.trim())) continue;
    const next = structured[i + 1];
    next.lessons = [...module.lessons, ...next.lessons];
    next.orphan_slides = [...module.orphan_slides, ...next.orphan_slides];
    // The absorbed chapter's own opening slide becomes an orphan of the
    // chapter that took it in. Folding it into `source_slide` instead lost it:
    // that field holds one number, and the chapter already had its own.
    if (module.source_slide !== null && module.source_slide !== undefined) {
      next.orphan_slides.push(module.source_slide);
    }
    structured.splice(i, 1);
  }

  // Two chapters with the same name are two chapters a reader cannot tell
  // apart in the index. Where a name repeats, the later one takes the name of
  // a topic inside it that no other chapter has claimed.
  const taken = new Set();
  for (const module of structured) {
    if (!taken.has(module.module)) {
      taken.add(module.module);
      continue;
    }
    const alternative = module.lessons
      .map((lesson) => (lesson.title ?? "").trim())
      .find((title) => title.length >= 4 && title.length <= 60 && !taken.has(title));
    if (alternative) module.module = alternative;
    taken.add(module.module);
  }

  return structured;
}

/** Every slide number the tree accounts for — the basis of the coverage check. */
export function coveredSlides(modules) {
  const seen = new Set();
  for (const section of modules) {
    if (section.source_slide) seen.add(section.source_slide);
    for (const n of section.orphan_slides ?? []) seen.add(n);
    for (const lesson of section.lessons) {
      for (const n of lesson.source_slides) seen.add(n);
      for (const n of lesson.empty_slides ?? []) seen.add(n);
      for (const block of lesson.content) seen.add(block.source_slide);
    }
  }
  return seen;
}

export function isFrontMatter(title) {
  return FRONT_MATTER.test((title || "").trim());
}

function range(numbers) {
  const sorted = [...new Set(numbers)].sort((a, b) => a - b);
  if (!sorted.length) return "";
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  return first === last ? String(first) : `${first}-${last}`;
}

/** The human-readable index the brief asks for in STEP 1. */
export function renderIndex(courseName, manifest, modules) {
  const lines = [];
  lines.push(`Course Name: ${courseName}`);
  lines.push(`Source File: ${manifest.source_file}`);
  lines.push(`Total Slides/Pages: ${manifest.total_slides}`);
  lines.push("");
  modules.forEach((module, mi) => {
    const num = String(mi + 1).padStart(2, "0");
    lines.push(`${num}. ${module.module}`);
    module.lessons.forEach((lesson, li) => {
      lines.push(
        `    ${num}.${li + 1} ${lesson.title}   [slides ${range(lesson.source_slides)}]`,
      );
    });
    lines.push("");
  });
  return lines.join("\n");
}

export function loadManifest(dir) {
  return JSON.parse(fs.readFileSync(path.join(dir, "manifest.json"), "utf8"));
}
