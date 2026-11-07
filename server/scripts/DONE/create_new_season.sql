BEGIN;

LOCK TABLE seasons IN EXCLUSIVE MODE;
LOCK TABLE drivers IN EXCLUSIVE MODE;

DO $$
DECLARE
    previous_season_id INTEGER;
    new_season_id INTEGER;
BEGIN
    SELECT id
    INTO previous_season_id
    FROM seasons
    ORDER BY start_date DESC, id DESC
    LIMIT 1;

    IF previous_season_id IS NULL THEN
        RAISE EXCEPTION 'Cannot create a new season because no previous season exists';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM seasons
        WHERE start_date::date = CURRENT_DATE
    ) THEN
        RAISE EXCEPTION 'A season with start date % already exists', CURRENT_DATE;
    END IF;

    SELECT COALESCE(MAX(id), 0) + 1
    INTO new_season_id
    FROM seasons;

    INSERT INTO seasons (id, description, start_date)
    VALUES (
        new_season_id,
        format('Season %s', EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER),
        CURRENT_DATE
    );

    INSERT INTO track_seasons (track_id, season_id)
    SELECT track_id, new_season_id
    FROM track_seasons
    WHERE season_id = previous_season_id;

    INSERT INTO drivers (
        id,
        username,
        name,
        surname,
        free_practice_points,
        qualifying_points,
        race_points,
        pilot_id,
        description,
        consistency_pt,
        fast_lap_pt,
        dangerous_pt,
        ingenuity_pt,
        strategy_pt,
        color,
        license_pt,
        season
    )
    SELECT
        (SELECT COALESCE(MAX(id), 0) FROM drivers)
            + ROW_NUMBER() OVER (ORDER BY id),
        username,
        name,
        surname,
        0,
        0,
        0,
        pilot_id,
        description,
        consistency_pt,
        fast_lap_pt,
        dangerous_pt,
        ingenuity_pt,
        strategy_pt,
        color,
        license_pt,
        new_season_id
    FROM drivers
    WHERE season = previous_season_id;
END $$;

COMMIT;
