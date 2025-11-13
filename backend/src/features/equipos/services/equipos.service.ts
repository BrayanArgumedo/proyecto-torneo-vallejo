import { Equipo, IEquipoDocument } from '@/features/equipos/models/equipo.model';
import { ApiError } from '@/core/utils/ApiError';
import { ERRORES } from '@/core/config/constants';
import { EstadoEquipo } from '@/shared/types/enums';
import { IEstadisticasEquipo } from '@/shared/types/interfaces';
import mongoose from 'mongoose';

// ========================================
// INTERFACES
// ========================================

interface CreateEquipoData {
  nombre: string;
  delegadoId: string;
  colores: {
    principal: string;
    secundario: string;
  };
  escudo?: string;
  torneoId?: string;
}

interface UpdateEquipoData {
  nombre?: string;
  delegadoId?: string;
  colores?: {
    principal?: string;
    secundario?: string;
  };
  escudo?: string;
  estado?: EstadoEquipo;
  torneoId?: string;
}

// ========================================
// SERVICIOS
// ========================================

/**
 * Obtener todos los equipos
 */
export const getAllEquipos = async (): Promise<IEquipoDocument[]> => {
  const equipos = await Equipo.find()
    .populate('delegadoId', 'nombre apellido email')
    .populate('torneoId', 'nombre año')
    .sort({ nombre: 1 });

  return equipos;
};

/**
 * Obtener equipo por ID
 */
export const getEquipoById = async (id: string): Promise<IEquipoDocument> => {
  const equipo = await Equipo.findById(id)
    .populate('delegadoId', 'nombre apellido email')
    .populate('torneoId', 'nombre año')
    .populate({
      path: 'jugadores',
      select: 'nombre apellido cedula posicion numeroCamiseta estadoValidacion foto',
    });

  if (!equipo) {
    throw ApiError.notFound(ERRORES.EQUIPO_NO_ENCONTRADO);
  }

  return equipo;
};

/**
 * Crear nuevo equipo
 */
export const createEquipo = async (data: CreateEquipoData): Promise<IEquipoDocument> => {
  const { nombre, delegadoId, colores, escudo, torneoId } = data;

  // Verificar que el nombre no exista
  const existingEquipo = await Equipo.findOne({ nombre });

  if (existingEquipo) {
    throw ApiError.conflict(ERRORES.NOMBRE_EQUIPO_DUPLICADO);
  }

  // Verificar que el delegado existe
  const Usuario = mongoose.model('Usuario');
  const delegado = await Usuario.findById(delegadoId);

  if (!delegado) {
    throw ApiError.notFound(ERRORES.USUARIO_NO_ENCONTRADO);
  }

  // Verificar que el delegado no tenga ya un equipo
  const equipoExistente = await Equipo.findOne({
    delegadoId: new mongoose.Types.ObjectId(delegadoId),
  });

  if (equipoExistente) {
    throw ApiError.conflict('Este delegado ya tiene un equipo registrado');
  }

  // Si se proporciona torneoId, verificar que existe
  if (torneoId) {
    const Torneo = mongoose.model('Torneo');
    const torneo = await Torneo.findById(torneoId);

    if (!torneo) {
      throw ApiError.notFound(ERRORES.TORNEO_NO_ENCONTRADO);
    }
  }

  // Crear equipo
  const equipo = await Equipo.create({
    nombre,
    delegadoId: new mongoose.Types.ObjectId(delegadoId),
    colores,
    ...(escudo && { escudo }),
    ...(torneoId && { torneoId: new mongoose.Types.ObjectId(torneoId) }),
  });

  return equipo.populate('delegadoId', 'nombre apellido email');
};

/**
 * Actualizar equipo
 */
