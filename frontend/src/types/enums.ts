// Convertimos de enum a const con as const para compatibilidad con erasableSyntaxOnly
export const Rol = {
  ADMIN: 'ADMIN',
  DELEGADO: 'DELEGADO',
} as const;

export type Rol = typeof Rol[keyof typeof Rol];

export const TipoJugador = {
  HABITANTE_PROPIETARIO: 'HABITANTE_PROPIETARIO',
  HABITANTE_ARRENDATARIO: 'HABITANTE_ARRENDATARIO',
  FAMILIAR_DIRECTO: 'FAMILIAR_DIRECTO',
  PROPIETARIO_NO_RESIDENTE: 'PROPIETARIO_NO_RESIDENTE',
  POLICIA: 'POLICIA',
  DOCENTE_COLEGIO: 'DOCENTE_COLEGIO',
  DOCENTE_U_COMFACAUCA: 'DOCENTE_U_COMFACAUCA',
  EXTRANJERO: 'EXTRANJERO',
} as const;

export type TipoJugador = typeof TipoJugador[keyof typeof TipoJugador];

export const EstadoValidacion = {
  PENDIENTE: 'PENDIENTE',
  APROBADO: 'APROBADO',
  RECHAZADO: 'RECHAZADO',
} as const;

export type EstadoValidacion = typeof EstadoValidacion[keyof typeof EstadoValidacion];

export const FormatoFase = {
  LIGA: 'LIGA',
  GRUPOS: 'GRUPOS',
  ELIMINACION_DIRECTA: 'ELIMINACION_DIRECTA',
} as const;

export type FormatoFase = typeof FormatoFase[keyof typeof FormatoFase];

export const EstadoPartido = {
  PROGRAMADO: 'PROGRAMADO',
  EN_CURSO: 'EN_CURSO',
  FINALIZADO: 'FINALIZADO',
  SUSPENDIDO: 'SUSPENDIDO',
  APLAZADO: 'APLAZADO',
} as const;

export type EstadoPartido = typeof EstadoPartido[keyof typeof EstadoPartido];
