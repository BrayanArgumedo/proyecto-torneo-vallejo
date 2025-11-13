import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { ApiError } from '@/core/utils/ApiError';

/**
 * Middleware para validar request usando esquemas de Joi
 */
export const validate = (schema: {
  body?: Joi.ObjectSchema;
  params?: Joi.ObjectSchema;
  query?: Joi.ObjectSchema;
}) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const validationErrors: string[] = [];

    // Validar body
    if (schema.body) {
      const { error } = schema.body.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });

      if (error) {
        error.details.forEach((detail) => {
          validationErrors.push(detail.message);
        });
      }
    }

    // Validar params
    if (schema.params) {
      const { error } = schema.params.validate(req.params, {
        abortEarly: false,
      });

      if (error) {
        error.details.forEach((detail) => {
          validationErrors.push(detail.message);
        });
      }
    }

    // Validar query
    if (schema.query) {
      const { error } = schema.query.validate(req.query, {
        abortEarly: false,
      });

      if (error) {
        error.details.forEach((detail) => {
          validationErrors.push(detail.message);
        });
      }
    }

    // Si hay errores, retornar bad request
    if (validationErrors.length > 0) {
      return next(ApiError.badRequest(validationErrors.join(', ')));
    }

    next();
  };
};
