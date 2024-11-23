/*******************************************************/
/* ALL DRIVERS POINTS: RACE, QUALIFYING, FREE-PRACTICE */
/*******************************************************/
/* TODO: add sprint points */
WITH all_race_points AS
(
    SELECT 
        race_results.id,
        race_results."1_place_id" AS driver_id,
        (SELECT "1_points" FROM session_type WHERE session_type.id = 1) as race_point
    FROM race_results

    UNION ALL

    SELECT 
        race_results.id,
        race_results."2_place_id" AS driver_id,
        (SELECT "2_points" FROM session_type WHERE session_type.id = 1) as race_point
    FROM race_results

    UNION ALL

    SELECT 
        race_results.id,
        race_results."3_place_id" AS driver_id,
        (SELECT "3_points" FROM session_type WHERE session_type.id = 1) as race_point
    FROM race_results

    UNION ALL

    SELECT 
        race_results.id,
        race_results."4_place_id" AS driver_id,
        (SELECT "4_points" FROM session_type WHERE session_type.id = 1) as race_point
    FROM race_results

    UNION ALL

    SELECT 
        race_results.id,
        race_results."5_place_id" AS driver_id,
        (SELECT "5_points" FROM session_type WHERE session_type.id = 1) as race_point
    FROM race_results

    UNION ALL

    SELECT 
        race_results.id,
        race_results."fast_lap_id" AS driver_id,
        (SELECT "fast_lap_points" FROM session_type WHERE session_type.id = 1) as race_point
    FROM race_results
), 
all_sprint_points AS
(
    SELECT 
        sprint_results.id,
        sprint_results."1_place_id" AS driver_id,
        (SELECT "1_points" FROM session_type WHERE session_type.id = 4) as sprint_point
    FROM sprint_results

    UNION ALL

    SELECT 
        sprint_results.id,
        sprint_results."2_place_id" AS driver_id,
        (SELECT "2_points" FROM session_type WHERE session_type.id = 4) as sprint_point
    FROM sprint_results

    UNION ALL

    SELECT 
        sprint_results.id,
        sprint_results."3_place_id" AS driver_id,
        (SELECT "3_points" FROM session_type WHERE session_type.id = 4) as sprint_point
    FROM sprint_results

    UNION ALL

    SELECT 
        sprint_results.id,
        sprint_results."4_place_id" AS driver_id,
        (SELECT "4_points" FROM session_type WHERE session_type.id = 4) as sprint_point
    FROM sprint_results

    UNION ALL

    SELECT 
        sprint_results.id,
        sprint_results."5_place_id" AS driver_id,
        (SELECT "5_points" FROM session_type WHERE session_type.id = 4) as sprint_point
    FROM sprint_results

    UNION ALL

    SELECT 
        sprint_results.id,
        sprint_results."fast_lap_id" AS driver_id,
        (SELECT "fast_lap_points" FROM session_type WHERE session_type.id = 4) as sprint_point
    FROM sprint_results
), 
all_qualifying_points AS 
(
    SELECT 
    qualifying_results.id,
    qualifying_results."1_place_id" AS driver_id,
    (SELECT "1_points" FROM session_type WHERE session_type.id = 2) as qualifying_point
    FROM qualifying_results

    UNION ALL

    SELECT 
        qualifying_results.id,
        qualifying_results."2_place_id" AS driver_id,
        (SELECT "2_points" FROM session_type WHERE session_type.id = 2) as qualifying_point
    FROM qualifying_results

    UNION ALL

    SELECT 
        qualifying_results.id,
        qualifying_results."3_place_id" AS driver_id,
        (SELECT "3_points" FROM session_type WHERE session_type.id = 2) as qualifying_point
    FROM qualifying_results

    UNION ALL

    SELECT 
        qualifying_results.id,
        qualifying_results."4_place_id" AS driver_id,
        (SELECT "4_points" FROM session_type WHERE session_type.id = 2) as qualifying_point
    FROM qualifying_results

    UNION ALL

    SELECT 
        qualifying_results.id,
        qualifying_results."5_place_id" AS driver_id,
        (SELECT "5_points" FROM session_type WHERE session_type.id = 2) as qualifying_point
    FROM qualifying_results
), 
all_free_practice_points AS 
(
    SELECT 
    free_practice_results.id,
    free_practice_results."1_place_id" AS driver_id,
    (SELECT "1_points" FROM session_type WHERE session_type.id = 3) as free_practice_point
    FROM free_practice_results

    UNION ALL

    SELECT 
        free_practice_results.id,
        free_practice_results."2_place_id" AS driver_id,
        (SELECT "2_points" FROM session_type WHERE session_type.id = 3) as free_practice_point
    FROM free_practice_results

    UNION ALL

    SELECT 
        free_practice_results.id,
        free_practice_results."3_place_id" AS driver_id,
        (SELECT "3_points" FROM session_type WHERE session_type.id = 3) as free_practice_point
    FROM free_practice_results

    UNION ALL

    SELECT 
        free_practice_results.id,
        free_practice_results."4_place_id" AS driver_id,
        (SELECT "4_points" FROM session_type WHERE session_type.id = 3) as free_practice_point
    FROM free_practice_results

    UNION ALL
    
    SELECT 
        free_practice_results.id,
        free_practice_results."5_place_id" AS driver_id,
        (SELECT "5_points" FROM session_type WHERE session_type.id = 3) as free_practice_point
    FROM free_practice_results
), 
all_drivers
AS
(
    SELECT drivers.id AS driver_id, drivers.username AS driver_username, drivers.name AS driver_name, drivers.surname AS driver_surname, drivers.description as driver_description,
    drivers.consistency_pt AS driver_consistency_pt, drivers.fast_lap_pt AS driver_fast_lap_pt, drivers.dangerous_pt AS drivers_dangerous_pt, drivers.ingenuity_pt AS driver_ingenuity_pt,
    drivers.strategy_pt AS driver_strategy_pt, drivers.avatar AS driver_avatar, drivers.color AS driver_color, inner_table.pilot_name AS pilot_name, inner_table.pilot_surname AS pilot_surname, inner_table.car_name AS car_name,
    inner_table.car_overall_score AS car_overall_score, inner_table.car_logo AS car_logo
    FROM drivers
    INNER JOIN 
    (
        SELECT pilots.id AS pilot_id, pilots.name AS pilot_name, pilots.surname AS pilot_surname, cars.name AS car_name, cars.overall_score AS car_overall_score, cars.logo AS car_logo
        FROM pilots
        INNER JOIN cars
        ON pilots.car_id = cars.id
    ) AS inner_table
    ON drivers.pilot_id = inner_table.pilot_id
)

