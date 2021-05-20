-- Deploy Guardians_of_the_legend:article/update to pg

BEGIN;

CREATE FUNCTION update_article(aid int, atitle text, adescription text_length, aauthor int, atag int) RETURNS article AS $$
UPDATE article
SET title = atitle,
    "description" = adescription,
    author_id = aauthor,
    tag_id = atag,
    update_date = now()
WHERE id = aid
RETURNING *;
$$ LANGUAGE sql;

COMMIT;
