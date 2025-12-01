import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

/**
 * 🔐 AUTH INTERCEPTOR (Funcional - Angular 21)
 *
 * Intercepta todas las peticiones HTTP y añade el token JWT en el header Authorization
 * Si el token no existe, la petición se envía sin el header
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  // Si no hay token, enviar la petición sin modificar
  if (!token) {
    return next(req);
  }

  // Clonar la petición y añadir el header Authorization
  const clonedRequest = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });

  return next(clonedRequest);
};
