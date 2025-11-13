import { Request, Response } from 'express';
import { asyncHandler } from '@/core/utils/asyncHandler';
import * as partidosService from '@/features/partidos/services/partidos.service';

// ========================================
// OBTENER TODOS LOS PARTIDOS
// ========================================

export const getAllPartidos = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  const partidos = await partidosService.getAllPartidos();

  res.status(200).json({
    success: true,
    count: partidos.length,
    data: partidos,
  });
});

// ========================================
// OBTENER PARTIDO POR ID
// ========================================

export const getPartidoById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const partido = await partidosService.getPartidoById(id!);

  res.status(200).json({
    success: true,
    data: partido,
  });
});

// ========================================
// CREAR PARTIDO
// ========================================

export const createPartido = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const {
    torneoId,
    faseId,
    equipoLocal,
    equipoVisitante,
    fecha,
    cancha,
    jornada,
    grupo,
    esEliminacion,
    arbitro,
    observaciones,
  } = req.body;

  const partido = await partidosService.createPartido({
    torneoId,
    faseId,
    equipoLocal,
    equipoVisitante,
    fecha,
    cancha,
    jornada,
    grupo,
    esEliminacion,
    arbitro,
    observaciones,
  });

  res.status(201).json({
    success: true,
    message: 'Partido creado exitosamente',
    data: partido,
  });
});

// ========================================
// ACTUALIZAR PARTIDO
// ========================================

export const updatePartido = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { fecha, cancha, jornada, estado, arbitro, observaciones } = req.body;

  const partido = await partidosService.updatePartido(id!, {
    fecha,
    cancha,
    jornada,
    estado,
    arbitro,
    observaciones,
  });

  res.status(200).json({
    success: true,
    message: 'Partido actualizado exitosamente',
    data: partido,
  });
});

// ========================================
// ELIMINAR PARTIDO
// ========================================

export const deletePartido = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  await partidosService.deletePartido(id!);

  res.status(200).json({
    success: true,
    message: 'Partido eliminado exitosamente',
  });
});

// ========================================
// REGISTRAR GOL
// ========================================

export const registrarGol = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { jugadorId, minuto, esAutogol } = req.body;

  const partido = await partidosService.registrarGol(id!, {
    jugadorId,
    minuto,
    esAutogol,
  });

  res.status(200).json({
    success: true,
    message: 'Gol registrado exitosamente',
    data: partido,
  });
});

// ========================================
// REGISTRAR TARJETA
// ========================================

export const registrarTarjeta = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { jugadorId, minuto, tipo } = req.body;

    const partido = await partidosService.registrarTarjeta(id!, {
      jugadorId,
      minuto,
      tipo,
    });

    res.status(200).json({
      success: true,
      message: 'Tarjeta registrada exitosamente',
      data: partido,
    });
  }
);

// ========================================
// FINALIZAR PARTIDO
// ========================================

export const finalizarPartido = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { golesLocal, golesVisitante, ganadorPenales } = req.body;

    const partido = await partidosService.finalizarPartido(id!, {
      golesLocal,
      golesVisitante,
      ganadorPenales,
    });

    res.status(200).json({
      success: true,
      message: 'Partido finalizado exitosamente',
      data: partido,
    });
  }
);

// ========================================
// CANCELAR PARTIDO
// ========================================

export const cancelarPartido = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { motivo } = req.body;

    const partido = await partidosService.cancelarPartido(id!, motivo!);

    res.status(200).json({
      success: true,
      message: 'Partido cancelado exitosamente',
      data: partido,
    });
  }
);

// ========================================
// OBTENER PARTIDOS POR FASE
// ========================================

export const getPartidosByFase = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { faseId } = req.params;

    const partidos = await partidosService.getPartidosByFase(faseId!);

    res.status(200).json({
      success: true,
      count: partidos.length,
      data: partidos,
    });
  }
);

// ========================================
// OBTENER PARTIDOS POR EQUIPO
// ========================================

export const getPartidosByEquipo = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { equipoId } = req.params;

    const partidos = await partidosService.getPartidosByEquipo(equipoId!);

    res.status(200).json({
      success: true,
      count: partidos.length,
      data: partidos,
    });
  }
);

// ========================================
// OBTENER PARTIDOS POR JORNADA
// ========================================

export const getPartidosByJornada = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { faseId, jornada } = req.params;

    const partidos = await partidosService.getPartidosByJornada(faseId!, parseInt(jornada!));

    res.status(200).json({
      success: true,
      count: partidos.length,
      data: partidos,
    });
  }
);

// ========================================
// OBTENER PRÓXIMOS PARTIDOS
// ========================================

export const getProximosPartidos = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { limit } = req.query;

    const partidos = await partidosService.getProximosPartidos(
      limit ? parseInt(limit as string) : undefined
    );

    res.status(200).json({
      success: true,
      count: partidos.length,
      data: partidos,
    });
  }
);

// ========================================
// OBTENER PARTIDOS POR GRUPO
// ========================================

export const getPartidosByGrupo = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { faseId, grupo } = req.params;

    const partidos = await partidosService.getPartidosByGrupo(faseId!, grupo!);

    res.status(200).json({
      success: true,
      count: partidos.length,
      data: partidos,
    });
  }
);

// ========================================
// INICIAR PARTIDO
// ========================================

export const iniciarPartido = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const partido = await partidosService.iniciarPartido(id!);

  res.status(200).json({
    success: true,
    message: 'Partido iniciado exitosamente',
    data: partido,
  });
});
