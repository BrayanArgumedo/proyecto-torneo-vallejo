import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/shared/components/layout/page-header/page-header';
import { useUsuarios } from '../../hooks/use-usuarios';
import { UserForm } from '../user-form/user-form';
import type { CreateUsuarioDTO } from '../../types/usuario.types';

export const UsuarioCreatePage = () => {
  const navigate = useNavigate();
  const { createUsuario } = useUsuarios();

  const handleCreateUsuario = async (data: CreateUsuarioDTO | import('../../types/usuario.types').UpdateUsuarioDTO) => {
    // En modo crear, siempre es CreateUsuarioDTO
    await createUsuario(data as CreateUsuarioDTO);
    navigate('/admin/usuarios');
  };

  const handleCancel = () => {
    navigate('/admin/usuarios');
  };

  return (
    <div>
      <PageHeader
        title="Crear Usuario"
        description="Crea un nuevo usuario del sistema"
        breadcrumbs={[
          { label: 'Dashboard', href: '/admin/dashboard' },
          { label: 'Usuarios', href: '/admin/usuarios' },
          { label: 'Crear' },
        ]}
      />

      <div className="max-w-2xl">
        <UserForm
          onSubmit={handleCreateUsuario}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
};
