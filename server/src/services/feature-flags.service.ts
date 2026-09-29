import type { Pool } from 'pg';
import type { FeatureFlags } from '@f123dashboard/shared';

export class FeatureFlagsService {
  constructor(private pool: Pool) {}

  async getFlags(seasonId?: number): Promise<FeatureFlags> {
    const [fantaResult, freePracticeResult] = await Promise.all([
      this.pool.query<{ value: string }>(
      `SELECT value FROM property WHERE name = 'fanta_enabled' LIMIT 1`
      ),
      this.pool.query<{ value: string }>(`
        WITH selected_season AS (
          SELECT COALESCE($1, (SELECT id FROM seasons ORDER BY start_date DESC LIMIT 1)) AS id
        )
        SELECT value
        FROM property
        WHERE name = CONCAT('free_practice_enabled_season_', (SELECT id FROM selected_season))
        LIMIT 1
      `, [seasonId])
    ]);

    return {
      fantaEnabled: fantaResult.rows[0]?.value === '1',
      freePracticeEnabled: freePracticeResult.rows[0]?.value !== '0'
    };
  }

  async setFreePracticeEnabled(seasonId: number | undefined, enabled: boolean): Promise<void> {
    await this.pool.query(`
      WITH selected_season AS (
        SELECT COALESCE($1, (SELECT id FROM seasons ORDER BY start_date DESC LIMIT 1)) AS id
      )
      INSERT INTO property (name, description, value)
      SELECT
        CONCAT('free_practice_enabled_season_', id),
        'Enables free practice results and points for a season',
        $2
      FROM selected_season
      ON CONFLICT (name) DO UPDATE
      SET value = EXCLUDED.value, updated_at = NOW()
    `, [seasonId, enabled ? '1' : '0']);
  }
}