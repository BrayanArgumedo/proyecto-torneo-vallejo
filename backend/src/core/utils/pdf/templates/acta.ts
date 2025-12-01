/**
 * Template para generar acta de partido en PDF
 */

import { PDFGenerator } from '../pdfGenerator';
import { PDF_COLORS, FONT_SIZES, TEXT_STYLES, SPACING } from '../pdfStyles';
import { drawHeader, drawLabelValue, drawHorizontalLine, drawRoundedRect } from '../pdfHelpers';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// ========================================
// TIPOS
// ========================================

export interface GolActa {
  jugador: string;
  equipo: string;
  minuto: number;
  tipo: 'NORMAL' | 'PENAL' | 'AUTOGOL';
}

export interface TarjetaActa {
  jugador: string;
  equipo: string;
  minuto: number;
  tipo: 'AMARILLA' | 'ROJA';
  motivo?: string;
}

export interface ActaData {
  partido: {
    fecha: Date;
    cancha: string;
    jornada: number;
    grupo?: string;
  };
  equipoLocal: {
    nombre: string;
    goles: number;
  };
  equipoVisitante: {
    nombre: string;
    goles: number;
  };
  torneo: {
    nombre: string;
    año: number;
  };
  fase: {
    nombre: string;
  };
  goles: GolActa[];
  tarjetas: TarjetaActa[];
  arbitro?: string;
  observaciones?: string;
}

// ========================================
// GENERADOR DE ACTA
// ========================================

export class ActaTemplate extends PDFGenerator {
  private data: ActaData;

  constructor(data: ActaData) {
    super({
      title: `Acta - ${data.equipoLocal.nombre} vs ${data.equipoVisitante.nombre}`,
      subject: 'Acta de Partido',
      keywords: 'acta, partido, torneo',
    });

    this.data = data;
  }

  /**
   * Genera el PDF completo del acta
   */
  async generate(): Promise<Buffer> {
    this.drawActa();
    return this.toBuffer();
  }

  /**
   * Dibuja el acta completa
   */
  private drawActa(): void {
    const doc = this.doc;
    const { equipoLocal, equipoVisitante, torneo } = this.data;

    // Header
    drawHeader(
      doc,
      `${torneo.nombre} ${torneo.año}`,
      'ACTA OFICIAL DE PARTIDO'
    );

    doc.moveDown(1);

    // Información del partido
    this.drawPartidoInfo();

    doc.moveDown(2);

    // Resultado (destacado)
    this.drawResultado();

    doc.moveDown(2);

    // Goles
    this.drawGoles();

    // Tarjetas
    if (this.data.tarjetas.length > 0) {
      doc.moveDown(2);
      this.drawTarjetas();
    }

    // Observaciones
    if (this.data.observaciones) {
      doc.moveDown(2);
      this.drawObservaciones();
    }

    // Información del árbitro
    if (this.data.arbitro) {
      doc.moveDown(2);
      this.drawArbitro();
    }

    // Footer
    doc.moveDown(3);
    this.drawFooter();
  }

  /**
   * Dibuja información del partido
   */
  private drawPartidoInfo(): void {
    const doc = this.doc;
    const { partido, fase } = this.data;

    const fecha = format(new Date(partido.fecha), "EEEE d 'de' MMMM, yyyy", {
      locale: es,
    });
    const hora = format(new Date(partido.fecha), 'HH:mm', { locale: es });

    const startY = doc.y;
    const col1X = 80;
    const col2X = 340;

    // Columna 1
    drawLabelValue(doc, 'Fase:', fase.nombre, col1X, startY, { labelWidth: 70 });
    drawLabelValue(doc, 'Jornada:', `${partido.jornada}`, col1X, startY + 20, { labelWidth: 70 });

    if (partido.grupo) {
      drawLabelValue(doc, 'Grupo:', partido.grupo, col1X, startY + 40, { labelWidth: 70 });
    }

    // Columna 2
    drawLabelValue(doc, 'Fecha:', fecha, col2X, startY, { labelWidth: 70 });
    drawLabelValue(doc, 'Hora:', hora, col2X, startY + 20, { labelWidth: 70 });
    drawLabelValue(doc, 'Cancha:', partido.cancha, col2X, startY + 40, { labelWidth: 70 });

    doc.y = startY + 60;
  }

