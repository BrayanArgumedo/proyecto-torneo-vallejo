import { useState } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/shared/components/ui/table/table';
import { Badge } from '@/shared/components/ui/badge/badge';
import { Button } from '@/shared/components/ui/button/button';
import { SearchInput } from '@/shared/components/forms/search-input/search-input';
import { EmptyState } from '@/shared/components/feedback/empty-state/empty-state';
import { ConfirmDialog } from '@/shared/components/feedback/confirm-dialog/confirm-dialog';
import { useModal } from '@/shared/hooks/use-modal';
import { formatDate } from '@/shared/utils/format';
import type { Usuario } from '../../types/usuario.types';

interface UserTableProps {
  usuarios: Usuario[];
  onEdit: (usuario: Usuario) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

export const UserTable = ({ usuarios, onEdit, onDelete, isLoading }: UserTableProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [usuarioToDelete, setUsuarioToDelete] = useState<Usuario | null>(null);
  const confirmDialog = useModal();

  // Filtrar usuarios por búsqueda
  const filteredUsuarios = usuarios.filter((usuario) =>
    usuario.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usuario.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteClick = (usuario: Usuario) => {
    setUsuarioToDelete(usuario);
    confirmDialog.open();
  };

  const handleConfirmDelete = () => {
    if (usuarioToDelete) {
      onDelete(usuarioToDelete._id);
      confirmDialog.close();
      setUsuarioToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Cargando usuarios...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Búsqueda */}
      <div className="mb-4">
        <SearchInput
          placeholder="Buscar por nombre o email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onClear={() => setSearchTerm('')}
        />
      </div>

      {/* Tabla */}
      {filteredUsuarios.length === 0 ? (
        <EmptyState
          icon={<span className="text-6xl">👥</span>}
          title={searchTerm ? 'No se encontraron usuarios' : 'No hay usuarios'}
          description={searchTerm ? 'Intenta con otro término de búsqueda' : 'Crea el primer usuario para comenzar'}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha Creación</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsuarios.map((usuario) => (
              <TableRow key={usuario._id}>
                <TableCell className="font-medium">{usuario.nombre}</TableCell>
                <TableCell>{usuario.email}</TableCell>
                <TableCell>
                  <Badge variant={usuario.rol === 'ADMIN' ? 'info' : 'success'}>
                    {usuario.rol}
                  </Badge>
                </TableCell>
                <TableCell>{usuario.telefono || '-'}</TableCell>
                <TableCell>
                  <Badge variant={usuario.activo ? 'success' : 'danger'}>
                    {usuario.activo ? 'Activo' : 'Inactivo'}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-gray-600">
                  {formatDate(usuario.createdAt)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-2 justify-end">
                    <Button size="sm" variant="outline" onClick={() => onEdit(usuario)}>
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDeleteClick(usuario)}
                    >
                      Eliminar
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={confirmDialog.close}
        onConfirm={handleConfirmDelete}
        title="Eliminar Usuario"
        description={`¿Estás seguro de que deseas eliminar a ${usuarioToDelete?.nombre}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  );
};
