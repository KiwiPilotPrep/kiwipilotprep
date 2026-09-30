/**
 * Seeds the free ten-question mock bank.
 *
 * ==========================================================================
 * THIS IS AN INITIAL, ADDITIVE SEED TOOL. IT DOES NOT OVERWRITE ADMIN EDITS.
 * ==========================================================================
 *
 * The rule is simple: `content/free-trial/` is where a question comes from,
 * and the database is where it lives afterwards. Once a row exists, the
 * admin CMS owns it. Running this script again creates whatever is missing
 * and leaves everything that already exists exactly as it is — wording,
 * options, correct answer, explanation, subject, section, status and free
 * trial eligibility all untouched.
 *
 * That matters because the alternative is quietly destructive. An admin
 * corrects a question on Tuesday, someone re-runs the seed on Wednesday to
 * add a new subject, and Tuesday's correction is gone with no error and no
 * record of it having happened.
 *
 * Identity comes from `Question.seedKey`, not from the prompt text. Matching
 * on wording was the other half of the problem: an admin who rephrases a
 * question would become invisible to the script, and the next run would seed
 * a second copy beside the edited one. A seed key survives any edit, so a
 * seeded row is recognised for as long as it exists.
 *
 * ---------------------------------------------------------------------------
 * Deliberate bulk replacement
 * ---------------------------------------------------------------------------
 *
 * A developer who genuinely intends to replace the authored content can pass
 * `--overwrite` alongside `--apply`. That is an explicit act, it names what
 * it will destroy before it does it, and it is the only path that writes over
 * an existing row. Nothing about a routine run can reach it by accident.
 *
 *   node scripts/build-free-trial-questions.mjs                  # dry run
 *   node scripts/build-free-trial-questions.mjs --apply          # add missing only
 *   node scripts/build-free-trial-questions.mjs --apply --overwrite
 *   node scripts/build-free-trial-questions.mjs --subject air-law
 */
import { pathToFileURL } from "node:url";

import { PrismaClient } from "@prisma/client";

import { SUBJECTS, QUESTIONS_PER_SUBJECT } from "../content/free-trial/index.mjs";

const db = new PrismaClient();

/** The stable identity of one seed entry. Never derived from the wording. */
export function seedKeyFor(spec, index) {
  return `free-trial:${spec.course}/${spec.subject}#${index + 1}`;
}

/** Everything wrong with the bank, gathered before anything is written. */
function shapeProblems(spec, index) {
  const at = `${spec.course}/${spec.subject} q${index + 1}`;
  const q = spec.questions[index];
  const out = [];
  if (!q.prompt?.trim()) out.push(`${at}: no prompt`);
  if (!q.section?.trim()) out.push(`${at}: no section`);
  if (!q.explanation?.trim()) out.push(`${at}: no explanation`);
  if (!Array.isArray(q.options) || q.options.length !== 4) {
    out.push(`${at}: expected 4 options, got ${q.options?.length ?? 0}`);
  }
  if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer > 3) {
    out.push(`${at}: answer must be 0-3, got ${q.answer}`);
  }
  if (new Set(q.options ?? []).size !== (q.options ?? []).length) {
    out.push(`${at}: duplicate options`);
  }
  return out;
}

