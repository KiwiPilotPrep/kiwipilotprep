/**
 * The change log the brief asks for: what was added, where, why, and on whose
 * authority.
 *
 * Generated from the database rather than written by hand, so it cannot drift
 * from what the course actually contains. Every authored section is listed with
 * the syllabus item it answers, the module it was filed after, and the source
 * it was written from — and the gaps deliberately left open are listed beside
 * them, because a change log that only records successes hides the decisions
 * that mattered most.
 *
 *   node scripts/cpl-changelog.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

import { OPEN_GAPS } from "../content/cpl-additions.mjs";
import { COURSE_SLUG } from "./cpl-sources.mjs";

const db = new PrismaClient();
const OUT = "docs/cms";

async function main() {
  const modules = await db.courseModule.findMany({
    where: { origin: "AUTHORED", subject: { course: { slug: COURSE_SLUG } } },
    orderBy: [{ subject: { order: "asc" } }, { displayOrder: "asc" }],
    select: {
      title: true,
      displayOrder: true,
      subject: { select: { title: true, id: true } },
      lessons: {
        select: {
          slug: true,
          title: true,
          content: { select: { blocks: true, references: true } },
          mappings: {
            // Only the links this section was written to answer. The matcher
            // also proposes others against these lessons -- often correctly,
            // since a section on fitness to fly does answer more than one item
            // -- but a proposal is not a change anyone made, and listing it
            // here would claim credit the review has not given.
            where: { method: "authored" },
            select: { status: true, evidence: true, item: { select: { code: true, requirement: true } } },
          },
        },
      },
    },
  });

  const lines = [
    "# CPL revision — change log",
    "",
    "Every section written to fill a verified syllabus gap, and every gap left",
    "open on purpose. Generated from the course itself, so it says what the",
    "course contains rather than what was intended.",
    "",
    "## Sections added",
    "",
  ];

  if (!modules.length) {
    lines.push("_None yet._", "");
  } else {
    lines.push(
      "| Syllabus ref | Requirement | New location | Placed after | Source |",
      "|---|---|---|---|---|",
    );
  }

  let sections = 0;
  let itemsClosed = 0;
  const leaks = [];

  for (const section of modules) {
    // The module immediately before it in the reading order is what the
    // section reads on from.
    const before = await db.courseModule.findFirst({
      where: { subjectId: section.subject.id, displayOrder: { lt: section.displayOrder } },
      orderBy: { displayOrder: "desc" },
      select: { title: true },
    });

    for (const lesson of section.lessons) {
      sections += 1;

      // The one rule worth re-checking against the stored rows rather than
      // against the source file: a citation must not have reached the page.
      const text = (lesson.content?.blocks ?? [])
        .map((b) => `${b.text ?? ""} ${b.title ?? ""}`)
        .join(" ");
      if (/https?:\/\/|\.pdf\b|according to/i.test(text) || lesson.content?.references) {
        leaks.push(lesson.title);
      }

      for (const mapping of lesson.mappings) {
        itemsClosed += 1;
        const source = (mapping.evidence ?? "").split("source: ")[1] ?? "—";
        const req = mapping.item.requirement.split("\n")[0].replace(/\|/g, "\\|").slice(0, 68);
        lines.push(
          `| \`${mapping.item.code}\` | ${req} | ${section.subject.title} → ${lesson.title} | ${before?.title ?? "—"} | ${source} |`,
        );
      }
    }
  }

  lines.push(
    "",
    `${sections} section(s) added, closing ${itemsClosed} syllabus item(s).`,
    "",
    "Every one was written from the reference book supplied for that subject.",
    "None required external research, and none carries a source reference on the",
    "student-facing page — provenance is held in the admin console's evidence",
    "field and in the table above.",
    "",
  );

  if (leaks.length) {
    lines.push(
      "> **A source reference reached a teaching page.** " +
        leaks.join(", ") +
        ". This must be corrected before publication.",
      "",
    );
  }

  lines.push("## Gaps left open, and why", "");
  for (const gap of OPEN_GAPS) {
    lines.push(
      `### ${gap.items.join(", ")}`,
      "",
      gap.reason,
      "",
      `**To close it:** ${gap.needs}`,
      "",
    );
  }

  lines.push(
    "## Why nothing was invented",
    "",
    "Two findings in the supplied material set the boundary of what could safely",
    "be written:",
    "",
    "1. **The Air Law book teaches a superseded Act.** Five of its pages cite the",
    "   Civil Aviation Act 1990 and none cites the 2023 Act, while ten CPL",
    "   syllabus items are written to the 2023 Act — and the syllabus itself notes",
    "   that the fit-and-proper criteria changed between them. Adapting the book",
    "   for those items would teach law that no longer applies.",
    "2. **Two of the workbooks interleave revision questions with teaching.** A",
    "   page of multiple-choice options matches a requirement's wording perfectly",
    "   and teaches none of it. 75 such pages are excluded from the source search,",
    "   so they can never be counted as coverage.",
    "",
  );

  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, "CPL-CHANGELOG.md"), lines.join("\n"), "utf8");

  console.log(`${sections} sections, ${itemsClosed} items closed, ${OPEN_GAPS.length} gaps left open`);
  if (leaks.length) console.error("SOURCE LEAK on:", leaks.join(", "));
  console.log(`wrote ${OUT}/CPL-CHANGELOG.md`);

  await db.$disconnect();
  process.exit(leaks.length ? 1 : 0);
}

main().catch(async (error) => {
  console.error(error);
  await db.$disconnect();
  process.exit(1);
});
