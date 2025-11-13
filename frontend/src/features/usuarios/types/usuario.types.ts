import { Rol } from '@/types/enums';

export interface Usuario {
  _id: string;
  email: string;
  nombre: string;
  rol: Rol;
  telefono?: string;
  equipoId?: string; // Solo para delegados
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUsuarioDTO {
  email: string;
  password: string;
  nombre: string;
  rol: Rol;
  telefono?: string;
}

export interface UpdateUsuarioDTO {
  nombre?: string;
  telefono?: string;
  activo?: boolean;
}