  /**
   * Dibuja el resultado destacado
   */
  private drawResultado(): void {
    const doc = this.doc;
    const { equipoLocal, equipoVisitante } = this.data;

    const boxWidth = doc.page.width - 120;
    const boxHeight = 100;
    const boxX = 60;
    const boxY = doc.y;

    // Box con fondo
    drawRoundedRect(doc, boxX, boxY, boxWidth, boxHeight, 10, {
      fill: PDF_COLORS.background,
      stroke: PDF_COLORS.primary,
      lineWidth: 3,
    });

    // Equipo Local
    doc
      .fontSize(FONT_SIZES.h3)
      .font('Helvetica-Bold')
      .fillColor(PDF_COLORS.text)
      .text(equipoLocal.nombre, boxX + 20, boxY + 20, {
        width: boxWidth / 2 - 60,
        align: 'right',
      });

    // Marcador Local
    doc
      .fontSize(FONT_SIZES.h1 + 10)
      .font('Helvetica-Bold')
      .fillColor(PDF_COLORS.primary)
      .text(`${equipoLocal.goles}`, boxX + 20, boxY + 50, {
        width: boxWidth / 2 - 60,
        align: 'right',
      });

    // VS
    doc
      .fontSize(FONT_SIZES.h3)
      .font('Helvetica-Bold')
      .fillColor(PDF_COLORS.textLight)
      .text('VS', boxX, boxY + 40, {
        width: boxWidth,
        align: 'center',
      });

    // Marcador Visitante
    doc
      .fontSize(FONT_SIZES.h1 + 10)
      .font('Helvetica-Bold')
      .fillColor(PDF_COLORS.secondary)
      .text(`${equipoVisitante.goles}`, boxX + boxWidth / 2 + 40, boxY + 50, {
        width: boxWidth / 2 - 60,
        align: 'left',
      });

    // Equipo Visitante
    doc
      .fontSize(FONT_SIZES.h3)
      .font('Helvetica-Bold')
      .fillColor(PDF_COLORS.text)
      .text(equipoVisitante.nombre, boxX + boxWidth / 2 + 40, boxY + 20, {
        width: boxWidth / 2 - 60,
        align: 'left',
      });

    doc.y = boxY + boxHeight + SPACING.md;
  }

  /**
   * Dibuja lista de goles
   */
  private drawGoles(): void {
    const doc = this.doc;
    const { goles } = this.data;

    doc
      .fontSize(FONT_SIZES.h3)
      .font('Helvetica-Bold')
      .fillColor(PDF_COLORS.primary)
      .text('GOLES', 50, doc.y);

    doc.moveDown(0.5);

    if (goles.length === 0) {
      doc
        .fontSize(FONT_SIZES.normal)
        .font('Helvetica')
        .fillColor(PDF_COLORS.textMuted)
        .text('No se registraron goles en este partido', 50, doc.y);
      return;
    }

    goles.forEach((gol, index) => {
      const iconColor = gol.tipo === 'AUTOGOL' ? PDF_COLORS.danger : PDF_COLORS.success;
      const tipoText = gol.tipo === 'PENAL' ? ' (P)' : gol.tipo === 'AUTOGOL' ? ' (AG)' : '';

      // Icono de gol
      doc
        .circle(60, doc.y + 6, 4)
        .fillColor(iconColor)
        .fill();

      // Minuto
      doc
        .fontSize(FONT_SIZES.small)
        .font('Helvetica-Bold')
        .fillColor(PDF_COLORS.primary)
        .text(`${gol.minuto}'`, 75, doc.y);

      // Jugador y equipo
      doc
        .fontSize(FONT_SIZES.normal)
        .font('Helvetica')
        .fillColor(PDF_COLORS.text)
        .text(`${gol.jugador}${tipoText} - ${gol.equipo}`, 105, doc.y - 2);

      doc.moveDown(0.8);
    });
  }

