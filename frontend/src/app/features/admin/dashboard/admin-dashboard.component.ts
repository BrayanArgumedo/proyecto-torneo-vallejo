//src/app/features/admin/dashboard/admin-dashboard.component.ts

import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../../core/services/auth.service';

interface DashboardStat {
  title: string;
  value: number;
  icon: string;
  color: string;
  route?: string;
}

interface QuickAction {
  label: string;
  icon: string;
  route: string;
  severity: 'success' | 'info' | 'danger' | 'help' | 'secondary' | 'contrast' | null; // ✅ SIN "warning"
}


@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent implements OnInit {
  authService = inject(AuthService);
  private router = inject(Router);

  stats = signal<DashboardStat[]>([]);
  quickActions = signal<QuickAction[]>([]);

  ngOnInit() {
    this.loadStats();
    this.loadQuickActions();
  }

  private loadStats() {
    // TODO: Obtener datos reales del backend
    this.stats.set([
      {
        title: 'Total Usuarios',
        value: 12,
        icon: 'pi-users',
        color: '#1e7e34',
        route: '/admin/usuarios'
      },
      {
        title: 'Equipos Registrados',
        value: 8,
        icon: 'pi-shield',
        color: '#ffc107',
        route: '/admin/equipos'
      },
      {
        title: 'Jugadores Validados',
        value: 96,
        icon: 'pi-check-circle',
        color: '#28a745',
        route: '/admin/jugadores'
      },
      {
        title: 'Validaciones Pendientes',
        value: 5,
        icon: 'pi-clock',
        color: '#dc3545',
        route: '/admin/validaciones'
      }
    ]);
  }

  private loadQuickActions() {
  this.quickActions.set([
    {
      label: 'Crear Usuario',
      icon: 'pi-user-plus',
      route: '/admin/usuarios/nuevo',
      severity: 'success'
    },
    {
      label: 'Ver Validaciones',
      icon: 'pi-check-square',
      route: '/admin/validaciones',
      severity: 'secondary' // 
    },
    {
      label: 'Configurar Torneo',
      icon: 'pi-cog',
      route: '/admin/torneo',
      severity: 'info'
    },
    {
      label: 'Ver Calendario',
      icon: 'pi-calendar',
      route: '/admin/calendario',
      severity: 'help'
    }
  ]);
}

  navigateTo(route: string | undefined) {
    if (route) {
      this.router.navigate([route]);
    }
  }

  logout() {
    this.authService.logout();
  }
}