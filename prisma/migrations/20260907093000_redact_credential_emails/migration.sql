-- Scrub single-use tokens out of historical email log rows.
--
-- Until now every outgoing message stored its full body in EmailLog, including
-- the two that carry a credential: flight-school invitations and, briefly,
-- email verification. That put a working token in a table that any database
-- reader could select from, which defeats the reason those tokens are stored
-- hashed everywhere else.
--
-- Sending is fixed at the source; this clears what was already written. No row
-- is deleted — who was mailed, when, about what, and whether it succeeded are
-- all preserved, because that is what the log is for. Only the body goes.

UPDATE "EmailLog"
SET "body" = '[redacted — this message contained a single-use link]'
WHERE "template" IN ('org-invitation', 'email-verification');
