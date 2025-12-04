//src/app/shared/components/navbar/navbar.component.ts

import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    ToolbarModule,
    ButtonModule,
    AvatarModule,
    MenuModule
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  @Output() menuToggle = new EventEmitter<void>();
  
  authService = inject(AuthService);
  private router = inject(Router);
  
  userMenuItems: MenuItem[] = [
    {
      label: 'Mi Perfil',
      icon: 'pi pi-user',
      command: () => this.goToProfile()
    },
    {
      separator: true
    },
    {
      label: 'Cerrar Sesión',
      icon: 'pi pi-sign-out',
      command: () => this.logout()
    }
  ];

  onMenuToggle() {
    this.menuToggle.emit();
  }

  goToProfile() {
    // TODO: Implementar ruta de perfil
    console.log('Ir a perfil');
  }

  logout() {
    this.authService.logout();
  }

  getUserInitials(): string {
    const user = this.authService.currentUser();
    if (!user) return '?';
    return `${user.nombre.charAt(0)}${user.apellido.charAt(0)}`.toUpperCase();
  }
}