import mongoose, { Document, Model, Schema } from 'mongoose';
import { FormatoFase, EstadoFase } from '@/shared/types/enums';
import { IConfiguracionFase } from '@/shared/types/interfaces';

// ========================================
// INTERFACE
// ========================================

export interface IFase {
  nombre: string;
  descripcion?: string;
  tipo: FormatoFase;
  orden: number;
  torneoId: mongoose.Types.ObjectId;
  equiposParticipantes: mongoose.Types.ObjectId[];
  partidos: mongoose.Types.ObjectId[];
  configuracion: IConfiguracionFase;
  estado: EstadoFase;
  fechaInicio?: Date;
  fechaFin?: Date;
  clasificados?: mongoose.Types.ObjectId[]; // Equipos que avanzan a la siguiente fase
  createdAt: Date;
  updatedAt: Date;
}

// Interface del documento (con métodos de instancia)
export interface IFaseDocument extends IFase, Document {
  generarCalendario(): Promise<void>;
  calcularTablaPosiciones(): Promise<any[]>;
  finalizarFase(): Promise<void>;
  obtenerClasificados(cantidad: number): Promise<mongoose.Types.ObjectId[]>;
}

// Interface del modelo (con métodos estáticos)
export interface IFaseModel extends Model<IFaseDocument> {
  findByTorneo(torneoId: string): Promise<IFaseDocument[]>;
  findActiva(torneoId: string): Promise<IFaseDocument | null>;
}

// ========================================
// SCHEMA
// ========================================

const faseSchema = new Schema<IFaseDocument, IFaseModel>(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre de la fase es requerido'],
      trim: true,
      minlength: [3, 'El nombre debe tener al menos 3 caracteres'],
      maxlength: [100, 'El nombre no puede exceder 100 caracteres'],
    },
    descripcion: {
      type: String,
      trim: true,
      maxlength: [500, 'La descripción no puede exceder 500 caracteres'],
    },
    tipo: {
      type: String,
      enum: Object.values(FormatoFase),
      required: [true, 'El tipo de fase es requerido'],
    },
    orden: {
      type: Number,
      required: [true, 'El orden es requerido'],
      min: [1, 'El orden debe ser mayor o igual a 1'],
    },
    torneoId: {
      type: Schema.Types.ObjectId,
      ref: 'Torneo',
      required: [true, 'El torneo es requerido'],
    },
    equiposParticipantes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Equipo',
      },
    ],
    partidos: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Partido',
      },
    ],
    configuracion: {
      // Configuración para fase de grupos
      numeroGrupos: {
        type: Number,
        min: 1,
      },
      equiposPorGrupo: {
        type: Number,
        min: 2,
      },
      clasificadosPorGrupo: {
        type: Number,
        min: 1,
      },

      // Configuración para todas las fases
      partidoIdaVuelta: {
        type: Boolean,
        default: false,
      },
      puntosVictoria: {
        type: Number,
        default: 3,
        min: 1,
      },
      puntosEmpate: {
        type: Number,
        default: 1,
        min: 0,
      },
      puntosDerrota: {
        type: Number,
        default: 0,
        min: 0,
      },

      // Configuración para desempates
      criteriosDesempate: [
        {
          type: String,
          enum: [
            'PUNTOS',
            'DIFERENCIA_GOLES',
            'GOLES_FAVOR',
            'GOLES_CONTRA',
            'PARTIDOS_GANADOS',
            'ENFRENTAMIENTO_DIRECTO',
          ],
        },
      ],
    },
    estado: {
      type: String,
      enum: Object.values(EstadoFase),
      default: EstadoFase.CONFIGURACION,
    },
    fechaInicio: {
      type: Date,
    },
    fechaFin: {
      type: Date,
      validate: {
        validator: function (this: IFaseDocument, fechaFin: Date) {
          return !fechaFin || !this.fechaInicio || fechaFin > this.fechaInicio;
        },
        message: 'La fecha de fin debe ser posterior a la fecha de inicio',
      },
    },
    clasificados: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Equipo',
      },
    ],
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

faseSchema.index({ torneoId: 1, orden: 1 });
faseSchema.index({ estado: 1 });
faseSchema.index({ torneoId: 1, estado: 1 });

// ========================================
// VIRTUALS
// ========================================

// Virtual para obtener el número de equipos
faseSchema.virtual('numeroEquipos').get(function (this: IFaseDocument) {
  return this.equiposParticipantes?.length || 0;
});

// Virtual para obtener el número de partidos
faseSchema.virtual('numeroPartidos').get(function (this: IFaseDocument) {
  return this.partidos?.length || 0;
});

// ========================================
// MÉTODOS DE INSTANCIA
// ========================================

