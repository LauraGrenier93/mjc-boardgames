-- Revert Guardians_of_the_legend:article/views from pg

BEGIN;

DROP VIEW complete_articles;

COMMIT;
