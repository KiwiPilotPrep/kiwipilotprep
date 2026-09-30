-- Remembers the syllabus item a student last opened in the Study Reader.
--
-- One nullable column. Nothing is dropped, nothing is backfilled: an account
-- that has not opened the reader simply has no pointer, and the dashboard
-- falls back to the chapter pointer it already used.

ALTER TABLE "StudentProgress" ADD COLUMN "lastSyllabusItemId" TEXT;