export const updateEquipo = async (
  id: string,
  data: UpdateEquipoData
): Promise<IEquipoDocument> => {
  const { nombre, delegadoId, colores, escudo, estado, torneoId } = data;

  const equipo = await Equipo.findById(id);

  if (!equipo) {
    throw ApiError.notFound(ERRORES.EQUIPO_NO_ENCONTRADO);
  }

  // Verificar nombre único si se está actualizando
  if (nombre && nombre !== equipo.nombre) {
    const existingEquipo = await Equipo.findOne({ nombre });

    if (existingEquipo) {
      throw ApiError.conflict(ERRORES.NOMBRE_EQUIPO_DUPLICADO);
    }
  }

  // Verificar delegado si se está actualizando
  if (delegadoId && delegadoId !== equipo.delegadoId.toString()) {
    const Usuario = mongoose.model('Usuario');
    const delegado = await Usuario.findById(delegadoId);

    if (!delegado) {
      throw ApiError.notFound(ERRORES.USUARIO_NO_ENCONTRADO);
    }

    // Verificar que el delegado no tenga otro equipo
    const equipoExistente = await Equipo.findOne({
      delegadoId: new mongoose.Types.ObjectId(delegadoId),
      _id: { $ne: id },
    });

    if (equipoExistente) {
      throw ApiError.conflict('Este delegado ya tiene un equipo registrado');
    }
  }

  // Si se actualiza torneoId, verificar que existe
  if (torneoId !== undefined && torneoId !== null) {
    const Torneo = mongoose.model('Torneo');
    const torneo = await Torneo.findById(torneoId);

    if (!torneo) {
      throw ApiError.notFound(ERRORES.TORNEO_NO_ENCONTRADO);
    }
  }

  // Actualizar campos
  if (nombre) equipo.nombre = nombre;
  if (delegadoId) equipo.delegadoId = new mongoose.Types.ObjectId(delegadoId);
  if (colores) {
    if (colores.principal) equipo.colores.principal = colores.principal;
    if (colores.secundario) equipo.colores.secundario = colores.secundario;
  }
  if (escudo !== undefined) equipo.escudo = escudo;
  if (estado) equipo.estado = estado;
  if (torneoId !== undefined) {
    equipo.torneoId = torneoId ? new mongoose.Types.ObjectId(torneoId) : undefined;
  }

  await equipo.save();

  return equipo.populate('delegadoId', 'nombre apellido email');
};

/**
 * Eliminar equipo
 */
export const deleteEquipo = async (id: string): Promise<void> => {
  const equipo = await Equipo.findById(id);

  if (!equipo) {
    throw ApiError.notFound(ERRORES.EQUIPO_NO_ENCONTRADO);
  }

  // Verificar que el equipo no tenga jugadores
  if (equipo.jugadores.length > 0) {
    throw ApiError.badRequest(
      'No se puede eliminar un equipo que tiene jugadores registrados'
    );
  }

  // Si el equipo está en un torneo, removerlo
  if (equipo.torneoId) {
    const Torneo = mongoose.model('Torneo');
    await Torneo.findByIdAndUpdate(equipo.torneoId, {
      $pull: { equipos: equipo._id },
    });
  }

  await Equipo.findByIdAndDelete(id);
};

/**
 * Obtener estadísticas del equipo
 */
export const getEstadisticasEquipo = async (id: string): Promise<IEstadisticasEquipo> => {
  const equipo = await Equipo.findById(id);

  if (!equipo) {
    throw ApiError.notFound(ERRORES.EQUIPO_NO_ENCONTRADO);
  }

  const estadisticas = await equipo.calcularEstadisticas();

  return estadisticas;
};

/**
 * Obtener equipos activos
 */
export const getEquiposActivos = async (): Promise<IEquipoDocument[]> => {
  const equipos = await Equipo.findActivos();
  return equipos;
};

/**
 * Obtener equipo por delegado
 */
export const getEquipoByDelegado = async (delegadoId: string): Promise<IEquipoDocument | null> => {
  const equipo = await Equipo.findByDelegado(delegadoId);
  return equipo;
};

/**
 * Verificar si el equipo puede agregar un jugador
 */
export const canAddJugador = async (
  id: string
): Promise<{ puede: boolean; razon?: string }> => {
  const equipo = await Equipo.findById(id);

  if (!equipo) {
    throw ApiError.notFound(ERRORES.EQUIPO_NO_ENCONTRADO);
  }

  return equipo.puedeAgregarJugador();
};

/**
 * Obtener equipos por torneo
 */
export const getEquiposByTorneo = async (torneoId: string): Promise<IEquipoDocument[]> => {
  const equipos = await Equipo.find({ torneoId: new mongoose.Types.ObjectId(torneoId) })
    .populate('delegadoId', 'nombre apellido email')
    .sort({ nombre: 1 });

  return equipos;
};
