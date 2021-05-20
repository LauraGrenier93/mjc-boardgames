-- Deploy Guardians_of_the_legend:article/views to pg

BEGIN;

CREATE VIEW complete_articles AS
SELECT article.*, "user".pseudo author_pseudo, "user".avatar author_avatar, article_tag.name tag_name  FROM article
JOIN "user" ON "user".id = article.author_id
JOIN article_tag ON article_tag.id = article.tag_id;

COMMIT;
