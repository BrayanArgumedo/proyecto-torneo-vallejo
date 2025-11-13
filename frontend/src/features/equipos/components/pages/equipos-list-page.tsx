import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/shared/components/layout/page-header/page-header';
import { Button } from '@/shared/components/ui/button/button';
import { Modal } from '@/shared/components/ui/modal/modal';
import { useModal } from '@/shared/hooks/use-modal';
import { useAuthContext } from '@/features/auth/context/auth-context';
import { useEquipos } from '../../hooks/use-equipos';
import { EquipoTable } from '../equipo-table/equipo-table';
import { EquipoForm } from '../equipo-form/equipo-form';
import type { Equipo, CreateEquipoDTO, UpdateEquipoDTO } from '../../types/equipo.types';

export const EquiposListPage = () => {
  const navigate = useNavigate();
  const { usuario } = useAuthContext();
  const { equipos, isLoading, createEquipo, updateEquipo, deleteEquipo } = useEquipos();
  const [equipoToEdit, setEquipoToEdit] = useState<Equipo | null>(null);
  const createModal = useModal();
  const editModal = useModal();

  const handleCreateEquipo = async (data: CreateEquipoDTO | UpdateEquipoDTO) => {
    await createEquipo(data as CreateEquipoDTO);
    createModal.close();
  };

  const handleEdit = (equipo: Equipo) => {
    setEquipoToEdit(equipo);
    editModal.open();
  };

  const handleUpdateEquipo = async (data: CreateEquipoDTO | UpdateEquipoDTO) => {
    if (equipoToEdit) {
      await updateEquipo(equipoToEdit._id, data as UpdateEquipoDTO);
      editModal.close();
      setEquipoToEdit(null);
    }
  };

  const handleCloseEdit = () => {
    editModal.close();
    setEquipoToEdit(null);
  };

  const handleViewDetails = (equipo: Equipo) => {
    navigate(`/delegado/equipos/${equipo._id}`);
  };

  return (
    <div>
      <PageHeader
        title="Mis Equipos"
        description="Gestiona tus equipos y jugadores"
        breadcrumbs={[
          { label: 'Dashboard', href: '/delegado/dashboard' },
          { label: 'Equipos' },
        ]}
        action={
          <Button variant="primary" onClick={createModal.open}>
            + Crear Equipo
          </Button>
        }
      />

      <EquipoTable
        equipos={equipos}
        onEdit={handleEdit}
        onDelete={deleteEquipo}
        onViewDetails={handleViewDetails}
        isLoading={isLoading}
      />

      {/* Modal de Creaci�n */}
      <Modal
        isOpen={createModal.isOpen}
        onClose={createModal.close}
        title="Crear Nuevo Equipo"
        size="md"
      >
        <EquipoForm
          onSubmit={handleCreateEquipo}
          onCancel={createModal.close}
          currentUserId={usuario?._id}
        />
      </Modal>

      {/* Modal de Edici�n */}
      <Modal
        isOpen={editModal.isOpen}
        onClose={handleCloseEdit}
        title="Editar Equipo"
        size="md"
      >
        <EquipoForm
          equipo={equipoToEdit}
          onSubmit={handleUpdateEquipo}
          onCancel={handleCloseEdit}
        />
      </Modal>
    </div>
  );
};
