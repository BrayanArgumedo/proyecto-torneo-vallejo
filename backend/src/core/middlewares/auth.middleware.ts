import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ApiError } from '@/core/utils/ApiError';
import { Usuario } from '@/features/usuarios/models/usuario.model';
import { asyncHandler } from '@/core/utils/asyncHandler';
import { AuthRequest } from '@/shared/types/request';

interface JwtPayload {
  id: string;
  rol: string;
}

/**
 * Middleware para verificar JWT y autenticar usuario
 */
export const protect = asyncHandler(
  async (req: AuthRequest, _res: Response, next: NextFunction): Promise<void> => {
    let token: string | undefined;

    // Obtener token del header Authorization
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Verificar que el token existe
    if (!token) {
      return next(ApiError.unauthorized('No se proporcionó token de autenticación'));
    }

    try {
      // Verificar token
      const jwtSecret = process.env.JWT_SECRET;

      if (!jwtSecret) {
        throw new Error('JWT_SECRET no está configurado');
      }

      const decoded = jwt.verify(token, jwtSecret) as JwtPayload;

      // Obtener usuario del token
      const usuario = await Usuario.findById(decoded.id).select('-password');

      if (!usuario) {
        return next(ApiError.unauthorized('Usuario no encontrado'));
      }

      // Verificar que el usuario esté activo
      if (usuario.estado !== 'ACTIVO') {
        return next(ApiError.forbidden('Usuario inactivo'));
      }

      // Agregar usuario al request
      req.user = usuario;
      next();
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        return next(ApiError.unauthorized('Token inválido'));
      }
      if (error instanceof jwt.TokenExpiredError) {
        return next(ApiError.unauthorized('Token expirado'));
      }
      return next(ApiError.unauthorized('Error al verificar token'));
    }
  }
);
