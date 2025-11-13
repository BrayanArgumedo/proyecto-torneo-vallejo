import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/shared/components/ui/input/input';
import { Select } from '@/shared/components/ui/select/select';
import { Button } from '@/shared/components/ui/button/button';
import { Card, CardHeader, CardContent, CardFooter } from '@/shared/components/ui/card/card';
import { Checkbox } from '@/shared/components/ui/checkbox/checkbox';
import { Rol } from '@/types/enums';
import type { Usuario, CreateUsuarioDTO, UpdateUsuarioDTO } from '../../types/usuario.types';

// Validación con Zod
const usuarioSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').optional(),
  rol: z.enum(['ADMIN', 'DELEGADO']),
  telefono: z.string().optional(),
  activo: z.boolean().optional(),
});

type UsuarioFormData = z.infer<typeof usuarioSchema>;

interface UserFormProps {
  usuario?: Usuario | null; // Si existe, es modo edición
  onSubmit: (data: CreateUsuarioDTO | UpdateUsuarioDTO) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const UserForm = ({ usuario, onSubmit, onCancel, isLoading }: UserFormProps) => {
  const isEditMode = !!usuario;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UsuarioFormData>({
    resolver: zodResolver(usuarioSchema),
    defaultValues: usuario
      ? {
          nombre: usuario.nombre,
          email: usuario.email,
          rol: usuario.rol,
          telefono: usuario.telefono || '',
          activo: usuario.activo,
        }
      : {
          activo: true,
        },
  });

  const onSubmitForm = async (data: UsuarioFormData) => {
    try {
      if (isEditMode) {
        // Modo edición: no enviamos password si está vacío
        const updateData: UpdateUsuarioDTO = {
          nombre: data.nombre,
          telefono: data.telefono,
          activo: data.activo,
        };
        await onSubmit(updateData);
      } else {
        // Modo creación: password es requerido
        if (!data.password) {
          throw new Error('La contraseña es requerida');
        }
        const createData: CreateUsuarioDTO = {
          nombre: data.nombre,
          email: data.email,
          password: data.password,
          rol: data.rol,
          telefono: data.telefono,
        };
        await onSubmit(createData);
      }
    } catch (error) {
      console.error('Error al enviar formulario:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)}>
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">
            {isEditMode ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
          </h3>
        </CardHeader>

        <CardContent className="space-y-4">
          <Input
            label="Nombre Completo"
            placeholder="Juan Pérez"
            {...register('nombre')}
            error={errors.nombre?.message}
          />

          <Input
            label="Email"
            type="email"
            placeholder="correo@ejemplo.com"
            {...register('email')}
            error={errors.email?.message}
            disabled={isEditMode} // No se puede cambiar email en edición
          />

          {!isEditMode && (
            <Input
              label="Contraseña"
              type="password"
              placeholder="••••••••"
              {...register('password')}
              error={errors.password?.message}
            />
          )}

          <Select
            label="Rol"
            options={[
              { value: Rol.ADMIN, label: 'Administrador' },
              { value: Rol.DELEGADO, label: 'Delegado' },
            ]}
            {...register('rol')}
            error={errors.rol?.message}
            disabled={isEditMode} // No se puede cambiar rol en edición
          />

          <Input
            label="Teléfono (Opcional)"
            type="tel"
            placeholder="3001234567"
            {...register('telefono')}
            error={errors.telefono?.message}
          />

          {isEditMode && (
            <div className="flex items-center">
              <Checkbox
                label="Usuario Activo"
                {...register('activo')}
              />
            </div>
          )}
        </CardContent>

        <CardFooter className="flex gap-3 justify-end">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? 'Guardando...' : isEditMode ? 'Actualizar' : 'Crear Usuario'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
};
