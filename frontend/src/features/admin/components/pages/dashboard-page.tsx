import { PageHeader } from '@/shared/components/layout/page-header/page-header';
import { Card, CardHeader, CardContent } from '@/shared/components/ui/card/card';
import { Alert } from '@/shared/components/feedback/alert/alert';

export const AdminDashboardPage = () => {
  return (
    <div>
      <PageHeader
        title="Dashboard Administrador"
        description="Panel de control y estadísticas del torneo"
        breadcrumbs={[{ label: 'Dashboard' }]}
      />

      <Alert variant="success" title="Bienvenido, Admin!" className="mb-6">
        Has iniciado sesión correctamente como Administrador.
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">👥 Usuarios</h3>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">0</p>
            <p className="text-sm text-gray-600">Delegados registrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">⚽ Equipos</h3>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">0</p>
            <p className="text-sm text-gray-600">Equipos inscritos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">✅ Validaciones</h3>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-600">0</p>
            <p className="text-sm text-gray-600">Jugadores pendientes</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
