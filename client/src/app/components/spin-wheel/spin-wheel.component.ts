import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild
} from '@angular/core';

export interface WheelSegment {
  label: string;
  color: string;
}

const SPIN_TURNS = 8;
const BULB_COUNT = { normal: 24, small: 12 } as const;

/**
 * A prize wheel with equal-size segments. Clicking the center button draws a segment uniformly at random,
 * spins the wheel so that segment stops under the pointer, and emits its index once the animation ends.
 */
@Component({
  selector: 'app-spin-wheel',
  templateUrl: './spin-wheel.component.html',
  styleUrl: './spin-wheel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.is-small]': "size() === 'small'"
  }
})
export class SpinWheelComponent {
  readonly segments = input.required<WheelSegment[]>();
  readonly spinLabel = input('Gira');
  readonly spinningLabel = input('Estrazione in corso...');
  readonly disabled = input(false);
  /** Compact variant for secondary wheels. */
  readonly size = input<'normal' | 'small'>('normal');
  /** When set, every other segment is faded so this one stands out. */
  readonly highlightIndex = input<number | null>(null);

  /** Emitted with the drawn segment index when the wheel starts spinning. */
  readonly spinStart = output<number>();
  /** Emitted with the drawn segment index when the wheel has stopped. */
  readonly spinEnd = output<number>();

  readonly rotation = signal(0);
  readonly isSpinning = signal(false);
  private drawnIndex: number | null = null;

  private readonly wheel = viewChild<ElementRef<HTMLElement>>('wheel');
  private readonly pointer = viewChild<ElementRef<HTMLElement>>('pointer');
  private tickFrame: number | null = null;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.stopTicking());
  }

  readonly segmentAngle = computed(() => 360 / Math.max(this.segments().length, 1));

  readonly background = computed(() => {
    const segments = this.segments();
    if (segments.length === 0) {
      return '';
    }

    const highlightIndex = this.highlightIndex();
    const segmentAngle = this.segmentAngle();
    const stops = segments.map((segment, index) => {
      const color = highlightIndex === null || highlightIndex === index
        ? segment.color
        : `color-mix(in srgb, ${segment.color} 30%, var(--cui-body-bg))`;
      return `${color} ${index * segmentAngle}deg ${(index + 1) * segmentAngle}deg`;
    });
    return `conic-gradient(${stops.join(', ')})`;
  });

  /** Label size in container units: shrinks as segments get thinner. */
  readonly labelFontSize = computed(() => {
    const max = this.size() === 'small' ? 5 : 3.2;
    return `${Math.min(max, 75 / Math.max(this.segments().length, 1))}cqi`;
  });

  readonly bulbs = computed(() => {
    const count = BULB_COUNT[this.size()];
    return Array.from({ length: count }, (_, index) => (index * 360) / count);
  });

  spin(): void {
    const segmentCount = this.segments().length;
    if (this.isSpinning() || this.disabled() || segmentCount === 0) {
      return;
    }

    const drawnIndex = this.getRandomIndex(segmentCount);
    const segmentAngle = 360 / segmentCount;
    const targetAngle = 360 - (drawnIndex + 0.5) * segmentAngle;
    const currentAngle = this.rotation() % 360;
    const additionalRotation = (targetAngle - currentAngle + 360) % 360;

    this.drawnIndex = drawnIndex;
    this.isSpinning.set(true);
    this.rotation.update((rotation) => rotation + SPIN_TURNS * 360 + additionalRotation);
    this.spinStart.emit(drawnIndex);
    this.startTicking();
  }

  onTransitionEnd(event: TransitionEvent): void {
    if (event.propertyName !== 'transform' || this.drawnIndex === null) {
      return;
    }

    const drawnIndex = this.drawnIndex;
    this.drawnIndex = null;
    this.stopTicking();
    this.isSpinning.set(false);
    this.spinEnd.emit(drawnIndex);
  }

  getDividerTransform(index: number): string {
    return `rotate(${index * this.segmentAngle()}deg)`;
  }

  getLabelTransform(index: number): string {
    const angle = (index + 0.5) * this.segmentAngle() - 90;
    return `rotate(${angle}deg)`;
  }

  /** Flicks the pointer every time a segment edge passes under it, following the real (eased) wheel speed. */
  private startTicking(): void {
    this.stopTicking();
    let lastSegment: number | null = null;

    const frame = (): void => {
      const wheel = this.wheel()?.nativeElement;
      if (wheel) {
        const segment = Math.floor(((360 - this.readAngle(wheel)) % 360) / this.segmentAngle());
        if (lastSegment !== null && segment !== lastSegment) {
          this.tick();
        }
        lastSegment = segment;
      }
      this.tickFrame = requestAnimationFrame(frame);
    };
    this.tickFrame = requestAnimationFrame(frame);
  }

  private stopTicking(): void {
    if (this.tickFrame !== null) {
      cancelAnimationFrame(this.tickFrame);
      this.tickFrame = null;
    }
  }

  private tick(): void {
    const pointer = this.pointer()?.nativeElement;
    if (!pointer?.animate) {
      return;
    }
    pointer.getAnimations().forEach((animation) => animation.cancel());
    pointer.animate(
      [{ rotate: '0deg' }, { rotate: '-22deg', offset: 0.3 }, { rotate: '0deg' }],
      { duration: 160, easing: 'ease-out' }
    );
  }

  /** Current on-screen rotation of the wheel, 0-360, read mid-transition. */
  private readAngle(element: HTMLElement): number {
    const transform = getComputedStyle(element).transform;
    const match = /^matrix\(([^,]+),\s*([^,]+)/.exec(transform);
    if (!match) {
      return 0;
    }
    const degrees = (Math.atan2(Number(match[2]), Number(match[1])) * 180) / Math.PI;
    return (degrees + 360) % 360;
  }

  private getRandomIndex(count: number): number {
    const randomValue = new Uint32Array(1);
    crypto.getRandomValues(randomValue);
    return randomValue[0] % count;
  }
}
