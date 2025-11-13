import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuthContext } from '../../context/auth-context';
import { Container } from '@/shared/components/layout/container/container';
import { Button } from '@/shared/components/ui/button/button';

export const AdminLayout = () => {
  const { usuario, logout } = useAuthContext();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navbar */}
      <nav className="bg-white shadow-sm border-b">
        <Container>
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <span className="text-2xl">⚽</span>
              <span className="text-xl font-bold text-gray-900">Torneo Vallejo</span>
              <span className="ml-3 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                Admin
              </span>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">👤 {usuario?.nombre}</span>
              <Button variant="outline" size="sm" onClick={logout}>
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </Container>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r min-h-[calc(100vh-64px)]">
          <nav className="p-4 space-y-1">
            <Link
              to="/admin/dashboard"
              className={`block px-4 py-2 rounded-md text-sm font-medium ${
                isActive('/admin/dashboard')
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              📊 Dashboard
            </Link>
            <Link
              to="/admin/usuarios"
              className={`block px-4 py-2 rounded-md text-sm font-medium ${
                isActive('/admin/usuarios')
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              👥 Usuarios
            </Link>
            <Link
              to="/admin/validaciones"
              className={`block px-4 py-2 rounded-md text-sm font-medium ${
                isActive('/admin/validaciones')
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              ✅ Validaciones
            </Link>
            <Link
              to="/admin/torneo"
              className={`block px-4 py-2 rounded-md text-sm font-medium ${
                isActive('/admin/torneo')
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              🏆 Torneo
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
