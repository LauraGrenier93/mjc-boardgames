BEGIN;

INSERT INTO "tag_has_game"("tag_id", "game_id") VALUES
(1, 3),
(5, 3),
(1, 4),
(4, 5);

COMMIT;