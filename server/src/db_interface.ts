import express, { Application, Request, Response } from 'express';
import { GenezioDeploy } from "@genezio/types";
import pg from "pg";
import fs from "fs";
const { Pool } = pg;
// const { FileSystem } = fs;

//const app: Application = express();
//const port: number = 3000;
//
//app.get('/', (req: Request, res: Response) => {
//  res.send('Hello, World!');
//  const server: PostgresService = new PostgresService();
//  server.insertUser("test");
//});
//
//app.listen(port, () => {
//  console.log(`Server is running on http://localhost:${port}`);
//});



@GenezioDeploy()
export class PostgresService {
  pool = new Pool({
    connectionString: "postgresql://admin:V7DcRKrlmZ0X@ep-silent-sunset-a2kwh1f2-pooler.eu-central-1.aws.neon.tech/raceforfederica-db?sslmode=require",
    ssl: true,
  });


/****************************************************************/
//richieste dati con query dal backend 
/****************************************************************/

// 1) restituisce tutti i dati legati al pilota 
    async getAllDrivers(): Promise<string> {
        const result = await this.pool.query(`
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
        race_results."6_place_id" AS driver_id,
        (SELECT "6_points" FROM session_type WHERE session_type.id = 1) as race_point
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
        sprint_results."6_place_id" AS driver_id,
        (SELECT "6_points" FROM session_type WHERE session_type.id = 4) as sprint_point
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

    UNION ALL

    SELECT
        qualifying_results.id,
        qualifying_results."6_place_id" AS driver_id,
        (SELECT "6_points" FROM session_type WHERE session_type.id = 2) as qualifying_point
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

    UNION ALL

    SELECT
        free_practice_results.id,
        free_practice_results."6_place_id" AS driver_id,
        (SELECT "6_points" FROM session_type WHERE session_type.id = 3) as free_practice_point
    FROM free_practice_results
),
all_drivers
AS
(
    SELECT drivers.id AS driver_id, drivers.username AS driver_username, drivers.name AS driver_name, drivers.surname AS driver_surname, drivers.description as driver_description,
    drivers.consistency_pt AS driver_consistency_pt, drivers.fast_lap_pt AS driver_fast_lap_pt, drivers.dangerous_pt AS drivers_dangerous_pt, drivers.ingenuity_pt AS driver_ingenuity_pt,
    drivers.strategy_pt AS driver_strategy_pt, drivers.color AS driver_color, inner_table.pilot_name AS pilot_name, inner_table.pilot_surname AS pilot_surname, inner_table.car_name AS car_name,
    inner_table.car_overall_score AS car_overall_score
    FROM drivers
    INNER JOIN
    (
        SELECT pilots.id AS pilot_id, pilots.name AS pilot_name, pilots.surname AS pilot_surname, cars.name AS car_name, cars.overall_score AS car_overall_score
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
    SELECT all_free_practice_points.driver_id, SUM(all_free_practice_points.free_practice_point) AS total_free_practice_points, COALESCE(inner_table_1.total_qualifying_points,0) AS total_qualifying_points, inner_table_1.total_sprint_points, inner_table_1.total_race_points
    FROM all_free_practice_points
    LEFT JOIN
    (
        SELECT all_qualifying_points.driver_id AS driver_id, SUM(all_qualifying_points.qualifying_point) AS total_qualifying_points, COALESCE(inner_table_2.total_sprint_points,0) AS total_sprint_points, COALESCE(inner_table_2.total_race_points,0) AS total_race_points
        FROM all_qualifying_points
        LEFT JOIN
        (
            SELECT all_race_points.driver_id AS driver_id, SUM(all_race_points.race_point) AS total_race_points, COALESCE(inner_table_3.total_sprint_points,0) AS total_sprint_points
            FROM all_race_points
            LEFT JOIN
            (
                SELECT all_sprint_points.driver_id AS driver_id, SUM(all_sprint_points.sprint_point) AS total_sprint_points
                FROM all_sprint_points
                GROUP BY all_sprint_points.driver_id
            ) AS inner_table_3
            ON inner_table_3.driver_id = all_race_points.driver_id
            GROUP BY all_race_points.driver_id, inner_table_3.total_sprint_points
        ) AS inner_table_2
        ON inner_table_2.driver_id = all_qualifying_points.driver_id
        GROUP BY all_qualifying_points.driver_id, inner_table_2.total_race_points, inner_table_2.total_sprint_points
    ) AS inner_table_1
    ON inner_table_1.driver_id = all_free_practice_points.driver_id
    GROUP BY all_free_practice_points.driver_id, inner_table_1.total_race_points, inner_table_1.total_sprint_points, inner_table_1.total_qualifying_points
) AS inner_table
ON all_drivers.driver_id = inner_table.driver_id
ORDER BY total_points DESC

        `);
        return JSON.stringify(result.rows);
    }

