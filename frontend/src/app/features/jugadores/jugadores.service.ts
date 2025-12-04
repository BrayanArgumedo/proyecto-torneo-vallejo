// src/app/features/jugadores/jugadores.service.ts

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { ApiResponse } from '../../shared/models';
import { Jugador, EstadoValidacion } from '../../shared/models';

// ============================================
// DTOs & Filters
// ============================================

export interface JugadorFilters {
  equipoId?: string;
  estadoValidacion?: EstadoValidacion;
  tipo?: string;
  posicion?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateJugadorDto {
  // Datos Personales
  nombre: string;
  apellido: string;
  cedula: string;
  fechaNacimiento: Date;
  celular: string;
  email?: string;
  direccion?: string;

  // Datos Deportivos
  tipo: string;
  posicion: string;
  numeroCamiseta: number;
  equipoId: string;

  // Opcionales
  institucionEducativa?: string;
  parentescoEstudiante?: string;
}

export interface UpdateJugadorDto extends Partial<CreateJugadorDto> {}

export interface ValidarJugadorDto {
  comentarios?: string;
}

export interface RechazarJugadorDto {
  motivo: string;
}

// ============================================
// Service
// ============================================

@Injectable({
  providedIn: 'root'
})
export class JugadoresService {
  private apiService = inject(ApiService);
  private readonly baseUrl = '/jugadores';

  // ============================================
  // CRUD Básico
  // ============================================

  /**
   * Obtiene lista de jugadores con filtros opcionales
   */
  getAll(filters?: JugadorFilters): Observable<ApiResponse<Jugador[]>> {
    const params = this.buildQueryParams(filters);
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;
    return this.apiService.get<ApiResponse<Jugador[]>>(url);
  }

  /**
   * Obtiene un jugador por ID
   */
  getById(id: string): Observable<ApiResponse<Jugador>> {
    return this.apiService.get<ApiResponse<Jugador>>(`${this.baseUrl}/${id}`);
  }

  /**
   * Crea un nuevo jugador
   */
  create(data: CreateJugadorDto): Observable<ApiResponse<Jugador>> {
    return this.apiService.post<ApiResponse<Jugador>>(this.baseUrl, data);
  }

  /**
   * Actualiza un jugador existente
   */
  update(id: string, data: UpdateJugadorDto): Observable<ApiResponse<Jugador>> {
    return this.apiService.put<ApiResponse<Jugador>>(`${this.baseUrl}/${id}`, data);
  }

