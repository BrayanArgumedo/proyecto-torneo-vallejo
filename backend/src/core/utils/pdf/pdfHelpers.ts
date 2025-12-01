/**
 * Funciones helper para generación de PDFs
 */

import PDFDocument from 'pdfkit';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { PDF_COLORS, FONT_SIZES, SPACING, TEXT_STYLES, TextStyle } from './pdfStyles';

// ========================================
// TIPOS
// ========================================

export interface TableColumn {
  header: string;
  width: number;
  align?: 'left' | 'center' | 'right';
}

export interface TableRow {
  [key: string]: string | number;
}

export interface TableOptions {
  x: number;
  y: number;
  columns: TableColumn[];
  rows: TableRow[];
  headerBackground?: string;
  alternateRows?: boolean;
  rowHeight?: number;
}

// ========================================
// HEADER Y FOOTER
// ========================================

/**
 * Dibuja header estándar con título
 */
export const drawHeader = (
  doc: PDFDocument,
  title: string,
  subtitle?: string
): void => {
  const pageWidth = doc.page.width;

  // Título
  doc
    .fontSize(TEXT_STYLES.title.fontSize)
    .font(TEXT_STYLES.title.font!)
    .fillColor(TEXT_STYLES.title.color!)
    .text(title, 50, 50, {
      width: pageWidth - 100,
      align: TEXT_STYLES.title.align,
    });

  // Subtítulo (opcional)
  if (subtitle) {
    doc
      .fontSize(TEXT_STYLES.subtitle.fontSize)
      .font(TEXT_STYLES.subtitle.font!)
      .fillColor(TEXT_STYLES.subtitle.color!)
      .text(subtitle, 50, doc.y + SPACING.sm, {
        width: pageWidth - 100,
        align: TEXT_STYLES.subtitle.align,
      });
  }

  // Línea separadora
  doc
    .strokeColor(PDF_COLORS.border)
    .lineWidth(1)
    .moveTo(50, doc.y + SPACING.md)
    .lineTo(pageWidth - 50, doc.y + SPACING.md)
    .stroke();

  doc.moveDown(2);
};

/**
 * Dibuja footer con paginación y fecha
 */
export const drawFooter = (doc: PDFDocument, pageNumber: number): void => {
  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;
  const footerY = pageHeight - 30;

  // Fecha de generación (izquierda)
  const fecha = format(new Date(), "d 'de' MMMM 'de' yyyy, HH:mm", { locale: es });

  doc
    .fontSize(TEXT_STYLES.footer.fontSize)
    .font(TEXT_STYLES.footer.font!)
    .fillColor(TEXT_STYLES.footer.color!)
    .text(`Generado: ${fecha}`, 50, footerY, {
      width: pageWidth - 100,
      align: 'left',
    });

  // Paginación (derecha)
  doc
    .fontSize(TEXT_STYLES.footer.fontSize)
    .font(TEXT_STYLES.footer.font!)
    .fillColor(TEXT_STYLES.footer.color!)
    .text(`Página ${pageNumber}`, 50, footerY, {
      width: pageWidth - 100,
      align: 'right',
    });
};

// ========================================
// TEXTO Y ETIQUETAS
// ========================================

/**
 * Dibuja etiqueta con valor
 */
export const drawLabelValue = (
  doc: PDFDocument,
  label: string,
  value: string,
  x: number,
  y: number,
  options?: { labelWidth?: number; gap?: number }
): void => {
  const labelWidth = options?.labelWidth || 100;
  const gap = options?.gap || SPACING.sm;

  // Etiqueta
  doc
    .fontSize(TEXT_STYLES.label.fontSize)
    .font(TEXT_STYLES.label.font!)
    .fillColor(TEXT_STYLES.label.color!)
    .text(label, x, y, { width: labelWidth, align: 'left' });

  // Valor
  doc
    .fontSize(TEXT_STYLES.value.fontSize)
    .font(TEXT_STYLES.value.font!)
    .fillColor(TEXT_STYLES.value.color!)
    .text(value, x + labelWidth + gap, y, { width: 300 });
};

/**
 * Dibuja texto con estilo
 */
export const drawStyledText = (
  doc: PDFDocument,
  text: string,
  x: number,
  y: number,
  style: TextStyle,
  options?: { width?: number; height?: number }
): void => {
  doc
    .fontSize(style.fontSize)
    .font(style.font || 'Helvetica')
    .fillColor(style.color || PDF_COLORS.text);

  doc.text(text, x, y, {
    width: options?.width,
    height: options?.height,
    align: style.align || 'left',
    lineGap: style.lineGap,
  });
};

// ========================================
// FORMAS Y LÍNEAS
// ========================================

/**
 * Dibuja rectángulo con esquinas redondeadas
 */
export const drawRoundedRect = (
  doc: PDFDocument,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  options?: { fill?: string; stroke?: string; lineWidth?: number }
): void => {
  doc
    .roundedRect(x, y, width, height, radius)
    .lineWidth(options?.lineWidth || 1);

  if (options?.fill) {
    doc.fillColor(options.fill).fill();
  }

  if (options?.stroke) {
    doc.strokeColor(options.stroke).stroke();
  }

  if (!options?.fill && !options?.stroke) {
    doc.stroke();
  }
};

/**
 * Dibuja línea horizontal
 */
