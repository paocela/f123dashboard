import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import {
  ButtonDirective,
  ButtonCloseDirective,
  ColComponent,
  ContainerComponent,
  ModalBodyComponent,
  ModalComponent,
  ModalFooterComponent,
  ModalHeaderComponent,
  ModalTitleDirective,
  RowComponent,
  SpinnerComponent,
  ToasterComponent,
  ToastComponent,
  ToastHeaderComponent,
  ToastBodyComponent
} from '@coreui/angular';
import { forkJoin } from 'rxjs';
import type { EligibleTrack, GPEditItem } from '@f123dashboard/shared';
import { GpEditService } from '../../../service/gp-edit.service';
import { DbDataService } from '../../../service/db-data.service';
import { SpinWheelComponent, WheelSegment } from '../../../components/spin-wheel/spin-wheel.component';

/** Evenly spaced hues around the wheel, alternating two lightness levels so neighbours stay distinct. */
export function getTrackWheelColor(index: number, total: number): string {
  const hue = Math.round((index * 360) / Math.max(total, 1) + 20) % 360;
  const lightness = index % 2 === 0 ? 0.58 : 0.5;
  return `oklch(${lightness} 0.15 ${hue})`;
}
export type RaceFormat = 'sprint' | 'regular';

const FORMAT_COLORS: Record<RaceFormat, string> = {
  sprint: '#e55353',
  regular: '#321fdb'
};
const MODAL_DELAY_MS = 500;

interface PendingTrackAssignment {
  track: EligibleTrack;
  format: RaceFormat;
  gp: GPEditItem;
}

interface Toast {
  title: string;
  message: string;
  color: string;
}

/**
 * Spreads `sprintCount` sprint entries as evenly as possible among `totalCount` wheel entries.
 * The draw is uniform over entries, so the sprint probability is sprintCount / totalCount whatever the order.
 */
export function buildFormatEntries(totalCount: number, sprintCount: number): RaceFormat[] {
  const sprints = Math.min(Math.max(sprintCount, 0), totalCount);
  return Array.from({ length: totalCount }, (_, index): RaceFormat =>
    Math.floor(((index + 1) * sprints) / totalCount) > Math.floor((index * sprints) / totalCount)
      ? 'sprint'
      : 'regular'
  );
}

