import { useState } from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/shared/components/ui/table/table';
import { Badge } from '@/shared/components/ui/badge/badge';
import { Button } from '@/shared/components/ui/button/button';
import { EmptyState } from '@/shared/components/feedback/empty-state/empty-state';
import { ConfirmDialog } from '@/shared/components/feedback/confirm-dialog/confirm-dialog';
import { useModal } from '@/shared/hooks/use-modal';
import { formatDate } from '@/shared/utils/format';
import { EstadoValidacion } from '@/types/enums';
import type { Jugador } from '../../types/equipo.types';

interface JugadorTableProps {
  jugadores: Jugador[];
  onDelete?: (id: string) => void;
  onValidate?: (jugador: Jugador) => void;
  isLoading?: boolean;
  showValidationActions?: boolean; // Para vista de admin
}

export const JugadorTable = ({
  jugadores,
  onDelete,
  onValidate,
  isLoading,
  showValidationActions = false,
}: JugadorTableProps) => {
  const [jugadorToDelete, setJugadorToDelete] = useState<Jugador | null>(null);
  const confirmDialog = useModal();

  const handleDeleteClick = (jugador: Jugador) => {
    setJugadorToDelete(jugador);
    confirmDialog.open();
  };

  const handleConfirmDelete = () => {
    if (jugadorToDelete && onDelete) {
      onDelete(jugadorToDelete._id);
      confirmDialog.close();
      setJugadorToDelete(null);
    }
  };

  const getEstadoBadgeVariant = (estado: EstadoValidacion) => {
    switch (estado) {
      case EstadoValidacion.APROBADO:
        return 'success';
      case EstadoValidacion.RECHAZADO:
        return 'danger';
      case EstadoValidacion.PENDIENTE:
        return 'warning';
      default:
        return 'default';
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Cargando jugadores...</p>
      </div>
    );
  }

  return (
    <div>
      {jugadores.length === 0 ? (
        <EmptyState
          icon={<span className="text-6xl">½</span>}
          title="No hay jugadores registrados"
          description="Registra el primer jugador para comenzar a formar tu equipo"
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Foto</TableHead>
              <TableHead>Nombre Completo</TableHead>
              <TableHead>Documento</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha Registro</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jugadores.map((jugador) => (
              <TableRow key={jugador._id}>
                <TableCell>
                  <img
                    src={jugador.foto}
                    alt={`${jugador.nombres} ${jugador.apellidos}`}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                </TableCell>
                <TableCell className="font-medium">
                  {jugador.nombres} {jugador.apellidos}
                </TableCell>
                <TableCell>{jugador.numeroDocumento}</TableCell>
                <TableCell>
                  <Badge variant="info" size="sm">
                    {jugador.tipo.replace(/_/g, ' ')}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getEstadoBadgeVariant(jugador.estadoValidacion)}>
                    {jugador.estadoValidacion}
                  </Badge>
                  {jugador.motivoRechazo && (
                    <p className="text-xs text-red-600 mt-1">
                      {jugador.motivoRechazo}
                    </p>
                  )}
                </TableCell>
                <TableCell className="text-sm text-gray-600">
                  {formatDate(jugador.createdAt)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-2 justify-end">
                    {showValidationActions &&
                      jugador.estadoValidacion === EstadoValidacion.PENDIENTE && (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => onValidate?.(jugador)}
                        >
                          Validar
                        </Button>
                      )}
                    {onDelete && (
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDeleteClick(jugador)}
                      >
                        Eliminar
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={confirmDialog.close}
        onConfirm={handleConfirmDelete}
        title="Eliminar Jugador"
        description={`¿Estás seguro de que deseas eliminar a ${jugadorToDelete?.nombres} ${jugadorToDelete?.apellidos}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  );
};
