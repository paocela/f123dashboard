import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./regole.component').then(m => m.RegoleComponent),
    data: {
      title: $localize`Regole`
    }
  }
];

