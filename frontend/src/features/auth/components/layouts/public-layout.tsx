import { Outlet } from 'react-router-dom';
import { Container } from '@/shared/components/layout/container/container';

export const PublicLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Public Navbar (lo crearemos después) */}
      <nav className="bg-white shadow-sm border-b">
        <Container>
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <span className="text-2xl">⚽</span>
              <span className="text-xl font-bold text-gray-900">Torneo Vallejo</span>
            </div>
            <div className="flex gap-4">
              <a href="/" className="text-gray-700 hover:text-blue-600">
                Inicio
              </a>
              <a href="/equipos" className="text-gray-700 hover:text-blue-600">
                Equipos
              </a>
              <a href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                Ingresar
              </a>
            </div>
          </div>
        </Container>
      </nav>

      {/* Page Content */}
      <main>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12 py-6">
        <Container>
          <p className="text-center text-gray-600 text-sm">
            © 2025 Torneo Vallejo - Urbanización Vallejo
          </p>
        </Container>
      </footer>
    </div>
  );
};
