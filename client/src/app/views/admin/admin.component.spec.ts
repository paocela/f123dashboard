import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { signal } from '@angular/core';
import { Router } from '@angular/router';

import { AdminComponent } from './admin.component';
import { DbDataService } from 'src/app/service/db-data.service';
import { AuthService } from 'src/app/service/auth.service';
import type { Season, Driver, TrackData, ChampionshipData } from '@f123dashboard/shared';

describe('AdminComponent', () => {
  let component: AdminComponent;
  let fixture: ComponentFixture<AdminComponent>;
  let mockDbDataService: jasmine.SpyObj<DbDataService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;
  
  const mockSeasons: Season[] = [
    { id: 1, description: 'Season 2024', startDate: new Date('2024-01-01'), endDate: undefined }
  ];

  const mockDrivers: Driver[] = [
    { id: 1, username: 'driver1', first_name: 'John', surname: 'Doe' }
  ];

  const mockTracks: TrackData[] = [
    { track_id: 1, name: 'Monaco', country: 'Monaco', date: '2024-05-26T14:00:00Z', has_sprint: 0, has_x2: 0, besttime_driver_time: '1:10.123', username: 'Driver1' }
  ];

  const mockChampionship: ChampionshipData[] = [];

  beforeEach(async () => {
    mockDbDataService = jasmine.createSpyObj('DbDataService', [
      'getAllSeasons',
      'getDriversData',
      'getAllTracksBySeason',
      'getChampionshipBySeason',
      'setGpResult'
    ]);
    
    mockAuthService = jasmine.createSpyObj('AuthService', [], { currentUser: signal({ isAdmin: true, id: 1, username: 'admin', name: 'Admin', surname: 'User' }) });
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    mockDbDataService.getAllSeasons.and.returnValue(Promise.resolve(mockSeasons));
    mockDbDataService.getDriversData.and.returnValue(Promise.resolve(mockDrivers));
    mockDbDataService.getAllTracksBySeason.and.returnValue(Promise.resolve(mockTracks));
    mockDbDataService.getChampionshipBySeason.and.returnValue(Promise.resolve(mockChampionship));

    await TestBed.configureTestingModule({
      providers: [
        provideNoopAnimations(),
        { provide: DbDataService, useValue: mockDbDataService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter }
      ],
      imports: [AdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should redirect non-admin users to dashboard', async () => {
    TestBed.resetTestingModule();
    const nonAdminAuthService = jasmine.createSpyObj('AuthService', [], { currentUser: signal({ isAdmin: false, id: 2, username: 'user', name: 'Regular', surname: 'User' }) });
    const testRouter = jasmine.createSpyObj('Router', ['navigate']);
    const testDbDataService = jasmine.createSpyObj('DbDataService', [
      'getAllSeasons',
      'getDriversData',
      'getAllTracksBySeason',
      'getChampionshipBySeason',
      'setGpResult'
    ]);
    
    await TestBed.configureTestingModule({
      providers: [
        provideNoopAnimations(),
        { provide: DbDataService, useValue: testDbDataService },
        { provide: AuthService, useValue: nonAdminAuthService },
        { provide: Router, useValue: testRouter }
      ],
      imports: [AdminComponent]
    }).compileComponents();
    
    const testFixture = TestBed.createComponent(AdminComponent);
    const testComponent = testFixture.componentInstance;
    
    await testComponent.ngOnInit();
    
    expect(testRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should load seasons on initialization', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    
    expect(component.seasons()).toEqual(mockSeasons);
    expect(component.selectedSeason()).toBe(1);
  });

  it('should set loading states correctly during initialization', async () => {
    expect(component.isInitialLoading()).toBe(true);
    
    fixture.detectChanges();
    await fixture.whenStable();
    
    expect(component.isInitialLoading()).toBe(false);
  });

  it('should load season data when season changes', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    
    component.selectedSeason.set(1);
    await component.onSeasonChange();
    
    expect(mockDbDataService.getDriversData).toHaveBeenCalledWith(1);
    expect(mockDbDataService.getAllTracksBySeason).toHaveBeenCalledWith(1);
    expect(mockDbDataService.getChampionshipBySeason).toHaveBeenCalledWith(1);
  });

  it('should validate race results with DNF correctly', () => {
    // Set up 8 drivers — the array format is [pos1..posN, fastLap, dnf[]]
    component.piloti.set(Array.from({ length: 8 }, (_, i) => ({
      id: i + 1, username: `d${i + 1}`, first_name: 'A', surname: 'B'
    })));
    // Driver 1 is in both position 1 AND dnf — should fail duplicate/conflict check
    const invalidResults = [1, 0, 0, 0, 0, 0, 0, 0, 1, [1]];
    const result = component.validateSessionWithDnf(invalidResults, 'Test');
    
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('should validate qualifying results without DNF correctly', () => {
    // Set up 8 drivers — first position filled, rest empty → should fail (not all positions filled)
    component.piloti.set(Array.from({ length: 8 }, (_, i) => ({
      id: i + 1, username: `d${i + 1}`, first_name: 'A', surname: 'B'
    })));
    const incompleteResults = [1, 0, 0, 0, 0, 0, 0, 0];
    const result = component.validateSessionNoDnf(incompleteResults, 'Qualifying');
    
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('should get and set race results correctly', () => {
    const trackId = 1;
    const position = 1;
    const driverId = 5;
    
    component.setRaceResult(trackId, position, driverId);
    const result = component.getRaceResult(trackId, position);
    
    expect(result).toBe(driverId);
  });

  it('should get and set sprint results correctly', () => {
    const trackId = 1;
    const position = 2;
    const driverId = 3;
    
    component.setSprintResult(trackId, position, driverId);
    const result = component.getSprintResult(trackId, position);
    
    expect(result).toBe(driverId);
  });

  it('should detect duplicate drivers in positions', () => {
    component.piloti.set([
      { id: 1, username: 'd1', first_name: 'A', surname: 'B' },
      { id: 2, username: 'd2', first_name: 'C', surname: 'D' }
    ]);
    
    const positions = [1, 1]; // Duplicate driver
    const errors = component.getDriverValidationErrors(positions);
    
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(e => e.includes('più volte'))).toBe(true);
  });

  it('should return empty array for race results of non-existent track', () => {
    const result = component.getRaceResult(999, 1);
    expect(result).toBe(0);
  });

  it('should handle empty DNF array in race results', () => {
    const trackId = 1;
    component.setRaceResult(trackId, 10, []);
    const result = component.getRaceResult(trackId, 10);
    
    expect(Array.isArray(result)).toBe(true);
  });

  describe('driverCount signal', () => {
    it('returns 0 when piloti is empty', () => {
      component.piloti.set([]);
      expect(component.driverCount()).toBe(0);
    });

    it('reflects the current number of drivers in piloti', () => {
      const tenDrivers: Driver[] = Array.from({ length: 10 }, (_, i) => ({
        id: i + 1, username: `d${i + 1}`, first_name: 'A', surname: 'B'
      }));
      component.piloti.set(tenDrivers);
      expect(component.driverCount()).toBe(10);
    });
  });

  describe('posizioni computed map', () => {
    it('has N driver entries + Giro Veloce + DNF for N drivers', () => {
      const n = 6;
      component.piloti.set(Array.from({ length: n }, (_, i) => ({
        id: i + 1, username: `d${i + 1}`, first_name: 'A', surname: 'B'
      })));

      const map = component.posizioni();
      expect(map.size).toBe(n + 2); // positions 1..N, N+1=GV, N+2=DNF
    });

    it('labels position N+1 as Giro Veloce', () => {
      const n = 8;
      component.piloti.set(Array.from({ length: n }, (_, i) => ({
        id: i + 1, username: `d${i + 1}`, first_name: 'A', surname: 'B'
      })));

      expect(component.posizioni().get(n + 1)).toBe('Giro Veloce');
    });

    it('labels position N+2 as DNF', () => {
      const n = 8;
      component.piloti.set(Array.from({ length: n }, (_, i) => ({
        id: i + 1, username: `d${i + 1}`, first_name: 'A', surname: 'B'
      })));

      expect(component.posizioni().get(n + 2)).toBe('DNF');
    });

    it('updates when piloti count changes', () => {
      component.piloti.set(Array.from({ length: 6 }, (_, i) => ({
        id: i + 1, username: `d${i + 1}`, first_name: 'A', surname: 'B'
      })));
      expect(component.posizioni().size).toBe(8); // 6+2

      component.piloti.set(Array.from({ length: 10 }, (_, i) => ({
        id: i + 1, username: `d${i + 1}`, first_name: 'A', surname: 'B'
      })));
      expect(component.posizioni().size).toBe(12); // 10+2
    });
  });

  describe('initializeResults with N drivers', () => {
    function makeDrivers(n: number): Driver[] {
      return Array.from({ length: n }, (_, i) => ({
        id: i + 1, username: `d${i + 1}`, first_name: 'A', surname: 'B'
      }));
    }

    function makeChampionshipEntry(trackName: string): ChampionshipData {
      return {
        gran_prix_id: 1, track_name: trackName,
        gran_prix_date: new Date(), gran_prix_has_sprint: 0, gran_prix_has_x2: 0, track_country: 'IT',
        sessions: {}, fastLapDrivers: {}
      };
    }

    it('creates race array of length N+2 (positions + fast_lap slot + DNF slot)', () => {
      const n = 10;
      const trackName = 'Monza';
      const track: TrackData = { track_id: 1, name: trackName, country: 'Italy', date: '2024-01-01', has_sprint: 0, has_x2: 0, besttime_driver_time: '1:10', username: 'd1' };
      component.piloti.set(makeDrivers(n));
      component.tracks.set([track]);
      component.championshipData.set([makeChampionshipEntry(trackName)]);

      component.initializeResults();

      component.raceResults().forEach(arr => {
        expect(arr.length).toBe(n + 2);
        arr.slice(0, n).forEach((v: unknown) => expect(v).toBe(0));
        expect(Array.isArray(arr[n + 1])).toBeTrue();
      });
    });

    it('creates quali/fp arrays of length N (no extra slots)', () => {
      const n = 6;
      const trackName = 'Monaco';
      const track: TrackData = { track_id: 2, name: trackName, country: 'Monaco', date: '2024-01-01', has_sprint: 0, has_x2: 0, besttime_driver_time: '1:10', username: 'd1' };
      component.piloti.set(makeDrivers(n));
      component.tracks.set([track]);
      component.championshipData.set([makeChampionshipEntry(trackName)]);

      component.initializeResults();

      component.qualiResults().forEach(arr => expect(arr.length).toBe(n));
      component.fpResults().forEach(arr => expect(arr.length).toBe(n));
    });
  });

  describe('validateSessionWithDnf – N drivers', () => {
    function makeDrivers(n: number): Driver[] {
      return Array.from({ length: n }, (_, i) => ({ id: i + 1, username: `d${i + 1}`, first_name: 'A', surname: 'B' }));
    }

    it('passes with exactly N finishers, a fast lap, and no DNF', () => {
      const n = 6;
      component.piloti.set(makeDrivers(n));
      // [pos1..posN, fastLap, []]
      const arr = [...Array.from({ length: n }, (_, i) => i + 1), n + 1, []];
      const result = component.validateSessionWithDnf(arr, 'Gara');
      expect(result.isValid).toBeTrue();
    });

    it('fails when fast lap is missing', () => {
      const n = 6;
      component.piloti.set(makeDrivers(n));
      const arr = [...Array.from({ length: n }, (_, i) => i + 1), 0, []];
      const result = component.validateSessionWithDnf(arr, 'Gara');
      expect(result.isValid).toBeFalse();
      expect(result.errors.some(e => e.includes('giro veloce'))).toBeTrue();
    });

    it('fails when array is too short for the current driver count', () => {
      component.piloti.set(makeDrivers(10));
      const shortArr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0, []]; // only 9 positions
      const result = component.validateSessionWithDnf(shortArr, 'Gara');
      expect(result.isValid).toBeFalse();
      expect(result.errors.some(e => e.includes('incompleti'))).toBeTrue();
    });

    it('passes with N-1 finishers and 1 DNF (last position slot empty)', () => {
      const n = 6;
      component.piloti.set(makeDrivers(n));
      // positions: [1,2,3,4,5,0], fast_lap: 1, dnf: [6]
      const arr = [1, 2, 3, 4, 5, 0, 1, [6]];
      const result = component.validateSessionWithDnf(arr, 'Gara');
      expect(result.isValid).toBeTrue();
    });
  });

  describe('validateSessionNoDnf – N drivers', () => {
    function makeDrivers(n: number): Driver[] {
      return Array.from({ length: n }, (_, i) => ({ id: i + 1, username: `d${i + 1}`, first_name: 'A', surname: 'B' }));
    }

    it('passes with exactly N unique valid drivers', () => {
      const n = 6;
      component.piloti.set(makeDrivers(n));
      const arr = Array.from({ length: n }, (_, i) => i + 1);
      const result = component.validateSessionNoDnf(arr, 'Qualifica');
      expect(result.isValid).toBeTrue();
    });

    it('fails when array has fewer entries than driverCount', () => {
      component.piloti.set(makeDrivers(10));
      const arr = [1, 2, 3, 4, 5, 6, 7, 8]; // only 8 for a 10-driver season
      const result = component.validateSessionNoDnf(arr, 'Qualifica');
      expect(result.isValid).toBeFalse();
      expect(result.errors.some(e => e.includes('incompleti'))).toBeTrue();
    });

    it('fails when there are duplicate drivers', () => {
      const n = 4;
      component.piloti.set(makeDrivers(n));
      const arr = [1, 1, 3, 4]; // driver 1 duplicated
      const result = component.validateSessionNoDnf(arr, 'Qualifica');
      expect(result.isValid).toBeFalse();
      expect(result.errors.some(e => e.includes('duplicat'))).toBeTrue();
    });
  });
});
