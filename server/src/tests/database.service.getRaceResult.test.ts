import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DatabaseService } from '../services/database.service.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createMockPool(rows: Record<string, unknown>[]) {
  return {
    query: vi.fn().mockResolvedValue({ rows, rowCount: rows.length }),
  } as unknown as import('pg').Pool;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('DatabaseService.getRaceResult – Phase 2 positions[] shape', () => {
  it('returns positions array ordered by position', async () => {
    const pool = createMockPool([
      {
        id: 1,
        track_id: 10,
        positions: [
          { position: 1, pilot_id: 5, fast_lap: false },
          { position: 2, pilot_id: 3, fast_lap: true },
          { position: 3, pilot_id: 7, fast_lap: false },
        ],
        list_dnf: [99],
      },
    ]);
    const service = new DatabaseService(pool);

    const results = await service.getRaceResult();

    expect(results).toHaveLength(1);
    const result = results[0];
    expect(result.id).toBe(1);
    expect(result.track_id).toBe(10);
    expect(result.positions).toHaveLength(3);
    expect(result.positions[0]).toMatchObject({ position: 1, pilot_id: 5, fast_lap: false });
    expect(result.positions[1]).toMatchObject({ position: 2, pilot_id: 3, fast_lap: true });
    expect(result.list_dnf).toEqual([99]);
  });

  it('returns empty positions when no entries exist', async () => {
    const pool = createMockPool([
      { id: 2, track_id: 20, positions: null, list_dnf: null },
    ]);
    const service = new DatabaseService(pool);

    const results = await service.getRaceResult();
    expect(results).toHaveLength(1);
    // Raw DB value passed through as-is; consumers guard with ?. 
    expect(results[0].positions).toBeNull();
    expect(results[0].list_dnf).toBeNull();
  });

  it('returns empty list when no race results exist', async () => {
    const pool = createMockPool([]);
    const service = new DatabaseService(pool);

    const results = await service.getRaceResult();
    expect(results).toHaveLength(0);
  });

  it('forwards seasonId as query parameter', async () => {
    const pool = createMockPool([]);
    const service = new DatabaseService(pool);

    await service.getRaceResult(42);

    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining('COALESCE($1'),
      [42]
    );
  });

  it('passes null/undefined when no seasonId supplied', async () => {
    const pool = createMockPool([]);
    const service = new DatabaseService(pool);

    await service.getRaceResult();

    expect(pool.query).toHaveBeenCalledWith(
      expect.any(String),
      [undefined]
    );
  });

  it('uses JSON_AGG in the SQL query (not MAX/CASE pivot)', async () => {
    const pool = createMockPool([]);
    const service = new DatabaseService(pool);

    await service.getRaceResult();

    const [sql] = (pool.query as ReturnType<typeof vi.fn>).mock.calls[0] as [string];
    expect(sql).toContain('JSON_AGG');
    expect(sql).toContain('JSON_BUILD_OBJECT');
    expect(sql).not.toContain('id_1_place');
    expect(sql).not.toContain('MAX(CASE WHEN');
  });

  it('filters position-0 rows into list_dnf via ARRAY_AGG', async () => {
    const pool = createMockPool([]);
    const service = new DatabaseService(pool);

    await service.getRaceResult();

    const [sql] = (pool.query as ReturnType<typeof vi.fn>).mock.calls[0] as [string];
    expect(sql).toContain('ARRAY_AGG');
    expect(sql).toContain('position = 0');
  });

  it('returns multiple results from UNION ALL (race + full_race)', async () => {
    const pool = createMockPool([
      { id: 1, track_id: 10, positions: [{ position: 1, pilot_id: 1, fast_lap: false }], list_dnf: [] },
      { id: 2, track_id: 20, positions: [{ position: 1, pilot_id: 2, fast_lap: true }], list_dnf: [5] },
    ]);
    const service = new DatabaseService(pool);

    const results = await service.getRaceResult();
    expect(results).toHaveLength(2);
    expect(results[0].track_id).toBe(10);
    expect(results[1].track_id).toBe(20);
    expect(results[1].list_dnf).toEqual([5]);
  });

  it('fast_lap field correctly identifies the driver who set fastest lap', async () => {
    const pool = createMockPool([
      {
        id: 3,
        track_id: 30,
        positions: [
          { position: 1, pilot_id: 10, fast_lap: false },
          { position: 2, pilot_id: 11, fast_lap: true },
          { position: 3, pilot_id: 12, fast_lap: false },
        ],
        list_dnf: [],
      },
    ]);
    const service = new DatabaseService(pool);

    const results = await service.getRaceResult();
    const fastLapDriver = results[0].positions.find(p => p.fast_lap);
    expect(fastLapDriver?.pilot_id).toBe(11);
  });

  it('does not include position = 0 entries in positions array', async () => {
    // DB returns positions filtered by WHERE position > 0 via FILTER clause
    const pool = createMockPool([
      {
        id: 4,
        track_id: 40,
        positions: [
          { position: 1, pilot_id: 1, fast_lap: false },
          { position: 2, pilot_id: 2, fast_lap: false },
        ],
        list_dnf: [99, 100],
      },
    ]);
    const service = new DatabaseService(pool);

    const results = await service.getRaceResult();
    const allPositions = results[0].positions.map(p => p.position);
    expect(allPositions.every(pos => pos > 0)).toBe(true);
    expect(results[0].list_dnf).toEqual([99, 100]);
  });
});
