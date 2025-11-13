import { Request, Response } from 'express';
import { asyncHandler } from '@/core/utils/asyncHandler';
import * as equiposService from '@/features/equipos/services/equipos.service';

// ========================================
// OBTENER TODOS LOS EQUIPOS
// ========================================

export const getAllEquipos = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  const equipos = await equiposService.getAllEquipos();

  res.status(200).json({
    success: true,
    count: equipos.length,
    data: equipos,
  });
});

// ========================================
// OBTENER EQUIPO POR ID
// ========================================

export const getEquipoById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const equipo = await equiposService.getEquipoById(id!);

  res.status(200).json({
    success: true,
    data: equipo,
  });
});

// ========================================
// CREAR EQUIPO
// ========================================

export const createEquipo = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { nombre, delegadoId, colores, escudo, torneoId } = req.body;

  const equipo = await equiposService.createEquipo({
    nombre,
    delegadoId,
    colores,
    escudo,
    torneoId,
  });

  res.status(201).json({
    success: true,
    message: 'Equipo creado exitosamente',
    data: equipo,
  });
});

// ========================================
// ACTUALIZAR EQUIPO
// ========================================

export const updateEquipo = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { nombre, delegadoId, colores, escudo, estado, torneoId } = req.body;

  const equipo = await equiposService.updateEquipo(id!, {
    nombre,
    delegadoId,
    colores,
    escudo,
    estado,
    torneoId,
  });

  res.status(200).json({
    success: true,
    message: 'Equipo actualizado exitosamente',
    data: equipo,
  });
});

// ========================================
// ELIMINAR EQUIPO
// ========================================

export const deleteEquipo = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  await equiposService.deleteEquipo(id!);

  res.status(200).json({
    success: true,
    message: 'Equipo eliminado exitosamente',
  });
});

// ========================================
// OBTENER ESTADÍSTICAS DEL EQUIPO
// ========================================

export const getEstadisticasEquipo = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    const estadisticas = await equiposService.getEstadisticasEquipo(id!);

    res.status(200).json({
      success: true,
      data: estadisticas,
    });
  }
);

// ========================================
// OBTENER EQUIPOS ACTIVOS
// ========================================

export const getEquiposActivos = asyncHandler(
  async (_req: Request, res: Response): Promise<void> => {
    const equipos = await equiposService.getEquiposActivos();

    res.status(200).json({
      success: true,
      count: equipos.length,
      data: equipos,
    });
  }
);

// ========================================
// OBTENER EQUIPO POR DELEGADO
// ========================================

export const getEquipoByDelegado = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { delegadoId } = req.params;

    const equipo = await equiposService.getEquipoByDelegado(delegadoId!);

    res.status(200).json({
      success: true,
      data: equipo,
    });
  }
);

// ========================================
// VERIFICAR SI PUEDE AGREGAR JUGADOR
// ========================================

export const canAddJugador = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const result = await equiposService.canAddJugador(id!);

  res.status(200).json({
    success: true,
    data: result,
  });
});

// ========================================
// OBTENER EQUIPOS POR TORNEO
// ========================================

export const getEquiposByTorneo = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { torneoId } = req.params;

    const equipos = await equiposService.getEquiposByTorneo(torneoId!);

    res.status(200).json({
      success: true,
      count: equipos.length,
      data: equipos,
    });
  }
);
