import mongoose, { Document, Model, Schema } from 'mongoose';
import { EstadoTorneo } from '@/shared/types/enums';

// ========================================
// INTERFACE
// ========================================

export interface ITorneo {
  nombre: string;
  descripcion?: string;
  fechaInicio: Date;
  fechaFin?: Date;
  año: number;
  equipos: mongoose.Types.ObjectId[];
  fases: mongoose.Types.ObjectId[];
  faseActual?: mongoose.Types.ObjectId;
  estado: EstadoTorneo;
  reglamento?: string; // URL del documento de reglamento en Cloudinary
  premios?: {
    primerLugar?: string;
    segundoLugar?: string;
    tercerLugar?: string;
    otros?: string[];
  };
  estadisticas?: {
    totalPartidos: number;
    totalGoles: number;
    equiposParticipantes: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Interface del documento (con métodos de instancia)
export interface ITorneoDocument extends ITorneo, Document {
  agregarEquipo(equipoId: mongoose.Types.ObjectId): Promise<void>;
  removerEquipo(equipoId: mongoose.Types.ObjectId): Promise<void>;
  iniciarTorneo(): Promise<void>;
  finalizarTorneo(): Promise<void>;
  avanzarFase(siguienteFaseId: mongoose.Types.ObjectId): Promise<void>;
  actualizarEstadisticas(): Promise<void>;
}

// Interface del modelo (con métodos estáticos)
export interface ITorneoModel extends Model<ITorneoDocument> {
  findActual(): Promise<ITorneoDocument | null>;
  findByAño(año: number): Promise<ITorneoDocument[]>;
  findActivos(): Promise<ITorneoDocument[]>;
}

// ========================================
// SCHEMA
// ========================================

const torneoSchema = new Schema<ITorneoDocument, ITorneoModel>(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre del torneo es requerido'],
      trim: true,
      minlength: [3, 'El nombre debe tener al menos 3 caracteres'],
      maxlength: [100, 'El nombre no puede exceder 100 caracteres'],
    },
    descripcion: {
      type: String,
      trim: true,
      maxlength: [500, 'La descripción no puede exceder 500 caracteres'],
    },
    fechaInicio: {
      type: Date,
      required: [true, 'La fecha de inicio es requerida'],
    },
    fechaFin: {
      type: Date,
      validate: {
        validator: function (this: ITorneoDocument, fechaFin: Date) {
          return !fechaFin || fechaFin > this.fechaInicio;
        },
        message: 'La fecha de fin debe ser posterior a la fecha de inicio',
      },
    },
    año: {
      type: Number,
      required: [true, 'El año es requerido'],
      min: [2020, 'El año debe ser mayor o igual a 2020'],
      max: [2100, 'El año debe ser menor o igual a 2100'],
    },
    equipos: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Equipo',
      },
    ],
    fases: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Fase',
      },
    ],
    faseActual: {
      type: Schema.Types.ObjectId,
      ref: 'Fase',
    },
    estado: {
      type: String,
      enum: Object.values(EstadoTorneo),
      default: EstadoTorneo.CONFIGURACION,
    },
    reglamento: {
      type: String,
      trim: true,
    },
    premios: {
      primerLugar: {
        type: String,
        trim: true,
      },
      segundoLugar: {
        type: String,
        trim: true,
      },
      tercerLugar: {
        type: String,
        trim: true,
      },
      otros: [
        {
          type: String,
          trim: true,
        },
      ],
    },
    estadisticas: {
      totalPartidos: {
        type: Number,
        default: 0,
        min: 0,
      },
      totalGoles: {
        type: Number,
        default: 0,
        min: 0,
      },
      equiposParticipantes: {
        type: Number,
        default: 0,
        min: 0,
      },
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

torneoSchema.index({ año: 1 });
torneoSchema.index({ estado: 1 });
torneoSchema.index({ fechaInicio: 1 });
torneoSchema.index({ año: -1, estado: 1 });

// ========================================
// VIRTUALS
// ========================================

// Virtual para obtener el número de equipos
torneoSchema.virtual('numeroEquipos').get(function (this: ITorneoDocument) {
  return this.equipos?.length || 0;
});

// Virtual para obtener el número de fases
torneoSchema.virtual('numeroFases').get(function (this: ITorneoDocument) {
  return this.fases?.length || 0;
});

// Virtual para verificar si el torneo está activo
torneoSchema.virtual('estaActivo').get(function (this: ITorneoDocument) {
  return this.estado === EstadoTorneo.EN_CURSO;
});

// ========================================
// MÉTODOS DE INSTANCIA
// ========================================

// Agregar equipo al torneo
torneoSchema.methods.agregarEquipo = async function (
  this: ITorneoDocument,
  equipoId: mongoose.Types.ObjectId
): Promise<void> {
  if (!this.equipos.includes(equipoId)) {
    this.equipos.push(equipoId);
    if (this.estadisticas) {
      this.estadisticas.equiposParticipantes = this.equipos.length;
    }
    await this.save();

    // Actualizar el equipo
    const Equipo = mongoose.model('Equipo');
    await Equipo.findByIdAndUpdate(equipoId, { torneoId: this._id });
  }
};

// Remover equipo del torneo
torneoSchema.methods.removerEquipo = async function (
  this: ITorneoDocument,
  equipoId: mongoose.Types.ObjectId
): Promise<void> {
  const index = this.equipos.indexOf(equipoId);
  if (index > -1) {
    this.equipos.splice(index, 1);
    if (this.estadisticas) {
      this.estadisticas.equiposParticipantes = this.equipos.length;
    }
    await this.save();

    // Actualizar el equipo
    const Equipo = mongoose.model('Equipo');
    await Equipo.findByIdAndUpdate(equipoId, { $unset: { torneoId: 1 } });
  }
};

// Iniciar torneo
torneoSchema.methods.iniciarTorneo = async function (this: ITorneoDocument): Promise<void> {
  if (this.estado !== EstadoTorneo.CONFIGURACION) {
    throw new Error('El torneo ya ha sido iniciado');
  }

  // Verificar que haya al menos una fase creada
  if (this.fases.length === 0) {
    throw new Error('Debe crear al menos una fase antes de iniciar el torneo');
  }

  // Establecer la primera fase como fase actual
  this.faseActual = this.fases[0];
  this.estado = EstadoTorneo.EN_CURSO;
  await this.save();
};

// Finalizar torneo
torneoSchema.methods.finalizarTorneo = async function (this: ITorneoDocument): Promise<void> {
  if (this.estado !== EstadoTorneo.EN_CURSO) {
    throw new Error('El torneo no está en curso');
  }

  this.estado = EstadoTorneo.FINALIZADO;
  this.fechaFin = new Date();
  await this.save();
};

// Avanzar a siguiente fase
torneoSchema.methods.avanzarFase = async function (
  this: ITorneoDocument,
  siguienteFaseId: mongoose.Types.ObjectId
): Promise<void> {
  if (!this.fases.includes(siguienteFaseId)) {
    throw new Error('La fase especificada no pertenece a este torneo');
  }

  this.faseActual = siguienteFaseId;
  await this.save();
};

// Actualizar estadísticas del torneo
torneoSchema.methods.actualizarEstadisticas = async function (
  this: ITorneoDocument
): Promise<void> {
  const Partido = mongoose.model('Partido');

  // Obtener todos los partidos del torneo
  const partidos = await Partido.find({
    torneoId: this._id,
  });

  let totalGoles = 0;
  let totalPartidos = partidos.length;

  for (const partido of partidos) {
    if (partido.resultado) {
      totalGoles += partido.resultado.golesLocal + partido.resultado.golesVisitante;
    }
  }

  this.estadisticas = {
    totalPartidos,
    totalGoles,
    equiposParticipantes: this.equipos.length,
  };

  await this.save();
};

// ========================================
// MÉTODOS ESTÁTICOS
// ========================================

// Buscar torneo actual (en curso o en registro)
torneoSchema.statics.findActual = function (
  this: ITorneoModel
): Promise<ITorneoDocument | null> {
  return this.findOne({
    estado: { $in: [EstadoTorneo.CONFIGURACION, EstadoTorneo.EN_CURSO] },
  })
    .sort({ año: -1, fechaInicio: -1 })
    .populate('equipos')
    .populate('fases')
    .populate('faseActual');
};

// Buscar torneos por año
torneoSchema.statics.findByAño = function (
  this: ITorneoModel,
  año: number
): Promise<ITorneoDocument[]> {
  return this.find({ año }).sort({ fechaInicio: -1 });
};

// Buscar torneos activos (en curso o registro)
torneoSchema.statics.findActivos = function (this: ITorneoModel): Promise<ITorneoDocument[]> {
  return this.find({
    estado: { $in: [EstadoTorneo.CONFIGURACION, EstadoTorneo.EN_CURSO] },
  }).sort({ año: -1, fechaInicio: -1 });
};

// ========================================
// MIDDLEWARES
// ========================================

// Establecer año automáticamente al crear
torneoSchema.pre('save', function (next) {
  if (this.isNew && !this.año) {
    this.año = this.fechaInicio.getFullYear();
  }
  next();
});

// Inicializar estadísticas
torneoSchema.pre('save', function (next) {
  if (this.isNew && !this.estadisticas) {
    this.estadisticas = {
      totalPartidos: 0,
      totalGoles: 0,
      equiposParticipantes: this.equipos.length,
    };
  }
  next();
});

// ========================================
// EXPORT
// ========================================

export const Torneo = mongoose.model<ITorneoDocument, ITorneoModel>('Torneo', torneoSchema);
