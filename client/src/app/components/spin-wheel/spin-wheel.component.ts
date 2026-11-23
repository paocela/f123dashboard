import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { ButtonDirective } from '@coreui/angular';

export interface WheelSegment {
  label: string;
  color: string;
}

const SPIN_TURNS = 8;

/**
 * A prize wheel with equal-size segments. Clicking the center button draws a segment uniformly at random,
 * spins the wheel so that segment stops under the pointer, and emits its index once the animation ends.
 */
@Component({
  selector: 'app-spin-wheel',
  imports: [ButtonDirective],
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

  readonly background = computed(() => {
    const segments = this.segments();
    if (segments.length === 0) {
      return '';
    }

    const highlightIndex = this.highlightIndex();
    const segmentAngle = 360 / segments.length;
    const stops = segments.map((segment, index) => {
      const color = highlightIndex === null || highlightIndex === index
        ? segment.color
        : `color-mix(in srgb, ${segment.color} 30%, var(--cui-body-bg))`;
      return `${color} ${index * segmentAngle}deg ${(index + 1) * segmentAngle}deg`;
    });
    return `conic-gradient(${stops.join(', ')})`;
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
  }

  onTransitionEnd(event: TransitionEvent): void {
    if (event.propertyName !== 'transform' || this.drawnIndex === null) {
      return;
    }

    const drawnIndex = this.drawnIndex;
    this.drawnIndex = null;
    this.isSpinning.set(false);
    this.spinEnd.emit(drawnIndex);
  }

  getLabelTransform(index: number): string {
    const segmentAngle = 360 / this.segments().length;
    const angle = (index + 0.5) * segmentAngle - 90;
    return `translate(-50%, -50%) rotate(${angle}deg) translateX(105%)`;
  }

  private getRandomIndex(count: number): number {
    const randomValue = new Uint32Array(1);
    crypto.getRandomValues(randomValue);
    return randomValue[0] % count;
  }
}
