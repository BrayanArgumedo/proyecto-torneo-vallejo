// src/app/features/jugadores/list/jugadores-list.component.ts

import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

// PrimeNG
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';

// Services & Models
import { JugadoresService, JugadorFilters } from '../jugadores.service';
import { AuthService } from '../../../core/services/auth.service';
import { Jugador, EstadoValidacion, Posicion, Rol } from '../../../shared/models';
import { debounceTime } from 'rxjs';

@Component({
  selector: 'app-jugadores-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    TagModule,
    CardModule,
    ToolbarModule,
    TooltipModule,
    ConfirmDialogModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './jugadores-list.component.html',
  styleUrl: './jugadores-list.component.scss'
})
export class JugadoresListComponent implements OnInit {
  private jugadoresService = inject(JugadoresService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);

  // ============================================
  // Signals
  // ============================================
  jugadores = signal<Jugador[]>([]);
  loading = signal<boolean>(false);
  totalRecords = signal<number>(0);

  // ============================================
  // Filters
  // ============================================
  searchControl = new FormControl('');
  estadoFilter = new FormControl<EstadoValidacion | ''>('');
  posicionFilter = new FormControl<Posicion | ''>('');
  equipoFilter = new FormControl<string>('');

  // Dropdown options
  estadoOptions = [
    { label: 'Todos', value: '' },
    { label: 'Pendientes', value: EstadoValidacion.PENDIENTE },
    { label: 'Validados', value: EstadoValidacion.VALIDADO },
    { label: 'Rechazados', value: EstadoValidacion.RECHAZADO }
  ];

  posicionOptions = [
    { label: 'Todas', value: '' },
    { label: 'Portero', value: Posicion.PORTERO },
    { label: 'Defensa', value: Posicion.DEFENSA },
    { label: 'Volante', value: Posicion.VOLANTE },
    { label: 'Delantero', value: Posicion.DELANTERO }
  ];

  // ============================================
  // Pagination
  // ============================================
  currentPage = signal<number>(0);
  rowsPerPage = signal<number>(10);

  // ============================================
  // Computed/Readonly
  // ============================================
  readonly isAdmin = this.authService.isAdmin;
  readonly isDelegado = this.authService.isDelegado;
  readonly currentUser = this.authService.currentUser;

  // ============================================
  // Lifecycle
  // ============================================
  ngOnInit(): void {
    this.loadJugadores();
    this.setupFilterListeners();
  }