export const drawHorizontalLine = (
  doc: PDFDocument,
  x1: number,
  y: number,
  x2: number,
  options?: { color?: string; lineWidth?: number }
): void => {
  doc
    .strokeColor(options?.color || PDF_COLORS.border)
    .lineWidth(options?.lineWidth || 1)
    .moveTo(x1, y)
    .lineTo(x2, y)
    .stroke();
};

/**
 * Dibuja línea vertical
 */
export const drawVerticalLine = (
  doc: PDFDocument,
  x: number,
  y1: number,
  y2: number,
  options?: { color?: string; lineWidth?: number }
): void => {
  doc
    .strokeColor(options?.color || PDF_COLORS.border)
    .lineWidth(options?.lineWidth || 1)
    .moveTo(x, y1)
    .lineTo(x, y2)
    .stroke();
};

// ========================================
// TABLAS
// ========================================

/**
 * Dibuja una tabla completa
 */
export const drawTable = (doc: PDFDocument, options: TableOptions): void => {
  const {
    x,
    y,
    columns,
    rows,
    headerBackground = PDF_COLORS.primary,
    alternateRows = true,
    rowHeight = 20,
  } = options;

  let currentY = y;

  // Calcular ancho total
  const totalWidth = columns.reduce((sum, col) => sum + col.width, 0);

  // Header
  drawTableHeader(doc, x, currentY, columns, headerBackground, rowHeight);
  currentY += rowHeight;

  // Rows
  rows.forEach((row, index) => {
    const backgroundColor =
      alternateRows && index % 2 === 1 ? PDF_COLORS.backgroundDark : PDF_COLORS.white;

    drawTableRow(doc, x, currentY, columns, row, backgroundColor, rowHeight);
    currentY += rowHeight;
  });

  // Borde exterior
  doc
    .rect(x, y, totalWidth, (rows.length + 1) * rowHeight)
    .strokeColor(PDF_COLORS.border)
    .stroke();
};

/**
 * Dibuja header de tabla
 */
const drawTableHeader = (
  doc: PDFDocument,
  x: number,
  y: number,
  columns: TableColumn[],
  backgroundColor: string,
  height: number
): void => {
  const totalWidth = columns.reduce((sum, col) => sum + col.width, 0);

  // Fondo
  doc.rect(x, y, totalWidth, height).fillColor(backgroundColor).fill();

  // Texto de headers
  let currentX = x;
  columns.forEach((col) => {
    doc
      .fontSize(TEXT_STYLES.tableHeader.fontSize)
      .font(TEXT_STYLES.tableHeader.font!)
      .fillColor(TEXT_STYLES.tableHeader.color!)
      .text(col.header, currentX, y + 6, {
        width: col.width,
        align: col.align || 'center',
      });

    currentX += col.width;
  });

  // Bordes
  doc.strokeColor(PDF_COLORS.border).lineWidth(1);
  columns.forEach((col, index) => {
    if (index > 0) {
      const lineX = x + columns.slice(0, index).reduce((sum, c) => sum + c.width, 0);
      drawVerticalLine(doc, lineX, y, y + height);
    }
  });
};

/**
 * Dibuja fila de tabla
 */
const drawTableRow = (
  doc: PDFDocument,
  x: number,
  y: number,
  columns: TableColumn[],
  row: TableRow,
  backgroundColor: string,
  height: number
): void => {
  const totalWidth = columns.reduce((sum, col) => sum + col.width, 0);

  // Fondo
  doc.rect(x, y, totalWidth, height).fillColor(backgroundColor).fill();

  // Texto de celdas
  let currentX = x;
  columns.forEach((col, index) => {
    const key = col.header.toLowerCase().replace(/\s+/g, '');
    const cellValue = row[key] !== undefined ? String(row[key]) : '';

    doc
      .fontSize(TEXT_STYLES.tableCell.fontSize)
      .font(TEXT_STYLES.tableCell.font!)
      .fillColor(TEXT_STYLES.tableCell.color!)
      .text(cellValue, currentX, y + 5, {
        width: col.width,
        align: col.align || 'center',
      });

    currentX += col.width;
  });

  // Bordes verticales
  doc.strokeColor(PDF_COLORS.border).lineWidth(1);
  columns.forEach((col, index) => {
    if (index > 0) {
      const lineX = x + columns.slice(0, index).reduce((sum, c) => sum + c.width, 0);
      drawVerticalLine(doc, lineX, y, y + height);
    }
  });

  // Borde horizontal inferior
  drawHorizontalLine(doc, x, y + height, x + totalWidth);
};

// ========================================
// UTILIDADES
// ========================================

/**
 * Centra texto en el ancho de página
 */
export const centerText = (
  doc: PDFDocument,
  text: string,
  y: number,
  style: TextStyle
): void => {
  const pageWidth = doc.page.width;

  doc
    .fontSize(style.fontSize)
    .font(style.font || 'Helvetica')
    .fillColor(style.color || PDF_COLORS.text)
    .text(text, 50, y, {
      width: pageWidth - 100,
      align: 'center',
    });
};

/**
 * Obtiene el ancho del texto
 */
export const getTextWidth = (doc: PDFDocument, text: string, fontSize: number): number => {
  doc.fontSize(fontSize);
  return doc.widthOfString(text);
};

/**
 * Verifica si necesita nueva página
 */
export const checkPageBreak = (doc: PDFDocument, requiredSpace: number): boolean => {
  const pageHeight = doc.page.height;
  const bottomMargin = 80;

  if (doc.y + requiredSpace > pageHeight - bottomMargin) {
    doc.addPage();
    return true;
  }

  return false;
};
