-- The chapter a point belongs to, kept alongside the point.
--
-- A question mapped to point 27.3 reported only "27.3 — Ground-Air Visual
-- Signals", so a student reading their result saw the point without the
-- chapter it sits under. This carries the chapter through the snapshot so
-- the result can show both lines.
--
-- Additive and nullable. Rows already written stay null and render exactly
-- as they did — an attempt that has been sat is not rewritten, and a
-- question mapped to its chapter alone never sets this at all.

ALTER TABLE "MockAttemptQuestion" ADD COLUMN IF NOT EXISTS "kdrChapterSnapshot" TEXT;
ALTER TABLE "KdrResult"           ADD COLUMN IF NOT EXISTS "kdrChapter"         TEXT;
