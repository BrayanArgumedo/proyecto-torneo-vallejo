/**
 * 📦 BARREL EXPORT - Shared Models
 *
 * Exporta todas las interfaces y enums para importación fácil:
 * import { Usuario, Equipo, TipoJugador } from '@shared/models';
 */

// Enums
export * from './enums';

// Interfaces
export * from './usuario.interface';
export * from './equipo.interface';
export * from './jugador.interface';
export * from './torneo.interface';
export * from './fase.interface';
export * from './partido.interface';

/**
 * Generic API Response
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  count?: number;
  message?: string;
}

/**
 * Generic API Error
 */
export interface ApiError {
  success: false;
  error: string;
  code?: string;
  statusCode: number;
}
