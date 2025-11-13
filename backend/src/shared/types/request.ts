import { Request } from 'express';
import { IUsuarioDocument } from '../../features/usuarios/models/usuario.model';

/**
 * Extended Request interface with authenticated user
 */
export interface AuthRequest extends Request {
  user?: IUsuarioDocument;
}
