import { Torneo, ITorneoDocument } from '@/features/torneos/models/torneo.model';
import { Fase, IFaseDocument } from '@/features/torneos/models/fase.model';
import { Equipo } from '@/features/equipos/models/equipo.model';
import { ApiError } from '@/core/utils/ApiError';
import { ERRORES } from '@/core/config/constants';
import { EstadoTorneo, FormatoFase } from '@/shared/types/enums';
import { IConfiguracionFase } from '@/shared/types/interfaces';
import mongoose from 'mongoose';

// ========================================
// INTERFACES - TORNEOS
// ========================================

interface CreateTorneoData {
  nombre: string;
  descripcion?: string;
  fechaInicio: Date;
  fechaFin?: Date;
  año?: number;
  reglamento?: string;
  premios?: {
    primerLugar?: string;
    segundoLugar?: string;
    tercerLugar?: string;
    otros?: string[];
  };
}

interface UpdateTorneoData {
  nombre?: string;
  descripcion?: string;
  fechaInicio?: Date;
  fechaFin?: Date;
  estado?: EstadoTorneo;
  reglamento?: string;
  premios?: {
    primerLugar?: string;
    segundoLugar?: string;
    tercerLugar?: string;
    otros?: string[];
  };
}

// ========================================
// INTERFACES - FASES
// ========================================

interface CreateFaseData {
  nombre: string;
  descripcion?: string;
  tipo: FormatoFase;
  orden: number;
  torneoId: string;
  equiposParticipantes?: string[];
  configuracion?: IConfiguracionFase;
  fechaInicio?: Date;
  fechaFin?: Date;
}

// ========================================
// SERVICIOS - TORNEOS
// ========================================

/**
 * Obtener todos los torneos
 */
export const getAllTorneos = async (): Promise<ITorneoDocument[]> => {
  const torneos = await Torneo.find()
    .populate('equipos', 'nombre escudo')
    .populate('fases', 'nombre tipo orden estado')
    .sort({ año: -1, fechaInicio: -1 });

  return torneos;
};

/**
 * Obtener torneo por ID
 */
export const getTorneoById = async (id: string): Promise<ITorneoDocument> => {
  const torneo = await Torneo.findById(id)
    .populate('equipos', 'nombre escudo colores delegadoId')
    .populate('fases', 'nombre tipo orden estado fechaInicio fechaFin')
    .populate('faseActual', 'nombre tipo orden');

  if (!torneo) {
    throw ApiError.notFound(ERRORES.TORNEO_NO_ENCONTRADO);
  }

  return torneo;
};

/**
 * Crear nuevo torneo
 */
export const createTorneo = async (data: CreateTorneoData): Promise<ITorneoDocument> => {
  const torneo = await Torneo.create({
    ...data,
    fechaInicio: new Date(data.fechaInicio),
    ...(data.fechaFin && { fechaFin: new Date(data.fechaFin) }),
  });

  return torneo;
};

/**
 * Actualizar torneo
 */
export const updateTorneo = async (
  id: string,
  data: UpdateTorneoData
): Promise<ITorneoDocument> => {
  const torneo = await Torneo.findById(id);

  if (!torneo) {
    throw ApiError.notFound(ERRORES.TORNEO_NO_ENCONTRADO);
  }

  // Actualizar campos
  Object.keys(data).forEach((key) => {
    const value = (data as any)[key];
    if (value !== undefined) {
      (torneo as any)[key] = value;
    }
  });

  await torneo.save();

  return torneo;
};

/**
 * Eliminar torneo
 */
export const deleteTorneo = async (id: string): Promise<void> => {
  const torneo = await Torneo.findById(id);

  if (!torneo) {
    throw ApiError.notFound(ERRORES.TORNEO_NO_ENCONTRADO);
  }

  // No permitir eliminar torneos en curso o finalizados con datos
  if (torneo.estado === EstadoTorneo.EN_CURSO) {
    throw ApiError.badRequest('No se puede eliminar un torneo en curso');
  }

  if (torneo.estado === EstadoTorneo.FINALIZADO && torneo.equipos.length > 0) {
    throw ApiError.badRequest('No se puede eliminar un torneo finalizado con equipos');
  }

  // Eliminar todas las fases asociadas
  await Fase.deleteMany({ torneoId: torneo._id });

  await Torneo.findByIdAndDelete(id);
};

/**
 * Agregar equipo al torneo
 */
export const agregarEquipoATorneo = async (
  torneoId: string,
  equipoId: string
): Promise<ITorneoDocument> => {
  const torneo = await Torneo.findById(torneoId);

  if (!torneo) {
    throw ApiError.notFound(ERRORES.TORNEO_NO_ENCONTRADO);
  }

  if (torneo.estado !== EstadoTorneo.CONFIGURACION) {
    throw ApiError.badRequest('Solo se pueden agregar equipos en fase de registro');
  }

  const equipo = await Equipo.findById(equipoId);

  if (!equipo) {
    throw ApiError.notFound(ERRORES.EQUIPO_NO_ENCONTRADO);
  }

  await torneo.agregarEquipo(new mongoose.Types.ObjectId(equipoId));

  return torneo.populate('equipos', 'nombre escudo');
};

/**
 * Remover equipo del torneo
 */
