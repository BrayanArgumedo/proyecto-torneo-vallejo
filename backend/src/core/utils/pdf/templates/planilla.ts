/**
 * Template para generar planilla de partido en PDF
 */

import { PDFGenerator } from '../pdfGenerator';
import { PDF_COLORS, FONT_SIZES } from '../pdfStyles';
import { drawHeader, drawHorizontalLine, drawLabelValue } from '../pdfHelpers';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// ========================================
// TIPOS
// ========================================

export interface JugadorPlanilla {
  numeroCamiseta: number;
  nombre: string;
  apellido: string;
  posicion: string;
}

export interface EquipoPlanilla {
  nombre: string;
  delegado: string;
  jugadores: JugadorPlanilla[];
}

export interface PlanillaData {
  partido: {
    fecha: Date;
    cancha: string;
    jornada: number;
    grupo?: string;
  };
  equipoLocal: EquipoPlanilla;
  equipoVisitante: EquipoPlanilla;
  torneo: {
    nombre: string;
    año: number;
  };
  fase: {
    nombre: string;
  };
}

// ========================================
// GENERADOR DE PLANILLA
// ========================================

export class PlanillaTemplate extends PDFGenerator {
  private data: PlanillaData;

  constructor(data: PlanillaData) {
    super({
      title: `Planilla - ${data.equipoLocal.nombre} vs ${data.equipoVisitante.nombre}`,
      subject: 'Planilla de Partido',
      keywords: 'planilla, partido, torneo',
    });

    this.data = data;
  }

  /**
   * Genera el PDF completo de la planilla
   */
  async generate(): Promise<Buffer> {
    this.drawPlanilla();
    return this.toBuffer();
  }

  /**
   * Dibuja la planilla completa
   */
  private drawPlanilla(): void {
    const doc = this.doc;
    const { equipoLocal, equipoVisitante, torneo } = this.data;

    // Header
    drawHeader(
      doc,
      `${torneo.nombre} ${torneo.año}`,
      'PLANILLA OFICIAL DE PARTIDO'
    );

    doc.moveDown(1);

    // Información del partido
    this.drawPartidoInfo();

    doc.moveDown(2);

    // Equipos enfrentados (título)
    doc
      .fontSize(FONT_SIZES.h3)
      .font('Helvetica-Bold')
      .fillColor(PDF_COLORS.primary)
      .text(
        `${equipoLocal.nombre}  VS  ${equipoVisitante.nombre}`,
        50,
        doc.y,
        {
          width: doc.page.width - 100,
          align: 'center',
        }
      );

    doc.moveDown(2);

    // Equipo Local
    this.drawEquipo('EQUIPO LOCAL', equipoLocal, true);

    // Salto de página si es necesario
    if (this.needsPageBreak(300)) {
      this.addPage();
    } else {
      doc.moveDown(2);
    }

    // Equipo Visitante
    this.drawEquipo('EQUIPO VISITANTE', equipoVisitante, false);

    // Espacio para observaciones
    doc.moveDown(2);
    this.drawObservaciones();

    // Espacio para firmas
    doc.moveDown(2);
    this.drawFirmas();
  }

  /**
   * Dibuja información del partido
   */
  private drawPartidoInfo(): void {
    const doc = this.doc;
    const { partido, fase } = this.data;

    const startY = doc.y;
    const col1X = 80;
    const col2X = 340;

    // Columna 1
    drawLabelValue(
      doc,
      'Fase:',
      fase.nombre,
      col1X,
      startY,
      { labelWidth: 70 }
    );

    drawLabelValue(
      doc,
      'Jornada:',
      `${partido.jornada}`,
      col1X,
      startY + 20,
      { labelWidth: 70 }
    );

    if (partido.grupo) {
      drawLabelValue(
        doc,
        'Grupo:',
        partido.grupo,
        col1X,
        startY + 40,
        { labelWidth: 70 }
      );
    }

    // Columna 2
    const fecha = format(new Date(partido.fecha), "EEEE d 'de' MMMM, yyyy", {
      locale: es,
    });
    const hora = format(new Date(partido.fecha), 'HH:mm', { locale: es });

    drawLabelValue(
      doc,
      'Fecha:',
      fecha,
      col2X,
      startY,
      { labelWidth: 70 }
    );

    drawLabelValue(
      doc,
      'Hora:',
      `${hora}`,
      col2X,
      startY + 20,
      { labelWidth: 70 }
    );

    drawLabelValue(
      doc,
      'Cancha:',
      partido.cancha,
      col2X,
      startY + 40,
      { labelWidth: 70 }
    );

    doc.y = startY + 60;
  }

