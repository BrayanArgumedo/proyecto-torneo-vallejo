/**
 * 🌍 Environment Configuration - Development
 *
 * Este archivo contiene las variables de entorno para desarrollo local.
 * El backend debe estar corriendo en http://localhost:5001
 */

export const environment = {
  production: false,
  apiUrl: 'http://localhost:5001/api',

  // Configuraciones adicionales
  appName: 'Torneo Vallejo',
  appVersion: '1.0.0',

  // Límites del reglamento (para validaciones en frontend)
  reglamento: {
    maxJugadoresPorEquipo: 16,
    minJugadoresPorEquipo: 11,
    maxExtranjeros: 3,
    maxDocentesElDorado: 2,
    maxDocentesFundacion: 2,
    edadMinimaGeneral: 16,
    edadMaximaGeneral: 60,
    edadMinimaExtranjeros: 26,
  }
};
