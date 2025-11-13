import { Request, Response } from 'express';
import { asyncHandler } from '@/core/utils/asyncHandler';
import * as usuariosService from '@/features/usuarios/services/usuarios.service';

// ========================================
// OBTENER TODOS LOS USUARIOS
// ========================================

export const getAllUsuarios = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
  const usuarios = await usuariosService.getAllUsuarios();

  res.status(200).json({
    success: true,
    count: usuarios.length,
    data: usuarios,
  });
});

// ========================================
// OBTENER USUARIO POR ID
// ========================================

export const getUsuarioById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const usuario = await usuariosService.getUsuarioById(id!);

  res.status(200).json({
    success: true,
    data: usuario,
  });
});

// ========================================
// CREAR USUARIO
// ========================================

export const createUsuario = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { email, password, nombre, apellido, rol, equipoId, estado } = req.body;

  const usuario = await usuariosService.createUsuario({
    email,
    password,
    nombre,
    apellido,
    rol,
    equipoId,
    estado,
  });

  res.status(201).json({
    success: true,
    message: 'Usuario creado exitosamente',
    data: usuario,
  });
});

// ========================================
// ACTUALIZAR USUARIO
// ========================================

export const updateUsuario = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { email, nombre, apellido, rol, equipoId, estado } = req.body;

  const usuario = await usuariosService.updateUsuario(id!, {
    email,
    nombre,
    apellido,
    rol,
    equipoId,
    estado,
  });

  res.status(200).json({
    success: true,
    message: 'Usuario actualizado exitosamente',
    data: usuario,
  });
});

// ========================================
// ELIMINAR USUARIO
// ========================================

export const deleteUsuario = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  await usuariosService.deleteUsuario(id!);

  res.status(200).json({
    success: true,
    message: 'Usuario eliminado exitosamente',
  });
});

// ========================================
// OBTENER USUARIOS POR ROL
// ========================================

export const getUsuariosByRol = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { rol } = req.query;

  const usuarios = await usuariosService.getUsuariosByRol(rol as any);

  res.status(200).json({
    success: true,
    count: usuarios.length,
    data: usuarios,
  });
});

// ========================================
// TOGGLE ESTADO USUARIO
// ========================================

export const toggleUsuarioEstado = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    const usuario = await usuariosService.toggleUsuarioEstado(id!);

    res.status(200).json({
      success: true,
      message: `Usuario ${usuario.estado === 'ACTIVO' ? 'activado' : 'desactivado'} exitosamente`,
      data: usuario,
    });
  }
);
