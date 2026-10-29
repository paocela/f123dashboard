-- Run from this directory with psql, replacing 2 with the target season ID:
-- psql "$DATABASE_URL" -v season_id=2 -f disable_free_practice.sql
--
-- The property is absent by default, which means free practice remains enabled.
-- This migration disables it for one season and updates all dependent scoring views.

BEGIN;

INSERT INTO property (name, description, value)
VALUES (
  'free_practice_enabled_season_' || :'season_id',
  'Enables free practice results and points for a season',
  '0'
)
ON CONFLICT (name) DO UPDATE
SET description = EXCLUDED.description,
    value = EXCLUDED.value,
    updated_at = NOW();

CREATE OR REPLACE VIEW public.all_race_points AS
WITH session_points AS (
  SELECT rre.pilot_id AS driver_id, gp.season_id,
    CASE rre.position
      WHEN 1 THEN st."1_points" WHEN 2 THEN st."2_points"
      WHEN 3 THEN st."3_points" WHEN 4 THEN st."4_points"
      WHEN 5 THEN st."5_points" WHEN 6 THEN st."6_points" ELSE 0
    END + CASE WHEN rre.fast_lap THEN COALESCE(st.fast_lap_points, 0) ELSE 0 END AS points,
    'race'::text AS session
  FROM race_result_entries rre
  JOIN gran_prix gp ON gp.race_results_id = rre.race_results_id
  JOIN session_type st ON st.id = 1

  UNION ALL

  SELECT frre.pilot_id, gp.season_id,
    CASE frre.position
      WHEN 1 THEN st."1_points" WHEN 2 THEN st."2_points"
      WHEN 3 THEN st."3_points" WHEN 4 THEN st."4_points"
      WHEN 5 THEN st."5_points" WHEN 6 THEN st."6_points" ELSE 0
    END + CASE WHEN frre.fast_lap THEN COALESCE(st.fast_lap_points, 0) ELSE 0 END,
    'full_race'::text
  FROM full_race_result_entries frre
  JOIN gran_prix gp ON gp.full_race_results_id = frre.race_results_id
  JOIN session_type st ON st.id = 5

  UNION ALL

  SELECT sre.pilot_id, gp.season_id,
    CASE sre.position
      WHEN 1 THEN st."1_points" WHEN 2 THEN st."2_points"
      WHEN 3 THEN st."3_points" WHEN 4 THEN st."4_points"
      WHEN 5 THEN st."5_points" WHEN 6 THEN st."6_points" ELSE 0
    END + CASE WHEN sre.fast_lap THEN COALESCE(st.fast_lap_points, 0) ELSE 0 END,
    'sprint'::text
  FROM sprint_result_entries sre
  JOIN gran_prix gp ON gp.sprint_results_id = sre.sprint_results_id
  JOIN session_type st ON st.id = 4

  UNION ALL

  SELECT qre.pilot_id, gp.season_id,
    CASE qre.position
      WHEN 1 THEN st."1_points" WHEN 2 THEN st."2_points"
      WHEN 3 THEN st."3_points" WHEN 4 THEN st."4_points"
      WHEN 5 THEN st."5_points" WHEN 6 THEN st."6_points" ELSE 0
    END,
    'qualifying'::text
  FROM qualifying_result_entries qre
  JOIN gran_prix gp ON gp.qualifying_results_id = qre.qualifying_results_id
  JOIN session_type st ON st.id = 2

  UNION ALL

  SELECT fpre.pilot_id, gp.season_id,
    CASE fpre.position
      WHEN 1 THEN st."1_points" WHEN 2 THEN st."2_points"
      WHEN 3 THEN st."3_points" WHEN 4 THEN st."4_points"
      WHEN 5 THEN st."5_points" WHEN 6 THEN st."6_points" ELSE 0
    END,
    'free_practice'::text
  FROM free_practice_result_entries fpre
  JOIN gran_prix gp ON gp.free_practice_results_id = fpre.free_practice_results_id
  JOIN session_type st ON st.id = 3
  WHERE COALESCE((
    SELECT value FROM property
    WHERE name = 'free_practice_enabled_season_' || gp.season_id::text
    LIMIT 1
  ), '1') <> '0'
), driver_totals AS (
  SELECT
    driver_id,
    season_id,
    SUM(points) FILTER (WHERE session = 'race') AS total_race_points,
    SUM(points) FILTER (WHERE session = 'full_race') AS total_full_race_points,
    SUM(points) FILTER (WHERE session = 'sprint') AS total_sprint_points,
    SUM(points) FILTER (WHERE session = 'qualifying') AS total_qualifying_points,
    SUM(points) FILTER (WHERE session = 'free_practice') AS total_free_practice_points,
    SUM(points) AS total_points
  FROM session_points
  GROUP BY driver_id, season_id
)
SELECT
  d.id AS driver_id,
  d.username AS driver_username,
  d.name AS driver_name,
  d.surname AS driver_surname,
  d.description AS driver_description,
  d.license_pt AS driver_license_pt,
  d.consistency_pt AS driver_consistency_pt,
  d.fast_lap_pt AS driver_fast_lap_pt,
  d.dangerous_pt AS drivers_dangerous_pt,
  d.ingenuity_pt AS driver_ingenuity_pt,
  d.strategy_pt AS driver_strategy_pt,
  d.color AS driver_color,
  p.name AS pilot_name,
  p.surname AS pilot_surname,
  c.name AS car_name,
  c.overall_score AS car_overall_score,
  d.season AS season_id,
  COALESCE(dt.total_sprint_points, 0) AS total_sprint_points,
  COALESCE(dt.total_free_practice_points, 0) AS total_free_practice_points,
  COALESCE(dt.total_qualifying_points, 0) AS total_qualifying_points,
  COALESCE(dt.total_full_race_points, 0) AS total_full_race_points,
  COALESCE(dt.total_race_points, 0) AS total_race_points,
  COALESCE(dt.total_points, 0) AS total_points