SELECT *, (inner_table.total_free_practice_points + inner_table.total_qualifying_points + inner_table.total_sprint_points + inner_table.total_race_points) AS total_points
FROM all_drivers
INNER JOIN
(
    SELECT all_free_practice_points.driver_id, SUM(all_free_practice_points.free_practice_point) AS total_free_practice_points, inner_table_1.total_qualifying_points, inner_table_1.total_sprint_points, inner_table_1.total_race_points
    FROM all_free_practice_points
    INNER JOIN
    (
        SELECT all_qualifying_points.driver_id AS driver_id, SUM(all_qualifying_points.qualifying_point) AS total_qualifying_points, inner_table_2.total_sprint_points, inner_table_2.total_race_points
        FROM all_qualifying_points
        INNER JOIN
        (
            SELECT all_sprint_points.driver_id AS driver_id, SUM(all_sprint_points.sprint_point) AS total_sprint_points, inner_table_3.total_race_points
            FROM all_sprint_points
            INNER JOIN
            (
                SELECT all_race_points.driver_id AS driver_id, SUM(all_race_points.race_point) AS total_race_points
                FROM all_race_points
                GROUP BY all_race_points.driver_id
            ) AS inner_table_3
            ON inner_table_3.driver_id = all_sprint_points.driver_id
            GROUP BY all_sprint_points.driver_id, inner_table_3.total_race_points
        ) AS inner_table_2
        ON inner_table_2.driver_id = all_qualifying_points.driver_id
        GROUP BY all_qualifying_points.driver_id, inner_table_2.total_race_points, inner_table_2.total_sprint_points
    ) AS inner_table_1
    ON inner_table_1.driver_id = all_free_practice_points.driver_id
    GROUP BY all_free_practice_points.driver_id, inner_table_1.total_race_points, inner_table_1.total_sprint_points, inner_table_1.total_qualifying_points
) AS inner_table
ON all_drivers.driver_id = inner_table.driver_id
ORDER BY total_points DESC







