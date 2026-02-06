import { Component, OnInit, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  ContainerComponent,
  RowComponent,
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
  ModalFooterComponent
} from '@coreui/angular';
import { GpEditService } from '../../../service/gp-edit.service';
import type { GPEditItem } from '@f123dashboard/shared';

interface Toast {
  title: string;
  message: string;
  color: string;
}

type GPEditViewModel = Omit<GPEditItem, 'date'> & { date: string };

@Component({
  selector: 'app-gp-edit',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ContainerComponent,
    RowComponent,
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
    ModalFooterComponent
  ],
  templateUrl: './gp-edit.component.html',
  styleUrls: ['./gp-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GpEditComponent implements OnInit {
  private gpEditService = inject(GpEditService);
  private cdr = inject(ChangeDetectorRef);
  private fb = inject(FormBuilder);

  gps: GPEditViewModel[] = [];
  tracks: { id: number; name: string }[] = [];
  loading = false;
  
  // Toaster state
  toasts: Toast[] = [];

  // Modal state
  modalVisible = false;
  modalTitle = '';
  modalMessage = '';
  private pendingAction: (() => void) | null = null;

  // Bulk Update Form
  bulkForm = this.fb.group({
    daysOffset: [0, [Validators.required]]
  });

  // Create GP Form
  createForm = this.fb.group({
    track_id: [null as number | null, [Validators.required]],
    date: ['', [Validators.required]],
    has_sprint: [false],
    has_x2: [false]
  });

  ngOnInit(): void {
    this.loadData();
    this.loadTracks();
  }

  loadData(): void {
    this.loading = true;
    this.gpEditService.getUpcomingGps().subscribe({
      next: (res) => {
        this.gps = res.data.map((gp: GPEditItem) => ({
            ...gp,
            // Format for datetime-local input: "YYYY-MM-DDTHH:mm"
            // Using toISOString() and slicing to get the correct format
            date: new Date(gp.date).toISOString().slice(0, 16)
        }));
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error loading GPs', err);
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  loadTracks(): void {
    this.gpEditService.getAllTracks().subscribe({
      next: (res) => {
        this.tracks = res.data;
        this.cdr.markForCheck();
      },
      error: (err) => console.error('Error loading tracks', err)
    });
  }

  addToast(title: string, message: string, color = 'success') {
    this.toasts.push({ title, message, color });
    this.cdr.markForCheck();
  }

  onToastVisibleChange(visible: boolean, toast: Toast) {
    if (!visible) {
      this.toasts = this.toasts.filter(t => t !== toast);
      this.cdr.markForCheck();
    }
  }

  showConfirmation(title: string, message: string, action: () => void) {
    this.modalTitle = title;
    this.modalMessage = message;
    this.pendingAction = action;
    this.modalVisible = true;
    this.cdr.markForCheck();
  }

  onConfirmAction() {
    if (this.pendingAction) {
      this.pendingAction();
    }
    this.modalVisible = false;
    this.pendingAction = null;
    this.cdr.markForCheck();
  }

  onCancelAction() {
    this.modalVisible = false;
    this.pendingAction = null;
    this.cdr.markForCheck();
  }

  onModalVisibleChange(event: boolean) {
    this.modalVisible = event;
    if (!event) {
      this.pendingAction = null;
    }
    this.cdr.markForCheck();
  }

  onBulkUpdate(): void {
    if (this.bulkForm.invalid) return;
    const daysOffset = this.bulkForm.value.daysOffset || 0;
    if (daysOffset === 0) return;

    this.showConfirmation(
        'Conferma Spostamento',
        `Sei sicuro di voler spostare tutti i prossimi GP di ${daysOffset} giorni?`,
        () => this.executeBulkUpdate(daysOffset)
    );
  }

  private executeBulkUpdate(daysOffset: number): void {
    this.loading = true;
    this.gpEditService.bulkUpdateGpDate(daysOffset).subscribe({
      next: (res) => {
        if (res.success) {
          this.loadData();
          this.addToast('Successo', 'Date aggiornate con successo!', 'success');
        }
      },
      error: (err) => {
        console.error('Error in bulk update', err);
        this.loading = false;
        this.addToast('Errore', 'Errore durante l\'aggiornamento di massa.', 'danger');
        this.cdr.markForCheck();
      }
    });
  }

  onCreate(): void {
    if (this.createForm.invalid) { return; }
    const val = this.createForm.value;
    
    this.loading = true;
    this.gpEditService.createGp({
      track_id: val.track_id!,
      date: new Date(val.date!).toISOString(), // Ensure ISO string
      has_sprint: val.has_sprint || false,
      has_x2: val.has_x2 || false
    }).subscribe({
      next: (res) => {
        if (res.success) {
          this.loadData();
          this.createForm.reset({ has_sprint: false, has_x2: false });
          this.addToast('Successo', 'GP creato con successo!', 'success');
        }
      },
      error: (err) => {
        console.error('Error creating GP', err);
        this.loading = false;
        this.addToast('Errore', 'Errore durante la creazione del GP.', 'danger');
        this.cdr.markForCheck();
      }
    });
  }

  onDelete(id: number): void {
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
          this.loadData();
          this.addToast('Eliminato', 'GP eliminato con successo.', 'info');
        }
      },
      error: (err) => {
        console.error('Error deleting GP', err);
        this.addToast('Errore', 'Errore durante l\'eliminazione.', 'danger');
      }
    });
  }

  onSave(gp: GPEditViewModel): void { 
    
    this.gpEditService.updateGp(gp.id, {
        date: new Date(gp.date).toISOString(), // Ensure ISO format
        has_sprint: gp.has_sprint,
        has_x2: gp.has_x2
    }).subscribe({
        next: (res) => {
            if (res.success) {
                this.addToast('Salvato', 'Modifiche salvate con successo!', 'success');
            }
        },
        error: (err) => {
          console.error('Error updating GP', err);
          this.addToast('Errore', 'Errore durante il salvataggio.', 'danger');
        }
    });
  }
}