// Generar calendario de partidos
faseSchema.methods.generarCalendario = async function (this: IFaseDocument): Promise<void> {
  if (this.estado !== EstadoFase.CONFIGURACION) {
    throw new Error('Solo se puede generar el calendario para fases programadas');
  }

  if (this.equiposParticipantes.length < 2) {
    throw new Error('Se necesitan al menos 2 equipos para generar el calendario');
  }

  const Partido = mongoose.model('Partido');
  const partidosGenerados: any[] = [];

  if (this.tipo === FormatoFase.LIGA) {
    // Generar partidos de liga (todos contra todos)
    const equipos = this.equiposParticipantes;

    for (let i = 0; i < equipos.length; i++) {
      for (let j = i + 1; j < equipos.length; j++) {
        // Partido de ida
        partidosGenerados.push({
          torneoId: this.torneoId,
          faseId: this._id,
          equipoLocal: equipos[i],
          equipoVisitante: equipos[j],
          jornada: i + 1,
        });

        // Partido de vuelta (si está configurado)
        if (this.configuracion.partidoIdaVuelta) {
          partidosGenerados.push({
            torneoId: this.torneoId,
            faseId: this._id,
            equipoLocal: equipos[j],
            equipoVisitante: equipos[i],
            jornada: equipos.length + i,
          });
        }
      }
    }
  } else if (this.tipo === FormatoFase.GRUPOS) {
    // Generar partidos por grupos
    const { numeroGrupos, equiposPorGrupo } = this.configuracion as any;

    if (!numeroGrupos || !equiposPorGrupo) {
      throw new Error('Configuración de grupos incompleta');
    }

    // Dividir equipos en grupos
    const grupos: mongoose.Types.ObjectId[][] = [];
    for (let i = 0; i < numeroGrupos; i++) {
      grupos.push([]);
    }

    this.equiposParticipantes.forEach((equipo, index) => {
      const grupoIndex = index % numeroGrupos;
      grupos[grupoIndex]!.push(equipo);
    });

    // Generar partidos para cada grupo
    for (let g = 0; g < grupos.length; g++) {
      const equiposGrupo = grupos[g]!;

      for (let i = 0; i < equiposGrupo.length; i++) {
        for (let j = i + 1; j < equiposGrupo.length; j++) {
          partidosGenerados.push({
            torneoId: this.torneoId,
            faseId: this._id,
            equipoLocal: equiposGrupo[i],
            equipoVisitante: equiposGrupo[j],
            grupo: String.fromCharCode(65 + g), // A, B, C, etc.
            jornada: i + 1,
          });

          if (this.configuracion.partidoIdaVuelta) {
            partidosGenerados.push({
              torneoId: this.torneoId,
              faseId: this._id,
              equipoLocal: equiposGrupo[j],
              equipoVisitante: equiposGrupo[i],
              grupo: String.fromCharCode(65 + g),
              jornada: equiposGrupo.length + i,
            });
          }
        }
      }
    }
  } else if (this.tipo === FormatoFase.ELIMINACION_DIRECTA) {
    // Generar llaves de eliminación
    const equipos = this.equiposParticipantes;
    const numPartidos = Math.floor(equipos.length / 2);

    for (let i = 0; i < numPartidos; i++) {
      partidosGenerados.push({
        torneoId: this.torneoId,
        faseId: this._id,
        equipoLocal: equipos[i * 2],
        equipoVisitante: equipos[i * 2 + 1],
        esEliminacion: true,
        jornada: 1,
      });

      if (this.configuracion.partidoIdaVuelta) {
        partidosGenerados.push({
          torneoId: this.torneoId,
          faseId: this._id,
          equipoLocal: equipos[i * 2 + 1],
          equipoVisitante: equipos[i * 2],
          esEliminacion: true,
          jornada: 2,
        });
      }
    }
  }

  // Crear los partidos en la base de datos
  const partidos = await Partido.insertMany(partidosGenerados);
  this.partidos = partidos.map((p) => p._id);
  this.estado = EstadoFase.EN_CURSO;
  await this.save();
};

