-- Revert Guardians_of_the_legend:init from pg

BEGIN;

DROP TABLE
    event_has_game,
    event_has_participant,
    tag_has_game,
    "event",
    review,
    comment,
    article,
    "user",
    game,
    event_tag,
    article_tag,
    game_tag,
    game_type,
    "group";

DROP DOMAIN text_length, email, posint;

COMMIT;
