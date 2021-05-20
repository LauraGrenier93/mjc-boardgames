-- Revert Guardians_of_the_legend:game/views from pg

BEGIN;

DROP VIEW complete_games;

COMMIT;
