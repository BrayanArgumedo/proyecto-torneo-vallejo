import { Jugador, IJugadorDocument } from '@/features/jugadores/models/jugador.model';
import { Equipo } from '@/features/equipos/models/equipo.model';
import { ApiError } from '@/core/utils/ApiError';
import { ERRORES } from '@/core/config/constants';
import { EstadoValidacion } from '@/shared/types/enums';
import { IDocumento } from '@/shared/types/interfaces';
import mongoose from 'mongoose';

// ========================================
// INTERFACES
// ========================================

interface CreateJugadorData {
  nombre: string;
  apellido: string;
  cedula: string;
  fechaNacimiento: Date;
  telefono: string;
  email?: string;
  direccion: string;
  foto?: string;
  posicion: string;
  numeroCamiseta: number;
  tipo: string;
  equipoId: string;
  documentos?: IDocumento[];
}

interface UpdateJugadorData {
  nombre?: string;
  apellido?: string;
  fechaNacimiento?: Date;
  telefono?: string;
  email?: string;
  direccion?: string;
  foto?: string;
  posicion?: string;
  numeroCamiseta?: number;
  tipo?: string;
}

interface ValidarJugadorData {
  estadoValidacion: EstadoValidacion.VALIDADO | EstadoValidacion.RECHAZADO;
  observaciones?: string;
  validadoPor: string;
}

// ========================================
// SERVICIOS
// ========================================

/**
 * Obtener todos los jugadores
 */
export const getAllJugadores = async (): Promise<IJugadorDocument[]> => {
  const jugadores = await Jugador.find()
    .populate('equipoId', 'nombre escudo')
    .populate('validadoPor', 'nombre apellido')
    .sort({ apellido: 1, nombre: 1 });

  return jugadores;
};

/**
 * Obtener jugador por ID
 */
export const getJugadorById = async (id: string): Promise<IJugadorDocument> => {
  const jugador = await Jugador.findById(id)
    .populate('equipoId', 'nombre escudo colores')
    .populate('validadoPor', 'nombre apellido email');

  if (!jugador) {
    throw ApiError.notFound('Jugador no encontrado');
  }

  return jugador;
};

/**
 * Crear nuevo jugador
 */
export const createJugador = async (data: CreateJugadorData): Promise<IJugadorDocument> => {
  const { cedula, equipoId, numeroCamiseta } = data;

  // Verificar que la cédula no exista
  const existingJugador = await Jugador.findByCedula(cedula);

  if (existingJugador) {
    throw ApiError.conflict(ERRORES.CEDULA_DUPLICADA);
  }

  // Verificar que el equipo existe
  const equipo = await Equipo.findById(equipoId);

  if (!equipo) {
    throw ApiError.notFound(ERRORES.EQUIPO_NO_ENCONTRADO);
  }

  // Verificar que el equipo puede agregar jugadores
  const canAdd = await equipo.puedeAgregarJugador();

  if (!canAdd.puede) {
    throw ApiError.badRequest(canAdd.razon || 'No se puede agregar el jugador');
  }

  // Verificar que el número de camiseta no esté duplicado
  const jugadorConNumero = await Jugador.findOne({
    equipoId: new mongoose.Types.ObjectId(equipoId),
    numeroCamiseta,
  });

  if (jugadorConNumero) {
    throw ApiError.conflict(ERRORES.NUMERO_CAMISETA_DUPLICADO);
  }

  // Crear jugador
  const jugador = await Jugador.create({
    ...data,
    equipoId: new mongoose.Types.ObjectId(equipoId),
    fechaNacimiento: new Date(data.fechaNacimiento),
  });

  return jugador.populate('equipoId', 'nombre escudo');
};

/**
 * Actualizar jugador
 */
