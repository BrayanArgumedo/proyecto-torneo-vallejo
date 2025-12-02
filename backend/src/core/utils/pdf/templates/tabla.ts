/**
 * Template para generar tabla de posiciones en PDF
 */

import { PDFGenerator } from '../pdfGenerator';
import { PDF_COLORS, FONT_SIZES } from '../pdfStyles';
import { drawHeader, TableColumn } from '../pdfHelpers';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// ========================================
// TIPOS
// ========================================

export interface EquipoTabla {
  posicion: number;
  equipo: string;
  pj: number;  // Partidos jugados
  pg: number;  // Partidos ganados
  pe: number;  // Partidos empatados
  pp: number;  // Partidos perdidos
  gf: number;  // Goles a favor
  gc: number;  // Goles en contra
  dif: number; // Diferencia de goles
  pts: number; // Puntos
}

export interface TablaData {
  fase: {
    nombre: string;
    formato: string;
    grupo?: string;
  };
  torneo: {
    nombre: string;
    año: number;
  };
  equipos: EquipoTabla[];
  clasificados?: number; // Número de equipos que clasifican
  eliminados?: number;   // Número de equipos que se eliminan
}

// ========================================
// GENERADOR DE TABLA
// ========================================

export class TablaTemplate extends PDFGenerator {
  private data: TablaData;

  constructor(data: TablaData) {
    super({
      title: `Tabla de Posiciones - ${data.fase.nombre}`,
      subject: 'Tabla de Posiciones',
      keywords: 'tabla, posiciones, torneo',
    });

    this.data = data;
  }

  /**
   * Genera el PDF completo de la tabla
   */
  async generate(): Promise<Buffer> {
    this.drawTabla();
    return this.toBuffer();
  }

  /**
   * Dibuja la tabla completa
   */
  private drawTabla(): void {
    const doc = this.doc;
    const { fase, torneo, clasificados, eliminados } = this.data;

    // Header
    const subtitle = fase.grupo ? `${fase.nombre} - Grupo ${fase.grupo}` : fase.nombre;
    drawHeader(doc, `${torneo.nombre} ${torneo.año}`, subtitle);

    doc.moveDown(2);

    // Leyenda de clasificación (si aplica)
    if (clasificados || eliminados) {
      this.drawLeyenda();
      doc.moveDown(1.5);
    }

    // Tabla principal
    this.drawTablaPosiciones();

    // Notas al pie
    doc.moveDown(2);
    this.drawNotas();

    // Footer
    const footerY = doc.page.height - 50;
    const fecha = format(new Date(), "d 'de' MMMM 'de' yyyy, HH:mm", { locale: es });

    doc
      .fontSize(FONT_SIZES.footer)
      .font('Helvetica')
      .fillColor(PDF_COLORS.textMuted)
      .text(`Actualizado: ${fecha}`, 50, footerY, {
        width: doc.page.width - 100,
        align: 'center',
      });
  }

  /**
   * Dibuja leyenda de clasificación
   */
  private drawLeyenda(): void {
    const doc = this.doc;
    const { clasificados, eliminados } = this.data;

    doc
      .fontSize(FONT_SIZES.h4)
      .font('Helvetica-Bold')
      .fillColor(PDF_COLORS.text)
      .text('LEYENDA', 50, doc.y);

    doc.moveDown(0.5);

    let currentY = doc.y;
    const iconSize = 15;
    const textX = 80;

    // Clasificados
    if (clasificados) {
      doc
        .rect(50, currentY, iconSize, iconSize)
        .fillColor(PDF_COLORS.clasificado)
        .fill()
        .strokeColor(PDF_COLORS.success)
        .stroke();

      doc
        .fontSize(FONT_SIZES.small)
        .font('Helvetica')
        .fillColor(PDF_COLORS.text)
        .text(`Clasifican a la siguiente fase (${clasificados})`, textX, currentY + 2);

      currentY += 25;
    }

    // Eliminados
    if (eliminados) {
      doc
        .rect(50, currentY, iconSize, iconSize)
        .fillColor(PDF_COLORS.eliminado)
        .fill()
        .strokeColor(PDF_COLORS.danger)
        .stroke();

      doc
        .fontSize(FONT_SIZES.small)
        .font('Helvetica')
        .fillColor(PDF_COLORS.text)
        .text(`Quedan eliminados (${eliminados})`, textX, currentY + 2);

      currentY += 25;
    }

    doc.y = currentY;
  }

