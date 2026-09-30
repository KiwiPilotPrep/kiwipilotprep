-- Email verification (Phase 6 follow-up).
--
-- Additive only. No column is dropped and no row is deleted.
--
-- The backfill at the bottom is the part that matters: every account that
-- already exists predates verification, and several of them have paid for a
-- course. Leaving them unverified would lock them out of content they own the
-- moment the checkout and trial guards go live. They are therefore marked
-- verified as of their creation date, which is the honest record: their
-- address was never challenged, and we are not pretending it was confirmed
-- today.

ALTER TABLE "User" ADD COLUMN "emailVerifiedAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "verifyTokenHash" TEXT;
ALTER TABLE "User" ADD COLUMN "verifyTokenExpiresAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "verifySentAt" TIMESTAMP(3);

-- A token may only ever belong to one account.
CREATE UNIQUE INDEX "User_verifyTokenHash_key" ON "User"("verifyTokenHash");

-- Grandfather every existing account.
UPDATE "User" SET "emailVerifiedAt" = "createdAt" WHERE "emailVerifiedAt" IS NULL;
