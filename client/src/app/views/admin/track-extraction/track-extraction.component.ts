import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import {
  ButtonDirective,
  ColComponent,
  ContainerComponent,
  RowComponent,
  SpinnerComponent
} from '@coreui/angular';
import type { EligibleTrack } from '@f123dashboard/shared';
import { GpEditService } from '../../../service/gp-edit.service';

const WHEEL_COLORS = [
  '#321fdb',
  '#3399ff',
  '#2eb85c',
  '#f9b115',
  '#e55353',
  '#636f83',
  '#20c997',
  '#d63384',
  '#fd7e14',
  '#0dcaf0',
  '#6f42c1',
  '#198754',
  '#dc3545',
  '#0d6efd',
  '#795548',
  '#607d8b'
];
const SPIN_TURNS = 8;

@Component({
  selector: 'app-track-extraction',
  imports: [
    ButtonDirective,
    ColComponent,
    ContainerComponent,
    RowComponent,
    SpinnerComponent
  ],
  templateUrl: './track-extraction.component.html',
  styleUrl: './track-extraction.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TrackExtractionComponent implements OnInit {
  private readonly gpEditService = inject(GpEditService);

  readonly tracks = signal<EligibleTrack[]>([]);
  readonly isLoading = signal(true);
  readonly isSpinning = signal(false);
  readonly hasError = signal(false);
  readonly rotation = signal(0);
  readonly selectedTrack = signal<EligibleTrack | null>(null);
  readonly wheelBackground = computed(() => {
    const availableTracks = this.tracks();
    if (availableTracks.length === 0) {
      return '';
    }

    const segmentAngle = 360 / availableTracks.length;
    const segments = availableTracks.map((_, index) => {
      const color = WHEEL_COLORS[index % WHEEL_COLORS.length];
      const start = index * segmentAngle;
      const end = (index + 1) * segmentAngle;
      return `${color} ${start}deg ${end}deg`;
    });

    return `conic-gradient(${segments.join(', ')})`;
  });

  ngOnInit(): void {
    this.loadEligibleTracks();
  }

  loadEligibleTracks(): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    this.gpEditService.getEligibleTracks().subscribe({
      next: (response) => {
        this.tracks.set(response.data);
        this.isLoading.set(false);
      },
      error: () => {
        this.hasError.set(true);
        this.isLoading.set(false);
      }
    });
  }

  spinWheel(): void {
    const availableTracks = this.tracks();
    if (this.isSpinning() || availableTracks.length === 0) {
      return;
    }

    const selectedIndex = this.getRandomIndex(availableTracks.length);
    const segmentAngle = 360 / availableTracks.length;
    const targetAngle = 360 - (selectedIndex + 0.5) * segmentAngle;
    const currentAngle = this.rotation() % 360;
    const additionalRotation = (targetAngle - currentAngle + 360) % 360;

    this.selectedTrack.set(null);
    this.isSpinning.set(true);
    this.rotation.update((currentRotation) => currentRotation + SPIN_TURNS * 360 + additionalRotation);
    this.selectedTrack.set(availableTracks[selectedIndex]);
  }

  onWheelTransitionEnd(event: TransitionEvent): void {
    if (event.propertyName === 'transform') {
      this.isSpinning.set(false);
    }
  }

  getLabelTransform(index: number): string {
    const segmentAngle = 360 / this.tracks().length;
    const angle = (index + 0.5) * segmentAngle - 90;
    return `translate(-50%, -50%) rotate(${angle}deg) translateX(105%)`;
  }

  private getRandomIndex(trackCount: number): number {
    const randomValue = new Uint32Array(1);
    crypto.getRandomValues(randomValue);
    return randomValue[0] % trackCount;
  }
}