  /* All tracks and standings (for Championship page) */
  async getChampionship(): Promise<string> {
    const result = await this.pool.query(`
SELECT inner_table_tracks.name AS track_name, gran_prix.date AS gran_prix_date, gran_prix.has_sprint AS gran_prix_has_sprint, inner_table_tracks.country AS track_country,
inner_table_race."1_place_username" AS driver_race_1_place, inner_table_race."2_place_username" AS driver_race_2_place, inner_table_race."3_place_username" AS driver_race_3_place, inner_table_race."4_place_username" AS driver_race_4_place, inner_table_race."5_place_username" AS driver_race_5_place, inner_table_race."6_place_username" AS driver_race_6_place, inner_table_race."fast_lap_username" AS driver_race_fast_lap, inner_table_race.race_dnf AS race_dnf,
inner_table_sprint."1_place_username" AS driver_sprint_1_place, inner_table_sprint."2_place_username" AS driver_sprint_2_place, inner_table_sprint."3_place_username" AS driver_sprint_3_place, inner_table_sprint."4_place_username" AS driver_sprint_4_place, inner_table_sprint."5_place_username" AS driver_sprint_5_place, inner_table_sprint."6_place_username" AS driver_sprint_6_place, inner_table_sprint."fast_lap_username" AS driver_sprint_fast_lap, inner_table_sprint.sprint_dnf AS sprint_dnf,
inner_table_qualifying."1_place_username" AS driver_qualifying_1_place, inner_table_qualifying."2_place_username" AS driver_qualifying_2_place, inner_table_qualifying."3_place_username" AS driver_qualifying_3_place, inner_table_qualifying."4_place_username" AS driver_qualifying_4_place, inner_table_qualifying."5_place_username" AS driver_qualifying_5_place, inner_table_qualifying."6_place_username" AS driver_qualifying_6_place,
inner_table_free_practice."1_place_username" AS driver_free_practice_1_place, inner_table_free_practice."2_place_username" AS driver_free_practice_2_place, inner_table_free_practice."3_place_username" AS driver_free_practice_3_place, inner_table_free_practice."4_place_username" AS driver_free_practice_4_place, inner_table_free_practice."5_place_username" AS driver_free_practice_5_place, inner_table_free_practice."6_place_username" AS driver_free_practice_6_place
FROM gran_prix
LEFT JOIN
(
    SELECT first_table.race_id, first_table.race_dnf, first_table."1_place_username", second_table."2_place_username", third_table."3_place_username", fourth_table."4_place_username", fifth_table."5_place_username", sixth_table."6_place_username", fast_lap_table."fast_lap_username"
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
        SELECT race_results.id AS race_id, drivers.username AS "6_place_username"
        FROM race_results
        LEFT JOIN drivers 
        ON race_results."6_place_id" = drivers.id
    ) AS sixth_table
    ON first_table.race_id = sixth_table.race_id
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
    SELECT first_table.sprint_id, first_table.sprint_dnf, first_table."1_place_username", second_table."2_place_username", third_table."3_place_username", fourth_table."4_place_username", fifth_table."5_place_username", sixth_table."6_place_username", fast_lap_table."fast_lap_username"
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
        SELECT sprint_results.id AS sprint_id, drivers.username AS "6_place_username"
        FROM sprint_results
        LEFT JOIN drivers 
        ON sprint_results."6_place_id" = drivers.id
    ) AS sixth_table
    ON first_table.sprint_id = sixth_table.sprint_id
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
    SELECT first_table.qualifying_id, first_table."1_place_username", second_table."2_place_username", third_table."3_place_username", fourth_table."4_place_username", fifth_table."5_place_username", sixth_table."6_place_username"
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
    INNER JOIN
    (
        SELECT qualifying_results.id AS qualifying_id, drivers.username AS "6_place_username"
        FROM qualifying_results
        LEFT JOIN drivers 
        ON qualifying_results."6_place_id" = drivers.id
    ) AS sixth_table
    ON first_table.qualifying_id = sixth_table.qualifying_id
) AS inner_table_qualifying
ON gran_prix.qualifying_results_id = inner_table_qualifying.qualifying_id
LEFT JOIN
(
    SELECT first_table.free_practice_id, first_table."1_place_username", second_table."2_place_username", third_table."3_place_username", fourth_table."4_place_username", fifth_table."5_place_username", sixth_table."6_place_username"
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
    INNER JOIN
    (
        SELECT free_practice_results.id AS free_practice_id, drivers.username AS "6_place_username"
        FROM free_practice_results
        LEFT JOIN drivers 
        ON free_practice_results."6_place_id" = drivers.id
    ) AS sixth_table
    ON first_table.free_practice_id = sixth_table.free_practice_id
) AS inner_table_free_practice
ON gran_prix.free_practice_results_id = inner_table_free_practice.free_practice_id
LEFT JOIN
(
    SELECT *
    FROM tracks
) AS inner_table_tracks
ON gran_prix.track_id = inner_table_tracks.id
ORDER BY gran_prix.date ASC
      `);
    return JSON.stringify(result.rows);
  }

