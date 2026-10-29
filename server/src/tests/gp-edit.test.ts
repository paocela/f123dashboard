import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../server.js'; // Ensure server.ts exports 'app' default (it does)
import pool from '../config/db.js';

// Mock auth middleware to bypass checks
vi.mock('../middleware/auth.middleware.js', async () => {
  const mocks = await import('./mocks');
  return mocks.mockAuthMiddleware;
});

// Mock DB pool
vi.mock('../config/db.js', async () => {
  const mocks = await import('./mocks');
  return mocks.mockDb;
});

describe('GP Edit API', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    // Default fallback to prevent "undefined" errors if mocks are exhausted
    (pool.query as any).mockResolvedValue({ rows: [], rowCount: 0 });
  });

  describe('POST /api/gp-edit/list', () => {
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
      expect(pool.query).toHaveBeenLastCalledWith(expect.stringContaining('LEFT JOIN tracks'), [2025]);
    });

    it('should handle errors', async () => {
      // Mock season fetch failure
      (pool.query as any).mockRejectedValueOnce(new Error('DB Error'));

      const res = await request(app).post('/api/gp-edit/list');

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
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
        (pool.query as any).mockResolvedValueOnce({ rows: [{ id: 100, date: '2025-01-01', track_id: 5, has_sprint: 1, has_x2: 0 }] });
        // Mock track fetch
        (pool.query as any).mockResolvedValueOnce({ rows: [{ name: 'Bahrain' }] });

        const res = await request(app)
            .post('/api/gp-edit/create')
            .send({ date: '2025-01-01', track_id: 5, has_sprint: true, has_x2: false });
        
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.track_name).toBe('Bahrain');
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
    it('should update GP and handle sprint ID logic', async () => {
      (pool.query as any).mockResolvedValueOnce({ rowCount: 1 });

      // Corrected route path: /api/gp-edit/update/:id
      const res = await request(app)
        .post('/api/gp-edit/update/1')
        .send({ has_sprint: true });

      expect(res.status).toBe(200);
      // Verify query contains logic from refactoring
      // But we call clearAllMocks. check calls[0].
      const callArgs = (pool.query as any).mock.calls[0];
      const querySql = callArgs[0];
      expect(querySql).toContain('sprint_results_id = COALESCE');
    });

    it('should update a GP track assignment', async () => {
      (pool.query as any).mockResolvedValueOnce({ rowCount: 1 });

      const res = await request(app)
        .post('/api/gp-edit/update/1')
        .send({ track_id: 2 });

      expect(res.status).toBe(200);
      expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('track_id = $1'), [2, 1]);
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
        expect(pool.query).toHaveBeenLastCalledWith(expect.stringContaining('UPDATE gran_prix'), [7, 2025]);
    });
  });
});
