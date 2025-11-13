import Joi from 'joi';
import {
  TipoJugador,
  EstadoValidacion,
  TipoDocumento,
  Posicion,
} from '@/shared/types/enums';
import { REGLAMENTO } from '@/core/config/constants';

// ========================================
// CREAR JUGADOR
// ========================================

export const createJugadorSchema = {
  body: Joi.object({
    nombre: Joi.string().min(2).max(50).required().messages({
      'string.min': 'El nombre debe tener al menos 2 caracteres',
      'string.max': 'El nombre no puede exceder 50 caracteres',
      'any.required': 'El nombre es requerido',
    }),
    apellido: Joi.string().min(2).max(50).required().messages({
      'string.min': 'El apellido debe tener al menos 2 caracteres',
      'string.max': 'El apellido no puede exceder 50 caracteres',
      'any.required': 'El apellido es requerido',
    }),
    cedula: Joi.string()
      .pattern(/^[0-9]{6,15}$/)
      .required()
      .messages({
        'string.pattern.base': 'La cédula debe tener entre 6 y 15 dígitos',
        'any.required': 'La cédula es requerida',
      }),
    fechaNacimiento: Joi.date().max('now').required().messages({
      'date.max': 'La fecha de nacimiento no puede ser futura',
      'any.required': 'La fecha de nacimiento es requerida',
    }),
    telefono: Joi.string()
      .pattern(/^[0-9]{7,15}$/)
      .required()
      .messages({
        'string.pattern.base': 'El teléfono debe tener entre 7 y 15 dígitos',
        'any.required': 'El teléfono es requerido',
      }),
    email: Joi.string().email().optional().messages({
      'string.email': 'El email debe ser válido',
    }),
    direccion: Joi.string().max(200).required().messages({
      'string.max': 'La dirección no puede exceder 200 caracteres',
      'any.required': 'La dirección es requerida',
    }),
    foto: Joi.string().uri().optional().messages({
      'string.uri': 'La foto debe ser una URL válida',
    }),
    posicion: Joi.string()
      .valid(...Object.values(Posicion))
      .required()
      .messages({
        'any.only': `La posición debe ser una de: ${Object.values(Posicion).join(', ')}`,
        'any.required': 'La posición es requerida',
      }),
    numeroCamiseta: Joi.number()
      .integer()
      .min(REGLAMENTO.NUMERO_CAMISETA_MIN)
      .max(REGLAMENTO.NUMERO_CAMISETA_MAX)
      .required()
      .messages({
        'number.min': `El número de camiseta debe ser al menos ${REGLAMENTO.NUMERO_CAMISETA_MIN}`,
        'number.max': `El número de camiseta no puede exceder ${REGLAMENTO.NUMERO_CAMISETA_MAX}`,
        'any.required': 'El número de camiseta es requerido',
      }),
    tipo: Joi.string()
      .valid(...Object.values(TipoJugador))
      .required()
      .messages({
        'any.only': `El tipo de jugador debe ser uno de: ${Object.values(TipoJugador).join(', ')}`,
        'any.required': 'El tipo de jugador es requerido',
      }),
    equipoId: Joi.string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .required()
      .messages({
        'string.pattern.base': 'El ID del equipo debe ser un ObjectId válido',
        'any.required': 'El equipo es requerido',
      }),
    documentos: Joi.array()
      .items(
        Joi.object({
          tipo: Joi.string()
            .valid(...Object.values(TipoDocumento))
            .required(),
          url: Joi.string().uri().required(),
          nombreArchivo: Joi.string().required(),
        })
      )
      .optional(),
  }),
};

// ========================================
// ACTUALIZAR JUGADOR
// ========================================

export const updateJugadorSchema = {
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
    nombre: Joi.string().min(2).max(50).optional().messages({
      'string.min': 'El nombre debe tener al menos 2 caracteres',
      'string.max': 'El nombre no puede exceder 50 caracteres',
    }),
    apellido: Joi.string().min(2).max(50).optional().messages({
      'string.min': 'El apellido debe tener al menos 2 caracteres',
      'string.max': 'El apellido no puede exceder 50 caracteres',
    }),
    fechaNacimiento: Joi.date().max('now').optional().messages({
      'date.max': 'La fecha de nacimiento no puede ser futura',
    }),
    telefono: Joi.string()
      .pattern(/^[0-9]{7,15}$/)
      .optional()
      .messages({
        'string.pattern.base': 'El teléfono debe tener entre 7 y 15 dígitos',
      }),
    email: Joi.string().email().optional().messages({
      'string.email': 'El email debe ser válido',
    }),
    direccion: Joi.string().max(200).optional().messages({
      'string.max': 'La dirección no puede exceder 200 caracteres',
    }),
    foto: Joi.string().uri().optional().messages({
      'string.uri': 'La foto debe ser una URL válida',
    }),
    posicion: Joi.string()
      .valid(...Object.values(Posicion))
      .optional()
      .messages({
        'any.only': `La posición debe ser una de: ${Object.values(Posicion).join(', ')}`,
      }),
    numeroCamiseta: Joi.number()
      .integer()
      .min(REGLAMENTO.NUMERO_CAMISETA_MIN)
      .max(REGLAMENTO.NUMERO_CAMISETA_MAX)
      .optional()
      .messages({
        'number.min': `El número de camiseta debe ser al menos ${REGLAMENTO.NUMERO_CAMISETA_MIN}`,
        'number.max': `El número de camiseta no puede exceder ${REGLAMENTO.NUMERO_CAMISETA_MAX}`,
      }),
    tipo: Joi.string()
      .valid(...Object.values(TipoJugador))
      .optional()
      .messages({
        'any.only': `El tipo de jugador debe ser uno de: ${Object.values(TipoJugador).join(', ')}`,
      }),
  }).min(1),
};

// ========================================
// VALIDAR/RECHAZAR JUGADOR
// ========================================

export const validarJugadorSchema = {
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
    estadoValidacion: Joi.string()
      .valid(EstadoValidacion.VALIDADO, EstadoValidacion.RECHAZADO)
      .required()
      .messages({
        'any.only': 'El estado debe ser VALIDADO o RECHAZADO',
        'any.required': 'El estado de validación es requerido',
      }),
    observaciones: Joi.string().max(500).optional().messages({
      'string.max': 'Las observaciones no pueden exceder 500 caracteres',
    }),
  }),
};

// ========================================
// AGREGAR DOCUMENTO
// ========================================

export const agregarDocumentoSchema = {
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
    tipo: Joi.string()
      .valid(...Object.values(TipoDocumento))
      .required()
      .messages({
        'any.only': `El tipo debe ser uno de: ${Object.values(TipoDocumento).join(', ')}`,
        'any.required': 'El tipo de documento es requerido',
      }),
    url: Joi.string().uri().required().messages({
      'string.uri': 'La URL debe ser válida',
      'any.required': 'La URL es requerida',
    }),
    nombreArchivo: Joi.string().required().messages({
      'any.required': 'El nombre del archivo es requerido',
    }),
  }),
};

// ========================================
// OBTENER/ELIMINAR JUGADOR POR ID
// ========================================

export const jugadorIdSchema = {
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
// OBTENER JUGADORES POR EQUIPO
// ========================================

export const jugadoresPorEquipoSchema = {
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
