import { Routes } from '@angular/router';
import { DefaultLayoutComponent } from './layout';
import { authGuard } from './guard/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: '',
    component: DefaultLayoutComponent,
    data: {
      title: 'Home'
    },
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('./views/dashboard/routes').then((m) => m.routes)
      },

      /* routing piloti */ 
      {
        path: 'piloti',
        loadChildren: () => import('./views/piloti/routes').then((m) => m.routes)
      },
      /* routing regole */
      {
        path: 'regole',
        loadChildren: () => import('./views/regole/routes').then((m) => m.routes)
      },
      /* routing calendario */
      {
        path: 'championship',
        loadChildren: () => import('./views/championship/routes').then((m) => m.routes)
      },
       /* routing fanta */
      {
        path: 'fanta',
        loadChildren: () => import('./views/fanta/routes').then((m) => m.routes),
        canActivate: [authGuard]
      },
      { 
        path: 'login', 
        loadChildren: () => import('./views/login/routes').then((m) => m.routes) 
      }
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
