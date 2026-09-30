-- AlterTable
ALTER TABLE "CourseModule" ADD COLUMN     "sectionCode" TEXT;

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "moduleId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "CourseModule_subjectId_sectionCode_key" ON "CourseModule"("subjectId", "sectionCode");

-- CreateIndex
CREATE INDEX "Question_moduleId_idx" ON "Question"("moduleId");

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "CourseModule"("id") ON DELETE SET NULL ON UPDATE CASCADE;

