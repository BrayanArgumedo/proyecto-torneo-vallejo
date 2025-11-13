import { Partido, IPartidoDocument } from '@/features/partidos/models/partido.model';
import { Fase } from '@/features/torneos/models/fase.model';
import { Equipo } from '@/features/equipos/models/equipo.model';
import { ApiError } from '@/core/utils/ApiError';
import { EstadoPartido } from '@/shared/types/enums';
import mongoose from 'mongoose';

// ========================================
// INTERFACES
// ========================================

interface CreatePartidoData {
  torneoId: string;
  faseId: string;
  equipoLocal: string;
  equipoVisitante: string;
  fecha?: Date;
  cancha?: string;
  jornada?: number;
  grupo?: string;
  esEliminacion?: boolean;
  arbitro?: string;
  observaciones?: string;
}

interface UpdatePartidoData {
  fecha?: Date;
  cancha?: string;
  jornada?: number;
  estado?: EstadoPartido;
  arbitro?: string;
  observaciones?: string;
}

interface RegistrarGolData {
  jugadorId: string;
  minuto: number;
  esAutogol?: boolean;
}

interface RegistrarTarjetaData {
  jugadorId: string;
  minuto: number;
  tipo: 'AMARILLA' | 'ROJA';
}

interface FinalizarPartidoData {
  golesLocal: number;
  golesVisitante: number;
  ganadorPenales?: string;
}

// ========================================
// SERVICIOS
// ========================================

/**
 * Obtener todos los partidos
 */
export const getAllPartidos = async (): Promise<IPartidoDocument[]> => {
  const partidos = await Partido.find()
    .populate('equipoLocal', 'nombre escudo')
    .populate('equipoVisitante', 'nombre escudo')
    .populate('faseId', 'nombre tipo')
    .sort({ fecha: -1 });

  return partidos;
};

/**
 * Obtener partido por ID
 */
export const getPartidoById = async (id: string): Promise<IPartidoDocument> => {
  const partido = await Partido.findById(id)
    .populate('equipoLocal', 'nombre escudo colores')
    .populate('equipoVisitante', 'nombre escudo colores')
    .populate('faseId', 'nombre tipo configuracion')
    .populate('torneoId', 'nombre año')
    .populate({
      path: 'goles.jugador',
      select: 'nombre apellido numeroCamiseta equipoId',
    })
    .populate({
      path: 'tarjetas.jugador',
      select: 'nombre apellido numeroCamiseta equipoId',
    });

  if (!partido) {
    throw ApiError.notFound('Partido no encontrado');
  }

  return partido;
};

/**
 * Crear nuevo partido
 */
export const createPartido = async (data: CreatePartidoData): Promise<IPartidoDocument> => {
  const { torneoId, faseId, equipoLocal, equipoVisitante } = data;

  // Verificar que la fase existe
  const fase = await Fase.findById(faseId);

  if (!fase) {
    throw ApiError.notFound('Fase no encontrada');
  }

  // Verificar que los equipos existen
  const [local, visitante] = await Promise.all([
    Equipo.findById(equipoLocal),
    Equipo.findById(equipoVisitante),
  ]);

  if (!local || !visitante) {
    throw ApiError.notFound('Uno o ambos equipos no existen');
  }

  // Crear partido
  const partido = await Partido.create({
    ...data,
    torneoId: new mongoose.Types.ObjectId(torneoId),
    faseId: new mongoose.Types.ObjectId(faseId),
    equipoLocal: new mongoose.Types.ObjectId(equipoLocal),
    equipoVisitante: new mongoose.Types.ObjectId(equipoVisitante),
    ...(data.fecha && { fecha: new Date(data.fecha) }),
  });

  return partido.populate(['equipoLocal', 'equipoVisitante', 'faseId']);
};

/**
 * Actualizar partido
 */
export const updatePartido = async (
  id: string,
  data: UpdatePartidoData
): Promise<IPartidoDocument> => {
  const partido = await Partido.findById(id);

  if (!partido) {
    throw ApiError.notFound('Partido no encontrado');
  }

  // No permitir actualizar partidos finalizados (excepto observaciones)
  if (partido.estado === EstadoPartido.FINALIZADO && data.estado !== EstadoPartido.FINALIZADO) {
    throw ApiError.badRequest('No se puede modificar un partido finalizado');
  }

  // Actualizar campos
  Object.keys(data).forEach((key) => {
    const value = (data as any)[key];
    if (value !== undefined) {
      (partido as any)[key] = value;
    }
  });

  await partido.save();

  return partido.populate(['equipoLocal', 'equipoVisitante']);
};

/**
 * Eliminar partido
 */
