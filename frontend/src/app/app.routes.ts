//src/app/app.routes.ts

import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { Rol } from './shared/models';

export const routes: Routes = [
  // ============================================
  // 🏠 RUTA POR DEFECTO
  // ============================================
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },

  // ============================================
  // 🔐 AUTENTICACIÓN
  // ============================================
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },

  // ============================================
  // 👨‍💼 ADMIN - Dashboard temporal
  // ============================================
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard],
    data: { roles: [Rol.ADMIN] },
    loadComponent: () =>
      import('./features/admin/dashboard/admin-dashboard.component').then(
        m => m.AdminDashboardComponent
      )
  },

  // ============================================
  // 👤 DELEGADO - Dashboard temporal
  // ============================================
  {
    path: 'delegado',
    canActivate: [authGuard, roleGuard],
    data: { roles: [Rol.DELEGADO] },
    loadComponent: () =>
      import('./features/delegado/dashboard/delegado-dashboard.component').then(
        m => m.DelegadoDashboardComponent
      )
  },
  
  // ============================================
  // 🌐 VISTA PÚBLICA (sin autenticación)
  // ============================================
  // TODO: Descomentar cuando se cree el componente
  // {
  //   path: 'public',
  //   children: [
  //     {
  //       path: 'equipos',
  //       loadComponent: () =>
  //         import('./features/public-view/equipos-public/equipos-public.component').then(
  //           m => m.EquiposPublicComponent
  //         )
  //     }
  //   ]
  // },

  // ============================================
  // ❌ 404 - Página no encontrada
  // ============================================
  {
    path: '**',
    redirectTo: '/login'
  }
];
