import { EstadoEquipo } from './enums';

/**
 * ⚽ EQUIPO
 */
export interface Equipo {
  _id: string;
  nombre: string;
  delegadoId: string;
  torneoId: string;
  jugadores: string[];  // Array de IDs de jugadores
  colores: {
    principal: string;
    secundario: string;
  };
  estado: EstadoEquipo;
  createdAt: string;
  updatedAt: string;

  // Virtuals/Computed (pueden venir del backend)
  numeroJugadores?: number;
}

/**
 * Estadísticas del equipo (endpoint /equipos/:id/estadisticas)
 */
export interface EstadisticasEquipo {
  totalJugadores: number;
  jugadoresValidados: number;
  jugadoresPendientes: number;
  jugadoresRechazados: number;
  extranjeros: number;
  docentesElDorado: number;
  docentesFundacion: number;
  puedeAgregarJugadores: boolean;
  espaciosDisponibles: number;
}

/**
 * DTO para crear/actualizar equipo
 */
export interface EquipoFormData {
  nombre: string;
  delegadoId: string;
  torneoId: string;
  colores: {
    principal: string;
    secundario: string;
  };
}
