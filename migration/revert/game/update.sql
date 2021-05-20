-- Revert Guardians_of_the_legend:game/update from pg

BEGIN;

DROP FUNCTION update_game(
    int,
    text,
    posint,
    posint,
    posint,
    interval,
    posint,
    text,
    text,
    text_length,
    posint,
    int
);

COMMIT;
