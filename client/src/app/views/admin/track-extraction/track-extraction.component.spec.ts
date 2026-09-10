import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import type { EligibleTrack } from '@f123dashboard/shared';
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

  beforeEach(async () => {
    mockGpEditService = jasmine.createSpyObj('GpEditService', ['getEligibleTracks']);
    mockGpEditService.getEligibleTracks.and.returnValue(of({ success: true, data: tracks }));

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

  it('should lock the wheel until its rotation transition ends', () => {
    component.spinWheel();

    expect(component.isSpinning()).toBeTrue();
    expect(tracks).toContain(component.selectedTrack()!);

    component.onWheelTransitionEnd(new TransitionEvent('transitionend', { propertyName: 'transform' }));

    expect(component.isSpinning()).toBeFalse();
  });

  it('should not spin without eligible tracks', () => {
    component.tracks.set([]);

    component.spinWheel();

    expect(component.isSpinning()).toBeFalse();
    expect(component.selectedTrack()).toBeNull();
  });
});