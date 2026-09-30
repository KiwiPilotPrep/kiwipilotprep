-- Files sent with a contact message are now kept.
--
-- The public form counted attachments and discarded them, so a student who
-- attached their result sheet to a pass-guarantee enquiry sent it into
-- nothing. This gives those files the same home GuaranteeDocument already
-- uses: bytes outside the web root under a generated key, metadata here.
--
-- Purely additive — one new table. Nothing is dropped and no existing row
-- is touched; messages already received keep their count and simply have no
-- files, which is the truth about them.

CREATE TABLE IF NOT EXISTS "ContactAttachment" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ContactAttachment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "ContactAttachment_storageKey_key"
  ON "ContactAttachment"("storageKey");
CREATE INDEX IF NOT EXISTS "ContactAttachment_messageId_idx"
  ON "ContactAttachment"("messageId");

DO $$ BEGIN
  ALTER TABLE "ContactAttachment" ADD CONSTRAINT "ContactAttachment_messageId_fkey"
    FOREIGN KEY ("messageId") REFERENCES "ContactMessage"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
