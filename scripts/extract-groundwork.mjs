/**
 * Turns the client's supplied PPL Flight Test Groundwork PDFs into a manifest
 * the course builder can read.
 *
 * The output deliberately has the same shape as the lecture-deck manifests in
 * `.cache/decks/<deck>/manifest.json` — a list of pages, each with a list of
 * blocks that are either text or a picture — because the groundwork builder is
 * a sibling of `build-ppl-course.mjs`, and everything downstream of the
 * manifest then works the same way: coverage gates, provenance, figures.
 *
 * Four files were supplied and all four are read:
 *
 *   PPL GWORK STUDY   — the study material, already written as the eight
 *                       modules the PRD prescribes. This is the primary source.
 *   PPL GW questions  — 46 oral-preparation questions, each an examiner
 *                       prompt, a common trap and a model answer, numbered by
 *                       module.
 *   ppl weather       — a weather briefing walkthrough with real MetService
 *                       charts, TAFs and METARs.
 *   nz airspace       — the CAA's New Zealand airspace booklet.
 *
 * Nothing is rewritten here. Text is put back together — the PDF hands back a
 * paragraph as a run of hard-wrapped lines — and the typography a PDF cannot
 * express is restored, and that is all.
 *
 *   node scripts/extract-groundwork.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const SOURCE_DIR = "PPL Groundwork";
const OUT_DIR = ".cache/groundwork";

/** The four supplied files, with the short name the curriculum refers to. */
export const DOCS = [
  { key: "study", file: "PPL GWORK STUDY.pdf", title: "PPL Groundwork Study" },
  { key: "questions", file: "PPL GW questions.pdf", title: "PPL Groundwork Questions" },
  { key: "weather", file: "ppl weather.pdf", title: "PPL Weather Briefing" },
  { key: "airspace", file: "nz airspace.pdf", title: "New Zealand Airspace" },
];

/**
 * Typography a PDF text layer loses.
 *
 * The ligatures are the important ones: this document is typeset in a face
 * that ligates fi and fl, and the text layer hands them back as single
 * characters that are not the letters. Left alone, "flight" is stored as a
 * word no search will ever find.
 */
const TYPOGRAPHY = [
  [/ﬁ/g, "fi"],
  [/ﬂ/g, "fl"],
  [/ﬀ/g, "ff"],
  [/ﬃ/g, "ffi"],
  [/ﬄ/g, "ffl"],
  // Line and paragraph separators the layout used instead of a newline.
  [/[\u2028\u2029]/g, "\n"],
  // The degree sign written as a masculine ordinal, and "degC" spelled out.
  [/[ºᵒ]/g, "°"],
  [/(\d)\s?degC\b/g, "$1 °C"],
  // A non-breaking space is a space.
  [/\u00a0/g, " "],
];

export function typeset(text) {
  let out = String(text ?? "");
  for (const [re, to] of TYPOGRAPHY) out = out.replace(re, to);
  return out;
}

/** Bullet markers the document uses, deepest first, with the level each means. */
const BULLETS = [
  [/^▪\s*/, 3],
  [/^◦\s*/, 2],
  [/^[•●]\s*/, 1],
];

/**
 * A numbered heading. The documents write them several ways and all of them
 * occur: "4.1.1 TORA (Take-Off Run Available):", "4.3.2. Group Rating" with a
 * trailing full stop, "3.1.2: SIGMET" with a colon straight after the number,
 * and "1. Surface level charts" at the top level in the weather walkthrough.
 *
 * A bare integer with no punctuation after it is not a heading. "5 km
 * visibility" and "8 km visibility" are rows of a minima table, and reading
 * them as headings turned them into a heading called "km visibility" with the
 * number thrown away. So a single-level number has to be followed by a full
 * stop or a colon; a multi-level one already carries its own dots.
 */
