import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'result-edit',
    pathMatch: 'full'
  },
  {
    path: 'result-edit',
    loadComponent: () => import('./admin.component').then(m => m.AdminComponent),
    data: {
      title: $localize`Admin`
    }
  },
  {
    path: 'gp-edit',
    loadComponent: () => import('./gp-edit/gp-edit.component').then(m => m.GpEditComponent),
    data: {
      title: 'GP Edit'
    }
  },
  {
    path: 'change-password',
    loadComponent: () => import('../admin-change-password/admin-change-password.component').then(m => m.AdminChangePasswordComponent),
    data: {
      title: 'Modifica Password Utente'
    }
  }
];

