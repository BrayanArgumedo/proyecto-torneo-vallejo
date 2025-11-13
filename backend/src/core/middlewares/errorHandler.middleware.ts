import { Request, Response, NextFunction } from 'express';
import { ApiError } from '@/core/utils/ApiError';
import mongoose from 'mongoose';

/**
 * Middleware para manejo centralizado de errores
 */
export const errorHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let error = err;

  // Si no es un ApiError, convertirlo
  if (!(error instanceof ApiError)) {
    let statusCode = 500;
    let message = error.message || 'Error interno del servidor';

    // Errores de Mongoose
    if (error instanceof mongoose.Error.ValidationError) {
      statusCode = 400;
      const messages = Object.values(error.errors).map((e) => e.message);
      message = messages.join(', ');
    } else if (error instanceof mongoose.Error.CastError) {
      statusCode = 400;
      message = `ID inválido: ${error.value}`;
    } else if ((error as any).code === 11000) {
      // Duplicate key error
      statusCode = 409;
      const field = Object.keys((error as any).keyPattern)[0];
      message = `Ya existe un registro con ese ${field}`;
    }

    error = new ApiError(message, statusCode);
  }

  const apiError = error as ApiError;

  // Log del error en desarrollo
  if (process.env.NODE_ENV === 'development') {
    console.error('❌ Error:', {
      message: apiError.message,
      statusCode: apiError.statusCode,
      stack: apiError.stack,
      path: req.path,
      method: req.method,
    });
  }

  // Response
  res.status(apiError.statusCode).json({
    success: false,
    message: apiError.message,
    ...(process.env.NODE_ENV === 'development' && { stack: apiError.stack }),
  });
};

/**
 * Middleware para rutas no encontradas
 */
export const notFound = (req: Request, _res: Response, next: NextFunction): void => {
  const error = ApiError.notFound(`Ruta no encontrada: ${req.originalUrl}`);
  next(error);
};
