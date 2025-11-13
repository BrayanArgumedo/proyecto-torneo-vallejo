import mongoose, { Document, Model, Schema } from 'mongoose';
import { EstadoPartido } from '@/shared/types/enums';

// ========================================
// INTERFACES
// ========================================

export interface IGol {
  jugador: mongoose.Types.ObjectId;
  minuto: number;
  esAutogol: boolean;
}

export interface ITarjeta {
  jugador: mongoose.Types.ObjectId;
  minuto: number;
  tipo: 'AMARILLA' | 'ROJA';
}

export interface IResultado {
  golesLocal: number;
  golesVisitante: number;
  ganadorPenales?: mongoose.Types.ObjectId; // Solo para eliminación directa con empate
}

export interface IPartido {
  // Referencias
  torneoId: mongoose.Types.ObjectId;
  faseId: mongoose.Types.ObjectId;
  equipoLocal: mongoose.Types.ObjectId;
  equipoVisitante: mongoose.Types.ObjectId;

  // Programación
  fecha?: Date;
  cancha?: string;
  jornada?: number;
  grupo?: string; // Para fase de grupos: A, B, C, etc.

  // Detalles del partido
  esEliminacion: boolean;
  estado: EstadoPartido;

  // Resultado
  resultado?: IResultado;

  // Estadísticas detalladas
  goles: IGol[];
  tarjetas: ITarjeta[];

