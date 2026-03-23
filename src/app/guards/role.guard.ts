import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const userRole = authService.getRole();
  const expectedRole = route.data['role'];

  if (userRole === expectedRole) {
    return true;
  }

  alert('No tienes permiso para esta sección');
  return router.createUrlTree(['/login']);
};
