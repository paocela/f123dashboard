import { Injectable } from '@angular/core';
import { USERS } from '../model/user';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUser: string | null = null;

  constructor(private router: Router) { }

  login(username: string, password: string): boolean {
    const user = USERS.find(u => u.username === username && u.password === password);
    if (user) {
      this.currentUser = user.username; // Salva l'utente loggato
      sessionStorage.setItem('user', user.username); // Salva nel sessionStorage
      sessionStorage.setItem('userId', user.id.toString());
      return true;
    }
    return false;
  }

  getLoggedUser(): string | null {
    if (!this.currentUser) {
      const storedUser = sessionStorage.getItem('user');
      if (storedUser) {
        this.currentUser = storedUser;
      }
    }
    return this.currentUser;
  }

  logout(): void {
    this.currentUser = null;
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('isLoggedIn');
    this.router.navigate(['/']);
  }
}
