import { GenezioDeploy } from "@genezio/types";
import pg from "pg";
const { Pool } = pg;

type DriverData = {
  driver_id: number;
  driver_username: string;
  driver_name: string;
  driver_surname: string;
  driver_description: string;
  driver_license_pt: number;
  driver_consistency_pt: number;
  driver_fast_lap_pt: number;
  drivers_dangerous_pt: number;
  driver_ingenuity_pt: number;
  driver_strategy_pt: number;
  driver_color: string;
  car_name: string;
  car_overall_score: number;
  total_sprint_points: number;
  total_free_practice_points: number;
  total_qualifying_points: number;
  total_full_race_points: number;
  total_race_points: number;
  total_points: number;
};

type Driver = {
  id: number;
  username: string;
  first_name: string;
  surname: string;
}

type SessionResult = {
  position: number;
  driver_username: string;
  fast_lap: boolean | null;
}

type ChampionshipData = {
  gran_prix_id: number;
  track_name: string;
  gran_prix_date: Date;
  gran_prix_has_sprint: number;
  gran_prix_has_x2: number;
  track_country: string;
  sessions: {
    free_practice?: SessionResult[];
    qualifying?: SessionResult[];
    race?: SessionResult[];
    sprint?: SessionResult[];
    full_race?: SessionResult[];
  };
  fastLapDrivers: {
    race?: string;
    sprint?: string;
    full_race?: string;
  };
}

type Season = {
  id: number;
  description: string;
  startDate?: Date;
  endDate?: Date;
}

type CumulativePointsData = {
  date: string;
  track_name: string;
  driver_id: number;
  driver_username: string;
  driver_color: string;
  cumulative_points: number;
}

type TrackData = {
  track_id: number;
  name: string;
  date: string;
  has_sprint: number;
  has_x2: number;
  country: string;
  besttime_driver_time: string;
  username: string;
}

type RaceResult = {
    id: number,
    track_id: number,
    id_1_place: number,
    id_2_place: number,
    id_3_place: number,
    id_4_place: number,
    id_5_place: number,
    id_6_place: number,
    id_7_place: number,
    id_8_place: number,
    id_fast_lap: number,
    list_dnf: string
}

type Constructor = {
  constructor_id: number;
  constructor_name: string;
  constructor_color: string;
  driver_1_id: number;
  driver_1_username: string;
  driver_1_tot_points: number;
  driver_2_id: number;
  driver_2_username: string;
  driver_2_tot_points: number;
  constructor_tot_points: number;
  constructor_race_points?: number;
  constructor_full_race_points?: number;
  constructor_sprint_points?: number;
  constructor_qualifying_points?: number;
  constructor_free_practice_points?: number;
}