  /**
   * Dibuja sección de un equipo
   */
  private drawEquipo(titulo: string, equipo: EquipoPlanilla, isLocal: boolean): void {
    const doc = this.doc;
    const startY = doc.y;

    // Título del equipo
    doc
      .fontSize(FONT_SIZES.h3)
      .font('Helvetica-Bold')
      .fillColor(isLocal ? PDF_COLORS.primary : PDF_COLORS.secondary)
      .text(titulo, 50, startY);

    doc.moveDown(0.5);

    // Nombre del equipo y delegado
    doc
      .fontSize(FONT_SIZES.large)
      .font('Helvetica-Bold')
      .fillColor(PDF_COLORS.text)
      .text(equipo.nombre, 50, doc.y);

    doc
      .fontSize(FONT_SIZES.small)
      .font('Helvetica')
      .fillColor(PDF_COLORS.textLight)
      .text(`Delegado: ${equipo.delegado}`, 50, doc.y + 5);

    doc.moveDown(1);

    // Tabla de jugadores
    this.drawJugadoresTable(equipo.jugadores);
  }

  /**
   * Dibuja tabla de jugadores
   */
  private drawJugadoresTable(jugadores: JugadorPlanilla[]): void {
    const doc = this.doc;
    const startY = doc.y;
    const tableX = 50;
    const rowHeight = 25;

    // Definir columnas
    const columns = [
      { header: 'N°', width: 50 },
      { header: 'NOMBRE COMPLETO', width: 250 },
      { header: 'POSICIÓN', width: 150 },
      { header: 'FIRMA', width: 100 },
    ];

    const totalWidth = columns.reduce((sum, col) => sum + col.width, 0);

    // Header de la tabla
    doc
      .rect(tableX, startY, totalWidth, rowHeight)
      .fillColor(PDF_COLORS.primary)
      .fill();

    let currentX = tableX;
    columns.forEach((col) => {
      doc
        .fontSize(FONT_SIZES.small)
        .font('Helvetica-Bold')
        .fillColor(PDF_COLORS.white)
        .text(col.header, currentX + 5, startY + 8, {
          width: col.width - 10,
          align: 'center',
        });
      currentX += col.width;
    });

    // Líneas verticales del header
    currentX = tableX;
    columns.forEach((col, index) => {
      if (index > 0) {
        doc
          .moveTo(currentX, startY)
          .lineTo(currentX, startY + rowHeight)
          .strokeColor(PDF_COLORS.white)
          .stroke();
      }
      currentX += col.width;
    });

    let currentY = startY + rowHeight;

    // Filas de jugadores
    jugadores.forEach((jugador, index) => {
      const bgColor = index % 2 === 0 ? PDF_COLORS.white : PDF_COLORS.background;

      // Fondo de la fila
      doc.rect(tableX, currentY, totalWidth, rowHeight).fillColor(bgColor).fill();

      // Contenido
      currentX = tableX;

      // N° Camiseta
      doc
        .fontSize(FONT_SIZES.normal)
        .font('Helvetica-Bold')
        .fillColor(PDF_COLORS.text)
        .text(`${jugador.numeroCamiseta}`, currentX + 5, currentY + 7, {
          width: columns[0]!.width - 10,
          align: 'center',
        });
      currentX += columns[0]!.width;

      // Nombre
      doc
        .fontSize(FONT_SIZES.normal)
        .font('Helvetica')
        .fillColor(PDF_COLORS.text)
        .text(
          `${jugador.apellido}, ${jugador.nombre}`,
          currentX + 5,
          currentY + 7,
          {
            width: columns[1]!.width - 10,
            align: 'left',
          }
        );
      currentX += columns[1]!.width;

      // Posición
      doc
        .fontSize(FONT_SIZES.small)
        .font('Helvetica')
        .fillColor(PDF_COLORS.textLight)
        .text(jugador.posicion, currentX + 5, currentY + 7, {
          width: columns[2]!.width - 10,
          align: 'center',
        });
      currentX += columns[2]!.width;

      // Espacio para firma (vacío)
      currentX += columns[3]!.width;

      // Líneas verticales
      currentX = tableX;
      columns.forEach((col, idx) => {
        if (idx > 0) {
          doc
            .moveTo(currentX, currentY)
            .lineTo(currentX, currentY + rowHeight)
            .strokeColor(PDF_COLORS.border)
            .stroke();
        }
        currentX += col.width;
      });

      // Línea horizontal inferior
      drawHorizontalLine(doc, tableX, currentY + rowHeight, tableX + totalWidth);

      currentY += rowHeight;
    });

    // Borde exterior
    doc
      .rect(tableX, startY, totalWidth, (jugadores.length + 1) * rowHeight)
      .strokeColor(PDF_COLORS.border)
      .lineWidth(2)
      .stroke();

    doc.y = currentY;
  }

