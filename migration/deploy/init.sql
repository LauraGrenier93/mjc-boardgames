-- Deploy Guardians_of_the_legend:init to pg

BEGIN;

CREATE DOMAIN posint AS int CHECK (VALUE > 0); -- un domaine permettant de créer un type de donnée strictement positif

CREATE DOMAIN email AS text -- un domaine (type de donnée) permettant de vérifier la validiter d'une adresse email via une regex

	--CHECK (VALUE ~* '^[A-Za-z0-9._%\-+!#$&/=?^|~]+@[A-Za-z0-9.-]+[.][A-Za-z]+$'

	CHECK (

		VALUE ~* '^[A-Za-z0-9._%\-+!#$&/=?^|~]+@[A-Za-z0-9.-]+[.][A-Za-z]+$'
	);

CREATE DOMAIN text_length AS text
    CHECK (
        char_length(trim(both from VALUE)) >= 15
    );

CREATE TABLE "group" (
    id int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "name" text NOT NULL UNIQUE
);

CREATE TABLE game_type (
    id int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "name" text NOT NULL UNIQUE
);

CREATE TABLE game_tag (
    id int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "name" text NOT NULL UNIQUE
);

CREATE TABLE article_tag (
    id int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "name" text NOT NULL UNIQUE
);

CREATE TABLE event_tag (
    id int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "name" text NOT NULL UNIQUE
);

CREATE TABLE game (
    id int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title text NOT NULL,
    min_player posint NOT NULL,
    max_player posint,
    min_age posint NOT NULL,
    duration interval NOT NULL,
    quantity posint NOT NULL DEFAULT 1, -- par défaut, le club n'a qu'un exemplaire du jeu
    purchased_date date NOT NULL DEFAULT now(),
    creator text NOT NULL,
    editor text NOT NULL,
    "description" text_length NOT NULL,
    "year" posint NOT NULL,
    "type_id" int NOT NULL REFERENCES game_type(id),
    CHECK (min_player < max_player), -- vérifie que le nombre de joueurs minimum est bien inférieur au nombre de joueurs maximum
    CHECK ("year" > 1100 AND "year" < 2050) -- vérifie que l'année de parution du jeu est bien entre 1100 & 2050
);

CREATE TABLE "user" (
    id int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    first_name text NOT NULL,
    last_name text NOT NULL,
    pseudo text NOT NULL UNIQUE,
    email_address email NOT NULL UNIQUE,
    "password" text NOT NULL,
    inscription timestamptz NOT NULL DEFAULT now(),
    avatar text NOT NULL DEFAULT '/var/www/vhosts/lesgardiensdelalegende.fr/beta.lesgardiensdelalegende.fr/images/avatar_default.jpg',
    group_id int NOT NULL REFERENCES "group"(id) DEFAULT 1
);

CREATE TABLE article (
    id int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title text NOT NULL UNIQUE,
    "description" text_length NOT NULL,
    created_date timestamptz NOT NULL DEFAULT now(),
    update_date timestamptz,
    author_id int NOT NULL REFERENCES "user"(id),
    tag_id int NOT NULL REFERENCES article_tag(id),
    CHECK (created_date < update_date) -- vérifie que la date de création de l'article est bien inférieur à la date de mise à jour
);

CREATE TABLE comment (
    id int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title text NOT NULL,
    "description" text_length NOT NULL,
    created_date timestamptz NOT NULL DEFAULT now(),
    update_date timestamptz,
    author_id int NOT NULL REFERENCES "user"(id),
    article_id int NOT NULL REFERENCES article(id),
    CHECK (created_date < update_date)
);

CREATE TABLE review (
    id int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title text NOT NULL,
    "description" text_length NOT NULL,
    created_date timestamptz NOT NULL DEFAULT now(),
    update_date timestamptz,
    author_id int NOT NULL REFERENCES "user"(id),
    game_id int NOT NULL REFERENCES game(id),
    CHECK (created_date < update_date)
);

CREATE TABLE "event" (
    id int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title text NOT NULL,
    "description" text_length NOT NULL,
    event_date timestamptz NOT NULL,
    created_date timestamptz NOT NULL DEFAULT now(),
    update_date timestamptz,
    creator_id int NOT NULL REFERENCES "user"(id),
    tag_id int NOT NULL REFERENCES event_tag(id)
    CHECK (created_date < update_date)
);

CREATE TABLE tag_has_game (
    id int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    tag_id int NOT NULL REFERENCES game_tag(id),
    game_id int NOT NULL REFERENCES game(id)
);

CREATE TABLE event_has_participant (
    id int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    event_id int NOT NULL REFERENCES "event"(id),
    "user_id" int NOT NULL REFERENCES "user"(id),
    inscription_date timestamptz NOT NULL DEFAULT now(),
    cancelled_date timestamptz,
    CHECK (inscription_date < cancelled_date) -- vérifie que la date d'inscription est bien inférieur à la date d'annulation
);

CREATE TABLE event_has_game (
    id int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    event_id int NOT NULL REFERENCES "event"(id),
    game_id int NOT NULL REFERENCES game(id)
);

COMMIT;
