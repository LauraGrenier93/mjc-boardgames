-- Revert Guardians_of_the_legend:article/update from pg

BEGIN;

DROP FUNCTION update_article(int, text, text_length, int, int);

COMMIT;
