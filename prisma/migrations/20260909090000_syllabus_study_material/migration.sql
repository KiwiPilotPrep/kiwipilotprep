-- Indexed study material: syllabus topics, items, study content, progress.
--
-- Purely additive: four new tables, no existing column touched and no row
-- deleted. Nothing in Phases 1-6 reads or writes any of these, so applying it
-- changes no existing behaviour.
--
-- Two constraints carry the design:
--   * SyllabusItem.code is globally unique. It is the academic reference the
--     CAA prints on knowledge deficiency reports, so two items must never
--     claim the same one.
--   * SyllabusItemProgress is unique per (user, item), which makes marking a
--     topic complete idempotent rather than something that accumulates rows.

-- CreateTable
CREATE TABLE "SyllabusTopic" (
    "id" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "sectionNumber" TEXT,
    "sectionTitle" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SyllabusTopic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SyllabusItem" (
    "id" TEXT NOT NULL,
    "syllabusTopicId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "requirement" TEXT NOT NULL,
    "title" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "sourcePageFrom" INTEGER,
    "sourcePageTo" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SyllabusItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudyContent" (
    "id" TEXT NOT NULL,
    "syllabusItemId" TEXT NOT NULL,
    "blocks" JSONB NOT NULL DEFAULT '[]',
    "draftBlocks" JSONB,
    "references" TEXT,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudyContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SyllabusItemProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "syllabusItemId" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SyllabusItemProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SyllabusTopic_subjectId_status_displayOrder_idx" ON "SyllabusTopic"("subjectId", "status", "displayOrder");

-- CreateIndex
CREATE UNIQUE INDEX "SyllabusTopic_subjectId_code_key" ON "SyllabusTopic"("subjectId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "SyllabusItem_code_key" ON "SyllabusItem"("code");

-- CreateIndex
CREATE INDEX "SyllabusItem_syllabusTopicId_status_displayOrder_idx" ON "SyllabusItem"("syllabusTopicId", "status", "displayOrder");

-- CreateIndex
CREATE INDEX "SyllabusItem_status_idx" ON "SyllabusItem"("status");

-- CreateIndex
CREATE UNIQUE INDEX "StudyContent_syllabusItemId_key" ON "StudyContent"("syllabusItemId");

-- CreateIndex
CREATE INDEX "SyllabusItemProgress_userId_idx" ON "SyllabusItemProgress"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SyllabusItemProgress_userId_syllabusItemId_key" ON "SyllabusItemProgress"("userId", "syllabusItemId");

-- AddForeignKey
ALTER TABLE "SyllabusTopic" ADD CONSTRAINT "SyllabusTopic_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SyllabusItem" ADD CONSTRAINT "SyllabusItem_syllabusTopicId_fkey" FOREIGN KEY ("syllabusTopicId") REFERENCES "SyllabusTopic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyContent" ADD CONSTRAINT "StudyContent_syllabusItemId_fkey" FOREIGN KEY ("syllabusItemId") REFERENCES "SyllabusItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SyllabusItemProgress" ADD CONSTRAINT "SyllabusItemProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SyllabusItemProgress" ADD CONSTRAINT "SyllabusItemProgress_syllabusItemId_fkey" FOREIGN KEY ("syllabusItemId") REFERENCES "SyllabusItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

