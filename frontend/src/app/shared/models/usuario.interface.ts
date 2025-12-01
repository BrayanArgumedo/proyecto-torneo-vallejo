import { Rol, EstadoUsuario } from './enums';

/**
 * 👥 USUARIO
 * Interfaz que representa un usuario del sistema (Admin o Delegado)
 */
export interface Usuario {
  _id: string;
  email: string;
  nombre: string;
  apellido: string;
  rol: Rol;
  equipoId?: string;  // Solo si es DELEGADO
  estado: EstadoUsuario;
  createdAt: string;
  updatedAt: string;
}

/**
 * DTO para crear/actualizar usuario
 */
export interface UsuarioFormData {
  email: string;
  password?: string;
  nombre: string;
  apellido: string;
  rol: Rol;
  equipoId?: string;
  estado?: EstadoUsuario;
}

/**
 * Response de autenticación
 */
export interface AuthResponse {
  success: boolean;
  data: {
    token: string;
    usuario: Usuario;
  };
}

/**
 * Credenciales de login
 */
export interface LoginCredentials {
  email: string;
  password: string;
}
