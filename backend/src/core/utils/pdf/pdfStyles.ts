/**
 * Estilos y colores para PDFs
 */

// ========================================
// PALETA DE COLORES
// ========================================

export const PDF_COLORS = {
  // Colores principales
  primary: '#1E40AF',       // Azul oscuro
  secondary: '#10B981',     // Verde
  accent: '#F59E0B',        // Naranja

  // Colores de texto
  text: '#1F2937',          // Gris oscuro
  textLight: '#6B7280',     // Gris medio
  textMuted: '#9CA3AF',     // Gris claro

  // Colores de fondo
  background: '#F9FAFB',    // Gris muy claro
  backgroundDark: '#E5E7EB', // Gris claro
  white: '#FFFFFF',
  black: '#000000',

  // Bordes
  border: '#E5E7EB',        // Gris claro
  borderDark: '#D1D5DB',    // Gris medio

  // Estados
  success: '#10B981',       // Verde
  warning: '#F59E0B',       // Naranja
  danger: '#EF4444',        // Rojo
  info: '#3B82F6',          // Azul

  // Específicos del torneo
  clasificado: '#D1FAE5',   // Verde muy claro
  eliminado: '#FEE2E2',     // Rojo muy claro
} as const;

// ========================================
// TAMAÑOS DE FUENTE
// ========================================

export const FONT_SIZES = {
  // Títulos
  h1: 24,
  h2: 20,
  h3: 16,
  h4: 14,

  // Contenido
  large: 13,
  normal: 11,
  small: 9,
  tiny: 7,

  // Específicos
  tableHeader: 11,
  tableBody: 10,
  footer: 8,
} as const;

// ========================================
// ESPACIADOS
// ========================================

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

// ========================================
// ESTILOS DE TEXTO
// ========================================

export interface TextStyle {
  fontSize: number;
  font?: string;
  color?: string;
  align?: 'left' | 'center' | 'right' | 'justify';
  lineGap?: number;
}

export const TEXT_STYLES = {
  // Títulos
  title: {
    fontSize: FONT_SIZES.h1,
    font: 'Helvetica-Bold',
    color: PDF_COLORS.primary,
    align: 'center' as const,
    lineGap: 8,
  },

  subtitle: {
    fontSize: FONT_SIZES.h2,
    font: 'Helvetica-Bold',
    color: PDF_COLORS.text,
    align: 'center' as const,
    lineGap: 6,
  },

  heading: {
    fontSize: FONT_SIZES.h3,
    font: 'Helvetica-Bold',
    color: PDF_COLORS.text,
    lineGap: 4,
  },

  subheading: {
    fontSize: FONT_SIZES.h4,
    font: 'Helvetica-Bold',
    color: PDF_COLORS.textLight,
    lineGap: 3,
  },

  // Contenido
  body: {
    fontSize: FONT_SIZES.normal,
    font: 'Helvetica',
    color: PDF_COLORS.text,
    lineGap: 3,
  },

  bodyBold: {
    fontSize: FONT_SIZES.normal,
    font: 'Helvetica-Bold',
    color: PDF_COLORS.text,
    lineGap: 3,
  },

  bodySmall: {
    fontSize: FONT_SIZES.small,
    font: 'Helvetica',
    color: PDF_COLORS.textLight,
    lineGap: 2,
  },

  // Tablas
  tableHeader: {
    fontSize: FONT_SIZES.tableHeader,
    font: 'Helvetica-Bold',
    color: PDF_COLORS.white,
    align: 'center' as const,
  },

  tableCell: {
    fontSize: FONT_SIZES.tableBody,
    font: 'Helvetica',
    color: PDF_COLORS.text,
    align: 'center' as const,
  },

  tableCellBold: {
    fontSize: FONT_SIZES.tableBody,
    font: 'Helvetica-Bold',
    color: PDF_COLORS.text,
    align: 'center' as const,
  },

  // Footer
  footer: {
    fontSize: FONT_SIZES.footer,
    font: 'Helvetica',
    color: PDF_COLORS.textMuted,
    align: 'center' as const,
  },

  // Etiquetas
  label: {
    fontSize: FONT_SIZES.small,
    font: 'Helvetica-Bold',
    color: PDF_COLORS.textLight,
  },

  value: {
    fontSize: FONT_SIZES.normal,
    font: 'Helvetica',
    color: PDF_COLORS.text,
  },
} as const;

// ========================================
// HELPERS DE ESTILOS
// ========================================

/**
 * Convierte hex a RGB
 */
export const hexToRgb = (hex: string): [number, number, number] => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    return [0, 0, 0];
  }
  return [
    parseInt(result[1]!, 16) / 255,
    parseInt(result[2]!, 16) / 255,
    parseInt(result[3]!, 16) / 255,
  ];
};

/**
 * Aplica opacidad a un color hex
 */
export const withOpacity = (hex: string, opacity: number): string => {
  const rgb = hexToRgb(hex);
  return `rgba(${Math.round(rgb[0] * 255)}, ${Math.round(rgb[1] * 255)}, ${Math.round(rgb[2] * 255)}, ${opacity})`;
};
