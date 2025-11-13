import mongoose, { Document, Model, Schema } from 'mongoose';
import {
  TipoJugador,
  EstadoValidacion,
  TipoDocumento,
  Posicion,
} from '@/shared/types/enums';
import { IDocumento } from '@/shared/types/interfaces';

// ========================================
// INTERFACE
// ========================================

export interface IJugador {
  // Datos personales
  nombre: string;
  apellido: string;
  cedula: string;
  fechaNacimiento: Date;
  telefono: string;
  email?: string;
  direccion: string;
  foto?: string; // URL en Cloudinary

  // Datos deportivos
  posicion: Posicion;
  numeroCamiseta: number;
  tipo: TipoJugador;

  // Relación con equipo
  equipoId: mongoose.Types.ObjectId;

  // Documentos
  documentos: IDocumento[];

  // Validación
  estadoValidacion: EstadoValidacion;
  observaciones?: string;
  validadoPor?: mongoose.Types.ObjectId;
  fechaValidacion?: Date;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

// Interface del documento (con métodos de instancia)
export interface IJugadorDocument extends IJugador, Document {
  calcularEdad(): number;
  esExtranjero(): boolean;
  getNombreCompleto(): string;
  tieneDocumentosTipo(tipo: TipoDocumento): boolean;
  validarReglamento(): Promise<{ valido: boolean; errores: string[] }>;
}

// Interface del modelo (con métodos estáticos)
export interface IJugadorModel extends Model<IJugadorDocument> {
  findByCedula(cedula: string): Promise<IJugadorDocument | null>;
  findByEquipo(equipoId: string): Promise<IJugadorDocument[]>;
  findPendientesValidacion(): Promise<IJugadorDocument[]>;
  contarPorTipo(equipoId: string, tipo: TipoJugador): Promise<number>;
}

// ========================================
// SCHEMA
// ========================================

const jugadorSchema = new Schema<IJugadorDocument, IJugadorModel>(
  {
    // Datos personales
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
    cedula: {
      type: String,
      required: [true, 'La cédula es requerida'],
      unique: true,
      trim: true,
      match: [/^[0-9]{6,15}$/, 'Cédula inválida'],
    },
    fechaNacimiento: {
      type: Date,
      required: [true, 'La fecha de nacimiento es requerida'],
      validate: {
        validator: function (fecha: Date) {
          const edad = Math.floor(
            (Date.now() - fecha.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
          );
          return edad >= 16 && edad <= 60;
        },
        message: 'El jugador debe tener entre 16 y 60 años',
      },
    },
    telefono: {
      type: String,
      required: [true, 'El teléfono es requerido'],
      trim: true,
      match: [/^[0-9]{7,15}$/, 'Teléfono inválido'],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Email inválido'],
    },
    direccion: {
      type: String,
      required: [true, 'La dirección es requerida'],
      trim: true,
      maxlength: [200, 'La dirección no puede exceder 200 caracteres'],
    },
    foto: {
      type: String,
      trim: true,
    },

    // Datos deportivos
    posicion: {
      type: String,
      enum: Object.values(Posicion),
      required: [true, 'La posición es requerida'],
    },
    numeroCamiseta: {
      type: Number,
      required: [true, 'El número de camiseta es requerido'],
      min: [1, 'El número de camiseta debe ser mayor a 0'],
      max: [20, 'El número de camiseta debe ser menor o igual a 20'],
    },
    tipo: {
      type: String,
      enum: Object.values(TipoJugador),
      required: [true, 'El tipo de jugador es requerido'],
    },

    // Relación con equipo
    equipoId: {
      type: Schema.Types.ObjectId,
      ref: 'Equipo',
      required: [true, 'El equipo es requerido'],
    },

    // Documentos
    documentos: [
      {
        tipo: {
          type: String,
          enum: Object.values(TipoDocumento),
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
        nombreArchivo: {
          type: String,
          required: true,
        },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Validación
    estadoValidacion: {
      type: String,
      enum: Object.values(EstadoValidacion),
      default: EstadoValidacion.PENDIENTE,
    },
    observaciones: {
      type: String,
      trim: true,
      maxlength: [500, 'Las observaciones no pueden exceder 500 caracteres'],
    },
    validadoPor: {
      type: Schema.Types.ObjectId,
      ref: 'Usuario',
    },
    fechaValidacion: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        delete (ret as any).__v;
        return ret;
      },
    },
  }
);

// ========================================
// INDEXES
// ========================================

jugadorSchema.index({ cedula: 1 });
jugadorSchema.index({ equipoId: 1 });
jugadorSchema.index({ estadoValidacion: 1 });
jugadorSchema.index({ tipo: 1 });
jugadorSchema.index({ equipoId: 1, estadoValidacion: 1 });
jugadorSchema.index({ equipoId: 1, numeroCamiseta: 1 });

// ========================================
// VIRTUALS
// ========================================

// Virtual para obtener edad actual
jugadorSchema.virtual('edad').get(function (this: IJugadorDocument) {
  return this.calcularEdad();
});

// Virtual para obtener nombre completo
jugadorSchema.virtual('nombreCompleto').get(function (this: IJugadorDocument) {
  return this.getNombreCompleto();
});

// ========================================
// MÉTODOS DE INSTANCIA
// ========================================

// Calcular edad del jugador
jugadorSchema.methods.calcularEdad = function (this: IJugadorDocument): number {
  const hoy = new Date();
  const fechaNac = new Date(this.fechaNacimiento);
  let edad = hoy.getFullYear() - fechaNac.getFullYear();
  const mesActual = hoy.getMonth();
  const mesNacimiento = fechaNac.getMonth();

  if (mesActual < mesNacimiento || (mesActual === mesNacimiento && hoy.getDate() < fechaNac.getDate())) {
    edad--;
  }

  return edad;
};

// Verificar si es jugador extranjero
jugadorSchema.methods.esExtranjero = function (this: IJugadorDocument): boolean {
  const { esJugadorExtranjero } = require('@/shared/types/enums');
  return esJugadorExtranjero(this.tipo);
};

// Obtener nombre completo
jugadorSchema.methods.getNombreCompleto = function (this: IJugadorDocument): string {
  return `${this.nombre} ${this.apellido}`;
};

// Verificar si tiene documentos de un tipo específico
jugadorSchema.methods.tieneDocumentosTipo = function (
  this: IJugadorDocument,
  tipo: TipoDocumento
): boolean {
  return this.documentos.some((doc) => doc.tipo === tipo);
};

// Validar contra el reglamento del torneo
jugadorSchema.methods.validarReglamento = async function (
  this: IJugadorDocument
): Promise<{ valido: boolean; errores: string[] }> {
  const errores: string[] = [];
  const { REGLAMENTO, ERRORES } = await import('@/core/config/constants');
  const { esJugadorExtranjero, esJugadorElDorado, esJugadorFundacion } = await import(
    '@/shared/types/enums'
  );

  // Validar edad
  const edad = this.calcularEdad();

  // Validar edad general
  if (edad < REGLAMENTO.EDAD_MINIMA_GENERAL || edad > REGLAMENTO.EDAD_MAXIMA_GENERAL) {
    errores.push(
      `La edad debe estar entre ${REGLAMENTO.EDAD_MINIMA_GENERAL} y ${REGLAMENTO.EDAD_MAXIMA_GENERAL} años`
    );
  }

  // Validar edad mínima para extranjeros
  if (esJugadorExtranjero(this.tipo) && edad < REGLAMENTO.EDAD_MINIMA_EXTRANJEROS) {
    errores.push(ERRORES.EDAD_MINIMA_EXTRANJERO);
  }

  // Validar número de camiseta
  if (
    this.numeroCamiseta < REGLAMENTO.NUMERO_CAMISETA_MIN ||
    this.numeroCamiseta > REGLAMENTO.NUMERO_CAMISETA_MAX
  ) {
    errores.push(ERRORES.NUMERO_CAMISETA_INVALIDO);
  }

  // Obtener estadísticas del equipo
  const Equipo = mongoose.model('Equipo');
  const equipo = await Equipo.findById(this.equipoId);

  if (equipo) {
    const estadisticas = await equipo.calcularEstadisticas();

    // Validar cupos de extranjeros (excluyendo al jugador actual si ya está validado)
    if (esJugadorExtranjero(this.tipo)) {
      let extranjerosActuales = estadisticas.extranjeros;
      if (
        this.estadoValidacion === EstadoValidacion.VALIDADO &&
        esJugadorExtranjero(this.tipo)
      ) {
        extranjerosActuales--;
      }

      if (extranjerosActuales >= REGLAMENTO.MAX_EXTRANJEROS) {
        errores.push(ERRORES.MAX_EXTRANJEROS_ALCANZADO);
      }
    }

    // Validar cupos de I.E. El Dorado
    if (esJugadorElDorado(this.tipo)) {
      let docentesElDoradoActuales =
        estadisticas.docentesElDorado + estadisticas.trabajadoresElDorado;

      if (
        this.estadoValidacion === EstadoValidacion.VALIDADO &&
        esJugadorElDorado(this.tipo)
      ) {
        docentesElDoradoActuales--;
      }

      if (docentesElDoradoActuales >= REGLAMENTO.MAX_DOCENTES_EL_DORADO) {
        errores.push(ERRORES.MAX_DOCENTES_EL_DORADO_ALCANZADO);
      }
    }

    // Validar cupos de Fundación Vallejo
    if (esJugadorFundacion(this.tipo)) {
      let docentesFundacionActuales =
        estadisticas.docentesFundacion +
        estadisticas.trabajadoresFundacion +
        estadisticas.padresFundacion;

      if (
        this.estadoValidacion === EstadoValidacion.VALIDADO &&
        esJugadorFundacion(this.tipo)
      ) {
        docentesFundacionActuales--;
      }

      if (docentesFundacionActuales >= REGLAMENTO.MAX_DOCENTES_FUNDACION) {
        errores.push(ERRORES.MAX_DOCENTES_FUNDACION_ALCANZADO);
      }
    }
  }

  return {
    valido: errores.length === 0,
    errores,
  };
};

// ========================================
// MÉTODOS ESTÁTICOS
// ========================================

// Buscar por cédula
jugadorSchema.statics.findByCedula = function (
  this: IJugadorModel,
  cedula: string
): Promise<IJugadorDocument | null> {
  return this.findOne({ cedula });
};

// Buscar por equipo
jugadorSchema.statics.findByEquipo = function (
  this: IJugadorModel,
  equipoId: string
): Promise<IJugadorDocument[]> {
  return this.find({ equipoId: new mongoose.Types.ObjectId(equipoId) });
};

// Buscar jugadores pendientes de validación
jugadorSchema.statics.findPendientesValidacion = function (
  this: IJugadorModel
): Promise<IJugadorDocument[]> {
  return this.find({ estadoValidacion: EstadoValidacion.PENDIENTE }).populate(
    'equipoId',
    'nombre'
  );
};

// Contar jugadores por tipo en un equipo
jugadorSchema.statics.contarPorTipo = function (
  this: IJugadorModel,
  equipoId: string,
  tipo: TipoJugador
): Promise<number> {
  return this.countDocuments({
    equipoId: new mongoose.Types.ObjectId(equipoId),
    tipo,
    estadoValidacion: EstadoValidacion.VALIDADO,
  });
};

// ========================================
// MIDDLEWARES
// ========================================

// Validar número de camiseta único por equipo
jugadorSchema.pre('save', async function (next) {
  if (this.isNew || this.isModified('numeroCamiseta')) {
    const jugadorDuplicado = await (this.constructor as IJugadorModel).findOne({
      equipoId: this.equipoId,
      numeroCamiseta: this.numeroCamiseta,
      _id: { $ne: this._id },
    });

    if (jugadorDuplicado) {
      const { ERRORES } = await import('@/core/config/constants');
      const error = new Error(ERRORES.NUMERO_CAMISETA_DUPLICADO);
      return next(error);
    }
  }
  next();
});

// Actualizar array de jugadores en el equipo
jugadorSchema.post('save', async function (doc: IJugadorDocument) {
  const Equipo = mongoose.model('Equipo');
  const equipo = await Equipo.findById(doc.equipoId);

  if (equipo && !equipo.jugadores.includes(doc._id)) {
    equipo.jugadores.push(doc._id);
    await equipo.save();
  }
});

// Remover jugador del array del equipo al eliminarlo
jugadorSchema.post('findOneAndDelete', async function (doc: IJugadorDocument | null) {
  if (doc) {
    const Equipo = mongoose.model('Equipo');
    await Equipo.findByIdAndUpdate(doc.equipoId, {
      $pull: { jugadores: doc._id },
    });
  }
});

// ========================================
// EXPORT
// ========================================

export const Jugador = mongoose.model<IJugadorDocument, IJugadorModel>(
  'Jugador',
  jugadorSchema
);
