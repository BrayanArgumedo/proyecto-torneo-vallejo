import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

// ========================================
// PROMISIFY FS FUNCTIONS
// ========================================

const unlinkAsync = promisify(fs.unlink);
const existsAsync = promisify(fs.exists);
const mkdirAsync = promisify(fs.mkdir);

// ========================================
// INTERFACES
// ========================================

export interface FileInfo {
  filename: string;
  path: string;
  size: number;
  mimetype: string;
  url: string;
}

// ========================================
// UTILIDADES DE ARCHIVOS
// ========================================

/**
 * Eliminar archivo del filesystem
 */
export const deleteFile = async (filePath: string): Promise<void> => {
  try {
    // Convertir ruta relativa a absoluta
    const absolutePath = path.isAbsolute(filePath)
      ? filePath
      : path.join(process.cwd(), filePath);

    // Verificar si el archivo existe
    const exists = await existsAsync(absolutePath);

    if (exists) {
      await unlinkAsync(absolutePath);
      console.log(`✅ Archivo eliminado: ${filePath}`);
    } else {
      console.log(`⚠️ Archivo no existe: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error al eliminar archivo ${filePath}:`, error);
    // No lanzar error, solo registrar
  }
};

/**
 * Eliminar múltiples archivos del filesystem
 */
export const deleteFiles = async (filePaths: string[]): Promise<void> => {
  const deletePromises = filePaths.map((filePath) => deleteFile(filePath));
  await Promise.all(deletePromises);
};

/**
 * Crear directorio si no existe
 */
export const ensureDirectoryExists = async (dirPath: string): Promise<void> => {
  try {
    const absolutePath = path.isAbsolute(dirPath)
      ? dirPath
      : path.join(process.cwd(), dirPath);

    const exists = await existsAsync(absolutePath);

    if (!exists) {
      await mkdirAsync(absolutePath, { recursive: true });
      console.log(`✅ Directorio creado: ${dirPath}`);
    }
  } catch (error) {
    console.error(`❌ Error al crear directorio ${dirPath}:`, error);
    throw error;
  }
};

/**
 * Obtener información del archivo desde Express.Multer.File
 */
export const getFileInfo = (file: Express.Multer.File): FileInfo => {
  // Generar URL pública del archivo
  const url = `/${file.path.replace(/\\/g, '/')}`;

  return {
    filename: file.filename,
    path: file.path,
    size: file.size,
    mimetype: file.mimetype,
    url,
  };
};

/**
 * Obtener información de múltiples archivos
 */
export const getFilesInfo = (files: Express.Multer.File[]): FileInfo[] => {
  return files.map((file) => getFileInfo(file));
};

/**
 * Validar que un archivo existe
 */
export const fileExists = async (filePath: string): Promise<boolean> => {
  try {
    const absolutePath = path.isAbsolute(filePath)
      ? filePath
      : path.join(process.cwd(), filePath);

    return await existsAsync(absolutePath);
  } catch (error) {
    return false;
  }
};

/**
 * Extraer path relativo desde URL pública
 */
export const getPathFromUrl = (url: string): string => {
  // Remover el '/' inicial si existe
  return url.startsWith('/') ? url.substring(1) : url;
};

/**
 * Obtener extensión del archivo
 */
export const getFileExtension = (filename: string): string => {
  return path.extname(filename).toLowerCase();
};

/**
 * Obtener nombre del archivo sin extensión
 */
export const getFileNameWithoutExtension = (filename: string): string => {
  return path.basename(filename, path.extname(filename));
};

/**
 * Formatear tamaño de archivo a formato legible
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};
