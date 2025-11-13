import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { getToken, setToken, removeToken } from '@/lib/auth-token';
import type { Usuario, LoginCredentials } from '../types/auth.types';

export const useAuth = () => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay token y obtener datos del usuario
    const initAuth = async () => {
      const token = getToken();
      if (token) {
        try {
          const data = await apiClient.get<{ success: boolean; data: Usuario }>('/auth/me');
          setUsuario(data.data);
        } catch (error) {
          removeToken();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    const response = await apiClient.post<{ success: boolean; data: { token: string; usuario: Usuario } }>('/auth/login', credentials);
    setToken(response.data.token);
    setUsuario(response.data.usuario);
  };

  const logout = () => {
    removeToken();
    setUsuario(null);
    window.location.href = '/login';
  };

  return {
    usuario,
    isAuthenticated: !!usuario,
    isLoading,
    login,
    logout,
  };
};
