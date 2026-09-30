-- Study content may attach to a syllabus topic as well as to an item.
--
-- Additive and non-destructive: one nullable column, one index, one foreign
-- key. Existing rows keep their syllabusItemId and are untouched.
--
-- Why: the source material is written in chapters that correspond to topics,
-- not to individual syllabus items. Without a topic-level home, a chapter's
-- material had nowhere to go unless the source happened to print an item code
-- inside it — which it does for 12 items out of 210. The rest of a 506-page
-- book was being discarded for want of an anchor.

-- AlterTable
ALTER TABLE "StudyContent" ADD COLUMN     "syllabusTopicId" TEXT,
ALTER COLUMN "syllabusItemId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "StudyContent_syllabusTopicId_key" ON "StudyContent"("syllabusTopicId");

-- AddForeignKey
ALTER TABLE "StudyContent" ADD CONSTRAINT "StudyContent_syllabusTopicId_fkey" FOREIGN KEY ("syllabusTopicId") REFERENCES "SyllabusTopic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

