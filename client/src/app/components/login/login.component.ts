import { Component, ViewChild, inject, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormModule } from '@coreui/angular';
import { AuthService } from './../../service/auth.service';
import {
  AvatarComponent,
  DropdownComponent,
  DropdownItemDirective,
  DropdownMenuDirective,
  DropdownToggleDirective,
  GridModule,
  ButtonDirective,
  SpinnerModule,
} from '@coreui/angular';
import { DbDataService } from '../../../app/service/db-data.service';
import { cilWarning, cilAccountLogout, cilLockLocked } from '@coreui/icons';
import { IconDirective } from '@coreui/icons-angular';
import { cilUser } from '@coreui/icons';
import { RegistrationModalComponent } from '../registration-modal/registration-modal.component';
import { PasswordChangeModalComponent } from '../password-change-modal/password-change-modal.component';
import type { User } from '@f123dashboard/shared';

@Component({
  selector: 'login-component',
  imports: [
    CommonModule,
    FormsModule,
    FormModule,
    ButtonDirective,
    GridModule,
    IconDirective,
    DropdownComponent,
    DropdownToggleDirective,
    DropdownMenuDirective,
    DropdownItemDirective,
    AvatarComponent,
    SpinnerModule,
    RegistrationModalComponent,
    PasswordChangeModalComponent
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private dbData = inject(DbDataService);

  icons = { cilUser, cilLockLocked };
  
  // Current user data
  currentUser: User | null = null;

  // Login form fields
  username = '';
  password = '';

  // State management
  isLoading = false;
  isLoggedIn = false;
  errorMessage = '';

  // Validation errors
  usernameError = '';
  passwordError = '';

  public warningIcon: string[] = cilWarning;
  public logoutIcon: string[] = cilAccountLogout;

  @ViewChild('loginDropdown') dropdown!: DropdownComponent;
  @ViewChild('registrationModal') registrationModal!: RegistrationModalComponent;
  @ViewChild('passwordChangeModal') passwordChangeModal!: PasswordChangeModalComponent;

  ngOnInit(): void {
    // Check if user is already logged in
    this.authService.isAuthenticated$.subscribe(isAuth => {
      if (isAuth) {
        const user = this.authService.getCurrentUser();
        this.currentUser = user;
        this.isLoggedIn = true;
      }
    });

    // Subscribe to current user changes
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.isLoggedIn = !!user;
    });
  }

  async onLogin() {
    this.isLoading = true;
    this.errorMessage = '';
    if (!this.validateLoginForm()){
      return;
    }
    try {
      // First try login without navigation to check if email is missing
      const response = await this.authService.login({
        username: this.username,
        password: this.password
      }, true); // Skip navigation initially

      if (response.success) {
        this.dropdown.toggleDropdown();

        // Check if user has email, if not open registration modal for email completion
        if (response.user && (!response.user.mail || response.user.mail.trim() === '')) {
          console.log('User email is missing, opening email completion modal.');
          this.isLoading = false;
          this.errorMessage = 'È necessario completare il profilo inserendo un indirizzo email valido.';
          setTimeout(() => {
            this.errorMessage = ''; // Clear error message before opening modal
            this.openEmailCompletionModal(response.user!);
          }, 100); // Small delay to ensure modal is ready
          return;
        }
        this.currentUser = this.authService.getCurrentUser();
        this.isLoading = true;
        this.errorMessage = '';
        
        // If email is present, perform navigation manually
        const returnUrl = this.currentUser?.isAdmin ? '/admin' : '/fanta';
        this.router.navigate([returnUrl]);
      } else {
        this.errorMessage = response.message || 'Login fallito. Riprova.';
      }
    } catch (error) {
      this.errorMessage = 'Si è verificato un errore durante il login. Riprova.';
      console.error('Login error:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async onLogout() {
    try {
      const response = await this.authService.logout();
      this.isLoggedIn = false;
      this.currentUser = null;
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  private validateLoginForm(): boolean {
    this.usernameError = '';
    this.passwordError = '';

    if (!this.username) {
      this.usernameError = 'Nome utente obbligatorio';
      return false;
    }

    if (!this.password) {
      this.passwordError = 'Password obbligatoria';
      return false;
    }

    return true;
  }

  // Getter methods for template access
  get userDisplayName(): string {
    return this.currentUser ? `${this.currentUser.name} ${this.currentUser.surname}` : '';
  }

  get userId(): string {
    return this.currentUser ? String(this.currentUser.id) : 'default';
  }

  get avatarSrc(): string {
    return this.dbData.getAvatarSrc(this.currentUser);
  }

  openRegistrationModal() {
    this.registrationModal.openForRegistration();
  }

  openEmailCompletionModal(user: User) {
    this.registrationModal.openForEmailCompletion(user);
  }

  openUserProfileModal() {
    if (this.currentUser) {
      this.registrationModal.openForUpdate(this.currentUser);
    }
  }

  openPasswordChangeModal() {
    this.passwordChangeModal.open();
  }

  onRegistrationSuccess() {
    // Gestisce la registrazione avvenuta con successo
    this.isLoggedIn = true;
    this.currentUser = this.authService.getCurrentUser();
  }

  onUpdateSuccess() {
    // Gestisce l'aggiornamento del profilo avvenuto con successo
    this.currentUser = this.authService.getCurrentUser();
    
    // Se l'utente ha appena completato la sua email, segnalo come autenticato e navigo
    if (this.currentUser && this.currentUser.mail && this.currentUser.mail.trim() !== '') {
      this.authService.markUserAsAuthenticated();
      const returnUrl = this.currentUser.isAdmin ? '/admin' : '/fanta';
      this.router.navigate([returnUrl]);
    }
    
    // Opzionalmente mostra un messaggio di successo o aggiorna i dati utente
  }

  onPasswordChanged() {
    // Gestisce il cambio password avvenuto con successo
    console.log('Password modificata con successo');
    // Potrebbe mostrare un messaggio di successo o eseguire altre azioni
  }
}