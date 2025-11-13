import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';
import type { Equipo, CreateEquipoDTO, UpdateEquipoDTO } from '../types/equipo.types';
import { mockEquipos } from '@/lib/mock-data/mock-data';

const USE_MOCK_DATA = true;

export const useEquipos = () => {
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchEquipos = async () => {
    setIsLoading(true);
    try {
      if (USE_MOCK_DATA) {
        await new Promise((resolve) => setTimeout(resolve, 300));
        setEquipos([...mockEquipos]);
      } else {
        const response = await apiClient.get<{ success: boolean; data: Equipo[] }>('/equipos');
        setEquipos(response.data);
      }
    } catch (error) {
      toast.error('Error al cargar equipos');
      console.error('Error fetching equipos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getEquipoById = async (id: string): Promise<Equipo | null> => {
    try {
      if (USE_MOCK_DATA) {
        await new Promise((resolve) => setTimeout(resolve, 200));
        return mockEquipos.find((e) => e._id === id) || null;
      } else {
        const response = await apiClient.get<{ success: boolean; data: Equipo }>(`/equipos/${id}`);
        return response.data;
      }
    } catch (error) {
      toast.error('Error al cargar equipo');
      console.error('Error fetching equipo:', error);
      return null;
    }
  };

  const createEquipo = async (data: CreateEquipoDTO): Promise<Equipo | null> => {
    try {
      if (USE_MOCK_DATA) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        toast.success('Equipo creado exitosamente (Demo)');
        return null;
      } else {
        const formData = new FormData();
        formData.append('nombre', data.nombre);
        formData.append('delegadoId', data.delegadoId);

        if (data.escudo instanceof File) {
          formData.append('escudo', data.escudo);
        }
        if (data.logo instanceof File) {
          formData.append('logo', data.logo);
        }

        const response = await apiClient.post<{ success: boolean; data: Equipo }>(
          '/equipos',
          formData,
          {
            headers: { 'Content-Type': 'multipart/form-data' },
          }
        );

        toast.success('Equipo creado exitosamente');
        await fetchEquipos();
        return response.data;
      }
    } catch (error) {
      toast.error('Error al crear equipo');
      console.error('Error creating equipo:', error);
      return null;
    }
  };

  const updateEquipo = async (id: string, data: UpdateEquipoDTO): Promise<Equipo | null> => {
    try {
      if (USE_MOCK_DATA) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        toast.success('Equipo actualizado exitosamente (Demo)');
        return null;
      } else {
        const formData = new FormData();
        if (data.nombre) formData.append('nombre', data.nombre);
        if (data.escudo instanceof File) formData.append('escudo', data.escudo);
        if (data.logo instanceof File) formData.append('logo', data.logo);

        const response = await apiClient.put<{ success: boolean; data: Equipo }>(
          `/equipos/${id}`,
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );

        toast.success('Equipo actualizado exitosamente');
        await fetchEquipos();
        return response.data;
      }
    } catch (error) {
      toast.error('Error al actualizar equipo');
      console.error('Error updating equipo:', error);
      return null;
    }
  };

  const deleteEquipo = async (id: string): Promise<boolean> => {
    try {
      if (USE_MOCK_DATA) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        toast.success('Equipo eliminado exitosamente (Demo)');
        return true;
      } else {
        await apiClient.delete(`/equipos/${id}`);
        toast.success('Equipo eliminado exitosamente');
        await fetchEquipos();
        return true;
      }
    } catch (error) {
      toast.error('Error al eliminar equipo');
      console.error('Error deleting equipo:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchEquipos();
  }, []);

  return {
    equipos,
    isLoading,
    fetchEquipos,
    getEquipoById,
    createEquipo,
    updateEquipo,
    deleteEquipo,
  };
};
