import { Request, Response } from 'express';
import { asyncHandler } from '@/core/utils/asyncHandler';
import * as authService from '@/features/auth/services/auth.service';
import { AuthRequest } from '@/shared/types/request';

// ========================================
// LOGIN
// ========================================

export const login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  const result = await authService.login({ email, password });

  res.status(200).json({
    success: true,
    message: 'Login exitoso',
    data: result,
  });
});

// ========================================
// REGISTRO
// ========================================

export const register = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { email, password, nombre, apellido, rol, equipoId } = req.body;

  const result = await authService.register({
    email,
    password,
    nombre,
    apellido,
    rol,
    equipoId,
  });

  res.status(201).json({
    success: true,
    message: 'Usuario registrado exitosamente',
    data: result,
  });
});

// ========================================
// OBTENER PERFIL
// ========================================

export const getProfile = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = (req.user as any)._id.toString();

  const usuario = await authService.getProfile(userId);

  res.status(200).json({
    success: true,
    data: usuario,
  });
});

// ========================================
// CAMBIAR CONTRASEÑA
// ========================================

export const changePassword = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = (req.user as any)._id.toString();
  const { currentPassword, newPassword } = req.body;

  await authService.changePassword(userId, currentPassword, newPassword);

  res.status(200).json({
    success: true,
    message: 'Contraseña actualizada exitosamente',
  });
});

// ========================================
// VERIFICAR TOKEN
// ========================================

export const verifyToken = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    res.status(401).json({
      success: false,
      message: 'No se proporcionó token',
    });
    return;
  }

  const usuario = await authService.verifyToken(token);

  res.status(200).json({
    success: true,
    data: {
      valid: true,
      usuario: {
        id: usuario._id,
        email: usuario.email,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        rol: usuario.rol,
      },
    },
  });
});
