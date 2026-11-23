import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import type { EligibleTrack, GPEditItem } from '@f123dashboard/shared';
import { GpEditService } from '../../../service/gp-edit.service';
import { DbDataService } from '../../../service/db-data.service';
import { TrackExtractionComponent, buildFormatEntries } from './track-extraction.component';

describe('buildFormatEntries', () => {
  it('should contain exactly the requested number of sprints', () => {
    const entries = buildFormatEntries(20, 6);

    expect(entries.length).toBe(20);
    expect(entries.filter((format) => format === 'sprint').length).toBe(6);
  });

  it('should clamp sprints to the number of entries', () => {
    expect(buildFormatEntries(3, 6)).toEqual(['sprint', 'sprint', 'sprint']);
  });

  it('should be all regular when no sprints are left', () => {
    expect(buildFormatEntries(4, 0)).toEqual(['regular', 'regular', 'regular', 'regular']);
  });

  it('should spread sprints instead of grouping them', () => {
    expect(buildFormatEntries(6, 2)).toEqual(['regular', 'regular', 'sprint', 'regular', 'regular', 'sprint']);
  });
});

describe('TrackExtractionComponent', () => {
  let component: TrackExtractionComponent;
  let fixture: ComponentFixture<TrackExtractionComponent>;
  let mockGpEditService: jasmine.SpyObj<GpEditService>;
  let mockDbDataService: jasmine.SpyObj<DbDataService>;

  const tracks: EligibleTrack[] = [
    { id: 1, name: 'Monza', country: 'Italy' },
    { id: 2, name: 'Silverstone', country: 'United Kingdom' },
    { id: 3, name: 'Spa', country: 'Belgium' },
    { id: 4, name: 'Suzuka', country: 'Japan' }
  ];
  const unassignedGp: GPEditItem = {
    id: 10,
    date: '2026-05-24T14:00',
    track_id: null,
    track_name: 'Da assegnare',
    has_sprint: false,
    has_x2: false,
    has_results: false,
    is_past: false
  };

  function drawTrackAndFormat(trackIndex: number, formatIndex: number): void {
    component.onTrackSpinStart();
    component.onTrackSpinEnd(trackIndex);
    component.onFormatSpinStart();
    component.onFormatSpinEnd(formatIndex);
    tick(500);
  }

  beforeEach(async () => {
    mockGpEditService = jasmine.createSpyObj('GpEditService', [
      'getEligibleTracks',
      'getSprintDrawInfo',
      'getUpcomingGps',
      'updateGp'
    ]);
    mockGpEditService.getEligibleTracks.and.returnValue(of({ success: true, data: tracks }));
    mockGpEditService.getSprintDrawInfo.and.returnValue(of({ success: true, data: { remaining_sprints: 1 } }));
    mockGpEditService.getUpcomingGps.and.returnValue(of({ success: true, data: [unassignedGp] }));
    mockGpEditService.updateGp.and.returnValue(of({ success: true }));
    mockDbDataService = jasmine.createSpyObj('DbDataService', ['refreshGpSchedule']);
    mockDbDataService.refreshGpSchedule.and.resolveTo();

    await TestBed.configureTestingModule({
      providers: [
        provideNoopAnimations(),
        { provide: GpEditService, useValue: mockGpEditService },
        { provide: DbDataService, useValue: mockDbDataService }
      ],
      imports: [TrackExtractionComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TrackExtractionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should load eligible tracks and remaining sprints on initialization', () => {
    expect(component.tracks()).toEqual(tracks);
    expect(component.remainingSprints()).toBe(1);
    expect(component.isLoading()).toBeFalse();
    expect(component.stage()).toBe('track');
  });

  it('should display GP dates in UTC', () => {
    expect(component.formatGpDate('2026-05-24T14:00')).toBe('24/05/2026, 14:00');
  });

  it('should show an error when draw data cannot be loaded', () => {
    mockGpEditService.getSprintDrawInfo.and.returnValue(throwError(() => new Error('Load error')));

    component.loadEligibleTracks();

    expect(component.hasError()).toBeTrue();
    expect(component.isLoading()).toBeFalse();
  });

  it('should build one format entry per remaining race with the remaining sprints', () => {
    expect(component.formatEntries().length).toBe(tracks.length);
    expect(component.sprintEntryCount()).toBe(1);
    expect(component.formatSegments().length).toBe(tracks.length);
  });

  it('should move to the format wheel once the track wheel stops', () => {
    component.onTrackSpinStart();
    expect(component.isSpinning()).toBeTrue();

    component.onTrackSpinEnd(2);

    expect(component.isSpinning()).toBeFalse();
    expect(component.selectedTrack()).toEqual(tracks[2]);
    expect(component.drawnTrackIndex()).toBe(2);
    expect(component.stage()).toBe('format');
    expect(component.assignmentModalVisible()).toBeFalse();
  });

  it('should keep the track wheel highlighted and show the small format wheel next to it', () => {
    component.onTrackSpinEnd(1);
    fixture.detectChanges();

    const wheels = fixture.nativeElement.querySelectorAll('app-spin-wheel');
    expect(wheels.length).toBe(2);
    expect(wheels[1].classList).toContain('format-wheel');
    expect(wheels[1].classList).toContain('is-small');
    expect(wheels[0].querySelector('.wheel-label.is-highlighted').textContent.trim()).toBe(tracks[1].name);
    expect(wheels[0].querySelector('.wheel-hub').disabled).toBeTrue();
  });

  it('should label and colour format segments by format only', () => {
    const segments = component.formatSegments();
    const sprint = segments.filter((segment) => segment.label === 'Sprint');
    const normal = segments.filter((segment) => segment.label === 'Normale');

    expect(sprint.length).toBe(1);
    expect(normal.length).toBe(tracks.length - 1);
    expect(new Set(sprint.map((segment) => segment.color)).size).toBe(1);
    expect(new Set(normal.map((segment) => segment.color)).size).toBe(1);
    expect(sprint[0].color).not.toBe(normal[0].color);
  });

  it('should open the assignment modal after the format wheel stops', fakeAsync(() => {
    const sprintIndex = component.formatEntries().indexOf('sprint');

    drawTrackAndFormat(0, sprintIndex);

    expect(component.selectedFormat()).toBe('sprint');
    expect(component.assignmentModalVisible()).toBeTrue();
    expect(component.pendingTrackAssignment()).toEqual({ track: tracks[0], format: 'sprint', gp: unassignedGp });
  }));

  it('should assign the track and sprint format after confirmation', fakeAsync(() => {
    drawTrackAndFormat(1, component.formatEntries().indexOf('sprint'));

    component.confirmTrackAssignment();

    expect(mockGpEditService.updateGp).toHaveBeenCalledWith(unassignedGp.id, { track_id: tracks[1].id, has_sprint: true });
    expect(component.assignmentModalVisible()).toBeFalse();
    expect(component.selectedTrack()).toBeNull();
    expect(component.stage()).toBe('track');
    expect(component.toasts()).toContain(jasmine.objectContaining({ color: 'success' }));
    expect(mockDbDataService.refreshGpSchedule).toHaveBeenCalled();
  }));

  it('should assign a regular format as a non-sprint GP', fakeAsync(() => {
    drawTrackAndFormat(1, component.formatEntries().indexOf('regular'));

    component.confirmTrackAssignment();

    expect(mockGpEditService.updateGp).toHaveBeenCalledWith(unassignedGp.id, { track_id: tracks[1].id, has_sprint: false });
  }));

  it('should go back to the track wheel when the draw is cancelled', fakeAsync(() => {
    drawTrackAndFormat(0, 0);

    component.cancelDraw();

    expect(component.assignmentModalVisible()).toBeFalse();
    expect(component.stage()).toBe('track');
    expect(component.selectedTrack()).toBeNull();
    expect(component.selectedFormat()).toBeNull();
    expect(component.drawnTrackIndex()).toBeNull();
    expect(mockGpEditService.updateGp).not.toHaveBeenCalled();
  }));

  it('should show an error toast when track assignment fails', fakeAsync(() => {
    mockGpEditService.updateGp.and.returnValue(throwError(() => new Error('Assignment error')));
    drawTrackAndFormat(0, 0);

    component.confirmTrackAssignment();

    expect(component.hasAssignmentError()).toBeTrue();
    expect(component.toasts()).toContain(jasmine.objectContaining({ color: 'danger' }));
  }));
});
