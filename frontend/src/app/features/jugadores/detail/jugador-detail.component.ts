// src/app/features/jugadores/detail/jugador-detail.component.ts

import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';

// PrimeNG
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { TimelineModule } from 'primeng/timeline';
import { ImageModule } from 'primeng/image';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';

// Services & Models
import { JugadoresService } from '../jugadores.service';
import { AuthService } from '../../../core/services/auth.service';
import { Jugador, EstadoValidacion } from '../../../shared/models';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

@Component({
  selector: 'app-jugador-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CardModule,
    ButtonModule,
    TagModule,
    DividerModule,
    TimelineModule,
    ImageModule,
    ConfirmDialogModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './jugador-detail.component.html',
  styleUrl: './jugador-detail.component.scss'
})
export class JugadorDetailComponent implements OnInit {
  private jugadoresService = inject(JugadoresService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);

  // ============================================
  // Signals
  // ============================================
  jugador = signal<Jugador | null>(null);
  loading = signal<boolean>(false);

  // ============================================
  // Computed
  // ============================================
  readonly isAdmin = this.authService.isAdmin;
  readonly isDelegado = this.authService.isDelegado;
  readonly currentUser = this.authService.currentUser;

  // ============================================
  // Lifecycle
  // ============================================
  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadJugador(id);
    }
  }

  // ============================================
  // Data Loading
  // ============================================
  private loadJugador(id: string): void {
    this.loading.set(true);

    this.jugadoresService.getById(id).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.jugador.set(response.data);
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading jugador:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cargar el jugador'
        });
        this.loading.set(false);
        this.router.navigate(['/admin/jugadores']);
      }
    });
  }

  // ============================================
  // Actions
  // ============================================
  onEdit(): void {
    const jugador = this.jugador();
    if (jugador) {
      this.router.navigate(['/admin/jugadores', jugador._id, 'editar']);
    }
  }

  onDelete(): void {
    const jugador = this.jugador();
    if (!jugador) return;

    this.confirmationService.confirm({
      message: `¿Está seguro de eliminar al jugador ${this.getNombreCompleto()}?`,
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
          this.router.navigate(['/admin/jugadores']);
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

  onValidar(): void {
    const jugador = this.jugador();
    if (!jugador) return;

    this.confirmationService.confirm({
      message: `¿Validar al jugador ${this.getNombreCompleto()}?`,
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
          this.loadJugador(id);
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

  onRechazar(): void {
    const jugador = this.jugador();
    if (!jugador) return;

    // TODO: Abrir dialog para ingresar motivo
    const motivo = prompt('Ingrese el motivo del rechazo:');

    if (!motivo) return;

    this.loading.set(true);

    this.jugadoresService.rechazar(jugador._id, { motivo }).subscribe({
      next: (response) => {
        if (response.success) {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Jugador rechazado'
          });
          this.loadJugador(jugador._id);
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

  onBack(): void {
    this.router.navigate(['/admin/jugadores']);
  }

  // TODO: Implement upload documents
  onUploadDocuments(): void {
    console.log('TODO: Navigate to upload documents component');
    this.messageService.add({
      severity: 'info',
      summary: 'Próximamente',
      detail: 'Carga de documentos próximamente disponible'
    });
  }

  // TODO: Implement download credential PDF
  onDownloadCredencial(): void {
    const jugador = this.jugador();
    if (!jugador) return;

    console.log('TODO: Call API to download credential PDF');
    this.messageService.add({
      severity: 'info',
      summary: 'Próximamente',
      detail: 'Descarga de credencial próximamente disponible'
    });
  }

  // ============================================
  // Permissions
  // ============================================
  canEdit(): boolean {
    const jugador = this.jugador();
    if (!jugador) return false;

    if (this.isAdmin()) return true;

    if (this.isDelegado()) {
      const user = this.currentUser();
      if (!user?.equipoId) return false;
      return jugador.equipoId === user.equipoId;
    }

    return false;
  }

  canDelete(): boolean {
    return this.isAdmin();
  }

  canValidate(): boolean {
    return this.isAdmin();
  }

  canUploadDocuments(): boolean {
    return this.canEdit();
  }

  // ============================================
  // Helpers
  // ============================================
  getNombreCompleto(): string {
    const jugador = this.jugador();
    if (!jugador) return '';
    return this.jugadoresService.getNombreCompleto(jugador);
  }

  getEdad(): number {
    const jugador = this.jugador();
    if (!jugador) return 0;
    return this.jugadoresService.calcularEdad(jugador.fechaNacimiento);
  }

  getEstadoBadge(): { severity: 'success' | 'warn' | 'danger'; label: string } {
    const jugador = this.jugador();
    if (!jugador) return { severity: 'warn', label: 'Desconocido' };

    switch (jugador.estadoValidacion) {
      case 'VALIDADO':
        return { severity: 'success', label: 'Validado' };
      case 'PENDIENTE':
        return { severity: 'warn', label: 'Pendiente' };
      case 'RECHAZADO':
        return { severity: 'danger', label: 'Rechazado' };
      default:
        return { severity: 'warn', label: 'Desconocido' };
    }
  }

  formatDate(date: Date | string): string {
    return format(new Date(date), 'dd/MM/yyyy', { locale: es });
  }

  formatDateTime(date: Date | string): string {
    return format(new Date(date), "dd/MM/yyyy 'a las' HH:mm", { locale: es });
  }

  getEquipoNombre(): string {
    const jugador = this.jugador();
    if (!jugador) return 'Sin equipo';

    if (jugador.equipoId && typeof jugador.equipoId === 'object') {
      return (jugador.equipoId as any).nombre || 'Sin equipo';
    }

    return 'Sin equipo';
  }

  // ============================================
  // Timeline Events
  // ============================================
  getTimelineEvents(): Array<{
    status: string;
    date: string;
    icon: string;
    color: string;
    motivo?: string;
  }> {
    const jugador = this.jugador();
    if (!jugador) return [];

    const events: Array<{
      status: string;
      date: string;
      icon: string;
      color: string;
      motivo?: string;
    }> = [
      {
        status: 'Creado',
        date: jugador.createdAt,
        icon: 'pi pi-user-plus',
        color: '#007bff'
      }
    ];

    if (jugador.estadoValidacion === 'VALIDADO') {
      events.push({
        status: 'Validado',
        date: jugador.updatedAt,
        icon: 'pi pi-check-circle',
        color: '#28a745'
      });
    }

    if (jugador.estadoValidacion === 'RECHAZADO') {
      events.push({
        status: 'Rechazado',
        date: jugador.updatedAt,
        icon: 'pi pi-times-circle',
        color: '#dc3545',
        motivo: jugador.motivoRechazo
      });
    }

    return events;
  }

  hasDocuments(): boolean {
    const jugador = this.jugador();
    return !!(jugador?.documentos && jugador.documentos.length > 0);
  }

  getDocumentosCount(): number {
    const jugador = this.jugador();
    return jugador?.documentos?.length || 0;
  }
}
