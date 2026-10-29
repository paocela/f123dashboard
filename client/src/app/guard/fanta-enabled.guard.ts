import { inject } from '@angular/core';
import type { CanActivateFn } from '@angular/router';
import { Router } from '@angular/router';
import { FeatureFlagsService } from '../service/feature-flags.service';

export const fantaEnabledGuard: CanActivateFn = () => {
  const featureFlagsService = inject(FeatureFlagsService);
  const router = inject(Router);

  return featureFlagsService.fantaEnabled() || router.createUrlTree(['/dashboard']);
};