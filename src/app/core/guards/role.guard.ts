import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStorageService } from '@core/services/auth-storage.service';

export const roleGuard: CanActivateFn = (route, _state) => {
  const authStorage = inject(AuthStorageService);
  const router = inject(Router);

  if (!authStorage.getToken()) {
    return router.parseUrl('/sign-in');
  }

  const user = authStorage.getCurrentUser();
  const allowedRoles = route.data?.['roles'] as string[];

  if (user && allowedRoles && allowedRoles.includes(user.role)) {
    return true;
  }

  // Redirection fallback based on role
  if (user?.role === 'CLIENT') {
    return router.parseUrl('/tickets');
  }

  return router.parseUrl('/dashboard');
};
