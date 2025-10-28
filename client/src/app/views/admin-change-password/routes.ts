import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./admin-change-password.component').then(m => m.AdminChangePasswordComponent),
    data: {
      title: 'Modifica Password Utente'
    }
  }
];
