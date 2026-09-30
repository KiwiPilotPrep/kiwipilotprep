-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "seedKey" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Question_seedKey_key" ON "Question"("seedKey");

