import pg from 'pg';
import type { EligibleTrack, GPEditItem, CreateGpData, UpdateGpData, SprintDrawInfo } from '@f123dashboard/shared';

/** Number of sprint races in every season. */
export const SEASON_SPRINT_COUNT = 6;

const hasResultsSql = `
  EXISTS (SELECT 1 FROM race_result_entries WHERE race_results_id = gp.race_results_id)
  OR EXISTS (SELECT 1 FROM sprint_result_entries WHERE sprint_results_id = gp.sprint_results_id)
  OR EXISTS (SELECT 1 FROM qualifying_result_entries WHERE qualifying_results_id = gp.qualifying_results_id)
  OR EXISTS (SELECT 1 FROM free_practice_result_entries WHERE free_practice_results_id = gp.free_practice_results_id)
  OR EXISTS (SELECT 1 FROM full_race_result_entries WHERE race_results_id = gp.full_race_results_id)
`;

export class GpEditError extends Error {
  constructor(message: string, readonly status: 404 | 409) {
    super(message);
  }
}

export class GpEditService {
  constructor(private pool: pg.Pool) {}

async getUpcomingGps(includePast = false): Promise<GPEditItem[]> {
    // Get the greatest (latest) season_id
    const seasonRes = await this.pool.query(
        `SELECT id FROM seasons ORDER BY start_date DESC LIMIT 1`
    );
    if (seasonRes.rows.length === 0) {
        return [];
    }
    const seasonId = seasonRes.rows[0].id;

    const query = `
        SELECT 
            gp.id,
            to_char(gp.date, 'YYYY-MM-DD"T"HH24:MI') AS date,
            gp.track_id,
            t.name as track_name,
            gp.has_sprint,
            gp.has_x2,
            (${hasResultsSql}) AS has_results,
            gp.date <= (NOW() AT TIME ZONE 'UTC') AS is_past
        FROM gran_prix gp
        LEFT JOIN tracks t ON gp.track_id = t.id
        WHERE gp.season_id = $1
            AND ($2::boolean OR gp.date > (NOW() AT TIME ZONE 'UTC'))
        ORDER BY gp.date ASC, gp.id ASC
    `;
    const result = await this.pool.query(query, [seasonId, includePast]);
    return result.rows.map(row => ({
        ...row,
        id: Number(row.id),
        track_id: row.track_id === null ? null : Number(row.track_id),
        has_sprint: row.has_sprint == 1,
        has_x2: row.has_x2 == 1
    }));
}

  async createGp(data: CreateGpData): Promise<GPEditItem> {
    const seasonQuery = `SELECT id FROM seasons ORDER BY start_date DESC LIMIT 1`;
    const seasonRes = await this.pool.query(seasonQuery);
    if (seasonRes.rows.length === 0) {
      throw new Error('No active season found');
    }
    const seasonId = seasonRes.rows[0].id;

    const query = `
      INSERT INTO gran_prix (
        date, track_id, season_id, has_sprint, has_x2,
        race_results_id, qualifying_results_id, free_practice_results_id, sprint_results_id, full_race_results_id
      )
      VALUES (
        $1, $2, $3, $4, $5,
        ${data.has_x2 ? "NULL" : "nextval('results_id_seq')"},
        nextval('results_id_seq'),
        nextval('results_id_seq'),
        ${data.has_sprint ? "nextval('results_id_seq')" : "NULL"},
        ${data.has_x2 ?  "nextval('results_id_seq')" : "NULL"  }
      )
      RETURNING id, to_char(date, 'YYYY-MM-DD"T"HH24:MI') AS date, track_id, has_sprint, has_x2,
        date <= NOW() AS is_past
    `;
    const values = [
      data.date, 
      data.track_id, 
      seasonId, 
      data.has_sprint ? 1 : 0, 
      data.has_x2 ? 1 : 0
    ];
    
    const result = await this.pool.query(query, values);
    const row = result.rows[0];
    
    const trackName = row.track_id === null
      ? 'Da assegnare'
      : (await this.pool.query('SELECT name FROM tracks WHERE id = $1', [row.track_id])).rows[0]?.name || 'Unknown';

    return {
      ...row,
      id: Number(row.id),
      track_id: row.track_id === null ? null : Number(row.track_id),
      track_name: trackName,
      has_results: false,
      has_sprint: row.has_sprint === 1,
      has_x2: row.has_x2 === 1
    };
  }

  async updateGp(id: number, data: UpdateGpData): Promise<void> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (data.track_id !== undefined) {
      fields.push(`track_id = $${idx++}`);
      values.push(data.track_id);
    }

    if (data.date !== undefined) {
      fields.push(`date = $${idx++}`);
      values.push(data.date);
    }
    