const HEADING = /^(?:(\d{1,2}(?:\.\d{1,2}){1,2})\s*[.:]?|(\d{1,2})[.:])\s+(\S.*)$/;
/** `Question 4.3` — how the questions document heads each of its 46 items. */
const QUESTION = /^Question\s+(\d{1,2}\.\d{1,2})\s*$/i;
/** `Module 4: Performance and operating requirements` */
const MODULE = /^Module\s+(\d+)\s*:\s*(\S.*)?$/i;
/**
 * `1.Connect the static grounding clip` — a numbered list item whose space the
 * layout ate. The digit-guard matters: without it "1.1 IMSAFE Checklist" is
 * read as item 1 of a list rather than as the heading it is.
 */
const NUMBERED = /^(\d{1,2})\.(?=[^\d\s])(.*)$/;

/** Pulls the text layer out of a PDF, once, and caches it. */
function pdfText(file) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const cached = path.join(OUT_DIR, file.replace(/\.pdf$/i, ".txt"));
  if (fs.existsSync(cached)) return fs.readFileSync(cached, "utf8");

  const script = [
    "import sys",
    "from pypdf import PdfReader",
    "r = PdfReader(sys.argv[1])",
    "out = []",
    "for p in r.pages:",
    "    out.append(p.extract_text() or '')",
    "sys.stdout.reconfigure(encoding='utf-8')",
    "print(chr(10).join(out))",
  ].join("\n");
  const text = execFileSync("python", ["-c", script, path.join(SOURCE_DIR, file)], {
    encoding: "utf8",
    maxBuffer: 128 * 1024 * 1024,
    stdio: ["ignore", "pipe", "ignore"],
  });
  fs.writeFileSync(cached, text, "utf8");
  return text;
}

/** Extracts every embedded image, keyed by SHA-1, and records where each sits. */
function pdfImages(file) {
  const dir = path.join(OUT_DIR, "assets");
  fs.mkdirSync(dir, { recursive: true });
  const script = [
    "import sys, os, json, hashlib",
    "from pypdf import PdfReader",
    "r = PdfReader(sys.argv[1])",
    "out = []",
    "for pi, page in enumerate(r.pages, 1):",
    "    try:",
    "        imgs = list(page.images)",
    "    except Exception:",
    "        imgs = []",
    "    for j, im in enumerate(imgs):",
    "        try:",
    "            pil = im.image.convert('RGB')",
    "        except Exception:",
    "            continue",
    "        import io",
    "        buf = io.BytesIO()",
    "        pil.save(buf, format='PNG')",
    "        data = buf.getvalue()",
    "        sha = hashlib.sha1(data).hexdigest()",
    "        p = os.path.join(sys.argv[2], sha + '.png')",
    "        if not os.path.exists(p):",
    "            open(p, 'wb').write(data)",
    "        out.append({'page': pi, 'index': j, 'sha1': sha,",
    "                    'width': pil.size[0], 'height': pil.size[1], 'bytes': len(data)})",
    "sys.stdout.reconfigure(encoding='utf-8')",
    "print(json.dumps(out))",
  ].join("\n");
  const json = execFileSync("python", ["-c", script, path.join(SOURCE_DIR, file), dir], {
    encoding: "utf8",
    maxBuffer: 128 * 1024 * 1024,
    stdio: ["ignore", "pipe", "ignore"],
  });
  return JSON.parse(json);
}

/**
 * One page of raw text into blocks.
 *
 * The PDF hands back a paragraph as several hard-wrapped lines, so a line that
 * does not begin a new bullet, heading or sentence is joined onto the one
 * before it. A bullet marker starts a new block and records its depth.
 */
