import { Router } from 'express';
import * as partidosController from '@/features/partidos/controllers/partidos.controller';
import { validate } from '@/core/middlewares/validate.middleware';
import { protect } from '@/core/middlewares/auth.middleware';
import { adminOnly } from '@/core/middlewares/authorize.middleware';
import {
  createPartidoSchema,
  updatePartidoSchema,
  registrarGolSchema,
  registrarTarjetaSchema,
  finalizarPartidoSchema,
  cancelarPartidoSchema,
  partidoIdSchema,
  partidosPorFaseSchema,
  partidosPorEquipoSchema,
} from '@/features/partidos/validations/partido.validation';

const router = Router();

// Todas las rutas requieren autenticación
router.use(protect);

// ========================================
// RUTAS PÚBLICAS (AUTENTICADAS)
// ========================================

/**
 * @route   GET /api/partidos
 * @desc    Obtener todos los partidos
 * @access  Private
 */
router.get('/', partidosController.getAllPartidos);

/**
 * @route   GET /api/partidos/proximos
 * @desc    Obtener próximos partidos
 * @access  Private
 */
router.get('/proximos', partidosController.getProximosPartidos);

/**
 * @route   GET /api/partidos/fase/:faseId
 * @desc    Obtener partidos por fase
 * @access  Private
 */
router.get('/fase/:faseId', validate(partidosPorFaseSchema), partidosController.getPartidosByFase);

/**
 * @route   GET /api/partidos/equipo/:equipoId
 * @desc    Obtener partidos por equipo
 * @access  Private
 */
router.get('/equipo/:equipoId', validate(partidosPorEquipoSchema), partidosController.getPartidosByEquipo);

/**
 * @route   GET /api/partidos/fase/:faseId/jornada/:jornada
 * @desc    Obtener partidos por jornada
 * @access  Private
 */
router.get('/fase/:faseId/jornada/:jornada', partidosController.getPartidosByJornada);

/**
 * @route   GET /api/partidos/fase/:faseId/grupo/:grupo
 * @desc    Obtener partidos por grupo
 * @access  Private
 */
router.get('/fase/:faseId/grupo/:grupo', partidosController.getPartidosByGrupo);

/**
 * @route   GET /api/partidos/:id
 * @desc    Obtener partido por ID
 * @access  Private
 */
router.get('/:id', validate(partidoIdSchema), partidosController.getPartidoById);

// ========================================
// RUTAS ADMIN
// ========================================

/**
 * @route   POST /api/partidos
 * @desc    Crear nuevo partido
 * @access  Private/Admin
 */
router.post('/', adminOnly, validate(createPartidoSchema), partidosController.createPartido);

/**
 * @route   PUT /api/partidos/:id
 * @desc    Actualizar partido
 * @access  Private/Admin
 */
router.put('/:id', adminOnly, validate(updatePartidoSchema), partidosController.updatePartido);

/**
 * @route   DELETE /api/partidos/:id
 * @desc    Eliminar partido
 * @access  Private/Admin
 */
router.delete('/:id', adminOnly, validate(partidoIdSchema), partidosController.deletePartido);

/**
 * @route   PATCH /api/partidos/:id/iniciar
 * @desc    Iniciar partido
 * @access  Private/Admin
 */
router.patch('/:id/iniciar', adminOnly, validate(partidoIdSchema), partidosController.iniciarPartido);

/**
 * @route   POST /api/partidos/:id/goles
 * @desc    Registrar gol
 * @access  Private/Admin
 */
router.post('/:id/goles', adminOnly, validate(registrarGolSchema), partidosController.registrarGol);

/**
 * @route   POST /api/partidos/:id/tarjetas
 * @desc    Registrar tarjeta
 * @access  Private/Admin
 */
router.post('/:id/tarjetas', adminOnly, validate(registrarTarjetaSchema), partidosController.registrarTarjeta);

/**
 * @route   PATCH /api/partidos/:id/finalizar
 * @desc    Finalizar partido
 * @access  Private/Admin
 */
router.patch('/:id/finalizar', adminOnly, validate(finalizarPartidoSchema), partidosController.finalizarPartido);

/**
 * @route   PATCH /api/partidos/:id/cancelar
 * @desc    Cancelar partido
 * @access  Private/Admin
 */
router.patch('/:id/cancelar', adminOnly, validate(cancelarPartidoSchema), partidosController.cancelarPartido);

export default router;
