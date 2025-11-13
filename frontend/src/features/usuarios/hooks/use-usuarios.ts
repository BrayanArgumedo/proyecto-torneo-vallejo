import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/shared/hooks/use-toast';
import type { Usuario, CreateUsuarioDTO, UpdateUsuarioDTO } from '../types/usuario.types';
import { mockUsuarios } from '@/lib/mock-data/mock-data';

const USE_MOCK_DATA = true;

export const useUsuarios = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  // Obtener todos los usuarios
  const fetchUsuarios = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (USE_MOCK_DATA) {
        // Simular delay de red
        await new Promise((resolve) => setTimeout(resolve, 300));
        setUsuarios([...mockUsuarios]);
      } else {
        const response = await apiClient.get<{ success: boolean; data: Usuario[] }>('/usuarios');
        setUsuarios(response.data);
      }
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Error al cargar usuarios';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Crear usuario
  const createUsuario = async (data: CreateUsuarioDTO): Promise<Usuario | null> => {
    try {
      if (USE_MOCK_DATA) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        toast.success('Usuario creado exitosamente (Demo)');
        return null;
      } else {
        const response = await apiClient.post<{ success: boolean; data: Usuario }>('/usuarios', data);
        toast.success('Usuario creado exitosamente');
        await fetchUsuarios();
        return response.data;
      }
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Error al crear usuario';
      toast.error(message);
      throw err;
    }
  };

  // Actualizar usuario
  const updateUsuario = async (id: string, data: UpdateUsuarioDTO): Promise<Usuario | null> => {
    try {
      if (USE_MOCK_DATA) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        toast.success('Usuario actualizado exitosamente (Demo)');
        return null;
      } else {
        const response = await apiClient.put<{ success: boolean; data: Usuario }>(`/usuarios/${id}`, data);
        toast.success('Usuario actualizado exitosamente');
        await fetchUsuarios();
        return response.data;
      }
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Error al actualizar usuario';
      toast.error(message);
      throw err;
    }
  };

  // Eliminar usuario
  const deleteUsuario = async (id: string): Promise<void> => {
    try {
      if (USE_MOCK_DATA) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        toast.success('Usuario eliminado exitosamente (Demo)');
      } else {
        await apiClient.delete(`/usuarios/${id}`);
        toast.success('Usuario eliminado exitosamente');
        await fetchUsuarios();
      }
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Error al eliminar usuario';
      toast.error(message);
      throw err;
    }
  };

  // Cargar usuarios al montar el componente
  useEffect(() => {
    fetchUsuarios();
  }, []);

  return {
    usuarios,
    isLoading,
    error,
    fetchUsuarios,
    createUsuario,
    updateUsuario,
    deleteUsuario,
  };
};
