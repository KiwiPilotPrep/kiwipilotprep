"""
Extracts a reference book into a searchable page index.

Different job from the deck extractor. A deck is a sequence of slides, each of
which becomes a lesson; a book is continuous prose that nobody reads front to
back. What is needed here is the ability to answer one question quickly:
"does this book teach syllabus item 26.14.6, and where?" So the output is one
record per page — its text, its headings, and the figures printed on it —
rather than a lesson tree.

Figures are kept because a book's diagrams are often the clearest treatment of
a topic the slides cover only in words, and the brief asks for diagrams
wherever they materially improve understanding.

Usage:  python scripts/extract-book.py <book.pdf> <outdir>
"""
import sys, os, json, re, hashlib, collections

# A picture repeated on this many pages, at this size, is a header rule or a
# logo rather than a diagram.
FURNITURE_MIN_USES = 5
FURNITURE_MAX_BYTES = 60_000

# A diagram small enough to be an icon teaches nothing.
MIN_FIGURE_BYTES = 3_000

# Running heads and footers, which repeat on every page and are not content.
FURNITURE_LINE = re.compile(
    r"^(?:page\s*\d+|\d+\s*\|\s*page|chapter\s+\d+\s*$|[-–—\s]*\d+[-–—\s]*)$",
    re.I,
)


# What a browser will actually paint. A PDF may embed an image in any format
# its producer liked -- JPEG 2000 and Windows Metafile both turn up in these
# decks -- and every one of those reaches the page as a broken image while the
# file, the row and the request all look fine. Anything not on this list is
# re-encoded on the way out.
WEB_SAFE = {"png", "jpg", "jpeg", "gif", "webp"}


def web_safe_image(blob, ext):
    """
    Returns (bytes, extension) a browser can display.

    The caller hashes the *original* bytes, so an image keeps its identity
    across a re-encode and a re-import lands on the same storage key. Only the
    stored representation changes.
    """
    if blob[:4] == bytes([0x89, 0x50, 0x4E, 0x47]):
        ext = "png"
    elif blob[:2] == bytes([0xFF, 0xD8]):
        ext = "jpg"
    elif blob[:3] == b"GIF":
        ext = "gif"
    if ext.lower() in WEB_SAFE:
        return blob, ext
    try:
        from PIL import Image
        import io as _io

        image = Image.open(_io.BytesIO(blob))
        if image.mode not in ("RGB", "RGBA", "L", "LA", "P"):
            image = image.convert("RGBA")
        out = _io.BytesIO()
        image.save(out, format="PNG", optimize=True)
        return out.getvalue(), "png"
    except Exception:
        # Better to store what was found than to drop a diagram. The repair
        # script reports anything still unreadable rather than it vanishing.
        return blob, ext


# A picture with less tonal variation than this carries nothing a reader can
# make out. It is the threshold between the washed-out backdrops these decks
# print behind their text -- a radio mast at 5% opacity, the academy's crest
# ghosted across the page -- and the faintest real teaching image in the
# material, a night photograph of approach lighting. Measured on the IR decks,
# the backdrops top out at 11.8 and the night photograph sits at 14.1.
DECORATIVE_MAX_CONTRAST = 13.0


def is_decorative(blob):
    """
    True for a picture that is decoration rather than a diagram.

    Two signals, both about the image itself rather than about its subject:
    a picture composited at a uniform partial opacity is a backdrop -- nothing
    is laid *over* a diagram -- and a picture with almost no tonal range has
    nothing legible on it whatever it depicts.

    Wrong answers here cost a diagram, so it says no whenever it cannot tell.
    """
    try:
        from PIL import Image, ImageStat
        import io as _io

        image = Image.open(_io.BytesIO(blob))
        image.load()

        if image.mode in ("RGBA", "LA"):
            alpha = image.getchannel("A")
            low, high = alpha.getextrema()
            # Uniform and not opaque: the whole picture sits behind something.
            if low == high and high < 250:
                return True

        stat = ImageStat.Stat(image.convert("RGB"))
        return max(stat.stddev) < DECORATIVE_MAX_CONTRAST
    except Exception:
        return False


