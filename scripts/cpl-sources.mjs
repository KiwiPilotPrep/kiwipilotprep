/**
 * The CPL sources, and which subject each one belongs to.
 *
 * Kept in one place because three separate steps need the same mapping — the
 * extractor, the importer and the audit — and a source that drifts between
 * them is a source that silently ends up in the wrong subject.
 *
 * The syllabus is one 219-page document covering every licence level, so each
 * CPL subject is addressed by its page range inside it rather than by a file.
 * The ranges come from the document's own "Subject No. N" headings.
 */

export const COURSE_SLUG = "cpl-theory";

export const CPL_SUBJECTS = [
  {
    /** Official CAA subject number — the master index the brief mandates. */
    number: 16,
    name: "CPL Air Law",
    subject: "air-law",
    deck: "cpl-air-law",
    source: "cpl course material/CPLLawPowerPoint_Professional.pptx",
    syllabusPages: [29, 47],
    book: "cpl_books/NZICPAPPL-CPLAirLawBook.pdf",
  },
  {
    number: 18,
    name: "Flight Navigation General",
    subject: "navigation",
    deck: "cpl-navigation",
    source: "cpl course material/CPLNavigation-Updated_Professional.pptx",
    syllabusPages: [48, 54],
    book: "cpl_books/NZICPAPPL-CPLAirNavigationandFlightPlanning.pdf",
  },
  {
    number: 20,
    name: "CPL Meteorology",
    subject: "meteorology",
    deck: "cpl-meteorology",
    source: "cpl course material/CPLMeteorology2023_Professional.pptx",
    syllabusPages: [67, 80],
    book: "cpl_books/PPL-CPLMetStudy-Workbook2023Master.pdf",
  },
  {
    number: 22,
    name: "Principles of Flight and Aircraft Performance (Aeroplane)",
    subject: "principles-of-flight",
    deck: "cpl-principles-of-flight",
    source: "cpl course material/POFpowerpoint_Professional.pdf",
    syllabusPages: [81, 90],
    book: "cpl_books/CPLPrinciplesofFlightandPerformanceMar2020.pdf",
  },
  {
    number: 26,
    name: "General Aircraft Technical Knowledge (Aeroplane)",
    subject: "aircraft-technical-knowledge",
    deck: "cpl-gatk",
    source: "cpl course material/CPLGeneralAircraftTechnicalKnowledge_Professional.pdf",
    syllabusPages: [125, 146],
    book: null,
  },
  {
    number: 34,
    name: "Human Factors",
    subject: "human-factors",
    deck: "cpl-human-factors",
    source: "cpl course material/CPLHFPowerPoint_Professional.pdf",
    syllabusPages: [173, 190],
    book: "cpl_books/NZICPAPPL-CPLHumanFactors.pdf",
  },
];

export const SYLLABUS_PDF = "cpl syllabus/CPL syllabus.pdf";
export const DECKS_ROOT = ".cache/decks";
export const BOOKS_ROOT = ".cache/books";
