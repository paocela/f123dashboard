-- public.driver_grand_prix_points source
DROP VIEW IF EXISTS public.season_driver_leaderboard;
DROP VIEW IF EXISTS public.driver_grand_prix_points;

CREATE OR REPLACE VIEW public.driver_grand_prix_points
AS 
WITH session_points AS (
         SELECT gp.id AS grand_prix_id,
            gp.date AS grand_prix_date,
            t.name AS track_name,
            s.description AS season_description,
            s.id AS season_id,
            p.id AS pilot_id,
            (p.name || ' '::text) || p.surname AS pilot_name,
            p.username AS pilot_username,
            'Race'::text AS session_type,
                CASE
                    WHEN rre."position" = 1 THEN ( SELECT session_type."1_points"
                       FROM session_type
                      WHERE session_type.name = 'race'::text)
                    WHEN rre."position" = 2 THEN ( SELECT session_type."2_points"
                       FROM session_type
                      WHERE session_type.name = 'race'::text)
                    WHEN rre."position" = 3 THEN ( SELECT session_type."3_points"
                       FROM session_type
                      WHERE session_type.name = 'race'::text)
                    WHEN rre."position" = 4 THEN ( SELECT session_type."4_points"
                       FROM session_type
                      WHERE session_type.name = 'race'::text)
                    WHEN rre."position" = 5 THEN ( SELECT session_type."5_points"
                       FROM session_type
                      WHERE session_type.name = 'race'::text)
                    WHEN rre."position" = 6 THEN ( SELECT session_type."6_points"
                       FROM session_type
                      WHERE session_type.name = 'race'::text)
                    ELSE 0
                END AS position_points,
                CASE
                    WHEN rre.fast_lap = true THEN ( SELECT session_type.fast_lap_points
                       FROM session_type
                      WHERE session_type.name = 'race'::text)
                    ELSE 0
                END AS fast_lap_points
           FROM gran_prix gp
             JOIN race_result_entries rre ON gp.race_results_id = rre.race_results_id
             JOIN drivers p ON rre.pilot_id = p.id
             JOIN tracks t ON gp.track_id = t.id
             JOIN seasons s ON gp.season_id = s.id
          WHERE gp.race_results_id IS NOT NULL
        UNION ALL
         SELECT gp.id AS grand_prix_id,
            gp.date AS grand_prix_date,
            t.name AS track_name,
            s.description AS season_description,
            s.id AS season_id,
            p.id AS pilot_id,
            (p.name || ' '::text) || p.surname AS pilot_name,
            p.username AS pilot_username,
            'Sprint'::text AS session_type,
                CASE
                    WHEN sre."position" = 1 THEN ( SELECT session_type."1_points"
                       FROM session_type
                      WHERE session_type.name = 'sprint'::text)
                    WHEN sre."position" = 2 THEN ( SELECT session_type."2_points"
                       FROM session_type
                      WHERE session_type.name = 'sprint'::text)
                    WHEN sre."position" = 3 THEN ( SELECT session_type."3_points"
                       FROM session_type
                      WHERE session_type.name = 'sprint'::text)
                    WHEN sre."position" = 4 THEN ( SELECT session_type."4_points"
                       FROM session_type
                      WHERE session_type.name = 'sprint'::text)
                    WHEN sre."position" = 5 THEN ( SELECT session_type."5_points"
                       FROM session_type
                      WHERE session_type.name = 'sprint'::text)
                    WHEN sre."position" = 6 THEN ( SELECT session_type."6_points"
                       FROM session_type
                      WHERE session_type.name = 'sprint'::text)
                    ELSE 0
                END AS position_points,
                CASE
                    WHEN sre.fast_lap = true THEN ( SELECT session_type.fast_lap_points
                       FROM session_type
                      WHERE session_type.name = 'sprint'::text)
                    ELSE 0
                END AS fast_lap_points
           FROM gran_prix gp
             JOIN sprint_result_entries sre ON gp.sprint_results_id = sre.sprint_results_id
             JOIN drivers p ON sre.pilot_id = p.id
             JOIN tracks t ON gp.track_id = t.id
             JOIN seasons s ON gp.season_id = s.id
          WHERE gp.sprint_results_id IS NOT NULL AND gp.has_sprint = 1
        UNION ALL
         SELECT gp.id AS grand_prix_id,
            gp.date AS grand_prix_date,
            t.name AS track_name,
            s.description AS season_description,
            s.id AS season_id,
            p.id AS pilot_id,
            (p.name || ' '::text) || p.surname AS pilot_name,
            p.username AS pilot_username,
            'Qualifying'::text AS session_type,
                CASE
                    WHEN qre."position" = 1 THEN ( SELECT session_type."1_points"
                       FROM session_type
                      WHERE session_type.name = 'qualifying'::text)
                    WHEN qre."position" = 2 THEN ( SELECT session_type."2_points"
                       FROM session_type
                      WHERE session_type.name = 'qualifying'::text)
                    WHEN qre."position" = 3 THEN ( SELECT session_type."3_points"
                       FROM session_type
                      WHERE session_type.name = 'qualifying'::text)
                    WHEN qre."position" = 4 THEN ( SELECT session_type."4_points"
                       FROM session_type
                      WHERE session_type.name = 'qualifying'::text)
                    WHEN qre."position" = 5 THEN ( SELECT session_type."5_points"
                       FROM session_type
                      WHERE session_type.name = 'qualifying'::text)
                    WHEN qre."position" = 6 THEN ( SELECT session_type."6_points"
                       FROM session_type
                      WHERE session_type.name = 'qualifying'::text)
                    ELSE 0
                END AS position_points,
            0 AS fast_lap_points
           FROM gran_prix gp
             JOIN qualifying_result_entries qre ON gp.qualifying_results_id = qre.qualifying_results_id
             JOIN drivers p ON qre.pilot_id = p.id
             JOIN tracks t ON gp.track_id = t.id
             JOIN seasons s ON gp.season_id = s.id
          WHERE gp.qualifying_results_id IS NOT NULL
        UNION ALL
         SELECT gp.id AS grand_prix_id,
            gp.date AS grand_prix_date,
            t.name AS track_name,
            s.description AS season_description,
            s.id AS season_id,
            p.id AS pilot_id,
            (p.name || ' '::text) || p.surname AS pilot_name,
            p.username AS pilot_username,
            'Free Practice'::text AS session_type,
                CASE
                    WHEN fpre."position" = 1 THEN ( SELECT session_type."1_points"
                       FROM session_type
                      WHERE session_type.name = 'free-practice'::text)
                    WHEN fpre."position" = 2 THEN ( SELECT session_type."2_points"
                       FROM session_type
                      WHERE session_type.name = 'free-practice'::text)
                    WHEN fpre."position" = 3 THEN ( SELECT session_type."3_points"
                       FROM session_type
                      WHERE session_type.name = 'free-practice'::text)
                    WHEN fpre."position" = 4 THEN ( SELECT session_type."4_points"
                       FROM session_type
                      WHERE session_type.name = 'free-practice'::text)
                    WHEN fpre."position" = 5 THEN ( SELECT session_type."5_points"
                       FROM session_type
                      WHERE session_type.name = 'free-practice'::text)
                    WHEN fpre."position" = 6 THEN ( SELECT session_type."6_points"
                       FROM session_type
                      WHERE session_type.name = 'free-practice'::text)
                    ELSE 0
                END AS position_points,
            0 AS fast_lap_points
           FROM gran_prix gp
             JOIN free_practice_result_entries fpre ON gp.free_practice_results_id = fpre.free_practice_results_id
             JOIN drivers p ON fpre.pilot_id = p.id
             JOIN tracks t ON gp.track_id = t.id
             JOIN seasons s ON gp.season_id = s.id
          WHERE gp.free_practice_results_id IS NOT NULL
        UNION ALL
         SELECT gp.id AS grand_prix_id,
            gp.date AS grand_prix_date,
            t.name AS track_name,
            s.description AS season_description,
            s.id AS season_id,
            p.id AS pilot_id,
            (p.name || ' '::text) || p.surname AS pilot_name,
            p.username AS pilot_username,
            'Full Race'::text AS session_type,
                CASE
                    WHEN rre."position" = 1 THEN ( SELECT session_type."1_points"
                       FROM session_type
                      WHERE session_type.name = 'full-race'::text)
                    WHEN rre."position" = 2 THEN ( SELECT session_type."2_points"
                       FROM session_type
                      WHERE session_type.name = 'full-race'::text)
                    WHEN rre."position" = 3 THEN ( SELECT session_type."3_points"
                       FROM session_type
                      WHERE session_type.name = 'full-race'::text)
                    WHEN rre."position" = 4 THEN ( SELECT session_type."4_points"
                       FROM session_type
                      WHERE session_type.name = 'full-race'::text)
                    WHEN rre."position" = 5 THEN ( SELECT session_type."5_points"
                       FROM session_type
                      WHERE session_type.name = 'full-race'::text)
                    WHEN rre."position" = 6 THEN ( SELECT session_type."6_points"
                       FROM session_type
                      WHERE session_type.name = 'full-race'::text)
                    ELSE 0
                END AS position_points,
                CASE
                    WHEN rre.fast_lap = true THEN ( SELECT session_type.fast_lap_points
                       FROM session_type
                      WHERE session_type.name = 'full-race'::text)
                    ELSE 0
                END AS fast_lap_points
           FROM gran_prix gp
             JOIN full_race_result_entries rre ON gp.full_race_results_id = rre.race_results_id
             JOIN drivers p ON rre.pilot_id = p.id
             JOIN tracks t ON gp.track_id = t.id
             JOIN seasons s ON gp.season_id = s.id
          WHERE gp.full_race_results_id IS NOT NULL AND gp.has_x2 = 1
        )
 SELECT grand_prix_id,
    grand_prix_date,
    track_name,
    season_description,
    season_id,
    pilot_id,
    pilot_name,
    pilot_username,
    sum(position_points) AS position_points,
    sum(fast_lap_points) AS fast_lap_points,
    sum(position_points + fast_lap_points) AS total_points,
    string_agg((session_type || ': '::text) || ((position_points + fast_lap_points)::text), ', '::text ORDER BY session_type) AS points_breakdown
   FROM session_points
  GROUP BY grand_prix_id, grand_prix_date, track_name, season_description, season_id, pilot_id, pilot_name, pilot_username
  ORDER BY grand_prix_date DESC, (sum(position_points + fast_lap_points)) DESC;

-- public.season_driver_leaderboard source

CREATE OR REPLACE VIEW public.season_driver_leaderboard
AS SELECT season_id,
    pilot_id,
    pilot_username,
    pilot_name,
    sum(total_points) AS total_points
   FROM driver_grand_prix_points
  GROUP BY season_id, pilot_id, pilot_name, pilot_username
  ORDER BY season_id DESC, (sum(total_points)) DESC;