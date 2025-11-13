import Joi from 'joi';
import { RolUsuario, EstadoUsuario } from '@/shared/types/enums';

// ========================================
// CREAR USUARIO
// ========================================

export const createUsuarioSchema = {
  body: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'El email debe ser válido',
      'any.required': 'El email es requerido',
    }),
    password: Joi.string().min(6).required().messages({
      'string.min': 'La contraseña debe tener al menos 6 caracteres',
      'any.required': 'La contraseña es requerida',
    }),
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
    rol: Joi.string()
      .valid(...Object.values(RolUsuario))
      .required()
      .messages({
        'any.only': 'El rol debe ser ADMIN o DELEGADO',
        'any.required': 'El rol es requerido',
      }),
    equipoId: Joi.string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .when('rol', {
        is: RolUsuario.DELEGADO,
        then: Joi.required(),
        otherwise: Joi.forbidden(),
      })
      .messages({
        'string.pattern.base': 'El ID del equipo debe ser un ObjectId válido',
        'any.required': 'El ID del equipo es requerido para delegados',
      }),
    estado: Joi.string()
      .valid(...Object.values(EstadoUsuario))
      .optional()
      .messages({
        'any.only': 'El estado debe ser ACTIVO o INACTIVO',
      }),
  }),
};

// ========================================
// ACTUALIZAR USUARIO
// ========================================

export const updateUsuarioSchema = {
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
    email: Joi.string().email().optional().messages({
      'string.email': 'El email debe ser válido',
    }),
    nombre: Joi.string().min(2).max(50).optional().messages({
      'string.min': 'El nombre debe tener al menos 2 caracteres',
      'string.max': 'El nombre no puede exceder 50 caracteres',
    }),
    apellido: Joi.string().min(2).max(50).optional().messages({
      'string.min': 'El apellido debe tener al menos 2 caracteres',
      'string.max': 'El apellido no puede exceder 50 caracteres',
    }),
    rol: Joi.string()
      .valid(...Object.values(RolUsuario))
      .optional()
      .messages({
        'any.only': 'El rol debe ser ADMIN o DELEGADO',
      }),
    equipoId: Joi.string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .optional()
      .messages({
        'string.pattern.base': 'El ID del equipo debe ser un ObjectId válido',
      }),
    estado: Joi.string()
      .valid(...Object.values(EstadoUsuario))
      .optional()
      .messages({
        'any.only': 'El estado debe ser ACTIVO o INACTIVO',
      }),
  }).min(1),
};

// ========================================
// OBTENER/ELIMINAR USUARIO POR ID
// ========================================

export const usuarioIdSchema = {
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
