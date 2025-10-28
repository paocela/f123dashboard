import { Routes } from '@angular/router';
import { DefaultLayoutComponent } from './layout';
import { authGuard } from './guard/auth.guard';
import { adminGuard } from './guard/admin.guard';

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
      /* routing fanta-dashboard */
      {
        path: 'fanta-dashboard',
        loadChildren: () => import('./views/fanta-dashboard/routes').then((m) => m.routes),
      },
      /* routing fanta */
      {
        path: 'fanta',
        loadChildren: () => import('./views/fanta/routes').then((m) => m.routes),
        canActivate: [authGuard]
      },
      /* routing admin */
      {
        path: 'admin',
        loadChildren: () => import('./views/admin/routes').then((m) => m.routes),
        canActivate: [adminGuard]
      },
      /* routing admin change password */
      {
        path: 'admin-change-password',
        loadChildren: () => import('./views/admin-change-password/routes').then((m) => m.routes),
        canActivate: [adminGuard]
      },
      /* routing credits */
      {
        path: 'credits',
        loadChildren: () => import('./views/credits/routes').then((m) => m.routes)
      },
      /* routing albo d'oro */
      {
        path: 'albo-d-oro',
        loadChildren: () => import('./views/albo-d-oro/routes').then((m) => m.routes)
      }
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];