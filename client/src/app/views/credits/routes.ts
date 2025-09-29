import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./credits.component').then(m => m.CreditsComponent),
    data: {
      title: $localize`Credits`
    }
  }
];

