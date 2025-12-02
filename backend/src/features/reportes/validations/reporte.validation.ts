/**
 * Validaciones para generación de reportes PDF
 */

import Joi from 'joi';

// ========================================
// VALIDACIÓN DE ID (OBJECTID DE MONGODB)
// ========================================

const objectIdSchema = Joi.object({
  id: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'El ID debe ser un ObjectId válido',
      'any.required': 'El ID es requerido',
    }),
});

// ========================================
// GENERAR CREDENCIAL DE JUGADOR
// ========================================

export const generarCredencialJugadorSchema = {
  params: objectIdSchema,
};

// ========================================
// GENERAR PLANILLA DE PARTIDO
// ========================================

export const generarPlanillaPartidoSchema = {
  params: objectIdSchema,
};

// ========================================
// GENERAR TABLA DE POSICIONES
// ========================================

export const generarTablaPosicionesSchema = {
  params: objectIdSchema,
};

// ========================================
// GENERAR ACTA DE PARTIDO
// ========================================

export const generarActaPartidoSchema = {
  params: objectIdSchema,
};
