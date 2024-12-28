import { Injectable } from '@angular/core';
import { User, USERS } from '../model/user';
import { Router } from '@angular/router';
import { DbDataService } from './db-data.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUser: string | null = null;
  private users: User[] = [];

  constructor(private router: Router, private dbData: DbDataService) { 
    this.users = dbData.getUsers();
    console.log(this.users);
  }

  login(username: string, password: string): boolean {
    const user = this.users.find(u => u.username === username && u.password === password);
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
    this.router.navigateByUrl('/redirect', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/fanta']);
    });
  }
}
