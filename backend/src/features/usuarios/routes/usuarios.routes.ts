import { Router } from 'express';
import * as usuariosController from '@/features/usuarios/controllers/usuarios.controller';
import { validate } from '@/core/middlewares/validate.middleware';
import { protect } from '@/core/middlewares/auth.middleware';
import { adminOnly } from '@/core/middlewares/authorize.middleware';
import {
  createUsuarioSchema,
  updateUsuarioSchema,
  usuarioIdSchema,
} from '@/features/usuarios/validations/usuario.validation';

const router = Router();

// Todas las rutas requieren autenticación y rol ADMIN
router.use(protect, adminOnly);

// ========================================
// RUTAS
// ========================================

/**
 * @route   GET /api/usuarios
 * @desc    Obtener todos los usuarios
 * @access  Private/Admin
 */
router.get('/', usuariosController.getAllUsuarios);

/**
 * @route   GET /api/usuarios/rol
 * @desc    Obtener usuarios por rol
 * @access  Private/Admin
 */
router.get('/rol', usuariosController.getUsuariosByRol);

/**
 * @route   GET /api/usuarios/:id
 * @desc    Obtener usuario por ID
 * @access  Private/Admin
 */
router.get('/:id', validate(usuarioIdSchema), usuariosController.getUsuarioById);

/**
 * @route   POST /api/usuarios
 * @desc    Crear nuevo usuario
 * @access  Private/Admin
 */
router.post('/', validate(createUsuarioSchema), usuariosController.createUsuario);

/**
 * @route   PUT /api/usuarios/:id
 * @desc    Actualizar usuario
 * @access  Private/Admin
 */
router.put('/:id', validate(updateUsuarioSchema), usuariosController.updateUsuario);

/**
 * @route   DELETE /api/usuarios/:id
 * @desc    Eliminar usuario
 * @access  Private/Admin
 */
router.delete('/:id', validate(usuarioIdSchema), usuariosController.deleteUsuario);

/**
 * @route   PATCH /api/usuarios/:id/toggle-estado
 * @desc    Activar/Desactivar usuario
 * @access  Private/Admin
 */
router.patch('/:id/toggle-estado', validate(usuarioIdSchema), usuariosController.toggleUsuarioEstado);

export default router;
