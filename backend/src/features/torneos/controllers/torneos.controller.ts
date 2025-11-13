import { Request, Response } from 'express';
import { asyncHandler } from '@/core/utils/asyncHandler';
import * as torneosService from '@/features/torneos/services/torneos.service';

// ========================================
// TORNEOS
// ========================================

export const getAllTorneos = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  const torneos = await torneosService.getAllTorneos();

  res.status(200).json({
    success: true,
    count: torneos.length,
    data: torneos,
  });
});

export const getTorneoById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const torneo = await torneosService.getTorneoById(id!);

  res.status(200).json({
    success: true,
    data: torneo,
  });
});

export const createTorneo = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { nombre, descripcion, fechaInicio, fechaFin, año, reglamento, premios } = req.body;

  const torneo = await torneosService.createTorneo({
    nombre,
    descripcion,
    fechaInicio,
    fechaFin,
    año,
    reglamento,
    premios,
  });

  res.status(201).json({
    success: true,
    message: 'Torneo creado exitosamente',
    data: torneo,
  });
});

export const updateTorneo = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { nombre, descripcion, fechaInicio, fechaFin, estado, reglamento, premios } = req.body;

  const torneo = await torneosService.updateTorneo(id!, {
    nombre,
    descripcion,
    fechaInicio,
    fechaFin,
    estado,
    reglamento,
    premios,
  });

  res.status(200).json({
    success: true,
    message: 'Torneo actualizado exitosamente',
    data: torneo,
  });
});

export const deleteTorneo = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  await torneosService.deleteTorneo(id!);

  res.status(200).json({
    success: true,
    message: 'Torneo eliminado exitosamente',
  });
});

export const agregarEquipoATorneo = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { equipoId } = req.body;

    const torneo = await torneosService.agregarEquipoATorneo(id!, equipoId!);

    res.status(200).json({
      success: true,
      message: 'Equipo agregado al torneo exitosamente',
      data: torneo,
    });
  }
);

export const removerEquipoDeTorneo = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id, equipoId } = req.params;

    const torneo = await torneosService.removerEquipoDeTorneo(id!, equipoId!);

    res.status(200).json({
      success: true,
      message: 'Equipo removido del torneo exitosamente',
      data: torneo,
    });
  }
);

export const iniciarTorneo = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const torneo = await torneosService.iniciarTorneo(id!);

  res.status(200).json({
    success: true,
    message: 'Torneo iniciado exitosamente',
    data: torneo,
  });
});

export const finalizarTorneo = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const torneo = await torneosService.finalizarTorneo(id!);

  res.status(200).json({
    success: true,
    message: 'Torneo finalizado exitosamente',
    data: torneo,
  });
});

export const getTorneoActual = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  const torneo = await torneosService.getTorneoActual();

  res.status(200).json({
    success: true,
    data: torneo,
  });
});

export const getTorneosByAño = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { año } = req.params;

  const torneos = await torneosService.getTorneosByAño(parseInt(año!));

  res.status(200).json({
    success: true,
    count: torneos.length,
    data: torneos,
  });
});

export const actualizarEstadisticasTorneo = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    const torneo = await torneosService.actualizarEstadisticasTorneo(id!);

    res.status(200).json({
      success: true,
      message: 'Estadísticas actualizadas exitosamente',
      data: torneo,
    });
  }
);

// ========================================
// FASES
// ========================================

export const createFase = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const {
    nombre,
    descripcion,
    tipo,
    orden,
    torneoId,
    equiposParticipantes,
    configuracion,
    fechaInicio,
    fechaFin,
  } = req.body;

  const fase = await torneosService.createFase({
    nombre,
    descripcion,
    tipo,
    orden,
    torneoId,
    equiposParticipantes,
    configuracion,
    fechaInicio,
    fechaFin,
  });

  res.status(201).json({
    success: true,
    message: 'Fase creada exitosamente',
    data: fase,
  });
});

export const getFaseById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const fase = await torneosService.getFaseById(id!);

  res.status(200).json({
    success: true,
    data: fase,
  });
});

export const getFasesByTorneo = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { torneoId } = req.params;

  const fases = await torneosService.getFasesByTorneo(torneoId!);

  res.status(200).json({
    success: true,
    count: fases.length,
    data: fases,
  });
});

export const generarCalendarioFase = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { faseId } = req.params;

    const fase = await torneosService.generarCalendarioFase(faseId!);

    res.status(200).json({
      success: true,
      message: 'Calendario generado exitosamente',
      data: fase,
    });
  }
);

export const calcularTablaPosiciones = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { faseId } = req.params;

    const tabla = await torneosService.calcularTablaPosiciones(faseId!);

    res.status(200).json({
      success: true,
      data: tabla,
    });
  }
);

export const finalizarFase = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { faseId } = req.params;

  const fase = await torneosService.finalizarFase(faseId!);

  res.status(200).json({
    success: true,
    message: 'Fase finalizada exitosamente',
    data: fase,
  });
});

export const getClasificadosFase = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { faseId } = req.params;
    const { cantidad } = req.query;

    const clasificados = await torneosService.getClasificadosFase(
      faseId!,
      parseInt(cantidad as string) || 4
    );

    res.status(200).json({
      success: true,
      count: clasificados.length,
      data: clasificados,
    });
  }
);