  /* All driver championship's cumulative points (for trend graph)*/
  async getCumulativePoints(): Promise<string> {
    const result = await this.pool.query(`
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
                race_results."6_place_id" AS driver_id,
                (SELECT "6_points" FROM session_type WHERE session_type.id = 1) as race_point
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
                sprint_results."6_place_id" AS driver_id,
                (SELECT "6_points" FROM session_type WHERE session_type.id = 4) as sprint_point
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

            UNION ALL

            SELECT 
                qualifying_results.id,
                qualifying_results."6_place_id" AS driver_id,
                (SELECT "6_points" FROM session_type WHERE session_type.id = 2) as qualifying_point
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

            UNION ALL
            
            SELECT 
                free_practice_results.id,
                free_practice_results."6_place_id" AS driver_id,
                (SELECT "6_points" FROM session_type WHERE session_type.id = 3) as free_practice_point
            FROM free_practice_results
        ) AS inner_table
        ON gran_prix.free_practice_results_id = inner_table.id
    ) AS outer_table
    ON drivers.id = outer_table.driver_id
)

SELECT *
FROM
(
    SELECT date, track_name, driver_id, driver_username, driver_color, SUM(session_point) OVER (ORDER BY date, track_name) AS cumulative_points
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
    SELECT date, track_name, driver_id, driver_username, driver_color, SUM(session_point) OVER (ORDER BY date, track_name) AS cumulative_points
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
    SELECT date, track_name, driver_id, driver_username, driver_color, SUM(session_point) OVER (ORDER BY date, track_name) AS cumulative_points
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
    SELECT date, track_name, driver_id, driver_username, driver_color, SUM(session_point) OVER (ORDER BY date, track_name) AS cumulative_points
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
    SELECT date, track_name, driver_id, driver_username, driver_color, SUM(session_point) OVER (ORDER BY date, track_name) AS cumulative_points
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

UNION ALL

SELECT *
FROM
(
    SELECT date, track_name, driver_id, driver_username, driver_color, SUM(session_point) OVER (ORDER BY date, track_name) AS cumulative_points
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
    WHERE driver_id = 6
)
GROUP BY date, track_name, driver_id, driver_username, driver_color, cumulative_points
      `);
    return JSON.stringify(result.rows);
  }

