-- AlterTable
ALTER TABLE "MockExam" ADD COLUMN     "isFreeTrial" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "freeTrialEligible" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "MockExam_isFreeTrial_subjectId_idx" ON "MockExam"("isFreeTrial", "subjectId");

-- CreateIndex
CREATE INDEX "Question_subjectId_freeTrialEligible_status_idx" ON "Question"("subjectId", "freeTrialEligible", "status");