export const updateJugador = async (
  id: string,
  data: UpdateJugadorData
): Promise<IJugadorDocument> => {
  const jugador = await Jugador.findById(id);

  if (!jugador) {
    throw ApiError.notFound('Jugador no encontrado');
  }

  // Solo permitir actualización si está pendiente o rechazado
  if (jugador.estadoValidacion === EstadoValidacion.VALIDADO) {
    throw ApiError.badRequest('No se puede editar un jugador ya validado');
  }

  // Verificar número de camiseta si se está actualizando
  if (data.numeroCamiseta && data.numeroCamiseta !== jugador.numeroCamiseta) {
    const jugadorConNumero = await Jugador.findOne({
      equipoId: jugador.equipoId,
      numeroCamiseta: data.numeroCamiseta,
      _id: { $ne: id },
    });

    if (jugadorConNumero) {
      throw ApiError.conflict(ERRORES.NUMERO_CAMISETA_DUPLICADO);
    }
  }

  // Actualizar campos
  Object.keys(data).forEach((key) => {
    const value = (data as any)[key];
    if (value !== undefined) {
      (jugador as any)[key] = value;
    }
  });

  await jugador.save();

  return jugador.populate('equipoId', 'nombre escudo');
};

/**
 * Eliminar jugador
 */
export const deleteJugador = async (id: string): Promise<void> => {
  const jugador = await Jugador.findById(id);

  if (!jugador) {
    throw ApiError.notFound('Jugador no encontrado');
  }

  // No permitir eliminar jugadores validados
  if (jugador.estadoValidacion === EstadoValidacion.VALIDADO) {
    throw ApiError.badRequest('No se puede eliminar un jugador validado');
  }

  await Jugador.findOneAndDelete({ _id: id });
};

/**
 * Validar o rechazar jugador
 */
export const validarJugador = async (
  id: string,
  data: ValidarJugadorData
): Promise<IJugadorDocument> => {
  const { estadoValidacion, observaciones, validadoPor } = data;

  const jugador = await Jugador.findById(id);

  if (!jugador) {
    throw ApiError.notFound('Jugador no encontrado');
  }

  // Si se está validando, verificar las reglas del reglamento
  if (estadoValidacion === EstadoValidacion.VALIDADO) {
    const validacion = await jugador.validarReglamento();

    if (!validacion.valido) {
      throw ApiError.badRequest(`Validación fallida: ${validacion.errores.join(', ')}`);
    }
  }

  // Actualizar estado
  jugador.estadoValidacion = estadoValidacion;
  jugador.observaciones = observaciones;
  jugador.validadoPor = new mongoose.Types.ObjectId(validadoPor);
  jugador.fechaValidacion = new Date();

  await jugador.save();

  return jugador.populate(['equipoId', 'validadoPor']);
};

/**
 * Agregar documento a jugador
 */
export const agregarDocumento = async (
  id: string,
  documento: IDocumento
): Promise<IJugadorDocument> => {
  const jugador = await Jugador.findById(id);

  if (!jugador) {
    throw ApiError.notFound('Jugador no encontrado');
  }

  jugador.documentos.push(documento);
  await jugador.save();

  return jugador;
};

/**
 * Obtener jugadores por equipo
 */
export const getJugadoresByEquipo = async (equipoId: string): Promise<IJugadorDocument[]> => {
  const jugadores = await Jugador.findByEquipo(equipoId);
  return jugadores;
};

/**
 * Obtener jugadores pendientes de validación
 */
export const getJugadoresPendientes = async (): Promise<IJugadorDocument[]> => {
  const jugadores = await Jugador.findPendientesValidacion();
  return jugadores;
};

/**
 * Validar reglamento de un jugador
 */
export const validarReglamentoJugador = async (
  id: string
): Promise<{ valido: boolean; errores: string[] }> => {
  const jugador = await Jugador.findById(id);

  if (!jugador) {
    throw ApiError.notFound('Jugador no encontrado');
  }

  return jugador.validarReglamento();
};

/**
 * Obtener jugadores validados por equipo
 */
export const getJugadoresValidadosByEquipo = async (
  equipoId: string
): Promise<IJugadorDocument[]> => {
  const jugadores = await Jugador.find({
    equipoId: new mongoose.Types.ObjectId(equipoId),
    estadoValidacion: EstadoValidacion.VALIDADO,
  }).sort({ numeroCamiseta: 1 });

  return jugadores;
};

/**
 * Buscar jugador por cédula
 */
export const findJugadorByCedula = async (cedula: string): Promise<IJugadorDocument | null> => {
  const jugador = await Jugador.findByCedula(cedula);
  return jugador;
};
