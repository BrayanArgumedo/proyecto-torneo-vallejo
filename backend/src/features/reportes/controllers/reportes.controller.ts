/**
 * Controllers para generación de reportes PDF
 */

import { Request, Response } from 'express';
import { asyncHandler } from '@/core/utils/asyncHandler';
import * as reportesService from '@/features/reportes/services/reportes.service';

// ========================================
// GENERAR CREDENCIAL DE JUGADOR
// ========================================

export const generarCredencialJugador = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    const buffer = await reportesService.generarCredencialJugador(id!);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="credencial-jugador.pdf"');
    res.send(buffer);
  }
);

// ========================================
// GENERAR PLANILLA DE PARTIDO
// ========================================

export const generarPlanillaPartido = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    const buffer = await reportesService.generarPlanillaPartido(id!);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="planilla-partido.pdf"');
    res.send(buffer);
  }
);

// ========================================
// GENERAR TABLA DE POSICIONES
// ========================================

export const generarTablaPosiciones = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    const buffer = await reportesService.generarTablaPosiciones(id!);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="tabla-posiciones.pdf"');
    res.send(buffer);
  }
);

// ========================================
// GENERAR ACTA DE PARTIDO
// ========================================

export const generarActaPartido = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    const buffer = await reportesService.generarActaPartido(id!);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="acta-partido.pdf"');
    res.send(buffer);
  }
);
