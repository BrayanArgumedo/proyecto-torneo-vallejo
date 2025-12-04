import { TipoJugador, PosicionJugador, EstadoValidacionJugador, TipoDocumento } from './enums';

/**
 * 👤 JUGADOR
 */
export interface Jugador {
  _id: string;

  // Datos personales
  nombre: string;
  apellido: string;
  cedula: string;
  fechaNacimiento: string;
  telefono: string;
  celular: string; // Alias para telefono
  email?: string;
  direccion: string;
  foto?: string;  // URL de Cloudinary

  // Campos opcionales según tipo
  institucionEducativa?: string;
  parentescoEstudiante?: string;

  // Datos deportivos
  posicion: PosicionJugador;
  numeroCamiseta: number;  // 1-20
  tipo: TipoJugador;

  // Relación
  equipoId: string;

  // Documentos
  documentos: Documento[];

  // Validación
  estadoValidacion: EstadoValidacionJugador;
  observaciones?: string;
  motivoRechazo?: string; // Motivo de rechazo si fue rechazado
  validadoPor?: string;  // ID del admin que validó
  fechaValidacion?: string;

  createdAt: string;
  updatedAt: string;

  // Virtuals/Computed
  edad?: number;
  nombreCompleto?: string;
}

/**
 * Documento subido por el jugador
 */
export interface Documento {
  tipo: TipoDocumento;
  url: string;
  nombre?: string; // Nombre del documento
  nombreArchivo: string;
  uploadedAt: string;
}

/**
 * DTO para crear/actualizar jugador
 */
export interface JugadorFormData {
  nombre: string;
  apellido: string;
  cedula: string;
  fechaNacimiento: string;
  telefono: string;
  email?: string;
  direccion: string;
  posicion: PosicionJugador;
  numeroCamiseta: number;
  tipo: TipoJugador;
  equipoId: string;
  foto?: File;  // Archivo para subir
}

/**
 * Respuesta de validación de reglamento
 */
export interface ValidacionReglamento {
  valido: boolean;
  errores: string[];
}

/**
 * DTO para validar/rechazar jugador
 */
export interface ValidarJugadorData {
  estadoValidacion: EstadoValidacionJugador;
  observaciones?: string;
}