/******************/
/* ALL GP RESULTS */
/******************/
SELECT inner_table_tracks.name AS track_name, inner_table_tracks.flag AS track_flag,
gran_prix.date as gran_prix_date,
inner_table_race."1_place_username" AS driver_race_1_place, inner_table_race."2_place_username" AS driver_race_2_place, inner_table_race."3_place_username" AS driver_race_3_place, inner_table_race."4_place_username" AS driver_race_4_place, inner_table_race."5_place_username" AS driver_race_5_place, inner_table_race."fast_lap_username" AS driver_race_fast_lap, inner_table_race.race_dnf AS race_dnf,
inner_table_sprint."1_place_username" AS driver_sprint_1_place, inner_table_sprint."2_place_username" AS driver_sprint_2_place, inner_table_sprint."3_place_username" AS driver_sprint_3_place, inner_table_sprint."4_place_username" AS driver_sprint_4_place, inner_table_sprint."5_place_username" AS driver_sprint_5_place, inner_table_sprint."fast_lap_username" AS driver_sprint_fast_lap, inner_table_sprint.sprint_dnf AS sprint_dnf,
inner_table_qualifying."1_place_username" AS driver_qualifying_1_place, inner_table_qualifying."2_place_username" AS driver_qualifying_2_place, inner_table_qualifying."3_place_username" AS driver_qualifying_3_place, inner_table_qualifying."4_place_username" AS driver_qualifying_4_place, inner_table_qualifying."5_place_username" AS driver_qualifying_5_place, 
inner_table_free_practice."1_place_username" AS driver_free_practice_1_place, inner_table_free_practice."2_place_username" AS driver_free_practice_2_place, inner_table_free_practice."3_place_username" AS driver_free_practice_3_place, inner_table_free_practice."4_place_username" AS driver_free_practice_4_place, inner_table_free_practice."5_place_username" AS driver_free_practice_5_place
FROM gran_prix
LEFT JOIN
(
    SELECT first_table.race_id, first_table.race_dnf, first_table."1_place_username", second_table."2_place_username", third_table."3_place_username", fourth_table."4_place_username", fifth_table."5_place_username", fast_lap_table."fast_lap_username"
    FROM
    (
        SELECT race_results.id AS race_id, race_results.dnf AS race_dnf, drivers.username AS "1_place_username"
        FROM race_results
        LEFT JOIN drivers 
        ON race_results."1_place_id" = drivers.id
    ) AS first_table
    INNER JOIN
    (
        SELECT race_results.id AS race_id, drivers.username AS "2_place_username"
        FROM race_results
        LEFT JOIN drivers 
        ON race_results."2_place_id" = drivers.id
    ) AS second_table
    ON first_table.race_id = second_table.race_id
    INNER JOIN
    (
        SELECT race_results.id AS race_id, drivers.username AS "3_place_username"
        FROM race_results
        LEFT JOIN drivers 
        ON race_results."3_place_id" = drivers.id
    ) AS third_table
    ON first_table.race_id = third_table.race_id
    INNER JOIN
    (
        SELECT race_results.id AS race_id, drivers.username AS "4_place_username"
        FROM race_results
        LEFT JOIN drivers 
        ON race_results."4_place_id" = drivers.id
    ) AS fourth_table
    ON first_table.race_id = fourth_table.race_id
    INNER JOIN
    (
        SELECT race_results.id AS race_id, drivers.username AS "5_place_username"
        FROM race_results
        LEFT JOIN drivers 
        ON race_results."5_place_id" = drivers.id
    ) AS fifth_table
    ON first_table.race_id = fifth_table.race_id
    INNER JOIN
    (
        SELECT race_results.id AS race_id, drivers.username AS "fast_lap_username"
        FROM race_results
        LEFT JOIN drivers 
        ON race_results."fast_lap_id" = drivers.id
    ) AS fast_lap_table
    ON first_table.race_id = fast_lap_table.race_id
) AS inner_table_race
ON gran_prix.race_results_id = inner_table_race.race_id
LEFT JOIN
(
    SELECT first_table.sprint_id, first_table.sprint_dnf, first_table."1_place_username", second_table."2_place_username", third_table."3_place_username", fourth_table."4_place_username", fifth_table."5_place_username", fast_lap_table."fast_lap_username"
    FROM
    (
        SELECT sprint_results.id AS sprint_id, sprint_results.dnf AS sprint_dnf, drivers.username AS "1_place_username"
        FROM sprint_results
        LEFT JOIN drivers 
        ON sprint_results."1_place_id" = drivers.id
    ) AS first_table
    INNER JOIN
    (
        SELECT sprint_results.id AS sprint_id, drivers.username AS "2_place_username"
        FROM sprint_results
        LEFT JOIN drivers 
        ON sprint_results."2_place_id" = drivers.id
    ) AS second_table
    ON first_table.sprint_id = second_table.sprint_id
    INNER JOIN
    (
        SELECT sprint_results.id AS sprint_id, drivers.username AS "3_place_username"
        FROM sprint_results
        LEFT JOIN drivers 
        ON sprint_results."3_place_id" = drivers.id
    ) AS third_table
    ON first_table.sprint_id = third_table.sprint_id
    INNER JOIN
    (
        SELECT sprint_results.id AS sprint_id, drivers.username AS "4_place_username"
        FROM sprint_results
        LEFT JOIN drivers 
        ON sprint_results."4_place_id" = drivers.id
    ) AS fourth_table
    ON first_table.sprint_id = fourth_table.sprint_id
    INNER JOIN
    (
        SELECT sprint_results.id AS sprint_id, drivers.username AS "5_place_username"
        FROM sprint_results
        LEFT JOIN drivers 
        ON sprint_results."5_place_id" = drivers.id
    ) AS fifth_table
    ON first_table.sprint_id = fifth_table.sprint_id
    INNER JOIN
    (
        SELECT sprint_results.id AS sprint_id, drivers.username AS "fast_lap_username"
        FROM sprint_results
        LEFT JOIN drivers 
        ON sprint_results."fast_lap_id" = drivers.id
    ) AS fast_lap_table
    ON first_table.sprint_id = fast_lap_table.sprint_id
) AS inner_table_sprint
ON gran_prix.sprint_results_id = inner_table_sprint.sprint_id
LEFT JOIN
(
    SELECT first_table.qualifying_id, first_table."1_place_username", second_table."2_place_username", third_table."3_place_username", fourth_table."4_place_username", fifth_table."5_place_username"
    FROM
    (
        SELECT qualifying_results.id AS qualifying_id, drivers.username AS "1_place_username"
        FROM qualifying_results
        LEFT JOIN drivers 
        ON qualifying_results."1_place_id" = drivers.id
    ) AS first_table
    INNER JOIN
    (
        SELECT qualifying_results.id AS qualifying_id, drivers.username AS "2_place_username"
        FROM qualifying_results
        LEFT JOIN drivers 
        ON qualifying_results."2_place_id" = drivers.id
    ) AS second_table
    ON first_table.qualifying_id = second_table.qualifying_id
    INNER JOIN
    (
        SELECT qualifying_results.id AS qualifying_id, drivers.username AS "3_place_username"
        FROM qualifying_results
        LEFT JOIN drivers 
        ON qualifying_results."3_place_id" = drivers.id
    ) AS third_table
    ON first_table.qualifying_id = third_table.qualifying_id
    INNER JOIN
    (
        SELECT qualifying_results.id AS qualifying_id, drivers.username AS "4_place_username"
        FROM qualifying_results
        LEFT JOIN drivers 
        ON qualifying_results."4_place_id" = drivers.id
    ) AS fourth_table
    ON first_table.qualifying_id = fourth_table.qualifying_id
    INNER JOIN
    (
        SELECT qualifying_results.id AS qualifying_id, drivers.username AS "5_place_username"
        FROM qualifying_results
        LEFT JOIN drivers 
        ON qualifying_results."5_place_id" = drivers.id
    ) AS fifth_table
    ON first_table.qualifying_id = fifth_table.qualifying_id
) AS inner_table_qualifying
ON gran_prix.qualifying_results_id = inner_table_qualifying.qualifying_id
LEFT JOIN
(
    SELECT first_table.free_practice_id, first_table."1_place_username", second_table."2_place_username", third_table."3_place_username", fourth_table."4_place_username", fifth_table."5_place_username"
    FROM
    (
        SELECT free_practice_results.id AS free_practice_id, drivers.username AS "1_place_username"
        FROM free_practice_results
        LEFT JOIN drivers 
        ON free_practice_results."1_place_id" = drivers.id
    ) AS first_table
    INNER JOIN
    (
        SELECT free_practice_results.id AS free_practice_id, drivers.username AS "2_place_username"
        FROM free_practice_results
        LEFT JOIN drivers 
        ON free_practice_results."2_place_id" = drivers.id
    ) AS second_table
    ON first_table.free_practice_id = second_table.free_practice_id
    INNER JOIN
    (
        SELECT free_practice_results.id AS free_practice_id, drivers.username AS "3_place_username"
        FROM free_practice_results
        LEFT JOIN drivers 
        ON free_practice_results."3_place_id" = drivers.id
    ) AS third_table
    ON first_table.free_practice_id = third_table.free_practice_id
    INNER JOIN
    (
        SELECT free_practice_results.id AS free_practice_id, drivers.username AS "4_place_username"
        FROM free_practice_results
        LEFT JOIN drivers 
        ON free_practice_results."4_place_id" = drivers.id
    ) AS fourth_table
    ON first_table.free_practice_id = fourth_table.free_practice_id
    INNER JOIN
    (
        SELECT free_practice_results.id AS free_practice_id, drivers.username AS "5_place_username"
        FROM free_practice_results
        LEFT JOIN drivers 
        ON free_practice_results."5_place_id" = drivers.id
    ) AS fifth_table
    ON first_table.free_practice_id = fifth_table.free_practice_id
) AS inner_table_free_practice
ON gran_prix.free_practice_results_id = inner_table_free_practice.free_practice_id
LEFT JOIN
(
    SELECT *
    FROM tracks
) AS inner_table_tracks
ON gran_prix.track_id = inner_table_tracks.id







