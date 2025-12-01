/**
 * 🌍 Environment Configuration - Production
 *
 * Variables de entorno para producción.
 * Cambiar apiUrl cuando se despliegue el backend.
 */

export const environment = {
  production: true,
  apiUrl: 'https://api-torneo-vallejo.com/api', // TODO: Cambiar por URL real

  appName: 'Torneo Vallejo',
  appVersion: '1.0.0',

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
