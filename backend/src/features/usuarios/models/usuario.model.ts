import mongoose, { Document, Model, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { RolUsuario, EstadoUsuario } from '@/shared/types/enums';

// ========================================
// INTERFACE
// ========================================

export interface IUsuario {
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  rol: RolUsuario;
  equipoId?: mongoose.Types.ObjectId; // Solo si es DELEGADO
  estado: EstadoUsuario;
  createdAt: Date;
  updatedAt: Date;
}

// Interface del documento (con métodos de instancia)
export interface IUsuarioDocument extends IUsuario, Document {
  comparePassword(candidatePassword: string): Promise<boolean>;
  getNombreCompleto(): string;
}

// Interface del modelo (con métodos estáticos)
export interface IUsuarioModel extends Model<IUsuarioDocument> {
  findByEmail(email: string): Promise<IUsuarioDocument | null>;
}

// ========================================
// SCHEMA
// ========================================

const usuarioSchema = new Schema<IUsuarioDocument, IUsuarioModel>(
  {
    email: {
      type: String,
      required: [true, 'El email es requerido'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Email inválido'],
    },
    password: {
      type: String,
      required: [true, 'La contraseña es requerida'],
      minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
      select: false, // No devolver password por defecto en queries
    },
    nombre: {
      type: String,
      required: [true, 'El nombre es requerido'],
      trim: true,
      minlength: [2, 'El nombre debe tener al menos 2 caracteres'],
      maxlength: [50, 'El nombre no puede exceder 50 caracteres'],
    },
    apellido: {
      type: String,
      required: [true, 'El apellido es requerido'],
      trim: true,
      minlength: [2, 'El apellido debe tener al menos 2 caracteres'],
      maxlength: [50, 'El apellido no puede exceder 50 caracteres'],
    },
    rol: {
      type: String,
      enum: Object.values(RolUsuario),
      required: [true, 'El rol es requerido'],
    },
    equipoId: {
      type: Schema.Types.ObjectId,
      ref: 'Equipo',
      required: function (this: IUsuarioDocument) {
        return this.rol === RolUsuario.DELEGADO;
      },
    },
    estado: {
      type: String,
      enum: Object.values(EstadoUsuario),
      default: EstadoUsuario.ACTIVO,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        delete (ret as any).password;
        return ret;
      },
    },
  }
);

// ========================================
// INDEXES
// ========================================

usuarioSchema.index({ email: 1 });
usuarioSchema.index({ rol: 1 });
usuarioSchema.index({ equipoId: 1 });

// ========================================
// MIDDLEWARES
// ========================================

// Hash password antes de guardar
usuarioSchema.pre('save', async function (next) {
  // Solo hashear si el password fue modificado
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// ========================================
// MÉTODOS DE INSTANCIA
// ========================================

// Comparar password
usuarioSchema.methods.comparePassword = async function (
  this: IUsuarioDocument,
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Obtener nombre completo
usuarioSchema.methods.getNombreCompleto = function (this: IUsuarioDocument): string {
  return `${this.nombre} ${this.apellido}`;
};

// ========================================
// MÉTODOS ESTÁTICOS
// ========================================

// Buscar por email
usuarioSchema.statics.findByEmail = function (
  this: IUsuarioModel,
  email: string
): Promise<IUsuarioDocument | null> {
  return this.findOne({ email: email.toLowerCase() }).select('+password');
};

// ========================================
// EXPORT
// ========================================

export const Usuario = mongoose.model<IUsuarioDocument, IUsuarioModel>(
  'Usuario',
  usuarioSchema
);