/**********************/
/* CHAMPIONSHIP TREND */
/**********************/
WITH all_race_points AS
(
    SELECT outer_table.date, outer_table.track_name, outer_table.id, outer_table.driver_id, outer_table.race_point, 
    drivers.username AS driver_username, drivers.color AS driver_color
    FROM drivers
    RIGHT JOIN
    (
        SELECT gran_prix.date, gran_prix.track_name, inner_table.id, inner_table.driver_id, inner_table.race_point
        FROM 
        (
            SELECT *, track_table.name AS track_name
            FROM gran_prix
            LEFT JOIN
            (
                SELECT *
                FROM tracks
            ) AS track_table
            ON gran_prix.track_id = track_table.id
        ) AS gran_prix
        RIGHT JOIN
        (
            SELECT 
            race_results.id,
            race_results."1_place_id" AS driver_id,
            (SELECT "1_points" FROM session_type WHERE session_type.id = 1) as race_point
            FROM race_results

            UNION ALL

            SELECT 
                race_results.id,
                race_results."2_place_id" AS driver_id,
                (SELECT "2_points" FROM session_type WHERE session_type.id = 1) as race_point
            FROM race_results

            UNION ALL

            SELECT 
                race_results.id,
                race_results."3_place_id" AS driver_id,
                (SELECT "3_points" FROM session_type WHERE session_type.id = 1) as race_point
            FROM race_results

            UNION ALL

            SELECT 
                race_results.id,
                race_results."4_place_id" AS driver_id,
                (SELECT "4_points" FROM session_type WHERE session_type.id = 1) as race_point
            FROM race_results

            UNION ALL

            SELECT 
                race_results.id,
                race_results."5_place_id" AS driver_id,
                (SELECT "5_points" FROM session_type WHERE session_type.id = 1) as race_point
            FROM race_results

            UNION ALL

            SELECT 
                race_results.id,
                race_results."fast_lap_id" AS driver_id,
                (SELECT "fast_lap_points" FROM session_type WHERE session_type.id = 1) as race_point
            FROM race_results
        ) AS inner_table
        ON gran_prix.race_results_id = inner_table.id
    ) AS outer_table
    ON drivers.id = outer_table.driver_id
), 
all_sprint_points AS
(
    SELECT outer_table.date, outer_table.track_name, outer_table.id, outer_table.driver_id, outer_table.sprint_point,
    drivers.username AS driver_username, drivers.color AS driver_color
    FROM drivers
    RIGHT JOIN
    (
        SELECT gran_prix.date, gran_prix.track_name, inner_table.id, inner_table.driver_id, inner_table.sprint_point
        FROM 
        (
            SELECT *, track_table.name AS track_name
            FROM gran_prix
            LEFT JOIN
            (
                SELECT *
                FROM tracks
            ) AS track_table
            ON gran_prix.track_id = track_table.id
        ) AS gran_prix
        RIGHT JOIN
        (
            SELECT 
            sprint_results.id,
            sprint_results."1_place_id" AS driver_id,
            (SELECT "1_points" FROM session_type WHERE session_type.id = 4) as sprint_point
            FROM sprint_results

            UNION ALL

            SELECT 
                sprint_results.id,
                sprint_results."2_place_id" AS driver_id,
                (SELECT "2_points" FROM session_type WHERE session_type.id = 4) as sprint_point
            FROM sprint_results

            UNION ALL

            SELECT 
                sprint_results.id,
                sprint_results."3_place_id" AS driver_id,
                (SELECT "3_points" FROM session_type WHERE session_type.id = 4) as sprint_point
            FROM sprint_results

            UNION ALL

            SELECT 
                sprint_results.id,
                sprint_results."4_place_id" AS driver_id,
                (SELECT "4_points" FROM session_type WHERE session_type.id = 4) as sprint_point
            FROM sprint_results

            UNION ALL

            SELECT 
                sprint_results.id,
                sprint_results."5_place_id" AS driver_id,
                (SELECT "5_points" FROM session_type WHERE session_type.id = 4) as sprint_point
            FROM sprint_results

            UNION ALL

            SELECT 
                sprint_results.id,
                sprint_results."fast_lap_id" AS driver_id,
                (SELECT "fast_lap_points" FROM session_type WHERE session_type.id = 4) as sprint_point
            FROM sprint_results
        ) AS inner_table
        ON gran_prix.sprint_results_id = inner_table.id
    ) AS outer_table
    ON drivers.id = outer_table.driver_id
), 
all_qualifying_points AS 
(
    SELECT outer_table.date, outer_table.track_name, outer_table.id, outer_table.driver_id, outer_table.qualifying_point, 
    drivers.username AS driver_username, drivers.color AS driver_color
    FROM drivers
    RIGHT JOIN
    (
        SELECT gran_prix.date, gran_prix.track_name, inner_table.id, inner_table.driver_id, inner_table.qualifying_point
        FROM 
        (
            SELECT *, track_table.name AS track_name
            FROM gran_prix
            LEFT JOIN
            (
                SELECT *
                FROM tracks
            ) AS track_table
            ON gran_prix.track_id = track_table.id
        ) AS gran_prix
        RIGHT JOIN
        (
            SELECT 
            qualifying_results.id,
            qualifying_results."1_place_id" AS driver_id,
            (SELECT "1_points" FROM session_type WHERE session_type.id = 2) as qualifying_point
            FROM qualifying_results

            UNION ALL

            SELECT 
                qualifying_results.id,
                qualifying_results."2_place_id" AS driver_id,
                (SELECT "2_points" FROM session_type WHERE session_type.id = 2) as qualifying_point
            FROM qualifying_results

            UNION ALL

            SELECT 
                qualifying_results.id,
                qualifying_results."3_place_id" AS driver_id,
                (SELECT "3_points" FROM session_type WHERE session_type.id = 2) as qualifying_point
            FROM qualifying_results

            UNION ALL

            SELECT 
                qualifying_results.id,
                qualifying_results."4_place_id" AS driver_id,
                (SELECT "4_points" FROM session_type WHERE session_type.id = 2) as qualifying_point
            FROM qualifying_results

            UNION ALL

            SELECT 
                qualifying_results.id,
                qualifying_results."5_place_id" AS driver_id,
                (SELECT "5_points" FROM session_type WHERE session_type.id = 2) as qualifying_point
            FROM qualifying_results
        ) AS inner_table
        ON gran_prix.qualifying_results_id = inner_table.id
    ) AS outer_table
    ON drivers.id = outer_table.driver_id
), 
all_free_practice_points AS 
(
    SELECT outer_table.date, outer_table.track_name, outer_table.id, outer_table.driver_id, outer_table.free_practice_point, 
    drivers.username AS driver_username, drivers.color AS driver_color
    FROM drivers
    RIGHT JOIN
    (
        SELECT gran_prix.date, gran_prix.track_name, inner_table.id, inner_table.driver_id, inner_table.free_practice_point
        FROM 
        (
            SELECT *, track_table.name AS track_name
            FROM gran_prix
            LEFT JOIN
            (
                SELECT *
                FROM tracks
            ) AS track_table
            ON gran_prix.track_id = track_table.id
        ) AS gran_prix
        RIGHT JOIN
        (
            SELECT 
            free_practice_results.id,
            free_practice_results."1_place_id" AS driver_id,
            (SELECT "1_points" FROM session_type WHERE session_type.id = 3) as free_practice_point
            FROM free_practice_results

            UNION ALL

            SELECT 
                free_practice_results.id,
                free_practice_results."2_place_id" AS driver_id,
                (SELECT "2_points" FROM session_type WHERE session_type.id = 3) as free_practice_point
            FROM free_practice_results

            UNION ALL

            SELECT 
                free_practice_results.id,
                free_practice_results."3_place_id" AS driver_id,
                (SELECT "3_points" FROM session_type WHERE session_type.id = 3) as free_practice_point
            FROM free_practice_results

            UNION ALL

            SELECT 
                free_practice_results.id,
                free_practice_results."4_place_id" AS driver_id,
                (SELECT "4_points" FROM session_type WHERE session_type.id = 3) as free_practice_point
            FROM free_practice_results

            UNION ALL
            
            SELECT 
                free_practice_results.id,
                free_practice_results."5_place_id" AS driver_id,
                (SELECT "5_points" FROM session_type WHERE session_type.id = 3) as free_practice_point
            FROM free_practice_results
        ) AS inner_table
        ON gran_prix.free_practice_results_id = inner_table.id
    ) AS outer_table
    ON drivers.id = outer_table.driver_id
)

