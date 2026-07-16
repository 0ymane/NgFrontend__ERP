import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStorageService } from '@core/services/auth-storage.service';

export const authGuard: CanActivateFn = (_route, _state) => {
  const authStorage = inject(AuthStorageService);
  const router = inject(Router);

  if (authStorage.getToken()) {
    return true;
  }

  return router.parseUrl('/sign-in');
};
