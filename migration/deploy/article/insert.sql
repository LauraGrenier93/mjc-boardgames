-- Deploy Guardians_of_the_legend:article/insert to pg

BEGIN;

CREATE FUNCTION new_article(atitle text, adescription text_length, aauthor int, atag int)
RETURNS article AS $$
INSERT INTO article(
    title, "description", author_id, tag_id
)
VALUES
    (atitle, adescription, aauthor, atag)
RETURNING *;
$$ LANGUAGE sql;

COMMIT;
