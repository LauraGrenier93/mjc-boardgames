-- Deploy Guardians_of_the_legend:email/verify_email to pg

BEGIN;

ALTER TABLE "user" ADD COLUMN verifyemail BOOLEAN NOT NULL DEFAULT FALSE;

COMMIT;
