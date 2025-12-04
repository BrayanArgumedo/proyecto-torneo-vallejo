import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { Rol } from './shared/models';

export const routes: Routes = [
  // ============================================
  // 🌐 RUTAS PÚBLICAS (con PublicLayout)
  // ============================================
  {
    path: '',
    loadComponent: () =>
      import('./layouts/public-layout/public-layout.component').then(
        m => m.PublicLayoutComponent
      ),
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      },
      {
        path: 'home',
        loadComponent: () =>
          import('./features/public-view/landing-page/landing-page.component').then(
            m => m.LandingPageComponent
          )
      },
      {
        path: 'equipos',
        loadComponent: () =>
          import('./features/public-view/equipos-public/equipos-public.component').then(
            m => m.EquiposPublicComponent
          )
      },
      {
        path: 'calendario',
        loadComponent: () =>
          import('./features/public-view/calendario-public/calendario-public.component').then(
            m => m.CalendarioPublicComponent
          )
      },
      {
        path: 'tablas',
        loadComponent: () =>
          import('./features/public-view/tablas-public/tablas-public.component').then(
            m => m.TablasPublicComponent
          )
      },
      {
        path: 'registro',
        loadComponent: () =>
          import('./features/auth/register/register.component').then(
            m => m.RegisterComponent
          )
      },

      // ============================================
      // 🔐 LOGIN (sin layout, pantalla completa)
      // ============================================
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/login/login.component').then(m => m.LoginComponent)
      },

    ]
  },

  

  // ============================================
  // 👨‍💼 ADMIN (con AdminLayout)
  // ============================================
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard],
    data: { roles: [Rol.ADMIN] },
    loadComponent: () =>
      import('./layouts/admin-layout/admin-layout.component').then(
        m => m.AdminLayoutComponent
      ),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/admin/dashboard/admin-dashboard.component').then(
            m => m.AdminDashboardComponent
          )
      },

      // ============================================
      // 👥 JUGADORES
      // ============================================
      {
        path: 'jugadores',
        loadComponent: () =>
          import('./features/jugadores/list/jugadores-list.component').then(
            m => m.JugadoresListComponent
          )
      },
      {
        path: 'jugadores/nuevo',
        loadComponent: () =>
          import('./features/jugadores/create-edit/jugador-form.component').then(
            m => m.JugadorFormComponent
          )
      },
      {
        path: 'jugadores/:id',
        loadComponent: () =>
          import('./features/jugadores/detail/jugador-detail.component').then(
            m => m.JugadorDetailComponent
          )
      },
      {
        path: 'jugadores/:id/editar',
        loadComponent: () =>
          import('./features/jugadores/create-edit/jugador-form.component').then(
            m => m.JugadorFormComponent
          )
      },

      // TODO: Agregar más rutas admin aquí (usuarios, equipos, torneos, etc.)
    ]
  },

  // ============================================
  // 👤 DELEGADO (con AdminLayout)
  // ============================================
  {
    path: 'delegado',
    canActivate: [authGuard, roleGuard],
    data: { roles: [Rol.DELEGADO] },
    loadComponent: () =>
      import('./layouts/admin-layout/admin-layout.component').then(
        m => m.AdminLayoutComponent
      ),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/delegado/dashboard/delegado-dashboard.component').then(
            m => m.DelegadoDashboardComponent
          )
      }
    ]
  },

  // ============================================
  // ❌ 404
  // ============================================
  {
    path: '**',
    redirectTo: 'home'
  }
];