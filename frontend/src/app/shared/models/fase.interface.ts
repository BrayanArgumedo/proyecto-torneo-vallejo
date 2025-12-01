import { FormatoFase, EstadoFase } from './enums';

/**
 * 📊 FASE
 */
export interface Fase {
  _id: string;
  nombre: string;
  torneoId: string;
  formato: FormatoFase;
  orden: number;
  equiposParticipantes: string[];  // IDs de equipos
  partidos: string[];              // IDs de partidos
  configuracion: ConfiguracionFase;
  estado: EstadoFase;
  fechaInicio?: string;
  fechaFin?: string;
  clasificados: string[];  // IDs de equipos clasificados
  createdAt: string;
  updatedAt: string;

  // Virtuals
  numeroEquipos?: number;
  numeroPartidos?: number;
}

/**
 * Configuración dinámica según el formato de la fase
 */
export interface ConfiguracionFase {
  // Para GRUPOS
  numeroGrupos?: number;
  equiposPorGrupo?: number;
  clasificanPorGrupo?: number;
  eliminanPorGrupo?: number;
  partidoIdaVuelta?: boolean;

  // Común
  puntosVictoria?: number;
  puntosEmpate?: number;
  puntosDerrota?: number;
  criteriosDesempate?: string[];
}

/**
 * Grupo dentro de una fase
 */
export interface Grupo {
  nombre: string;  // 'A', 'B', 'C', etc.
  equipos: string[];
}

/**
 * Tabla de posiciones
 */
export interface TablaPosiciones {
  equipo: {
    _id: string;
    nombre: string;
  };
  puntos: number;
  jugados: number;
  ganados: number;
  empatados: number;
  perdidos: number;
  golesFavor: number;
  golesContra: number;
  diferencia: number;
  posicion: number;
}

/**
 * DTO para crear fase
 */
export interface FaseFormData {
  nombre: string;
  torneoId: string;
  formato: FormatoFase;
  orden: number;
  equiposParticipantes: string[];
  configuracion: ConfiguracionFase;
}

/**
 * DTO para generar calendario
 */
export interface GenerarCalendarioData {
  fechaInicio: string;
  cancha: string;
}