  /**
   * Dibuja la tabla de posiciones
   */
  private drawTablaPosiciones(): void {
    const doc = this.doc;
    const { equipos, clasificados, eliminados } = this.data;

    // Definir columnas
    const columns: TableColumn[] = [
      { header: 'Pos', width: 35, align: 'center' },
      { header: 'Equipo', width: 180, align: 'left' },
      { header: 'PJ', width: 35, align: 'center' },
      { header: 'PG', width: 35, align: 'center' },
      { header: 'PE', width: 35, align: 'center' },
      { header: 'PP', width: 35, align: 'center' },
      { header: 'GF', width: 35, align: 'center' },
      { header: 'GC', width: 35, align: 'center' },
      { header: 'DIF', width: 40, align: 'center' },
      { header: 'PTS', width: 45, align: 'center' },
    ];

    const startY = doc.y;
    const tableX = 50;
    const rowHeight = 25;
    const totalWidth = columns.reduce((sum, col) => sum + col.width, 0);

    // Header
    this.drawTableHeader(tableX, startY, columns, rowHeight);

    let currentY = startY + rowHeight;

    // Filas
    equipos.forEach((equipo) => {
      const bgColor = this.getRowColor(equipo.posicion, clasificados, eliminados);
      this.drawTableRow(tableX, currentY, columns, equipo, bgColor, rowHeight);
      currentY += rowHeight;
    });

    // Borde exterior
    doc
      .rect(tableX, startY, totalWidth, (equipos.length + 1) * rowHeight)
      .strokeColor(PDF_COLORS.border)
      .lineWidth(2)
      .stroke();

    doc.y = currentY;
  }

  /**
   * Dibuja header de la tabla
   */
  private drawTableHeader(
    x: number,
    y: number,
    columns: TableColumn[],
    height: number
  ): void {
    const doc = this.doc;
    const totalWidth = columns.reduce((sum, col) => sum + col.width, 0);

    // Fondo
    doc.rect(x, y, totalWidth, height).fillColor(PDF_COLORS.primary).fill();

    // Texto
    let currentX = x;
    columns.forEach((col) => {
      doc
        .fontSize(FONT_SIZES.tableHeader)
        .font('Helvetica-Bold')
        .fillColor(PDF_COLORS.white)
        .text(col.header, currentX + 5, y + 7, {
          width: col.width - 10,
          align: col.align || 'center',
        });
      currentX += col.width;
    });

    // Bordes verticales
    currentX = x;
    columns.forEach((col, index) => {
      if (index > 0) {
        doc
          .moveTo(currentX, y)
          .lineTo(currentX, y + height)
          .strokeColor(PDF_COLORS.white)
          .lineWidth(1)
          .stroke();
      }
      currentX += col.width;
    });
  }

  /**
   * Dibuja fila de la tabla
   */
  private drawTableRow(
    x: number,
    y: number,
    columns: TableColumn[],
    equipo: EquipoTabla,
    bgColor: string,
    height: number
  ): void {
    const doc = this.doc;
    const totalWidth = columns.reduce((sum, col) => sum + col.width, 0);

    // Fondo
    doc.rect(x, y, totalWidth, height).fillColor(bgColor).fill();

    // Contenido
    let currentX = x;
    const values = [
      equipo.posicion.toString(),
      equipo.equipo,
      equipo.pj.toString(),
      equipo.pg.toString(),
      equipo.pe.toString(),
      equipo.pp.toString(),
      equipo.gf.toString(),
      equipo.gc.toString(),
      equipo.dif > 0 ? `+${equipo.dif}` : equipo.dif.toString(),
      equipo.pts.toString(),
    ];

    columns.forEach((col, index) => {
      const isEquipoColumn = index === 1;
      const isPtsColumn = index === columns.length - 1;

      doc
        .fontSize(FONT_SIZES.tableBody)
        .font(isPtsColumn || isEquipoColumn ? 'Helvetica-Bold' : 'Helvetica')
        .fillColor(PDF_COLORS.text)
        .text(values[index]!, currentX + 5, y + 7, {
          width: col.width - 10,
          align: col.align || 'center',
        });

      currentX += col.width;
    });

    // Bordes verticales
    currentX = x;
    columns.forEach((col, index) => {
      if (index > 0) {
        doc
          .moveTo(currentX, y)
          .lineTo(currentX, y + height)
          .strokeColor(PDF_COLORS.border)
          .lineWidth(1)
          .stroke();
      }
      currentX += col.width;
    });

    // Línea horizontal
    doc
      .moveTo(x, y + height)
      .lineTo(x + totalWidth, y + height)
      .strokeColor(PDF_COLORS.border)
      .stroke();
  }

  /**
   * Obtiene el color de fondo de una fila
   */
  private getRowColor(
    posicion: number,
    clasificados?: number,
    eliminados?: number
  ): string {
    if (clasificados && posicion <= clasificados) {
      return PDF_COLORS.clasificado;
    }

    const totalEquipos = this.data.equipos.length;
    if (eliminados && posicion > totalEquipos - eliminados) {
      return PDF_COLORS.eliminado;
    }

    return posicion % 2 === 0 ? PDF_COLORS.background : PDF_COLORS.white;
  }

  /**
   * Dibuja notas al pie
   */
  private drawNotas(): void {
    const doc = this.doc;

    doc
      .fontSize(FONT_SIZES.small)
      .font('Helvetica-Bold')
      .fillColor(PDF_COLORS.textLight)
      .text('ABREVIATURAS:', 50, doc.y);

    doc
      .fontSize(FONT_SIZES.small)
      .font('Helvetica')
      .fillColor(PDF_COLORS.textMuted)
      .text(
        'PJ: Partidos Jugados | PG: Partidos Ganados | PE: Partidos Empatados | PP: Partidos Perdidos',
        50,
        doc.y + 2
      );

    doc.text(
      'GF: Goles a Favor | GC: Goles en Contra | DIF: Diferencia de Goles | PTS: Puntos',
      50,
      doc.y + 2
    );
  }
}
