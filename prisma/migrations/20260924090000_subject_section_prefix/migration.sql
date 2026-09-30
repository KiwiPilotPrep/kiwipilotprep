-- The leading number of a subject's section codes, held on the row instead
-- of recomputed from the subject's position in its course. A position makes
-- every code in a course shift the moment its subjects are reordered; a
-- column does not.
ALTER TABLE "Subject" ADD COLUMN IF NOT EXISTS "sectionPrefix" INTEGER;
DROP INDEX IF EXISTS "Subject_sectionPrefix_key";

-- Backfilled from the codes already in use, so nothing a student has seen
-- changes. Deliberately not unique: six subjects currently share "1", which
-- is the defect this column makes fixable rather than the fix itself.
UPDATE "Subject" s
SET "sectionPrefix" = sub.prefix
FROM (
  SELECT m."subjectId", MIN(split_part(m."sectionCode", '.', 1)::int) AS prefix
  FROM "CourseModule" m
  WHERE m."sectionCode" ~ '^[0-9]+\.'
  GROUP BY m."subjectId"
) AS sub
WHERE s."id" = sub."subjectId";
