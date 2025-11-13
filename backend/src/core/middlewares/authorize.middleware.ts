import { Response, NextFunction } from 'express';
import { ApiError } from '@/core/utils/ApiError';
import { RolUsuario } from '@/shared/types/enums';
import { AuthRequest } from '@/shared/types/request';

/**
 * Middleware para verificar que el usuario tenga uno de los roles permitidos
 */
export const authorize = (...roles: RolUsuario[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(ApiError.unauthorized('Usuario no autenticado'));
    }

    if (!roles.includes(req.user.rol)) {
      return next(
        ApiError.forbidden(
          `El rol ${req.user.rol} no tiene permisos para acceder a este recurso`
        )
      );
    }

    next();
  };
};

/**
 * Middleware para verificar que el usuario sea ADMIN
 */
export const adminOnly = authorize(RolUsuario.ADMIN);

/**
 * Middleware para verificar que el usuario sea DELEGADO
 */
export const delegadoOnly = authorize(RolUsuario.DELEGADO);

/**
 * Middleware para verificar que el usuario sea ADMIN o DELEGADO
 */
export const adminOrDelegado = authorize(RolUsuario.ADMIN, RolUsuario.DELEGADO);
