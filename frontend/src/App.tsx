import { useState } from 'react';
import { Button } from './shared/components/ui/button/button';
import { Input } from './shared/components/ui/input/input';
import { Card, CardHeader, CardContent, CardFooter } from './shared/components/ui/card/card';
import { Badge } from './shared/components/ui/badge/badge';
import { Alert } from './shared/components/feedback/alert/alert';
import { Modal } from './shared/components/ui/modal/modal';
import { LoadingSpinner } from './shared/components/ui/spinner/loading-spinner';
import { Avatar } from './shared/components/ui/avatar/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './shared/components/ui/tabs/tabs';
import { Container } from './shared/components/layout/container/container';
import { PageHeader } from './shared/components/layout/page-header/page-header';

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Container>
        <PageHeader
          title="🎨 UI Kit - Torneo Vallejo"
          description="Demostración de todos los componentes creados en la Fase 1"
          breadcrumbs={[
            { label: 'Inicio', href: '/' },
            { label: 'UI Kit Demo' },
          ]}
        />

        {/* Alert */}
        <Alert variant="success" title="¡Fase 1 Completada!" className="mb-6">
          Todos los componentes base están listos para usar. Ahora podemos empezar con la Fase 2: Autenticación y Routing.
        </Alert>

        {/* Tabs */}
        <Tabs defaultValue="buttons" className="mb-6">
          <TabsList>
            <TabsTrigger value="buttons">Botones</TabsTrigger>
            <TabsTrigger value="forms">Formularios</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
            <TabsTrigger value="others">Otros</TabsTrigger>
          </TabsList>

          {/* Tab 1: Buttons */}
          <TabsContent value="buttons">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Botones y Badges</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Variantes de Botones:</h4>
                  <div className="flex gap-2 flex-wrap">
                    <Button variant="primary">Primary</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="danger">Danger</Button>
                    <Button variant="outline">Outline</Button>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Tamaños:</h4>
                  <div className="flex gap-2 items-center flex-wrap">
                    <Button size="sm">Small</Button>
                    <Button size="md">Medium</Button>
                    <Button size="lg">Large</Button>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Badges:</h4>
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="success">Validado</Badge>
                    <Badge variant="warning">Pendiente</Badge>
                    <Badge variant="danger">Rechazado</Badge>
                    <Badge variant="info">En Proceso</Badge>
                    <Badge variant="default">Default</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 2: Forms */}
          <TabsContent value="forms">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Componentes de Formulario</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input label="Nombre" placeholder="Ingresa tu nombre" />
                <Input label="Email" type="email" placeholder="correo@ejemplo.com" />
                <Input label="Con error" error="Este campo es requerido" />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 3: Feedback */}
          <TabsContent value="feedback">
            <div className="space-y-4">
              <Alert variant="info" title="Información">
                Este es un mensaje informativo.
              </Alert>
              <Alert variant="warning" title="Advertencia">
                Revisa los datos antes de continuar.
              </Alert>
              <Alert variant="danger" title="Error">
                Hubo un problema al procesar la solicitud.
              </Alert>

              <Card>
                <CardContent className="text-center py-8">
                  <Button onClick={() => setIsModalOpen(true)}>
                    Abrir Modal
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab 4: Others */}
          <TabsContent value="others">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Avatares y Spinners</h3>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium mb-2">Avatares:</h4>
                  <div className="flex gap-3 items-center flex-wrap">
                    <Avatar size="sm" fallback="SM" />
                    <Avatar size="md" fallback="MD" />
                    <Avatar size="lg" fallback="LG" />
                    <Avatar size="xl" fallback="XL" />
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Loading Spinners:</h4>
                  <div className="flex gap-4 items-center flex-wrap">
                    <LoadingSpinner size="sm" />
                    <LoadingSpinner size="md" />
                    <LoadingSpinner size="lg" />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="text-sm text-gray-500">
                Todos los componentes son responsive y accesibles ✨
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer Info */}
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <svg className="h-6 w-6 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <h4 className="font-medium text-blue-900 mb-1">✅ FASE 1 Completada</h4>
                <p className="text-sm text-blue-800">
                  20+ componentes UI creados • Todos con TypeScript • Responsive • Sin errores de compilación
                </p>
                <p className="text-sm text-blue-700 mt-2">
                  <strong>Siguiente:</strong> FASE 2 - Sistema de Autenticación y Routing 🔐
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </Container>

      {/* Modal Demo */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Modal de Ejemplo"
        size="md"
      >
        <p className="text-gray-600 mb-4">
          Este es un modal funcional con overlay y animación de entrada/salida.
        </p>
        <p className="text-sm text-gray-500">
          Presiona ESC o haz clic fuera del modal para cerrarlo.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setIsModalOpen(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={() => setIsModalOpen(false)}>
            Aceptar
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export default App;
