import type { TipoJugador, EstadoValidacion } from '@/types/enums';

// ========== EQUIPO ==========
export interface Equipo {
  _id: string;
  nombre: string;
  delegado: {
    _id: string;
    nombre: string;
    email: string;
    telefono?: string;
  };
  escudo?: string; // URL de la imagen
  logo?: string; // URL de la imagen
  jugadores: string[]; // IDs de jugadores
  validado: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEquipoDTO {
  nombre: string;
  delegadoId: string;
  escudo?: File | string;
  logo?: File | string;
}

export interface UpdateEquipoDTO {
  nombre?: string;
  escudo?: File | string;
  logo?: File | string;
}

// ========== JUGADOR ==========
export interface Jugador {
  _id: string;
  equipo: string; // ID del equipo
  nombres: string;
  apellidos: string;
  numeroDocumento: string;
  fechaNacimiento: string;
  telefono: string;
  telefonoEmergencia: string;
  foto: string; // URL de la imagen
  tipo: TipoJugador;

  // Documentos
  documentos: {
    documentoIdentidad: string; // URL
    certificadoResidencia?: string; // URL (opcional para algunos tipos)
  };

  // Validación
  estadoValidacion: EstadoValidacion;
  motivoRechazo?: string;
  validadoPor?: string; // ID del admin que validó

  createdAt: string;
  updatedAt: string;
}

export interface CreateJugadorDTO {
  equipoId: string;
  nombres: string;
  apellidos: string;
  numeroDocumento: string;
  fechaNacimiento: string;
  telefono: string;
  telefonoEmergencia: string;
  foto: File;
  tipo: TipoJugador;
  documentoIdentidad: File;
  certificadoResidencia?: File;
}

export interface UpdateJugadorDTO {
  nombres?: string;
  apellidos?: string;
  telefono?: string;
  telefonoEmergencia?: string;
  foto?: File | string;
  documentoIdentidad?: File | string;
  certificadoResidencia?: File | string;
}

export interface ValidarJugadorDTO {
  estado: EstadoValidacion;
  motivoRechazo?: string;
}

// ========== WIZARD DATA ==========
export interface JugadorWizardData {
  // Paso 1: Datos básicos
  nombres: string;
  apellidos: string;
  numeroDocumento: string;
  fechaNacimiento: string;
  telefono: string;
  telefonoEmergencia: string;

  // Paso 2: Foto
  foto?: File;

  // Paso 3: Tipo de jugador
  tipo?: TipoJugador;

  // Paso 4: Documentos
  documentoIdentidad?: File;
  certificadoResidencia?: File;
}

// ========== VALIDACIONES ==========
export interface QuotaValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  details: {
    totalJugadores: number;
    habitantesPropietarios: number;
    habitantesArrendatarios: number;
    docentesUComfacauca: number;
    extranjeros: number;
    maxPermitido: number;
  };
}

export interface EdadValidation {
  isValid: boolean;
  edad: number;
  edadMinima: number;
  mensaje?: string;
}
