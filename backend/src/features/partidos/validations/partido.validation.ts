import Joi from 'joi';
import { EstadoPartido } from '@/shared/types/enums';

// ========================================
// CREAR PARTIDO
// ========================================

export const createPartidoSchema = {
  body: Joi.object({
    torneoId: Joi.string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({
        'string.pattern.base': 'El ID del torneo debe ser un ObjectId válido',
        'any.required': 'El torneo es requerido',
      }),
    faseId: Joi.string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({
        'string.pattern.base': 'El ID de la fase debe ser un ObjectId válido',
        'any.required': 'La fase es requerida',
      }),
    equipoLocal: Joi.string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({
        'string.pattern.base': 'El ID del equipo local debe ser un ObjectId válido',
        'any.required': 'El equipo local es requerido',
      }),
    equipoVisitante: Joi.string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .required()
      .invalid(Joi.ref('equipoLocal'))
      .messages({
        'string.pattern.base': 'El ID del equipo visitante debe ser un ObjectId válido',
        'any.required': 'El equipo visitante es requerido',
        'any.invalid': 'El equipo local y visitante no pueden ser el mismo',
      }),
    fecha: Joi.date().optional(),
    cancha: Joi.string().max(100).optional().messages({
      'string.max': 'El nombre de la cancha no puede exceder 100 caracteres',
    }),
    jornada: Joi.number().integer().min(1).optional().messages({
      'number.min': 'La jornada debe ser mayor a 0',
    }),
    grupo: Joi.string()
      .uppercase()
      .pattern(/^[A-Z]$/)
      .optional()
      .messages({
        'string.pattern.base': 'El grupo debe ser una letra mayúscula',
      }),
    esEliminacion: Joi.boolean().default(false),
    arbitro: Joi.string().max(100).optional().messages({
      'string.max': 'El nombre del árbitro no puede exceder 100 caracteres',
    }),
    observaciones: Joi.string().max(500).optional().messages({
      'string.max': 'Las observaciones no pueden exceder 500 caracteres',
    }),
  }),
};

// ========================================
// ACTUALIZAR PARTIDO
// ========================================

export const updatePartidoSchema = {
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
    fecha: Joi.date().optional(),
    cancha: Joi.string().max(100).optional().messages({
      'string.max': 'El nombre de la cancha no puede exceder 100 caracteres',
    }),
    jornada: Joi.number().integer().min(1).optional().messages({
      'number.min': 'La jornada debe ser mayor a 0',
    }),
    estado: Joi.string()
      .valid(...Object.values(EstadoPartido))
      .optional()
      .messages({
        'any.only': `El estado debe ser uno de: ${Object.values(EstadoPartido).join(', ')}`,
      }),
    arbitro: Joi.string().max(100).optional().messages({
      'string.max': 'El nombre del árbitro no puede exceder 100 caracteres',
    }),
    observaciones: Joi.string().max(500).optional().messages({
      'string.max': 'Las observaciones no pueden exceder 500 caracteres',
    }),
  }).min(1),
};

// ========================================
// REGISTRAR GOL
// ========================================

export const registrarGolSchema = {
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
    jugadorId: Joi.string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({
        'string.pattern.base': 'El ID del jugador debe ser un ObjectId válido',
        'any.required': 'El jugador es requerido',
      }),
    minuto: Joi.number().integer().min(0).max(120).required().messages({
      'number.min': 'El minuto debe ser mayor o igual a 0',
      'number.max': 'El minuto no puede exceder 120',
      'any.required': 'El minuto es requerido',
    }),
    esAutogol: Joi.boolean().default(false),
  }),
};

// ========================================
// REGISTRAR TARJETA
// ========================================

export const registrarTarjetaSchema = {
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
    jugadorId: Joi.string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({
        'string.pattern.base': 'El ID del jugador debe ser un ObjectId válido',
        'any.required': 'El jugador es requerido',
      }),
    minuto: Joi.number().integer().min(0).max(120).required().messages({
      'number.min': 'El minuto debe ser mayor o igual a 0',
      'number.max': 'El minuto no puede exceder 120',
      'any.required': 'El minuto es requerido',
    }),
    tipo: Joi.string().valid('AMARILLA', 'ROJA').required().messages({
      'any.only': 'El tipo debe ser AMARILLA o ROJA',
      'any.required': 'El tipo de tarjeta es requerido',
    }),
  }),
};

// ========================================
// FINALIZAR PARTIDO
// ========================================

export const finalizarPartidoSchema = {
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
    golesLocal: Joi.number().integer().min(0).required().messages({
      'number.min': 'Los goles del local deben ser mayor o igual a 0',
      'any.required': 'Los goles del local son requeridos',
    }),
    golesVisitante: Joi.number().integer().min(0).required().messages({
      'number.min': 'Los goles del visitante deben ser mayor o igual a 0',
      'any.required': 'Los goles del visitante son requeridos',
    }),
    ganadorPenales: Joi.string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .optional()
      .messages({
        'string.pattern.base': 'El ID del ganador por penales debe ser un ObjectId válido',
      }),
  }),
};

// ========================================
// CANCELAR PARTIDO
// ========================================

export const cancelarPartidoSchema = {
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
    motivo: Joi.string().max(500).required().messages({
      'string.max': 'El motivo no puede exceder 500 caracteres',
      'any.required': 'El motivo es requerido',
    }),
  }),
};

// ========================================
// OBTENER/ELIMINAR PARTIDO POR ID
// ========================================

export const partidoIdSchema = {
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
// OBTENER PARTIDOS POR FASE
// ========================================

export const partidosPorFaseSchema = {
  params: Joi.object({
    faseId: Joi.string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({
        'string.pattern.base': 'El ID de la fase debe ser un ObjectId válido',
        'any.required': 'El ID de la fase es requerido',
      }),
  }),
};

// ========================================
// OBTENER PARTIDOS POR EQUIPO
// ========================================

export const partidosPorEquipoSchema = {
  params: Joi.object({
    equipoId: Joi.string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({
        'string.pattern.base': 'El ID del equipo debe ser un ObjectId válido',
        'any.required': 'El ID del equipo es requerido',
      }),
  }),
};
