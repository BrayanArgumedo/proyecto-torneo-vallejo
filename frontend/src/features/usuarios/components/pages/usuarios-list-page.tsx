import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/shared/components/layout/page-header/page-header';
import { Button } from '@/shared/components/ui/button/button';
import { Modal } from '@/shared/components/ui/modal/modal';
import { useModal } from '@/shared/hooks/use-modal';
import { useUsuarios } from '../../hooks/use-usuarios';
import { UserTable } from '../user-table/user-table';
import { UserForm } from '../user-form/user-form';
import type { Usuario, UpdateUsuarioDTO } from '../../types/usuario.types';

export const UsuariosListPage = () => {
  const navigate = useNavigate();
  const { usuarios, isLoading, updateUsuario, deleteUsuario } = useUsuarios();
  const [usuarioToEdit, setUsuarioToEdit] = useState<Usuario | null>(null);
  const editModal = useModal();

  const handleEdit = (usuario: Usuario) => {
    setUsuarioToEdit(usuario);
    editModal.open();
  };

  const handleUpdateUsuario = async (data: UpdateUsuarioDTO) => {
    if (usuarioToEdit) {
      await updateUsuario(usuarioToEdit._id, data);
      editModal.close();
      setUsuarioToEdit(null);
    }
  };

  const handleCloseEdit = () => {
    editModal.close();
    setUsuarioToEdit(null);
  };

  return (
    <div>
      <PageHeader
        title="Usuarios"
        description="Gestiona los usuarios del sistema"
        breadcrumbs={[
          { label: 'Dashboard', href: '/admin/dashboard' },
          { label: 'Usuarios' },
        ]}
        action={
          <Button variant="primary" onClick={() => navigate('/admin/usuarios/crear')}>
            + Crear Usuario
          </Button>
        }
      />

      <UserTable
        usuarios={usuarios}
        onEdit={handleEdit}
        onDelete={deleteUsuario}
        isLoading={isLoading}
      />

      {/* Modal de Edición */}
      <Modal
        isOpen={editModal.isOpen}
        onClose={handleCloseEdit}
        title="Editar Usuario"
        size="md"
      >
        <UserForm
          usuario={usuarioToEdit}
          onSubmit={handleUpdateUsuario}
          onCancel={handleCloseEdit}
        />
      </Modal>
    </div>
  );
};
