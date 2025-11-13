import jwt from 'jsonwebtoken';
import { Usuario, IUsuarioDocument } from '@/features/usuarios/models/usuario.model';
import { ApiError } from '@/core/utils/ApiError';
import { ERRORES } from '@/core/config/constants';
import { RolUsuario } from '@/shared/types/enums';
import mongoose from 'mongoose';

// ========================================
// INTERFACES
// ========================================

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  rol: RolUsuario;
  equipoId?: string;
}

interface AuthResponse {
  usuario: {
    id: string;
    email: string;
    nombre: string;
    apellido: string;
    rol: RolUsuario;
    equipoId?: string;
  };
  token: string;
}

// ========================================
// HELPER: GENERAR JWT
// ========================================

const generateToken = (id: string, rol: string): string => {
  const jwtSecret = process.env.JWT_SECRET;
  const jwtExpire = process.env.JWT_EXPIRE || '7d';

  if (!jwtSecret) {
    throw new Error('JWT_SECRET no está configurado');
  }

  return jwt.sign({ id, rol }, jwtSecret, {
    expiresIn: jwtExpire,
  } as any);
};

// ========================================
// HELPER: FORMATO DE RESPUESTA
// ========================================

const formatAuthResponse = (usuario: IUsuarioDocument): AuthResponse => {
  const token = generateToken((usuario as any)._id.toString(), usuario.rol);

  return {
    usuario: {
      id: (usuario as any)._id.toString(),
      email: usuario.email,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      rol: usuario.rol,
      ...(usuario.equipoId && { equipoId: usuario.equipoId.toString() }),
    },
    token,
  };
};

// ========================================
// SERVICIOS
// ========================================

/**
 * Login de usuario
 */
export const login = async (data: LoginData): Promise<AuthResponse> => {
  const { email, password } = data;

  // Buscar usuario por email (con password)
  const usuario = await Usuario.findByEmail(email);

  if (!usuario) {
    throw ApiError.unauthorized(ERRORES.CREDENCIALES_INVALIDAS);
  }

  // Verificar contraseña
  const isPasswordValid = await usuario.comparePassword(password);

  if (!isPasswordValid) {
    throw ApiError.unauthorized(ERRORES.CREDENCIALES_INVALIDAS);
  }

  // Verificar que el usuario esté activo
  if (usuario.estado !== 'ACTIVO') {
    throw ApiError.forbidden('Usuario inactivo');
  }

  return formatAuthResponse(usuario);
};

/**
 * Registro de nuevo usuario
 */
export const register = async (data: RegisterData): Promise<AuthResponse> => {
  const { email, password, nombre, apellido, rol, equipoId } = data;

  // Verificar si el email ya existe
  const existingUser = await Usuario.findOne({ email: email.toLowerCase() });

  if (existingUser) {
    throw ApiError.conflict(ERRORES.EMAIL_DUPLICADO);
  }

  // Si es delegado, verificar que el equipo existe
  if (rol === RolUsuario.DELEGADO) {
    if (!equipoId) {
      throw ApiError.badRequest('El equipoId es requerido para delegados');
    }

    const Equipo = mongoose.model('Equipo');
    const equipo = await Equipo.findById(equipoId);

    if (!equipo) {
      throw ApiError.notFound(ERRORES.EQUIPO_NO_ENCONTRADO);
    }

    // Verificar que el equipo no tenga ya un delegado
    const existingDelegado = await Usuario.findOne({
      equipoId: new mongoose.Types.ObjectId(equipoId),
      rol: RolUsuario.DELEGADO,
    });

    if (existingDelegado) {
      throw ApiError.conflict('Este equipo ya tiene un delegado asignado');
    }
  }

  // Crear usuario
  const usuario = await Usuario.create({
    email: email.toLowerCase(),
    password,
    nombre,
    apellido,
    rol,
    ...(equipoId && { equipoId: new mongoose.Types.ObjectId(equipoId) }),
  });

  // Si es delegado, actualizar el equipo
  if (rol === RolUsuario.DELEGADO && equipoId) {
    const Equipo = mongoose.model('Equipo');
    await Equipo.findByIdAndUpdate(equipoId, {
      delegadoId: usuario._id,
    });
  }

  return formatAuthResponse(usuario);
};

/**
 * Obtener perfil del usuario autenticado
 */
export const getProfile = async (userId: string): Promise<IUsuarioDocument> => {
  const usuario = await Usuario.findById(userId).populate('equipoId', 'nombre escudo');

  if (!usuario) {
    throw ApiError.notFound(ERRORES.USUARIO_NO_ENCONTRADO);
  }

  return usuario;
};

/**
 * Cambiar contraseña
 */
export const changePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<void> => {
  // Buscar usuario con password
  const usuario = await Usuario.findById(userId).select('+password');

  if (!usuario) {
    throw ApiError.notFound(ERRORES.USUARIO_NO_ENCONTRADO);
  }

  // Verificar contraseña actual
  const isPasswordValid = await usuario.comparePassword(currentPassword);

  if (!isPasswordValid) {
    throw ApiError.unauthorized('La contraseña actual es incorrecta');
  }

  // Actualizar contraseña
  usuario.password = newPassword;
  await usuario.save();
};

/**
 * Verificar token
 */
export const verifyToken = async (token: string): Promise<IUsuarioDocument> => {
  try {
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      throw new Error('JWT_SECRET no está configurado');
    }

    const decoded = jwt.verify(token, jwtSecret) as { id: string; rol: string };

    const usuario = await Usuario.findById(decoded.id);

    if (!usuario) {
      throw ApiError.unauthorized('Usuario no encontrado');
    }

    if (usuario.estado !== 'ACTIVO') {
      throw ApiError.forbidden('Usuario inactivo');
    }

    return usuario;
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw ApiError.unauthorized('Token inválido');
    }
    if (error instanceof jwt.TokenExpiredError) {
      throw ApiError.unauthorized('Token expirado');
    }
    throw error;
  }
};
