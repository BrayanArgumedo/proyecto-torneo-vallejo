/**
 * Enums compartidos del sistema
 */

// ========================================
// USUARIOS
// ========================================

export enum RolUsuario {
  ADMIN = 'ADMIN',
  DELEGADO = 'DELEGADO',
}

export enum EstadoUsuario {
  ACTIVO = 'ACTIVO',
  INACTIVO = 'INACTIVO',
}

// ========================================
// EQUIPOS
// ========================================

export enum EstadoEquipo {
  PENDIENTE = 'PENDIENTE',
  VALIDADO = 'VALIDADO',
  RECHAZADO = 'RECHAZADO',
}

// ========================================
// JUGADORES
// ========================================

export enum TipoJugador {
  // Habitantes
  HABITANTE_PROPIETARIO = 'HABITANTE_PROPIETARIO',
  HABITANTE_ARRENDATARIO = 'HABITANTE_ARRENDATARIO',
  HABITANTE_ESPOSO = 'HABITANTE_ESPOSO',
  HABITANTE_HIJO = 'HABITANTE_HIJO',
  HABITANTE_YERNO = 'HABITANTE_YERNO',

  // Propietarios no residentes
  PROPIETARIO_NO_RESIDENTE = 'PROPIETARIO_NO_RESIDENTE',

  // Policía
  POLICIA_VALLEJO = 'POLICIA_VALLEJO',

  // Docentes/Trabajadores El Dorado
  DOCENTE_EL_DORADO = 'DOCENTE_EL_DORADO',
  TRABAJADOR_EL_DORADO = 'TRABAJADOR_EL_DORADO',

  // Docentes/Trabajadores/Padres Fundación
  DOCENTE_FUNDACION = 'DOCENTE_FUNDACION',
  TRABAJADOR_FUNDACION = 'TRABAJADOR_FUNDACION',
  PADRE_FUNDACION = 'PADRE_FUNDACION',
}

export enum EstadoValidacion {
  PENDIENTE = 'PENDIENTE',
  VALIDADO = 'VALIDADO',
  RECHAZADO = 'RECHAZADO',
}

export enum TipoDocumento {
  CEDULA = 'CEDULA',
  RECIBO_SERVICIO = 'RECIBO_SERVICIO',
  CONTRATO_ARRENDAMIENTO = 'CONTRATO_ARRENDAMIENTO',
  REGISTRO_CIVIL = 'REGISTRO_CIVIL',
  CERTIFICADO_LABORAL = 'CERTIFICADO_LABORAL',
  CARTA_INSTITUCION = 'CARTA_INSTITUCION',
  CERTIFICADO_POLICIA = 'CERTIFICADO_POLICIA',
  OTRO = 'OTRO',
}

export enum Posicion {
  PORTERO = 'PORTERO',
  DEFENSA = 'DEFENSA',
  VOLANTE = 'VOLANTE',
  DELANTERO = 'DELANTERO',
}

// ========================================
// TORNEOS
// ========================================

export enum EstadoTorneo {
  CONFIGURACION = 'CONFIGURACION',
  EN_CURSO = 'EN_CURSO',
  FINALIZADO = 'FINALIZADO',
  CANCELADO = 'CANCELADO',
}

// ========================================
// FASES
// ========================================

export enum FormatoFase {
  LIGA = 'LIGA',
  GRUPOS = 'GRUPOS',
  ELIMINACION_DIRECTA = 'ELIMINACION_DIRECTA',
}

export enum TipoEliminacion {
  SIMPLE = 'SIMPLE',
  IDA_VUELTA = 'IDA_VUELTA',
}

export enum EstadoFase {
  CONFIGURACION = 'CONFIGURACION',
  EN_CURSO = 'EN_CURSO',
  FINALIZADA = 'FINALIZADA',
}

// ========================================
// PARTIDOS
// ========================================

export enum EstadoPartido {
  PROGRAMADO = 'PROGRAMADO',
  EN_CURSO = 'EN_CURSO',
  FINALIZADO = 'FINALIZADO',
  SUSPENDIDO = 'SUSPENDIDO',
  CANCELADO = 'CANCELADO',
}

export enum TipoTarjeta {
  AMARILLA = 'AMARILLA',
  ROJA = 'ROJA',
}

// ========================================
// HELPERS
// ========================================

/**
 * Verificar si un tipo de jugador es "extranjero" (no habitante)
 */
export const esJugadorExtranjero = (tipo: TipoJugador): boolean => {
  const tiposExtranjeros = [
    TipoJugador.PROPIETARIO_NO_RESIDENTE,
    TipoJugador.POLICIA_VALLEJO,
    TipoJugador.DOCENTE_EL_DORADO,
    TipoJugador.TRABAJADOR_EL_DORADO,
    TipoJugador.DOCENTE_FUNDACION,
    TipoJugador.TRABAJADOR_FUNDACION,
    TipoJugador.PADRE_FUNDACION,
  ];

  return tiposExtranjeros.includes(tipo);
};

/**
 * Verificar si un tipo de jugador es de El Dorado
 */
export const esJugadorElDorado = (tipo: TipoJugador): boolean => {
  return [
    TipoJugador.DOCENTE_EL_DORADO,
    TipoJugador.TRABAJADOR_EL_DORADO,
  ].includes(tipo);
};

/**
 * Verificar si un tipo de jugador es de Fundación
 */
export const esJugadorFundacion = (tipo: TipoJugador): boolean => {
  return [
    TipoJugador.DOCENTE_FUNDACION,
    TipoJugador.TRABAJADOR_FUNDACION,
    TipoJugador.PADRE_FUNDACION,
  ].includes(tipo);
};

/**
 * Obtener etiqueta legible de tipo de jugador
 */
export const getEtiquetaTipoJugador = (tipo: TipoJugador): string => {
  const etiquetas: Record<TipoJugador, string> = {
    [TipoJugador.HABITANTE_PROPIETARIO]: 'Habitante - Propietario',
    [TipoJugador.HABITANTE_ARRENDATARIO]: 'Habitante - Arrendatario',
    [TipoJugador.HABITANTE_ESPOSO]: 'Habitante - Esposo',
    [TipoJugador.HABITANTE_HIJO]: 'Habitante - Hijo',
    [TipoJugador.HABITANTE_YERNO]: 'Habitante - Yerno',
    [TipoJugador.PROPIETARIO_NO_RESIDENTE]: 'Propietario No Residente',
    [TipoJugador.POLICIA_VALLEJO]: 'Policía Estación Vallejo',
    [TipoJugador.DOCENTE_EL_DORADO]: 'Docente I.E. El Dorado',
    [TipoJugador.TRABAJADOR_EL_DORADO]: 'Trabajador I.E. El Dorado',
    [TipoJugador.DOCENTE_FUNDACION]: 'Docente Fundación Vallejo',
    [TipoJugador.TRABAJADOR_FUNDACION]: 'Trabajador Fundación Vallejo',
    [TipoJugador.PADRE_FUNDACION]: 'Padre de Familia Fundación Vallejo',
  };

  return etiquetas[tipo] || tipo;
};
