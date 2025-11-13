import Joi from 'joi';
import { EstadoTorneo, FormatoFase } from '@/shared/types/enums';

// ========================================
// CREAR TORNEO
// ========================================

export const createTorneoSchema = {
  body: Joi.object({
    nombre: Joi.string().min(3).max(100).required().messages({
      'string.min': 'El nombre debe tener al menos 3 caracteres',
      'string.max': 'El nombre no puede exceder 100 caracteres',
      'any.required': 'El nombre es requerido',
    }),
    descripcion: Joi.string().max(500).optional().messages({
      'string.max': 'La descripción no puede exceder 500 caracteres',
    }),
    fechaInicio: Joi.date().required().messages({
      'any.required': 'La fecha de inicio es requerida',
    }),
    fechaFin: Joi.date().greater(Joi.ref('fechaInicio')).optional().messages({
      'date.greater': 'La fecha de fin debe ser posterior a la fecha de inicio',
    }),
    año: Joi.number().integer().min(2020).max(2100).optional().messages({
      'number.min': 'El año debe ser mayor o igual a 2020',
      'number.max': 'El año debe ser menor o igual a 2100',
    }),
    reglamento: Joi.string().uri().optional().messages({
      'string.uri': 'El reglamento debe ser una URL válida',
    }),
    premios: Joi.object({
      primerLugar: Joi.string().optional(),
      segundoLugar: Joi.string().optional(),
      tercerLugar: Joi.string().optional(),
      otros: Joi.array().items(Joi.string()).optional(),
    }).optional(),
  }),
};

// ========================================
// ACTUALIZAR TORNEO
// ========================================

export const updateTorneoSchema = {
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
    nombre: Joi.string().min(3).max(100).optional().messages({
      'string.min': 'El nombre debe tener al menos 3 caracteres',
      'string.max': 'El nombre no puede exceder 100 caracteres',
    }),
    descripcion: Joi.string().max(500).optional().messages({
      'string.max': 'La descripción no puede exceder 500 caracteres',
    }),
    fechaInicio: Joi.date().optional(),
    fechaFin: Joi.date().optional(),
    estado: Joi.string()
      .valid(...Object.values(EstadoTorneo))
      .optional()
      .messages({
        'any.only': `El estado debe ser uno de: ${Object.values(EstadoTorneo).join(', ')}`,
      }),
    reglamento: Joi.string().uri().optional().messages({
      'string.uri': 'El reglamento debe ser una URL válida',
    }),
    premios: Joi.object({
      primerLugar: Joi.string().optional(),
      segundoLugar: Joi.string().optional(),
      tercerLugar: Joi.string().optional(),
      otros: Joi.array().items(Joi.string()).optional(),
    }).optional(),
  }).min(1),
};

// ========================================
// AGREGAR EQUIPO AL TORNEO
// ========================================

export const agregarEquipoSchema = {
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
    equipoId: Joi.string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({
        'string.pattern.base': 'El ID del equipo debe ser un ObjectId válido',
        'any.required': 'El ID del equipo es requerido',
      }),
  }),
};

// ========================================
// CREAR FASE
// ========================================

export const createFaseSchema = {
  body: Joi.object({
    nombre: Joi.string().min(3).max(100).required().messages({
      'string.min': 'El nombre debe tener al menos 3 caracteres',
      'string.max': 'El nombre no puede exceder 100 caracteres',
      'any.required': 'El nombre es requerido',
    }),
    descripcion: Joi.string().max(500).optional().messages({
      'string.max': 'La descripción no puede exceder 500 caracteres',
    }),
    tipo: Joi.string()
      .valid(...Object.values(FormatoFase))
      .required()
      .messages({
        'any.only': `El tipo debe ser uno de: ${Object.values(FormatoFase).join(', ')}`,
        'any.required': 'El tipo de fase es requerido',
      }),
    orden: Joi.number().integer().min(1).required().messages({
      'number.min': 'El orden debe ser mayor o igual a 1',
      'any.required': 'El orden es requerido',
    }),
    torneoId: Joi.string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({
        'string.pattern.base': 'El ID del torneo debe ser un ObjectId válido',
        'any.required': 'El torneo es requerido',
      }),
    equiposParticipantes: Joi.array()
      .items(
        Joi.string()
          .regex(/^[0-9a-fA-F]{24}$/)
          .messages({
            'string.pattern.base': 'Los IDs de equipos deben ser ObjectIds válidos',
          })
      )
      .min(2)
      .optional()
      .messages({
        'array.min': 'Debe haber al menos 2 equipos participantes',
      }),
    configuracion: Joi.object({
      numeroGrupos: Joi.number().integer().min(1).optional(),
      equiposPorGrupo: Joi.number().integer().min(2).optional(),
      clasificadosPorGrupo: Joi.number().integer().min(1).optional(),
      partidoIdaVuelta: Joi.boolean().optional(),
      puntosVictoria: Joi.number().integer().min(1).default(3),
      puntosEmpate: Joi.number().integer().min(0).default(1),
      puntosDerrota: Joi.number().integer().min(0).default(0),
      criteriosDesempate: Joi.array()
        .items(
          Joi.string().valid(
            'PUNTOS',
            'DIFERENCIA_GOLES',
            'GOLES_FAVOR',
            'GOLES_CONTRA',
            'PARTIDOS_GANADOS',
            'ENFRENTAMIENTO_DIRECTO'
          )
        )
        .optional(),
    }).optional(),
    fechaInicio: Joi.date().optional(),
    fechaFin: Joi.date().greater(Joi.ref('fechaInicio')).optional().messages({
      'date.greater': 'La fecha de fin debe ser posterior a la fecha de inicio',
    }),
  }),
};

// ========================================
// GENERAR CALENDARIO
// ========================================

export const generarCalendarioSchema = {
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
// OBTENER/ELIMINAR POR ID
// ========================================

export const torneoIdSchema = {
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

export const faseIdSchema = {
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
