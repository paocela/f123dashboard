import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../service/auth.service';
import { map, take } from 'rxjs/operators';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isAuthenticated$.pipe(
    take(1),
    map(isAuthenticated => {
      const currentUser = authService.getCurrentUser();

      // Check if user is authenticated
      if (!isAuthenticated) {
        sessionStorage.setItem('returnUrl', state.url);
        return router.createUrlTree(['/login']);
      }

      // Check if user is admin
      if (!currentUser?.isAdmin) {
        // Redirect non-admin users to dashboard
        return router.createUrlTree(['/dashboard']);
      }

      // Allow access for admin users
      return true;
    })
  );
};
