import { Request, Response } from 'express';
import { asyncHandler } from '@/core/utils/asyncHandler';
import * as jugadoresService from '@/features/jugadores/services/jugadores.service';
import { AuthRequest } from '@/shared/types/request';

// ========================================
// OBTENER TODOS LOS JUGADORES
// ========================================

export const getAllJugadores = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  const jugadores = await jugadoresService.getAllJugadores();

  res.status(200).json({
    success: true,
    count: jugadores.length,
    data: jugadores,
  });
});

// ========================================
// OBTENER JUGADOR POR ID
// ========================================

export const getJugadorById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const jugador = await jugadoresService.getJugadorById(id!);

  res.status(200).json({
    success: true,
    data: jugador,
  });
});

// ========================================
// CREAR JUGADOR
// ========================================

export const createJugador = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const {
    nombre,
    apellido,
    cedula,
    fechaNacimiento,
    telefono,
    email,
    direccion,
    foto,
    posicion,
    numeroCamiseta,
    tipo,
    equipoId,
    documentos,
  } = req.body;

  const jugador = await jugadoresService.createJugador({
    nombre,
    apellido,
    cedula,
    fechaNacimiento,
    telefono,
    email,
    direccion,
    foto,
    posicion,
    numeroCamiseta,
    tipo,
    equipoId,
    documentos,
  });

  res.status(201).json({
    success: true,
    message: 'Jugador creado exitosamente',
    data: jugador,
  });
});

// ========================================
// ACTUALIZAR JUGADOR
// ========================================

export const updateJugador = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const {
    nombre,
    apellido,
    fechaNacimiento,
    telefono,
    email,
    direccion,
    foto,
    posicion,
    numeroCamiseta,
    tipo,
  } = req.body;

  const jugador = await jugadoresService.updateJugador(id!, {
    nombre,
    apellido,
    fechaNacimiento,
    telefono,
    email,
    direccion,
    foto,
    posicion,
    numeroCamiseta,
    tipo,
  });

  res.status(200).json({
    success: true,
    message: 'Jugador actualizado exitosamente',
    data: jugador,
  });
});

// ========================================
// ELIMINAR JUGADOR
// ========================================

export const deleteJugador = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  await jugadoresService.deleteJugador(id!);

  res.status(200).json({
    success: true,
    message: 'Jugador eliminado exitosamente',
  });
});

// ========================================
// VALIDAR JUGADOR
// ========================================

export const validarJugador = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { estadoValidacion, observaciones } = req.body;
  const validadoPor = (req.user as any)._id.toString();

  const jugador = await jugadoresService.validarJugador(id!, {
    estadoValidacion,
    observaciones,
    validadoPor,
  });

  res.status(200).json({
    success: true,
    message: `Jugador ${estadoValidacion === 'VALIDADO' ? 'validado' : 'rechazado'} exitosamente`,
    data: jugador,
  });
});

// ========================================
// AGREGAR DOCUMENTO
// ========================================

export const agregarDocumento = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { tipo, url, nombreArchivo } = req.body;

    const jugador = await jugadoresService.agregarDocumento(id!, {
      tipo,
      url,
      nombreArchivo,
      uploadedAt: new Date(),
    });

    res.status(200).json({
      success: true,
      message: 'Documento agregado exitosamente',
      data: jugador,
    });
  }
);

// ========================================
// OBTENER JUGADORES POR EQUIPO
// ========================================

export const getJugadoresByEquipo = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { equipoId } = req.params;

    const jugadores = await jugadoresService.getJugadoresByEquipo(equipoId!);

    res.status(200).json({
      success: true,
      count: jugadores.length,
      data: jugadores,
    });
  }
);

// ========================================
// OBTENER JUGADORES PENDIENTES
// ========================================

export const getJugadoresPendientes = asyncHandler(
  async (_req: Request, res: Response): Promise<void> => {
    const jugadores = await jugadoresService.getJugadoresPendientes();

    res.status(200).json({
      success: true,
      count: jugadores.length,
      data: jugadores,
    });
  }
);

// ========================================
// VALIDAR REGLAMENTO
// ========================================

export const validarReglamento = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    const resultado = await jugadoresService.validarReglamentoJugador(id!);

    res.status(200).json({
      success: true,
      data: resultado,
    });
  }
);

// ========================================
// OBTENER JUGADORES VALIDADOS POR EQUIPO
// ========================================

export const getJugadoresValidadosByEquipo = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { equipoId } = req.params;

    const jugadores = await jugadoresService.getJugadoresValidadosByEquipo(equipoId!);

    res.status(200).json({
      success: true,
      count: jugadores.length,
      data: jugadores,
    });
  }
);

// ========================================
// BUSCAR JUGADOR POR CÉDULA
// ========================================

export const findJugadorByCedula = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { cedula } = req.params;

    const jugador = await jugadoresService.findJugadorByCedula(cedula!);

    res.status(200).json({
      success: true,
      data: jugador,
    });
  }
);
