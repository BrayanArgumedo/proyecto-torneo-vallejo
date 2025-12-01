import { EstadoPartido, TipoGol, TipoTarjeta } from './enums';

/**
 * ⚽ PARTIDO
 */
export interface Partido {
  _id: string;
  faseId: string;
  jornada: number;
  grupo?: string;  // 'A', 'B', etc.
  equipoLocal: string;      // ID del equipo
  equipoVisitante: string;  // ID del equipo
  fecha: string;
  cancha: string;

  // Resultado
  golesLocal: number;
  golesVisitante: number;
  estado: EstadoPartido;

  // Eventos
  goles: Gol[];
  tarjetas: Tarjeta[];

  observaciones?: string;
  arbitro?: string;

  createdAt: string;
  updatedAt: string;
}

/**
 * Gol en un partido
 */
export interface Gol {
  jugadorId: string;
  equipoId: string;
  minuto: number;
  tipo: TipoGol;
}

/**
 * Tarjeta en un partido
 */
export interface Tarjeta {
  jugadorId: string;
  equipoId: string;
  tipo: TipoTarjeta;
  minuto: number;
  motivo?: string;
}

/**
 * DTO para crear/actualizar partido
 */
export interface PartidoFormData {
  faseId: string;
  jornada: number;
  grupo?: string;
  equipoLocal: string;
  equipoVisitante: string;
  fecha: string;
  cancha: string;
}

/**
 * DTO para registrar gol
 */
export interface RegistrarGolData {
  jugadorId: string;
  equipoId: string;
  minuto: number;
  tipo: TipoGol;
}

/**
 * DTO para registrar tarjeta
 */
export interface RegistrarTarjetaData {
  jugadorId: string;
  equipoId: string;
  tipo: TipoTarjeta;
  minuto: number;
  motivo?: string;
}