export const deletePartido = async (id: string): Promise<void> => {
  const partido = await Partido.findById(id);

  if (!partido) {
    throw ApiError.notFound('Partido no encontrado');
  }

  // No permitir eliminar partidos finalizados
  if (partido.estado === EstadoPartido.FINALIZADO) {
    throw ApiError.badRequest('No se puede eliminar un partido finalizado');
  }

  await Partido.findOneAndDelete({ _id: id });
};

/**
 * Registrar gol
 */
export const registrarGol = async (
  id: string,
  data: RegistrarGolData
): Promise<IPartidoDocument> => {
  const partido = await Partido.findById(id);

  if (!partido) {
    throw ApiError.notFound('Partido no encontrado');
  }

  await partido.registrarGol(
    new mongoose.Types.ObjectId(data.jugadorId),
    data.minuto,
    data.esAutogol
  );

  return partido.populate([
    { path: 'equipoLocal', select: 'nombre escudo' },
    { path: 'equipoVisitante', select: 'nombre escudo' },
    { path: 'goles.jugador', select: 'nombre apellido numeroCamiseta' },
  ]);
};

/**
 * Registrar tarjeta
 */
export const registrarTarjeta = async (
  id: string,
  data: RegistrarTarjetaData
): Promise<IPartidoDocument> => {
  const partido = await Partido.findById(id);

  if (!partido) {
    throw ApiError.notFound('Partido no encontrado');
  }

  await partido.registrarTarjeta(
    new mongoose.Types.ObjectId(data.jugadorId),
    data.minuto,
    data.tipo
  );

  return partido.populate([
    { path: 'equipoLocal', select: 'nombre escudo' },
    { path: 'equipoVisitante', select: 'nombre escudo' },
    { path: 'tarjetas.jugador', select: 'nombre apellido numeroCamiseta' },
  ]);
};

/**
 * Finalizar partido
 */
export const finalizarPartido = async (
  id: string,
  data: FinalizarPartidoData
): Promise<IPartidoDocument> => {
  const partido = await Partido.findById(id);

  if (!partido) {
    throw ApiError.notFound('Partido no encontrado');
  }

  await partido.finalizarPartido(data.golesLocal, data.golesVisitante);

  // Si hay ganador por penales, actualizar
  if (data.ganadorPenales) {
    partido.resultado!.ganadorPenales = new mongoose.Types.ObjectId(data.ganadorPenales);
    await partido.save();
  }

  return partido.populate(['equipoLocal', 'equipoVisitante']);
};

/**
 * Cancelar partido
 */
export const cancelarPartido = async (id: string, motivo: string): Promise<IPartidoDocument> => {
  const partido = await Partido.findById(id);

  if (!partido) {
    throw ApiError.notFound('Partido no encontrado');
  }

  await partido.cancelarPartido(motivo);

  return partido.populate(['equipoLocal', 'equipoVisitante']);
};

/**
 * Obtener partidos por fase
 */
export const getPartidosByFase = async (faseId: string): Promise<IPartidoDocument[]> => {
  const partidos = await Partido.findByFase(faseId);
  return partidos;
};

/**
 * Obtener partidos por equipo
 */
export const getPartidosByEquipo = async (equipoId: string): Promise<IPartidoDocument[]> => {
  const partidos = await Partido.findByEquipo(equipoId);
  return partidos;
};

/**
 * Obtener partidos por jornada
 */
export const getPartidosByJornada = async (
  faseId: string,
  jornada: number
): Promise<IPartidoDocument[]> => {
  const partidos = await Partido.findByJornada(faseId, jornada);
  return partidos;
};

/**
 * Obtener próximos partidos
 */
export const getProximosPartidos = async (limit?: number): Promise<IPartidoDocument[]> => {
  const partidos = await Partido.findProximos(limit);
  return partidos;
};

/**
 * Obtener partidos por grupo
 */
export const getPartidosByGrupo = async (
  faseId: string,
  grupo: string
): Promise<IPartidoDocument[]> => {
  const partidos = await Partido.findPorGrupo(faseId, grupo);
  return partidos;
};

/**
 * Iniciar partido (cambiar estado a EN_CURSO)
 */
export const iniciarPartido = async (id: string): Promise<IPartidoDocument> => {
  const partido = await Partido.findById(id);

  if (!partido) {
    throw ApiError.notFound('Partido no encontrado');
  }

  if (partido.estado !== EstadoPartido.PROGRAMADO) {
    throw ApiError.badRequest('El partido no está en estado programado');
  }

  partido.estado = EstadoPartido.EN_CURSO;
  await partido.save();

  return partido.populate(['equipoLocal', 'equipoVisitante']);
};