@Component({
  selector: 'app-track-extraction',
  imports: [
    ButtonDirective,
    ButtonCloseDirective,
    ColComponent,
    ContainerComponent,
    ModalBodyComponent,
    ModalComponent,
    ModalFooterComponent,
    ModalHeaderComponent,
    ModalTitleDirective,
    RowComponent,
    SpinnerComponent,
    SpinWheelComponent,
    ToasterComponent,
    ToastComponent,
    ToastHeaderComponent,
    ToastBodyComponent
  ],
  templateUrl: './track-extraction.component.html',
  styleUrl: './track-extraction.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TrackExtractionComponent implements OnInit {
  private readonly gpEditService = inject(GpEditService);
  private readonly dbDataService = inject(DbDataService);

  readonly tracks = signal<EligibleTrack[]>([]);
  readonly remainingSprints = signal(0);
  readonly isLoading = signal(true);
  readonly isSpinning = signal(false);
  readonly hasError = signal(false);
  /** Which wheel is shown: the track draw first, then the race-format draw for the drawn track. */
  readonly stage = signal<'track' | 'format'>('track');
  readonly selectedTrack = signal<EligibleTrack | null>(null);
  /** Segment of the track wheel the draw landed on; kept highlighted while the format is drawn. */
  readonly drawnTrackIndex = signal<number | null>(null);
  readonly selectedFormat = signal<RaceFormat | null>(null);
  /** Segment of the format wheel the draw landed on. */
  readonly drawnFormatIndex = signal<number | null>(null);
  readonly assignmentModalVisible = signal(false);
  readonly isLoadingPendingGp = signal(false);
  readonly isAssigningTrack = signal(false);
  readonly hasAssignmentError = signal(false);
  readonly pendingTrackAssignment = signal<PendingTrackAssignment | null>(null);
  readonly toasts = signal<Toast[]>([]);
  readonly formatColors = FORMAT_COLORS;

  readonly trackSegments = computed<WheelSegment[]>(() =>
    this.tracks().map((track, index, tracks) => ({
      label: track.name,
      color: getTrackWheelColor(index, tracks.length)
    }))
  );

  /** One entry per race still to be drawn (the drawn track included), of which the remaining sprints are sprint. */
  readonly formatEntries = computed(() => buildFormatEntries(this.tracks().length, this.remainingSprints()));
  readonly sprintEntryCount = computed(() => this.formatEntries().filter((format) => format === 'sprint').length);

  readonly formatSegments = computed<WheelSegment[]>(() =>
    this.formatEntries().map((format) => ({
      label: this.getFormatLabel(format),
      color: FORMAT_COLORS[format]
    }))
  );

  ngOnInit(): void {
    this.loadEligibleTracks();
  }

  loadEligibleTracks(): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    forkJoin({
      tracks: this.gpEditService.getEligibleTracks(),
      sprintInfo: this.gpEditService.getSprintDrawInfo()
    }).subscribe({
      next: ({ tracks, sprintInfo }) => {
        this.tracks.set(tracks.data);
        this.remainingSprints.set(sprintInfo.data.remaining_sprints);
        this.isLoading.set(false);
      },
      error: () => {
        this.hasError.set(true);
        this.isLoading.set(false);
      }
    });
  }

  onTrackSpinStart(): void {
    this.selectedTrack.set(null);
    this.drawnTrackIndex.set(null);
    this.selectedFormat.set(null);
    this.isSpinning.set(true);
  }

  onTrackSpinEnd(index: number): void {
    this.isSpinning.set(false);
    this.selectedTrack.set(this.tracks()[index] ?? null);
    this.drawnTrackIndex.set(index);
    this.stage.set('format');
  }

  onFormatSpinStart(): void {
    this.selectedFormat.set(null);
    this.drawnFormatIndex.set(null);
    this.isSpinning.set(true);
  }

  onFormatSpinEnd(index: number): void {
    this.isSpinning.set(false);
    this.selectedFormat.set(this.formatEntries()[index] ?? null);
    this.drawnFormatIndex.set(index);
    setTimeout(() => {
      this.openAssignmentModal();
    }, MODAL_DELAY_MS);
  }

  getFormatLabel(format: RaceFormat): string {
    return format === 'sprint' ? 'Sprint' : 'Normale';
  }

  closeAssignmentModal(): void {
    this.assignmentModalVisible.set(false);
    this.hasAssignmentError.set(false);
    this.pendingTrackAssignment.set(null);
    this.isLoadingPendingGp.set(false);
  }

  /** Cancels the current draw and goes back to the track wheel. */
  cancelDraw(): void {
    this.closeAssignmentModal();
    this.resetDraw();
  }

  private resetDraw(): void {
    this.selectedTrack.set(null);
    this.drawnTrackIndex.set(null);
    this.selectedFormat.set(null);
    this.drawnFormatIndex.set(null);
    this.stage.set('track');
  }

  onAssignmentModalVisibleChange(visible: boolean): void {
    if (!visible && this.assignmentModalVisible()) {
      this.cancelDraw();
    }
  }

  addToast(title: string, message: string, color: string): void {
    this.toasts.update((toasts) => [...toasts, { title, message, color }]);
  }

  onToastVisibleChange(visible: boolean, toast: Toast): void {
    if (!visible) {
      this.toasts.update((toasts) => toasts.filter((item) => item !== toast));
    }
  }

  confirmTrackAssignment(): void {
    const assignment = this.pendingTrackAssignment();
    if (!assignment || this.isAssigningTrack()) {
      return;
    }

    this.isAssigningTrack.set(true);
    this.hasAssignmentError.set(false);
    this.gpEditService.updateGp(assignment.gp.id, {
      track_id: assignment.track.id,
      has_sprint: assignment.format === 'sprint'
    }).subscribe({
      next: (response) => {
        this.isAssigningTrack.set(false);
        if (!response.success) {
          this.hasAssignmentError.set(true);
          this.addToast('Errore', 'Non e stato possibile assegnare la pista.', 'danger');
          return;
        }

        this.closeAssignmentModal();
        this.resetDraw();
        this.loadEligibleTracks();
        void this.dbDataService.refreshGpSchedule().catch((error: unknown) => {
          console.error('Error refreshing dashboard GP schedule', error);
          this.addToast('Errore', 'La pista è stata assegnata, ma non è stato possibile aggiornare la dashboard.', 'danger');
        });
        this.addToast('Pista assegnata', 'La pista e il formato sono stati assegnati al prossimo Gran Premio.', 'success');
      },
      error: () => {
        this.isAssigningTrack.set(false);
        this.hasAssignmentError.set(true);
        this.addToast('Errore', 'Non e stato possibile assegnare la pista.', 'danger');
      }
    });
  }

  getTrackImagePath(trackId: number): string {
    return `assets/images/tracks/${trackId}.png`;
  }

  formatGpDate(date: string): string {
    return new Intl.DateTimeFormat('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
      timeZone: 'UTC'
    }).format(new Date(`${date}Z`));
  }

  private openAssignmentModal(): void {
    const track = this.selectedTrack();
    const format = this.selectedFormat();
    if (!track || !format) {
      return;
    }

    this.hasAssignmentError.set(false);
    this.pendingTrackAssignment.set(null);
    this.isLoadingPendingGp.set(true);
    this.assignmentModalVisible.set(true);
    this.gpEditService.getUpcomingGps().subscribe({
      next: (response) => {
        const gp = response.data.find((item) => item.track_id === null);
        if (gp) {
          this.pendingTrackAssignment.set({ track, format, gp });
        }
        this.isLoadingPendingGp.set(false);
      },
      error: () => {
        this.isLoadingPendingGp.set(false);
        this.hasAssignmentError.set(true);
      }
    });
  }
}