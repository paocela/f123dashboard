import { Component, OnInit, inject, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import {
  ContainerComponent,
  ColComponent,
  CardComponent,
  CardHeaderComponent,
  CardBodyComponent,
  TableDirective,
  ButtonDirective,
  ButtonCloseDirective,
  FormModule,
  GridModule,
  SpinnerComponent,
  ToasterComponent, 
  ToastComponent, 
  ToastHeaderComponent, 
  ToastBodyComponent,
  ModalComponent,
  ModalHeaderComponent,
  ModalTitleDirective,
  ModalBodyComponent,
  ModalFooterComponent,
  BadgeComponent,
  AccordionComponent,
  AccordionItemComponent,
  TemplateIdDirective
} from '@coreui/angular';
import { GpEditService } from '../../../service/gp-edit.service';
import { FeatureFlagsService } from '../../../service/feature-flags.service';
import { DbDataService } from '../../../service/db-data.service';
import type { EligibleTrack, GPEditItem } from '@f123dashboard/shared';

interface Toast {
  title: string;
  message: string;
  color: string;
}

@Component({
  selector: 'app-gp-edit',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ContainerComponent,
      ColComponent,
    CardComponent,
    CardHeaderComponent,
    CardBodyComponent,
    TableDirective,
    ButtonDirective,
    ButtonCloseDirective,
    FormModule,
    GridModule,
    SpinnerComponent,
    ToasterComponent, 
    ToastComponent, 
    ToastHeaderComponent, 
    ToastBodyComponent,
    ModalComponent,
    ModalHeaderComponent,
    ModalTitleDirective,
    ModalBodyComponent,
    ModalFooterComponent,
    BadgeComponent,
    AccordionComponent,
    AccordionItemComponent,
    TemplateIdDirective
  ],
  templateUrl: './gp-edit.component.html',
  styleUrls: ['./gp-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GpEditComponent implements OnInit {
  private gpEditService = inject(GpEditService);
  private featureFlagsService = inject(FeatureFlagsService);
  private dbDataService = inject(DbDataService);
  private fb = inject(FormBuilder);

  gps = signal<GPEditItem[]>([]);
  tracks = signal<Pick<EligibleTrack, 'id' | 'name'>[]>([]);
  loading = signal(false);
  readonly raceGroups = computed(() => [
    { past: false, title: $localize`Prossime Gare`, gps: this.gps().filter(gp => !gp.is_past) },
    { past: true, title: $localize`Gare passate`, gps: this.gps().filter(gp => gp.is_past).reverse() }
  ]);
  readonly labels = {
    locked: $localize`Risultati presenti: modifica ed eliminazione non consentite.`,
    noRaces: $localize`Nessuna gara.`,
    bulk: $localize`Vengono spostate solo le gare future senza risultati.`,
    track: $localize`Pista per il GP`,
    date: $localize`Data per il GP`,
    sprint: $localize`Sprint per il GP`,
    doublePoints: $localize`Punti doppi per il GP`,
    seasonSettings: $localize`Impostazioni stagione corrente`,
    freePractice: $localize`Prove libere`,
    freePracticeHelp: $localize`Abilita le sessioni di prove libere e i relativi punti.`,
    enabled: $localize`Abilitate`,
    disabled: $localize`Disabilitate`,
    enableFreePractice: $localize`Abilita prove libere`,
    disableFreePractice: $localize`Disabilita prove libere`
  };
  readonly freePracticeEnabled = this.featureFlagsService.freePracticeEnabled;
  readonly freePracticeSaving = signal(false);
  
  // Toaster state
  toasts = signal<Toast[]>([]);

  // Modal state
  modalVisible = signal(false);
  modalTitle = signal('');
  modalMessage = signal('');
  private pendingAction = signal<(() => void) | null>(null);

  // Bulk Update Form
  bulkForm = this.fb.group({
    daysOffset: [0, [Validators.required]]
  });

  // Create GP Form
  createForm = this.fb.group({
    track_id: [null as number | null],
    date: ['', [Validators.required]],
    has_sprint: [false],
    has_x2: [false]
  });

  ngOnInit(): void {
    void this.featureFlagsService.loadFlags();
    this.loadData();
    this.loadTracks();
  }

  loadData(): void {
    this.loading.set(true);
    this.gpEditService.getUpcomingGps(true).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (!res.success) {
          this.addToast($localize`Errore`, res.message ?? $localize`Errore durante il caricamento dei GP.`, 'danger');
          return;
        }
        this.gps.set(res.data);
      },
      error: (err) => {
        console.error('Error loading GPs', err);
        this.loading.set(false);
        this.addToast($localize`Errore`, $localize`Errore durante il caricamento dei GP.`, 'danger');
      }
    });
  }

  loadTracks(): void {
    this.gpEditService.getAllTracks().subscribe({
      next: (res) => {
        this.tracks.set(res.data);
      },
      error: (err) => console.error('Error loading tracks', err)
    });
  }

  requestFreePracticeToggle(): void {
    const enabled = !this.freePracticeEnabled();
    this.showConfirmation(
      enabled ? $localize`Abilita prove libere` : $localize`Disabilita prove libere`,
      enabled
        ? $localize`Sei sicuro di voler abilitare le prove libere e i relativi punti per la stagione corrente?`
        : $localize`Sei sicuro di voler disabilitare le prove libere e i relativi punti per la stagione corrente?`,
      () => void this.updateFreePracticeEnabled(enabled)
    );
  }

  private async updateFreePracticeEnabled(enabled: boolean): Promise<void> {
    this.freePracticeSaving.set(true);
    try {
      await this.featureFlagsService.setFreePracticeEnabled(enabled);
      this.addToast($localize`Salvato`, $localize`Impostazione delle prove libere aggiornata.`, 'success');
    } catch (error) {
      console.error('Error updating free practice setting', error);
      this.addToast($localize`Errore`, $localize`Non è stato possibile aggiornare le prove libere.`, 'danger');
    } finally {
      this.freePracticeSaving.set(false);
    }
  }

  addToast(title: string, message: string, color = 'success') {
    this.toasts.update(toasts => [...toasts, { title, message, color }]);
  }

  onToastVisibleChange(visible: boolean, toast: Toast) {
    if (!visible) {
      this.toasts.update(toasts => toasts.filter(t => t !== toast));
    }
  }

  showConfirmation(title: string, message: string, action: () => void) {
    this.modalTitle.set(title);
    this.modalMessage.set(message);
    this.pendingAction.set(action);
    this.modalVisible.set(true);
  }

  onConfirmAction() {
    const action = this.pendingAction();
    if (action) {
      action();
    }
    this.modalVisible.set(false);
    this.pendingAction.set(null);
  }

  onCancelAction() {
    this.modalVisible.set(false);
    this.pendingAction.set(null);
  }

  onModalVisibleChange(event: boolean) {
    this.modalVisible.set(event);
    if (!event) {
      this.pendingAction.set(null);
    }
  }

  onBulkUpdate(): void {
    if (this.bulkForm.invalid) {
      return;
    }
    const daysOffset = this.bulkForm.value.daysOffset || 0;
    if (daysOffset === 0) {
      return;
    }

    this.showConfirmation(
        'Conferma Spostamento',
        `Sei sicuro di voler spostare tutti i prossimi GP di ${daysOffset} giorni?`,
        () => this.executeBulkUpdate(daysOffset)
    );
  }

  private executeBulkUpdate(daysOffset: number): void {
    this.loading.set(true);
    this.gpEditService.bulkUpdateGpDate(daysOffset).subscribe({
      next: (res) => {
        if (res.success) {
          this.loadData();
          this.refreshDashboardSchedule();
          this.addToast('Successo', 'Date aggiornate con successo!', 'success');
        } else {
          this.loading.set(false);
          this.addToast($localize`Errore`, res.message ?? $localize`Errore durante lo spostamento delle date.`, 'danger');
        }
      },
      error: (err) => {
        console.error('Error in bulk update', err);
        this.loading.set(false);
        this.addToast('Errore', 'Errore durante l\'aggiornamento di massa.', 'danger');
      }
    });
  }

  onCreate(): void {
    if (this.createForm.invalid) { return; }
    const val = this.createForm.value;
    if (!val.date) { return; }
    
    this.loading.set(true);
    this.gpEditService.createGp({
      track_id: val.track_id ?? null,
      date: val.date,
      has_sprint: val.has_sprint || false,
      has_x2: val.has_x2 || false
    }).subscribe({
      next: (res) => {
        if (res.success) {
          this.loading.set(false);
          this.gps.update(gps => [...gps, res.data].sort((a, b) => a.date.localeCompare(b.date)));
          this.refreshDashboardSchedule();
          this.createForm.reset({ has_sprint: false, has_x2: false });
          this.addToast('Successo', 'GP creato con successo!', 'success');
        }
      },
      error: (err) => {
        console.error('Error creating GP', err);
        this.loading.set(false);
        this.addToast('Errore', 'Errore durante la creazione del GP.', 'danger');
      }
    });
  }

  onDelete(id: number): void {
    const gp = this.gps().find(item => item.id === id);
    if (gp && !this.canEditGp(gp)) {
      return;
    }
    this.showConfirmation(
        'Conferma Eliminazione',
        'Sei sicuro di voler eliminare questo GP?',
        () => this.executeDelete(id)
    );
  }

  private executeDelete(id: number): void {
    this.gpEditService.deleteGp(id).subscribe({
      next: (res) => {
        if (res.success) {
          this.gps.update(gps => gps.filter(gp => gp.id !== id));
          this.refreshDashboardSchedule();
          this.addToast('Eliminato', 'GP eliminato con successo.', 'info');
        } else {
          this.addToast($localize`Errore`, res.message ?? $localize`Errore durante l'eliminazione.`, 'danger');
        }
      },
      error: (err) => {
        console.error('Error deleting GP', err);
        this.addToast($localize`Errore`, this.getErrorMessage(err, $localize`Errore durante l'eliminazione.`), 'danger');
      }
    });
  }

  onSave(gp: GPEditItem): void {
    if (!this.canEditGp(gp)) {
      return;
    }
    this.gpEditService.updateGp(gp.id, {
      track_id: gp.track_id,
        date: gp.date,
        has_sprint: gp.has_sprint,
        has_x2: gp.has_x2
    }).subscribe({
        next: (res) => {
            if (res.success) {
                this.addToast('Salvato', 'Modifiche salvate con successo!', 'success');
                this.refreshGpRow(gp.id);
                this.refreshDashboardSchedule();
            } else {
                this.addToast($localize`Errore`, res.message ?? $localize`Errore durante il salvataggio.`, 'danger');
            }
        },
        error: (err) => {
          console.error('Error updating GP', err);
          this.addToast($localize`Errore`, this.getErrorMessage(err, $localize`Errore durante il salvataggio.`), 'danger');
        }
    });
  }

  private canEditGp(gp: GPEditItem): boolean {
    if (!gp.has_results) {
      return true;
    }
    this.addToast($localize`Errore`, this.labels.locked, 'danger');
    return false;
  }

  private getErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse) {
      const body: unknown = error.error;
      if (body && typeof body === 'object' && 'message' in body && typeof body.message === 'string') {
        return body.message;
      }
    }
    return fallback;
  }

  private refreshGpRow(id: number): void {
    this.gpEditService.getUpcomingGps(true).subscribe({
      next: (res) => {
        if (!res.success) {
          this.addToast($localize`Errore`, res.message ?? $localize`Errore durante il ricaricamento del GP.`, 'danger');
          return;
        }
        const updatedGp = res.data.find(item => item.id === id);
        if (updatedGp) {
          this.gps.update(gps => gps.map(gp => gp.id === id ? updatedGp : gp));
        }
      },
      error: (error) => {
        console.error('Error refreshing GP', error);
        this.addToast($localize`Errore`, $localize`Errore durante il ricaricamento del GP.`, 'danger');
      }
    });
  }

  private refreshDashboardSchedule(): void {
    void this.dbDataService.refreshGpSchedule().catch((error: unknown) => {
      console.error('Error refreshing dashboard GP schedule', error);
      this.addToast($localize`Errore`, $localize`Il GP è stato aggiornato, ma non è stato possibile aggiornare la dashboard.`, 'danger');
    });
  }

}
