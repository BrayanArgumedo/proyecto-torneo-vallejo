import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Rol } from '../../shared/models';

/**
 * 👮 ROLE GUARD (Funcional - Angular 21)
 *
 * Protege rutas que requieren un rol específico (ADMIN o DELEGADO).
 * Si el usuario no tiene el rol requerido, redirige a página de acceso denegado.
 *
 * Uso en routes con data:
 * {
 *   path: 'admin',
 *   component: AdminComponent,
 *   canActivate: [authGuard, roleGuard],
 *   data: { roles: [Rol.ADMIN] }  // ✅ Especificar roles permitidos
 * }
 */
export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const currentUser = authService.currentUser();
  const requiredRoles = route.data['roles'] as Rol[];

  // Si no hay usuario, no puede acceder
  if (!currentUser) {
    router.navigate(['/login']);
    return false;
  }

  // Si no se especificaron roles requeridos, permitir acceso
  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }

  // Verificar si el usuario tiene alguno de los roles requeridos
  if (requiredRoles.includes(currentUser.rol)) {
    return true;
  }

  // Usuario no tiene permisos -> redirigir según su rol
  if (currentUser.rol === Rol.ADMIN) {
    router.navigate(['/admin']);
  } else if (currentUser.rol === Rol.DELEGADO) {
    router.navigate(['/delegado']);
  } else {
    router.navigate(['/']);
  }

  return false;
};
