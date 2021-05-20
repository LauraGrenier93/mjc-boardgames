-- psql -d <nom> -f seeding.sql
-- Le fichier permettant d'insérer des données pour une meilleur représentation des tables

BEGIN;

INSERT INTO "group" ("name") VALUES
('Membre'),
('Administrateur'),
('Modérateur');


INSERT INTO "game_type" ("name") VALUES
('Jeux de base'),
('Extension');


INSERT INTO "game_tag" ("name") VALUES
('Jeux de Plateaux'),
('Jeux de Rôle'),
('Jeux de Rôle Grandeur Nature'),
('Jeux de Cartes'),
('Jeux de Figurines');


INSERT INTO "article_tag" ("name") VALUES
('News'),
('Évenement'),
('Salons');


INSERT INTO "event_tag" ("name") VALUES
('Soirée Jeux'),
('Murder Party'),
('Jeux de Rôle');


INSERT INTO "game" ("title", "min_player", "max_player", "min_age", "duration", "quantity", "purchased_date", "creator", "editor", "description", "year", "type_id") VALUES
('Les Colons de Catane', 3, 4, 10, '75 minutes' , 2, '2021-01-17', 'Klaus Teuber', 'Kosmos', 'Vous êtes à la tête d’une expédition ayant pour mission de coloniser l’île de Catane. Les ouvrages des Explorateurs décrivent cette île comme un paradis où abondent toutes les richesses nécessaires pour y construire de prospères cités....Mais vous n''êtes pas seul ! Les premières colonies fondées croissent rapidement. L''espace devient de plus en plus rare et les échanges commerciaux de plus en plus nécessaires. Vous devrez donc utiliser à profit vos talents de négociateur ! Une grande aventure vous attend. Deviendrez-vous le premier souverain de Catane?', 1995, 1),
('7 Wonders', 2, 7, 10, '30 minutes', 1, '2018-01-17', 'Antoine Bauza','Asmodee', 'L''Antiquité et ses merveilles. Revivez l''épopée des grandes constructions avec ce jeu de cartes et de stratégie !
7 Wonders est un jeu de cartes et de stratégie qui vous propose de prendre la tête d’une prestigieuse civilisation et de la faire prospérer jusqu’à la victoire.', 2010, 1);

INSERT INTO "user" ("first_name", "last_name", "pseudo","email_address", "password", "group_id") VALUES
('Maurice', 'Thegamer', 'Momo', 'maurice@thegamer.fr', 'password', 1),
('Mauricette', 'Thegameuse', 'Ricette', 'mauricette@thegameuse.fr', '123456', 1);

INSERT INTO "review" ("title", "description", "game_id", "author_id") VALUES
('Un jeu de folie !', 'J''ai joué de nombreuses heures et je ne m''en suis toujours pas lassé', 1, 1 );

INSERT INTO "event" ("title", "description", "event_date", "creator_id", "tag_id") VALUES
('Une envie de tuer ? ', 'Vous serez le/la bienvenue pour tuer vos amis...', '2021-04-03 20:00', 2, 2),
('Soirée Jeux', 'Si vous voulez nous rejoindre pour une soirée, vous êtes le/la bienvenue !', '2021-06-01 19:00', 1, 1);

INSERT INTO event_has_game(event_id, game_id) VALUES
(2, 1),
(2, 2);

INSERT INTO "tag_has_game"("tag_id", "game_id") VALUES
(1, 1),
(2, 1),
(1, 2);

INSERT INTO "event_has_participant"("event_id", "user_id") VALUES
(1, 1),
(1, 2),
(2, 1);

COMMIT;
