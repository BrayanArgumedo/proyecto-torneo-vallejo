import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import { Request } from 'express';
import { VALIDACION, ERRORES } from '@/core/config/constants';
import { ApiError } from '@/core/utils/ApiError';

// ========================================
// TIPOS
// ========================================

type DestinationCallback = (error: Error | null, destination: string) => void;
type FilenameCallback = (error: Error | null, filename: string) => void;

export enum UploadType {
  FOTO_JUGADOR = 'foto_jugador',
  DOCUMENTO_JUGADOR = 'documento_jugador',
  ESCUDO_EQUIPO = 'escudo_equipo',
}

// ========================================
// CONFIGURACIÓN DE STORAGE
// ========================================

/**
 * Configuración del almacenamiento en disco para Multer
 */
const storage = multer.diskStorage({
  destination: (
    req: Request,
    _file: Express.Multer.File,
    cb: DestinationCallback
  ): void => {
    // Obtener el tipo de upload desde los metadatos de la request
    const uploadType = (req as any).uploadType as UploadType;

    let uploadPath = 'uploads/';

    switch (uploadType) {
      case UploadType.FOTO_JUGADOR:
        uploadPath += 'jugadores/fotos';
        break;
      case UploadType.DOCUMENTO_JUGADOR:
        uploadPath += 'jugadores/documentos';
        break;
      case UploadType.ESCUDO_EQUIPO:
        uploadPath += 'equipos/escudos';
        break;
      default:
        uploadPath += 'misc';
    }

    cb(null, uploadPath);
  },

  filename: (
    _req: Request,
    file: Express.Multer.File,
    cb: FilenameCallback
  ): void => {
    // Generar nombre único: timestamp-random-originalname
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, '_');

    const filename = `${uniqueSuffix}-${sanitizedName}${ext}`;
    cb(null, filename);
  },
});

// ========================================
// FILTROS DE ARCHIVO
// ========================================

/**
 * Filtro para validar tipo de archivo (solo imágenes)
 */
const imageFileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
): void => {
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  const allowedExtensions = ['.jpg', '.jpeg', '.png'];

  const ext = path.extname(file.originalname).toLowerCase();
  const mimeType = file.mimetype;

  if (allowedMimeTypes.includes(mimeType) && allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(
      ApiError.badRequest(
        `${ERRORES.FORMATO_NO_PERMITIDO}. Solo se permiten imágenes JPG, JPEG o PNG`
      ) as any
    );
  }
};

/**
 * Filtro para validar tipo de archivo (documentos e imágenes)
 */
const documentFileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
): void => {
  const allowedMimeTypes = VALIDACION.FORMATOS_DOCUMENTO as readonly string[];
  const allowedExtensions = VALIDACION.EXTENSIONES_DOCUMENTO as readonly string[];

  const ext = path.extname(file.originalname).toLowerCase();
  const mimeType = file.mimetype;

  if (allowedMimeTypes.includes(mimeType) && allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(
      ApiError.badRequest(
        `${ERRORES.FORMATO_NO_PERMITIDO}. Solo se permiten: ${allowedExtensions.join(', ')}`
      ) as any
    );
  }
};

// ========================================
// INSTANCIAS DE MULTER
// ========================================

/**
 * Multer para fotos de jugadores
 * - Tamaño máximo: 2MB
 * - Formatos: JPG, JPEG, PNG
 */
export const uploadFotoJugador = multer({
  storage,
  limits: {
    fileSize: VALIDACION.MAX_SIZE_FOTO,
  },
  fileFilter: imageFileFilter,
});

/**
 * Multer para documentos de jugadores
 * - Tamaño máximo: 5MB
 * - Formatos: PDF, JPG, JPEG, PNG
 */
export const uploadDocumentoJugador = multer({
  storage,
  limits: {
    fileSize: VALIDACION.MAX_SIZE_DOCUMENTO,
  },
  fileFilter: documentFileFilter,
});

/**
 * Multer para escudos de equipos
 * - Tamaño máximo: 1MB
 * - Formatos: JPG, JPEG, PNG
 */
export const uploadEscudoEquipo = multer({
  storage,
  limits: {
    fileSize: VALIDACION.MAX_SIZE_ESCUDO,
  },
  fileFilter: imageFileFilter,
});
