-- CreateEnum
CREATE TYPE "MappingStatus" AS ENUM ('PROPOSED', 'CONFIRMED', 'REJECTED');

-- CreateTable
CREATE TABLE "LessonSyllabusItem" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "syllabusItemId" TEXT NOT NULL,
    "method" TEXT NOT NULL DEFAULT 'auto',
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "evidence" TEXT,
    "status" "MappingStatus" NOT NULL DEFAULT 'PROPOSED',
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LessonSyllabusItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LessonSyllabusItem_syllabusItemId_status_confidence_idx" ON "LessonSyllabusItem"("syllabusItemId", "status", "confidence");

-- CreateIndex
CREATE INDEX "LessonSyllabusItem_lessonId_status_idx" ON "LessonSyllabusItem"("lessonId", "status");

-- CreateIndex
CREATE INDEX "LessonSyllabusItem_status_confidence_idx" ON "LessonSyllabusItem"("status", "confidence");

-- CreateIndex
CREATE UNIQUE INDEX "LessonSyllabusItem_lessonId_syllabusItemId_key" ON "LessonSyllabusItem"("lessonId", "syllabusItemId");

-- AddForeignKey
ALTER TABLE "LessonSyllabusItem" ADD CONSTRAINT "LessonSyllabusItem_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonSyllabusItem" ADD CONSTRAINT "LessonSyllabusItem_syllabusItemId_fkey" FOREIGN KEY ("syllabusItemId") REFERENCES "SyllabusItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonSyllabusItem" ADD CONSTRAINT "LessonSyllabusItem_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

