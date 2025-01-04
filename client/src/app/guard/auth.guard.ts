import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {
  const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
  const router = inject(Router);

  console.log('is logged in' + isLoggedIn)
  if (!isLoggedIn) {
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false; // Rifiuta l'accesso alla rotta protetta
  }
  return true; // Permette l'accesso
};


