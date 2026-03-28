import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DatabaseService } from '../services/database.service.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Builds a race result array following the convention:
 * [driverId_pos1, ..., driverId_posN, fastLapDriverId]
 */
function buildRaceArray(driverIds: number[], fastLapDriverId: number): number[] {
  return [...driverIds, fastLapDriverId];
}

/**
 * Builds a session array without fast lap (quali / free practice):
 * [driverId_pos1, ..., driverId_posN]
 */
function buildSessionArray(driverIds: number[]): number[] {
  return [...driverIds];
}

// ---------------------------------------------------------------------------
// Mock pool factory
// ---------------------------------------------------------------------------

function createMockPool(gpRow: Record<string, unknown>) {
  const client = {
    query: vi.fn(),
    release: vi.fn(),
  };

  // First call: BEGIN
  // Second call: SELECT gran_prix → returns gpRow
  // All subsequent INSERT / DELETE calls succeed with empty result
  client.query
    .mockResolvedValueOnce(undefined)                            // BEGIN
    .mockResolvedValueOnce({ rows: [gpRow], rowCount: 1 });     // SELECT gran_prix

  // Default for DELETE / INSERT / COMMIT calls
  client.query.mockResolvedValue({ rows: [], rowCount: 1 });

  return {
    pool: {
      connect: vi.fn().mockResolvedValue(client),
    } as unknown as import('pg').Pool,
    client,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('DatabaseService.setGpResult – dynamic driver count', () => {
  const BASE_GP = {
    id: 1,
    race_results_id: 10,
    sprint_results_id: 20,
    qualifying_results_id: 30,
    free_practice_results_id: 40,
    full_race_results_id: null,
    has_x2: 0,
  };

  // Extracts the driver INSERT calls for a given table name
  function getInsertCalls(client: ReturnType<typeof createMockPool>['client'], table: string) {
    return client.query.mock.calls.filter(
      ([sql]: [string]) => typeof sql === 'string' && sql.includes(`INSERT INTO ${table}`)
    );
  }

  describe('race (has_x2 = 0)', () => {
    it('inserts exactly N position rows when provided N drivers (default 8)', async () => {
      const drivers = [1, 2, 3, 4, 5, 6, 7, 8];
      const { pool, client } = createMockPool(BASE_GP);
      const service = new DatabaseService(pool);

      await service.setGpResult(
        1, false,
        buildRaceArray(drivers, 9),  // [d1..d8, fastLap]
        [],
        [], [],
        [],
        [],
        2024
      );

      const inserts = getInsertCalls(client, 'race_result_entries');
      expect(inserts.length).toBe(drivers.length);
    });

    it('inserts exactly 10 position rows when provided 10 drivers', async () => {
      const drivers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const { pool, client } = createMockPool(BASE_GP);
      const service = new DatabaseService(pool);

      await service.setGpResult(
        1, false,
        buildRaceArray(drivers, 11),  // 10 positions + fast lap = array length 11
        [],
        [], [],
        [],
        [],
        2024
      );

      const inserts = getInsertCalls(client, 'race_result_entries');
      expect(inserts.length).toBe(10);
    });

    it('sets fast_lap=true only for the correct driver', async () => {
      const drivers = [1, 2, 3];
      const fastLapDriver = 2;
      const { pool, client } = createMockPool(BASE_GP);
      const service = new DatabaseService(pool);

      await service.setGpResult(
        1, false,
        buildRaceArray(drivers, fastLapDriver),
        [],
        [], [],
        [],
        [],
        2024
      );

      const inserts = getInsertCalls(client, 'race_result_entries');
      // Each call: [race_results_id, pilot_id, position, fast_lap]
      const fastLapEntry = inserts.find(([, values]: [string, unknown[]]) => values[1] === fastLapDriver);
      expect(fastLapEntry).toBeDefined();
      expect(fastLapEntry![1][3]).toBe(true);  // fast_lap = true

      const nonFastLapEntries = inserts.filter(([, values]: [string, unknown[]]) => values[1] !== fastLapDriver);
      nonFastLapEntries.forEach(([, values]: [string, unknown[]]) => {
        expect(values[3]).toBe(false);
      });
    });

    it('inserts DNF drivers at position 0 and does not count them as position rows', async () => {
      const finishers = [1, 2, 3];
      const dnfDrivers = [4, 5];
      const { pool, client } = createMockPool(BASE_GP);
      const service = new DatabaseService(pool);

      await service.setGpResult(
        1, false,
        buildRaceArray(finishers, 1),
        dnfDrivers,
        [], [],
        [],
        [],
        2024
      );

      const inserts = getInsertCalls(client, 'race_result_entries');
      const positionInserts = inserts.filter(([, v]: [string, unknown[]]) => v[2] !== 0);
      const dnfInserts = inserts.filter(([, v]: [string, unknown[]]) => v[2] === 0);

      expect(positionInserts.length).toBe(finishers.length);
      expect(dnfInserts.length).toBe(dnfDrivers.length);
    });
  });

  describe('full race (has_x2 = 1)', () => {
    it('inserts into full_race_result_entries (not race_result_entries) for N drivers', async () => {
      const gpWithX2 = { ...BASE_GP, has_x2: 1, full_race_results_id: 99 };
      const drivers = [1, 2, 3, 4, 5, 6];
      const { pool, client } = createMockPool(gpWithX2);
      const service = new DatabaseService(pool);

      await service.setGpResult(
        1, false,
        buildRaceArray(drivers, 7),
        [],
        [], [],
        [],
        [],
        2024
      );

      const fullRaceInserts = getInsertCalls(client, 'full_race_result_entries');
      const raceInserts = getInsertCalls(client, 'race_result_entries');

      expect(fullRaceInserts.length).toBe(drivers.length);
      expect(raceInserts.length).toBe(0);
    });
  });

  describe('qualifying (no fast lap column)', () => {
    it('inserts exactly N rows matching the quali array length', async () => {
      const drivers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const { pool, client } = createMockPool(BASE_GP);
      const service = new DatabaseService(pool);

      await service.setGpResult(
        1, false,
        buildRaceArray(drivers, 11),
        [],
        [], [],
        buildSessionArray(drivers),   // qualiResult
        buildSessionArray(drivers),   // fpResult
        2024
      );

      const inserts = getInsertCalls(client, 'qualifying_result_entries');
      expect(inserts.length).toBe(drivers.length);
    });
  });

  describe('free practice (no fast lap column)', () => {
    it('inserts exactly N rows matching the fp array length', async () => {
      const drivers = [1, 2, 3, 4, 5, 6];
      const { pool, client } = createMockPool(BASE_GP);
      const service = new DatabaseService(pool);

      await service.setGpResult(
        1, false,
        buildRaceArray(drivers, 7),
        [],
        [], [],
        buildSessionArray(drivers),   // qualiResult
        buildSessionArray(drivers),   // fpResult
        2024
      );

      const inserts = getInsertCalls(client, 'free_practice_result_entries');
      expect(inserts.length).toBe(drivers.length);
    });
  });

  describe('sprint (when hasSprint = true)', () => {
    it('inserts exactly N rows into sprint_result_entries', async () => {
      const drivers = [1, 2, 3, 4, 5];
      const { pool, client } = createMockPool(BASE_GP);
      const service = new DatabaseService(pool);

      await service.setGpResult(
        1, true,
        buildRaceArray(drivers, 6),
        [],
        buildRaceArray(drivers, 6),  // sprintResult
        [],
        buildSessionArray(drivers),   // qualiResult
        buildSessionArray(drivers),   // fpResult
        2024
      );

      const inserts = getInsertCalls(client, 'sprint_result_entries');
      expect(inserts.length).toBe(drivers.length);
    });
  });

  it('rolls back and returns failure when DB throws', async () => {
    const client = {
      query: vi.fn()
        .mockResolvedValueOnce(undefined)                   // BEGIN
        .mockRejectedValueOnce(new Error('DB failure')),    // SELECT gran_prix
      release: vi.fn(),
    };
    const pool = { connect: vi.fn().mockResolvedValue(client) } as unknown as import('pg').Pool;
    const service = new DatabaseService(pool);

    const result = await service.setGpResult(1, false, [1, 99], [], [], [], [], [], 2024);

    expect(result.success).toBe(false);
    expect(result.message).toContain('Failed to save');
    const rollbackCall = client.query.mock.calls.find(([sql]: [string]) => sql === 'ROLLBACK');
    expect(rollbackCall).toBeDefined();
  });
});
