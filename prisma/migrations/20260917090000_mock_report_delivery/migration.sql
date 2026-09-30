-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'GENERATED', 'SENT', 'FAILED');

-- CreateTable
CREATE TABLE "MockReport" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "ReportStatus" NOT NULL DEFAULT 'PENDING',
    "scorePercent" INTEGER NOT NULL,
    "missedCount" INTEGER NOT NULL DEFAULT 0,
    "pdfBytes" INTEGER,
    "generatedAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "error" TEXT,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MockReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MockReport_attemptId_key" ON "MockReport"("attemptId");

-- CreateIndex
CREATE INDEX "MockReport_userId_createdAt_idx" ON "MockReport"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "MockReport_status_idx" ON "MockReport"("status");

-- AddForeignKey
ALTER TABLE "MockReport" ADD CONSTRAINT "MockReport_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "MockAttempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MockReport" ADD CONSTRAINT "MockReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

