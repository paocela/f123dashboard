import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./piloti.component').then(m => m.PilotiComponent),
    data: {
      title: $localize`Piloti`
    }
  }
];