SELECT *
FROM
(
    SELECT date, track_name, driver_id, driver_username, driver_color, SUM(session_point) OVER (ORDER BY date) AS cumulative_points
    FROM
    (
        SELECT date, track_name, driver_id, driver_username, driver_color, race_point AS session_point
        FROM all_race_points

        UNION ALL 

        SELECT date, track_name, driver_id, driver_username, driver_color, sprint_point AS session_point
        FROM all_sprint_points

        UNION ALL

        SELECT date, track_name, driver_id, driver_username, driver_color, qualifying_point AS session_point
        FROM all_qualifying_points

        UNION ALL

        SELECT date, track_name, driver_id, driver_username, driver_color, free_practice_point AS session_point
        FROM all_free_practice_points
    )
    WHERE driver_id = 1
)
GROUP BY date, track_name, driver_id, driver_username, driver_color, cumulative_points

UNION ALL

SELECT *
FROM
(
    SELECT date, track_name, driver_id, driver_username, driver_color, SUM(session_point) OVER (ORDER BY date) AS cumulative_points
    FROM
    (
        SELECT date, track_name, driver_id, driver_username, driver_color, race_point AS session_point
        FROM all_race_points

        UNION ALL 

        SELECT date, track_name, driver_id, driver_username, driver_color, sprint_point AS session_point
        FROM all_sprint_points

        UNION ALL

        SELECT date, track_name, driver_id, driver_username, driver_color, qualifying_point AS session_point
        FROM all_qualifying_points

        UNION ALL

        SELECT date, track_name, driver_id, driver_username, driver_color, free_practice_point AS session_point
        FROM all_free_practice_points
    )
    WHERE driver_id = 2
)
GROUP BY date, track_name, driver_id, driver_username, driver_color, cumulative_points

