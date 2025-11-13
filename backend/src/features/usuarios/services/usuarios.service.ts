import { Usuario, IUsuarioDocument } from '@/features/usuarios/models/usuario.model';
import { ApiError } from '@/core/utils/ApiError';
import { ERRORES } from '@/core/config/constants';
import { RolUsuario, EstadoUsuario } from '@/shared/types/enums';
import mongoose from 'mongoose';

// ========================================
// INTERFACES
// ========================================

interface CreateUsuarioData {
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  rol: RolUsuario;
  equipoId?: string;
  estado?: EstadoUsuario;
}

interface UpdateUsuarioData {
  email?: string;
  nombre?: string;
  apellido?: string;
  rol?: RolUsuario;
  equipoId?: string;
  estado?: EstadoUsuario;
}

// ========================================
// SERVICIOS
// ========================================

/**
 * Obtener todos los usuarios
 */
export const getAllUsuarios = async (): Promise<IUsuarioDocument[]> => {
  const usuarios = await Usuario.find().populate('equipoId', 'nombre escudo').sort({ createdAt: -1 });
  return usuarios;
};

/**
 * Obtener usuario por ID
 */
export const getUsuarioById = async (id: string): Promise<IUsuarioDocument> => {
  const usuario = await Usuario.findById(id).populate('equipoId', 'nombre escudo');

  if (!usuario) {
    throw ApiError.notFound(ERRORES.USUARIO_NO_ENCONTRADO);
  }

  return usuario;
};

/**
 * Crear nuevo usuario
 */
export const createUsuario = async (data: CreateUsuarioData): Promise<IUsuarioDocument> => {
  const { email, password, nombre, apellido, rol, equipoId, estado } = data;

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
    ...(estado && { estado }),
  });

  // Si es delegado, actualizar el equipo
  if (rol === RolUsuario.DELEGADO && equipoId) {
    const Equipo = mongoose.model('Equipo');
    await Equipo.findByIdAndUpdate(equipoId, {
      delegadoId: usuario._id,
    });
  }

  return usuario;
};

/**
 * Actualizar usuario
 */
export const updateUsuario = async (
  id: string,
  data: UpdateUsuarioData
): Promise<IUsuarioDocument> => {
  const { email, nombre, apellido, rol, equipoId, estado } = data;

  // Verificar que el usuario existe
  const usuario = await Usuario.findById(id);

  if (!usuario) {
    throw ApiError.notFound(ERRORES.USUARIO_NO_ENCONTRADO);
  }

  // Si se está actualizando el email, verificar que no exista
  if (email && email.toLowerCase() !== usuario.email) {
    const existingUser = await Usuario.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      throw ApiError.conflict(ERRORES.EMAIL_DUPLICADO);
    }
  }

  // Si se está cambiando a delegado o actualizando equipoId
  if ((rol === RolUsuario.DELEGADO || usuario.rol === RolUsuario.DELEGADO) && equipoId) {
    const Equipo = mongoose.model('Equipo');
    const equipo = await Equipo.findById(equipoId);

    if (!equipo) {
      throw ApiError.notFound(ERRORES.EQUIPO_NO_ENCONTRADO);
    }

    // Verificar que el equipo no tenga otro delegado
    const existingDelegado = await Usuario.findOne({
      equipoId: new mongoose.Types.ObjectId(equipoId),
      rol: RolUsuario.DELEGADO,
      _id: { $ne: id },
    });

    if (existingDelegado) {
      throw ApiError.conflict('Este equipo ya tiene un delegado asignado');
    }
  }

  // Actualizar campos
  if (email) usuario.email = email.toLowerCase();
  if (nombre) usuario.nombre = nombre;
  if (apellido) usuario.apellido = apellido;
  if (rol) usuario.rol = rol;
  if (equipoId !== undefined) {
    usuario.equipoId = equipoId ? new mongoose.Types.ObjectId(equipoId) : undefined;
  }
  if (estado) usuario.estado = estado;

  await usuario.save();

  // Si se actualizó el equipo de un delegado, actualizar el equipo
  if (usuario.rol === RolUsuario.DELEGADO && equipoId) {
    const Equipo = mongoose.model('Equipo');
    await Equipo.findByIdAndUpdate(equipoId, {
      delegadoId: usuario._id,
    });
  }

  return usuario.populate('equipoId', 'nombre escudo');
};

/**
 * Eliminar usuario
 */
export const deleteUsuario = async (id: string): Promise<void> => {
  const usuario = await Usuario.findById(id);

  if (!usuario) {
    throw ApiError.notFound(ERRORES.USUARIO_NO_ENCONTRADO);
  }

  // Si es delegado, limpiar la referencia en el equipo
  if (usuario.rol === RolUsuario.DELEGADO && usuario.equipoId) {
    const Equipo = mongoose.model('Equipo');
    await Equipo.findByIdAndUpdate(usuario.equipoId, {
      $unset: { delegadoId: 1 },
    });
  }

  await Usuario.findByIdAndDelete(id);
};

/**
 * Obtener usuarios por rol
 */
export const getUsuariosByRol = async (rol: RolUsuario): Promise<IUsuarioDocument[]> => {
  const usuarios = await Usuario.find({ rol })
    .populate('equipoId', 'nombre escudo')
    .sort({ nombre: 1 });

  return usuarios;
};

/**
 * Activar/Desactivar usuario
 */
export const toggleUsuarioEstado = async (id: string): Promise<IUsuarioDocument> => {
  const usuario = await Usuario.findById(id);

  if (!usuario) {
    throw ApiError.notFound(ERRORES.USUARIO_NO_ENCONTRADO);
  }

  usuario.estado =
    usuario.estado === EstadoUsuario.ACTIVO ? EstadoUsuario.INACTIVO : EstadoUsuario.ACTIVO;

  await usuario.save();

  return usuario.populate('equipoId', 'nombre escudo');
};
