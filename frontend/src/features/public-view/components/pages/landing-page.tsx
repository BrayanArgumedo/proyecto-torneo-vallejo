import { Container } from '@/shared/components/layout/container/container';
import { Button } from '@/shared/components/ui/button/button';
import { Card, CardContent } from '@/shared/components/ui/card/card';

export const LandingPage = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <Container>
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-4">🏆 Torneo Vallejo</h1>
            <p className="text-xl mb-8 text-blue-100">
              Torneo Recreativo de Microfútbol - Urbanización Vallejo
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" variant="primary" className="bg-white text-blue-600 hover:bg-gray-100">
                Ver Equipos
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                Calendario
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* Info Cards */}
      <section className="py-12">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-4xl mb-3">⚽</div>
                <h3 className="text-lg font-semibold mb-2">Equipos Participantes</h3>
                <p className="text-gray-600 text-sm">
                  Consulta todos los equipos inscritos y sus plantillas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-4xl mb-3">📅</div>
                <h3 className="text-lg font-semibold mb-2">Calendario</h3>
                <p className="text-gray-600 text-sm">
                  Revisa el calendario completo de partidos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-4xl mb-3">📊</div>
                <h3 className="text-lg font-semibold mb-2">Tablas</h3>
                <p className="text-gray-600 text-sm">
                  Consulta las tablas de posiciones actualizadas
                </p>
              </CardContent>
            </Card>
          </div>
        </Container>
      </section>
    </div>
  );
};
