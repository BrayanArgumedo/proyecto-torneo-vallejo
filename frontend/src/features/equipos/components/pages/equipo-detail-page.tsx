import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { PageHeader } from '@/shared/components/layout/page-header/page-header';
import { Button } from '@/shared/components/ui/button/button';
import { Card, CardHeader, CardContent } from '@/shared/components/ui/card/card';
import { Modal } from '@/shared/components/ui/modal/modal';
import { Badge } from '@/shared/components/ui/badge/badge';
import { useModal } from '@/shared/hooks/use-modal';
import { useEquipos } from '../../hooks/use-equipos';
import { useJugadores } from '../../hooks/use-jugadores';
import { JugadorTable } from '../jugador-table/jugador-table';
import { JugadorWizard } from '../jugador-wizard/jugador-wizard';
import type { Equipo, QuotaValidation } from '../../types/equipo.types';

export const EquipoDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [equipo, setEquipo] = useState<Equipo | null>(null);
  const [quotaValidation, setQuotaValidation] = useState<QuotaValidation | null>(null);
  const { getEquipoById } = useEquipos();
  const { jugadores, isLoading, deleteJugador, validateQuotas } = useJugadores(id);
  const wizardModal = useModal();

  useEffect(() => {
    if (id) {
      loadEquipo();
      loadQuotaValidation();
    }
  }, [id]);

  const loadEquipo = async () => {
    if (id) {
      const data = await getEquipoById(id);
      setEquipo(data);
    }
  };

  const loadQuotaValidation = async () => {
    if (id) {
      const validation = await validateQuotas(id);
      setQuotaValidation(validation);
    }
  };

  const handleWizardComplete = () => {
    wizardModal.close();
    loadQuotaValidation();
  };

  if (!equipo) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Cargando equipo...</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={equipo.nombre}
        description={`Delegado: ${equipo.delegado.nombre}`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/delegado/dashboard' },
          { label: 'Equipos', href: '/delegado/equipos' },
          { label: equipo.nombre },
        ]}
        action={
          <Button
            variant="primary"
            onClick={wizardModal.open}
            disabled={jugadores.length >= 16}
          >
            + Registrar Jugador
          </Button>
        }
      />

      {/* Informaci�n del Equipo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader>
            <h3 className="text-sm font-medium text-gray-600">Total Jugadores</h3>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {jugadores.length} <span className="text-lg text-gray-500">/ 16</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-sm font-medium text-gray-600">Estado del Equipo</h3>
          </CardHeader>
          <CardContent>
            <Badge variant={equipo.validado ? 'success' : 'warning'} size="lg">
              {equipo.validado ? 'Validado' : 'Pendiente'}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-sm font-medium text-gray-600">Delegado</h3>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{equipo.delegado.nombre}</p>
            <p className="text-sm text-gray-500">{equipo.delegado.email}</p>
            {equipo.delegado.telefono && (
              <p className="text-sm text-gray-500">{equipo.delegado.telefono}</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Validaci�n de Cuotas */}
      {quotaValidation && (
        <Card className="mb-6">
          <CardHeader>
            <h3 className="text-lg font-semibold">Validaci�n de Cuotas</h3>
          </CardHeader>
          <CardContent>
            {quotaValidation.isValid ? (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
                 El equipo cumple con todas las cuotas establecidas
              </div>
            ) : (
              <div className="space-y-3">
                {quotaValidation.errors.map((error, idx) => (
                  <div
                    key={idx}
                    className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded"
                  >
                     {error}
                  </div>
                ))}
              </div>
            )}

            {quotaValidation.warnings.length > 0 && (
              <div className="space-y-2 mt-4">
                {quotaValidation.warnings.map((warning, idx) => (
                  <div
                    key={idx}
                    className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded"
                  >
                    � {warning}
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-xs text-gray-600">Total Jugadores</p>
                <p className="text-xl font-bold">{quotaValidation.details.totalJugadores}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-xs text-gray-600">Propietarios</p>
                <p className="text-xl font-bold">
                  {quotaValidation.details.habitantesPropietarios}
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-xs text-gray-600">Arrendatarios</p>
                <p className="text-xl font-bold">
                  {quotaValidation.details.habitantesArrendatarios}
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-xs text-gray-600">Docentes</p>
                <p className="text-xl font-bold">
                  {quotaValidation.details.docentesUComfacauca}
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-xs text-gray-600">Extranjeros</p>
                <p className="text-xl font-bold">{quotaValidation.details.extranjeros}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabla de Jugadores */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Roster de Jugadores</h3>
        </CardHeader>
        <CardContent>
          <JugadorTable
            jugadores={jugadores}
            onDelete={deleteJugador}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      {/* Modal del Wizard */}
      <Modal
        isOpen={wizardModal.isOpen}
        onClose={wizardModal.close}
        title="Registrar Nuevo Jugador"
        size="lg"
      >
        <JugadorWizard
          equipoId={id!}
          onComplete={handleWizardComplete}
          onCancel={wizardModal.close}
        />
      </Modal>
    </div>
  );
};
