import { FormatoFase } from '@/types/enums';

export interface Fase {
  _id: string;
  torneoId: string;
  nombre: string;
  formato: FormatoFase;
  orden: number;
  equiposParticipantes: string[];
  configuracion: ConfiguracionFase;
  activa: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ConfiguracionFase {
  // Para liga
  partidosIdaVuelta?: boolean;
  bonificacionPuntos?: Record<string, number>;

  // Para grupos
  grupos?: Grupo[];
  equiposPorGrupo?: number;
  avanzanPorGrupo?: number;

  // Para eliminación directa
  tipoEliminacion?: 'FINAL' | 'SEMIFINAL' | 'CUARTOS' | 'OCTAVOS';
  conTercerPuesto?: boolean;
}

export interface Grupo {
  nombre: string;
  equipos: string[];
  cabezaDeSerie?: string;
}

export interface CreateFaseDTO {
  torneoId: string;
  nombre: string;
  formato: FormatoFase;
  orden: number;
  equiposParticipantes: string[];
  configuracion: ConfiguracionFase;
}
