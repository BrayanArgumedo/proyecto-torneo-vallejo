/**
 * Template para generar credencial de jugador en PDF
 */

import { PDFGenerator } from '../pdfGenerator';
import { PDF_COLORS, FONT_SIZES, TEXT_STYLES, SPACING } from '../pdfStyles';
import { drawRoundedRect, drawLabelValue } from '../pdfHelpers';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { getEtiquetaTipoJugador } from '@/shared/types/enums';

// ========================================
// TIPOS
// ========================================

export interface CredencialData {
  jugador: {
    _id: string;
    nombre: string;
    apellido: string;
    cedula: string;
    fechaNacimiento: Date;
    numeroCamiseta: number;
    posicion: string;
    tipo: string;
    foto?: string;
  };
  equipo: {
    nombre: string;
    escudo?: string;
  };
  torneo: {
    nombre: string;
    año: number;
  };
}

// ========================================
// GENERADOR DE CREDENCIAL
// ========================================

export class CredencialTemplate extends PDFGenerator {
  private data: CredencialData;

  constructor(data: CredencialData) {
    super({
      title: `Credencial - ${data.jugador.nombre} ${data.jugador.apellido}`,
      subject: 'Credencial de Jugador',
      keywords: 'credencial, jugador, torneo',
    });

    this.data = data;
  }

  /**
   * Genera el PDF completo de la credencial
   */
  async generate(): Promise<Buffer> {
    this.drawCredencial();
    return this.toBuffer();
  }

