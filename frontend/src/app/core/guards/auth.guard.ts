import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * 🔐 AUTH GUARD (Funcional - Angular 21)
 *
 * Protege rutas que requieren autenticación.
 * Si el usuario NO está autenticado, redirige al login.
 *
 * Uso en routes:
 * { path: 'admin', component: AdminComponent, canActivate: [authGuard] }
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  // Guardar la URL a la que intentaba acceder para redirigir después del login
  router.navigate(['/login'], {
    queryParams: { returnUrl: state.url }
  });

  return false;
};
