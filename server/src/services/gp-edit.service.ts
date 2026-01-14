import pg from 'pg';
import type { GPEditItem, CreateGpData, UpdateGpData } from '@f123dashboard/shared';

export class GpEditService {
  constructor(private pool: pg.Pool) {}

async getUpcomingGps(): Promise<GPEditItem[]> {
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
            gp.date,
            gp.track_id,
            t.name as track_name,
            gp.has_sprint,
            gp.has_x2
        FROM gran_prix gp
        JOIN tracks t ON gp.track_id = t.id
        WHERE gp.season_id = $1
            AND gp.date > NOW()
        ORDER BY gp.date ASC
    `;
    const result = await this.pool.query(query, [seasonId]);
    return result.rows.map(row => ({
        ...row,
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
      RETURNING id, date, track_id, has_sprint, has_x2
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
    
    const trackRes = await this.pool.query('SELECT name FROM tracks WHERE id = $1', [row.track_id]);
    const trackName = trackRes.rows[0]?.name || 'Unknown';

    return {
      ...row,
      track_name: trackName,
      has_sprint: row.has_sprint === 1,
      has_x2: row.has_x2 === 1
    };
  }

  async updateGp(id: number, data: UpdateGpData): Promise<void> {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

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
    await this.pool.query(query, values);
  }

  async deleteGp(id: number): Promise<void> {
    await this.pool.query('DELETE FROM gran_prix WHERE id = $1', [id]);
  }

  async bulkUpdateGpDate(daysOffset: number): Promise<void> {
      const seasonRes = await this.pool.query(
        `SELECT id FROM seasons ORDER BY start_date DESC LIMIT 1`
    );
    if (seasonRes.rows.length === 0) {
        return;
    }
    const seasonId = seasonRes.rows[0].id;

    const query = `
      UPDATE gran_prix
      SET date = date + make_interval(days => $1)
      WHERE date > NOW() AND season_id = $2
    `;
    // daysOffset can be negative
    await this.pool.query(query, [daysOffset, seasonId]);
  }
  
  async getAllTracks(): Promise<{id: number, name: string}[]> {
     const result = await this.pool.query('SELECT id, name FROM tracks ORDER BY name');
     return result.rows;
  }
}
