import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

/**
 * 🌐 API SERVICE BASE
 *
 * Servicio base para todas las llamadas HTTP al backend.
 * Provee métodos genéricos GET, POST, PUT, DELETE con manejo de errores.
 */
@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  /**
   * GET request genérico
   */
  get<T>(endpoint: string): Observable<T> {
    return this.http
      .get<T>(`${this.apiUrl}${endpoint}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * POST request genérico
   */
  post<T>(endpoint: string, body: any): Observable<T> {
    return this.http
      .post<T>(`${this.apiUrl}${endpoint}`, body)
      .pipe(catchError(this.handleError));
  }

  /**
   * PUT request genérico
   */
  put<T>(endpoint: string, body: any): Observable<T> {
    return this.http
      .put<T>(`${this.apiUrl}${endpoint}`, body)
      .pipe(catchError(this.handleError));
  }

  /**
   * PATCH request genérico
   */
  patch<T>(endpoint: string, body: any): Observable<T> {
    return this.http
      .patch<T>(`${this.apiUrl}${endpoint}`, body)
      .pipe(catchError(this.handleError));
  }

  /**
   * DELETE request genérico
   */
  delete<T>(endpoint: string): Observable<T> {
    return this.http
      .delete<T>(`${this.apiUrl}${endpoint}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Manejo centralizado de errores HTTP
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ocurrió un error desconocido';

    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      if (error.error?.error) {
        errorMessage = error.error.error;
      } else if (error.error?.message) {
        errorMessage = error.error.message;
      } else {
        switch (error.status) {
          case 0:
            errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión.';
            break;
          case 400:
            errorMessage = 'Solicitud inválida. Verifica los datos enviados.';
            break;
          case 401:
            errorMessage = 'No estás autenticado. Por favor inicia sesión.';
            break;
          case 403:
            errorMessage = 'No tienes permisos para realizar esta acción.';
            break;
          case 404:
            errorMessage = 'Recurso no encontrado.';
            break;
          case 409:
            errorMessage = 'Conflicto: El recurso ya existe.';
            break;
          case 429:
            errorMessage = 'Demasiadas solicitudes. Intenta de nuevo más tarde.';
            break;
          case 500:
            errorMessage = 'Error interno del servidor. Contacta al administrador.';
            break;
          default:
            errorMessage = `Error ${error.status}: ${error.statusText}`;
        }
      }
    }

    console.error('HTTP Error:', error);
    return throwError(() => new Error(errorMessage));
  }
}
