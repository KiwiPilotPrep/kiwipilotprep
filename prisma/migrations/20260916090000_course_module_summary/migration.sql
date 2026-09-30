-- A chapter of an authored curriculum says what it is for. Imported chapters
-- have no such sentence, so the column is nullable.
ALTER TABLE "CourseModule" ADD COLUMN "summary" TEXT;
