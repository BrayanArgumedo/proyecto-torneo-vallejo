import { Router } from 'express';
import * as authController from '@/features/auth/controllers/auth.controller';
import { validate } from '@/core/middlewares/validate.middleware';
import { protect } from '@/core/middlewares/auth.middleware';
import {
  loginSchema,
  registerSchema,
  changePasswordSchema,
} from '@/features/auth/validations/auth.validation';

const router = Router();

// ========================================
// RUTAS PÚBLICAS
// ========================================

/**
 * @route   POST /api/auth/login
 * @desc    Login de usuario
 * @access  Public
 */
router.post('/login', validate(loginSchema), authController.login);

/**
 * @route   POST /api/auth/register
 * @desc    Registro de nuevo usuario
 * @access  Public
 */
router.post('/register', validate(registerSchema), authController.register);

/**
 * @route   GET /api/auth/verify
 * @desc    Verificar token JWT
 * @access  Public
 */
router.get('/verify', authController.verifyToken);

// ========================================
// RUTAS PROTEGIDAS
// ========================================

/**
 * @route   GET /api/auth/profile
 * @desc    Obtener perfil del usuario autenticado
 * @access  Private
 */
router.get('/profile', protect, authController.getProfile);

/**
 * @route   PUT /api/auth/change-password
 * @desc    Cambiar contraseña
 * @access  Private
 */
router.put('/change-password', protect, validate(changePasswordSchema), authController.changePassword);

export default router;
