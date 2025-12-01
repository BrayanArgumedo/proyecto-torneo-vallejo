import { EstadoTorneo } from './enums';

/**
 * 🏆 TORNEO
 */
export interface Torneo {
  _id: string;
  nombre: string;
  descripcion?: string;
  año: number;
  fechaInicio: string;
  fechaFin: string;
  estado: EstadoTorneo;
  equipos: string[];  // IDs de equipos
  fases: string[];    // IDs de fases
  estadisticas: EstadisticasTorneo;
  premios?: Premios;
  createdAt: string;
  updatedAt: string;

  // Virtuals
  numeroEquipos?: number;
  numeroFases?: number;
}

/**
 * Estadísticas del torneo
 */
export interface EstadisticasTorneo {
  totalEquipos: number;
  totalJugadores: number;
  totalPartidos: number;
  golesAnotados: number;
  tarjetasAmarillas: number;
  tarjetasRojas: number;
}

/**
 * Premios del torneo
 */
export interface Premios {
  primerLugar: number;
  segundoLugar: number;
  tercerLugar: number;
}

/**
 * DTO para crear/actualizar torneo
 */
export interface TorneoFormData {
  nombre: string;
  descripcion?: string;
  año: number;
  fechaInicio: string;
  fechaFin: string;
  premios?: Premios;
}
