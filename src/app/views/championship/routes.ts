import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./championship.component').then(m => m.ChampionshipComponent),
    data: {
      title: $localize`Championship`
    }
  }
];

