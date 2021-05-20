-- Deploy Guardians_of_the_legend:event/update to pg

BEGIN;

CREATE FUNCTION update_event(eid int, etitle text, edescription text_length, edate timestamptz, etag int)
RETURNS "event" AS $$
UPDATE "event"
SET title = etitle,
    "description" = edescription,
    event_date = edate,
    update_date = now(),
    tag_id = etag
WHERE id = eid
RETURNING *;
$$ LANGUAGE sql;

COMMIT;
