-- Deploy Guardians_of_the_legend:event/views_all_events to pg

BEGIN;

CREATE VIEW complete_events AS
SELECT "event".*, event_tag.name event_tag, creator.pseudo creator_pseudo, array_remove(array_agg(DISTINCT "user".pseudo), NULL) event_participants, array_remove(array_agg(DISTINCT game.title), NULL) event_games, array_remove(array_agg(DISTINCT event_has_game.id), NULL) event_has_game_id FROM "event"
JOIN "user" creator ON creator.id = "event".creator_id
JOIN event_tag ON event_tag.id = "event".tag_id
LEFT JOIN event_has_participant ON event_has_participant.event_id = "event".id
LEFT JOIN "user" ON "user".id=event_has_participant.user_id AND event_has_participant.cancelled_date IS NULL
LEFT JOIN event_has_game ON event_has_game.event_id = "event".id
LEFT JOIN game ON game.id = event_has_game.game_id
GROUP BY "event".id, event_tag.name, creator.pseudo
ORDER BY "event".id DESC;

COMMIT;
