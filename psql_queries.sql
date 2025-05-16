CREATE DATABASE gowbackend;

\c gowbackend

CREATE EXTENSION postgis;

CREATE TABLE gowedges(
    user_id INTEGER,
    friend_id INTEGER
);

\COPY gowedges FROM 'path/to/gowalla_edges.txt' DELIMITER E'\t' CSV;

CREATE TABLE gowcheckins(
    user_id INTEGER,
    checkin_time TIMESTAMP,
    latitude FLOAT,
    longitude FLOAT,
    location_id INTEGER
);

\COPY gowcheckins FROM 'path/to/gowalla_checkins.txt' DELIMITER E'\t' CSV;

CREATE USER user WITH PASSWORD "password";
GRANT SELECT ON gowcheckins TO user;
GRANT SELECT ON gowedges TO user;

CREATE INDEX IF NOT EXISTS idx_gowedges_user_id ON gowedges(user_id);
CREATE INDEX IF NOT EXISTS idx_gowcheckins_user_id ON gowcheckins(user_id);