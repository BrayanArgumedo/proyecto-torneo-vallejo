import { Router } from 'express';
import * as jugadoresController from '@/features/jugadores/controllers/jugadores.controller';
import { validate } from '@/core/middlewares/validate.middleware';
import { protect } from '@/core/middlewares/auth.middleware';
import { adminOnly, adminOrDelegado } from '@/core/middlewares/authorize.middleware';
import {
  createJugadorSchema,
  updateJugadorSchema,
  validarJugadorSchema,
  agregarDocumentoSchema,
  jugadorIdSchema,
  jugadoresPorEquipoSchema,
} from '@/features/jugadores/validations/jugador.validation';

const router = Router();

// Todas las rutas requieren autenticación
router.use(protect);

// ========================================
// RUTAS PÚBLICAS (AUTENTICADAS)
// ========================================

/**
 * @route   GET /api/jugadores
 * @desc    Obtener todos los jugadores
 * @access  Private
 */
router.get('/', jugadoresController.getAllJugadores);

/**
 * @route   GET /api/jugadores/pendientes
 * @desc    Obtener jugadores pendientes de validación
 * @access  Private
 */
router.get('/pendientes', jugadoresController.getJugadoresPendientes);

/**
 * @route   GET /api/jugadores/equipo/:equipoId
 * @desc    Obtener jugadores por equipo
 * @access  Private
 */
router.get('/equipo/:equipoId', validate(jugadoresPorEquipoSchema), jugadoresController.getJugadoresByEquipo);

/**
 * @route   GET /api/jugadores/equipo/:equipoId/validados
 * @desc    Obtener jugadores validados por equipo
 * @access  Private
 */
router.get('/equipo/:equipoId/validados', validate(jugadoresPorEquipoSchema), jugadoresController.getJugadoresValidadosByEquipo);

/**
 * @route   GET /api/jugadores/cedula/:cedula
 * @desc    Buscar jugador por cédula
 * @access  Private
 */
router.get('/cedula/:cedula', jugadoresController.findJugadorByCedula);

/**
 * @route   GET /api/jugadores/:id
 * @desc    Obtener jugador por ID
 * @access  Private
 */
router.get('/:id', validate(jugadorIdSchema), jugadoresController.getJugadorById);

/**
 * @route   GET /api/jugadores/:id/validar-reglamento
 * @desc    Validar reglamento de un jugador
 * @access  Private
 */
router.get('/:id/validar-reglamento', validate(jugadorIdSchema), jugadoresController.validarReglamento);

// ========================================
// RUTAS ADMIN/DELEGADO
// ========================================

/**
 * @route   POST /api/jugadores
 * @desc    Crear nuevo jugador
 * @access  Private/Admin/Delegado
 */
router.post('/', adminOrDelegado, validate(createJugadorSchema), jugadoresController.createJugador);

/**
 * @route   PUT /api/jugadores/:id
 * @desc    Actualizar jugador
 * @access  Private/Admin/Delegado
 */
router.put('/:id', adminOrDelegado, validate(updateJugadorSchema), jugadoresController.updateJugador);

/**
 * @route   POST /api/jugadores/:id/documentos
 * @desc    Agregar documento a jugador
 * @access  Private/Admin/Delegado
 */
router.post('/:id/documentos', adminOrDelegado, validate(agregarDocumentoSchema), jugadoresController.agregarDocumento);

// ========================================
// RUTAS ADMIN ONLY
// ========================================

/**
 * @route   PATCH /api/jugadores/:id/validar
 * @desc    Validar o rechazar jugador
 * @access  Private/Admin
 */
router.patch('/:id/validar', adminOnly, validate(validarJugadorSchema), jugadoresController.validarJugador);

/**
 * @route   DELETE /api/jugadores/:id
 * @desc    Eliminar jugador
 * @access  Private/Admin
 */
router.delete('/:id', adminOnly, validate(jugadorIdSchema), jugadoresController.deleteJugador);

export default router;
