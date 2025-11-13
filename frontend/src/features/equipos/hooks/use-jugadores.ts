import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';
import type {
  Jugador,
  CreateJugadorDTO,
  UpdateJugadorDTO,
  ValidarJugadorDTO,
  QuotaValidation,
  EdadValidation,
} from '../types/equipo.types';
import { getJugadoresByEquipoId } from '@/lib/mock-data/mock-data';

const USE_MOCK_DATA = true;

export const useJugadores = (equipoId?: string) => {
  const [jugadores, setJugadores] = useState<Jugador[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchJugadores = async (eqId?: string) => {
    const id = eqId || equipoId;
    if (!id) return;

    setIsLoading(true);
    try {
      if (USE_MOCK_DATA) {
        await new Promise((resolve) => setTimeout(resolve, 300));
        setJugadores(getJugadoresByEquipoId(id));
      } else {
        const response = await apiClient.get<{ success: boolean; data: Jugador[] }>(
          `/equipos/${id}/jugadores`
        );
        setJugadores(response.data);
      }
    } catch (error) {
      toast.error('Error al cargar jugadores');
      console.error('Error fetching jugadores:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getJugadorById = async (id: string): Promise<Jugador | null> => {
    try {
      const response = await apiClient.get<{ success: boolean; data: Jugador }>(
        `/jugadores/${id}`
      );
      return response.data;
    } catch (error) {
      toast.error('Error al cargar jugador');
      console.error('Error fetching jugador:', error);
      return null;
    }
  };

  const createJugador = async (data: CreateJugadorDTO): Promise<Jugador | null> => {
    try {
      const formData = new FormData();

      // Datos b�sicos
      formData.append('equipoId', data.equipoId);
      formData.append('nombres', data.nombres);
      formData.append('apellidos', data.apellidos);
      formData.append('numeroDocumento', data.numeroDocumento);
      formData.append('fechaNacimiento', data.fechaNacimiento);
      formData.append('telefono', data.telefono);
      formData.append('telefonoEmergencia', data.telefonoEmergencia);
      formData.append('tipo', data.tipo);

      // Archivos
      formData.append('foto', data.foto);
      formData.append('documentoIdentidad', data.documentoIdentidad);
      if (data.certificadoResidencia) {
        formData.append('certificadoResidencia', data.certificadoResidencia);
      }

      const response = await apiClient.post<{ success: boolean; data: Jugador }>(
        '/jugadores',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );

      toast.success('Jugador registrado exitosamente');
      await fetchJugadores(data.equipoId);
      return response.data;
    } catch (error) {
      toast.error('Error al registrar jugador');
      console.error('Error creating jugador:', error);
      return null;
    }
  };

  const updateJugador = async (id: string, data: UpdateJugadorDTO): Promise<Jugador | null> => {
    try {
      const formData = new FormData();

      if (data.nombres) formData.append('nombres', data.nombres);
      if (data.apellidos) formData.append('apellidos', data.apellidos);
      if (data.telefono) formData.append('telefono', data.telefono);
      if (data.telefonoEmergencia) formData.append('telefonoEmergencia', data.telefonoEmergencia);

      if (data.foto instanceof File) {
        formData.append('foto', data.foto);
      }
      if (data.documentoIdentidad instanceof File) {
        formData.append('documentoIdentidad', data.documentoIdentidad);
      }
      if (data.certificadoResidencia instanceof File) {
        formData.append('certificadoResidencia', data.certificadoResidencia);
      }

      const response = await apiClient.put<{ success: boolean; data: Jugador }>(
        `/jugadores/${id}`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );

      toast.success('Jugador actualizado exitosamente');
      if (equipoId) await fetchJugadores(equipoId);
      return response.data;
    } catch (error) {
      toast.error('Error al actualizar jugador');
      console.error('Error updating jugador:', error);
      return null;
    }
  };

  const deleteJugador = async (id: string): Promise<boolean> => {
    try {
      await apiClient.delete(`/jugadores/${id}`);
      toast.success('Jugador eliminado exitosamente');
      if (equipoId) await fetchJugadores(equipoId);
      return true;
    } catch (error) {
      toast.error('Error al eliminar jugador');
      console.error('Error deleting jugador:', error);
      return false;
    }
  };

  const validarJugador = async (id: string, data: ValidarJugadorDTO): Promise<boolean> => {
    try {
      await apiClient.post(`/jugadores/${id}/validar`, data);
      toast.success(
        data.estado === 'APROBADO' ? 'Jugador aprobado' : 'Jugador rechazado'
      );
      if (equipoId) await fetchJugadores(equipoId);
      return true;
    } catch (error) {
      toast.error('Error al validar jugador');
      console.error('Error validating jugador:', error);
      return false;
    }
  };

  const validateQuotas = async (eqId: string): Promise<QuotaValidation | null> => {
    try {
      const response = await apiClient.get<{ success: boolean; data: QuotaValidation }>(
        `/equipos/${eqId}/validar-cuotas`
      );
      return response.data;
    } catch (error) {
      console.error('Error validating quotas:', error);
      return null;
    }
  };

  const validateEdad = (fechaNacimiento: string): EdadValidation => {
    const hoy = new Date();
    const fechaNac = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    const mesActual = hoy.getMonth();
    const mesNacimiento = fechaNac.getMonth();

    if (mesActual < mesNacimiento || (mesActual === mesNacimiento && hoy.getDate() < fechaNac.getDate())) {
      edad--;
    }

    const edadMinima = 15;
    const isValid = edad >= edadMinima;

    return {
      isValid,
      edad,
      edadMinima,
      mensaje: isValid
        ? `Edad v�lida: ${edad} a�os`
        : `Edad insuficiente: ${edad} a�os. M�nimo requerido: ${edadMinima} a�os`,
    };
  };

  useEffect(() => {
    if (equipoId) {
      fetchJugadores(equipoId);
    }
  }, [equipoId]);

  return {
    jugadores,
    isLoading,
    fetchJugadores,
    getJugadorById,
    createJugador,
    updateJugador,
    deleteJugador,
    validarJugador,
    validateQuotas,
    validateEdad,
  };
};