  /* All championship tracks with best time info */
  async getAllTracks(): Promise<string> {
    const result = await this.pool.query (`
SELECT outer_table_tracks.track_id, outer_table_tracks.name, outer_table_tracks.date, outer_table_tracks.has_sprint, outer_table_tracks.country, outer_table_tracks.besttime_driver_time,
outer_table_drivers.username
FROM
(
    SELECT *
    FROM tracks
    LEFT JOIN
    (
        SELECT *
        FROM gran_prix
    ) AS inner_table
    ON tracks.id = inner_table.track_id
) AS outer_table_tracks
LEFT JOIN
(
    SELECT *
    FROM drivers
) AS outer_table_drivers
ON outer_table_tracks.besttime_driver_id = outer_table_drivers.id
ORDER BY date ASC
    `);
    return JSON.stringify(result.rows);
  }


  /* All fanta participants with gp picks */
  async getAllFanta(): Promise<string> {
    const result = await this.pool.query (`
WITH all_session_points AS
(
    SELECT inner_table_tracks.name AS track_name, gran_prix.date as gran_prix_date, inner_table_tracks.country AS track_country,
    inner_table_race."race_id" AS race_id, inner_table_race."1_place_id" AS driver_race_1_place, inner_table_race."2_place_id" AS driver_race_2_place, inner_table_race."3_place_id" AS driver_race_3_place, inner_table_race."4_place_id" AS driver_race_4_place, inner_table_race."5_place_id" AS driver_race_5_place, inner_table_race."6_place_id" AS driver_race_6_place, inner_table_race."fast_lap_id" AS driver_race_fast_lap
    FROM gran_prix
    LEFT JOIN
    (
        SELECT first_table.race_id, first_table.race_dnf, first_table."1_place_id", second_table."2_place_id", third_table."3_place_id", fourth_table."4_place_id", fifth_table."5_place_id", sixth_table."6_place_id", fast_lap_table."fast_lap_id"
        FROM
        (
            SELECT race_results.id AS race_id, race_results.dnf AS race_dnf, drivers.id AS "1_place_id"
            FROM race_results
            LEFT JOIN drivers 
            ON race_results."1_place_id" = drivers.id
        ) AS first_table
        INNER JOIN
        (
            SELECT race_results.id AS race_id, drivers.id AS "2_place_id"
            FROM race_results
            LEFT JOIN drivers 
            ON race_results."2_place_id" = drivers.id
        ) AS second_table
        ON first_table.race_id = second_table.race_id
        INNER JOIN
        (
            SELECT race_results.id AS race_id, drivers.id AS "3_place_id"
            FROM race_results
            LEFT JOIN drivers 
            ON race_results."3_place_id" = drivers.id
        ) AS third_table
        ON first_table.race_id = third_table.race_id
        INNER JOIN
        (
            SELECT race_results.id AS race_id, drivers.id AS "4_place_id"
            FROM race_results
            LEFT JOIN drivers 
            ON race_results."4_place_id" = drivers.id
        ) AS fourth_table
        ON first_table.race_id = fourth_table.race_id
        INNER JOIN
        (
            SELECT race_results.id AS race_id, drivers.id AS "5_place_id"
            FROM race_results
            LEFT JOIN drivers 
            ON race_results."5_place_id" = drivers.id
        ) AS fifth_table
        ON first_table.race_id = fifth_table.race_id
        INNER JOIN
        (
            SELECT race_results.id AS race_id, drivers.id AS "6_place_id"
            FROM race_results
            LEFT JOIN drivers 
            ON race_results."6_place_id" = drivers.id
        ) AS sixth_table
        ON first_table.race_id = sixth_table.race_id
        INNER JOIN
        (
            SELECT race_results.id AS race_id, drivers.id AS "fast_lap_id"
            FROM race_results
            LEFT JOIN drivers 
            ON race_results."fast_lap_id" = drivers.id
        ) AS fast_lap_table
        ON first_table.race_id = fast_lap_table.race_id
    ) AS inner_table_race
    ON gran_prix.race_results_id = inner_table_race.race_id
    LEFT JOIN
    (
        SELECT *
        FROM tracks
    ) AS inner_table_tracks
    ON gran_prix.track_id = inner_table_tracks.id
),
all_fanta_picks AS
(
    SELECT *
    FROM fanta
    LEFT JOIN
    (
        SELECT *
        FROM fanta_player
    ) AS inner_table
    ON fanta.fanta_player_id = inner_table.id
)

SELECT track_name, driver_race_1_place, driver_race_2_place, driver_race_3_place, driver_race_4_place, driver_race_5_place, driver_race_6_place, driver_race_fast_lap, 
fanta_player_id, "1_place_pick", "2_place_pick", "3_place_pick", "4_place_pick", "5_place_pick", "6_place_pick", fast_lap_pick, username, name, surname
FROM all_session_points
LEFT JOIN
(
    SELECT race_id, fanta_player_id, 
    "1_place_id" AS "1_place_pick",
    "2_place_id" AS "2_place_pick",
    "3_place_id" AS "3_place_pick",
    "4_place_id" AS "4_place_pick",
    "5_place_id" AS "5_place_pick",
    "6_place_id" AS "6_place_pick", 
    fast_lap_id AS "fast_lap_pick",
    username, name, surname
    FROM all_fanta_picks
) AS inner_table
ON all_session_points.race_id = inner_table.race_id
    `);
    return JSON.stringify(result.rows);
  }

