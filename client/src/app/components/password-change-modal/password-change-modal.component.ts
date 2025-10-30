import { Component, EventEmitter, Output, ViewChild, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ButtonDirective,
  FormModule,
  GridModule,
  ModalBodyComponent,
  ModalComponent,
  ModalHeaderComponent,
  SpinnerComponent,
  AlertComponent
} from '@coreui/angular';
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-password-change-modal',
  templateUrl: './password-change-modal.component.html',
  styleUrls: ['./password-change-modal.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    FormModule,
    ButtonDirective,
    GridModule,
    ModalComponent,
    ModalHeaderComponent,
    ModalBodyComponent,
    SpinnerComponent,
    AlertComponent
  ],
  standalone: true
})
export class PasswordChangeModalComponent implements OnDestroy {
  private authService = inject(AuthService);

  @ViewChild('passwordChangeModal') modal!: ModalComponent;
  @Output() passwordChanged = new EventEmitter<void>();

  // Form fields
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';

  // UI state
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  get currentUser() {
    return this.authService.getCurrentUser();
  }

  ngOnDestroy(): void {
    this.resetForm();
  }

  public open(): void {
    this.resetForm();
    this.modal.visible = true;
  }

  public close(): void {
    this.modal.visible = false;
    this.resetForm();
  }

  private resetForm(): void {
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.errorMessage = '';
    this.successMessage = '';
    this.isLoading = false;
  }

  private validateForm(): boolean {
    this.errorMessage = '';

    if (!this.currentPassword.trim()) {
      this.errorMessage = 'La password attuale è obbligatoria';
      return false;
    }

    if (!this.newPassword.trim()) {
      this.errorMessage = 'La nuova password è obbligatoria';
      return false;
    }

    if (this.newPassword.length < 8) {
      this.errorMessage = 'La nuova password deve essere di almeno 8 caratteri';
      return false;
    }

    if (!this.authService.isPasswordStrong(this.newPassword)) {
      this.errorMessage = 'La password deve contenere almeno una lettera maiuscola, una lettera minuscola e un numero';
      return false;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Le password non corrispondono';
      return false;
    }

    if (this.currentPassword === this.newPassword) {
      this.errorMessage = 'La nuova password deve essere diversa da quella attuale';
      return false;
    }

    return true;
  }

  async onChangePassword(): Promise<void> {
    if (!this.validateForm()) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {

      const response = await this.authService.changePassword(this.currentPassword, this.newPassword);

      if (response.success) {
        this.successMessage = 'Password cambiata con successo!';
        this.passwordChanged.emit();
        
        // Close modal after a brief delay to show success message
        setTimeout(() => {
          this.close();
        }, 2000);
      } else {
        this.errorMessage = response.message || 'Errore durante il cambio password';
      }
    } catch (error) {
      console.error('Password change error:', error);
      this.errorMessage = 'Si è verificato un errore durante il cambio password. Riprova più tardi.';
    } finally {
      this.isLoading = false;
    }
  }

  onModalHidden(): void {
    this.resetForm();
  }
}
