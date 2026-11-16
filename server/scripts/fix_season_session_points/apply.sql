-- Fixes point calculation for seasons after season 1.
-- The previous views joined session_type by hardcoded id (1..5), which are the season 1 rows,
-- so every season was scored with season 1 points and positions 7-8 were ignored.
-- Points are now resolved by session name and Grand Prix season, falling back to the most
-- recent previous season that defines that session when the season has no rows of its own.
-- LEFT JOIN + COALESCE keep result rows (scored 0) when no rules or a position column is NULL.
--
-- psql "$DATABASE_URL" -f apply.sql

BEGIN;

CREATE OR REPLACE VIEW public.all_race_points AS
WITH session_points AS (
  SELECT rre.pilot_id AS driver_id, gp.season_id,
    COALESCE(CASE rre.position
      WHEN 1 THEN st."1_points" WHEN 2 THEN st."2_points"
      WHEN 3 THEN st."3_points" WHEN 4 THEN st."4_points"
      WHEN 5 THEN st."5_points" WHEN 6 THEN st."6_points"
      WHEN 7 THEN st."7_points" WHEN 8 THEN st."8_points" ELSE 0
    END, 0) + CASE WHEN rre.fast_lap THEN COALESCE(st.fast_lap_points, 0) ELSE 0 END AS points,
    'race'::text AS session
  FROM race_result_entries rre
  JOIN gran_prix gp ON gp.race_results_id = rre.race_results_id
  LEFT JOIN LATERAL (
    SELECT * FROM session_type
    WHERE name = 'race' AND season <= gp.season_id
    ORDER BY season DESC LIMIT 1
  ) st ON true

  UNION ALL

  SELECT frre.pilot_id, gp.season_id,
    COALESCE(CASE frre.position
      WHEN 1 THEN st."1_points" WHEN 2 THEN st."2_points"
      WHEN 3 THEN st."3_points" WHEN 4 THEN st."4_points"
      WHEN 5 THEN st."5_points" WHEN 6 THEN st."6_points"
      WHEN 7 THEN st."7_points" WHEN 8 THEN st."8_points" ELSE 0
    END, 0) + CASE WHEN frre.fast_lap THEN COALESCE(st.fast_lap_points, 0) ELSE 0 END,
    'full_race'::text
  FROM full_race_result_entries frre
  JOIN gran_prix gp ON gp.full_race_results_id = frre.race_results_id
  LEFT JOIN LATERAL (
    SELECT * FROM session_type
    WHERE name = 'full-race' AND season <= gp.season_id
    ORDER BY season DESC LIMIT 1
  ) st ON true

  UNION ALL

  SELECT sre.pilot_id, gp.season_id,
    COALESCE(CASE sre.position
      WHEN 1 THEN st."1_points" WHEN 2 THEN st."2_points"
      WHEN 3 THEN st."3_points" WHEN 4 THEN st."4_points"
      WHEN 5 THEN st."5_points" WHEN 6 THEN st."6_points"
      WHEN 7 THEN st."7_points" WHEN 8 THEN st."8_points" ELSE 0
    END, 0) + CASE WHEN sre.fast_lap THEN COALESCE(st.fast_lap_points, 0) ELSE 0 END,
    'sprint'::text
  FROM sprint_result_entries sre
  JOIN gran_prix gp ON gp.sprint_results_id = sre.sprint_results_id
  LEFT JOIN LATERAL (
    SELECT * FROM session_type
    WHERE name = 'sprint' AND season <= gp.season_id
    ORDER BY season DESC LIMIT 1
  ) st ON true

  UNION ALL

  SELECT qre.pilot_id, gp.season_id,
    COALESCE(CASE qre.position
      WHEN 1 THEN st."1_points" WHEN 2 THEN st."2_points"
      WHEN 3 THEN st."3_points" WHEN 4 THEN st."4_points"
      WHEN 5 THEN st."5_points" WHEN 6 THEN st."6_points"
      WHEN 7 THEN st."7_points" WHEN 8 THEN st."8_points" ELSE 0
    END, 0),
    'qualifying'::text
  FROM qualifying_result_entries qre
  JOIN gran_prix gp ON gp.qualifying_results_id = qre.qualifying_results_id
  LEFT JOIN LATERAL (
    SELECT * FROM session_type
    WHERE name = 'qualifying' AND season <= gp.season_id
    ORDER BY season DESC LIMIT 1
  ) st ON true

  UNION ALL

  SELECT fpre.pilot_id, gp.season_id,
    COALESCE(CASE fpre.position
      WHEN 1 THEN st."1_points" WHEN 2 THEN st."2_points"
      WHEN 3 THEN st."3_points" WHEN 4 THEN st."4_points"
      WHEN 5 THEN st."5_points" WHEN 6 THEN st."6_points"
      WHEN 7 THEN st."7_points" WHEN 8 THEN st."8_points" ELSE 0
    END, 0),
    'free_practice'::text
  FROM free_practice_result_entries fpre
  JOIN gran_prix gp ON gp.free_practice_results_id = fpre.free_practice_results_id
  LEFT JOIN LATERAL (
    SELECT * FROM session_type
    WHERE name = 'free-practice' AND season <= gp.season_id
    ORDER BY season DESC LIMIT 1
  ) st ON true
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
    COALESCE(CASE rre.position WHEN 1 THEN st."1_points" WHEN 2 THEN st."2_points" WHEN 3 THEN st."3_points" WHEN 4 THEN st."4_points" WHEN 5 THEN st."5_points" WHEN 6 THEN st."6_points" WHEN 7 THEN st."7_points" WHEN 8 THEN st."8_points" ELSE 0 END, 0) AS position_points,
    CASE WHEN rre.fast_lap THEN COALESCE(st.fast_lap_points, 0) ELSE 0 END AS fast_lap_points
  FROM gran_prix gp JOIN race_result_entries rre ON rre.race_results_id = gp.race_results_id
  JOIN drivers d ON d.id = rre.pilot_id JOIN tracks t ON t.id = gp.track_id
  JOIN seasons s ON s.id = gp.season_id
  LEFT JOIN LATERAL (SELECT * FROM session_type WHERE name = 'race' AND season <= gp.season_id ORDER BY season DESC LIMIT 1) st ON true

  UNION ALL

  SELECT gp.id, gp.date, t.name, gp.track_id, s.description, gp.season_id,
    d.id, (d.name || ' ' || d.surname), d.username, 'Sprint'::text,
    COALESCE(CASE sre.position WHEN 1 THEN st."1_points" WHEN 2 THEN st."2_points" WHEN 3 THEN st."3_points" WHEN 4 THEN st."4_points" WHEN 5 THEN st."5_points" WHEN 6 THEN st."6_points" WHEN 7 THEN st."7_points" WHEN 8 THEN st."8_points" ELSE 0 END, 0),
    CASE WHEN sre.fast_lap THEN COALESCE(st.fast_lap_points, 0) ELSE 0 END
  FROM gran_prix gp JOIN sprint_result_entries sre ON sre.sprint_results_id = gp.sprint_results_id
  JOIN drivers d ON d.id = sre.pilot_id JOIN tracks t ON t.id = gp.track_id
  JOIN seasons s ON s.id = gp.season_id
  LEFT JOIN LATERAL (SELECT * FROM session_type WHERE name = 'sprint' AND season <= gp.season_id ORDER BY season DESC LIMIT 1) st ON true

  UNION ALL

  SELECT gp.id, gp.date, t.name, gp.track_id, s.description, gp.season_id,
    d.id, (d.name || ' ' || d.surname), d.username, 'Qualifying'::text,
    COALESCE(CASE qre.position WHEN 1 THEN st."1_points" WHEN 2 THEN st."2_points" WHEN 3 THEN st."3_points" WHEN 4 THEN st."4_points" WHEN 5 THEN st."5_points" WHEN 6 THEN st."6_points" WHEN 7 THEN st."7_points" WHEN 8 THEN st."8_points" ELSE 0 END, 0),
    0
  FROM gran_prix gp JOIN qualifying_result_entries qre ON qre.qualifying_results_id = gp.qualifying_results_id
  JOIN drivers d ON d.id = qre.pilot_id JOIN tracks t ON t.id = gp.track_id
  JOIN seasons s ON s.id = gp.season_id
  LEFT JOIN LATERAL (SELECT * FROM session_type WHERE name = 'qualifying' AND season <= gp.season_id ORDER BY season DESC LIMIT 1) st ON true

  UNION ALL

  SELECT gp.id, gp.date, t.name, gp.track_id, s.description, gp.season_id,
    d.id, (d.name || ' ' || d.surname), d.username, 'Free Practice'::text,
    COALESCE(CASE fpre.position WHEN 1 THEN st."1_points" WHEN 2 THEN st."2_points" WHEN 3 THEN st."3_points" WHEN 4 THEN st."4_points" WHEN 5 THEN st."5_points" WHEN 6 THEN st."6_points" WHEN 7 THEN st."7_points" WHEN 8 THEN st."8_points" ELSE 0 END, 0),
    0
  FROM gran_prix gp JOIN free_practice_result_entries fpre ON fpre.free_practice_results_id = gp.free_practice_results_id
  JOIN drivers d ON d.id = fpre.pilot_id JOIN tracks t ON t.id = gp.track_id
  JOIN seasons s ON s.id = gp.season_id
  LEFT JOIN LATERAL (SELECT * FROM session_type WHERE name = 'free-practice' AND season <= gp.season_id ORDER BY season DESC LIMIT 1) st ON true
  WHERE COALESCE((SELECT value FROM property WHERE name = 'free_practice_enabled_season_' || gp.season_id::text LIMIT 1), '1') <> '0'

  UNION ALL

  SELECT gp.id, gp.date, t.name, gp.track_id, s.description, gp.season_id,
    d.id, (d.name || ' ' || d.surname), d.username, 'Full Race'::text,
    COALESCE(CASE frre.position WHEN 1 THEN st."1_points" WHEN 2 THEN st."2_points" WHEN 3 THEN st."3_points" WHEN 4 THEN st."4_points" WHEN 5 THEN st."5_points" WHEN 6 THEN st."6_points" WHEN 7 THEN st."7_points" WHEN 8 THEN st."8_points" ELSE 0 END, 0),
    CASE WHEN frre.fast_lap THEN COALESCE(st.fast_lap_points, 0) ELSE 0 END
  FROM gran_prix gp JOIN full_race_result_entries frre ON frre.race_results_id = gp.full_race_results_id
  JOIN drivers d ON d.id = frre.pilot_id JOIN tracks t ON t.id = gp.track_id
  JOIN seasons s ON s.id = gp.season_id
  LEFT JOIN LATERAL (SELECT * FROM session_type WHERE name = 'full-race' AND season <= gp.season_id ORDER BY season DESC LIMIT 1) st ON true
)
SELECT grand_prix_id, grand_prix_date, track_name, track_id, season_description, season_id,
  pilot_id, pilot_name, pilot_username, SUM(position_points) AS position_points,
  SUM(fast_lap_points) AS fast_lap_points,
  SUM(position_points + fast_lap_points) AS total_points,
  string_agg(session_type || ': ' || (position_points + fast_lap_points)::text, ', ' ORDER BY session_type) AS points_breakdown
FROM session_points
GROUP BY grand_prix_id, grand_prix_date, track_name, track_id, season_description, season_id, pilot_id, pilot_name, pilot_username;

COMMIT;

-- Verify the scoring rules used per season and session:
-- SELECT s.id AS season_id, n.name, st.season AS rules_from_season, st.id AS session_type_id
-- FROM seasons s
-- CROSS JOIN (VALUES ('race'), ('sprint'), ('qualifying'), ('free-practice'), ('full-race')) n(name)
-- LEFT JOIN LATERAL (
--   SELECT * FROM session_type WHERE name = n.name AND season <= s.id ORDER BY season DESC LIMIT 1
-- ) st ON true
-- ORDER BY s.id, n.name;
