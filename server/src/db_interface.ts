import express, { Application, Request, Response } from 'express';
import { GenezioDeploy } from "@genezio/types";
import pg from "pg";
const { Pool } = pg;

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

  async getAllPilots(): Promise<string> {
    const result = await this.pool.query("SELECT * FROM pilots");
    return JSON.stringify(result.rows);
  }

  async getAllTracks(): Promise<string> {
    const result = await this.pool.query("SELECT * FROM tracks");
    return JSON.stringify(result.rows);
  }

  async getAllDrivers(): Promise<string> {
    const result = await this.pool.query(`
      /* ALL DRIVERS POINTS: RACE, QUALIFYING, FREE-PRACTICE */
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
      `);
    return JSON.stringify(result.rows);
  }

  async getAllCars(): Promise<string> {
    const result = await this.pool.query("SELECT * FROM cars");
    return JSON.stringify(result.rows);
  }

  async insertUser(name: string): Promise<string> {
    const result = await this.pool.query("SELECT * FROM tracks");
    return JSON.stringify(result.rows);
  }

}