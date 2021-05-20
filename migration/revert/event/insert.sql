-- Revert Guardians_of_the_legend:event/insert from pg

BEGIN;

DROP FUNCTION new_event(text, text_length, timestamptz, int, int);

COMMIT;
