-- Canonical chapter and point numbering.
--
-- A section code used to be "<the subject's position in its course>.<the
-- chapter's position in the subject>", so Air Law chapter 27 was written
-- "1.27" — the 1 being Air Law's position among the PPL subjects, which is
-- not part of the curriculum at all. It also left nowhere to put a point:
-- the chapter/point/topic structure was flattened into one level.
--
-- After this, a chapter is numbered inside its own subject (27) and a point
-- inside its own chapter (27.3). Nothing is derived from a row id, a
-- creation order or a position in any list outside the thing being numbered.
--
-- Additive: three nullable columns, then a backfill. No column is dropped,
-- no row is deleted, and report snapshots are untouched by design — a report
-- already printed keeps the code it was printed with.

ALTER TABLE "CourseModule" ADD COLUMN IF NOT EXISTS "chapterNumber" INTEGER;
ALTER TABLE "Lesson"       ADD COLUMN IF NOT EXISTS "pointNumber"   INTEGER;
ALTER TABLE "Question"     ADD COLUMN IF NOT EXISTS "lessonId"      TEXT;

-- Chapter numbers: the module's place in its own subject.
WITH numbered AS (
  SELECT id,
         ROW_NUMBER() OVER (
           PARTITION BY "subjectId"
           ORDER BY "displayOrder" ASC, "createdAt" ASC, "id" ASC
         ) AS rn
  FROM "CourseModule"
)
UPDATE "CourseModule" m
   SET "chapterNumber" = numbered.rn
  FROM numbered
 WHERE m.id = numbered.id
   AND m."chapterNumber" IS DISTINCT FROM numbered.rn;

-- Point numbers: the lesson's place in its own chapter.
WITH numbered AS (
  SELECT id,
         ROW_NUMBER() OVER (
           PARTITION BY "moduleId"
           ORDER BY "displayOrder" ASC, "createdAt" ASC, "id" ASC
         ) AS rn
  FROM "Lesson"
)
UPDATE "Lesson" l
   SET "pointNumber" = numbered.rn
  FROM numbered
 WHERE l.id = numbered.id
   AND l."pointNumber" IS DISTINCT FROM numbered.rn;

-- The chapter's code is its number. "1.27" becomes "27".
UPDATE "CourseModule"
   SET "sectionCode" = "chapterNumber"::text
 WHERE "chapterNumber" IS NOT NULL
   AND "sectionCode" IS DISTINCT FROM "chapterNumber"::text;

-- The denormalised copy on each question follows its module. This is a
-- cache of the live mapping, not history; the history lives in KdrResult.
UPDATE "Question" q
   SET "kdrCode"  = m."sectionCode",
       "kdrTopic" = m."title"
  FROM "CourseModule" m
 WHERE q."moduleId" = m.id
   AND (q."kdrCode" IS DISTINCT FROM m."sectionCode" OR q."kdrTopic" IS DISTINCT FROM m."title");

CREATE UNIQUE INDEX IF NOT EXISTS "CourseModule_subjectId_chapterNumber_key"
  ON "CourseModule"("subjectId", "chapterNumber");
CREATE UNIQUE INDEX IF NOT EXISTS "Lesson_moduleId_pointNumber_key"
  ON "Lesson"("moduleId", "pointNumber");
CREATE INDEX IF NOT EXISTS "Question_lessonId_idx" ON "Question"("lessonId");

DO $$ BEGIN
  ALTER TABLE "Question" ADD CONSTRAINT "Question_lessonId_fkey"
    FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
