-- Deploy Guardians_of_the_legend:game/update to pg

BEGIN;

CREATE FUNCTION update_game(
    gid int,
    gtitle text,
    gminPlayer posint,
    gmaxPlayer posint,
    gminAge posint,
    gduration interval,
    gquantity posint,
    gcreator text,
    geditor text,
    gdescription text_length,
    gyear posint,
    gtype int
) RETURNS game AS $$
UPDATE game
SET title = gtitle,
    min_player = gminPlayer,
    max_player = gmaxPlayer,
    min_age = gminAge,
    duration = gduration,
    quantity = gquantity,
    creator = gcreator,
    editor = geditor,
    "description" = gdescription,
    "year" = gyear,
    "type_id" = gtype
WHERE id = gid
RETURNING *;
$$ LANGUAGE sql;

COMMIT;
