import { PageHeader } from '@/shared/components/layout/page-header/page-header';
import { Card, CardHeader, CardContent } from '@/shared/components/ui/card/card';
import { Alert } from '@/shared/components/feedback/alert/alert';
import { Button } from '@/shared/components/ui/button/button';

export const DelegadoDashboardPage = () => {
  return (
    <div>
      <PageHeader
        title="Dashboard Delegado"
        description="Gestiona tu equipo y jugadores"
        breadcrumbs={[{ label: 'Dashboard' }]}
      />

      <Alert variant="info" title="Bienvenido!" className="mb-6">
        Has iniciado sesión correctamente como Delegado.
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">⚽ Mi Equipo</h3>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">Aún no has creado tu equipo</p>
            <Button variant="primary">Crear Equipo</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">👥 Jugadores</h3>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">0/16</p>
            <p className="text-sm text-gray-600">Jugadores inscritos</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
