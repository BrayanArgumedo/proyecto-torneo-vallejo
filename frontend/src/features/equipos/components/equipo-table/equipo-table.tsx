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
import { SearchInput } from '@/shared/components/forms/search-input/search-input';
import { EmptyState } from '@/shared/components/feedback/empty-state/empty-state';
import { ConfirmDialog } from '@/shared/components/feedback/confirm-dialog/confirm-dialog';
import { useModal } from '@/shared/hooks/use-modal';
import { formatDate } from '@/shared/utils/format';
import type { Equipo } from '../../types/equipo.types';

interface EquipoTableProps {
  equipos: Equipo[];
  onEdit?: (equipo: Equipo) => void;
  onDelete?: (id: string) => void;
  onViewDetails: (equipo: Equipo) => void;
  isLoading?: boolean;
}

export const EquipoTable = ({
  equipos,
  onEdit,
  onDelete,
  onViewDetails,
  isLoading,
}: EquipoTableProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [equipoToDelete, setEquipoToDelete] = useState<Equipo | null>(null);
  const confirmDialog = useModal();

  const filteredEquipos = equipos.filter(
    (equipo) =>
      equipo.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      equipo.delegado.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteClick = (equipo: Equipo) => {
    setEquipoToDelete(equipo);
    confirmDialog.open();
  };

  const handleConfirmDelete = () => {
    if (equipoToDelete && onDelete) {
      onDelete(equipoToDelete._id);
      confirmDialog.close();
      setEquipoToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Cargando equipos...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <SearchInput
          placeholder="Buscar por nombre de equipo o delegado..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onClear={() => setSearchTerm('')}
        />
      </div>

      {filteredEquipos.length === 0 ? (
        <EmptyState
          icon={<span className="text-6xl">½</span>}
          title={searchTerm ? 'No se encontraron equipos' : 'No hay equipos'}
          description={
            searchTerm
              ? 'Intenta con otro término de búsqueda'
              : 'Crea el primer equipo para comenzar'
          }
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Escudo</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Delegado</TableHead>
              <TableHead>Jugadores</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha Creación</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEquipos.map((equipo) => (
              <TableRow key={equipo._id}>
                <TableCell>
                  {equipo.escudo ? (
                    <img
                      src={equipo.escudo}
                      alt={equipo.nombre}
                      className="w-10 h-10 rounded object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center text-gray-500 text-xs">
                      N/A
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-medium">{equipo.nombre}</TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{equipo.delegado.nombre}</p>
                    <p className="text-sm text-gray-500">{equipo.delegado.email}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="info">{equipo.jugadores.length} / 16</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={equipo.validado ? 'success' : 'warning'}>
                    {equipo.validado ? 'Validado' : 'Pendiente'}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-gray-600">
                  {formatDate(equipo.createdAt)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-2 justify-end">
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => onViewDetails(equipo)}
                    >
                      Ver Detalles
                    </Button>
                    {onEdit && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onEdit(equipo)}
                      >
                        Editar
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDeleteClick(equipo)}
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
        title="Eliminar Equipo"
        description={`¿Estás seguro de que deseas eliminar el equipo "${equipoToDelete?.nombre}"? Se eliminarán todos los jugadores asociados. Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  );
};