type ConstructorGrandPrixPoints = {
  constructor_id: number;
  constructor_name: string;
  grand_prix_id: number;
  grand_prix_date: string;
  track_name: string;
  track_id: number;
  season_id: number;
  season_description: string;
  driver_id_1: number;
  driver_id_2: number;
  driver_1_points: number;
  driver_2_points: number;
  constructor_points: number;
}


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
    async getAllDrivers(seasonId?: number): Promise<DriverData[]> {
      const result = await this.pool.query(`
        WITH latest_season AS (
          SELECT id FROM seasons ORDER BY start_date DESC LIMIT 1
        )
        SELECT 
          driver_id, driver_username, driver_name, driver_surname, driver_description, driver_license_pt, driver_consistency_pt, driver_fast_lap_pt, drivers_dangerous_pt, driver_ingenuity_pt, driver_strategy_pt, driver_color, car_name, car_overall_score, total_sprint_points, total_free_practice_points, total_qualifying_points, total_full_race_points, total_race_points, total_points
        FROM public.all_race_points arp
        CROSS JOIN latest_season ls
        WHERE arp.season_id = COALESCE($1, ls.id);
      `, [seasonId]);
      return result.rows as DriverData[];
    }

  async getDriversData(seasonId?: number): Promise<Driver[]> {
    const result = await this.pool.query(`
      WITH latest_season AS (
        SELECT id FROM seasons ORDER BY start_date DESC LIMIT 1
      )
      SELECT 
        d.id as id,
        d.username as username,
        d.name as name,
        d.surname as surname
      FROM drivers d
      CROSS JOIN latest_season ls
      LEFT JOIN pilots p ON d.pilot_id = p.id
      LEFT JOIN cars c ON p.car_id = c.id
      WHERE d.season = COALESCE($1, ls.id)
      ORDER BY d.username;
    `, [seasonId]);
    return result.rows as Driver[];
  }

  /* All tracks and standings (for Championship page) */
  async getChampionship(seasonId?: number): Promise<ChampionshipData[]> {
    console.log(seasonId);
    
    // Single optimized query to get all championship data
    const result = await this.pool.query(`
      WITH latest_season AS (
        SELECT id FROM seasons ORDER BY start_date DESC LIMIT 1
      ),
      all_session_results AS (
        -- Free Practice Results
        SELECT 
          gp.id AS gran_prix_id,
          t.name AS track_name,
          gp.date AS gran_prix_date,
          gp.has_sprint AS gran_prix_has_sprint,
          gp.has_x2 AS gran_prix_has_x2,
          t.country AS track_country,
          'free_practice' AS session_type,
          fpre.position,
          d.username AS driver_username,
          NULL::boolean AS fast_lap
        FROM gran_prix gp
        JOIN tracks t ON gp.track_id = t.id
        CROSS JOIN latest_season ls
        LEFT JOIN free_practice_result_entries fpre ON fpre.free_practice_results_id = gp.free_practice_results_id
        LEFT JOIN drivers d ON fpre.pilot_id = d.id
        WHERE gp.season_id = COALESCE($1, ls.id)
          AND gp.free_practice_results_id IS NOT NULL
          AND fpre.position IS NOT NULL
        
        UNION ALL
        
        -- Qualifying Results
        SELECT 
          gp.id AS gran_prix_id,
          t.name AS track_name,
          gp.date AS gran_prix_date,
          gp.has_sprint AS gran_prix_has_sprint,
          gp.has_x2 AS gran_prix_has_x2,
          t.country AS track_country,
          'qualifying' AS session_type,
          qre.position,
          d.username AS driver_username,
          NULL::boolean AS fast_lap
        FROM gran_prix gp
        JOIN tracks t ON gp.track_id = t.id
        CROSS JOIN latest_season ls
        LEFT JOIN qualifying_result_entries qre ON qre.qualifying_results_id = gp.qualifying_results_id
        LEFT JOIN drivers d ON qre.pilot_id = d.id
        WHERE gp.season_id = COALESCE($1, ls.id)
          AND gp.qualifying_results_id IS NOT NULL
          AND qre.position IS NOT NULL
        
        UNION ALL
        
        -- Race Results
        SELECT 
          gp.id AS gran_prix_id,
          t.name AS track_name,
          gp.date AS gran_prix_date,
          gp.has_sprint AS gran_prix_has_sprint,
          gp.has_x2 AS gran_prix_has_x2,
          t.country AS track_country,
          'race' AS session_type,
          rre.position,
          d.username AS driver_username,
          rre.fast_lap
        FROM gran_prix gp
        JOIN tracks t ON gp.track_id = t.id
        CROSS JOIN latest_season ls
        LEFT JOIN race_result_entries rre ON rre.race_results_id = gp.race_results_id
        LEFT JOIN drivers d ON rre.pilot_id = d.id
        WHERE gp.season_id = COALESCE($1, ls.id)
          AND gp.race_results_id IS NOT NULL
          AND rre.position IS NOT NULL
        
        UNION ALL
        
        -- Sprint Results
        SELECT 
          gp.id AS gran_prix_id,
          t.name AS track_name,
          gp.date AS gran_prix_date,
          gp.has_sprint AS gran_prix_has_sprint,
          gp.has_x2 AS gran_prix_has_x2,
          t.country AS track_country,
          'sprint' AS session_type,
          sre.position,
          d.username AS driver_username,
          sre.fast_lap
        FROM gran_prix gp
        JOIN tracks t ON gp.track_id = t.id
        CROSS JOIN latest_season ls
        LEFT JOIN sprint_result_entries sre ON sre.sprint_results_id = gp.sprint_results_id
        LEFT JOIN drivers d ON sre.pilot_id = d.id
        WHERE gp.season_id = COALESCE($1, ls.id)
          AND gp.sprint_results_id IS NOT NULL
          AND sre.position IS NOT NULL
        
        UNION ALL
        
        -- Full Race Results
        SELECT 
          gp.id AS gran_prix_id,
          t.name AS track_name,
          gp.date AS gran_prix_date,
          gp.has_sprint AS gran_prix_has_sprint,
          gp.has_x2 AS gran_prix_has_x2,
          t.country AS track_country,
          'full_race' AS session_type,
          frre.position,
          d.username AS driver_username,
          frre.fast_lap
        FROM gran_prix gp
        JOIN tracks t ON gp.track_id = t.id
        CROSS JOIN latest_season ls
        LEFT JOIN full_race_result_entries frre ON frre.race_results_id = gp.full_race_results_id
        LEFT JOIN drivers d ON frre.pilot_id = d.id
        WHERE gp.season_id = COALESCE($1, ls.id)
          AND gp.full_race_results_id IS NOT NULL
          AND frre.position IS NOT NULL
      ),
      grand_prix_base AS (
        SELECT DISTINCT
          gran_prix_id,
          track_name,
          gran_prix_date,
          gran_prix_has_sprint,
          gran_prix_has_x2,
          track_country
        FROM all_session_results
        
        UNION
        
        -- Include Grand Prix without results
        SELECT 
          gp.id AS gran_prix_id,
          t.name AS track_name,
          gp.date AS gran_prix_date,
          gp.has_sprint AS gran_prix_has_sprint,
          gp.has_x2 AS gran_prix_has_x2,
          t.country AS track_country
        FROM gran_prix gp
        JOIN tracks t ON gp.track_id = t.id
        CROSS JOIN latest_season ls
        WHERE gp.season_id = COALESCE($1, ls.id)
      )
      SELECT 
        gpb.gran_prix_id,
        gpb.track_name,
        gpb.gran_prix_date,
        gpb.gran_prix_has_sprint,
        gpb.gran_prix_has_x2,
        gpb.track_country,
        asr.session_type,
        asr.position,
        asr.driver_username,
        asr.fast_lap
      FROM grand_prix_base gpb
      LEFT JOIN all_session_results asr ON gpb.gran_prix_id = asr.gran_prix_id
      ORDER BY gpb.gran_prix_date ASC, asr.session_type, asr.position;
    `, [seasonId]);

    // Process results into the required format
    const champMap = new Map();
    
    for (const row of result.rows) {
      const gpId = row.gran_prix_id.toString();
      
      if (!champMap.has(gpId)) {
        champMap.set(gpId, {
          gran_prix_id: gpId,
          track_name: row.track_name,
          gran_prix_date: row.gran_prix_date,
          gran_prix_has_sprint: row.gran_prix_has_sprint?.toString() || '0',
          gran_prix_has_x2: row.gran_prix_has_x2?.toString() || '0',
          track_country: row.track_country,
          sessions: {},
          fastLapDrivers: {}
        });
      }
      
      const champData = champMap.get(gpId);
      
      if (row.session_type && row.driver_username) {
        // Initialize session array if not exists
        if (!champData.sessions[row.session_type]) {
          champData.sessions[row.session_type] = [];
        }
        
        // Add driver result
        champData.sessions[row.session_type].push({
          position: row.position,
          driver_username: row.driver_username,
          fast_lap: row.fast_lap
        });
        
        // Track fast lap drivers
        if (row.fast_lap === true) {
          champData.fastLapDrivers[row.session_type] = row.driver_username;
        }
      }
    }
    
    // Convert map to array and sort by date
    const formattedResults = Array.from(champMap.values())
      .sort((a, b) => new Date(a.gran_prix_date).getTime() - new Date(b.gran_prix_date).getTime());

    return formattedResults as ChampionshipData[];
  }

  /* All driver championship's cumulative points (for trend graph)*/
  async getCumulativePoints(seasonId?: number): Promise<CumulativePointsData[]> {
    const result = await this.pool.query(`
    WITH latest_season AS (
        SELECT id 
        FROM seasons 
        ORDER BY start_date DESC 
        LIMIT 1
    ),
    all_session_points AS (
        SELECT
            dgp.grand_prix_date AS date,
            dgp.track_name,
            dgp.pilot_id AS driver_id,
            dgp.pilot_username AS driver_username,
            dgp.pilot_id, -- for later reference
            dgp.position_points + dgp.fast_lap_points AS session_point
        FROM public.driver_grand_prix_points dgp
        CROSS JOIN latest_season ls
        WHERE dgp.season_id = COALESCE($1, ls.id)
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
      `, [seasonId]);
    return result.rows as CumulativePointsData[];
  }

  /* All championship tracks with best time info */
  async getAllTracks(seasonId?: number): Promise<TrackData[]> {
    const result = await this.pool.query (`
WITH latest_season AS (
    SELECT id 
    FROM seasons 
    ORDER BY start_date DESC 
    LIMIT 1
)
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
        CROSS JOIN latest_season ls
        WHERE gran_prix.season_id = COALESCE($1, ls.id)
    ) AS inner_table
    ON tracks.id = inner_table.track_id
) AS outer_table_tracks
LEFT JOIN
(
    SELECT *
    FROM drivers
) AS outer_table_drivers
ON outer_table_tracks.besttime_driver_id = outer_table_drivers.id
WHERE outer_table_tracks.date IS NOT NULL
ORDER BY date ASC
    `, [seasonId]);
    return result.rows as TrackData[];
  }

  async getRaceResoult(seasonId?: number): Promise<RaceResult[]> {
      const result = await this.pool.query(`
        WITH latest_season AS (
            SELECT id 
            FROM seasons 
            ORDER BY start_date DESC 
            LIMIT 1
        )
        SELECT
          gp.id AS id,
          gp.track_id AS track_id,
          MAX(CASE WHEN rre.position = 1 THEN rre.pilot_id END) AS id_1_place,
          MAX(CASE WHEN rre.position = 2 THEN rre.pilot_id END) AS id_2_place,
          MAX(CASE WHEN rre.position = 3 THEN rre.pilot_id END) AS id_3_place,
          MAX(CASE WHEN rre.position = 4 THEN rre.pilot_id END) AS id_4_place,
          MAX(CASE WHEN rre.position = 5 THEN rre.pilot_id END) AS id_5_place,
          MAX(CASE WHEN rre.position = 6 THEN rre.pilot_id END) AS id_6_place,
          MAX(CASE WHEN rre.position = 7 THEN rre.pilot_id END) AS id_7_place,
          MAX(CASE WHEN rre.position = 8 THEN rre.pilot_id END) AS id_8_place,
          MAX(CASE WHEN rre.fast_lap THEN rre.pilot_id END) AS id_fast_lap,
          ARRAY_AGG(rre.pilot_id) FILTER (WHERE rre.position = 0) AS list_dnf
        FROM gran_prix gp
        CROSS JOIN latest_season ls
        LEFT JOIN race_result_entries rre ON gp.race_results_id = rre.race_results_id
        WHERE gp.race_results_id IS NOT NULL 
          AND gp.season_id = COALESCE($1, ls.id)
        GROUP BY gp.id

        UNION ALL

        SELECT
          gp.id AS track_id,
          gp.track_id AS track_id,
          MAX(CASE WHEN frre.position = 1 THEN frre.pilot_id END) AS id_1_place,
          MAX(CASE WHEN frre.position = 2 THEN frre.pilot_id END) AS id_2_place,
          MAX(CASE WHEN frre.position = 3 THEN frre.pilot_id END) AS id_3_place,
          MAX(CASE WHEN frre.position = 4 THEN frre.pilot_id END) AS id_4_place,
          MAX(CASE WHEN frre.position = 5 THEN frre.pilot_id END) AS id_5_place,
          MAX(CASE WHEN frre.position = 6 THEN frre.pilot_id END) AS id_6_place,
          MAX(CASE WHEN frre.position = 7 then frre.pilot_id END) AS id_7_place,
          MAX(CASE WHEN frre.position = 8 THEN frre.pilot_id END) AS id_8_place,
          MAX(CASE WHEN frre.fast_lap THEN frre.pilot_id END) AS id_fast_lap,
          ARRAY_AGG(frre.pilot_id) FILTER (WHERE frre.position = 0) AS list_dnf
        FROM gran_prix gp
        CROSS JOIN latest_season ls
        LEFT JOIN full_race_result_entries frre ON gp.full_race_results_id = frre.race_results_id
        WHERE gp.full_race_results_id IS NOT NULL 
          AND gp.season_id = COALESCE($1, ls.id)
        GROUP BY gp.id
      `, [seasonId]);
      return result.rows as RaceResult[];
  }


  async getAllSeasons(): Promise<Season[]> {
    const result = await this.pool.query(`SELECT id, description, start_date, end_date FROM seasons ORDER BY id DESC`);
    return result.rows as Season[];
  }

  async getConstructors(seasonId?: number): Promise<Constructor[]> {
    const result = await this.pool.query (`
      SELECT constructor_id,
      	constructor_name,
        constructor_color,
        driver_1_id,
        driver_1_username,
        driver_1_tot_points,
        driver_2_id,
        driver_2_username,
        driver_2_tot_points,
        constructor_tot_points
      FROM season_constructor_leaderboard
      `);
    return result.rows as Constructor[];
  }

  /* Constructor Grand Prix Points */
  async getConstructorGrandPrixPoints(seasonId?: number): Promise<ConstructorGrandPrixPoints[]> {
    const result = await this.pool.query(`
      WITH latest_season AS (
        SELECT id FROM seasons ORDER BY start_date DESC LIMIT 1
      )
      SELECT
        constructor_id,
        constructor_name,
        grand_prix_id,
        grand_prix_date,
        track_name,
        track_id,
        season_id,
        season_description,
        driver_id_1,
        driver_id_2,
        driver_1_points,
        driver_2_points,
        constructor_points
      FROM constructor_grand_prix_points cgp
      CROSS JOIN latest_season ls
      WHERE cgp.season_id = COALESCE($1, ls.id)
      ORDER BY cgp.grand_prix_date DESC, cgp.constructor_points DESC;
    `, [seasonId]);
    return result.rows as ConstructorGrandPrixPoints[];
  }

  async setGpResult(
    trackId: number,
    hasSprint: boolean,
    raceResult: number[],
    raceDnfResult: number[],
    sprintResult: number[],
    sprintDnfResult: number[],
    qualiResult: number[],
    fpResult: number[],
    seasonId: number
  ): Promise<string> {
    console.log('[setGpResult] called with:', {
      trackId,
      hasSprint,
      raceResult,
      raceDnfResult,
      sprintResult,
      sprintDnfResult,
      qualiResult,
      fpResult,
      seasonId
    });
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // Get gran_prix row for this track
      const gpRes = await client.query(
        'SELECT id, race_results_id, sprint_results_id, qualifying_results_id, free_practice_results_id, full_race_results_id, has_x2 FROM gran_prix WHERE track_id = $1 and season_id = $2',
        [trackId, seasonId]
      );
      console.log('[setGpResult] gran_prix row:', gpRes.rows[0]);
      if (gpRes.rowCount === 0) throw new Error('Gran Prix not found');
      const gp = gpRes.rows[0];

      // Handle Race Results (or full race if has_x2)
      if (gp.has_x2 === 1 && gp.full_race_results_id) {
        console.log('[setGpResult] Handling full race results:', gp.full_race_results_id);
        const delRes = await client.query('DELETE FROM full_race_result_entries WHERE race_results_id = $1', [gp.full_race_results_id]);
        console.log(`[setGpResult] Deleted full_race_result_entries:`, delRes.rowCount);
        for (let i = 0; i < 8; i++) {
          if (raceResult[i] && raceResult[i] !== 0) {
            const insRes = await client.query(
              'INSERT INTO full_race_result_entries (race_results_id, pilot_id, position, fast_lap) VALUES ($1, $2, $3, $4) RETURNING *',
              [gp.full_race_results_id, raceResult[i], i+1, raceResult[8] === raceResult[i]]
            );
            console.log(`[setGpResult] Inserted full_race_result_entries pos ${i+1}:`, insRes.rows[0]);
          }
        }
        if (raceDnfResult && raceDnfResult.length > 0) {
          for (const pilotId of raceDnfResult) {
            const insRes = await client.query(
              'INSERT INTO full_race_result_entries (race_results_id, pilot_id, position, fast_lap) VALUES ($1, $2, $3, $4) RETURNING *',
              [gp.full_race_results_id, pilotId, 0, false]
            );
            console.log(`[setGpResult] Inserted full_race_result_entries DNF:`, insRes.rows[0]);
          }
        }
      } else if (gp.race_results_id) {
        console.log('[setGpResult] Handling race results:', gp.race_results_id);
        const delRes = await client.query('DELETE FROM race_result_entries WHERE race_results_id = $1', [gp.race_results_id]);
        console.log(`[setGpResult] Deleted race_result_entries:`, delRes.rowCount);
        for (let i = 0; i < 8; i++) {
          if (raceResult[i] && raceResult[i] !== 0) {
            const insRes = await client.query(
              'INSERT INTO race_result_entries (race_results_id, pilot_id, position, fast_lap) VALUES ($1, $2, $3, $4) RETURNING *',
              [gp.race_results_id, raceResult[i], i+1, raceResult[8] === raceResult[i]]
            );
            console.log(`[setGpResult] Inserted race_result_entries pos ${i+1}:`, insRes.rows[0]);
          }
        }
        if (raceDnfResult && raceDnfResult.length > 0) {
          for (const pilotId of raceDnfResult) {
            const insRes = await client.query(
              'INSERT INTO race_result_entries (race_results_id, pilot_id, position, fast_lap) VALUES ($1, $2, $3, $4) RETURNING *',
              [gp.race_results_id, pilotId, 0, false]
            );
            console.log(`[setGpResult] Inserted race_result_entries DNF:`, insRes.rows[0]);
          }
        }
      }

      // Handle Sprint Results
      if (hasSprint && gp.sprint_results_id) {
        console.log('[setGpResult] Handling sprint results:', gp.sprint_results_id);
        const delRes = await client.query('DELETE FROM sprint_result_entries WHERE sprint_results_id = $1', [gp.sprint_results_id]);
        console.log(`[setGpResult] Deleted sprint_result_entries:`, delRes.rowCount);
        for (let i = 0; i < 8; i++) {
          if (sprintResult[i] && sprintResult[i] !== 0) {
            const insRes = await client.query(
              'INSERT INTO sprint_result_entries (sprint_results_id, pilot_id, position, fast_lap) VALUES ($1, $2, $3, $4) RETURNING *',
              [gp.sprint_results_id, sprintResult[i], i+1, sprintResult[8] === sprintResult[i]]
            );
            console.log(`[setGpResult] Inserted sprint_result_entries pos ${i+1}:`, insRes.rows[0]);
          }
        }
        if (sprintDnfResult && sprintDnfResult.length > 0) {
          for (const pilotId of sprintDnfResult) {
            const insRes = await client.query(
              'INSERT INTO sprint_result_entries (sprint_results_id, pilot_id, position, fast_lap) VALUES ($1, $2, $3, $4) RETURNING *',
              [gp.sprint_results_id, pilotId, 0, false]
            );
            console.log(`[setGpResult] Inserted sprint_result_entries DNF:`, insRes.rows[0]);
          }
        }
      }

      // Handle Qualifying Results
      if (gp.qualifying_results_id) {
        console.log('[setGpResult] Handling qualifying results:', gp.qualifying_results_id);
        const delRes = await client.query('DELETE FROM qualifying_result_entries WHERE qualifying_results_id = $1', [gp.qualifying_results_id]);
        console.log(`[setGpResult] Deleted qualifying_result_entries:`, delRes.rowCount);
        for (let i = 0; i < 8; i++) {
          if (qualiResult[i] && qualiResult[i] !== 0) {
            const insRes = await client.query(
              'INSERT INTO qualifying_result_entries (qualifying_results_id, pilot_id, position) VALUES ($1, $2, $3) RETURNING *',
              [gp.qualifying_results_id, qualiResult[i], i+1]
            );
            console.log(`[setGpResult] Inserted qualifying_result_entries pos ${i+1}:`, insRes.rows[0]);
          }
        }
      }

      // Handle Free Practice Results
      if (gp.free_practice_results_id) {
        console.log('[setGpResult] Handling free practice results:', gp.free_practice_results_id);
        const delRes = await client.query('DELETE FROM free_practice_result_entries WHERE free_practice_results_id = $1', [gp.free_practice_results_id]);
        console.log(`[setGpResult] Deleted free_practice_result_entries:`, delRes.rowCount);
        for (let i = 0; i < 8; i++) {
          if (fpResult[i] && fpResult[i] !== 0) {
            const insRes = await client.query(
              'INSERT INTO free_practice_result_entries (free_practice_results_id, pilot_id, position) VALUES ($1, $2, $3) RETURNING *',
              [gp.free_practice_results_id, fpResult[i], i+1]
            );
            console.log(`[setGpResult] Inserted free_practice_result_entries pos ${i+1}:`, insRes.rows[0]);
          }
        }
      }

      await client.query('COMMIT');
      console.log('[setGpResult] Commit successful');
      return JSON.stringify({
        success: true,
        message: 'Race result saved successfully'
      });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('[setGpResult] Error saving race result:', error);
      return JSON.stringify({
        success: false,
        message: `Failed to save race result: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      client.release();
    }
  }
}
