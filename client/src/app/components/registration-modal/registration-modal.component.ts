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

  // State management
  isLoading: boolean = false;
  singInErrorMessage: string = '';
  successMessage: string = '';

  @ViewChild('verticallyCenteredModal') public modal!: ModalComponent;

  @Output() registrationSuccess = new EventEmitter<void>();

  constructor(private authService: AuthService) {}

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
      this.singInErrorMessage = 'All fields are required';
      return false;
    }

    if (this.regUsername.length < 3) {
      this.singInErrorMessage = 'Username must be at least 3 characters long';
      return false;
    }

    if (this.regPassword.length < 8) {
      this.singInErrorMessage = 'Password must be at least 8 characters long';
      return false;
    }

    if (this.regPassword !== this.confirmPassword) {
      this.singInErrorMessage = 'Passwords do not match';
      return false;
    }

    // Password strength validation
    if (!this.isPasswordStrong(this.regPassword)) {
      this.singInErrorMessage = 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character';
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