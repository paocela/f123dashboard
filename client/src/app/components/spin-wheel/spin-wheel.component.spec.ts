import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SpinWheelComponent, WheelSegment } from './spin-wheel.component';

describe('SpinWheelComponent', () => {
  let component: SpinWheelComponent;
  let fixture: ComponentFixture<SpinWheelComponent>;

  const segments: WheelSegment[] = [
    { label: 'A', color: '#000' },
    { label: 'B', color: '#111' },
    { label: 'C', color: '#222' }
  ];
  const transformEnd = () => new TransitionEvent('transitionend', { propertyName: 'transform' });

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [SpinWheelComponent] }).compileComponents();

    fixture = TestBed.createComponent(SpinWheelComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('segments', segments);
    fixture.detectChanges();
  });

  it('should emit the drawn index on start and again when the rotation ends', () => {
    let startIndex: number | undefined;
    let endIndex: number | undefined;
    component.spinStart.subscribe((index) => (startIndex = index));
    component.spinEnd.subscribe((index) => (endIndex = index));

    component.spin();

    expect(component.isSpinning()).toBeTrue();
    expect(startIndex).toBeGreaterThanOrEqual(0);
    expect(startIndex).toBeLessThan(segments.length);
    expect(endIndex).toBeUndefined();

    component.onTransitionEnd(transformEnd());

    expect(component.isSpinning()).toBeFalse();
    expect(endIndex).toBe(startIndex);
  });

  it('should stop with the drawn segment under the pointer', () => {
    let drawnIndex = -1;
    component.spinStart.subscribe((index) => (drawnIndex = index));

    component.spin();

    const segmentAngle = 360 / segments.length;
    const pointerAngle = (360 - (component.rotation() % 360)) % 360;
    expect(Math.floor(pointerAngle / segmentAngle)).toBe(drawnIndex);
  });

  it('should ignore clicks while spinning', () => {
    const emitted: number[] = [];
    component.spinStart.subscribe((index) => emitted.push(index));

    component.spin();
    component.spin();

    expect(emitted.length).toBe(1);
  });

  it('should not spin when disabled or empty', () => {
    fixture.componentRef.setInput('disabled', true);
    component.spin();
    expect(component.isSpinning()).toBeFalse();

    fixture.componentRef.setInput('disabled', false);
    fixture.componentRef.setInput('segments', []);
    component.spin();
    expect(component.isSpinning()).toBeFalse();
  });

  it('should ignore transitions of other properties', () => {
    let ended = false;
    component.spinEnd.subscribe(() => (ended = true));

    component.spin();
    component.onTransitionEnd(new TransitionEvent('transitionend', { propertyName: 'opacity' }));

    expect(ended).toBeFalse();
    expect(component.isSpinning()).toBeTrue();
  });

  it('should fade every segment except the highlighted one', () => {
    fixture.componentRef.setInput('highlightIndex', 1);
    fixture.detectChanges();

    const background = component.background();
    expect(background).toContain('#111 120deg');
    expect(background).toContain('color-mix(in srgb, #000 30%');
    expect(background).toContain('color-mix(in srgb, #222 30%');

    const labels = fixture.nativeElement.querySelectorAll('.wheel-label');
    expect(labels[1].classList).toContain('is-highlighted');
    expect(labels[0].classList).toContain('is-dimmed');
    expect(labels[2].classList).toContain('is-dimmed');
  });

  it('should apply the small variant class', () => {
    fixture.componentRef.setInput('size', 'small');
    fixture.detectChanges();

    expect(fixture.nativeElement.classList).toContain('is-small');
  });
});
