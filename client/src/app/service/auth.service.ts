import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, timer } from 'rxjs';
import { AuthService as BackendAuthService } from "@genezio-sdk/f123dashboard";
import { User, LoginRequest, RegisterRequest, AuthResponse, ChangePasswordRequest, SessionsResponse } from '../model/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private tokenRefreshTimer: any;

  public currentUser$ = this.currentUserSubject.asObservable();
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private router: Router) {
    this.initializeAuth();
  }

  private getClientInfo(): { userAgent: string } {
    return {
      userAgent: navigator.userAgent
    };
  }

  private initializeAuth(): void {
    const token = this.getToken();
    if (token) {
      this.validateTokenAndSetUser(token);
    }
  }

  private async validateTokenAndSetUser(token: string): Promise<void> {
    try {
      const validation = JSON.parse(await BackendAuthService.validateToken(token));
      if (validation.valid && validation.userId && validation.username) {
        // Get full user data (you might want to create a separate method for this)
        const userData = {
          id: validation.userId,
          username: validation.username,
          name: '', // These would come from a separate user details call
          surname: ''
        };
        
        this.setAuthenticatedUser(userData);
        this.scheduleTokenRefresh();
      } else {
        this.clearAuth();
      }
    } catch (error) {
      console.error('Token validation error:', error);
      this.clearAuth();
    }
  }

  async login(loginData: LoginRequest): Promise<AuthResponse> {
    try {
      const clientInfo = this.getClientInfo();
      const response = JSON.parse(await BackendAuthService.login(
        loginData.username, 
        loginData.password, 
        clientInfo.userAgent
      ));
      
      if (response.success && response.user && response.token) {
        this.setToken(response.token);
        this.setAuthenticatedUser(response.user);
        this.scheduleTokenRefresh();
        
        // Navigate to fanta or admin page
        const returnUrl = loginData.username == 'admin' ? '/admin' : '/fanta';
        this.router.navigate([returnUrl]);
      }
      
      return response;
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'An error occurred during login. Please try again.'
      };
    }
  }

  async register(registerData: RegisterRequest): Promise<AuthResponse> {
    try {
      const clientInfo = this.getClientInfo();
      const response = JSON.parse(await BackendAuthService.register(
        registerData.username,
        registerData.name,
        registerData.surname,
        registerData.password,
        clientInfo.userAgent
      ));
      
      if (response.success && response.user && response.token) {
        this.setToken(response.token);
        this.setAuthenticatedUser(response.user);
        this.scheduleTokenRefresh();
        
        // Navigate to dashboard
        this.router.navigate(['/dashboard']);
      }
      
      return response;
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: 'An error occurred during registration. Please try again.'
      };
    }
  }

  async changePassword(changeData: ChangePasswordRequest): Promise<{ success: boolean; message: string }> {
    try {
      const token = this.getToken();
      if (!token) {
        return {
          success: false,
          message: 'No authentication token found'
        };
      }

      const response = JSON.parse(await BackendAuthService.changePassword(
        token,
        changeData.currentPassword,
        changeData.newPassword
      ));
      return response;
    } catch (error) {
      console.error('Change password error:', error);
      return {
        success: false,
        message: 'An error occurred while changing password. Please try again.'
      };
    }
  }

  async refreshToken(): Promise<boolean> {
    try {
      const currentToken = this.getToken();
      if (!currentToken) {
        return false;
      }

      const clientInfo = this.getClientInfo();
      const response = JSON.parse(await BackendAuthService.refreshToken(
        currentToken, 
        clientInfo.userAgent
      ));
      
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
      if (token) {
        // Call backend to invalidate session (if method is available)
        try {
          await (BackendAuthService as any).logout(token);
        } catch (methodError) {
          console.warn('Backend logout method not available:', methodError);
        }
      }
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
    this.isAuthenticatedSubject.next(true);
    
    // Store user data in session storage for persistence
    sessionStorage.setItem('user', JSON.stringify(user));
    sessionStorage.setItem('isLoggedIn', 'true');
  }

  private clearAuth(): void {
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    
    // Clear stored data
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('isLoggedIn');
    
    // Clear token refresh timer
    if (this.tokenRefreshTimer) {
      clearTimeout(this.tokenRefreshTimer);
    }
  }

  private setToken(token: string): void {
    sessionStorage.setItem('authToken', token);
  }

  private getToken(): string | null {
    return sessionStorage.getItem('authToken');
  }

  private scheduleTokenRefresh(): void {
    // Clear existing timer
    if (this.tokenRefreshTimer) {
      clearTimeout(this.tokenRefreshTimer);
    }

    // Schedule refresh for 6 days (token expires in 7 days)
    this.tokenRefreshTimer = setTimeout(() => {
      this.refreshToken().then(success => {
        if (!success) {
          this.logout();
        }
      });
    }, 6 * 24 * 60 * 60 * 1000); // 6 days in milliseconds
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
      if (!token) {
        return { success: false, message: 'No authentication token found' };
      }

      const response = JSON.parse(await (BackendAuthService as any).getUserSessions(token));
      return response;
    } catch (error) {
      console.error('Get user sessions error:', error);
      return { success: false, message: 'An error occurred while fetching sessions' };
    }
  }

  async logoutAllSessions(): Promise<{ success: boolean; message: string }> {
    try {
      const token = this.getToken();
      if (!token) {
        return { success: false, message: 'No authentication token found' };
      }

      const response = JSON.parse(await (BackendAuthService as any).logoutAllSessions(token));
      
      if (response.success) {
        // Clear local auth state since all sessions are logged out
        this.clearAuth();
        this.router.navigate(['/login']);
      }
      
      return response;
    } catch (error) {
      console.error('Logout all sessions error:', error);
      return { success: false, message: 'An error occurred while logging out all sessions' };
    }
  }

  // Helper method to get device/session info for display
  getDeviceInfo(): string {
    const userAgent = navigator.userAgent;
    let deviceInfo = 'Unknown Device';

    if (userAgent.includes('Windows')) {
      deviceInfo = 'Windows Device';
    } else if (userAgent.includes('Mac')) {
      deviceInfo = 'Mac Device';
    } else if (userAgent.includes('Linux')) {
      deviceInfo = 'Linux Device';
    } else if (userAgent.includes('Android')) {
      deviceInfo = 'Android Device';
    } else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
      deviceInfo = 'iOS Device';
    }

    // Add browser info
    if (userAgent.includes('Chrome')) {
      deviceInfo += ' (Chrome)';
    } else if (userAgent.includes('Firefox')) {
      deviceInfo += ' (Firefox)';
    } else if (userAgent.includes('Safari')) {
      deviceInfo += ' (Safari)';
    } else if (userAgent.includes('Edge')) {
      deviceInfo += ' (Edge)';
    }

    return deviceInfo;
  }
}