// Calcular tabla de posiciones
faseSchema.methods.calcularTablaPosiciones = async function (
  this: IFaseDocument
): Promise<any[]> {
  const Partido = mongoose.model('Partido');
  const Equipo = mongoose.model('Equipo');

  const partidos = await Partido.find({
    faseId: this._id,
    estado: 'FINALIZADO',
  });

  // Inicializar tabla
  const tabla: Map<
    string,
    {
      equipo: mongoose.Types.ObjectId;
      puntos: number;
      jugados: number;
      ganados: number;
      empatados: number;
      perdidos: number;
      golesFavor: number;
      golesContra: number;
      diferencia: number;
    }
  > = new Map();

  this.equiposParticipantes.forEach((equipoId) => {
    tabla.set(equipoId.toString(), {
      equipo: equipoId,
      puntos: 0,
      jugados: 0,
      ganados: 0,
      empatados: 0,
      perdidos: 0,
      golesFavor: 0,
      golesContra: 0,
      diferencia: 0,
    });
  });

  // Procesar partidos
  for (const partido of partidos) {
    if (!partido.resultado) continue;

    const { golesLocal, golesVisitante } = partido.resultado;
    const localId = partido.equipoLocal.toString();
    const visitanteId = partido.equipoVisitante.toString();

    const statsLocal = tabla.get(localId);
    const statsVisitante = tabla.get(visitanteId);

    if (!statsLocal || !statsVisitante) continue;

    // Actualizar estadísticas
    statsLocal.jugados++;
    statsVisitante.jugados++;
    statsLocal.golesFavor += golesLocal;
    statsLocal.golesContra += golesVisitante;
    statsVisitante.golesFavor += golesVisitante;
    statsVisitante.golesContra += golesLocal;

    // Determinar resultado
    if (golesLocal > golesVisitante) {
      statsLocal.ganados++;
      statsLocal.puntos += this.configuracion.puntosVictoria || 3;
      statsVisitante.perdidos++;
      statsVisitante.puntos += this.configuracion.puntosDerrota || 0;
    } else if (golesLocal < golesVisitante) {
      statsVisitante.ganados++;
      statsVisitante.puntos += this.configuracion.puntosVictoria || 3;
      statsLocal.perdidos++;
      statsLocal.puntos += this.configuracion.puntosDerrota || 0;
    } else {
      statsLocal.empatados++;
      statsVisitante.empatados++;
      statsLocal.puntos += this.configuracion.puntosEmpate || 1;
      statsVisitante.puntos += this.configuracion.puntosEmpate || 1;
    }

    // Calcular diferencia de goles
    statsLocal.diferencia = statsLocal.golesFavor - statsLocal.golesContra;
    statsVisitante.diferencia = statsVisitante.golesFavor - statsVisitante.golesContra;
  }

  // Convertir a array y ordenar
  const tablaArray = Array.from(tabla.values());

  // Ordenar según criterios de desempate
  tablaArray.sort((a, b) => {
    const criterios = this.configuracion.criteriosDesempate || [
      'PUNTOS',
      'DIFERENCIA_GOLES',
      'GOLES_FAVOR',
    ];

    for (const criterio of criterios) {
      if (criterio === 'PUNTOS' && a.puntos !== b.puntos) {
        return b.puntos - a.puntos;
      }
      if (criterio === 'DIFERENCIA_GOLES' && a.diferencia !== b.diferencia) {
        return b.diferencia - a.diferencia;
      }
      if (criterio === 'GOLES_FAVOR' && a.golesFavor !== b.golesFavor) {
        return b.golesFavor - a.golesFavor;
      }
      if (criterio === 'GOLES_CONTRA' && a.golesContra !== b.golesContra) {
        return a.golesContra - b.golesContra;
      }
      if (criterio === 'PARTIDOS_GANADOS' && a.ganados !== b.ganados) {
        return b.ganados - a.ganados;
      }
    }

    return 0;
  });

  // Poblar información de equipos
  const equiposInfo = await Equipo.find({
    _id: { $in: this.equiposParticipantes },
  }).select('nombre escudo');

  return tablaArray.map((stats, index) => ({
    ...stats,
    posicion: index + 1,
    equipo: equiposInfo.find((e) => e._id.toString() === stats.equipo.toString()),
  }));
};

// Finalizar fase
faseSchema.methods.finalizarFase = async function (this: IFaseDocument): Promise<void> {
  if (this.estado !== EstadoFase.EN_CURSO) {
    throw new Error('Solo se pueden finalizar fases en curso');
  }

  this.estado = EstadoFase.FINALIZADA;
  this.fechaFin = new Date();
  await this.save();
};

// Obtener equipos clasificados
faseSchema.methods.obtenerClasificados = async function (
  this: IFaseDocument,
  cantidad: number
): Promise<mongoose.Types.ObjectId[]> {
  const tabla = await this.calcularTablaPosiciones();
  const clasificados = tabla.slice(0, cantidad).map((pos: any) => pos.equipo._id);

  this.clasificados = clasificados;
  await this.save();

  return clasificados;
};

// ========================================
// MÉTODOS ESTÁTICOS
// ========================================

// Buscar fases por torneo
faseSchema.statics.findByTorneo = function (
  this: IFaseModel,
  torneoId: string
): Promise<IFaseDocument[]> {
  return this.find({ torneoId: new mongoose.Types.ObjectId(torneoId) }).sort({ orden: 1 });
};

// Buscar fase activa de un torneo
faseSchema.statics.findActiva = function (
  this: IFaseModel,
  torneoId: string
): Promise<IFaseDocument | null> {
  return this.findOne({
    torneoId: new mongoose.Types.ObjectId(torneoId),
    estado: EstadoFase.EN_CURSO,
  });
};

// ========================================
// MIDDLEWARES
// ========================================

// Agregar fase al torneo al crear
faseSchema.post('save', async function (doc: IFaseDocument) {
  if (doc.isNew) {
    const Torneo = mongoose.model('Torneo');
    const torneo = await Torneo.findById(doc.torneoId);

    if (torneo && !torneo.fases.includes(doc._id)) {
      torneo.fases.push(doc._id);
      await torneo.save();
    }
  }
});

// ========================================
// EXPORT
// ========================================

export const Fase = mongoose.model<IFaseDocument, IFaseModel>('Fase', faseSchema);
