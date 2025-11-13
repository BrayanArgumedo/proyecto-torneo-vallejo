import Joi from 'joi';
import { RolUsuario } from '@/shared/types/enums';

// ========================================
// LOGIN
// ========================================

export const loginSchema = {
  body: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'El email debe ser válido',
      'any.required': 'El email es requerido',
    }),
    password: Joi.string().min(6).required().messages({
      'string.min': 'La contraseña debe tener al menos 6 caracteres',
      'any.required': 'La contraseña es requerida',
    }),
  }),
};

// ========================================
// REGISTRO
// ========================================

export const registerSchema = {
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
        'any.unknown': 'Los administradores no deben tener equipoId',
      }),
  }),
};

// ========================================
// CAMBIAR CONTRASEÑA
// ========================================

export const changePasswordSchema = {
  body: Joi.object({
    currentPassword: Joi.string().required().messages({
      'any.required': 'La contraseña actual es requerida',
    }),
    newPassword: Joi.string().min(6).required().messages({
      'string.min': 'La nueva contraseña debe tener al menos 6 caracteres',
      'any.required': 'La nueva contraseña es requerida',
    }),
  }),
};
