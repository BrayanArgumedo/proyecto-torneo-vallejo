/**
 * Rutas para generación de reportes PDF
 */

import { Router } from 'express';
import * as reportesController from '@/features/reportes/controllers/reportes.controller';
import { validate } from '@/core/middlewares/validate.middleware';
import { protect } from '@/core/middlewares/auth.middleware';
import {
  generarCredencialJugadorSchema,
  generarPlanillaPartidoSchema,
  generarTablaPosicionesSchema,
  generarActaPartidoSchema,
} from '@/features/reportes/validations/reporte.validation';

const router = Router();

// Todas las rutas requieren autenticación
router.use(protect);

// ========================================
// RUTAS DE GENERACIÓN DE REPORTES PDF
// ========================================

/**
 * @route   GET /api/reportes/credencial/:id
 * @desc    Generar credencial de jugador en PDF
 * @access  Private
 */
router.get(
  '/credencial/:id',
  validate(generarCredencialJugadorSchema),
  reportesController.generarCredencialJugador
);

/**
 * @route   GET /api/reportes/planilla/:id
 * @desc    Generar planilla de partido en PDF
 * @access  Private
 */
router.get(
  '/planilla/:id',
  validate(generarPlanillaPartidoSchema),
  reportesController.generarPlanillaPartido
);

/**
 * @route   GET /api/reportes/tabla/:id
 * @desc    Generar tabla de posiciones en PDF
 * @access  Private
 */
router.get(
  '/tabla/:id',
  validate(generarTablaPosicionesSchema),
  reportesController.generarTablaPosiciones
);

/**
 * @route   GET /api/reportes/acta/:id
 * @desc    Generar acta de partido en PDF
 * @access  Private
 */
router.get(
  '/acta/:id',
  validate(generarActaPartidoSchema),
  reportesController.generarActaPartido
);

export default router;
