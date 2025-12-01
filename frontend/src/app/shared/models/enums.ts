/**
 * 🎯 ENUMS COMPARTIDOS - Sistema Torneo Vallejo
 *
 * Estos enums deben coincidir EXACTAMENTE con los del backend
 * ubicados en: backend/src/shared/types/enums.ts
 */

// ============================================
// 👥 USUARIOS
// ============================================

export enum Rol {
  ADMIN = 'ADMIN',
  DELEGADO = 'DELEGADO'
}

export enum EstadoUsuario {
  ACTIVO = 'ACTIVO',
  INACTIVO = 'INACTIVO',
  SUSPENDIDO = 'SUSPENDIDO'
}

// ============================================
// ⚽ EQUIPOS
// ============================================

export enum EstadoEquipo {
  PENDIENTE = 'PENDIENTE',
  APROBADO = 'APROBADO',
  RECHAZADO = 'RECHAZADO',
  ELIMINADO = 'ELIMINADO'
}

// ============================================
// 👤 JUGADORES - 13 TIPOS
// ============================================

export enum TipoJugador {
  // Habitantes (sin límite)
  HABITANTE_PROPIETARIO = 'HABITANTE_PROPIETARIO',
  HABITANTE_HIJO = 'HABITANTE_HIJO',
  HABITANTE_ARRENDATARIO = 'HABITANTE_ARRENDATARIO',

  // I.E. El Dorado
  DOCENTE_ELDORADO = 'DOCENTE_ELDORADO',           // Máx 2
  TRABAJADOR_ELDORADO = 'TRABAJADOR_ELDORADO',     // Máx 2
  ESTUDIANTE_ELDORADO = 'ESTUDIANTE_ELDORADO',     // Sin límite
  PADRE_ELDORADO = 'PADRE_ELDORADO',               // Sin límite

  // Fundación Vallejo
  DOCENTE_FUNDACION = 'DOCENTE_FUNDACION',         // Máx 2
  TRABAJADOR_FUNDACION = 'TRABAJADOR_FUNDACION',   // Máx 2
  PADRE_FUNDACION = 'PADRE_FUNDACION',             // Sin límite

  // Extranjeros (máx 3, edad mínima 26 años)
  EXTRANJERO_HABITANTE = 'EXTRANJERO_HABITANTE',
  EXTRANJERO_ELDORADO = 'EXTRANJERO_ELDORADO',
  EXTRANJERO_FUNDACION = 'EXTRANJERO_FUNDACION'
}

export enum PosicionJugador {
  PORTERO = 'PORTERO',
  DEFENSA = 'DEFENSA',
  VOLANTE = 'VOLANTE',
  DELANTERO = 'DELANTERO'
}

export enum EstadoValidacionJugador {
  PENDIENTE = 'PENDIENTE',
  VALIDADO = 'VALIDADO',
  RECHAZADO = 'RECHAZADO'
}

export enum TipoDocumento {
  CEDULA = 'CEDULA',
  RECIBO_SERVICIOS = 'RECIBO_SERVICIOS',
  CONTRATO_ARRENDAMIENTO = 'CONTRATO_ARRENDAMIENTO',
  CERTIFICADO_LABORAL = 'CERTIFICADO_LABORAL',
  CERTIFICADO_ESTUDIO = 'CERTIFICADO_ESTUDIO',
  CARTA_AVAL = 'CARTA_AVAL',
  OTRO = 'OTRO'
}

// ============================================
// 🏆 TORNEOS
// ============================================

export enum EstadoTorneo {
  CONFIGURACION = 'CONFIGURACION',
  REGISTRO = 'REGISTRO',
  EN_CURSO = 'EN_CURSO',
  FINALIZADO = 'FINALIZADO',
  CANCELADO = 'CANCELADO'
}

// ============================================
// 📊 FASES
// ============================================

export enum FormatoFase {
  GRUPOS = 'GRUPOS',
  ELIMINACION_DIRECTA = 'ELIMINACION_DIRECTA',
  LIGA = 'LIGA'
}

export enum EstadoFase {
  CONFIGURACION = 'CONFIGURACION',
  EN_CURSO = 'EN_CURSO',
  FINALIZADA = 'FINALIZADA',
  CANCELADA = 'CANCELADA'
}

// ============================================
// ⚽ PARTIDOS
// ============================================

export enum EstadoPartido {
  PROGRAMADO = 'PROGRAMADO',
  EN_CURSO = 'EN_CURSO',
  FINALIZADO = 'FINALIZADO',
  CANCELADO = 'CANCELADO',
  APLAZADO = 'APLAZADO'
}

export enum TipoGol {
  NORMAL = 'NORMAL',
  PENAL = 'PENAL',
  AUTOGOL = 'AUTOGOL'
}

export enum TipoTarjeta {
  AMARILLA = 'AMARILLA',
  ROJA = 'ROJA'
}

// ============================================
// 🎨 HELPERS - Labels para UI
// ============================================

export const TipoJugadorLabels: Record<TipoJugador, string> = {
  [TipoJugador.HABITANTE_PROPIETARIO]: 'Habitante Propietario',
  [TipoJugador.HABITANTE_HIJO]: 'Hijo de Habitante',
  [TipoJugador.HABITANTE_ARRENDATARIO]: 'Habitante Arrendatario',
  [TipoJugador.DOCENTE_ELDORADO]: 'Docente I.E. El Dorado',
  [TipoJugador.TRABAJADOR_ELDORADO]: 'Trabajador I.E. El Dorado',
  [TipoJugador.ESTUDIANTE_ELDORADO]: 'Estudiante I.E. El Dorado',
  [TipoJugador.PADRE_ELDORADO]: 'Padre de Familia I.E. El Dorado',
  [TipoJugador.DOCENTE_FUNDACION]: 'Docente Fundación Vallejo',
  [TipoJugador.TRABAJADOR_FUNDACION]: 'Trabajador Fundación Vallejo',
  [TipoJugador.PADRE_FUNDACION]: 'Padre de Familia Fundación',
  [TipoJugador.EXTRANJERO_HABITANTE]: 'Extranjero con Aval de Habitante',
  [TipoJugador.EXTRANJERO_ELDORADO]: 'Extranjero con Aval I.E. El Dorado',
  [TipoJugador.EXTRANJERO_FUNDACION]: 'Extranjero con Aval Fundación'
};

export const EstadoValidacionLabels: Record<EstadoValidacionJugador, { label: string, severity: string }> = {
  [EstadoValidacionJugador.PENDIENTE]: { label: 'Pendiente', severity: 'warning' },
  [EstadoValidacionJugador.VALIDADO]: { label: 'Validado', severity: 'success' },
  [EstadoValidacionJugador.RECHAZADO]: { label: 'Rechazado', severity: 'danger' }
};
