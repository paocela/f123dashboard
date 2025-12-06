import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import type { 
  AuthResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
  LoginRequest,
  RefreshTokenResponse,
  RegisterRequest,
  SessionsResponse,
  TokenValidationResponse,
  UpdateUserInfoRequest,
  User
} from '@f123dashboard/shared';
import { ApiService } from './api.service';
import { ConfigService } from './config.service';
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private router = inject(Router);
  private apiService = inject(ApiService);
  private configService = inject(ConfigService);

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private tokenRefreshTimer: any;

  public currentUser$ = this.currentUserSubject.asObservable();
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor() {
    this.initializeAuth();
  }

  private getClientInfo(): { userAgent: string } {
    return {
      userAgent: navigator.userAgent
    };
  }

  private initializeAuth(): void {
    const token = this.getToken();
    const storedUser = sessionStorage.getItem('user');
    
    if (storedUser) 
      {try {
        const user = JSON.parse(storedUser);
        this.setAuthenticatedUser(user);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
      }}
    
    
    if (token) 
      {this.validateTokenAndSetUser(token);}
    
  }

  private async validateTokenAndSetUser(token: string): Promise<void> {
    try {
      const validation = await firstValueFrom(
        this.apiService.post<TokenValidationResponse>('/auth/validate', {})
      );
      if (validation.valid && validation.userId && validation.username && validation.name && validation.surname) {
        // Get full user data (you might want to create a separate method for this)
        const userData: User = {
          id: validation.userId,
          username: validation.username,
          name: validation.name,
          surname: validation.surname,
          mail: validation.mail,
          image: validation.image,
          isAdmin: validation.isAdmin
        };
        
        this.setAuthenticatedUser(userData);
        this.scheduleTokenRefresh();
      } else 
        {this.clearAuth();}
      
    } catch (error) {
      console.error('Token validation error:', error);
      this.clearAuth();
    }
  }

  async login(loginData: LoginRequest, skipNavigation = false): Promise<AuthResponse> {
    try {
      const clientInfo = this.getClientInfo();
      loginData.userAgent = clientInfo.userAgent;
      const response = await firstValueFrom(
        this.apiService.post<AuthResponse>('/auth/login', loginData)
      );
      
      if (response.success && response.user && response.token) {
        this.setToken(response.token);
        this.scheduleTokenRefresh();
        if (response.user.mail && response.user.mail.trim() !== '') 
          {this.setAuthenticatedUser(response.user);}
        

        
        // Navigate to fanta or admin page only if navigation is not skipped
        if (!skipNavigation) {
          const returnUrl = response.user.isAdmin ? '/admin' : '/fanta';
          this.router.navigate([returnUrl]);
        }
      }
      
      return response;
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Si è verificato un errore durante il login. Riprova.'
      };
    }
  }

  async register(registerData: RegisterRequest): Promise<AuthResponse> {
    try {
      // Prepare the request body for the HTTP endpoint

      const response = await firstValueFrom(
        this.apiService.post<AuthResponse>('/auth/register', registerData)
      );
      
      if (response.success && response.user && response.token) {
        this.setToken(response.token);
        this.setAuthenticatedUser(response.user);
        this.scheduleTokenRefresh();
        
        // Navigate to dashboard
        this.router.navigate(['/dashboard']);
      }
      
      return response;
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Handle HTTP error responses
      if (error.error && error.error.message) 
        {return {
          success: false,
          message: error.error.message
        };}
      
      
      return {
        success: false,
        message: 'Si è verificato un errore durante la registrazione. Riprova. Se l\'errore persiste, contatta il supporto.'
      };
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      const token = this.getToken();
      if (!token) 
        {return {
          success: false,
          message: 'Token di autenticazione non trovato'
        };}
      
      const changeData: ChangePasswordRequest = {
        currentPassword,
        newPassword,
        jwtToken: token
      };

      const response = await firstValueFrom(
        this.apiService.post<ChangePasswordResponse>('/auth/change-password', changeData)
      );
      return response;
    } catch (error) {
      console.error('Change password error:', error);
      return {
        success: false,
        message: 'Si è verificato un errore durante il cambio password. Riprova.'
      };
    }
  }

  async updateUserInfo(updateData: UpdateUserInfoRequest): Promise<AuthResponse> {
    try {
      const token = this.getToken();
      if (!token) 
        {return {
          success: false,
          message: 'Token di autenticazione non trovato'
        };}
      
      updateData.jwt = token;
    
      const response = await firstValueFrom(
        this.apiService.post<AuthResponse>('/auth/update-user-info', updateData)
      );

      if (response.success && response.user) 
        // Update the current user data in the service
        {this.setAuthenticatedUser(response.user);}
      
      
      return response;
    } catch (error: any) {
      console.error('Update user info error:', error);
      
      // Handle HTTP error responses
      if (error.error && error.error.message) 
        {return {
          success: false,
          message: error.error.message
        };}
      
      return {
        success: false,
        message: 'Si è verificato un errore durante l\'aggiornamento delle informazioni utente. Riprova.'
      };
    }
  }

  async refreshToken(): Promise<boolean> {
    try {
      const currentToken = this.getToken();
      if (!currentToken) 
        {return false;}
      

      const clientInfo = this.getClientInfo();
      const response = await firstValueFrom(
        this.apiService.post<RefreshTokenResponse>('/auth/refresh-token', {
          token: currentToken,
          userAgent: clientInfo.userAgent
        })
      );
      
      if (response.success && response.token) {
        this.setToken(response.token);
        this.scheduleTokenRefresh();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Token refresh error:', error);
      return false;
    }
  }

  async logout(): Promise<void> {
    try {
      const token = this.getToken();
      if (token) 
        // Call backend to invalidate session
        {try {
          await firstValueFrom(
            this.apiService.post('/auth/logout', {})
          );
        } catch (methodError) {
          console.warn('Backend logout error:', methodError);
        }}
      
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local auth state
      this.clearAuth();
      this.router.navigate(['/login']);
    }
  }

  private setAuthenticatedUser(user: User): void {
    this.currentUserSubject.next(user);
    
    // Only set as authenticated if user has email
    const hasEmail = !!(user.mail && user.mail.trim() !== '');
    this.isAuthenticatedSubject.next(hasEmail);
    
    // Store user data in session storage for persistence
    sessionStorage.setItem('user', JSON.stringify(user));
    sessionStorage.setItem('isLoggedIn', hasEmail ? 'true' : 'false');
  }

  // Method to mark user as fully authenticated after email completion
  public markUserAsAuthenticated(): void {
    const currentUser = this.currentUserSubject.value;
    if (currentUser && currentUser.mail && currentUser.mail.trim() !== '') {
      this.isAuthenticatedSubject.next(true);
      sessionStorage.setItem('isLoggedIn', 'true');
    }
  }

  private clearAuth(): void {
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    
    // Clear stored data
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('isLoggedIn');
    
    // Clear token refresh timer
    if (this.tokenRefreshTimer) 
      {clearTimeout(this.tokenRefreshTimer);}
    
  }

  private setToken(token: string): void {
    // Set JWT in cookie (expires in 7 days, Secure, SameSite=Strict)
    document.cookie = `authToken=${token}; path=/; max-age=${7 * 24 * 60 * 60}; Secure; SameSite=Strict`;
  }

  public getToken(): string | null {
    // Read JWT from cookie
    const match = document.cookie.match(/(^|;) ?authToken=([^;]*)(;|$)/);
    return match ? match[2] : null;
  }

  private scheduleTokenRefresh(): void {
    // Clear existing timer
    if (this.tokenRefreshTimer) 
      {clearTimeout(this.tokenRefreshTimer);}
    

    // Schedule refresh using configured time before expiry
    this.tokenRefreshTimer = setTimeout(() => {
      this.refreshToken().then(success => {
        if (!success) 
          {this.logout();}
        
      });
    }, this.configService.tokenRefreshTimeBeforeExpiry);
  }

  // Getters for backwards compatibility
  getLoggedUser(): string | null {
    const user = this.currentUserSubject.value;
    return user ? user.username : null;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getCurrentUserId(): number | null {
    const user = this.currentUserSubject.value;
    return user ? user.id : null;
  }

  isLoggedIn(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  getAuthToken(): string | null {
    return this.getToken();
  }

  // Session management methods
  async getUserSessions(): Promise<SessionsResponse> {
    try {
      const token = this.getToken();
      if (!token) 
        {return { success: false, message: 'Token di autenticazione non trovato' };}
      

      const response = await firstValueFrom(
        this.apiService.get<SessionsResponse>('/auth/sessions')
      );
      return response;
    } catch (error) {
      console.error('Get user sessions error:', error);
      return { success: false, message: 'Si è verificato un errore durante il recupero delle sessioni' };
    }
  }

  async logoutAllSessions(): Promise<{ success: boolean; message: string }> {
    try {
      const token = this.getToken();
      if (!token) 
        {return { success: false, message: 'Token di autenticazione non trovato' };}
      

      const response = await firstValueFrom(
        this.apiService.post<{ success: boolean; message: string }>('/auth/logout-all-sessions', {})
      );
      
      if (response.success) {
        // Clear local auth state since all sessions are logged out
        this.clearAuth();
        this.router.navigate(['/login']);
      }
      
      return response;
    } catch (error) {
      console.error('Logout all sessions error:', error);
      return { success: false, message: 'Si è verificato un errore durante il logout da tutte le sessioni' };
    }
  }

  // Helper method to get device/session info for display
  getDeviceInfo(): string {
    const userAgent = navigator.userAgent;
    let deviceInfo = 'Unknown Device';

    if (userAgent.includes('Windows')) 
      {deviceInfo = 'Windows Device';}
     else if (userAgent.includes('Mac')) 
      {deviceInfo = 'Mac Device';}
     else if (userAgent.includes('Linux')) 
      {deviceInfo = 'Linux Device';}
     else if (userAgent.includes('Android')) 
      {deviceInfo = 'Android Device';}
     else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) 
      {deviceInfo = 'iOS Device';}
    

    // Add browser info
    if (userAgent.includes('Chrome')) 
      {deviceInfo += ' (Chrome)';}
     else if (userAgent.includes('Firefox')) 
      {deviceInfo += ' (Firefox)';}
     else if (userAgent.includes('Safari')) 
      {deviceInfo += ' (Safari)';}
     else if (userAgent.includes('Edge')) 
      {deviceInfo += ' (Edge)';}
    

    return deviceInfo;
  }

  // Helper method to validate password strength
  isPasswordStrong(password: string): boolean {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);

    return hasUpperCase && hasLowerCase && hasNumbers;
  }
}
