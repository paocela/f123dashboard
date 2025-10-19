import { Component, ViewChild } from '@angular/core';
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
import { User } from '@genezio-sdk/f123dashboard';

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
  styleUrl: './login.component.scss',
  standalone: true
})
export class LoginComponent {
  icons = { cilUser, cilLockLocked };
  
  // Current user data
  currentUser: User | null = null;

  // Login form fields
  username: string = '';
  password: string = '';

  // State management
  isLoading: boolean = false;
  isLoggedIn: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  // Validation errors
  usernameError: string = '';
  passwordError: string = '';

  public warningIcon: string[] = cilWarning;
  public logoutIcon: string[] = cilAccountLogout;

  @ViewChild('loginDropdown') dropdown!: DropdownComponent;
  @ViewChild('registrationModal') registrationModal!: RegistrationModalComponent;
  @ViewChild('passwordChangeModal') passwordChangeModal!: PasswordChangeModalComponent;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private dbData: DbDataService
  ) {}

  ngOnInit(): void {
    // Check if user is already logged in
    this.authService.isAuthenticated$.subscribe(isAuth => {
      if (isAuth) {
        const user = this.authService.getCurrentUser();
        // Only navigate if user has email
        if (user && user.mail && user.mail.trim() !== '') {
          this.router.navigate(['/fanta']);
        }
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
    if (!this.validateLoginForm()) {
      return;
    }

    try {
      // First try login without navigation to check if email is missing
      const response = await this.authService.login({
        username: this.username,
        password: this.password
      }, true); // Skip navigation initially

      if (response.success) {
        this.successMessage = 'Login successful! Redirecting...';
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
        this.errorMessage = response.message || 'Login failed. Please try again.';
      }
    } catch (error) {
      this.errorMessage = 'An error occurred during login. Please try again.';
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
      this.usernameError = 'Username is required';
      return false;
    }

    if (!this.password) {
      this.passwordError = 'Password is required';
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
    // Handle successful registration
    this.isLoggedIn = true;
    this.currentUser = this.authService.getCurrentUser();
  }

  onUpdateSuccess() {
    // Handle successful profile update
    this.currentUser = this.authService.getCurrentUser();
    
    // If user just completed their email, mark them as authenticated and navigate
    if (this.currentUser && this.currentUser.mail && this.currentUser.mail.trim() !== '') {
      this.authService.markUserAsAuthenticated();
      const returnUrl = this.currentUser.isAdmin ? '/admin' : '/fanta';
      this.router.navigate([returnUrl]);
    }
    
    // Optionally show a success message or refresh user data
  }

  onPasswordChanged() {
    // Handle successful password change
    console.log('Password changed successfully');
    // Could show a success message or perform other actions
  }
}