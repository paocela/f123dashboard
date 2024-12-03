import { Injectable } from '@angular/core';
import { USERS, User } from '../user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUser: string | null = null;

  constructor() { }

  login(username: string, password: string): boolean {
    const user = USERS.find(u => u.username === username && u.password === password);
    if (user) {
      this.currentUser = user.username; // Salva l'utente loggato
      sessionStorage.setItem('user', user.username); // Salva nel sessionStorage
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
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
  }
}
