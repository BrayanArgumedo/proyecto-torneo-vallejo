/**
 * Interfaces compartidas del sistema
 */

import { TipoDocumento } from './enums';

// ========================================
// DOCUMENTOS
// ========================================

export interface IDocumento {
  tipo: TipoDocumento;
  url: string;
  nombreArchivo: string;
  uploadedAt: Date;
}

// ========================================
// ESTADÍSTICAS DE EQUIPO
// ========================================

export interface IEstadisticasEquipo {
  jugadoresValidados: number;
  jugadoresPendientes: number;
  jugadoresRechazados: number;
  extranjeros: number;
  docentesElDorado: number;
  trabajadoresElDorado: number;
  docentesFundacion: number;
  trabajadoresFundacion: number;
  padresFundacion: number;
}

// ========================================
// CONFIGURACIÓN DE FASE
// ========================================

export interface IConfiguracionBase {
  puntosVictoria?: number;
  puntosEmpate?: number;
  puntosDerrota?: number;
  criteriosDesempate?: string[];
}

export interface IConfiguracionGrupos extends IConfiguracionBase {
  numeroGrupos: number;
  equiposPorGrupo: number;
  cabezasDeSerie?: string[]; // IDs de equipos
  clasificanPorGrupo: number;
  eliminanPorGrupo?: number;
  partidoIdaVuelta?: boolean;
}

export interface IConfiguracionEliminacion extends IConfiguracionBase {
  tipoEliminacion: 'SIMPLE' | 'IDA_VUELTA';
  partidoIdaVuelta?: boolean;
}

export interface IConfiguracionLiga extends IConfiguracionBase {
  partidosIdaVuelta: boolean;
  partidoIdaVuelta?: boolean;
}

export interface IBonificacion {
  aplicarBonificacion: boolean;
  bonificacionPrimero?: number; // Ej: 0.75
  bonificacionSegundo?: number; // Ej: 0.50
}

export type IConfiguracionFase =
  | (IConfiguracionGrupos & IBonificacion)
  | (IConfiguracionEliminacion & IBonificacion)
  | (IConfiguracionLiga & IBonificacion);

// ========================================
// GRUPO
// ========================================

export interface IGrupo {
  nombre: string; // "Grupo A", "Grupo B"
  equipos: string[]; // IDs de equipos
}

// ========================================
// REGLAMENTO DEL TORNEO
// ========================================

export interface IReglamentoTorneo {
  maxJugadoresPorEquipo: number; // Default: 16
  maxExtranjeros: number; // Default: 3
  maxDocentesElDorado: number; // Default: 2
  maxDocentesFundacion: number; // Default: 2
  edadMinimaExtranjeros: number; // Default: 26
}

// ========================================
// RESPONSE TYPES
// ========================================

export interface IApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

// ========================================
// PAGINACIÓN
// ========================================

export interface IPaginationOptions {
  page: number;
  limit: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface IPaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
