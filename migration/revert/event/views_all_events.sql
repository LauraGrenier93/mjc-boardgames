-- Revert Guardians_of_the_legend:event/views_all_events from pg

BEGIN;

DROP VIEW complete_events;

COMMIT;
