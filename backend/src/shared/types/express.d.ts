import { IUsuarioDocument } from '../../features/usuarios/models/usuario.model';

declare global {
  namespace Express {
    interface Request {
      user?: IUsuarioDocument;
    }
  }
}

export {};
