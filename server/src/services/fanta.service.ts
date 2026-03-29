import pg from "pg";
import type { FantaVote } from '@f123dashboard/shared';
import logger from '../config/logger.js';

export class FantaService {
  constructor(private pool: pg.Pool) {}

  async getFantaVote(seasonId?: number): Promise<FantaVote[]> {
    const result = await this.pool.query(`
      WITH latest_season AS (
        SELECT id FROM seasons ORDER BY start_date DESC LIMIT 1
      )
      SELECT
        fp_table.id AS fanta_player_id,
        f_table.race_id AS track_id,
        fp_table.username AS username,
        COALESCE(
          JSON_AGG(fe.pilot_id ORDER BY fe.position) FILTER (WHERE fe.pilot_id IS NOT NULL),
          '[]'::json
        ) AS positions,
        f_table."fast_lap_id" AS "id_fast_lap",
        f_table."dnf_id" AS "id_dnf",
        f_table."team_id" AS "constructor_id",
        f_table.season_id
      FROM users fp_table
      JOIN fanta f_table ON fp_table.id = f_table.fanta_player_id
      LEFT JOIN fanta_entries fe ON fe.fanta_id = f_table.id
      CROSS JOIN latest_season ls
      WHERE f_table.season_id = COALESCE($1, ls.id)
      GROUP BY fp_table.id, f_table.id, fp_table.username, f_table.race_id,
               f_table.fast_lap_id, f_table.dnf_id, f_table.team_id, f_table.season_id
      ORDER BY fp_table.id, f_table.race_id;
    `, [seasonId]);
    return result.rows as FantaVote[];
  }

  async setFantaVoto(fantaVote: FantaVote): Promise<{ success: boolean; message: string }> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      this.validateFantaVoto(fantaVote);

      let season_id = fantaVote.season_id;
      if (season_id == null) {
        const seasonResult = await client.query('SELECT id FROM seasons ORDER BY start_date DESC LIMIT 1');
        season_id = seasonResult.rows[0]?.id;
      }

      // Upsert fanta header row (omitting the deprecated position columns)
      const upsertResult = await client.query(`
        INSERT INTO fanta (fanta_player_id, race_id, fast_lap_id, dnf_id, season_id, team_id)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (fanta_player_id, race_id, season_id)
        DO UPDATE SET
          fast_lap_id = EXCLUDED.fast_lap_id,
          dnf_id = EXCLUDED.dnf_id,
          team_id = EXCLUDED.team_id
        RETURNING id
      `, [
        fantaVote.fanta_player_id,
        fantaVote.track_id,
        fantaVote.id_fast_lap,
        fantaVote.id_dnf,
        season_id,
        fantaVote.constructor_id
      ]);

      const fantaId: number = upsertResult.rows[0].id;

      // Replace entries atomically
      await client.query('DELETE FROM fanta_entries WHERE fanta_id = $1', [fantaId]);

      // Bulk insert all fanta_entries in a single query to avoid N+1 inserts
      const valuesClauses: string[] = [];
      const params: (number)[] = [fantaId];
      for (let i = 0; i < fantaVote.positions.length; i++) {
        const pilotParamIndex = 2 + i * 2;
        const positionParamIndex = 3 + i * 2;
        valuesClauses.push(`($1, $${pilotParamIndex}, $${positionParamIndex})`);
        params.push(fantaVote.positions[i], i + 1);
      }

      await client.query(
        `INSERT INTO fanta_entries (fanta_id, pilot_id, position) VALUES ${valuesClauses.join(', ')}`,
        params
      );
      await client.query('COMMIT');

      logger.info(`Saved fanta vote for player ${fantaVote.fanta_player_id} on race ${fantaVote.track_id} for season ${season_id}`);
      return { success: true, message: 'Fanta vote saved successfully' };
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Error saving fanta vote', { error: error instanceof Error ? error.message : error });
      throw new Error(`Failed to save fanta vote: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      client.release();
    }
  }

  private validateFantaVoto(fantaVote: FantaVote): void {
    if (!fantaVote.fanta_player_id || !fantaVote.track_id) {
      throw new Error('Fanta player ID and track ID are required');
    }
    if (!fantaVote.id_fast_lap) throw new Error('Fast lap driver ID is required');
    if (!fantaVote.id_dnf) throw new Error('DNF driver ID is required');
    if (!fantaVote.constructor_id) throw new Error('Constructor ID is required');

    if (!fantaVote.positions || fantaVote.positions.length === 0) {
      throw new Error('At least one driver position is required');
    }

    const uniquePositions = new Set(fantaVote.positions);
    if (uniquePositions.size !== fantaVote.positions.length) {
      throw new Error('All driver positions must be unique');
    }
  }
}

