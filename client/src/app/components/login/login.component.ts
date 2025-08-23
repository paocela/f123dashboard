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
} from '@coreui/angular';
import { DbDataService } from '../../../app/service/db-data.service';
import { cilWarning, cilAccountLogout } from '@coreui/icons';
import { IconDirective } from '@coreui/icons-angular';
import { cilUser } from '@coreui/icons';
import { RegistrationModalComponent } from '../registration-modal/registration-modal.component';

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
    RegistrationModalComponent
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  standalone: true
})
export class LoginComponent {
  icons = { cilUser };
  // Current user id
  loggedUserId: string = 'default';

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
        this.router.navigate(['/fanta']);
        this.loggedUserId = String(this.authService.getCurrentUserId());
        this.isLoggedIn = true;
      }
    });
  }

  async onLogin() {
    if (!this.validateLoginForm()) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    try {
      const response = await this.authService.login({
        username: this.username,
        password: this.password
      });

      if (response.success) {
        this.successMessage = 'Login successful! Redirecting...';
        this.dropdown.toggleDropdown();
        this.isLoggedIn = true;
        this.loggedUserId = String(this.authService.getCurrentUserId());
        // Navigation is handled by the auth service
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
      this.loggedUserId = 'default';
    } catch (error) {
    } finally {
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

  openRegistrationModal() {
    this.registrationModal.modal.visible = true;
  }
}