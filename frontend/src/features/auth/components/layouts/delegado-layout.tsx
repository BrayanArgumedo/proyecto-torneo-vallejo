import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuthContext } from '../../context/auth-context';
import { Container } from '@/shared/components/layout/container/container';
import { Button } from '@/shared/components/ui/button/button';

export const DelegadoLayout = () => {
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
              <span className="ml-3 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                Delegado
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
              to="/delegado/dashboard"
              className={`block px-4 py-2 rounded-md text-sm font-medium ${
                isActive('/delegado/dashboard')
                  ? 'bg-green-100 text-green-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              📊 Dashboard
            </Link>
            <Link
              to="/delegado/equipos"
              className={`block px-4 py-2 rounded-md text-sm font-medium ${
                isActive('/delegado/equipos') || location.pathname.startsWith('/delegado/equipos/')
                  ? 'bg-green-100 text-green-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              ⚽ Mis Equipos
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
