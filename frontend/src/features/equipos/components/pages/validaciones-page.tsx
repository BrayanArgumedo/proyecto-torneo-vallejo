import { useState, useEffect } from 'react';
import { PageHeader } from '@/shared/components/layout/page-header/page-header';
import { Modal } from '@/shared/components/ui/modal/modal';
import { Card, CardHeader, CardContent, CardFooter } from '@/shared/components/ui/card/card';
import { Button } from '@/shared/components/ui/button/button';
import { Badge } from '@/shared/components/ui/badge/badge';
import { Input } from '@/shared/components/ui/input/input';
import { useModal } from '@/shared/hooks/use-modal';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';
import { EstadoValidacion } from '@/types/enums';
import type { Jugador, ValidarJugadorDTO } from '../../types/equipo.types';

export const ValidacionesPage = () => {
  const [jugadoresPendientes, setJugadoresPendientes] = useState<Jugador[]>([]);
  const [jugadorSeleccionado, setJugadorSeleccionado] = useState<Jugador | null>(null);
  const [motivoRechazo, setMotivoRechazo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const validacionModal = useModal();

  useEffect(() => {
    fetchJugadoresPendientes();
  }, []);

  const fetchJugadoresPendientes = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get<{ success: boolean; data: Jugador[] }>(
        '/jugadores/pendientes'
      );
      setJugadoresPendientes(response.data);
    } catch (error) {
      toast.error('Error al cargar jugadores pendientes');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenValidacion = (jugador: Jugador) => {
    setJugadorSeleccionado(jugador);
    setMotivoRechazo('');
    validacionModal.open();
  };

  const handleValidar = async (estado: EstadoValidacion) => {
    if (!jugadorSeleccionado) return;

    if (estado === EstadoValidacion.RECHAZADO && !motivoRechazo.trim()) {
      toast.error('Debes indicar el motivo del rechazo');
      return;
    }

    try {
      const data: ValidarJugadorDTO = {
        estado,
        motivoRechazo: estado === EstadoValidacion.RECHAZADO ? motivoRechazo : undefined,
      };

      await apiClient.post(`/jugadores/${jugadorSeleccionado._id}/validar`, data);
      toast.success(
        estado === EstadoValidacion.APROBADO
          ? 'Jugador aprobado exitosamente'
          : 'Jugador rechazado'
      );

      validacionModal.close();
      setJugadorSeleccionado(null);
      setMotivoRechazo('');
      await fetchJugadoresPendientes();
    } catch (error) {
      toast.error('Error al validar jugador');
      console.error(error);
    }
  };

  return (
    <div>
      <PageHeader
        title="Validación de Jugadores"
        description="Revisa y valida los documentos de los jugadores registrados"
        breadcrumbs={[
          { label: 'Dashboard', href: '/admin/dashboard' },
          { label: 'Validaciones' },
        ]}
      />

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Cargando jugadores pendientes...</p>
        </div>
      ) : jugadoresPendientes.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <span className="text-6xl mb-4 block"></span>
            <h3 className="text-xl font-semibold mb-2">No hay validaciones pendientes</h3>
            <p className="text-gray-600">
              Todos los jugadores han sido revisados y validados
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jugadoresPendientes.map((jugador) => (
            <Card key={jugador._id}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <img
                    src={jugador.foto}
                    alt={`${jugador.nombres} ${jugador.apellidos}`}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-semibold">
                      {jugador.nombres} {jugador.apellidos}
                    </h3>
                    <Badge variant="warning" size="sm">
                      {jugador.estadoValidacion}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-2">
                <div>
                  <p className="text-sm text-gray-600">Documento:</p>
                  <p className="font-medium">{jugador.numeroDocumento}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tipo:</p>
                  <Badge variant="info" size="sm">
                    {jugador.tipo.replace(/_/g, ' ')}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Teléfono:</p>
                  <p className="font-medium">{jugador.telefono}</p>
                </div>
              </CardContent>

              <CardFooter>
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => handleOpenValidacion(jugador)}
                >
                  Validar Documentos
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de Validación */}
      <Modal
        isOpen={validacionModal.isOpen}
        onClose={() => {
          validacionModal.close();
          setJugadorSeleccionado(null);
          setMotivoRechazo('');
        }}
        title="Validar Jugador"
        size="lg"
      >
        {jugadorSeleccionado && (
          <div>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <img
                    src={jugadorSeleccionado.foto}
                    alt={`${jugadorSeleccionado.nombres} ${jugadorSeleccionado.apellidos}`}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="text-xl font-bold">
                      {jugadorSeleccionado.nombres} {jugadorSeleccionado.apellidos}
                    </h3>
                    <p className="text-gray-600">{jugadorSeleccionado.numeroDocumento}</p>
                    <Badge variant="info">{jugadorSeleccionado.tipo.replace(/_/g, ' ')}</Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Información del Jugador</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Fecha de Nacimiento:</p>
                      <p className="font-medium">{jugadorSeleccionado.fechaNacimiento}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Teléfono:</p>
                      <p className="font-medium">{jugadorSeleccionado.telefono}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Teléfono de Emergencia:</p>
                      <p className="font-medium">{jugadorSeleccionado.telefonoEmergencia}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Documentos</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Documento de Identidad:</p>
                      <a
                        href={jugadorSeleccionado.documentos.documentoIdentidad}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <img
                          src={jugadorSeleccionado.documentos.documentoIdentidad}
                          alt="Documento de identidad"
                          className="w-full rounded border hover:opacity-80 transition"
                        />
                      </a>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 w-full"
                        onClick={() =>
                          window.open(
                            jugadorSeleccionado.documentos.documentoIdentidad,
                            '_blank'
                          )
                        }
                      >
                        Ver en tamaño completo
                      </Button>
                    </div>

                    {jugadorSeleccionado.documentos.certificadoResidencia && (
                      <div>
                        <p className="text-sm text-gray-600 mb-2">
                          Certificado de Residencia:
                        </p>
                        <a
                          href={jugadorSeleccionado.documentos.certificadoResidencia}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block"
                        >
                          <img
                            src={jugadorSeleccionado.documentos.certificadoResidencia}
                            alt="Certificado de residencia"
                            className="w-full rounded border hover:opacity-80 transition"
                          />
                        </a>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2 w-full"
                          onClick={() =>
                            window.open(
                              jugadorSeleccionado.documentos.certificadoResidencia!,
                              '_blank'
                            )
                          }
                        >
                          Ver en tamaño completo
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <Input
                    label="Motivo de Rechazo (Opcional si apruebas)"
                    placeholder="Ej: Documento ilegible, no corresponde a la persona..."
                    value={motivoRechazo}
                    onChange={(e) => setMotivoRechazo(e.target.value)}
                  />
                </div>
              </CardContent>

              <CardFooter className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    validacionModal.close();
                    setJugadorSeleccionado(null);
                    setMotivoRechazo('');
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  variant="danger"
                  onClick={() => handleValidar(EstadoValidacion.RECHAZADO)}
                >
                  Rechazar
                </Button>
                <Button
                  variant="primary"
                  onClick={() => handleValidar(EstadoValidacion.APROBADO)}
                >
                  Aprobar
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}
      </Modal>
    </div>
  );
};
