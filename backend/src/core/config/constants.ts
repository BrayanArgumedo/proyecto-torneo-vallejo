/**
 * Constantes del reglamento del torneo
 */

// ========================================
// REGLAS DE JUGADORES
// ========================================

export const REGLAMENTO = {
  // Límites de jugadores por equipo
  MAX_JUGADORES_POR_EQUIPO: 16,
  MIN_JUGADORES_POR_EQUIPO: 11,

  // Cuotas de jugadores especiales
  MAX_EXTRANJEROS: 3,
  MAX_DOCENTES_EL_DORADO: 2,
  MAX_TRABAJADORES_EL_DORADO: 2, // Incluidos en el límite de docentes
  MAX_DOCENTES_FUNDACION: 2,
  MAX_TRABAJADORES_FUNDACION: 2, // Incluidos en el límite de docentes
  MAX_PADRES_FUNDACION: 2, // Incluidos en el límite de fundación

  // Edades
  EDAD_MINIMA_EXTRANJEROS: 26,
  EDAD_MINIMA_GENERAL: 16,
  EDAD_MAXIMA_GENERAL: 60,

  // Números de camiseta
  NUMERO_CAMISETA_MIN: 1,
  NUMERO_CAMISETA_MAX: 20,

  // Bonificaciones (Fase 2+)
  BONIFICACION_PRIMER_LUGAR: 0.75,
  BONIFICACION_SEGUNDO_LUGAR: 0.50,
} as const;

// ========================================
// FORMATOS DE VALIDACIÓN
// ========================================

export const VALIDACION = {
  // Formatos de archivos permitidos
  FORMATOS_DOCUMENTO: [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
  ],
  EXTENSIONES_DOCUMENTO: ['.pdf', '.jpg', '.jpeg', '.png'],

  // Tamaños máximos
  MAX_SIZE_DOCUMENTO: 5 * 1024 * 1024, // 5MB
  MAX_SIZE_FOTO: 2 * 1024 * 1024, // 2MB
  MAX_SIZE_ESCUDO: 1 * 1024 * 1024, // 1MB

  // Dimensiones de imágenes
  MAX_WIDTH_FOTO: 1000,
  MAX_HEIGHT_FOTO: 1000,
  MAX_WIDTH_ESCUDO: 500,
  MAX_HEIGHT_ESCUDO: 500,
} as const;

// ========================================
// MENSAJES DE ERROR
// ========================================

export const ERRORES = {
  // Jugadores
  MAX_JUGADORES_ALCANZADO: `Ya se alcanzó el máximo de ${REGLAMENTO.MAX_JUGADORES_POR_EQUIPO} jugadores`,
  MAX_EXTRANJEROS_ALCANZADO: `Ya se alcanzó el máximo de ${REGLAMENTO.MAX_EXTRANJEROS} jugadores extranjeros`,
  MAX_DOCENTES_EL_DORADO_ALCANZADO: `Ya se alcanzó el máximo de ${REGLAMENTO.MAX_DOCENTES_EL_DORADO} docentes/trabajadores de I.E. El Dorado`,
  MAX_DOCENTES_FUNDACION_ALCANZADO: `Ya se alcanzó el máximo de ${REGLAMENTO.MAX_DOCENTES_FUNDACION} docentes/trabajadores/padres de Fundación Vallejo`,
  EDAD_MINIMA_EXTRANJERO: `Los jugadores extranjeros deben tener al menos ${REGLAMENTO.EDAD_MINIMA_EXTRANJEROS} años`,
  CEDULA_DUPLICADA: 'Ya existe un jugador registrado con esta cédula',
  NUMERO_CAMISETA_DUPLICADO: 'Este número de camiseta ya está asignado en el equipo',
  NUMERO_CAMISETA_INVALIDO: `El número de camiseta debe estar entre ${REGLAMENTO.NUMERO_CAMISETA_MIN} y ${REGLAMENTO.NUMERO_CAMISETA_MAX}`,

  // Equipos
  EQUIPO_NO_ENCONTRADO: 'Equipo no encontrado',
  NOMBRE_EQUIPO_DUPLICADO: 'Ya existe un equipo con este nombre',

  // Usuarios
  EMAIL_DUPLICADO: 'Ya existe un usuario con este email',
  CREDENCIALES_INVALIDAS: 'Email o contraseña incorrectos',
  USUARIO_NO_ENCONTRADO: 'Usuario no encontrado',
  ACCESO_DENEGADO: 'No tienes permisos para realizar esta acción',

  // Torneos
  TORNEO_NO_ENCONTRADO: 'Torneo no encontrado',
  FASE_NO_ENCONTRADA: 'Fase no encontrada',

  // Archivos
  ARCHIVO_MUY_GRANDE: 'El archivo excede el tamaño máximo permitido',
  FORMATO_NO_PERMITIDO: 'Formato de archivo no permitido',
} as const;

// ========================================
// MENSAJES DE ÉXITO
// ========================================

export const EXITO = {
  JUGADOR_VALIDADO: 'Jugador validado correctamente',
  JUGADOR_RECHAZADO: 'Jugador rechazado',
  EQUIPO_CREADO: 'Equipo creado correctamente',
  TORNEO_CREADO: 'Torneo creado correctamente',
  FASE_CREADA: 'Fase creada correctamente',
  CALENDARIO_GENERADO: 'Calendario generado correctamente',
} as const;
