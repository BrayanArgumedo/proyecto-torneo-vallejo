/**
 * Servicios para generación de reportes PDF
 */

import { Jugador } from '@/features/jugadores/models/jugador.model';
import { Partido } from '@/features/partidos/models/partido.model';
import { Fase } from '@/features/torneos/models/fase.model';
import { ApiError } from '@/core/utils/ApiError';
import { CredencialTemplate, CredencialData } from '@/core/utils/pdf/templates/credencial';
import { PlanillaTemplate, PlanillaData } from '@/core/utils/pdf/templates/planilla';
import { TablaTemplate, TablaData } from '@/core/utils/pdf/templates/tabla';
import { ActaTemplate, ActaData } from '@/core/utils/pdf/templates/acta';

// ========================================
// GENERADOR DE CREDENCIAL
// ========================================

export const generarCredencialJugador = async (jugadorId: string): Promise<Buffer> => {
  // Obtener jugador con relaciones
  const jugador = await Jugador.findById(jugadorId)
    .populate('equipoId', 'nombre escudo torneoId')
    .populate({
      path: 'equipoId',
      populate: {
        path: 'torneoId',
        select: 'nombre año',
      },
    });

  if (!jugador) {
    throw ApiError.notFound('Jugador no encontrado');
  }

  const equipo = jugador.equipoId as any;
  const torneo = equipo?.torneoId;

  if (!equipo || !torneo) {
    throw ApiError.badRequest('El jugador no tiene equipo o torneo asignado');
  }

  // Preparar datos para el template
  const data: CredencialData = {
    jugador: {
      _id: (jugador._id as any).toString(),
      nombre: jugador.nombre,
      apellido: jugador.apellido,
      cedula: jugador.cedula,
      fechaNacimiento: jugador.fechaNacimiento,
      numeroCamiseta: jugador.numeroCamiseta,
      posicion: jugador.posicion,
      tipo: jugador.tipo,
      foto: jugador.foto,
    },
    equipo: {
      nombre: equipo.nombre,
      escudo: equipo.escudo,
    },
    torneo: {
      nombre: torneo.nombre,
      año: torneo.año,
    },
  };

  // Generar PDF
  const template = new CredencialTemplate(data);
  return template.generate();
};

// ========================================
// GENERADOR DE PLANILLA
// ========================================

export const generarPlanillaPartido = async (partidoId: string): Promise<Buffer> => {
  // Obtener partido con todas las relaciones
  const partido = await Partido.findById(partidoId)
    .populate({
      path: 'equipoLocal',
      select: 'nombre delegadoId jugadores',
      populate: [
        { path: 'delegadoId', select: 'nombre apellido' },
        { path: 'jugadores', select: 'nombre apellido numeroCamiseta posicion estadoValidacion' },
      ],
    })
    .populate({
      path: 'equipoVisitante',
      select: 'nombre delegadoId jugadores',
      populate: [
        { path: 'delegadoId', select: 'nombre apellido' },
        { path: 'jugadores', select: 'nombre apellido numeroCamiseta posicion estadoValidacion' },
      ],
    })
    .populate('faseId', 'nombre')
    .populate({
      path: 'torneoId',
      select: 'nombre año',
    });

  if (!partido) {
    throw ApiError.notFound('Partido no encontrado');
  }

  const equipoLocal = partido.equipoLocal as any;
  const equipoVisitante = partido.equipoVisitante as any;
  const fase = partido.faseId as any;
  const torneo = partido.torneoId as any;

  if (!equipoLocal || !equipoVisitante || !fase || !torneo) {
    throw ApiError.badRequest('Datos del partido incompletos');
  }

  // Filtrar solo jugadores validados y ordenar
  const jugadoresLocal = equipoLocal.jugadores
    .filter((j: any) => j.estadoValidacion === 'VALIDADO')
    .sort((a: any, b: any) => a.numeroCamiseta - b.numeroCamiseta);

  const jugadoresVisitante = equipoVisitante.jugadores
    .filter((j: any) => j.estadoValidacion === 'VALIDADO')
    .sort((a: any, b: any) => a.numeroCamiseta - b.numeroCamiseta);

  // Preparar datos
  const data: PlanillaData = {
    partido: {
      fecha: partido.fecha || new Date(),
      cancha: partido.cancha || 'Por definir',
      jornada: partido.jornada || 0,
      grupo: partido.grupo,
    },
    equipoLocal: {
      nombre: equipoLocal.nombre,
      delegado: equipoLocal.delegadoId
        ? `${equipoLocal.delegadoId.nombre} ${equipoLocal.delegadoId.apellido}`
        : 'No asignado',
      jugadores: jugadoresLocal.map((j: any) => ({
        numeroCamiseta: j.numeroCamiseta,
        nombre: j.nombre,
        apellido: j.apellido,
        posicion: j.posicion,
      })),
    },
    equipoVisitante: {
      nombre: equipoVisitante.nombre,
      delegado: equipoVisitante.delegadoId
        ? `${equipoVisitante.delegadoId.nombre} ${equipoVisitante.delegadoId.apellido}`
        : 'No asignado',
      jugadores: jugadoresVisitante.map((j: any) => ({
        numeroCamiseta: j.numeroCamiseta,
        nombre: j.nombre,
        apellido: j.apellido,
        posicion: j.posicion,
      })),
    },
    torneo: {
      nombre: torneo.nombre,
      año: torneo.año,
    },
    fase: {
      nombre: fase.nombre,
    },
  };

  // Generar PDF
  const template = new PlanillaTemplate(data);
  return template.generate();
};

