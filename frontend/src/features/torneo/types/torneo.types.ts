export interface Torneo {
  _id: string;
  nombre: string;
  descripcion?: string;
  fechaInicio: string;
  fechaFin?: string;
  activo: boolean;
  equiposInscritos: string[];
  totalEquipos: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTorneoDTO {
  nombre: string;
  descripcion?: string;
  fechaInicio: string;
  fechaFin?: string;
}

export interface UpdateTorneoDTO {
  nombre?: string;
  descripcion?: string;
  fechaInicio?: string;
  fechaFin?: string;
  activo?: boolean;
}
