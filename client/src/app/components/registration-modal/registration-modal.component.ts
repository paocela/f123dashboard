import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ButtonDirective,
  FormModule,
  GridModule,
  ModalBodyComponent,
  ModalComponent,
  ModalHeaderComponent,
  SpinnerComponent
} from '@coreui/angular';
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-registration-modal',
  templateUrl: './registration-modal.component.html',
  styleUrls: ['./registration-modal.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    FormModule,
    ButtonDirective,
    GridModule,
    ModalComponent,
    ModalHeaderComponent,
    ModalBodyComponent,
    SpinnerComponent
  ],
  standalone: true
})
export class RegistrationModalComponent {
  // Registration form fields
  name: string = '';
  surname: string = '';
  regUsername: string = '';
  regPassword: string = '';
  confirmPassword: string = '';
  email: string = '';
  selectedFile: File | null = null;


  // State management
  isLoading: boolean = false;
  singInErrorMessage: string = '';
  successMessage: string = '';

  @ViewChild('verticallyCenteredModal') public modal!: ModalComponent;

  @Output() registrationSuccess = new EventEmitter<void>();

  constructor(private authService: AuthService) {}


onFileSelected(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    this.selectedFile = input.files[0];
    console.log("File selezionato:", this.selectedFile);
  }
}
  async onRegistration() {
    if (!this.validateRegistrationForm()) {
      return;
    }

    this.isLoading = true;
    this.singInErrorMessage = '';

    try {
      const response = await this.authService.register({
        username: this.regUsername,
        name: this.name,
        surname: this.surname,
        password: this.regPassword
      });

      if (response.success) {
        this.successMessage = 'Registration successful!';
        this.registrationSuccess.emit();
        setTimeout(() => this.modal.visible = false, 2000);
      } else {
        this.singInErrorMessage = response.message || 'Registration failed. Please try again.';
      }
    } catch (error) {
      this.singInErrorMessage = 'An error occurred during registration. Please try again.';
      console.error('Registration error:', error);
    } finally {
      this.isLoading = false;
    }
  }

  private validateRegistrationForm(): boolean {
    this.singInErrorMessage = '';

    if (!this.name || !this.surname || !this.regUsername || !this.regPassword) {
      this.singInErrorMessage = 'Tutti i campi sono obbligatori';
      return false;
    }

    if (this.regUsername.length < 3) {
      this.singInErrorMessage = 'L\'username deve contenere almeno 3 caratteri';
      return false;
    }

    if (this.regPassword.length < 8) {
      this.singInErrorMessage = 'La password deve contenere almeno 8 caratteri';
      return false;
    }

    if (this.regPassword !== this.confirmPassword) {
      this.singInErrorMessage = 'Le password non corrispondono';
      return false;
    }

    // Password strength validation
    if (!this.isPasswordStrong(this.regPassword)) {
      this.singInErrorMessage = 'La password deve contenere almeno una lettera maiuscola, una lettera minuscola, un numero e un carattere speciale';
      return false;
    }

    return true;
  }

  private isPasswordStrong(password: string): boolean {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
  }
}