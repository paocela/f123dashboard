import express, { Application, Request, Response } from 'express';
import { GenezioDeploy } from "@genezio/types";
import pg from "pg";
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
    connectionString: process.env.RACEFORFEDERICA_DB_DATABASE_URL,
    ssl: true,
  });


/****************************************************************/
//richieste dati con query dal backend 
/****************************************************************/

// 1) restituisce tutti i dati legati al pilota 
    async getAllDrivers(): Promise<string> {
        const result = await this.pool.query(`
            SELECT driver_id, driver_username, driver_name, driver_surname, driver_description, driver_license_pt, driver_consistency_pt, driver_fast_lap_pt, drivers_dangerous_pt, driver_ingenuity_pt, driver_strategy_pt, driver_color, pilot_name, pilot_surname, car_name, car_overall_score, total_sprint_points, total_free_practice_points, total_qualifying_points, total_full_race_points, total_race_points, total_points
            FROM public.all_race_points;
        `);
        return JSON.stringify(result.rows);
    }

  /* All tracks and standings (for Championship page) */
  async getChampionship(): Promise<string> {
    const result = await this.pool.query(`
SELECT
    t.name AS track_name,
    gp.date AS gran_prix_date,
    gp.has_sprint AS gran_prix_has_sprint,
    gp.has_x2 AS gran_prix_has_x2,
    t.country AS track_country,

    -- Race Results
    race_results.driver_1_place,
    race_results.driver_2_place,
    race_results.driver_3_place,
    race_results.driver_4_place,
    race_results.driver_5_place,
    race_results.driver_6_place,
    race_results.fast_lap_username AS driver_race_fast_lap,
    race_results.dnf_usernames AS race_dnf,

    -- Full Race Results
    full_race_results.driver_1_place AS driver_full_race_1_place,
    full_race_results.driver_2_place AS driver_full_race_2_place,
    full_race_results.driver_3_place AS driver_full_race_3_place,
    full_race_results.driver_4_place AS driver_full_race_4_place,
    full_race_results.driver_5_place AS driver_full_race_5_place,
    full_race_results.driver_6_place AS driver_full_race_6_place,
    full_race_results.fast_lap_username AS driver_full_race_fast_lap,
    full_race_results.dnf_usernames AS full_race_dnf,

    -- Sprint Results
    sprint_results.driver_1_place AS driver_sprint_1_place,
    sprint_results.driver_2_place AS driver_sprint_2_place,
    sprint_results.driver_3_place AS driver_sprint_3_place,
    sprint_results.driver_4_place AS driver_sprint_4_place,
    sprint_results.driver_5_place AS driver_sprint_5_place,
    sprint_results.driver_6_place AS driver_sprint_6_place,
    sprint_results.fast_lap_username AS driver_sprint_fast_lap,
    sprint_results.dnf_usernames AS sprint_dnf,

    -- Qualifying Results
    qualifying_results.driver_1_place AS driver_qualifying_1_place,
    qualifying_results.driver_2_place AS driver_qualifying_2_place,
    qualifying_results.driver_3_place AS driver_qualifying_3_place,
    qualifying_results.driver_4_place AS driver_qualifying_4_place,
    qualifying_results.driver_5_place AS driver_qualifying_5_place,
    qualifying_results.driver_6_place AS driver_qualifying_6_place,

    -- Free Practice Results
    free_practice_results.driver_1_place AS driver_free_practice_1_place,
    free_practice_results.driver_2_place AS driver_free_practice_2_place,
    free_practice_results.driver_3_place AS driver_free_practice_3_place,
    free_practice_results.driver_4_place AS driver_free_practice_4_place,
    free_practice_results.driver_5_place AS driver_free_practice_5_place,
    free_practice_results.driver_6_place AS driver_free_practice_6_place

FROM gran_prix gp
JOIN tracks t ON gp.track_id = t.id

-- Race Results
LEFT JOIN LATERAL (
    SELECT
        MAX(CASE WHEN rre.position = 1 THEN d.username END) AS driver_1_place,
        MAX(CASE WHEN rre.position = 2 THEN d.username END) AS driver_2_place,
        MAX(CASE WHEN rre.position = 3 THEN d.username END) AS driver_3_place,
        MAX(CASE WHEN rre.position = 4 THEN d.username END) AS driver_4_place,
        MAX(CASE WHEN rre.position = 5 THEN d.username END) AS driver_5_place,
        MAX(CASE WHEN rre.position = 6 THEN d.username END) AS driver_6_place,
        MAX(CASE WHEN rre.fast_lap = true THEN d.username END) AS fast_lap_username,
        STRING_AGG(d.username, ', ') FILTER (WHERE rre.position = 0) AS dnf_usernames
    FROM race_result_entries rre
    JOIN drivers d ON rre.pilot_id = d.id
    WHERE rre.race_results_id = gp.race_results_id
) race_results ON true

-- Full Race Results
LEFT JOIN LATERAL (
    SELECT
        MAX(CASE WHEN frre.position = 1 THEN d.username END) AS driver_1_place,
        MAX(CASE WHEN frre.position = 2 THEN d.username END) AS driver_2_place,
        MAX(CASE WHEN frre.position = 3 THEN d.username END) AS driver_3_place,
        MAX(CASE WHEN frre.position = 4 THEN d.username END) AS driver_4_place,
        MAX(CASE WHEN frre.position = 5 THEN d.username END) AS driver_5_place,
        MAX(CASE WHEN frre.position = 6 THEN d.username END) AS driver_6_place,
        MAX(CASE WHEN frre.fast_lap = true THEN d.username END) AS fast_lap_username,
        STRING_AGG(d.username, ', ') FILTER (WHERE frre.position = 0) AS dnf_usernames
    FROM full_race_result_entries frre
    JOIN drivers d ON frre.pilot_id = d.id
    WHERE frre.race_results_id = gp.full_race_results_id
) full_race_results ON true

-- Sprint Results
LEFT JOIN LATERAL (
    SELECT
        MAX(CASE WHEN sre.position = 1 THEN d.username END) AS driver_1_place,
        MAX(CASE WHEN sre.position = 2 THEN d.username END) AS driver_2_place,
        MAX(CASE WHEN sre.position = 3 THEN d.username END) AS driver_3_place,
        MAX(CASE WHEN sre.position = 4 THEN d.username END) AS driver_4_place,
        MAX(CASE WHEN sre.position = 5 THEN d.username END) AS driver_5_place,
        MAX(CASE WHEN sre.position = 6 THEN d.username END) AS driver_6_place,
        MAX(CASE WHEN sre.fast_lap = true THEN d.username END) AS fast_lap_username,
        STRING_AGG(d.username, ', ') FILTER (WHERE sre.position = 0) AS dnf_usernames
    FROM sprint_result_entries sre
    JOIN drivers d ON sre.pilot_id = d.id
    WHERE sre.sprint_results_id = gp.sprint_results_id
) sprint_results ON true

-- Qualifying Results
LEFT JOIN LATERAL (
    SELECT
        MAX(CASE WHEN qre.position = 1 THEN d.username END) AS driver_1_place,
        MAX(CASE WHEN qre.position = 2 THEN d.username END) AS driver_2_place,
        MAX(CASE WHEN qre.position = 3 THEN d.username END) AS driver_3_place,
        MAX(CASE WHEN qre.position = 4 THEN d.username END) AS driver_4_place,
        MAX(CASE WHEN qre.position = 5 THEN d.username END) AS driver_5_place,
        MAX(CASE WHEN qre.position = 6 THEN d.username END) AS driver_6_place
    FROM qualifying_result_entries qre
    JOIN drivers d ON qre.pilot_id = d.id
    WHERE qre.qualifying_results_id = gp.qualifying_results_id
) qualifying_results ON true

-- Free Practice Results
LEFT JOIN LATERAL (
    SELECT
        MAX(CASE WHEN fpre.position = 1 THEN d.username END) AS driver_1_place,
        MAX(CASE WHEN fpre.position = 2 THEN d.username END) AS driver_2_place,
        MAX(CASE WHEN fpre.position = 3 THEN d.username END) AS driver_3_place,
        MAX(CASE WHEN fpre.position = 4 THEN d.username END) AS driver_4_place,
        MAX(CASE WHEN fpre.position = 5 THEN d.username END) AS driver_5_place,
        MAX(CASE WHEN fpre.position = 6 THEN d.username END) AS driver_6_place
    FROM free_practice_result_entries fpre
    JOIN drivers d ON fpre.pilot_id = d.id
    WHERE fpre.free_practice_results_id = gp.free_practice_results_id
) free_practice_results ON true

ORDER BY gp.date ASC;
      `);
    return JSON.stringify(result.rows);
  }

  /* All driver championship's cumulative points (for trend graph)*/
  async getCumulativePoints(): Promise<string> {
    const result = await this.pool.query(`
    WITH all_session_points AS (
        SELECT
            dgp.grand_prix_date AS date,
            dgp.track_name,
            dgp.pilot_id AS driver_id,
            dgp.pilot_username AS driver_username,
            dgp.pilot_id, -- for later reference
            dgp.position_points + dgp.fast_lap_points AS session_point
        FROM public.driver_grand_prix_points dgp
    ),
    driver_colors AS (
        SELECT id AS driver_id, color AS driver_color
        FROM drivers
    )
    SELECT
        asp.date,
        asp.track_name,
        asp.driver_id,
        asp.driver_username,
        dc.driver_color,
        SUM(asp.session_point) OVER (PARTITION BY asp.driver_id ORDER BY asp.date, asp.track_name) AS cumulative_points
    FROM all_session_points asp
    LEFT JOIN driver_colors dc ON asp.driver_id = dc.driver_id
    GROUP BY asp.date, asp.track_name, asp.driver_id, asp.driver_username, dc.driver_color, asp.session_point
    ORDER BY asp.driver_id, asp.date, asp.track_name;
      `);
    return JSON.stringify(result.rows);
  }

  /* All championship tracks with best time info */
  async getAllTracks(): Promise<string> {
    const result = await this.pool.query (`
SELECT outer_table_tracks.track_id, outer_table_tracks.name, outer_table_tracks.date, outer_table_tracks.has_sprint, outer_table_tracks.has_x2, outer_table_tracks.country, outer_table_tracks.besttime_driver_time,
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

  async getRaceResoult(): Promise<string> {
      const result = await this.pool.query(`
        SELECT
          gp.id AS track_id,
          MAX(CASE WHEN rre.position = 1 THEN rre.pilot_id END) AS id_1_place,
          MAX(CASE WHEN rre.position = 2 THEN rre.pilot_id END) AS id_2_place,
          MAX(CASE WHEN rre.position = 3 THEN rre.pilot_id END) AS id_3_place,
          MAX(CASE WHEN rre.position = 4 THEN rre.pilot_id END) AS id_4_place,
          MAX(CASE WHEN rre.position = 5 THEN rre.pilot_id END) AS id_5_place,
          MAX(CASE WHEN rre.position = 6 THEN rre.pilot_id END) AS id_6_place,
          MAX(CASE WHEN rre.fast_lap THEN rre.pilot_id END) AS id_fast_lap,
          ARRAY_AGG(rre.pilot_id) FILTER (WHERE rre.position = 0) AS list_dnf
        FROM gran_prix gp
        LEFT JOIN race_results_entries rre ON gp.race_results_id = rre.race_results_id
        WHERE gp.race_results_id IS NOT NULL
        GROUP BY gp.id

        UNION ALL

        SELECT
          gp.id AS track_id,
          MAX(CASE WHEN frre.position = 1 THEN frre.pilot_id END) AS id_1_place,
          MAX(CASE WHEN frre.position = 2 THEN frre.pilot_id END) AS id_2_place,
          MAX(CASE WHEN frre.position = 3 THEN frre.pilot_id END) AS id_3_place,
          MAX(CASE WHEN frre.position = 4 THEN frre.pilot_id END) AS id_4_place,
          MAX(CASE WHEN frre.position = 5 THEN frre.pilot_id END) AS id_5_place,
          MAX(CASE WHEN frre.position = 6 THEN frre.pilot_id END) AS id_6_place,
          MAX(CASE WHEN frre.fast_lap THEN frre.pilot_id END) AS id_fast_lap,
          ARRAY_AGG(frre.pilot_id) FILTER (WHERE frre.position = 0) AS list_dnf
        FROM gran_prix gp
        LEFT JOIN full_race_result_entries frre ON gp.full_race_results_id = frre.race_results_id
        WHERE gp.full_race_results_id IS NOT NULL
        GROUP BY gp.id
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

  async getAllSeasons(): Promise<string> {
    const resoult = await this.pool.query(` SELECT id, description, start_date, end_date FROM seasons`);
    return JSON.stringify(resoult.rows);
  }
}
