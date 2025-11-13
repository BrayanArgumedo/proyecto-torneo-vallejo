import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { Input } from '@/shared/components/ui/input/input';
import { Button } from '@/shared/components/ui/button/button';
import { Card, CardHeader, CardContent, CardFooter } from '@/shared/components/ui/card/card';
import { FileUpload } from '@/shared/components/forms/file-upload/file-upload';
import type { Equipo, CreateEquipoDTO, UpdateEquipoDTO } from '../../types/equipo.types';

const equipoSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  delegadoId: z.string().optional(),
});

type EquipoFormData = z.infer<typeof equipoSchema>;

interface EquipoFormProps {
  equipo?: Equipo | null;
  onSubmit: (data: CreateEquipoDTO | UpdateEquipoDTO) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  currentUserId?: string; // ID del usuario actual (para crear equipos)
}

export const EquipoForm = ({
  equipo,
  onSubmit,
  onCancel,
  isLoading,
  currentUserId,
}: EquipoFormProps) => {
  const isEditMode = !!equipo;
  const [escudoFile, setEscudoFile] = useState<File | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EquipoFormData>({
    resolver: zodResolver(equipoSchema),
    defaultValues: equipo
      ? {
          nombre: equipo.nombre,
        }
      : {},
  });

  const onSubmitForm = async (data: EquipoFormData) => {
    try {
      if (isEditMode) {
        const updateData: UpdateEquipoDTO = {
          nombre: data.nombre,
          escudo: escudoFile || undefined,
          logo: logoFile || undefined,
        };
        await onSubmit(updateData);
      } else {
        if (!currentUserId) {
          throw new Error('Usuario no identificado');
        }
        const createData: CreateEquipoDTO = {
          nombre: data.nombre,
          delegadoId: currentUserId,
          escudo: escudoFile || undefined,
          logo: logoFile || undefined,
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
            {isEditMode ? 'Editar Equipo' : 'Crear Nuevo Equipo'}
          </h3>
        </CardHeader>

        <CardContent className="space-y-4">
          <Input
            label="Nombre del Equipo"
            placeholder="Ej: Tigres FC"
            {...register('nombre')}
            error={errors.nombre?.message}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Escudo del Equipo {isEditMode && '(Opcional)'}
            </label>
            <FileUpload
              onFileSelect={setEscudoFile}
              accept={{ 'image/*': ['.png', '.jpg', '.jpeg'] }}
              maxSize={2 * 1024 * 1024} // 2MB
              preview={equipo?.escudo}
            />
            <p className="text-xs text-gray-500 mt-1">
              Formato: PNG, JPG o JPEG. Tamaño máximo: 2MB
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Logo del Equipo {isEditMode && '(Opcional)'}
            </label>
            <FileUpload
              onFileSelect={setLogoFile}
              accept={{ 'image/*': ['.png', '.jpg', '.jpeg'] }}
              maxSize={2 * 1024 * 1024} // 2MB
              preview={equipo?.logo}
            />
            <p className="text-xs text-gray-500 mt-1">
              Formato: PNG, JPG o JPEG. Tamaño máximo: 2MB
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex gap-3 justify-end">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? 'Guardando...' : isEditMode ? 'Actualizar' : 'Crear Equipo'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
};
