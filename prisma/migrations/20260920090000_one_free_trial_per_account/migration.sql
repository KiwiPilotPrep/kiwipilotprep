-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "freeTrialEnabled" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "FreeTrialUse" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subjectId" TEXT,
    "attemptId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FreeTrialUse_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FreeTrialUse_userId_key" ON "FreeTrialUse"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "FreeTrialUse_attemptId_key" ON "FreeTrialUse"("attemptId");

-- CreateIndex
CREATE INDEX "FreeTrialUse_subjectId_idx" ON "FreeTrialUse"("subjectId");

-- AddForeignKey
ALTER TABLE "FreeTrialUse" ADD CONSTRAINT "FreeTrialUse_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FreeTrialUse" ADD CONSTRAINT "FreeTrialUse_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FreeTrialUse" ADD CONSTRAINT "FreeTrialUse_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "MockAttempt"("id") ON DELETE SET NULL ON UPDATE CASCADE;


-- The free mock is a theory-subject offer. Flight test groundwork is oral
-- preparation with no multi-choice bank, so those courses are left off.
UPDATE "Course" SET "freeTrialEnabled" = true
WHERE "slug" IN ('ppl-theory', 'cpl-theory', 'ir-theory');

-- Backfill the one-per-account record from the trials already sat, taking
-- each student's earliest. A student who has used a free mock under the old
-- per-subject rule keeps it used; nobody gains a second one from the change.
INSERT INTO "FreeTrialUse" ("id", "userId", "subjectId", "attemptId", "createdAt")
SELECT
  md5(random()::text || clock_timestamp()::text),
  first_attempt."userId",
  first_attempt."subjectId",
  first_attempt."id",
  first_attempt."startedAt"
FROM (
  SELECT DISTINCT ON (a."userId")
    a."id", a."userId", a."startedAt", e."subjectId"
  FROM "MockAttempt" a
  JOIN "MockExam" e ON e."id" = a."mockExamId"
  WHERE e."isFreeTrial" = true
  ORDER BY a."userId", a."startedAt" ASC
) AS first_attempt
ON CONFLICT ("userId") DO NOTHING;
