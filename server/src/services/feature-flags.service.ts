import type { Pool } from 'pg';
import type { FeatureFlags } from '@f123dashboard/shared';

export class FeatureFlagsService {
  constructor(private pool: Pool) {}

  async getFlags(): Promise<FeatureFlags> {
    const result = await this.pool.query<{ value: string }>(
      `SELECT value FROM property WHERE name = 'fanta_enabled' LIMIT 1`
    );

    return { fantaEnabled: result.rows[0]?.value === '1' };
  }
}