export const removerEquipoDeTorneo = async (
  torneoId: string,
  equipoId: string
): Promise<ITorneoDocument> => {
  const torneo = await Torneo.findById(torneoId);

  if (!torneo) {
    throw ApiError.notFound(ERRORES.TORNEO_NO_ENCONTRADO);
  }

  if (torneo.estado !== EstadoTorneo.CONFIGURACION) {
    throw ApiError.badRequest('Solo se pueden remover equipos en fase de registro');
  }

  await torneo.removerEquipo(new mongoose.Types.ObjectId(equipoId));

  return torneo.populate('equipos', 'nombre escudo');
};

/**
 * Iniciar torneo
 */
export const iniciarTorneo = async (id: string): Promise<ITorneoDocument> => {
  const torneo = await Torneo.findById(id);

  if (!torneo) {
    throw ApiError.notFound(ERRORES.TORNEO_NO_ENCONTRADO);
  }

  await torneo.iniciarTorneo();

  return torneo.populate(['equipos', 'fases', 'faseActual']);
};

/**
 * Finalizar torneo
 */
export const finalizarTorneo = async (id: string): Promise<ITorneoDocument> => {
  const torneo = await Torneo.findById(id);

  if (!torneo) {
    throw ApiError.notFound(ERRORES.TORNEO_NO_ENCONTRADO);
  }

  await torneo.finalizarTorneo();

  return torneo;
};

/**
 * Obtener torneo actual (en curso o registro)
 */
export const getTorneoActual = async (): Promise<ITorneoDocument | null> => {
  const torneo = await Torneo.findActual();
  return torneo;
};

/**
 * Obtener torneos por año
 */
export const getTorneosByAño = async (año: number): Promise<ITorneoDocument[]> => {
  const torneos = await Torneo.findByAño(año);
  return torneos;
};

/**
 * Actualizar estadísticas del torneo
 */
export const actualizarEstadisticasTorneo = async (id: string): Promise<ITorneoDocument> => {
  const torneo = await Torneo.findById(id);

  if (!torneo) {
    throw ApiError.notFound(ERRORES.TORNEO_NO_ENCONTRADO);
  }

  await torneo.actualizarEstadisticas();

  return torneo;
};

// ========================================
// SERVICIOS - FASES
// ========================================

/**
 * Crear nueva fase
 */
export const createFase = async (data: CreateFaseData): Promise<IFaseDocument> => {
  const { torneoId, equiposParticipantes } = data;

  // Verificar que el torneo existe
  const torneo = await Torneo.findById(torneoId);

  if (!torneo) {
    throw ApiError.notFound(ERRORES.TORNEO_NO_ENCONTRADO);
  }

  // Convertir equiposParticipantes a ObjectIds
  const equiposIds = equiposParticipantes
    ? equiposParticipantes.map((id) => new mongoose.Types.ObjectId(id))
    : [];

  // Crear fase
  const fase = await Fase.create({
    ...data,
    torneoId: new mongoose.Types.ObjectId(torneoId),
    equiposParticipantes: equiposIds,
    ...(data.fechaInicio && { fechaInicio: new Date(data.fechaInicio) }),
    ...(data.fechaFin && { fechaFin: new Date(data.fechaFin) }),
  });

  return fase.populate('equiposParticipantes', 'nombre escudo');
};

/**
 * Obtener fase por ID
 */
export const getFaseById = async (id: string): Promise<IFaseDocument> => {
  const fase = await Fase.findById(id)
    .populate('torneoId', 'nombre año')
    .populate('equiposParticipantes', 'nombre escudo colores')
    .populate({
      path: 'partidos',
      populate: [
        { path: 'equipoLocal', select: 'nombre escudo' },
        { path: 'equipoVisitante', select: 'nombre escudo' },
      ],
    });

  if (!fase) {
    throw ApiError.notFound(ERRORES.FASE_NO_ENCONTRADA);
  }

  return fase;
};

/**
 * Obtener fases por torneo
 */
export const getFasesByTorneo = async (torneoId: string): Promise<IFaseDocument[]> => {
  const fases = await Fase.findByTorneo(torneoId);
  return fases;
};

/**
 * Generar calendario de una fase
 */
export const generarCalendarioFase = async (faseId: string): Promise<IFaseDocument> => {
  const fase = await Fase.findById(faseId);

  if (!fase) {
    throw ApiError.notFound(ERRORES.FASE_NO_ENCONTRADA);
  }

  await fase.generarCalendario();

  return fase.populate(['equiposParticipantes', 'partidos']);
};

/**
 * Calcular tabla de posiciones de una fase
 */
export const calcularTablaPosiciones = async (faseId: string): Promise<any[]> => {
  const fase = await Fase.findById(faseId);

  if (!fase) {
    throw ApiError.notFound(ERRORES.FASE_NO_ENCONTRADA);
  }

  const tabla = await fase.calcularTablaPosiciones();
  return tabla;
};

/**
 * Finalizar fase
 */
export const finalizarFase = async (faseId: string): Promise<IFaseDocument> => {
  const fase = await Fase.findById(faseId);

  if (!fase) {
    throw ApiError.notFound(ERRORES.FASE_NO_ENCONTRADA);
  }

  await fase.finalizarFase();

  return fase;
};

/**
 * Obtener equipos clasificados de una fase
 */
export const getClasificadosFase = async (
  faseId: string,
  cantidad: number
): Promise<mongoose.Types.ObjectId[]> => {
  const fase = await Fase.findById(faseId);

  if (!fase) {
    throw ApiError.notFound(ERRORES.FASE_NO_ENCONTRADA);
  }

  const clasificados = await fase.obtenerClasificados(cantidad);
  return clasificados;
};
