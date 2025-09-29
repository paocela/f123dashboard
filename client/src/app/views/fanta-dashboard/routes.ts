import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./fanta-dashboard.component').then(m => m.FantaDashboardComponent),
    data: {
      title: $localize`Fanta Dashboard`
    }
  }
];

