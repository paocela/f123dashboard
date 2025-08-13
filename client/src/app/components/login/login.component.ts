import { NgIf } from '@angular/common';
import { Component, ViewChild} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';    
import { FormsModule } from '@angular/forms';
import { FormModule } from '@coreui/angular';
import { AuthService } from './../../service/auth.service';
import {   AvatarComponent, DropdownCloseDirective, DropdownComponent, DropdownItemDirective, DropdownMenuDirective, DropdownToggleDirective, GridModule, ButtonDirective, ModalComponent, ModalHeaderComponent, ModalBodyComponent, ModalFooterComponent, ModalToggleDirective} from '@coreui/angular';
import { DbDataService } from '../../../app/service/db-data.service';
import { cilWarning, cilAccountLogout } from '@coreui/icons';
import { IconDirective } from '@coreui/icons-angular';
import { User } from '../../model/user';

@Component({
    selector: 'login-component',
    imports: [
    NgIf,
    CommonModule,
    FormsModule,
    FormModule,
    ButtonDirective,
    GridModule,
    ModalComponent,
    ModalHeaderComponent,
    ModalBodyComponent,
    ModalFooterComponent,
    ModalToggleDirective,
    IconDirective,
    DropdownComponent,
    DropdownToggleDirective,
    DropdownMenuDirective,
    DropdownItemDirective,
    DropdownCloseDirective,
    AvatarComponent
],
    templateUrl: './login.component.html',
    styleUrl: './login.component.scss'
})

export class LoginComponent {
  // Current user id
  loggedUserId: string = 'default';

  // Login form fields
  username: string = '';
  password: string = '';
  
  // Registration form fields
  name: string = '';
  surname: string = '';
  regUsername: string = '';
  regPassword: string = '';
  confirmPassword: string = '';
  
  // State management
  isLoading: boolean = false;
  isLoggedIn: boolean = false;
  singInErrorMessage: string = '';
  errorMessage: string = '';
  successMessage: string = '';
  showRegistration: boolean = false;
  
  // Validation errors
  usernameError: string = '';
  passwordError: string = '';
  
  public warningIcon: string[] = cilWarning;
  public logoutIcon: string[] = cilAccountLogout;

  @ViewChild('loginDropdown') dropdown!: DropdownComponent;

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

  private validateLoginForm(): boolean {
    this.usernameError = '';
    this.passwordError = '';

    if (!this.username ) {
      this.usernameError = 'Username is required';
      return false;
    }

    if (!this.password) {
      this.passwordError = 'Password is required';
      return false;
    }

    return true;
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