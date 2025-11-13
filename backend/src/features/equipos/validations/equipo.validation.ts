import Joi from 'joi';
import { EstadoEquipo } from '@/shared/types/enums';

// ========================================
// CREAR EQUIPO
// ========================================

export const createEquipoSchema = {
  body: Joi.object({
    nombre: Joi.string().min(3).max(50).required().messages({
      'string.min': 'El nombre debe tener al menos 3 caracteres',
      'string.max': 'El nombre no puede exceder 50 caracteres',
      'any.required': 'El nombre es requerido',
    }),
    delegadoId: Joi.string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({
        'string.pattern.base': 'El ID del delegado debe ser un ObjectId válido',
        'any.required': 'El delegado es requerido',
      }),
    colores: Joi.object({
      principal: Joi.string().max(30).required().messages({
        'string.max': 'El color principal no puede exceder 30 caracteres',
        'any.required': 'El color principal es requerido',
      }),
      secundario: Joi.string().max(30).required().messages({
        'string.max': 'El color secundario no puede exceder 30 caracteres',
        'any.required': 'El color secundario es requerido',
      }),
    }).required(),
    escudo: Joi.string().uri().optional().messages({
      'string.uri': 'El escudo debe ser una URL válida',
    }),
    torneoId: Joi.string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .optional()
      .messages({
        'string.pattern.base': 'El ID del torneo debe ser un ObjectId válido',
      }),
  }),
};

// ========================================
// ACTUALIZAR EQUIPO
// ========================================

export const updateEquipoSchema = {
  params: Joi.object({
    id: Joi.string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({
        'string.pattern.base': 'El ID debe ser un ObjectId válido',
        'any.required': 'El ID es requerido',
      }),
  }),
  body: Joi.object({
    nombre: Joi.string().min(3).max(50).optional().messages({
      'string.min': 'El nombre debe tener al menos 3 caracteres',
      'string.max': 'El nombre no puede exceder 50 caracteres',
    }),
    delegadoId: Joi.string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .optional()
      .messages({
        'string.pattern.base': 'El ID del delegado debe ser un ObjectId válido',
      }),
    colores: Joi.object({
      principal: Joi.string().max(30).optional().messages({
        'string.max': 'El color principal no puede exceder 30 caracteres',
      }),
      secundario: Joi.string().max(30).optional().messages({
        'string.max': 'El color secundario no puede exceder 30 caracteres',
      }),
    }).optional(),
    escudo: Joi.string().uri().optional().messages({
      'string.uri': 'El escudo debe ser una URL válida',
    }),
    estado: Joi.string()
      .valid(...Object.values(EstadoEquipo))
      .optional()
      .messages({
        'any.only': `El estado debe ser uno de: ${Object.values(EstadoEquipo).join(', ')}`,
      }),
    torneoId: Joi.string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .optional()
      .allow(null)
      .messages({
        'string.pattern.base': 'El ID del torneo debe ser un ObjectId válido',
      }),
  }).min(1),
};

// ========================================
// OBTENER/ELIMINAR EQUIPO POR ID
// ========================================

export const equipoIdSchema = {
  params: Joi.object({
    id: Joi.string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({
        'string.pattern.base': 'El ID debe ser un ObjectId válido',
        'any.required': 'El ID es requerido',
      }),
  }),
};

// ========================================
// OBTENER ESTADÍSTICAS DEL EQUIPO
// ========================================

export const estadisticasEquipoSchema = {
  params: Joi.object({
    id: Joi.string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({
        'string.pattern.base': 'El ID debe ser un ObjectId válido',
        'any.required': 'El ID es requerido',
      }),
  }),
};
