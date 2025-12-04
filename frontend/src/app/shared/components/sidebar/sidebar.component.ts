//src/app/shared/components/sidebar/sidebar.component.ts

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { AuthService } from '../../../core/services/auth.service';
import { Rol } from '../../models';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, MenuModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  authService = inject(AuthService);
  
  menuItems: MenuItem[] = [];

  constructor() {
    this.loadMenuItems();
  }

  private loadMenuItems() {
    const user = this.authService.currentUser();
    
    if (!user) return;

    if (user.rol === Rol.ADMIN) {
      this.menuItems = this.getAdminMenu();
    } else if (user.rol === Rol.DELEGADO) {
      this.menuItems = this.getDelegadoMenu();
    }
  }

  private getAdminMenu(): MenuItem[] {
    return [
      {
        label: 'Dashboard',
        icon: 'pi pi-home',
        routerLink: ['/admin']
      },
      {
        separator: true
      },
      {
        label: 'Gestión',
        items: [
          {
            label: 'Usuarios',
            icon: 'pi pi-users',
            routerLink: ['/admin/usuarios']
          },
          {
            label: 'Equipos',
            icon: 'pi pi-shield',
            routerLink: ['/admin/equipos']
          },
          {
            label: 'Jugadores',
            icon: 'pi pi-user',
            routerLink: ['/admin/jugadores']
          }
        ]
      },
      {
        separator: true
      },
      {
        label: 'Validaciones',
        icon: 'pi pi-check-circle',
        routerLink: ['/admin/validaciones'],
        badge: '3', // TODO: Obtener count real del backend
        badgeStyleClass: 'p-badge-danger'
      },
      {
        separator: true
      },
      {
        label: 'Torneo',
        items: [
          {
            label: 'Configuración',
            icon: 'pi pi-cog',
            routerLink: ['/admin/torneo']
          },
          {
            label: 'Fases',
            icon: 'pi pi-list',
            routerLink: ['/admin/fases']
          },
          {
            label: 'Calendario',
            icon: 'pi pi-calendar',
            routerLink: ['/admin/calendario']
          }
        ]
      },
      {
        separator: true
      },
      {
        label: 'Vista Pública',
        icon: 'pi pi-eye',
        routerLink: ['/'],
        target: '_blank'
      }
    ];
  }

  private getDelegadoMenu(): MenuItem[] {
    return [
      {
        label: 'Dashboard',
        icon: 'pi pi-home',
        routerLink: ['/delegado']
      },
      {
        separator: true
      },
      {
        label: 'Mi Equipo',
        items: [
          {
            label: 'Información',
            icon: 'pi pi-shield',
            routerLink: ['/delegado/mi-equipo']
          },
          {
            label: 'Jugadores',
            icon: 'pi pi-users',
            routerLink: ['/delegado/jugadores']
          },
          {
            label: 'Inscribir Jugador',
            icon: 'pi pi-user-plus',
            routerLink: ['/delegado/inscribir-jugador']
          }
        ]
      },
      {
        separator: true
      },
      {
        label: 'Torneo',
        items: [
          {
            label: 'Calendario',
            icon: 'pi pi-calendar',
            routerLink: ['/delegado/calendario']
          },
          {
            label: 'Tabla de Posiciones',
            icon: 'pi pi-table',
            routerLink: ['/delegado/tabla']
          }
        ]
      },
      {
        separator: true
      },
      {
        label: 'Vista Pública',
        icon: 'pi pi-eye',
        routerLink: ['/'],
        target: '_blank'
      }
    ];
  }
}