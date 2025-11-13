export interface EquipoPublico {
  _id: string;
  nombre: string;
  escudo?: string;
  colorPrincipal: string;
  colorSecundario: string;
  jugadores: JugadorPublico[];
}

export interface JugadorPublico {
  nombre: string;
  apellido: string;
  foto: string;
  numeroCamiseta: number;
}

export interface PartidoPublico {
  _id: string;
  faseId: string;
  faseName: string;
  equipoLocal: {
    id: string;
    nombre: string;
    escudo?: string;
  };
  equipoVisitante: {
    id: string;
    nombre: string;
    escudo?: string;
  };
  fecha: string;
  hora: string;
  cancha?: string;
  jornada?: number;
}

export interface TablaPosiciones {
  equipo: {
    id: string;
    nombre: string;
    escudo?: string;
  };
  posicion: number;
  partidosJugados: number;
  ganados: number;
  empatados: number;
  perdidos: number;
  golesFavor: number;
  golesContra: number;
  diferencia: number;
  puntos: number;
}
