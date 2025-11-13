import { TipoJugador, EstadoValidacion } from '@/types/enums';

export interface Jugador {
  _id: string;
  equipoId: string;
  equipoNombre?: string;
  nombre: string;
  apellido: string;
  cedula: string;
  fechaNacimiento: string;
  edad: number;
  telefono: string;
  email?: string;
  foto: string;
  numeroCamiseta: number;
  tipoJugador: TipoJugador;
  institucion?: string; // Para docentes
  documentos: Documento[];
  estadoValidacion: EstadoValidacion;
  motivoRechazo?: string;
  validadoPor?: string;
  fechaValidacion?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Documento {
  tipo: string;
  url: string;
  nombre: string;
  uploadedAt: string;
}

export interface CreateJugadorDTO {
  nombre: string;
  apellido: string;
  cedula: string;
  fechaNacimiento: string;
  telefono: string;
  email?: string;
  foto: File;
  numeroCamiseta: number;
  tipoJugador: TipoJugador;
  institucion?: string;
  documentos: File[];
}

export interface ValidarJugadorDTO {
  aprobado: boolean;
  motivoRechazo?: string;
}
