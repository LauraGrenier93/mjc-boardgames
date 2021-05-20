-- Revert Guardians_of_the_legend:email/verify_email from pg

BEGIN;

ALTER TABLE "user" DROP COLUMN verifyemail;

COMMIT;
