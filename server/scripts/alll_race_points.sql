-- public.all_race_points source

CREATE OR REPLACE VIEW public.all_race_points
AS WITH all_race_points AS (
         SELECT rre.race_results_id AS result_id,
            rre.pilot_id AS driver_id,
                CASE rre."position"
                    WHEN 1 THEN st."1_points"
                    WHEN 2 THEN st."2_points"
                    WHEN 3 THEN st."3_points"
                    WHEN 4 THEN st."4_points"
                    WHEN 5 THEN st."5_points"
                    WHEN 6 THEN st."6_points"
                    ELSE 0
                END AS race_point,
                CASE
                    WHEN rre.fast_lap THEN st.fast_lap_points
                    ELSE 0
                END AS fast_lap_point
           FROM race_result_entries rre
             JOIN session_type st ON st.id = 1
        ), all_full_race_points AS (
         SELECT frre.race_results_id AS result_id,
            frre.pilot_id AS driver_id,
                CASE frre."position"
                    WHEN 1 THEN st."1_points"
                    WHEN 2 THEN st."2_points"
                    WHEN 3 THEN st."3_points"
                    WHEN 4 THEN st."4_points"
                    WHEN 5 THEN st."5_points"
                    WHEN 6 THEN st."6_points"
                    ELSE 0
                END AS full_race_point,
                CASE
                    WHEN frre.fast_lap THEN st.fast_lap_points
                    ELSE 0
                END AS fast_lap_point
           FROM full_race_result_entries frre
             JOIN session_type st ON st.id = 5
        ), all_sprint_points AS (
         SELECT sre.sprint_results_id AS result_id,
            sre.pilot_id AS driver_id,
                CASE sre."position"
                    WHEN 1 THEN st."1_points"
                    WHEN 2 THEN st."2_points"
                    WHEN 3 THEN st."3_points"
                    WHEN 4 THEN st."4_points"
                    WHEN 5 THEN st."5_points"
                    WHEN 6 THEN st."6_points"
                    ELSE 0
                END AS sprint_point,
                CASE
                    WHEN sre.fast_lap THEN st.fast_lap_points
                    ELSE 0
                END AS fast_lap_point
           FROM sprint_result_entries sre
             JOIN session_type st ON st.id = 4
        ), all_qualifying_points AS (
         SELECT qre.qualifying_results_id AS result_id,
            qre.pilot_id AS driver_id,
                CASE qre."position"
                    WHEN 1 THEN st."1_points"
                    WHEN 2 THEN st."2_points"
                    WHEN 3 THEN st."3_points"
                    WHEN 4 THEN st."4_points"
                    WHEN 5 THEN st."5_points"
                    WHEN 6 THEN st."6_points"
                    ELSE 0
                END AS qualifying_point,
            0 AS fast_lap_point
           FROM qualifying_result_entries qre
             JOIN session_type st ON st.id = 2
        ), all_free_practice_points AS (
         SELECT fpre.free_practice_results_id AS result_id,
            fpre.pilot_id AS driver_id,
                CASE fpre."position"
                    WHEN 1 THEN st."1_points"
                    WHEN 2 THEN st."2_points"
                    WHEN 3 THEN st."3_points"
                    WHEN 4 THEN st."4_points"
                    WHEN 5 THEN st."5_points"
                    WHEN 6 THEN st."6_points"
                    ELSE 0
                END AS free_practice_point,
            0 AS fast_lap_point
           FROM free_practice_result_entries fpre
             JOIN session_type st ON st.id = 3
        ), all_drivers AS (
         SELECT drivers.id AS driver_id,
            drivers.username AS driver_username,
            drivers.name AS driver_name,
            drivers.surname AS driver_surname,
            drivers.description AS driver_description,
            drivers.license_pt AS driver_license_pt,
            drivers.consistency_pt AS driver_consistency_pt,
            drivers.fast_lap_pt AS driver_fast_lap_pt,
            drivers.dangerous_pt AS drivers_dangerous_pt,
            drivers.ingenuity_pt AS driver_ingenuity_pt,
            drivers.strategy_pt AS driver_strategy_pt,
            drivers.color AS driver_color,
            inner_table_1.pilot_name,
            inner_table_1.pilot_surname,
            inner_table_1.car_name,
            inner_table_1.car_overall_score,
            drivers.season AS season_id
           FROM drivers
             JOIN ( SELECT pilots.id AS pilot_id,
                    pilots.name AS pilot_name,
                    pilots.surname AS pilot_surname,
                    cars.name AS car_name,
                    cars.overall_score AS car_overall_score
                   FROM pilots
                     JOIN cars ON pilots.car_id = cars.id) inner_table_1 ON drivers.pilot_id = inner_table_1.pilot_id
        )
 SELECT all_drivers.driver_id,
    all_drivers.driver_username,
    all_drivers.driver_name,
    all_drivers.driver_surname,
    all_drivers.driver_description,
    all_drivers.driver_license_pt,
    all_drivers.driver_consistency_pt,
    all_drivers.driver_fast_lap_pt,
    all_drivers.drivers_dangerous_pt,
    all_drivers.driver_ingenuity_pt,
    all_drivers.driver_strategy_pt,
    all_drivers.driver_color,
    all_drivers.pilot_name,
    all_drivers.pilot_surname,
    all_drivers.car_name,
    all_drivers.car_overall_score,
    all_drivers.season_id,
    COALESCE(inner_table.total_sprint_points, 0) AS total_sprint_points,
    COALESCE(inner_table.total_free_practice_points, 0) AS total_free_practice_points,
    COALESCE(inner_table.total_qualifying_points, 0) AS total_qualifying_points,
    COALESCE(inner_table.total_full_race_points, 0) AS total_full_race_points,
    COALESCE(inner_table.total_race_points, 0) AS total_race_points,
    COALESCE(inner_table.total_full_race_points, 0) + COALESCE(inner_table.total_free_practice_points, 0) + COALESCE(inner_table.total_qualifying_points, 0) + COALESCE(inner_table.total_sprint_points, 0) + COALESCE(inner_table.total_race_points, 0) AS total_points
   FROM all_drivers
     LEFT JOIN ( SELECT 
                    COALESCE(rp.driver_id, frp.driver_id, sp.driver_id, qp.driver_id, fpp.driver_id) AS driver_id,
                    COALESCE(rp.total_race_points, 0) AS total_race_points,
                    COALESCE(frp.total_full_race_points, 0) AS total_full_race_points,
                    COALESCE(sp.total_sprint_points, 0) AS total_sprint_points,
                    COALESCE(qp.total_qualifying_points, 0) AS total_qualifying_points,
                    COALESCE(fpp.total_free_practice_points, 0) AS total_free_practice_points
                FROM (
                    SELECT driver_id, sum(race_point + fast_lap_point) AS total_race_points
                    FROM all_race_points
                    GROUP BY driver_id
                ) rp
                FULL OUTER JOIN (
                    SELECT driver_id, sum(full_race_point + fast_lap_point) AS total_full_race_points
                    FROM all_full_race_points
                    GROUP BY driver_id
                ) frp ON rp.driver_id = frp.driver_id
                FULL OUTER JOIN (
                    SELECT driver_id, sum(sprint_point + fast_lap_point) AS total_sprint_points
                    FROM all_sprint_points
                    GROUP BY driver_id
                ) sp ON COALESCE(rp.driver_id, frp.driver_id) = sp.driver_id
                FULL OUTER JOIN (
                    SELECT driver_id, sum(qualifying_point) AS total_qualifying_points
                    FROM all_qualifying_points
                    GROUP BY driver_id
                ) qp ON COALESCE(rp.driver_id, frp.driver_id, sp.driver_id) = qp.driver_id
                FULL OUTER JOIN (
                    SELECT driver_id, sum(free_practice_point) AS total_free_practice_points
                    FROM all_free_practice_points
                    GROUP BY driver_id
                ) fpp ON COALESCE(rp.driver_id, frp.driver_id, sp.driver_id, qp.driver_id) = fpp.driver_id
            ) inner_table ON all_drivers.driver_id = inner_table.driver_id
  ORDER BY all_drivers.season_id, (inner_table.total_full_race_points + inner_table.total_free_practice_points + inner_table.total_qualifying_points + inner_table.total_sprint_points + inner_table.total_race_points) DESC;