import { createBrowserRouter, Navigate } from 'react-router-dom';

// Layouts
import { PublicLayout } from '@/features/auth/components/layouts/public-layout';
import { AdminLayout } from '@/features/auth/components/layouts/admin-layout';
import { DelegadoLayout } from '@/features/auth/components/layouts/delegado-layout';

// Auth
import { LoginPage } from '@/features/auth/components/pages/login-page';
import { ProtectedRoute } from '@/features/auth/components/protected-route/protected-route';
import { RoleGuard } from '@/features/auth/components/role-guard/role-guard';

// Public Pages (Módulo 8)
import { LandingPage } from '@/features/public-view/components/pages/landing-page';

// Admin Pages
import { AdminDashboardPage } from '@/features/admin/components/pages/dashboard-page';

// Usuarios Pages (Módulo 1)
import { UsuariosListPage } from '@/features/usuarios/components/pages/usuarios-list-page';
import { UsuarioCreatePage } from '@/features/usuarios/components/pages/usuario-create-page';

// Equipos y Jugadores Pages (Módulo 2)
import { EquiposListPage } from '@/features/equipos/components/pages/equipos-list-page';
import { EquipoDetailPage } from '@/features/equipos/components/pages/equipo-detail-page';
import { ValidacionesPage } from '@/features/equipos/components/pages/validaciones-page';

// Delegado Pages
import { DelegadoDashboardPage } from '@/features/delegado/components/pages/dashboard-page';

// Temporary Demo (lo quitaremos después)
import App from '@/App';

export const router = createBrowserRouter([
  // ========== RUTAS PÚBLICAS ==========
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      {
        index: true,
        element: <LandingPage />,
      },
      // Otras rutas públicas se agregarán aquí (equipos, calendario, etc.)
    ],
  },

  // ========== AUTH ==========
  {
    path: '/login',
    element: <LoginPage />,
  },

  // ========== RUTAS ADMIN (PROTEGIDAS) ==========
  {
    path: '/admin',
    element: (
      <ProtectedRoute>
        <RoleGuard allowedRoles={['ADMIN']}>
          <AdminLayout />
        </RoleGuard>
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/admin/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <AdminDashboardPage />,
      },
      {
        path: 'usuarios',
        element: <UsuariosListPage />,
      },
      {
        path: 'usuarios/crear',
        element: <UsuarioCreatePage />,
      },
      {
        path: 'validaciones',
        element: <ValidacionesPage />,
      },
      // Otras rutas admin se agregarán aquí
    ],
  },

  // ========== RUTAS DELEGADO (PROTEGIDAS) ==========
  {
    path: '/delegado',
    element: (
      <ProtectedRoute>
        <RoleGuard allowedRoles={['DELEGADO']}>
          <DelegadoLayout />
        </RoleGuard>
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/delegado/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <DelegadoDashboardPage />,
      },
      {
        path: 'equipos',
        element: <EquiposListPage />,
      },
      {
        path: 'equipos/:id',
        element: <EquipoDetailPage />,
      },
      // Otras rutas delegado se agregarán aquí
    ],
  },

  // ========== DEMO (TEMPORAL) ==========
  {
    path: '/demo',
    element: <App />,
  },

  // ========== 404 ==========
  {
    path: '*',
    element: (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
          <p className="text-xl text-gray-600 mb-6">Página no encontrada</p>
          <a href="/" className="text-blue-600 hover:text-blue-700 font-medium">
            Volver al inicio
          </a>
        </div>
      </div>
    ),
  },
]);
