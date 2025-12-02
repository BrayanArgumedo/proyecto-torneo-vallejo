//src/app/features/admin/dashboard/admin-dashboard.component.ts

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule],
  template: `
    <div class="dashboard-container">
      <p-card>
        <ng-template pTemplate="header">
          <div class="dashboard-header">
            <i class="pi pi-users" style="font-size: 3rem; color: var(--green-600);"></i>
            <h1>Dashboard Administrador</h1>
          </div>
        </ng-template>

        <div class="dashboard-content">
          <h2>Bienvenido, {{ authService.fullName() }}!</h2>
          <p>Has iniciado sesión como <strong>ADMINISTRADOR</strong></p>
          
          <div class="user-info">
            <p><strong>Email:</strong> {{ authService.currentUser()?.email }}</p>
            <p><strong>Rol:</strong> {{ authService.currentUser()?.rol }}</p>
          </div>

          <p-button 
            label="Cerrar Sesión" 
            icon="pi pi-sign-out" 
            severity="danger"
            (click)="logout()">
          </p-button>
        </div>
      </p-card>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 2rem;
      max-width: 800px;
      margin: 0 auto;
    }

    .dashboard-header {
      text-align: center;
      padding: 2rem;
      
      h1 {
        margin-top: 1rem;
        color: var(--green-600);
      }
    }

    .dashboard-content {
      text-align: center;
      padding: 2rem;

      h2 {
        color: var(--green-700);
        margin-bottom: 1rem;
      }

      .user-info {
        background: var(--surface-100);
        border-radius: 12px;
        padding: 1.5rem;
        margin: 2rem 0;
        text-align: left;
        
        p {
          margin: 0.5rem 0;
        }
      }
    }
  `]
})
export class AdminDashboardComponent {
  authService = inject(AuthService);
  private router = inject(Router);

  logout() {
    this.authService.logout();
  }
}