    /* All fanta vote */
    async getFantaVote(): Promise<string> {
        const result = await this.pool.query (`
SELECT
    fp_table.id AS fanta_player_id,
    f_table.race_id AS track_id,
    fp_table.username AS username,
    f_table."1_place_id" AS "id_1_place",
    f_table."2_place_id" AS "id_2_place",
    f_table."3_place_id" AS "id_3_place",
    f_table."4_place_id" AS "id_4_place",
    f_table."5_place_id" AS "id_5_place",
    f_table."6_place_id" AS "id_6_place",
    f_table."fast_lap_id" AS "id_fast_lap"
FROM fanta_player fp_table
JOIN fanta f_table
ON fp_table.id = f_table.fanta_player_id
ORDER BY fp_table.id, f_table.race_id;
        `);
        return JSON.stringify(result.rows);
    }

    async getRaceResoult(): Promise<string> {
        const result = await this.pool.query (`
SELECT 
    inner_table.id AS track_id,
    "1_place_id" AS "id_1_place",
    "2_place_id" AS "id_2_place",
    "3_place_id" AS "id_3_place",
    "4_place_id" AS "id_4_place",
    "5_place_id" AS "id_5_place",
    "6_place_id" AS "id_6_place",
    "fast_lap_id" AS "id_fast_lap"
FROM race_results
LEFT JOIN 
(
    SELECT id, race_results_id, track_id
    FROM gran_prix
) AS inner_table
ON race_results.id = inner_table.race_results_id
WHERE session_type_id = 1
        `);
        return JSON.stringify(result.rows);
    }

    async getUsers(): Promise<string> {
        const result = await this.pool.query (`
SELECT id, username, name, surname, password
FROM fanta_player;
        `);
        return JSON.stringify(result.rows);
    }

    async setFantaVoto(voto: any): Promise<void> {
        const result = await this.pool.query(`
INSERT INTO "fanta" ("fanta_player_id", "race_id", "1_place_id", "2_place_id", "3_place_id", "4_place_id", "5_place_id", "6_place_id", "fast_lap_id") 
VALUES (` + voto.fanta_player_id + `, ` + voto.track_id + `, ` + voto.id_1_place + `, ` + voto.id_2_place + `, ` + voto.id_3_place + `, ` + voto.id_4_place + `, ` + voto.id_5_place + `, ` + voto.id_6_place + `, ` + voto.id_fast_lap + `)
ON CONFLICT ("fanta_player_id", "race_id")
DO
UPDATE SET
    "1_place_id" = ` + voto.id_1_place + `,
    "2_place_id" = ` + voto.id_2_place + `,
    "3_place_id" = ` + voto.id_3_place + `,
    "4_place_id" = ` + voto.id_4_place + `,
    "5_place_id" = ` + voto.id_5_place + `,
    "6_place_id" = ` + voto.id_6_place + `,
    "fast_lap_id" = ` + voto.id_fast_lap + `
            `);
    }

    async setFantaPlayer(player: any): Promise<void> {
        const query = `INSERT INTO "fanta_player" ("username", "name", "surname", "password", "image")
VALUES (` + player.username + `, ` + player.name + `, ` + player.surname + `, ` + player.password + `, $1)`;
        console.log( "QUERY", query);
        const result = await this.pool.query(query, [player.image]);
    }
    

}
