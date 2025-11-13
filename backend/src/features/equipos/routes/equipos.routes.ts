import { Router } from 'express';
import * as equiposController from '@/features/equipos/controllers/equipos.controller';
import { validate } from '@/core/middlewares/validate.middleware';
import { protect } from '@/core/middlewares/auth.middleware';
import { adminOnly } from '@/core/middlewares/authorize.middleware';
import {
  createEquipoSchema,
  updateEquipoSchema,
  equipoIdSchema,
  estadisticasEquipoSchema,
} from '@/features/equipos/validations/equipo.validation';

const router = Router();

// Todas las rutas requieren autenticación
router.use(protect);

// ========================================
// RUTAS PÚBLICAS (AUTENTICADAS)
// ========================================

/**
 * @route   GET /api/equipos
 * @desc    Obtener todos los equipos
 * @access  Private
 */
router.get('/', equiposController.getAllEquipos);

/**
 * @route   GET /api/equipos/activos
 * @desc    Obtener equipos activos
 * @access  Private
 */
router.get('/activos', equiposController.getEquiposActivos);

/**
 * @route   GET /api/equipos/delegado/:delegadoId
 * @desc    Obtener equipo por delegado
 * @access  Private
 */
router.get('/delegado/:delegadoId', equiposController.getEquipoByDelegado);

/**
 * @route   GET /api/equipos/torneo/:torneoId
 * @desc    Obtener equipos por torneo
 * @access  Private
 */
router.get('/torneo/:torneoId', equiposController.getEquiposByTorneo);

/**
 * @route   GET /api/equipos/:id
 * @desc    Obtener equipo por ID
 * @access  Private
 */
router.get('/:id', validate(equipoIdSchema), equiposController.getEquipoById);

/**
 * @route   GET /api/equipos/:id/estadisticas
 * @desc    Obtener estadísticas del equipo
 * @access  Private
 */
router.get('/:id/estadisticas', validate(estadisticasEquipoSchema), equiposController.getEstadisticasEquipo);

/**
 * @route   GET /api/equipos/:id/can-add-jugador
 * @desc    Verificar si puede agregar jugador
 * @access  Private
 */
router.get('/:id/can-add-jugador', validate(equipoIdSchema), equiposController.canAddJugador);

// ========================================
// RUTAS ADMIN
// ========================================

/**
 * @route   POST /api/equipos
 * @desc    Crear nuevo equipo
 * @access  Private/Admin
 */
router.post('/', adminOnly, validate(createEquipoSchema), equiposController.createEquipo);

/**
 * @route   PUT /api/equipos/:id
 * @desc    Actualizar equipo
 * @access  Private/Admin
 */
router.put('/:id', adminOnly, validate(updateEquipoSchema), equiposController.updateEquipo);

/**
 * @route   DELETE /api/equipos/:id
 * @desc    Eliminar equipo
 * @access  Private/Admin
 */
router.delete('/:id', adminOnly, validate(equipoIdSchema), equiposController.deleteEquipo);

export default router;
