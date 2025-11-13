import mongoose, { Document, Model, Schema } from 'mongoose';
import { EstadoEquipo } from '@/shared/types/enums';
import { IEstadisticasEquipo } from '@/shared/types/interfaces';

// ========================================
// INTERFACE
// ========================================

export interface IEquipo {
  nombre: string;
  delegadoId: mongoose.Types.ObjectId;
  escudo?: string; // URL del escudo en Cloudinary
  colores: {
    principal: string;
    secundario: string;
  };
  jugadores: mongoose.Types.ObjectId[];
  estado: EstadoEquipo;
  torneoId?: mongoose.Types.ObjectId; // Torneo actual (Fase 1)
  createdAt: Date;
  updatedAt: Date;
}

// Interface del documento (con métodos de instancia)
export interface IEquipoDocument extends IEquipo, Document {
  calcularEstadisticas(): Promise<IEstadisticasEquipo>;
  puedeAgregarJugador(): Promise<{ puede: boolean; razon?: string }>;
}

// Interface del modelo (con métodos estáticos)
export interface IEquipoModel extends Model<IEquipoDocument> {
  findByDelegado(delegadoId: string): Promise<IEquipoDocument | null>;
  findActivos(): Promise<IEquipoDocument[]>;
}

// ========================================
// SCHEMA
// ========================================

const equipoSchema = new Schema<IEquipoDocument, IEquipoModel>(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre del equipo es requerido'],
      unique: true,
      trim: true,
      minlength: [3, 'El nombre debe tener al menos 3 caracteres'],
      maxlength: [50, 'El nombre no puede exceder 50 caracteres'],
    },
    delegadoId: {
      type: Schema.Types.ObjectId,
      ref: 'Usuario',
      required: [true, 'El delegado es requerido'],
    },
    escudo: {
      type: String,
      trim: true,
    },
    colores: {
      principal: {
        type: String,
        required: [true, 'El color principal es requerido'],
        trim: true,
        maxlength: [30, 'El color principal no puede exceder 30 caracteres'],
      },
      secundario: {
        type: String,
        required: [true, 'El color secundario es requerido'],
        trim: true,
        maxlength: [30, 'El color secundario no puede exceder 30 caracteres'],
      },
    },
    jugadores: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Jugador',
      },
    ],
    estado: {
      type: String,
      enum: Object.values(EstadoEquipo),
      default: EstadoEquipo.PENDIENTE,
    },
    torneoId: {
      type: Schema.Types.ObjectId,
      ref: 'Torneo',
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

equipoSchema.index({ nombre: 1 });
equipoSchema.index({ delegadoId: 1 });
equipoSchema.index({ estado: 1 });
equipoSchema.index({ torneoId: 1 });

// ========================================
// VIRTUALS
// ========================================

// Virtual para obtener el número de jugadores
equipoSchema.virtual('numeroJugadores').get(function (this: IEquipoDocument) {
  return this.jugadores.length;
});

// ========================================
// MÉTODOS DE INSTANCIA
// ========================================

// Calcular estadísticas del equipo
equipoSchema.methods.calcularEstadisticas = async function (
  this: IEquipoDocument
): Promise<IEstadisticasEquipo> {
  const Jugador = mongoose.model('Jugador');

  const jugadores = await Jugador.find({ equipoId: this._id });

  const estadisticas: IEstadisticasEquipo = {
    jugadoresValidados: 0,
    jugadoresPendientes: 0,
    jugadoresRechazados: 0,
    extranjeros: 0,
    docentesElDorado: 0,
    trabajadoresElDorado: 0,
    docentesFundacion: 0,
    trabajadoresFundacion: 0,
    padresFundacion: 0,
  };

  // Importar enums y helpers
  const { EstadoValidacion, TipoJugador } = await import('@/shared/types/enums');
  const { esJugadorExtranjero, esJugadorElDorado, esJugadorFundacion } = await import(
    '@/shared/types/enums'
  );

  for (const jugador of jugadores) {
    // Contar por estado de validación
    if (jugador.estadoValidacion === EstadoValidacion.VALIDADO) {
      estadisticas.jugadoresValidados++;
    } else if (jugador.estadoValidacion === EstadoValidacion.PENDIENTE) {
      estadisticas.jugadoresPendientes++;
    } else if (jugador.estadoValidacion === EstadoValidacion.RECHAZADO) {
      estadisticas.jugadoresRechazados++;
    }

    // Solo contar jugadores validados para cuotas especiales
    if (jugador.estadoValidacion === EstadoValidacion.VALIDADO) {
      // Contar extranjeros
      if (esJugadorExtranjero(jugador.tipo)) {
        estadisticas.extranjeros++;
      }

      // Contar docentes/trabajadores de I.E. El Dorado
      if (esJugadorElDorado(jugador.tipo)) {
        if (jugador.tipo === TipoJugador.DOCENTE_EL_DORADO) {
          estadisticas.docentesElDorado++;
        } else if (jugador.tipo === TipoJugador.TRABAJADOR_EL_DORADO) {
          estadisticas.trabajadoresElDorado++;
        }
      }

      // Contar docentes/trabajadores/padres de Fundación Vallejo
      if (esJugadorFundacion(jugador.tipo)) {
        if (jugador.tipo === TipoJugador.DOCENTE_FUNDACION) {
          estadisticas.docentesFundacion++;
        } else if (jugador.tipo === TipoJugador.TRABAJADOR_FUNDACION) {
          estadisticas.trabajadoresFundacion++;
        } else if (jugador.tipo === TipoJugador.PADRE_FUNDACION) {
          estadisticas.padresFundacion++;
        }
      }
    }
  }

  return estadisticas;
};

// Verificar si se puede agregar un jugador
equipoSchema.methods.puedeAgregarJugador = async function (
  this: IEquipoDocument
): Promise<{ puede: boolean; razon?: string }> {
  const { REGLAMENTO } = await import('@/core/config/constants');
  const { ERRORES } = await import('@/core/config/constants');

  // Verificar límite máximo de jugadores
  if (this.jugadores.length >= REGLAMENTO.MAX_JUGADORES_POR_EQUIPO) {
    return {
      puede: false,
      razon: ERRORES.MAX_JUGADORES_ALCANZADO,
    };
  }

  return { puede: true };
};

// ========================================
// MÉTODOS ESTÁTICOS
// ========================================

// Buscar equipo por delegado
equipoSchema.statics.findByDelegado = function (
  this: IEquipoModel,
  delegadoId: string
): Promise<IEquipoDocument | null> {
  return this.findOne({ delegadoId: new mongoose.Types.ObjectId(delegadoId) });
};

// Buscar equipos activos
equipoSchema.statics.findActivos = function (this: IEquipoModel): Promise<IEquipoDocument[]> {
  const { EstadoEquipo } = require('@/shared/types/enums');
  return this.find({
    estado: {
      $in: [EstadoEquipo.REGISTRADO, EstadoEquipo.VALIDADO],
    },
  });
};

// ========================================
// MIDDLEWARES
// ========================================

// Validar que el delegado sea único
equipoSchema.pre('save', async function (next) {
  if (this.isNew || this.isModified('delegadoId')) {
    const existingEquipo = await (this.constructor as IEquipoModel).findOne({
      delegadoId: this.delegadoId,
      _id: { $ne: this._id },
    });

    if (existingEquipo) {
      const error = new Error('Este delegado ya tiene un equipo registrado');
      return next(error);
    }
  }
  next();
});

// ========================================
// EXPORT
// ========================================

export const Equipo = mongoose.model<IEquipoDocument, IEquipoModel>('Equipo', equipoSchema);
