import { Router } from 'express';
import * as torneosController from '@/features/torneos/controllers/torneos.controller';
import { validate } from '@/core/middlewares/validate.middleware';
import { protect } from '@/core/middlewares/auth.middleware';
import { adminOnly } from '@/core/middlewares/authorize.middleware';
import {
  createTorneoSchema,
  updateTorneoSchema,
  agregarEquipoSchema,
  createFaseSchema,
  generarCalendarioSchema,
  torneoIdSchema,
  faseIdSchema,
} from '@/features/torneos/validations/torneo.validation';

const router = Router();

// Todas las rutas requieren autenticación
router.use(protect);

// ========================================
// RUTAS PÚBLICAS (AUTENTICADAS)
// ========================================

/**
 * @route   GET /api/torneos
 * @desc    Obtener todos los torneos
 * @access  Private
 */
router.get('/', torneosController.getAllTorneos);

/**
 * @route   GET /api/torneos/actual
 * @desc    Obtener torneo actual
 * @access  Private
 */
router.get('/actual', torneosController.getTorneoActual);

/**
 * @route   GET /api/torneos/año/:año
 * @desc    Obtener torneos por año
 * @access  Private
 */
router.get('/año/:año', torneosController.getTorneosByAño);

/**
 * @route   GET /api/torneos/:id
 * @desc    Obtener torneo por ID
 * @access  Private
 */
router.get('/:id', validate(torneoIdSchema), torneosController.getTorneoById);

/**
 * @route   GET /api/torneos/:id/fases
 * @desc    Obtener fases de un torneo
 * @access  Private
 */
router.get('/:torneoId/fases', torneosController.getFasesByTorneo);

// ========================================
// RUTAS FASES PÚBLICAS
// ========================================

/**
 * @route   GET /api/fases/:id
 * @desc    Obtener fase por ID
 * @access  Private
 */
router.get('/fases/:id', validate(faseIdSchema), torneosController.getFaseById);

/**
 * @route   GET /api/fases/:faseId/tabla
 * @desc    Calcular tabla de posiciones
 * @access  Private
 */
router.get('/fases/:faseId/tabla', torneosController.calcularTablaPosiciones);

/**
 * @route   GET /api/fases/:faseId/clasificados
 * @desc    Obtener equipos clasificados
 * @access  Private
 */
router.get('/fases/:faseId/clasificados', torneosController.getClasificadosFase);

// ========================================
// RUTAS ADMIN - TORNEOS
// ========================================

/**
 * @route   POST /api/torneos
 * @desc    Crear nuevo torneo
 * @access  Private/Admin
 */
router.post('/', adminOnly, validate(createTorneoSchema), torneosController.createTorneo);

/**
 * @route   PUT /api/torneos/:id
 * @desc    Actualizar torneo
 * @access  Private/Admin
 */
router.put('/:id', adminOnly, validate(updateTorneoSchema), torneosController.updateTorneo);

/**
 * @route   DELETE /api/torneos/:id
 * @desc    Eliminar torneo
 * @access  Private/Admin
 */
router.delete('/:id', adminOnly, validate(torneoIdSchema), torneosController.deleteTorneo);

/**
 * @route   POST /api/torneos/:id/equipos
 * @desc    Agregar equipo al torneo
 * @access  Private/Admin
 */
router.post('/:id/equipos', adminOnly, validate(agregarEquipoSchema), torneosController.agregarEquipoATorneo);

/**
 * @route   DELETE /api/torneos/:id/equipos/:equipoId
 * @desc    Remover equipo del torneo
 * @access  Private/Admin
 */
router.delete('/:id/equipos/:equipoId', adminOnly, torneosController.removerEquipoDeTorneo);

/**
 * @route   PATCH /api/torneos/:id/iniciar
 * @desc    Iniciar torneo
 * @access  Private/Admin
 */
router.patch('/:id/iniciar', adminOnly, validate(torneoIdSchema), torneosController.iniciarTorneo);

/**
 * @route   PATCH /api/torneos/:id/finalizar
 * @desc    Finalizar torneo
 * @access  Private/Admin
 */
router.patch('/:id/finalizar', adminOnly, validate(torneoIdSchema), torneosController.finalizarTorneo);

/**
 * @route   PATCH /api/torneos/:id/actualizar-estadisticas
 * @desc    Actualizar estadísticas del torneo
 * @access  Private/Admin
 */
router.patch('/:id/actualizar-estadisticas', adminOnly, validate(torneoIdSchema), torneosController.actualizarEstadisticasTorneo);

// ========================================
// RUTAS ADMIN - FASES
// ========================================

/**
 * @route   POST /api/fases
 * @desc    Crear nueva fase
 * @access  Private/Admin
 */
router.post('/fases', adminOnly, validate(createFaseSchema), torneosController.createFase);

/**
 * @route   POST /api/fases/:faseId/generar-calendario
 * @desc    Generar calendario de una fase
 * @access  Private/Admin
 */
router.post('/fases/:faseId/generar-calendario', adminOnly, validate(generarCalendarioSchema), torneosController.generarCalendarioFase);

/**
 * @route   PATCH /api/fases/:faseId/finalizar
 * @desc    Finalizar fase
 * @access  Private/Admin
 */
router.patch('/fases/:faseId/finalizar', adminOnly, torneosController.finalizarFase);

export default router;