  /**
   * Elimina un jugador
   */
  delete(id: string): Observable<ApiResponse<void>> {
    return this.apiService.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`);
  }

  // ============================================
  // Validación (Admin Only)
  // ============================================

  /**
   * Obtiene jugadores pendientes de validación
   */
  getPendientes(): Observable<ApiResponse<Jugador[]>> {
    return this.getAll({ estadoValidacion: EstadoValidacion.PENDIENTE });
  }

  /**
   * Valida/aprueba un jugador (Admin)
   */
  validar(id: string, data?: ValidarJugadorDto): Observable<ApiResponse<Jugador>> {
    return this.apiService.put<ApiResponse<Jugador>>(
      `${this.baseUrl}/${id}/validar`,
      data || {}
    );
  }

  /**
   * Rechaza un jugador (Admin)
   */
  rechazar(id: string, data: RechazarJugadorDto): Observable<ApiResponse<Jugador>> {
    return this.apiService.put<ApiResponse<Jugador>>(
      `${this.baseUrl}/${id}/rechazar`,
      data
    );
  }

  /**
   * Obtiene conteo de jugadores pendientes (para badge)
   */
  getCountPendientes(): Observable<ApiResponse<{ count: number }>> {
    return this.apiService.get<ApiResponse<{ count: number }>>(
      `${this.baseUrl}/count/pendientes`
    );
  }

  // ============================================
  // Upload de Archivos
  // ============================================

  /**
   * Sube foto del jugador
   */
  uploadFoto(id: string, file: File): Observable<ApiResponse<Jugador>> {
    const formData = new FormData();
    formData.append('foto', file);

    return this.apiService.post<ApiResponse<Jugador>>(
      `${this.baseUrl}/${id}/foto`,
      formData
    );
  }

  /**
   * Sube documentos del jugador (múltiples archivos)
   */
  uploadDocumentos(id: string, files: File[]): Observable<ApiResponse<Jugador>> {
    const formData = new FormData();

    files.forEach((file, index) => {
      formData.append('documentos', file);
    });

    return this.apiService.post<ApiResponse<Jugador>>(
      `${this.baseUrl}/${id}/documentos`,
      formData
    );
  }

  /**
   * Elimina un documento específico
   */
  deleteDocumento(jugadorId: string, documentoId: string): Observable<ApiResponse<Jugador>> {
    return this.apiService.delete<ApiResponse<Jugador>>(
      `${this.baseUrl}/${jugadorId}/documentos/${documentoId}`
    );
  }

  // ============================================
  // Métodos por Equipo (Delegado)
  // ============================================

  /**
   * Obtiene jugadores de un equipo específico
   */
  getByEquipo(equipoId: string): Observable<ApiResponse<Jugador[]>> {
    return this.getAll({ equipoId });
  }

  /**
   * Obtiene jugadores validados de un equipo
   */
  getValidadosByEquipo(equipoId: string): Observable<ApiResponse<Jugador[]>> {
    return this.getAll({
      equipoId,
      estadoValidacion: EstadoValidacion.VALIDADO
    });
  }

  // ============================================
  // Validaciones Frontend (Async Validators)
  // ============================================

  /**
   * Verifica si una cédula ya está registrada
   */
  checkCedulaDisponible(cedula: string, jugadorId?: string): Observable<ApiResponse<{ disponible: boolean }>> {
    const params: any = { cedula };
    if (jugadorId) {
      params.excludeId = jugadorId;
    }

    const queryString = new URLSearchParams(params).toString();
    const url = `${this.baseUrl}/check/cedula?${queryString}`;
    return this.apiService.get<ApiResponse<{ disponible: boolean }>>(url);
  }

  /**
   * Verifica si un número de camiseta está disponible en un equipo
   */
  checkNumeroCamisetaDisponible(
    equipoId: string,
    numeroCamiseta: number,
    jugadorId?: string
  ): Observable<ApiResponse<{ disponible: boolean }>> {
    const params: any = { equipoId, numeroCamiseta: numeroCamiseta.toString() };
    if (jugadorId) {
      params.excludeId = jugadorId;
    }

    const queryString = new URLSearchParams(params).toString();
    const url = `${this.baseUrl}/check/numero-camiseta?${queryString}`;
    return this.apiService.get<ApiResponse<{ disponible: boolean }>>(url);
  }

  /**
   * Valida reglas de negocio (cupos de extranjeros, docentes, etc.)
   */
  validarReglamento(equipoId: string, tipo: string): Observable<ApiResponse<{ valido: boolean; mensaje?: string }>> {
    return this.apiService.post<ApiResponse<{ valido: boolean; mensaje?: string }>>(
      `${this.baseUrl}/validar-reglamento`,
      { equipoId, tipo }
    );
  }

  // ============================================
  // Helpers
  // ============================================

  /**
   * Construye query params para filtros
   */
  private buildQueryParams(filters?: JugadorFilters): Record<string, string> {
    if (!filters) return {};

    const params: Record<string, string> = {};

    if (filters.equipoId) params['equipoId'] = filters.equipoId;
    if (filters.estadoValidacion) params['estadoValidacion'] = filters.estadoValidacion;
    if (filters.tipo) params['tipo'] = filters.tipo;
    if (filters.posicion) params['posicion'] = filters.posicion;
    if (filters.search) params['search'] = filters.search;
    if (filters.page) params['page'] = filters.page.toString();
    if (filters.limit) params['limit'] = filters.limit.toString();

    return params;
  }

  /**
   * Calcula edad a partir de fecha de nacimiento
   */
  calcularEdad(fechaNacimiento: Date | string): number {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();

    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }

    return edad;
  }

  /**
   * Valida edad según reglamento (16-60 años)
   */
  validarEdad(fechaNacimiento: Date | string): { valida: boolean; edad: number; mensaje?: string } {
    const edad = this.calcularEdad(fechaNacimiento);

    if (edad < 16) {
      return { valida: false, edad, mensaje: 'Edad mínima: 16 años' };
    }

    if (edad > 60) {
      return { valida: false, edad, mensaje: 'Edad máxima: 60 años' };
    }

    return { valida: true, edad };
  }

  /**
   * Formatea nombre completo
   */
  getNombreCompleto(jugador: Jugador): string {
    return `${jugador.nombre} ${jugador.apellido}`;
  }

  /**
   * Retorna color del badge según estado de validación
   */
  getEstadoBadgeSeverity(estado: EstadoValidacion): 'success' | 'warning' | 'danger' {
    switch (estado) {
      case EstadoValidacion.VALIDADO:
        return 'success';
      case EstadoValidacion.PENDIENTE:
        return 'warning';
      case EstadoValidacion.RECHAZADO:
        return 'danger';
      default:
        return 'warning';
    }
  }
}
