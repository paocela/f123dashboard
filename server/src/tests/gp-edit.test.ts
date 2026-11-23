import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../server.js'; // Ensure server.ts exports 'app' default (it does)
import pool from '../config/db.js';

const { poolQuery, mutationClient } = vi.hoisted(() => ({
  poolQuery: vi.fn(),
  mutationClient: { query: vi.fn(), release: vi.fn() }
}));

// Mock auth middleware to bypass checks
vi.mock('../middleware/auth.middleware.js', async () => {
  const mocks = await import('./mocks');
  return mocks.mockAuthMiddleware;
});

// Mock DB pool
vi.mock('../config/db.js', async () => {
  const mocks = await import('./mocks');
  return {
    default: {
      ...mocks.mockDb.default,
      query: poolQuery,
      connect: vi.fn().mockResolvedValue(mutationClient)
    }
  };
});

describe('GP Edit API', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    // Default fallback to prevent "undefined" errors if mocks are exhausted
    (pool.query as any).mockResolvedValue({ rows: [], rowCount: 0 });
    vi.mocked(pool.connect).mockImplementation(async () => mutationClient);
    mutationClient.query.mockImplementation(async (sql: string) => {
      if (sql.startsWith('SELECT id FROM gran_prix WHERE id')) {
        return { rows: [{ id: 1 }], rowCount: 1 };
      }
      if (sql.includes('AS has_results')) {
        return { rows: [{ has_results: false }], rowCount: 1 };
      }
      if (sql.startsWith('SELECT id FROM gran_prix WHERE date')) {
        return { rows: [{ id: 5 }, { id: 6 }], rowCount: 2 };
      }
      return { rows: [], rowCount: 1 };
    });
  });

  describe('POST /api/gp-edit/list', () => {
    it('compares GP timestamps as UTC wall-clock values', async () => {
      poolQuery.mockResolvedValueOnce({ rows: [{ id: 2026 }] });
      poolQuery.mockResolvedValueOnce({ rows: [] });

      const res = await request(app).post('/api/gp-edit/list');

      expect(res.status).toBe(200);
      const query = poolQuery.mock.calls[1][0] as string;
      expect(query.match(/NOW\(\) AT TIME ZONE 'UTC'/g)).toHaveLength(2);
    });

    it('includes past races only when requested and exposes result protection', async () => {
      poolQuery.mockResolvedValueOnce({ rows: [{ id: 2026 }] });
      poolQuery.mockResolvedValueOnce({
        rows: [{
          id: 4, date: '2026-01-01T14:00', track_id: null, track_name: null,
          has_sprint: 0, has_x2: 0, has_results: true, is_past: true
        }]
      });

      const res = await request(app).post('/api/gp-edit/list').send({ includePast: true });

      expect(res.status).toBe(200);
      expect(res.body.data[0]).toMatchObject({ id: 4, has_results: true, is_past: true });
      expect(pool.query).toHaveBeenLastCalledWith(expect.stringContaining('$2'), [2026, true]);
    });

    it('should return list of upcoming GPs', async () => {
      // Mock season fetch
      (pool.query as any).mockResolvedValueOnce({ rows: [{ id: 2025 }] });
      
      const mockRows = [
        { id: 1, date: new Date(), track_id: 1, track_name: 'Monza', has_sprint: 0, has_x2: 0 }
      ];
      // Mock list fetch
      (pool.query as any).mockResolvedValueOnce({ rows: mockRows });

      const res = await request(app).post('/api/gp-edit/list');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].track_name).toBe('Monza');
      expect(res.body.data[0].has_sprint).toBe(false); // Converted in service
      expect(pool.query).toHaveBeenLastCalledWith(expect.stringContaining('LEFT JOIN tracks'), [2025, false]);
    });

    it('should return GP dates as UTC wall-clock strings', async () => {
      (pool.query as any).mockResolvedValueOnce({ rows: [{ id: 2025 }] });
      (pool.query as any).mockResolvedValueOnce({
        rows: [{
          id: 1,
          date: '2025-05-25T14:00',
          track_id: 1,
          track_name: 'Monza',
          has_sprint: 0,
          has_x2: 0
        }]
      });

      const res = await request(app).post('/api/gp-edit/list');

      expect(res.status).toBe(200);
      expect(res.body.data[0].date).toBe('2025-05-25T14:00');
      expect((pool.query as any).mock.calls[1][0]).toContain('to_char(gp.date');
    });

    it('should handle errors', async () => {
      // Mock season fetch failure
      (pool.query as any).mockRejectedValueOnce(new Error('DB Error'));

      const res = await request(app).post('/api/gp-edit/list');

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  it('does not expose database exception details from the public schedule endpoint', async () => {
    poolQuery.mockRejectedValueOnce(new Error('database connection user=internal'));

    const res = await request(app).post('/api/database/gp-schedule').send({});

    expect(res.status).toBe(500);
    expect(res.body.message).toBe('Failed to get GP schedule');
    expect(res.body.message).not.toContain('internal');
  });

  describe('POST /api/gp-edit/tracks', () => {
    it('normalizes bigint track IDs to numbers', async () => {
      poolQuery.mockResolvedValueOnce({
        rows: [{ id: '1', name: 'Monza' }]
      });

      const res = await request(app).post('/api/gp-edit/tracks');

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([{ id: 1, name: 'Monza' }]);
    });
  });

  describe('POST /api/gp-edit/eligible-tracks', () => {
    it('should return tracks enabled for the latest season and not assigned to a GP', async () => {
      (pool.query as any).mockResolvedValueOnce({ rows: [{ id: 2026 }] });
      (pool.query as any).mockResolvedValueOnce({
        rows: [{ id: '7', name: 'Monza', country: 'Italy' }]
      });

      const res = await request(app).post('/api/gp-edit/eligible-tracks');

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        success: true,
        data: [{ id: 7, name: 'Monza', country: 'Italy' }]
      });
      expect(pool.query).toHaveBeenLastCalledWith(
        expect.stringContaining('INNER JOIN track_seasons'),
        [2026]
      );
      expect(pool.query).toHaveBeenLastCalledWith(
        expect.stringContaining('NOT EXISTS'),
        [2026]
      );
    });

    it('should return no eligible tracks when no season exists', async () => {
      (pool.query as any).mockResolvedValueOnce({ rows: [] });

      const res = await request(app).post('/api/gp-edit/eligible-tracks');

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ success: true, data: [] });
      expect(pool.query).toHaveBeenCalledTimes(1);
    });

    it('should handle eligible-track lookup errors', async () => {
      (pool.query as any).mockRejectedValueOnce(new Error('DB Error'));

      const res = await request(app).post('/api/gp-edit/eligible-tracks');

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });
  
  describe('POST /api/gp-edit/create', () => {
     it('should create a GP', async () => {
        // Mock season fetch
        (pool.query as any).mockResolvedValueOnce({ rows: [{ id: 10 }] }); 
        // Mock insert
        (pool.query as any).mockResolvedValueOnce({ rows: [{ id: 100, date: '2025-01-01T14:00', track_id: 5, has_sprint: 1, has_x2: 0 }] });
        // Mock track fetch
        (pool.query as any).mockResolvedValueOnce({ rows: [{ name: 'Bahrain' }] });

        const res = await request(app)
            .post('/api/gp-edit/create')
            .send({ date: '2025-01-01', track_id: 5, has_sprint: true, has_x2: false });
        
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.track_name).toBe('Bahrain');
        expect(res.body.data.date).toBe('2025-01-01T14:00');
        expect((pool.query as any).mock.calls[1][0]).toContain('to_char(date');
     });

     it('should create a GP without an assigned track', async () => {
        (pool.query as any).mockResolvedValueOnce({ rows: [{ id: 10 }] });
        (pool.query as any).mockResolvedValueOnce({ rows: [{ id: 100, date: '2025-01-01', track_id: null, has_sprint: 0, has_x2: 0 }] });

        const res = await request(app)
          .post('/api/gp-edit/create')
          .send({ date: '2025-01-01', track_id: null, has_sprint: false, has_x2: false });

        expect(res.status).toBe(200);
        expect(res.body.data.track_name).toBe('Da assegnare');
        expect(pool.query).toHaveBeenCalledTimes(2);
     });
  });

  describe('POST /api/gp-edit/update', () => {
    it.each([
      ['race_result_entries', 'race_results_id', 'race_results_id'],
      ['sprint_result_entries', 'sprint_results_id', 'sprint_results_id'],
      ['qualifying_result_entries', 'qualifying_results_id', 'qualifying_results_id'],
      ['free_practice_result_entries', 'free_practice_results_id', 'free_practice_results_id'],
      ['full_race_result_entries', 'race_results_id', 'full_race_results_id']
    ])('checks actual entries in %s rather than allocated result IDs', async (table, entryKey, gpKey) => {
      const res = await request(app).post('/api/gp-edit/update/1').send({ has_x2: true });

      expect(res.status).toBe(200);
      expect(mutationClient.query).toHaveBeenCalledWith(
        expect.stringContaining(`EXISTS (SELECT 1 FROM ${table} WHERE ${entryKey} = gp.${gpKey})`),
        [1]
      );
      expect(mutationClient.query).toHaveBeenCalledWith(expect.stringContaining('FOR UPDATE'), [1]);
      expect(mutationClient.query).toHaveBeenLastCalledWith('COMMIT');
    });

    it.each(['update', 'delete'])('reports a missing GP for %s instead of succeeding', async action => {
      mutationClient.query
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [], rowCount: 0 });

      const res = await request(app).post(`/api/gp-edit/${action}/999`).send({ date: '2027-01-01T14:00' });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(mutationClient.query).toHaveBeenLastCalledWith('ROLLBACK');
    });

    it.each(['update', 'delete'])('rejects %s when any session has results', async (action) => {
      mutationClient.query
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ id: 1 }], rowCount: 1 })
        .mockResolvedValueOnce({ rows: [{ has_results: true }], rowCount: 1 });

      const res = await request(app)
        .post(`/api/gp-edit/${action}/1`)
        .send({ has_sprint: false });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(mutationClient.query).not.toHaveBeenCalledWith(
        expect.stringMatching(/^(UPDATE|DELETE)/), expect.anything()
      );
      expect(mutationClient.query).toHaveBeenLastCalledWith('ROLLBACK');
      expect(mutationClient.release).toHaveBeenCalled();
    });

    it('should update GP and handle sprint ID logic', async () => {
      (pool.query as any).mockResolvedValueOnce({ rowCount: 1 });

      // Corrected route path: /api/gp-edit/update/:id
      const res = await request(app)
        .post('/api/gp-edit/update/1')
        .send({ has_sprint: true });

      expect(res.status).toBe(200);
      // Verify query contains logic from refactoring
      // But we call clearAllMocks. check calls[0].
      const callArgs = mutationClient.query.mock.calls.find(([sql]) => sql.startsWith('UPDATE'));
      const querySql = callArgs![0];
      expect(querySql).toContain('sprint_results_id = COALESCE');
    });

    it('should update a GP track assignment', async () => {
      (pool.query as any).mockResolvedValueOnce({ rowCount: 1 });

      const res = await request(app)
        .post('/api/gp-edit/update/1')
        .send({ track_id: 2 });

      expect(res.status).toBe(200);
      expect(mutationClient.query).toHaveBeenCalledWith(expect.stringContaining('track_id = $1'), [2, 1]);
    });
  });

  describe('POST /api/gp-edit/bulk-update-date', () => {
    it('should update dates', async () => {
        // Mock season fetch
        (pool.query as any).mockResolvedValueOnce({ rows: [{ id: 2025 }] });
        // Mock update
        (pool.query as any).mockResolvedValueOnce({ rowCount: 5 });

        const res = await request(app)
            .post('/api/gp-edit/bulk-update-date')
            .send({ daysOffset: 7 });
        
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(mutationClient.query).toHaveBeenCalledWith(expect.stringContaining('UPDATE gran_prix'), [7, [5, 6]]);
        expect(mutationClient.query).toHaveBeenCalledWith(expect.stringContaining('AND NOT ('), [7, [5, 6]]);
        expect(mutationClient.query.mock.calls.find(([query]) => String(query).includes('SELECT id FROM gran_prix'))?.[0])
          .toContain("NOW() AT TIME ZONE 'UTC'");
    });

    describe('POST /api/database/gp-schedule', () => {
      it('returns unassigned events with distinct GP IDs and nullable track metadata', async () => {
        poolQuery.mockResolvedValueOnce({
          rows: [
            { id: 11, track_id: null, name: null, country: null, date: '2026-12-01T14:00', has_sprint: 1, has_x2: 0, besttime_driver_time: null, username: null },
            { id: 12, track_id: null, name: null, country: null, date: '2026-12-08T14:00', has_sprint: 0, has_x2: 1, besttime_driver_time: null, username: null }
          ]
        });

        const res = await request(app).post('/api/database/gp-schedule').send({ seasonId: 2026 });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.map((gp: { id: number }) => gp.id)).toEqual([11, 12]);
        expect(res.body.data[0].track_id).toBeNull();
        expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('FROM gran_prix gp'), [2026]);
        expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('LEFT JOIN tracks'), [2026]);
      });
    });
  });
});
