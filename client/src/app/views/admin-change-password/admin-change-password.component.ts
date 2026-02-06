import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { 
  ContainerComponent,
  RowComponent,
  ColComponent,
  CardComponent,
  CardBodyComponent,
  CardHeaderComponent,
  FormDirective,
  FormLabelDirective,
  FormControlDirective,
  ButtonDirective,
  SpinnerComponent,
  AlertComponent
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';
import { cilLockLocked, cilUser, cilCheckCircle, cilXCircle } from '@coreui/icons';

import { AuthService } from 'src/app/service/auth.service';
import { ApiService } from 'src/app/service/api.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-admin-change-password',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ContainerComponent,
    RowComponent,
    ColComponent,
    CardComponent,
    CardBodyComponent,
    CardHeaderComponent,
    FormDirective,
    FormControlDirective,
    ButtonDirective,
    SpinnerComponent,
    AlertComponent,
    IconDirective
  ],
  templateUrl: './admin-change-password.component.html',
  styleUrl: './admin-change-password.component.scss'
})
export class AdminChangePasswordComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  changePasswordForm: FormGroup;
  isLoading = false;
  showSuccess = false;
  showError = false;
  errorMessage = '';
  successMessage = '';
  generatedPassword = '';

  // No need for icons object, icons are available directly
  cilLockLocked = cilLockLocked;
  cilUser = cilUser;
  cilCheckCircle = cilCheckCircle;
  cilXCircle = cilXCircle;

  constructor() {
    this.changePasswordForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  ngOnInit(): void {
    // Check if user is admin
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser?.isAdmin) 
      {this.router.navigate(['/dashboard']);}
    
  }

  generateRandomPassword(): string {
    const length = 8;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let password = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }
    return password;
  }

  async onSubmit(): Promise<void> {
    if (this.changePasswordForm.invalid) {
      Object.keys(this.changePasswordForm.controls).forEach(key => {
        this.changePasswordForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isLoading = true;
    this.showSuccess = false;
    this.showError = false;
    this.errorMessage = '';
    this.successMessage = '';
    this.generatedPassword = '';

    try {
      const token = this.authService.getAuthToken();
      if (!token) {
        this.showError = true;
        this.errorMessage = 'Sessione scaduta. Effettua nuovamente il login.';
        this.isLoading = false;
        return;
      }

      const { username } = this.changePasswordForm.value;
      const newPassword = this.generateRandomPassword();
      this.generatedPassword = newPassword;

      const apiService = inject(ApiService);
      const result = await firstValueFrom(
        apiService.post<{ success: boolean; message: string }>('/auth/admin-change-password', {
          userName: username,
          newPassword: newPassword,
          jwtToken: token
        })
      );

      this.isLoading = false;

      if (result) {
        this.showSuccess = true;
        this.successMessage = `Password modificata con successo per l'utente ${username}. L'utente dovrà effettuare nuovamente il login.`;
        this.changePasswordForm.reset();
      } else {
        this.showError = true;
        this.errorMessage = 'Impossibile modificare la password. Verifica che l\'utente esista e riprova.';
        this.generatedPassword = '';
      }
    } catch (error) {
      console.error('Error changing password:', error);
      this.isLoading = false;
      this.showError = true;
      this.errorMessage = 'Si è verificato un errore durante la modifica della password. Riprova.';
      this.generatedPassword = '';
    }
  }

  getErrorMessage(fieldName: string): string {
    const control = this.changePasswordForm.get(fieldName);
    
    if (!control || !control.touched || !control.errors) 
      {return '';}
    

    if (control.errors['required']) 
      {return 'Questo campo è obbligatorio';}
    

    if (fieldName === 'username') 
      {if (control.errors['minlength']) 
        {return 'Il nome utente deve contenere almeno 3 caratteri';}}
      
    

    return '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.changePasswordForm.get(fieldName);
    return !!(control && control.invalid && control.touched);
  }

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      // Could show a toast notification here if desired
      console.log('Password copiata negli appunti');
    }).catch(err => {
      console.error('Errore durante la copia:', err);
    });
  }
}
