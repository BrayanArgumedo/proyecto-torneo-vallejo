import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { Usuario, AuthResponse, LoginCredentials, ApiResponse, Rol } from '../../shared/models';

/**
 * 🔐 AUTH SERVICE
 *
 * Servicio de autenticación usando Signals (Angular 21)
 * Maneja login, logout, estado del usuario y token JWT
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiService = inject(ApiService);
  private router = inject(Router);

  // ============================================
  // 📊 SIGNALS - Estado reactivo
  // ============================================

  /**
   * Usuario actual autenticado (null si no está logueado)
   */
  private currentUserSignal = signal<Usuario | null>(null);

  /**
   * Token JWT actual
   */
  private tokenSignal = signal<string | null>(null);

  /**
   * Estado de carga (para mostrar spinners)
   */
  private loadingSignal = signal<boolean>(false);

  // ============================================
  // 🔍 COMPUTED SIGNALS - Auto-calculados
  // ============================================

  /**
   * Usuario actual (readonly)
   */
  readonly currentUser = this.currentUserSignal.asReadonly();

  /**
   * Token actual (readonly)
   */
  readonly token = this.tokenSignal.asReadonly();

  /**
   * Estado de carga (readonly)
   */
  readonly isLoading = this.loadingSignal.asReadonly();

  /**
   * ¿Está autenticado? (auto-calculado)
   */
  readonly isAuthenticated = computed(() => !!this.currentUserSignal() && !!this.tokenSignal());

  /**
   * ¿Es Admin? (auto-calculado)
   */
  readonly isAdmin = computed(() => this.currentUserSignal()?.rol === Rol.ADMIN);

  /**
   * ¿Es Delegado? (auto-calculado)
   */
  readonly isDelegado = computed(() => this.currentUserSignal()?.rol === Rol.DELEGADO);

  /**
   * Nombre completo del usuario (auto-calculado)
   */
  readonly fullName = computed(() => {
    const user = this.currentUserSignal();
    return user ? `${user.nombre} ${user.apellido}` : '';
  });

  // ============================================
  // 🔧 CONSTRUCTOR
  // ============================================

  constructor() {
    this.loadUserFromStorage();
  }

  // ============================================
  // 🔑 MÉTODOS DE AUTENTICACIÓN
  // ============================================

  /**
   * Iniciar sesión
   */
  login(credentials: LoginCredentials): Observable<AuthResponse> {
    this.loadingSignal.set(true);

    return this.apiService.post<AuthResponse>('/auth/login', credentials).pipe(
      tap({
        next: (response) => {
          if (response.success && response.data) {
            const { token, usuario } = response.data;

            // Guardar en signals
            this.tokenSignal.set(token);
            this.currentUserSignal.set(usuario);

            // Guardar en localStorage
            this.saveToStorage(token, usuario);

            // Redirigir según rol
            this.redirectAfterLogin(usuario.rol);
          }
          this.loadingSignal.set(false);
        },
        error: () => {
          this.loadingSignal.set(false);
        }
      })
    );
  }

  /**
   * Cerrar sesión
   */
  logout(): void {
    // Limpiar signals
    this.tokenSignal.set(null);
    this.currentUserSignal.set(null);

    // Limpiar localStorage
    this.clearStorage();

    // Redirigir al login
    this.router.navigate(['/login']);
  }

  /**
   * Verificar si el token es válido (llamada al backend)
   */
  verifyToken(): Observable<ApiResponse<any>> {
    return this.apiService.get<ApiResponse<any>>('/auth/verify');
  }

  /**
   * Obtener perfil del usuario autenticado
   */
  getProfile(): Observable<ApiResponse<Usuario>> {
    return this.apiService.get<ApiResponse<Usuario>>('/auth/profile').pipe(
      tap((response) => {
        if (response.success && response.data) {
          this.currentUserSignal.set(response.data);
        }
      })
    );
  }

  // ============================================
  // 💾 MÉTODOS DE ALMACENAMIENTO LOCAL
  // ============================================

  /**
   * Cargar usuario y token desde localStorage al iniciar
   */
  private loadUserFromStorage(): void {
    try {
      const token = localStorage.getItem('auth_token');
      const userJson = localStorage.getItem('auth_user');

      if (token && userJson) {
        const user = JSON.parse(userJson) as Usuario;
        this.tokenSignal.set(token);
        this.currentUserSignal.set(user);

        // Opcional: Verificar que el token sea válido
        // this.verifyToken().subscribe();
      }
    } catch (error) {
      console.error('Error loading user from storage:', error);
      this.clearStorage();
    }
  }

  /**
   * Guardar en localStorage
   */
  private saveToStorage(token: string, user: Usuario): void {
    try {
      localStorage.setItem('auth_token', token);
      localStorage.setItem('auth_user', JSON.stringify(user));
    } catch (error) {
      console.error('Error saving to storage:', error);
    }
  }

  /**
   * Limpiar localStorage
   */
  private clearStorage(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }

  // ============================================
  // 🧭 MÉTODOS DE NAVEGACIÓN
  // ============================================

  /**
   * Redirigir después del login según el rol
   */
  private redirectAfterLogin(rol: Rol): void {
    if (rol === Rol.ADMIN) {
      this.router.navigate(['/admin']);
    } else if (rol === Rol.DELEGADO) {
      this.router.navigate(['/delegado']);
    } else {
      this.router.navigate(['/']);
    }
  }

  /**
   * Obtener token actual (para el interceptor)
   */
  getToken(): string | null {
    return this.tokenSignal();
  }
}
