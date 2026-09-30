-- AlterTable
ALTER TABLE "SyllabusTopic" ADD COLUMN     "moduleId" TEXT;

-- CreateIndex
CREATE INDEX "SyllabusTopic_moduleId_idx" ON "SyllabusTopic"("moduleId");

-- AddForeignKey
ALTER TABLE "SyllabusTopic" ADD CONSTRAINT "SyllabusTopic_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "CourseModule"("id") ON DELETE SET NULL ON UPDATE CASCADE;