FROM drivers d
JOIN pilots p ON p.id = d.pilot_id
JOIN cars c ON c.id = p.car_id
LEFT JOIN driver_totals dt ON dt.driver_id = d.id AND dt.season_id = d.season
ORDER BY d.season, COALESCE(dt.total_points, 0) DESC;

CREATE OR REPLACE VIEW public.driver_grand_prix_points AS
WITH session_points AS (
  SELECT gp.id AS grand_prix_id, gp.date AS grand_prix_date, t.name AS track_name,
    gp.track_id, s.description AS season_description, gp.season_id,
    d.id AS pilot_id, (d.name || ' ' || d.surname) AS pilot_name,
    d.username AS pilot_username, 'Race'::text AS session_type,
    CASE rre.position WHEN 1 THEN st."1_points" WHEN 2 THEN st."2_points" WHEN 3 THEN st."3_points" WHEN 4 THEN st."4_points" WHEN 5 THEN st."5_points" WHEN 6 THEN st."6_points" ELSE 0 END AS position_points,
    CASE WHEN rre.fast_lap THEN COALESCE(st.fast_lap_points, 0) ELSE 0 END AS fast_lap_points
  FROM gran_prix gp JOIN race_result_entries rre ON rre.race_results_id = gp.race_results_id
  JOIN drivers d ON d.id = rre.pilot_id JOIN tracks t ON t.id = gp.track_id
  JOIN seasons s ON s.id = gp.season_id JOIN session_type st ON st.id = 1

  UNION ALL

  SELECT gp.id, gp.date, t.name, gp.track_id, s.description, gp.season_id,
    d.id, (d.name || ' ' || d.surname), d.username, 'Sprint'::text,
    CASE sre.position WHEN 1 THEN st."1_points" WHEN 2 THEN st."2_points" WHEN 3 THEN st."3_points" WHEN 4 THEN st."4_points" WHEN 5 THEN st."5_points" WHEN 6 THEN st."6_points" ELSE 0 END,
    CASE WHEN sre.fast_lap THEN COALESCE(st.fast_lap_points, 0) ELSE 0 END
  FROM gran_prix gp JOIN sprint_result_entries sre ON sre.sprint_results_id = gp.sprint_results_id
  JOIN drivers d ON d.id = sre.pilot_id JOIN tracks t ON t.id = gp.track_id
  JOIN seasons s ON s.id = gp.season_id JOIN session_type st ON st.id = 4

  UNION ALL

  SELECT gp.id, gp.date, t.name, gp.track_id, s.description, gp.season_id,
    d.id, (d.name || ' ' || d.surname), d.username, 'Qualifying'::text,
    CASE qre.position WHEN 1 THEN st."1_points" WHEN 2 THEN st."2_points" WHEN 3 THEN st."3_points" WHEN 4 THEN st."4_points" WHEN 5 THEN st."5_points" WHEN 6 THEN st."6_points" ELSE 0 END,
    0
  FROM gran_prix gp JOIN qualifying_result_entries qre ON qre.qualifying_results_id = gp.qualifying_results_id
  JOIN drivers d ON d.id = qre.pilot_id JOIN tracks t ON t.id = gp.track_id
  JOIN seasons s ON s.id = gp.season_id JOIN session_type st ON st.id = 2

  UNION ALL

  SELECT gp.id, gp.date, t.name, gp.track_id, s.description, gp.season_id,
    d.id, (d.name || ' ' || d.surname), d.username, 'Free Practice'::text,
    CASE fpre.position WHEN 1 THEN st."1_points" WHEN 2 THEN st."2_points" WHEN 3 THEN st."3_points" WHEN 4 THEN st."4_points" WHEN 5 THEN st."5_points" WHEN 6 THEN st."6_points" ELSE 0 END,
    0
  FROM gran_prix gp JOIN free_practice_result_entries fpre ON fpre.free_practice_results_id = gp.free_practice_results_id
  JOIN drivers d ON d.id = fpre.pilot_id JOIN tracks t ON t.id = gp.track_id
  JOIN seasons s ON s.id = gp.season_id JOIN session_type st ON st.id = 3
  WHERE COALESCE((SELECT value FROM property WHERE name = 'free_practice_enabled_season_' || gp.season_id::text LIMIT 1), '1') <> '0'

  UNION ALL

  SELECT gp.id, gp.date, t.name, gp.track_id, s.description, gp.season_id,
    d.id, (d.name || ' ' || d.surname), d.username, 'Full Race'::text,
    CASE frre.position WHEN 1 THEN st."1_points" WHEN 2 THEN st."2_points" WHEN 3 THEN st."3_points" WHEN 4 THEN st."4_points" WHEN 5 THEN st."5_points" WHEN 6 THEN st."6_points" ELSE 0 END,
    CASE WHEN frre.fast_lap THEN COALESCE(st.fast_lap_points, 0) ELSE 0 END
  FROM gran_prix gp JOIN full_race_result_entries frre ON frre.race_results_id = gp.full_race_results_id
  JOIN drivers d ON d.id = frre.pilot_id JOIN tracks t ON t.id = gp.track_id
  JOIN seasons s ON s.id = gp.season_id JOIN session_type st ON st.id = 5
)
SELECT grand_prix_id, grand_prix_date, track_name, track_id, season_description, season_id,
  pilot_id, pilot_name, pilot_username, SUM(position_points) AS position_points,
  SUM(fast_lap_points) AS fast_lap_points,
  SUM(position_points + fast_lap_points) AS total_points,
  string_agg(session_type || ': ' || (position_points + fast_lap_points)::text, ', ' ORDER BY session_type) AS points_breakdown
