import { describe, expect, it, vi } from 'vitest';
import { FeatureFlagsService } from '../services/feature-flags.service.js';

describe('FeatureFlagsService', () => {
  it('enables free practice when the season property is absent', async () => {
    const pool = {
      query: vi.fn()
        .mockResolvedValueOnce({ rows: [{ value: '1' }] })
        .mockResolvedValueOnce({ rows: [] })
    } as unknown as import('pg').Pool;

    const flags = await new FeatureFlagsService(pool).getFlags(2);

    expect(flags).toEqual({ fantaEnabled: true, freePracticeEnabled: true });
  });

  it('returns disabled when the season property is zero', async () => {
    const pool = {
      query: vi.fn()
        .mockResolvedValueOnce({ rows: [{ value: '1' }] })
        .mockResolvedValueOnce({ rows: [{ value: '0' }] })
    } as unknown as import('pg').Pool;

    const flags = await new FeatureFlagsService(pool).getFlags(2);

    expect(flags.freePracticeEnabled).toBe(false);
  });
});