  /**
   * Dibuja sección de observaciones
   */
  private drawObservaciones(): void {
    const doc = this.doc;

    doc
      .fontSize(FONT_SIZES.h4)
      .font('Helvetica-Bold')
      .fillColor(PDF_COLORS.text)
      .text('OBSERVACIONES DEL ÁRBITRO', 50, doc.y);

    doc.moveDown(0.5);

    // Espacio para escribir
    doc
      .rect(50, doc.y, doc.page.width - 100, 80)
      .strokeColor(PDF_COLORS.border)
      .stroke();

    doc.y += 90;
  }

  /**
   * Dibuja sección de firmas
   */
  private drawFirmas(): void {
    const doc = this.doc;
    const startY = doc.y;

    doc
      .fontSize(FONT_SIZES.h4)
      .font('Helvetica-Bold')
      .fillColor(PDF_COLORS.text)
      .text('FIRMAS', 50, startY);

    doc.moveDown(1.5);

    const firmaWidth = 200;
    const firmaHeight = 60;
    const gap = 50;

    // Firma Árbitro (izquierda)
    const firmaArbitroX = 80;
    doc
      .rect(firmaArbitroX, doc.y, firmaWidth, firmaHeight)
      .strokeColor(PDF_COLORS.border)
      .stroke();

    doc
      .fontSize(FONT_SIZES.small)
      .font('Helvetica')
      .fillColor(PDF_COLORS.textLight)
      .text('Firma del Árbitro', firmaArbitroX, doc.y + firmaHeight + 5, {
        width: firmaWidth,
        align: 'center',
      });

    // Firma Delegados (derecha)
    const firmaDelegadosX = firmaArbitroX + firmaWidth + gap;
    const tempY = doc.y - firmaHeight;

    doc
      .rect(firmaDelegadosX, tempY, firmaWidth, firmaHeight)
      .strokeColor(PDF_COLORS.border)
      .stroke();

    doc
      .fontSize(FONT_SIZES.small)
      .font('Helvetica')
      .fillColor(PDF_COLORS.textLight)
      .text('Firmas de Delegados', firmaDelegadosX, tempY + firmaHeight + 5, {
        width: firmaWidth,
        align: 'center',
      });

    doc.y = tempY + firmaHeight + 30;
  }
}
