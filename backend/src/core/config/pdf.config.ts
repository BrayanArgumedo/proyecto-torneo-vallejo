/**
 * Configuración global para generación de PDFs
 */

// ========================================
// CONFIGURACIÓN DE PÁGINA
// ========================================

export const PDF_CONFIG = {
  // Tamaño de página
  size: 'LETTER' as const, // 8.5" x 11"

  // Márgenes (en puntos, 1 punto = 1/72 pulgada)
  margins: {
    top: 50,
    bottom: 50,
    left: 50,
    right: 50,
  },

  // Info del documento
  info: {
    author: 'Sistema Torneo Vallejo',
    creator: 'Torneo Vallejo API',
  },

  // Opciones de compresión
  compress: true,

  // Auto kerning
  autoFirstPage: true,
} as const;

// ========================================
// CONFIGURACIÓN DE CREDENCIALES
// ========================================

export const CREDENCIAL_CONFIG = {
  width: 340, // 3.4 pulgadas
  height: 214, // 2.14 pulgadas (tamaño tarjeta de crédito)

  // Espacio para foto
  foto: {
    width: 100,
    height: 120,
  },

  // QR Code
  qr: {
    size: 80,
  },
} as const;

// ========================================
// CONFIGURACIÓN DE TABLAS
// ========================================

export const TABLA_CONFIG = {
  headerHeight: 25,
  rowHeight: 20,
  cellPadding: 5,

  // Anchos de columnas para tabla de posiciones
  columnWidths: {
    pos: 30,      // Posición
    equipo: 150,  // Nombre del equipo
    pj: 30,       // Partidos jugados
    pg: 30,       // Partidos ganados
    pe: 30,       // Partidos empatados
    pp: 30,       // Partidos perdidos
    gf: 30,       // Goles a favor
    gc: 30,       // Goles en contra
    dif: 35,      // Diferencia de goles
    pts: 35,      // Puntos
  },
} as const;

// ========================================
// CONFIGURACIÓN DE PLANILLAS
// ========================================

export const PLANILLA_CONFIG = {
  // Espacios para alineaciones
  jugadoresTitulares: 11,
  jugadoresSuplentes: 5,

  // Alto de filas
  rowHeight: 22,

  // Espacio para firmas
  firmaHeight: 60,
} as const;

// ========================================
// RUTAS DE ASSETS
// ========================================

export const PDF_ASSETS = {
  // Logo del torneo (opcional, agregar después)
  logo: null as string | null,

  // Marca de agua (opcional)
  watermark: null as string | null,

  // Fuente por defecto (Helvetica viene incluida en PDFKit)
  defaultFont: 'Helvetica',
  defaultFontBold: 'Helvetica-Bold',
  defaultFontItalic: 'Helvetica-Oblique',
} as const;

// ========================================
// CONFIGURACIÓN DE EXPORTS
// ========================================

export const EXPORT_CONFIG = {
  // Nombres de archivos por defecto
  fileNames: {
    credencial: (jugadorNombre: string) =>
      `credencial-${jugadorNombre.replace(/\s+/g, '-').toLowerCase()}.pdf`,
    planilla: (equipoLocal: string, equipoVisitante: string) =>
      `planilla-${equipoLocal}-vs-${equipoVisitante}.pdf`,
    tabla: (faseNombre: string) =>
      `tabla-${faseNombre.replace(/\s+/g, '-').toLowerCase()}.pdf`,
    acta: (equipoLocal: string, equipoVisitante: string) =>
      `acta-${equipoLocal}-vs-${equipoVisitante}.pdf`,
  },

  // Content-Disposition
  inline: false, // false = descarga, true = abre en navegador
} as const;
