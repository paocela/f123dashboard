import { describe, expect, it, vi } from 'vitest';
import { DatabaseService } from '../services/database.service.js';
import { CarService } from '../services/car.service.js';

describe('DatabaseService.getGpSchedule', () => {
  it('serializes UTC wall-clock timestamps with an explicit UTC offset', async () => {
    const query = vi.fn().mockResolvedValue({
      rows: [{
        id: '11',
        track_id: null,
        name: null,
        date: '2026-06-01T00:30:00Z',
        has_sprint: '0',
        has_x2: '0',
        country: null,
        besttime_driver_time: null,
        username: null
      }]
    });
    const service = new DatabaseService({ query } as unknown as import('pg').Pool, new CarService());

    const schedule = await service.getGpSchedule();

    expect(schedule[0].date).toBe('2026-06-01T00:30:00Z');
    expect(query.mock.calls[0][0]).toContain(`to_char(gp.date, 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS date`);
  });
});