FROM session_points
GROUP BY grand_prix_id, grand_prix_date, track_name, track_id, season_description, season_id, pilot_id, pilot_name, pilot_username;

CREATE OR REPLACE VIEW public.season_driver_leaderboard AS
SELECT season_id, pilot_id, pilot_username, pilot_name, SUM(total_points) AS total_points
FROM driver_grand_prix_points
GROUP BY season_id, pilot_id, pilot_username, pilot_name;

CREATE OR REPLACE VIEW public.constructor_grand_prix_points AS
SELECT c.id AS constructor_id, c.name AS constructor_name, dgp.grand_prix_id, dgp.track_id,
  dgp.grand_prix_date, dgp.track_name, dgp.season_id, dgp.season_description,
  c.driver_id_1, c.driver_id_2,
  COALESCE(d1.total_points, 0) AS driver_1_points,
  COALESCE(d2.total_points, 0) AS driver_2_points,
  COALESCE(d1.total_points, 0) + COALESCE(d2.total_points, 0) AS constructor_points
FROM constructors c
CROSS JOIN (SELECT DISTINCT grand_prix_id, track_id, grand_prix_date, track_name, season_id, season_description FROM driver_grand_prix_points) dgp
LEFT JOIN driver_grand_prix_points d1 ON d1.pilot_id = c.driver_id_1 AND d1.grand_prix_id = dgp.grand_prix_id
LEFT JOIN driver_grand_prix_points d2 ON d2.pilot_id = c.driver_id_2 AND d2.grand_prix_id = dgp.grand_prix_id
WHERE c.season = dgp.season_id AND c.driver_id_1 IS NOT NULL AND c.driver_id_2 IS NOT NULL;

CREATE OR REPLACE VIEW public.season_constructor_leaderboard AS
SELECT c.id AS constructor_id, c.name AS constructor_name, c.color AS constructor_color,
  driver_1.id AS driver_1_id, driver_1.username AS driver_1_username,
  COALESCE(d1.total_points, 0) AS driver_1_tot_points,
  driver_2.id AS driver_2_id, driver_2.username AS driver_2_username,
  COALESCE(d2.total_points, 0) AS driver_2_tot_points,
  COALESCE(d1.total_points, 0) + COALESCE(d2.total_points, 0) AS constructor_tot_points,
  c.season AS season_id
FROM constructors c
LEFT JOIN drivers driver_1 ON driver_1.id = c.driver_id_1 AND driver_1.season = c.season
LEFT JOIN drivers driver_2 ON driver_2.id = c.driver_id_2 AND driver_2.season = c.season
LEFT JOIN season_driver_leaderboard d1 ON d1.pilot_id = driver_1.id AND d1.season_id = c.season
LEFT JOIN season_driver_leaderboard d2 ON d2.pilot_id = driver_2.id AND d2.season_id = c.season;

COMMIT;

-- To re-enable free practice for this season:
-- UPDATE property
-- SET value = '1', updated_at = NOW()
-- WHERE name = 'free_practice_enabled_season_<season_id>';