async function main() {
  const apply = process.argv.includes("--apply");
  const overwrite = process.argv.includes("--overwrite");
  const only = process.argv.includes("--subject")
    ? process.argv[process.argv.indexOf("--subject") + 1]
    : null;

  if (overwrite && !apply) {
    console.log("--overwrite does nothing without --apply. Add --apply to write.");
  }

  const specs = only ? SUBJECTS.filter((s) => s.subject === only) : SUBJECTS;
  const problems = [];
  const plan = [];

  for (const spec of specs) {
    const subject = await db.subject.findFirst({
      where: { slug: spec.subject, course: { slug: spec.course } },
      select: {
        id: true,
        title: true,
        course: { select: { title: true } },
        chapters: { orderBy: { order: "asc" }, take: 1, select: { id: true } },
        modules: { select: { id: true, title: true, sectionCode: true } },
      },
    });
    if (!subject) {
      problems.push(`no subject ${spec.course}/${spec.subject}`);
      continue;
    }

    const bySection = new Map();
    for (const m of subject.modules) {
      const key = m.title.trim();
      bySection.set(key, (bySection.get(key) ?? []).concat(m));
    }

    const rows = [];
    for (const [index, q] of spec.questions.entries()) {
      problems.push(...shapeProblems(spec, index));
      const matches = bySection.get(q.section?.trim()) ?? [];
      if (matches.length !== 1) {
        problems.push(
          `${spec.course}/${spec.subject} q${index + 1}: "${q.section}" matches ${matches.length} sections of ${subject.title}`,
        );
        continue;
      }
      const module = matches[0];
      if (!module.sectionCode) {
        problems.push(
          `${spec.course}/${spec.subject} q${index + 1}: section "${q.section}" has no code — run scripts/assign-section-codes.mjs`,
        );
        continue;
      }
      rows.push({ q, module, order: index, seedKey: seedKeyFor(spec, index) });
    }

    if (spec.questions.length !== QUESTIONS_PER_SUBJECT) {
      problems.push(
        `${spec.course}/${spec.subject}: ${spec.questions.length} questions, expected ${QUESTIONS_PER_SUBJECT}`,
      );
    }

    plan.push({ spec, subject, rows });
  }

  if (problems.length) {
    console.log(`REFUSING TO RUN — ${problems.length} problem(s):`);
    for (const p of problems) console.log(`   ${p}`);
    await db.$disconnect();
    process.exit(1);
  }

  let created = 0;
  let kept = 0;
  let adopted = 0;
  let replaced = 0;

  for (const { subject, rows } of plan) {
    const lines = [];

    for (const { q, module, order, seedKey } of rows) {
      // Identity first. A row that carries this seed key is this entry,
      // whatever an admin has since done to its wording.
      let existing = await db.question.findUnique({
        where: { seedKey },
        select: { id: true, prompt: true },
      });

      // Rows seeded before seed keys existed are adopted by their original
      // wording, once. Only the key is written — nothing an admin can edit
      // is touched, so adoption cannot change what a student sees.
      let adopting = false;
      if (!existing) {
        const legacy = await db.question.findFirst({
          where: { prompt: q.prompt, subjectId: subject.id, seedKey: null },
          select: { id: true, prompt: true },
        });
        if (legacy) {
          existing = legacy;
          adopting = true;
        }
      }

      if (existing && !overwrite) {
        const edited = existing.prompt !== q.prompt;
        lines.push(
          `   keep   ${String(module.sectionCode).padEnd(6)} ${existing.prompt.slice(0, 58)}${
            edited ? "   (admin-edited)" : ""
          }${adopting ? "   (adopting seed key)" : ""}`,
        );
        kept += 1;
        if (adopting) {
          adopted += 1;
          if (apply) {
            await db.question.update({ where: { id: existing.id }, data: { seedKey } });
          }
        }
        continue;
      }

      const content = {
        subjectId: subject.id,
        chapterId: subject.chapters[0]?.id ?? null,
        moduleId: module.id,
        kdrCode: module.sectionCode,
        kdrTopic: module.title,
        explanation: q.explanation,
        freeTrialEligible: true,
        status: "PUBLISHED",
        order,
        seedKey,
      };

      if (existing) {
        lines.push(`   REPLACE ${String(module.sectionCode).padEnd(5)} ${q.prompt.slice(0, 58)}`);
        replaced += 1;
        if (apply) {
          await db.question.update({
            where: { id: existing.id },
            data: { ...content, prompt: q.prompt },
          });
          // Options are replaced together: an option's text and whether it
          // is correct travel as a pair, and a partial update could leave a
          // question with two correct answers or none.
          await db.questionOption.deleteMany({ where: { questionId: existing.id } });
          await db.questionOption.createMany({
            data: q.options.map((text, i) => ({
              questionId: existing.id,
              text,
              isCorrect: i === q.answer,
              order: i,
            })),
          });
        }
        continue;
      }

      lines.push(`   create ${String(module.sectionCode).padEnd(6)} ${q.prompt.slice(0, 58)}`);
      created += 1;
      if (apply) {
        await db.question.create({
          data: {
            ...content,
            prompt: q.prompt,
            options: {
              create: q.options.map((text, i) => ({
                text,
                isCorrect: i === q.answer,
                order: i,
              })),
            },
          },
        });
      }
    }

    // Only worth printing a subject that has something to say about it.
    if (lines.some((l) => !l.startsWith("   keep"))) {
      console.log(`\n${subject.course.title} · ${subject.title}`);
      for (const l of lines) console.log(l);
    }
  }

  console.log("");
  if (overwrite) {
    console.log(
      apply
        ? `OVERWRITE APPLIED — ${replaced} existing question(s) replaced from the seed files, ${created} created.`
        : `dry run (--overwrite) — ${replaced} existing question(s) WOULD BE REPLACED, ${created} created. Add --apply.`,
    );
    console.log("Any admin edits to those questions are gone. This is the deliberate path.");
  } else {
    console.log(
      apply
        ? `applied — ${created} created, ${kept} left untouched${adopted ? ` (${adopted} adopted a seed key)` : ""}.`
        : `dry run — ${created} would be created, ${kept} already exist and would be left untouched. Pass --apply.`,
    );
    console.log(
      "Existing questions are owned by the admin CMS and are never modified by this script.",
    );
    if (kept > 0 && !apply) {
      console.log("To deliberately replace them from the seed files: --apply --overwrite");
    }
  }

  await db.$disconnect();
}

// Only when run directly. `seedKeyFor` is imported by other scripts, and a
// module that seeds a database as a side effect of being imported is a trap.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
}
