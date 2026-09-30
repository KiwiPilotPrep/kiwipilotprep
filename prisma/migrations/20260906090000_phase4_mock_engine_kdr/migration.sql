-- Phase 4: mock exam engine, KDR tracking, scorecards.
--
-- Purely additive. The Phase 2 `topic` column held what is now `kdrCode`,
-- so it is backfilled rather than abandoned.

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('SINGLE_CHOICE');

-- CreateEnum
CREATE TYPE "AttemptStatus" AS ENUM ('IN_PROGRESS', 'SUBMITTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "EmailStatus" AS ENUM ('QUEUED', 'SENT', 'FAILED', 'LOGGED');

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "ac61Ref" TEXT,
ADD COLUMN     "caanzRef" TEXT,
ADD COLUMN     "difficulty" INTEGER,
ADD COLUMN     "kdrCode" TEXT,
ADD COLUMN     "kdrTopic" TEXT,
ADD COLUMN     "type" "QuestionType" NOT NULL DEFAULT 'SINGLE_CHOICE';

-- CreateTable
CREATE TABLE "MockExam" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "courseId" TEXT,
    "subjectId" TEXT,
    "questionCount" INTEGER NOT NULL DEFAULT 20,
    "durationMinutes" INTEGER NOT NULL DEFAULT 40,
    "passingPercent" INTEGER,
    "randomize" BOOLEAN NOT NULL DEFAULT true,
    "kdrStrongPercent" INTEGER NOT NULL DEFAULT 80,
    "kdrWeakPercent" INTEGER NOT NULL DEFAULT 50,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MockExam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MockAttempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "mockExamId" TEXT NOT NULL,
    "attemptNumber" INTEGER NOT NULL DEFAULT 1,
    "status" "AttemptStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "submittedAt" TIMESTAMP(3),
    "autoSubmitted" BOOLEAN NOT NULL DEFAULT false,
    "totalQuestions" INTEGER NOT NULL DEFAULT 0,
    "correctCount" INTEGER NOT NULL DEFAULT 0,
    "incorrectCount" INTEGER NOT NULL DEFAULT 0,
    "unansweredCount" INTEGER NOT NULL DEFAULT 0,
    "scorePercent" INTEGER NOT NULL DEFAULT 0,
    "passed" BOOLEAN,
    "examTitle" TEXT NOT NULL,
    "subjectTitle" TEXT,

    CONSTRAINT "MockAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MockAttemptQuestion" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "questionId" TEXT,
    "order" INTEGER NOT NULL,
    "promptSnapshot" TEXT NOT NULL,
    "explanationSnapshot" TEXT,
    "kdrCodeSnapshot" TEXT,
    "kdrTopicSnapshot" TEXT,
    "caanzRefSnapshot" TEXT,
    "ac61RefSnapshot" TEXT,
    "optionsSnapshot" JSONB NOT NULL,
    "selectedOptionId" TEXT,
    "isCorrect" BOOLEAN,
    "answeredAt" TIMESTAMP(3),

    CONSTRAINT "MockAttemptQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KdrResult" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "kdrCode" TEXT,
    "kdrTopic" TEXT,
    "attempted" INTEGER NOT NULL,
    "correct" INTEGER NOT NULL,
    "incorrect" INTEGER NOT NULL,
    "accuracy" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KdrResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "attemptId" TEXT,
    "to" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "template" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "status" "EmailStatus" NOT NULL DEFAULT 'QUEUED',
    "provider" TEXT,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MockExam_slug_key" ON "MockExam"("slug");

-- CreateIndex
CREATE INDEX "MockExam_status_order_idx" ON "MockExam"("status", "order");

-- CreateIndex
CREATE INDEX "MockExam_courseId_idx" ON "MockExam"("courseId");

-- CreateIndex
CREATE INDEX "MockExam_subjectId_idx" ON "MockExam"("subjectId");

-- CreateIndex
CREATE INDEX "MockAttempt_userId_status_idx" ON "MockAttempt"("userId", "status");

-- CreateIndex
CREATE INDEX "MockAttempt_userId_submittedAt_idx" ON "MockAttempt"("userId", "submittedAt");

-- CreateIndex
CREATE INDEX "MockAttempt_mockExamId_idx" ON "MockAttempt"("mockExamId");

-- CreateIndex
CREATE INDEX "MockAttempt_status_expiresAt_idx" ON "MockAttempt"("status", "expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "MockAttempt_userId_mockExamId_attemptNumber_key" ON "MockAttempt"("userId", "mockExamId", "attemptNumber");

-- CreateIndex
CREATE INDEX "MockAttemptQuestion_attemptId_idx" ON "MockAttemptQuestion"("attemptId");

-- CreateIndex
CREATE INDEX "MockAttemptQuestion_questionId_idx" ON "MockAttemptQuestion"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "MockAttemptQuestion_attemptId_order_key" ON "MockAttemptQuestion"("attemptId", "order");

-- CreateIndex
CREATE INDEX "KdrResult_userId_kdrCode_idx" ON "KdrResult"("userId", "kdrCode");

-- CreateIndex
CREATE INDEX "KdrResult_userId_createdAt_idx" ON "KdrResult"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "KdrResult_attemptId_idx" ON "KdrResult"("attemptId");

-- CreateIndex
CREATE INDEX "EmailLog_userId_createdAt_idx" ON "EmailLog"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "EmailLog_status_idx" ON "EmailLog"("status");

-- CreateIndex
CREATE INDEX "Question_kdrCode_idx" ON "Question"("kdrCode");

-- CreateIndex
CREATE INDEX "Question_kdrTopic_idx" ON "Question"("kdrTopic");

-- AddForeignKey
ALTER TABLE "MockExam" ADD CONSTRAINT "MockExam_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MockExam" ADD CONSTRAINT "MockExam_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MockAttempt" ADD CONSTRAINT "MockAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MockAttempt" ADD CONSTRAINT "MockAttempt_mockExamId_fkey" FOREIGN KEY ("mockExamId") REFERENCES "MockExam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MockAttemptQuestion" ADD CONSTRAINT "MockAttemptQuestion_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "MockAttempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MockAttemptQuestion" ADD CONSTRAINT "MockAttemptQuestion_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KdrResult" ADD CONSTRAINT "KdrResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KdrResult" ADD CONSTRAINT "KdrResult_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "MockAttempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailLog" ADD CONSTRAINT "EmailLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailLog" ADD CONSTRAINT "EmailLog_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "MockAttempt"("id") ON DELETE SET NULL ON UPDATE CASCADE;


-- ---------------------------------------------------------------------------

-- Carry the legacy topic value across as the KDR code.

-- ---------------------------------------------------------------------------

UPDATE "Question" SET "kdrCode" = "topic" WHERE "topic" IS NOT NULL AND "kdrCode" IS NULL;
