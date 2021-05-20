-- Deploy Guardians_of_the_legend:game/insert to pg

BEGIN;

CREATE FUNCTION new_game(
    gtitle text,
    gminPlayer posint,
    gmaxPlayer posint,
    gminAge posint,
    gduration posint,
    gquantity posint,
    gcreator text,
    geditor text,
    gdescription text_length,
    gyear posint,
    gtype int
) RETURNS game AS $$
INSERT INTO game(
    title,
    min_player,
    max_player,
    min_age,
    duration,
    quantity,
    creator,
    editor,
    "description",
    "year",
    "type_id"
) VALUES(
    gtitle,
    gminPlayer,
    gmaxPlayer,
    gminAge,
    (gduration || ' minutes')::interval,
    gquantity,
    gcreator,
    geditor,
    gdescription,
    gyear,
    gtype
) RETURNING *;
$$ LANGUAGE sql;

COMMIT;
