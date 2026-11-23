import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import type { User } from '@f123dashboard/shared';

import { DbDataService } from './db-data.service';

describe('DbDataService', () => {
  let service: DbDataService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [provideNoopAnimations(), provideHttpClient(), provideHttpClientTesting()],});
    service = TestBed.inject(DbDataService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('preloads unassigned GPs without adding them to assigned-track data', async () => {
    const loading = service.allData();
    for (const request of http.match(() => true)) {
      request.flush(request.request.url.endsWith('/gp-schedule') ? {
        success: true,
        data: [{
          id: 8, track_id: null, name: null, country: null, date: '2027-01-01T14:00:00Z',
          has_sprint: 0, has_x2: 0, besttime_driver_time: null, username: null
        }]
      } : []);
    }
    await loading;

    expect(service.gpSchedule().map(gp => gp.id)).toEqual([8]);
    expect(service.gpSchedule()[0].track_id).toBeNull();
    expect(service.tracks()).toEqual([]);
  });

  it('rejects schedule failures instead of treating them as a successful preload', async () => {
    const loading = service.allData();
    for (const request of http.match(() => true)) {
      request.flush(request.request.url.endsWith('/gp-schedule') ? {
        success: false, data: [], message: 'Schedule unavailable'
      } : []);
    }
    await expectAsync(loading).toBeRejectedWithError('Schedule unavailable');
  });

  it('refreshes GP schedule data independently after a GP mutation', async () => {
    const refresh = service.refreshGpSchedule();
    const request = http.expectOne('/api/database/gp-schedule');
    request.flush({
      success: true,
      data: [{
        id: 12, track_id: null, name: null, country: null, date: '2027-01-02T14:00:00Z',
        has_sprint: 0, has_x2: 0, besttime_driver_time: null, username: null
      }]
    });
    await refresh;

    expect(service.gpSchedule().map(gp => gp.id)).toEqual([12]);
  });

  it('renders a serialized database buffer as a base64 avatar', () => {
    const user: User = JSON.parse('{"id":1,"username":"driver","name":"A","surname":"B","image":{"type":"Buffer","data":[1,2,3]}}');

    expect(service.getAvatarSrc(user)).toBe('data:image/jpeg;base64,AQID');
  });

  it('rejects malformed serialized avatar data', () => {
    const user: User = JSON.parse('{"id":1,"username":"driver","name":"A","surname":"B","image":{"data":"3"}}');

    expect(() => service.getAvatarSrc(user)).toThrowError(TypeError, 'Invalid avatar image data');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
