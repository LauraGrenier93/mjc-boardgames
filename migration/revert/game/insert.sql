-- Revert Guardians_of_the_legend:game/insert from pg

BEGIN;

DROP FUNCTION new_game(text, posint, posint, posint, posint, posint, text, text, text_length, posint, int);

COMMIT;