// ========================================
// GENERADOR DE TABLA
// ========================================

export const generarTablaPosiciones = async (faseId: string): Promise<Buffer> => {
  // Obtener fase
  const fase = await Fase.findById(faseId).populate('torneoId', 'nombre año');

  if (!fase) {
    throw ApiError.notFound('Fase no encontrada');
  }

  const torneo = fase.torneoId as any;

  if (!torneo) {
    throw ApiError.badRequest('La fase no tiene torneo asignado');
  }

  // Calcular tabla de posiciones
  const tabla = await fase.calcularTablaPosiciones();

  // Preparar datos
  const data: TablaData = {
    fase: {
      nombre: fase.nombre,
      formato: (fase as any).formato,
      grupo: undefined, // TODO: Agregar si es necesario
    },
    torneo: {
      nombre: torneo.nombre,
      año: torneo.año,
    },
    equipos: tabla.map((stats: any, index: number) => ({
      posicion: index + 1,
      equipo: stats.equipo?.nombre || 'Desconocido',
      pj: stats.jugados,
      pg: stats.ganados,
      pe: stats.empatados,
      pp: stats.perdidos,
      gf: stats.golesFavor,
      gc: stats.golesContra,
      dif: stats.diferencia,
      pts: stats.puntos,
    })),
    clasificados: (fase.configuracion as any)?.clasificanPorGrupo,
    eliminados: (fase.configuracion as any)?.eliminanPorGrupo,
  };

  // Generar PDF
  const template = new TablaTemplate(data);
  return template.generate();
};

// ========================================
// GENERADOR DE ACTA
// ========================================

export const generarActaPartido = async (partidoId: string): Promise<Buffer> => {
  // Obtener partido
  const partido = await Partido.findById(partidoId)
    .populate('equipoLocal', 'nombre')
    .populate('equipoVisitante', 'nombre')
    .populate('faseId', 'nombre')
    .populate('torneoId', 'nombre año')
    .populate({
      path: 'goles.jugador',
      select: 'nombre apellido',
    })
    .populate({
      path: 'tarjetas.jugador',
      select: 'nombre apellido',
    });

  if (!partido) {
    throw ApiError.notFound('Partido no encontrado');
  }

  if (partido.estado !== 'FINALIZADO') {
    throw ApiError.badRequest('El partido debe estar finalizado para generar el acta');
  }

  const equipoLocal = partido.equipoLocal as any;
  const equipoVisitante = partido.equipoVisitante as any;
  const fase = partido.faseId as any;
  const torneo = partido.torneoId as any;
  const resultado = partido.resultado as any;

  // Preparar datos
  const data: ActaData = {
    partido: {
      fecha: partido.fecha || new Date(),
      cancha: partido.cancha || 'No especificada',
      jornada: partido.jornada || 0,
      grupo: partido.grupo,
    },
    equipoLocal: {
      nombre: equipoLocal?.nombre || 'Desconocido',
      goles: resultado?.golesLocal || 0,
    },
    equipoVisitante: {
      nombre: equipoVisitante?.nombre || 'Desconocido',
      goles: resultado?.golesVisitante || 0,
    },
    torneo: {
      nombre: torneo?.nombre || 'Torneo',
      año: torneo?.año || new Date().getFullYear(),
    },
    fase: {
      nombre: fase?.nombre || 'Fase',
    },
    goles: partido.goles.map((gol: any) => {
      const jugador = gol.jugador;
      const equipoGol = gol.equipo?.toString() === equipoLocal?._id.toString()
        ? equipoLocal
        : equipoVisitante;

      return {
        jugador: jugador ? `${jugador.nombre} ${jugador.apellido}` : 'Desconocido',
        equipo: equipoGol?.nombre || 'Desconocido',
        minuto: gol.minuto,
        tipo: gol.esAutogol ? 'AUTOGOL' : 'NORMAL',
      };
    }),
    tarjetas: partido.tarjetas.map((tarjeta: any) => {
      const jugador = tarjeta.jugador;
      const equipoTarjeta = tarjeta.equipo?.toString() === equipoLocal?._id.toString()
        ? equipoLocal
        : equipoVisitante;

      return {
        jugador: jugador ? `${jugador.nombre} ${jugador.apellido}` : 'Desconocido',
        equipo: equipoTarjeta?.nombre || 'Desconocido',
        minuto: tarjeta.minuto,
        tipo: tarjeta.tipo,
        motivo: undefined, // TODO: Agregar motivo si está en el modelo
      };
    }),
    arbitro: undefined, // TODO: Agregar árbitro si está en el modelo
    observaciones: partido.observaciones,
  };

  // Generar PDF
  const template = new ActaTemplate(data);
  return template.generate();
};
