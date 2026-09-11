import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import type { EligibleTrack, GPEditItem } from '@f123dashboard/shared';
import { GpEditService } from '../../../service/gp-edit.service';
import { TrackExtractionComponent } from './track-extraction.component';

describe('TrackExtractionComponent', () => {
  let component: TrackExtractionComponent;
  let fixture: ComponentFixture<TrackExtractionComponent>;
  let mockGpEditService: jasmine.SpyObj<GpEditService>;

  const tracks: EligibleTrack[] = [
    { id: 1, name: 'Monza', country: 'Italy' },
    { id: 2, name: 'Silverstone', country: 'United Kingdom' }
  ];
  const unassignedGp: GPEditItem = {
    id: 10,
    date: new Date('2026-05-24T14:00'),
    track_id: null,
    track_name: 'Da assegnare',
    has_sprint: false,
    has_x2: false
  };

  beforeEach(async () => {
    mockGpEditService = jasmine.createSpyObj('GpEditService', [
      'getEligibleTracks',
      'getUpcomingGps',
      'updateGp'
    ]);
    mockGpEditService.getEligibleTracks.and.returnValue(of({ success: true, data: tracks }));
    mockGpEditService.getUpcomingGps.and.returnValue(of({ success: true, data: [unassignedGp] }));
    mockGpEditService.updateGp.and.returnValue(of({ success: true }));

    await TestBed.configureTestingModule({
      providers: [
        provideNoopAnimations(),
        { provide: GpEditService, useValue: mockGpEditService }
      ],
      imports: [TrackExtractionComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TrackExtractionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should load eligible tracks on initialization', () => {
    expect(component).toBeTruthy();
    expect(mockGpEditService.getEligibleTracks).toHaveBeenCalled();
    expect(component.tracks()).toEqual(tracks);
    expect(component.isLoading()).toBeFalse();
  });

  it('should show an error when eligible tracks cannot be loaded', () => {
    mockGpEditService.getEligibleTracks.and.returnValue(throwError(() => new Error('Load error')));

    component.loadEligibleTracks();

    expect(component.hasError()).toBeTrue();
    expect(component.isLoading()).toBeFalse();
  });

  it('should lock the wheel until its rotation transition ends', fakeAsync(() => {
    component.spinWheel();

    expect(component.isSpinning()).toBeTrue();
    expect(tracks).toContain(component.selectedTrack()!);

    component.onWheelTransitionEnd(new TransitionEvent('transitionend', { propertyName: 'transform' }));
    tick(500);

    expect(component.isSpinning()).toBeFalse();
    expect(component.assignmentModalVisible()).toBeTrue();
    expect(component.pendingTrackAssignment()?.gp).toEqual(unassignedGp);
  }));

  it('should assign the selected track only after confirmation', fakeAsync(() => {
    component.spinWheel();
    component.onWheelTransitionEnd(new TransitionEvent('transitionend', { propertyName: 'transform' }));
    tick(500);

    const selectedTrack = component.selectedTrack();
    component.confirmTrackAssignment();

    expect(mockGpEditService.updateGp).toHaveBeenCalledWith(unassignedGp.id, { track_id: selectedTrack?.id });
    expect(component.assignmentModalVisible()).toBeFalse();
    expect(component.selectedTrack()).toBeNull();
    expect(component.toasts()).toContain(jasmine.objectContaining({ color: 'success' }));
  }));

  it('should show an error toast when track assignment fails', fakeAsync(() => {
    mockGpEditService.updateGp.and.returnValue(throwError(() => new Error('Assignment error')));
    component.spinWheel();
    component.onWheelTransitionEnd(new TransitionEvent('transitionend', { propertyName: 'transform' }));
    tick(500);

    component.confirmTrackAssignment();

    expect(component.hasAssignmentError()).toBeTrue();
    expect(component.toasts()).toContain(jasmine.objectContaining({ color: 'danger' }));
  }));

  it('should not spin without eligible tracks', () => {
    component.tracks.set([]);

    component.spinWheel();

    expect(component.isSpinning()).toBeFalse();
    expect(component.selectedTrack()).toBeNull();
  });
});