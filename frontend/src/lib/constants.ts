// Constantes del reglamento del torneo
export const TORNEO_CONSTANTS = {
  MAX_JUGADORES_POR_EQUIPO: 16,
  MIN_JUGADORES_POR_EQUIPO: 10,
  MAX_DOCENTES_POR_INSTITUCION: 2,
  MAX_EXTRANJEROS: 3,
  EDAD_MINIMA_EXTRANJERO: 26,
  MIN_NUMERO_CAMISETA: 1,
  MAX_NUMERO_CAMISETA: 20,
};

export const INSTITUCIONES = {
  COLEGIO_VALLEJO: 'COLEGIO_VALLEJO',
  INSTITUCION_EDUCATIVA: 'INSTITUCION_EDUCATIVA',
} as const;

export const APP_CONFIG = {
  APP_NAME: 'Torneo Vallejo',
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'],
};
