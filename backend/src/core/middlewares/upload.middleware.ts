import { Request, Response, NextFunction } from 'express';
import { UploadType } from '@/core/config/multer.config';
import { ApiError } from '@/core/utils/ApiError';
import { ERRORES } from '@/core/config/constants';

// ========================================
// MIDDLEWARE PARA CONFIGURAR TIPO DE UPLOAD
// ========================================

/**
 * Middleware para establecer el tipo de upload en la request
 * Debe ejecutarse ANTES del middleware de Multer
 */
export const setUploadType = (uploadType: UploadType) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    (req as any).uploadType = uploadType;
    next();
  };
};

// ========================================
// MIDDLEWARE PARA MANEJAR ERRORES DE MULTER
// ========================================

/**
 * Middleware para capturar y formatear errores de Multer
 * Debe ejecutarse DESPUÉS del middleware de Multer
 */
export const handleMulterError = (
  err: any,
  _req: Request,
  _res: Response,
  next: NextFunction
): void => {
  if (err) {
    // Error de Multer por tamaño excedido
    if (err.code === 'LIMIT_FILE_SIZE') {
      throw ApiError.badRequest(ERRORES.ARCHIVO_MUY_GRANDE);
    }

    // Error de Multer por tipo de archivo inválido
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      throw ApiError.badRequest('Campo de archivo no esperado');
    }

    // Error personalizado desde fileFilter
    if (err instanceof ApiError) {
      throw err;
    }

    // Cualquier otro error de Multer
    throw ApiError.badRequest(`Error al subir archivo: ${err.message}`);
  }

  next();
};

// ========================================
// MIDDLEWARE PARA VALIDAR ARCHIVO REQUERIDO
// ========================================

/**
 * Middleware para validar que se haya subido un archivo
 * Debe ejecutarse DESPUÉS del middleware de Multer
 */
export const validateFileRequired = (fieldName: string = 'file') => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.file) {
      throw ApiError.badRequest(`El campo '${fieldName}' es requerido`);
    }
    next();
  };
};

// ========================================
// MIDDLEWARE PARA VALIDAR MÚLTIPLES ARCHIVOS
// ========================================

/**
 * Middleware para validar que se hayan subido múltiples archivos
 * Debe ejecutarse DESPUÉS del middleware de Multer
 */
export const validateFilesRequired = (
  fieldName: string = 'files',
  minFiles: number = 1
) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const files = req.files as Express.Multer.File[] | undefined;

    if (!files || files.length === 0) {
      throw ApiError.badRequest(`Se requiere al menos un archivo en '${fieldName}'`);
    }

    if (files.length < minFiles) {
      throw ApiError.badRequest(
        `Se requieren al menos ${minFiles} archivo(s) en '${fieldName}'`
      );
    }

    next();
  };
};