function pageBlocks(raw) {
  const lines = typeset(raw).split("\n").map((l) => l.replace(/\s+$/, ""));
  const blocks = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    let level = 0;
    let text = trimmed;
    for (const [re, depth] of BULLETS) {
      if (re.test(text)) {
        text = text.replace(re, "");
        level = depth;
        break;
      }
    }

    const mod0 = MODULE.exec(text);
    const q0 = mod0 ? null : QUESTION.exec(text);
    const head0 = mod0 || q0 ? null : HEADING.exec(text);
    const headCode = head0 ? head0[1] ?? head0[2] : null;
    const headText = head0 ? head0[3] : null;
    const looksLikeHeading = Boolean(
      mod0 || q0 || (head0 && headText.length < 90 && level === 0),
    );

    const numbered = level === 0 && !looksLikeHeading ? NUMBERED.exec(text) : null;
    if (numbered) {
      // "1.Connect the clip" — a numbered item with the space eaten. The
      // number is kept as the label so the reader can print it.
      blocks.push({ kind: "text", text: numbered[2].trim(), level: 1, label: `${numbered[1]}.` });
      continue;
    }

    const isHeading = looksLikeHeading;

    const previous = blocks[blocks.length - 1];
    // A wrapped continuation arrives with no bullet marker, so at level 0,
    // whatever the level of the bullet it belongs to. Joining only within the
    // same level therefore left every wrapped bullet broken in half; the test
    // is instead that this line carries no marker of its own.
    const continues =
      previous &&
      !isHeading &&
      level === 0 &&
      previous.kind === "text" &&
      !previous.heading &&
      // A line that starts lower-case, or one whose predecessor did not finish
      // a sentence, is the rest of that sentence rather than a new one.
      (/^[a-z(]/.test(text) || !/[.:;!?)”]$/.test(previous.text));

    if (continues) {
      previous.text = `${previous.text} ${text}`.replace(/\s+/g, " ");
      continue;
    }

    // A bullet marker with nothing after it. The document has a few, left over
    // from editing, and they reach the page as an empty list item.
    if (!text) continue;

    const block = { kind: "text", text, level };
    if (isHeading) {
      block.heading = true;
      block.code = mod0 ? `Module ${mod0[1]}` : q0 ? `Question ${q0[1]}` : headCode;
    }
    blocks.push(block);
  }

  return blocks;
}

function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const manifest = { source: SOURCE_DIR, docs: [] };

  for (const doc of DOCS) {
    const raw = pdfText(doc.file);
    const rawPages = raw.split("\n").length ? splitPages(pdfText(doc.file), doc.file) : [];
    const images = pdfImages(doc.file);
    const byPage = new Map();
    for (const im of images) {
      if (!byPage.has(im.page)) byPage.set(im.page, []);
      byPage.get(im.page).push(im);
    }

    const pages = rawPages.map((text, i) => {
      const n = i + 1;
      const blocks = pageBlocks(text);
      for (const im of byPage.get(n) ?? []) {
        blocks.push({ kind: "picture", sha1: im.sha1, width: im.width, height: im.height, index: im.index });
      }
      return { n, blocks };
    });

    manifest.docs.push({
      key: doc.key,
      file: doc.file,
      title: doc.title,
      total_pages: pages.length,
      pages,
    });
    const figures = pages.reduce((t, p) => t + p.blocks.filter((b) => b.kind === "picture").length, 0);
    const words = pages.reduce(
      (t, p) => t + p.blocks.filter((b) => b.kind === "text").reduce((n, b) => n + b.text.split(/\s+/).length, 0),
      0,
    );
    console.log(`${doc.key.padEnd(10)} ${String(pages.length).padStart(3)} pages · ${String(words).padStart(6)} words · ${figures} figures`);
  }

  fs.writeFileSync(path.join(OUT_DIR, "manifest.json"), JSON.stringify(manifest, null, 1));
  console.log(`\nwrote ${path.join(OUT_DIR, "manifest.json")}`);
}

/** Splits the concatenated text back into pages, one per page of the PDF. */
function splitPages(text, file) {
  // pdfText joins pages with a newline, so the page boundaries are recovered by
  // re-reading with an explicit separator rather than guessed at.
  const script = [
    "import sys, json",
    "from pypdf import PdfReader",
    "r = PdfReader(sys.argv[1])",
    "sys.stdout.reconfigure(encoding='utf-8')",
    "print(json.dumps([p.extract_text() or '' for p in r.pages]))",
  ].join("\n");
  return JSON.parse(
    execFileSync("python", ["-c", script, path.join(SOURCE_DIR, file)], {
      encoding: "utf8",
      maxBuffer: 128 * 1024 * 1024,
      stdio: ["ignore", "pipe", "ignore"],
    }),
  );
}

main();