    if (data.has_sprint !== undefined) {
      fields.push(`has_sprint = $${idx++}`);
      values.push(data.has_sprint ? 1 : 0);
      
      if (data.has_sprint) {
        fields.push(`sprint_results_id = COALESCE(sprint_results_id, nextval('results_id_seq'))`);
      } else {
        fields.push(`sprint_results_id = NULL`);
      }
    }
    
    if (data.has_x2 !== undefined) {
      fields.push(`has_x2 = $${idx++}`);
      values.push(data.has_x2 ? 1 : 0);
      
      if (data.has_x2) {
        fields.push(`full_race_results_id = COALESCE(full_race_results_id, nextval('results_id_seq'))`);
        fields.push(`race_results_id = NULL`);
      } else {
        fields.push(`full_race_results_id = NULL`);
        fields.push(`race_results_id = COALESCE(race_results_id, nextval('results_id_seq'))`);
      }
    }

    if (fields.length === 0) return;

    values.push(id);
    const query = `UPDATE gran_prix SET ${fields.join(', ')} WHERE id = $${idx}`;
    await this.withEditableGp(id, async client => {
      await client.query(query, values);
    });
  }

  async deleteGp(id: number): Promise<void> {
    await this.withEditableGp(id, async client => {
      await client.query('DELETE FROM gran_prix WHERE id = $1', [id]);
    });
  }

  private async withEditableGp(id: number, action: (client: pg.PoolClient) => Promise<void>): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const gp = await client.query('SELECT id FROM gran_prix WHERE id = $1 FOR UPDATE', [id]);
      if (gp.rows.length === 0) {
        throw new GpEditError('Gran Premio non trovato.', 404);
      }
      const result = await client.query<{ has_results: boolean }>(
        `SELECT (${hasResultsSql}) AS has_results FROM gran_prix gp WHERE gp.id = $1`,
        [id]
      );
      if (result.rows[0].has_results) {
        throw new GpEditError('Il Gran Premio contiene risultati e non puo essere modificato o eliminato.', 409);
      }
      await action(client);
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async bulkUpdateGpDate(daysOffset: number): Promise<void> {
      const seasonRes = await this.pool.query(
        `SELECT id FROM seasons ORDER BY start_date DESC LIMIT 1`
    );
    if (seasonRes.rows.length === 0) {
        return;
    }
    const seasonId = seasonRes.rows[0].id;

    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const gps = await client.query<{ id: number }>(
        "SELECT id FROM gran_prix WHERE date > (NOW() AT TIME ZONE 'UTC') AND season_id = $1 ORDER BY id FOR UPDATE",
        [seasonId]
      );
      await client.query(`
        UPDATE gran_prix gp
        SET date = gp.date + make_interval(days => $1)
        WHERE gp.id = ANY($2::bigint[])
          AND NOT (${hasResultsSql})
      `, [daysOffset, gps.rows.map(gp => gp.id)]);
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
  
  async getAllTracks(): Promise<{id: number, name: string}[]> {
     const result = await this.pool.query('SELECT id, name FROM tracks ORDER BY name');
     return result.rows.map(row => ({ ...row, id: Number(row.id) }));
  }

  async getEligibleTracksForLatestSeason(): Promise<EligibleTrack[]> {
    const seasonResult = await this.pool.query(
      'SELECT id FROM seasons ORDER BY start_date DESC LIMIT 1'
    );

    if (seasonResult.rows.length === 0) {
      return [];
    }

    const seasonId = seasonResult.rows[0].id;
    const result = await this.pool.query(
      `
        SELECT t.id, t.name, COALESCE(t.country, '') AS country
        FROM tracks t
        INNER JOIN track_seasons ts
          ON ts.track_id = t.id
          AND ts.season_id = $1
        WHERE NOT EXISTS (
          SELECT 1
          FROM gran_prix gp
          WHERE gp.track_id = t.id
            AND gp.season_id = $1
        )
        ORDER BY t.name ASC
      `,
      [seasonId]
    );

    return result.rows.map((row): EligibleTrack => ({
      id: Number(row.id),
      name: row.name,
      country: row.country
    }));
  }

  /**
   * Counts the sprints still available for the track-extraction draw in the latest season.
   * A sprint is used once a GP that already has a track is flagged as sprint.
   */
  async getSprintDrawInfoForLatestSeason(): Promise<SprintDrawInfo> {
    const result = await this.pool.query(
      `
        SELECT COUNT(*) AS assigned_sprints
        FROM gran_prix gp
        WHERE gp.season_id = (SELECT id FROM seasons ORDER BY start_date DESC LIMIT 1)
          AND gp.track_id IS NOT NULL
          AND gp.has_sprint = 1
      `
    );
    const assignedSprints = Number(result.rows[0]?.assigned_sprints ?? 0);

    return { remaining_sprints: Math.max(0, SEASON_SPRINT_COUNT - assignedSprints) };
  }
}
