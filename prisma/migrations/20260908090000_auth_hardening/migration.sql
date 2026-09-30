-- Authentication hardening: account states, password reset, session cutoff.
--
-- Additive only. No column is dropped, no row is deleted, and every existing
-- account keeps working exactly as before:
--
--   * status defaults to ACTIVE, so nobody is switched off by this migration.
--   * the reset-token columns start empty; a token only exists once someone
--     asks for one.
--   * sessionsValidFrom stays NULL, which means "no cutoff" — every session
--     that is valid today stays valid. Setting it is what signs a person out
--     everywhere, and only a password change does that.

CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'DISABLED');

ALTER TABLE "User" ADD COLUMN "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE "User" ADD COLUMN "disabledAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "disabledNote" TEXT;

ALTER TABLE "User" ADD COLUMN "resetTokenHash" TEXT;
ALTER TABLE "User" ADD COLUMN "resetTokenExpiresAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "resetSentAt" TIMESTAMP(3);

ALTER TABLE "User" ADD COLUMN "sessionsValidFrom" TIMESTAMP(3);

-- A reset token may only ever belong to one account.
CREATE UNIQUE INDEX "User_resetTokenHash_key" ON "User"("resetTokenHash");

-- Listing and filtering accounts by state in the admin console.
CREATE INDEX "User_status_idx" ON "User"("status");
