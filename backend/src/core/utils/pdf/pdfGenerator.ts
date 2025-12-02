/**
 * Clase base para generación de PDFs
 */

import PDFKit from 'pdfkit';
import { Readable } from 'stream';
import { PDF_CONFIG } from '@/core/config/pdf.config';

// ========================================
// TIPOS
// ========================================

export interface PDFOptions {
  title?: string;
  subject?: string;
  keywords?: string;
  filename?: string;
}

export interface PDFMetadata {
  title: string;
  subject?: string;
  author: string;
  creator: string;
  keywords?: string;
  creationDate: Date;
}

// ========================================
// CLASE BASE PDFGENERATOR
// ========================================

export class PDFGenerator {
  protected doc: PDFKit.PDFDocument;
  protected pageCount: number = 1;

  constructor(options: PDFOptions = {}) {
    // Crear documento PDF
    this.doc = new PDFKit({
      size: PDF_CONFIG.size,
      margins: PDF_CONFIG.margins,
      compress: PDF_CONFIG.compress,
      autoFirstPage: PDF_CONFIG.autoFirstPage,
      info: {
        Title: options.title || 'Reporte Torneo Vallejo',
        Author: PDF_CONFIG.info.author,
        Subject: options.subject,
        Keywords: options.keywords,
        Creator: PDF_CONFIG.info.creator,
      },
    });

    // Registrar evento de nueva página
    this.doc.on('pageAdded', () => {
      this.pageCount++;
    });
  }

  /**
   * Obtiene el documento PDF
   */
  getDocument(): PDFKit.PDFDocument {
    return this.doc;
  }

  /**
   * Obtiene el número de página actual
   */
  getCurrentPage(): number {
    return this.pageCount;
  }

  /**
   * Agrega una nueva página
   */
  addPage(): void {
    this.doc.addPage();
  }

  /**
   * Finaliza el documento y retorna el stream
   */
  async finalize(): Promise<Readable> {
    return new Promise((resolve, reject) => {
      try {
        // Finalizar el documento
        this.doc.end();

        // Retornar el stream
        resolve(this.doc as unknown as Readable);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Convierte el PDF a Buffer
   */
  async toBuffer(): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const buffers: Buffer[] = [];

      this.doc.on('data', (chunk: Buffer) => {
        buffers.push(chunk);
      });

      this.doc.on('end', () => {
        resolve(Buffer.concat(buffers));
      });

      this.doc.on('error', reject);

      this.doc.end();
    });
  }

  /**
   * Obtiene las dimensiones de la página
   */
  getPageDimensions(): { width: number; height: number } {
    return {
      width: this.doc.page.width,
      height: this.doc.page.height,
    };
  }

  /**
   * Obtiene los márgenes
   */
  getMargins(): typeof PDF_CONFIG.margins {
    return PDF_CONFIG.margins;
  }

  /**
   * Obtiene el área de contenido (página menos márgenes)
   */
  getContentArea(): { width: number; height: number; x: number; y: number } {
    const { width, height } = this.getPageDimensions();
    const margins = this.getMargins();

    return {
      x: margins.left,
      y: margins.top,
      width: width - margins.left - margins.right,
      height: height - margins.top - margins.bottom,
    };
  }

  /**
   * Resetea la posición Y al inicio del contenido
   */
  resetY(): void {
    this.doc.y = PDF_CONFIG.margins.top;
  }

  /**
   * Mueve la posición Y
   */
  moveY(amount: number): void {
    this.doc.y += amount;
  }

  /**
   * Obtiene la posición Y actual
   */
  getY(): number {
    return this.doc.y;
  }

  /**
   * Establece la posición Y
   */
  setY(y: number): void {
    this.doc.y = y;
  }

  /**
   * Verifica si se necesita un salto de página
   */
  needsPageBreak(requiredSpace: number): boolean {
    const { height } = this.getPageDimensions();
    const margins = this.getMargins();
    const availableSpace = height - margins.bottom - this.doc.y;

    return availableSpace < requiredSpace;
  }

  /**
   * Agrega espacio vertical
   */
  addVerticalSpace(space: number): void {
    this.doc.moveDown(space / this.doc.currentLineHeight());
  }

  /**
   * Dibuja una línea horizontal
   */
  drawHorizontalLine(y?: number, options?: { color?: string; lineWidth?: number }): void {
    const { x, width } = this.getContentArea();
    const lineY = y || this.doc.y;

    this.doc
      .strokeColor(options?.color || '#E5E7EB')
      .lineWidth(options?.lineWidth || 1)
      .moveTo(x, lineY)
      .lineTo(x + width, lineY)
      .stroke();
  }

  /**
   * Centra texto horizontalmente
   */
  centerText(text: string, y?: number): void {
    const { x, width } = this.getContentArea();
    const textY = y || this.doc.y;

    this.doc.text(text, x, textY, {
      width,
      align: 'center',
    });
  }

  /**
   * Agrega metadata al PDF
   */
  setMetadata(metadata: Partial<PDFMetadata>): void {
    if (metadata.title) {
      this.doc.info.Title = metadata.title;
    }
    if (metadata.subject) {
      this.doc.info.Subject = metadata.subject;
    }
    if (metadata.author) {
      this.doc.info.Author = metadata.author;
    }
    if (metadata.keywords) {
      this.doc.info.Keywords = metadata.keywords;
    }
  }
}