  // Observaciones
  observaciones?: string;
  arbitro?: string;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

// Interface del documento (con métodos de instancia)
export interface IPartidoDocument extends IPartido, Document {
  registrarGol(
    jugadorId: mongoose.Types.ObjectId,
    minuto: number,
    esAutogol?: boolean
  ): Promise<void>;
  registrarTarjeta(
    jugadorId: mongoose.Types.ObjectId,
    minuto: number,
    tipo: 'AMARILLA' | 'ROJA'
  ): Promise<void>;
  finalizarPartido(golesLocal: number, golesVisitante: number): Promise<void>;
  cancelarPartido(motivo: string): Promise<void>;
  obtenerGanador(): mongoose.Types.ObjectId | null;
}

// Interface del modelo (con métodos estáticos)
export interface IPartidoModel extends Model<IPartidoDocument> {
  findByFase(faseId: string): Promise<IPartidoDocument[]>;
  findByEquipo(equipoId: string): Promise<IPartidoDocument[]>;
  findByJornada(faseId: string, jornada: number): Promise<IPartidoDocument[]>;
  findProximos(limit?: number): Promise<IPartidoDocument[]>;
  findPorGrupo(faseId: string, grupo: string): Promise<IPartidoDocument[]>;
}

// ========================================
// SCHEMA
// ========================================

const partidoSchema = new Schema<IPartidoDocument, IPartidoModel>(
  {
    // Referencias
    torneoId: {
      type: Schema.Types.ObjectId,
      ref: 'Torneo',
      required: [true, 'El torneo es requerido'],
    },
    faseId: {
      type: Schema.Types.ObjectId,
      ref: 'Fase',
      required: [true, 'La fase es requerida'],
    },
    equipoLocal: {
      type: Schema.Types.ObjectId,
      ref: 'Equipo',
      required: [true, 'El equipo local es requerido'],
    },
    equipoVisitante: {
      type: Schema.Types.ObjectId,
      ref: 'Equipo',
      required: [true, 'El equipo visitante es requerido'],
      validate: {
        validator: function (this: IPartidoDocument, visitante: mongoose.Types.ObjectId) {
          return !this.equipoLocal.equals(visitante);
        },
        message: 'El equipo local y visitante no pueden ser el mismo',
      },
    },

    // Programación
    fecha: {
      type: Date,
    },
    cancha: {
      type: String,
      trim: true,
      maxlength: [100, 'El nombre de la cancha no puede exceder 100 caracteres'],
    },
    jornada: {
      type: Number,
      min: [1, 'La jornada debe ser mayor a 0'],
    },
    grupo: {
      type: String,
      trim: true,
      uppercase: true,
      match: [/^[A-Z]$/, 'El grupo debe ser una letra mayúscula'],
    },

    // Detalles del partido
    esEliminacion: {
      type: Boolean,
      default: false,
    },
    estado: {
      type: String,
      enum: Object.values(EstadoPartido),
      default: EstadoPartido.PROGRAMADO,
    },

    // Resultado
    resultado: {
      golesLocal: {
        type: Number,
        min: 0,
      },
      golesVisitante: {
        type: Number,
        min: 0,
      },
      ganadorPenales: {
        type: Schema.Types.ObjectId,
        ref: 'Equipo',
      },
    },

    // Estadísticas detalladas
    goles: [
      {
        jugador: {
          type: Schema.Types.ObjectId,
          ref: 'Jugador',
          required: true,
        },
        minuto: {
          type: Number,
          required: true,
          min: [0, 'El minuto debe ser mayor o igual a 0'],
          max: [120, 'El minuto no puede exceder 120'],
        },
        esAutogol: {
          type: Boolean,
          default: false,
        },
      },
    ],
    tarjetas: [
      {
        jugador: {
          type: Schema.Types.ObjectId,
          ref: 'Jugador',
          required: true,
        },
        minuto: {
          type: Number,
          required: true,
          min: [0, 'El minuto debe ser mayor o igual a 0'],
          max: [120, 'El minuto no puede exceder 120'],
        },
        tipo: {
          type: String,
          enum: ['AMARILLA', 'ROJA'],
          required: true,
        },
      },
    ],

    // Observaciones
    observaciones: {
      type: String,
      trim: true,
      maxlength: [500, 'Las observaciones no pueden exceder 500 caracteres'],
    },
    arbitro: {
      type: String,
      trim: true,
      maxlength: [100, 'El nombre del árbitro no puede exceder 100 caracteres'],
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

partidoSchema.index({ torneoId: 1, fecha: 1 });
partidoSchema.index({ faseId: 1, jornada: 1 });
partidoSchema.index({ faseId: 1, grupo: 1 });
partidoSchema.index({ equipoLocal: 1 });
partidoSchema.index({ equipoVisitante: 1 });
partidoSchema.index({ estado: 1, fecha: 1 });

// ========================================
// VIRTUALS
// ========================================

// Virtual para verificar si el partido ha finalizado
partidoSchema.virtual('haFinalizado').get(function (this: IPartidoDocument) {
  return this.estado === EstadoPartido.FINALIZADO;
});

// Virtual para verificar si hay empate
partidoSchema.virtual('hayEmpate').get(function (this: IPartidoDocument) {
  if (!this.resultado) return false;
  return this.resultado.golesLocal === this.resultado.golesVisitante;
});

// ========================================
// MÉTODOS DE INSTANCIA
// ========================================

// Registrar gol
partidoSchema.methods.registrarGol = async function (
  this: IPartidoDocument,
  jugadorId: mongoose.Types.ObjectId,
  minuto: number,
  esAutogol: boolean = false
): Promise<void> {
  if (this.estado !== EstadoPartido.EN_CURSO) {
    throw new Error('Solo se pueden registrar goles en partidos en curso');
  }

  // Validar que el jugador pertenezca a uno de los equipos
  const Jugador = mongoose.model('Jugador');
  const jugador = await Jugador.findById(jugadorId);

  if (!jugador) {
    throw new Error('Jugador no encontrado');
  }

  const equipoJugador = jugador.equipoId.toString();
  const esLocal = equipoJugador === this.equipoLocal.toString();
  const esVisitante = equipoJugador === this.equipoVisitante.toString();

  if (!esLocal && !esVisitante) {
    throw new Error('El jugador no pertenece a ninguno de los equipos');
  }

  // Agregar gol
  this.goles.push({
    jugador: jugadorId,
    minuto,
    esAutogol,
  });

  // Actualizar resultado
  if (!this.resultado) {
    this.resultado = {
      golesLocal: 0,
      golesVisitante: 0,
    };
  }

  // Si es autogol, suma al equipo contrario
  if (esAutogol) {
    if (esLocal) {
      this.resultado.golesVisitante++;
    } else {
      this.resultado.golesLocal++;
    }
  } else {
    if (esLocal) {
      this.resultado.golesLocal++;
    } else {
      this.resultado.golesVisitante++;
    }
  }

  await this.save();
};

// Registrar tarjeta
partidoSchema.methods.registrarTarjeta = async function (
  this: IPartidoDocument,
  jugadorId: mongoose.Types.ObjectId,
  minuto: number,
  tipo: 'AMARILLA' | 'ROJA'
): Promise<void> {
  if (this.estado !== EstadoPartido.EN_CURSO) {
    throw new Error('Solo se pueden registrar tarjetas en partidos en curso');
  }

  // Validar que el jugador pertenezca a uno de los equipos
  const Jugador = mongoose.model('Jugador');
  const jugador = await Jugador.findById(jugadorId);

  if (!jugador) {
    throw new Error('Jugador no encontrado');
  }

  const equipoJugador = jugador.equipoId.toString();
  const esLocal = equipoJugador === this.equipoLocal.toString();
  const esVisitante = equipoJugador === this.equipoVisitante.toString();

  if (!esLocal && !esVisitante) {
    throw new Error('El jugador no pertenece a ninguno de los equipos');
  }

  // Agregar tarjeta
  this.tarjetas.push({
    jugador: jugadorId,
    minuto,
    tipo,
  });

  await this.save();
};

// Finalizar partido
partidoSchema.methods.finalizarPartido = async function (
  this: IPartidoDocument,
  golesLocal: number,
  golesVisitante: number
): Promise<void> {
  if (this.estado === EstadoPartido.FINALIZADO) {
    throw new Error('El partido ya ha finalizado');
  }

  if (this.estado === EstadoPartido.CANCELADO) {
    throw new Error('El partido ha sido cancelado');
  }

  this.resultado = {
    golesLocal,
    golesVisitante,
  };

  this.estado = EstadoPartido.FINALIZADO;
  await this.save();
};

// Cancelar partido
partidoSchema.methods.cancelarPartido = async function (
  this: IPartidoDocument,
  motivo: string
): Promise<void> {
  if (this.estado === EstadoPartido.FINALIZADO) {
    throw new Error('No se puede cancelar un partido finalizado');
  }

  this.estado = EstadoPartido.CANCELADO;
  this.observaciones = motivo;
  await this.save();
};

// Obtener ganador
partidoSchema.methods.obtenerGanador = function (
  this: IPartidoDocument
): mongoose.Types.ObjectId | null {
  if (!this.resultado || this.estado !== EstadoPartido.FINALIZADO) {
    return null;
  }

  // Si hay ganador por penales (en eliminación directa)
  if (this.resultado.ganadorPenales) {
    return this.resultado.ganadorPenales;
  }

  // Ganador por resultado
  if (this.resultado.golesLocal > this.resultado.golesVisitante) {
    return this.equipoLocal;
  } else if (this.resultado.golesVisitante > this.resultado.golesLocal) {
    return this.equipoVisitante;
  }

  // Empate
  return null;
};

// ========================================
// MÉTODOS ESTÁTICOS
// ========================================

// Buscar partidos por fase
partidoSchema.statics.findByFase = function (
  this: IPartidoModel,
  faseId: string
): Promise<IPartidoDocument[]> {
  return this.find({ faseId: new mongoose.Types.ObjectId(faseId) })
    .populate('equipoLocal', 'nombre escudo')
    .populate('equipoVisitante', 'nombre escudo')
    .sort({ fecha: 1, jornada: 1 });
};

// Buscar partidos por equipo
partidoSchema.statics.findByEquipo = function (
  this: IPartidoModel,
  equipoId: string
): Promise<IPartidoDocument[]> {
  const id = new mongoose.Types.ObjectId(equipoId);
  return this.find({
    $or: [{ equipoLocal: id }, { equipoVisitante: id }],
  })
    .populate('equipoLocal', 'nombre escudo')
    .populate('equipoVisitante', 'nombre escudo')
    .sort({ fecha: -1 });
};

// Buscar partidos por jornada
partidoSchema.statics.findByJornada = function (
  this: IPartidoModel,
  faseId: string,
  jornada: number
): Promise<IPartidoDocument[]> {
  return this.find({
    faseId: new mongoose.Types.ObjectId(faseId),
    jornada,
  })
    .populate('equipoLocal', 'nombre escudo')
    .populate('equipoVisitante', 'nombre escudo')
    .sort({ fecha: 1 });
};

// Buscar próximos partidos
partidoSchema.statics.findProximos = function (
  this: IPartidoModel,
  limit: number = 10
): Promise<IPartidoDocument[]> {
  return this.find({
    estado: EstadoPartido.PROGRAMADO,
    fecha: { $gte: new Date() },
  })
    .populate('equipoLocal', 'nombre escudo')
    .populate('equipoVisitante', 'nombre escudo')
    .populate('faseId', 'nombre tipo')
    .sort({ fecha: 1 })
    .limit(limit);
};

// Buscar partidos por grupo
partidoSchema.statics.findPorGrupo = function (
  this: IPartidoModel,
  faseId: string,
  grupo: string
): Promise<IPartidoDocument[]> {
  return this.find({
    faseId: new mongoose.Types.ObjectId(faseId),
    grupo: grupo.toUpperCase(),
  })
    .populate('equipoLocal', 'nombre escudo')
    .populate('equipoVisitante', 'nombre escudo')
    .sort({ jornada: 1, fecha: 1 });
};

// ========================================
// MIDDLEWARES
// ========================================

// Agregar partido a la fase al crear
partidoSchema.post('save', async function (doc: IPartidoDocument) {
  if (doc.isNew) {
    const Fase = mongoose.model('Fase');
    const fase = await Fase.findById(doc.faseId);

    if (fase && !fase.partidos.includes(doc._id)) {
      fase.partidos.push(doc._id);
      await fase.save();
    }
  }
});

// ========================================
// EXPORT
// ========================================

export const Partido = mongoose.model<IPartidoDocument, IPartidoModel>('Partido', partidoSchema);
