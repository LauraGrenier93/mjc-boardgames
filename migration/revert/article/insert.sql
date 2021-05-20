-- Revert Guardians_of_the_legend:article/insert from pg

BEGIN;

DROP FUNCTION new_article(text, text_length, int, int);

COMMIT;