def clean(text):
    if not text:
        return ""
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    text = text.replace("\xa0", " ").replace("​", "")
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def headings_of(lines):
    """Lines that look like a heading: short, titled, not a sentence."""
    out = []
    for line in lines:
        s = line.strip()
        if not (3 <= len(s) <= 70):
            continue
        if s.endswith((".", ",", ";", ":")):
            continue
        words = s.split()
        if not words or len(words) > 9:
            continue
        # Either fully capitalised, or title case across most words.
        caps = sum(1 for w in words if w[:1].isupper())
        if s.isupper() or caps >= max(2, len(words) - 1):
            out.append(s)
    return out


def main():
    src, outdir = sys.argv[1], sys.argv[2]
    from pypdf import PdfReader

    os.makedirs(outdir, exist_ok=True)
    assets_dir = os.path.join(outdir, "assets")
    os.makedirs(assets_dir, exist_ok=True)

    reader = PdfReader(src)

    # ---- pass one: which images are furniture -----------------------------
    uses = collections.Counter()
    blobs = {}
    per_page = []
    for page in reader.pages:
        found = []
        try:
            images = list(page.images)
        except Exception:
            images = []
        for image in images:
            try:
                blob = image.data
            except Exception:
                continue
            if len(blob) < MIN_FIGURE_BYTES:
                continue
            digest = hashlib.sha1(blob).hexdigest()
            ext = (os.path.splitext(image.name)[1] or ".png").lstrip(".")
            blobs[digest] = (blob, ext)
            if digest not in found:
                found.append(digest)
                uses[digest] += 1
        per_page.append(found)

    furniture = set()
    for digest, count in uses.items():
        repeated_small = (
            count >= FURNITURE_MIN_USES and len(blobs[digest][0]) <= FURNITURE_MAX_BYTES
        )
        if repeated_small or is_decorative(blobs[digest][0]):
            furniture.add(digest)

    for digest, pair in blobs.items():
        if digest in furniture:
            continue
        safe, safe_ext = web_safe_image(pair[0], pair[1])
        blobs[digest] = (pair[0], safe_ext)
        with open(os.path.join(assets_dir, digest + "." + safe_ext), "wb") as fh:
            fh.write(safe)

    # ---- pass two: the page records ---------------------------------------
    pages = []
    for index, page in enumerate(reader.pages, start=1):
        try:
            raw = page.extract_text() or ""
        except Exception:
            raw = ""
        lines = [clean(l) for l in raw.split("\n")]
        lines = [l for l in lines if l and not FURNITURE_LINE.match(l)]

        figures = []
        for digest in per_page[index - 1]:
            if digest in furniture:
                continue
            figures.append({
                "asset": digest + "." + blobs[digest][1],
                "sha1": digest,
                "bytes": len(blobs[digest][0]),
            })

        # A workbook interleaves teaching with self-test questions, and the two
        # must not be confused: a page of multiple-choice options mentions all
        # the right words and teaches none of them. Searching one and calling
        # it coverage credits the course with material it does not have.
        body = "\n".join(lines)
        is_questions = bool(
            re.search(r"^\s*\d+\.\s", body, re.M)
            and re.search(r"^\s*[A-D][.)]\s", body, re.M)
        )

        pages.append({
            "n": index,
            "text": body,
            "headings": headings_of(lines),
            "figures": figures,
            "is_questions": is_questions,
        })

    data = {
        "source_file": os.path.basename(src),
        "total_pages": len(reader.pages),
        "furniture_images": len(furniture),
        "pages": pages,
    }
    with open(os.path.join(outdir, "book.json"), "w", encoding="utf-8") as fh:
        json.dump(data, fh, ensure_ascii=False)

    chars = sum(len(p["text"]) for p in pages)
    print(json.dumps({
        "source": data["source_file"],
        "pages": data["total_pages"],
        "chars": chars,
        "figures_kept": sum(len(p["figures"]) for p in pages),
        "furniture_images_dropped": data["furniture_images"],
        "pages_with_no_text": sum(1 for p in pages if not p["text"]),
        "headings_found": sum(len(p["headings"]) for p in pages),
    }, indent=1))


if __name__ == "__main__":
    main()