  // ============================================
  // Data Loading
  // ============================================
  loadJugadores(filters?: Partial<JugadorFilters>): void {
    this.loading.set(true);

    const currentFilters: JugadorFilters = {
      search: this.searchControl.value || undefined,
      estadoValidacion: this.estadoFilter.value || undefined,
      posicion: this.posicionFilter.value || undefined,
      equipoId: this.equipoFilter.value || undefined,
      page: this.currentPage() + 1,
      limit: this.rowsPerPage(),
      ...filters
    };

    this.jugadoresService.getAll(currentFilters).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.jugadores.set(response.data);
          // TODO: Backend debe retornar totalRecords para paginación
          this.totalRecords.set(response.data.length);
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading jugadores:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los jugadores'
        });
        this.loading.set(false);
      }
    });
  }

  // ============================================
  // Filter Listeners
  // ============================================
  private setupFilterListeners(): void {
    // Search with debounce
    this.searchControl.valueChanges
      .pipe(debounceTime(300))
      .subscribe(() => {
        this.currentPage.set(0);
        this.loadJugadores();
      });

    // Estado filter
    this.estadoFilter.valueChanges.subscribe(() => {
      this.currentPage.set(0);
      this.loadJugadores();
    });

    // Posicion filter
    this.posicionFilter.valueChanges.subscribe(() => {
      this.currentPage.set(0);
      this.loadJugadores();
    });
  }

  // ============================================
  // Actions
  // ============================================
  onCreate(): void {
    this.router.navigate(['/admin/jugadores/nuevo']);
  }

  onView(jugador: Jugador): void {
    this.router.navigate(['/admin/jugadores', jugador._id]);
  }

  onEdit(jugador: Jugador): void {
    this.router.navigate(['/admin/jugadores', jugador._id, 'editar']);
  }

  onDelete(jugador: Jugador): void {
    this.confirmationService.confirm({
      message: `¿Está seguro de eliminar al jugador ${this.jugadoresService.getNombreCompleto(jugador)}?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.deleteJugador(jugador._id);
      }
    });
  }

  private deleteJugador(id: string): void {
    this.loading.set(true);

    this.jugadoresService.delete(id).subscribe({
      next: (response) => {
        if (response.success) {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Jugador eliminado correctamente'
          });
          this.loadJugadores();
        }
      },
      error: (error) => {
        console.error('Error deleting jugador:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.message || 'No se pudo eliminar el jugador'
        });
        this.loading.set(false);
      }
    });
  }

  // ============================================
  // Validation Actions (Admin only)
  // ============================================
  onValidar(jugador: Jugador): void {
    this.confirmationService.confirm({
      message: `¿Validar al jugador ${this.jugadoresService.getNombreCompleto(jugador)}?`,
      header: 'Confirmar Validación',
      icon: 'pi pi-check-circle',
      acceptLabel: 'Sí, validar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-success',
      accept: () => {
        this.validarJugador(jugador._id);
      }
    });
  }

  private validarJugador(id: string): void {
    this.loading.set(true);

    this.jugadoresService.validar(id).subscribe({
      next: (response) => {
        if (response.success) {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Jugador validado correctamente'
          });
          this.loadJugadores();
        }
      },
      error: (error) => {
        console.error('Error validating jugador:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.message || 'No se pudo validar el jugador'
        });
        this.loading.set(false);
      }
    });
  }

  onRechazar(jugador: Jugador): void {
    // TODO: Abrir dialog para ingresar motivo de rechazo
    const motivo = prompt('Ingrese el motivo del rechazo:');

    if (!motivo) {
      return;
    }

    this.loading.set(true);

    this.jugadoresService.rechazar(jugador._id, { motivo }).subscribe({
      next: (response) => {
        if (response.success) {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Jugador rechazado'
          });
          this.loadJugadores();
        }
      },
      error: (error) => {
        console.error('Error rejecting jugador:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.message || 'No se pudo rechazar el jugador'
        });
        this.loading.set(false);
      }
    });
  }

  // ============================================
  // Table Helpers
  // ============================================
  onPageChange(event: any): void {
    this.currentPage.set(event.first / event.rows);
    this.rowsPerPage.set(event.rows);
    this.loadJugadores();
  }

  getEstadoBadge(estado: EstadoValidacion): { severity: 'success' | 'warning' | 'danger'; label: string } {
    switch (estado) {
      case EstadoValidacion.VALIDADO:
        return { severity: 'success', label: 'Validado' };
      case EstadoValidacion.PENDIENTE:
        return { severity: 'warning', label: 'Pendiente' };
      case EstadoValidacion.RECHAZADO:
        return { severity: 'danger', label: 'Rechazado' };
      default:
        return { severity: 'warning', label: 'Desconocido' };
    }
  }

  getNombreCompleto(jugador: Jugador): string {
    return this.jugadoresService.getNombreCompleto(jugador);
  }

  getEdad(jugador: Jugador): number {
    return this.jugadoresService.calcularEdad(jugador.fechaNacimiento);
  }

  // ============================================
  // Permissions
  // ============================================
  canEdit(jugador: Jugador): boolean {
    if (this.isAdmin()) return true;

    if (this.isDelegado()) {
      // Delegado solo puede editar jugadores de su equipo
      const currentUser = this.currentUser();
      if (!currentUser?.equipoId) return false;

      return jugador.equipoId === currentUser.equipoId;
    }

    return false;
  }

  canDelete(jugador: Jugador): boolean {
    // Solo admin puede eliminar
    return this.isAdmin();
  }

  canValidate(): boolean {
    // Solo admin puede validar/rechazar
    return this.isAdmin();
  }

  // ============================================
  // Export (TODO: Implement)
  // ============================================
  onExportExcel(): void {
    console.log('TODO: Implement Excel export');
    this.messageService.add({
      severity: 'info',
      summary: 'Próximamente',
      detail: 'Exportación a Excel próximamente disponible'
    });
  }

  onExportPDF(): void {
    console.log('TODO: Implement PDF export');
    this.messageService.add({
      severity: 'info',
      summary: 'Próximamente',
      detail: 'Exportación a PDF próximamente disponible'
    });
  }

  // ============================================
  // Clear Filters
  // ============================================
  clearFilters(): void {
    this.searchControl.setValue('');
    this.estadoFilter.setValue('');
    this.posicionFilter.setValue('');
    this.equipoFilter.setValue('');
    this.currentPage.set(0);
    this.loadJugadores();
  }
}
