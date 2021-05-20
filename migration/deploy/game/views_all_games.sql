-- Deploy Guardians_of_the_legend:game/views to pg

BEGIN;

CREATE VIEW complete_games AS
SELECT game.*, game_type.name game_type, array_remove(array_agg(DISTINCT game_tag.name), NULL) game_categories, array_remove(array_agg(DISTINCT tag_has_game.id), NULL) tag_has_game_id FROM game
JOIN game_type ON game_type.id = game.type_id
LEFT JOIN tag_has_game ON tag_has_game.game_id = game.id
LEFT JOIN game_tag ON game_tag.id = tag_has_game.tag_id
GROUP BY game.id, game_type.name;

COMMIT;