UNION ALL

SELECT *
FROM
(
    SELECT date, track_name, driver_id, driver_username, driver_color, SUM(session_point) OVER (ORDER BY date) AS cumulative_points
    FROM
    (
        SELECT date, track_name, driver_id, driver_username, driver_color, race_point AS session_point
        FROM all_race_points

        UNION ALL 

        SELECT date, track_name, driver_id, driver_username, driver_color, sprint_point AS session_point
        FROM all_sprint_points

        UNION ALL

        SELECT date, track_name, driver_id, driver_username, driver_color, qualifying_point AS session_point
        FROM all_qualifying_points

        UNION ALL

        SELECT date, track_name, driver_id, driver_username, driver_color, free_practice_point AS session_point
        FROM all_free_practice_points
    )
    WHERE driver_id = 3
)
GROUP BY date, track_name, driver_id, driver_username, driver_color, cumulative_points

UNION ALL

SELECT *
FROM
(
    SELECT date, track_name, driver_id, driver_username, driver_color, SUM(session_point) OVER (ORDER BY date) AS cumulative_points
    FROM
    (
        SELECT date, track_name, driver_id, driver_username, driver_color, race_point AS session_point
        FROM all_race_points

        UNION ALL 

        SELECT date, track_name, driver_id, driver_username, driver_color, sprint_point AS session_point
        FROM all_sprint_points

        UNION ALL

        SELECT date, track_name, driver_id, driver_username, driver_color, qualifying_point AS session_point
        FROM all_qualifying_points

        UNION ALL

        SELECT date, track_name, driver_id, driver_username, driver_color, free_practice_point AS session_point
        FROM all_free_practice_points
    )
    WHERE driver_id = 4
)
GROUP BY date, track_name, driver_id, driver_username, driver_color, cumulative_points

UNION ALL

SELECT *
FROM
(
    SELECT date, track_name, driver_id, driver_username, driver_color, SUM(session_point) OVER (ORDER BY date) AS cumulative_points
    FROM
    (
        SELECT date, track_name, driver_id, driver_username, driver_color, race_point AS session_point
        FROM all_race_points

        UNION ALL 

        SELECT date, track_name, driver_id, driver_username, driver_color, sprint_point AS session_point
        FROM all_sprint_points

        UNION ALL

        SELECT date, track_name, driver_id, driver_username, driver_color, qualifying_point AS session_point
        FROM all_qualifying_points

        UNION ALL

        SELECT date, track_name, driver_id, driver_username, driver_color, free_practice_point AS session_point
        FROM all_free_practice_points
    )
    WHERE driver_id = 5
)
GROUP BY date, track_name, driver_id, driver_username, driver_color, cumulative_points