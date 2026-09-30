import "server-only";

/**
 * The name a syllabus index carries at the top of the page.
 *
 * A student opening the index should be able to tell, without reading further,
 * whose syllabus this is. It is KiwiPilotPrep's: the course is built here, and
 * naming it after the body that sets the exams would claim a relationship that
 * does not exist. So the brand leads and the subject follows underneath as a
 * subtitle.
 *
 * The prefix is added rather than assumed, because only some course titles
 * carry it in the database. Stripping any existing one first keeps the heading
 * from reading "KiwiPilotPrep — KiwiPilotPrep — IR Theory Syllabus" once the
 * others are renamed to match.
 */
export function syllabusHeading(courseTitle: string): string {
  const name = courseTitle.replace(/^KiwiPilotPrep\s*[—–-]\s*/u, "").trim();
  return `KiwiPilotPrep — ${name} Syllabus`;
}

/**
 * The line above a lesson title naming where in the product the reader is.
 *
 * Normally that is the course and then the subject inside it — "KiwiPilotPrep
 * — PPL Theory · Aircraft Technical Knowledge". Flight Test Groundwork has a
 * single subject named after the course itself, so the same template produced
 * "PPL Flight Test Groundwork · Flight Test Groundwork", which says the same
 * thing twice and reads like a bug.
 *
 * So the subject is dropped when the course name already contains it. That is
 * a no-op for every course whose subjects are named after examination
 * subjects, and it means the groundwork header follows the same convention as
 * the rest of the product rather than needing one of its own.
 */
export function courseSubjectLine(courseTitle: string, subjectTitle: string): string {
  const bare = courseTitle.replace(/^KiwiPilotPrep\s*[—–-]\s*/u, "").trim();
  const plain = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/gu, " ").trim();
  if (plain(bare).includes(plain(subjectTitle))) return courseTitle;
  return `${courseTitle} · ${subjectTitle}`;
}