  /**
   * Dibuja la credencial
   */
  private drawCredencial(): void {
    const doc = this.doc;
    const { jugador, equipo, torneo } = this.data;

    // Título
    doc
      .fontSize(TEXT_STYLES.title.fontSize)
      .font(TEXT_STYLES.title.font!)
      .fillColor(TEXT_STYLES.title.color!)
      .text('CREDENCIAL DE JUGADOR', 50, 50, {
        width: doc.page.width - 100,
        align: 'center',
      });

    doc.moveDown(0.5);

    // Subtítulo con torneo
    doc
      .fontSize(TEXT_STYLES.subtitle.fontSize)
      .font(TEXT_STYLES.subtitle.font!)
      .fillColor(PDF_COLORS.textLight)
      .text(`${torneo.nombre} ${torneo.año}`, {
        align: 'center',
      });

    doc.moveDown(2);

    // Card principal
    const cardX = 100;
    const cardY = doc.y;
    const cardWidth = doc.page.width - 200;
    const cardHeight = 380;

    // Fondo del card
    drawRoundedRect(doc, cardX, cardY, cardWidth, cardHeight, 10, {
      fill: PDF_COLORS.white,
      stroke: PDF_COLORS.border,
      lineWidth: 2,
    });

    // Header del card (azul)
    doc
      .rect(cardX, cardY, cardWidth, 60)
      .fillColor(PDF_COLORS.primary)
      .fill();

    // Nombre del equipo en el header
    doc
      .fontSize(FONT_SIZES.h2)
      .font('Helvetica-Bold')
      .fillColor(PDF_COLORS.white)
      .text(equipo.nombre, cardX, cardY + 20, {
        width: cardWidth,
        align: 'center',
      });

    // Contenido del card
    let contentY = cardY + 80;

    // Foto del jugador (placeholder si no existe)
    const fotoX = cardX + 30;
    const fotoY = contentY;
    const fotoWidth = 120;
    const fotoHeight = 140;

    if (jugador.foto) {
      // Si hay foto, intentar cargarla (placeholder por ahora)
      doc
        .rect(fotoX, fotoY, fotoWidth, fotoHeight)
        .strokeColor(PDF_COLORS.border)
        .stroke();

      doc
        .fontSize(FONT_SIZES.small)
        .fillColor(PDF_COLORS.textMuted)
        .text('Foto', fotoX, fotoY + fotoHeight / 2 - 5, {
          width: fotoWidth,
          align: 'center',
        });
    } else {
      // Placeholder sin foto
      doc
        .rect(fotoX, fotoY, fotoWidth, fotoHeight)
        .fillColor(PDF_COLORS.background)
        .fillAndStroke(PDF_COLORS.background, PDF_COLORS.border);

      doc
        .fontSize(FONT_SIZES.small)
        .fillColor(PDF_COLORS.textMuted)
        .text('Sin foto', fotoX, fotoY + fotoHeight / 2 - 5, {
          width: fotoWidth,
          align: 'center',
        });
    }

    // Información del jugador (derecha de la foto)
    const infoX = fotoX + fotoWidth + 30;
    let infoY = contentY;

    // Nombre completo (grande y destacado)
    doc
      .fontSize(FONT_SIZES.h2)
      .font('Helvetica-Bold')
      .fillColor(PDF_COLORS.text)
      .text(`${jugador.nombre} ${jugador.apellido}`, infoX, infoY, {
        width: cardWidth - (infoX - cardX) - 30,
      });

    infoY = doc.y + SPACING.md;

    // Cédula
    drawLabelValue(doc, 'Cédula:', jugador.cedula, infoX, infoY, {
      labelWidth: 80,
    });
    infoY = doc.y + SPACING.sm;

    // Fecha de nacimiento y edad
    const fechaNac = format(new Date(jugador.fechaNacimiento), 'dd/MM/yyyy', {
      locale: es,
    });
    const edad = this.calcularEdad(jugador.fechaNacimiento);
    drawLabelValue(doc, 'Nacimiento:', `${fechaNac} (${edad} años)`, infoX, infoY, {
      labelWidth: 80,
    });
    infoY = doc.y + SPACING.sm;

    // Posición
    drawLabelValue(doc, 'Posición:', jugador.posicion, infoX, infoY, {
      labelWidth: 80,
    });
    infoY = doc.y + SPACING.sm;

    // Número de camiseta (destacado)
    doc
      .fontSize(FONT_SIZES.small)
      .font('Helvetica-Bold')
      .fillColor(PDF_COLORS.textLight)
      .text('N° Camiseta:', infoX, infoY);

    doc
      .fontSize(FONT_SIZES.h1)
      .font('Helvetica-Bold')
      .fillColor(PDF_COLORS.primary)
      .text(`#${jugador.numeroCamiseta}`, infoX + 85, infoY - 5);

    // Tipo de jugador (en box)
    const tipoY = fotoY + fotoHeight + SPACING.lg;
    const tipoLabel = getEtiquetaTipoJugador(jugador.tipo as any);

    doc
      .roundedRect(cardX + 30, tipoY, cardWidth - 60, 40, 5)
      .fillColor(PDF_COLORS.backgroundDark)
      .fill();

    doc
      .fontSize(FONT_SIZES.small)
      .font('Helvetica-Bold')
      .fillColor(PDF_COLORS.textLight)
      .text('TIPO DE JUGADOR', cardX + 30, tipoY + 8, {
        width: cardWidth - 60,
        align: 'center',
      });

    doc
      .fontSize(FONT_SIZES.normal)
      .font('Helvetica-Bold')
      .fillColor(PDF_COLORS.primary)
      .text(tipoLabel, cardX + 30, tipoY + 24, {
        width: cardWidth - 60,
        align: 'center',
      });

    // Footer con validez
    const footerY = cardY + cardHeight - 50;

    doc
      .fontSize(FONT_SIZES.small)
      .font('Helvetica')
      .fillColor(PDF_COLORS.textMuted)
      .text(
        `Válido para la temporada ${torneo.año}`,
        cardX + 30,
        footerY,
        {
          width: cardWidth - 60,
          align: 'center',
        }
      );

    doc
      .fontSize(FONT_SIZES.tiny)
      .text(
        `ID: ${jugador._id}`,
        cardX + 30,
        footerY + 15,
        {
          width: cardWidth - 60,
          align: 'center',
        }
      );

    // Footer del documento
    const docFooterY = doc.page.height - 40;
    const fecha = format(new Date(), "d 'de' MMMM 'de' yyyy", { locale: es });

    doc
      .fontSize(FONT_SIZES.footer)
      .font('Helvetica')
      .fillColor(PDF_COLORS.textMuted)
      .text(`Generado el ${fecha}`, 50, docFooterY, {
        width: doc.page.width - 100,
        align: 'center',
      });
  }

  /**
   * Calcula la edad a partir de la fecha de nacimiento
   */
  private calcularEdad(fechaNacimiento: Date): number {
    const hoy = new Date();
    const fechaNac = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    const mes = hoy.getMonth() - fechaNac.getMonth();

    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
      edad--;
    }

    return edad;
  }
}