  /**
   * Dibuja lista de tarjetas
   */
  private drawTarjetas(): void {
    const doc = this.doc;
    const { tarjetas } = this.data;

    doc
      .fontSize(FONT_SIZES.h3)
      .font('Helvetica-Bold')
      .fillColor(PDF_COLORS.primary)
      .text('TARJETAS', 50, doc.y);

    doc.moveDown(0.5);

    tarjetas.forEach((tarjeta) => {
      const iconColor = tarjeta.tipo === 'ROJA' ? PDF_COLORS.danger : PDF_COLORS.warning;

      // Icono de tarjeta (rectángulo pequeño)
      doc
        .rect(57, doc.y + 2, 6, 10)
        .fillColor(iconColor)
        .fill();

      // Minuto
      doc
        .fontSize(FONT_SIZES.small)
        .font('Helvetica-Bold')
        .fillColor(PDF_COLORS.primary)
        .text(`${tarjeta.minuto}'`, 75, doc.y);

      // Jugador y equipo
      doc
        .fontSize(FONT_SIZES.normal)
        .font('Helvetica')
        .fillColor(PDF_COLORS.text)
        .text(`${tarjeta.jugador} - ${tarjeta.equipo}`, 105, doc.y - 2);

      // Motivo (si existe)
      if (tarjeta.motivo) {
        doc
          .fontSize(FONT_SIZES.small)
          .font('Helvetica')
          .fillColor(PDF_COLORS.textLight)
          .text(`Motivo: ${tarjeta.motivo}`, 105, doc.y);
      }

      doc.moveDown(0.8);
    });
  }

  /**
   * Dibuja observaciones
   */
  private drawObservaciones(): void {
    const doc = this.doc;

    doc
      .fontSize(FONT_SIZES.h3)
      .font('Helvetica-Bold')
      .fillColor(PDF_COLORS.primary)
      .text('OBSERVACIONES', 50, doc.y);

    doc.moveDown(0.5);

    doc
      .fontSize(FONT_SIZES.normal)
      .font('Helvetica')
      .fillColor(PDF_COLORS.text)
      .text(this.data.observaciones || '', 50, doc.y, {
        width: doc.page.width - 100,
        align: 'justify',
      });
  }

  /**
   * Dibuja información del árbitro
   */
  private drawArbitro(): void {
    const doc = this.doc;

    doc
      .fontSize(FONT_SIZES.h4)
      .font('Helvetica-Bold')
      .fillColor(PDF_COLORS.textLight)
      .text('ÁRBITRO', 50, doc.y);

    doc
      .fontSize(FONT_SIZES.normal)
      .font('Helvetica')
      .fillColor(PDF_COLORS.text)
      .text(this.data.arbitro || '', 50, doc.y + 2);
  }

  /**
   * Dibuja footer del acta
   */
  private drawFooter(): void {
    const doc = this.doc;
    const fecha = format(new Date(), "d 'de' MMMM 'de' yyyy, HH:mm", { locale: es });

    drawHorizontalLine(doc, 50, doc.y, doc.page.width - 50);

    doc.moveDown(1);

    doc
      .fontSize(FONT_SIZES.footer)
      .font('Helvetica')
      .fillColor(PDF_COLORS.textMuted)
      .text(
        `Acta generada automáticamente el ${fecha}`,
        50,
        doc.y,
        {
          width: doc.page.width - 100,
          align: 'center',
        }
      );

    doc.text(
      'Este documento tiene validez oficial para el Torneo Vallejo',
      50,
      doc.y + 5,
      {
        width: doc.page.width - 100,
        align: 'center',
      }
    );
  }
}
