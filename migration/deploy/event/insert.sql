-- Deploy Guardians_of_the_legend:event/insert to pg

BEGIN;

CREATE FUNCTION new_event(etitle text, edescription text_length, edate timestamptz, ecreator int, etag int)
RETURNS "event" AS $$
INSERT INTO "event" (
    title,
    "description",
    event_date,
    creator_id,
    tag_id
) VALUES (
    etitle,
    edescription,
    edate,
    ecreator,
    etag
) RETURNING *;
$$ LANGUAGE sql;

COMMIT;
