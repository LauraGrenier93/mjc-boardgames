-- Revert Guardians_of_the_legend:event/update from pg

BEGIN;

DROP FUNCTION update_event(int, text, text_length, timestamptz, int);

COMMIT;
