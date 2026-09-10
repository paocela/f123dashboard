CREATE TABLE IF NOT EXISTS track_seasons (
    track_id BIGINT NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
    season_id INTEGER NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
    PRIMARY KEY (track_id, season_id)
);

CREATE INDEX IF NOT EXISTS track_seasons_season_id_track_id_idx
    ON track_seasons (season_id, track_id);

INSERT INTO track_seasons (track_id, season_id)
SELECT DISTINCT track_id, season_id
FROM gran_prix
ON CONFLICT (track_id, season_id) DO NOTHING;