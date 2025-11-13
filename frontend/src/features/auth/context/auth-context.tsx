import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { apiClient } from '@/lib/api-client';
import { getToken, setToken as saveToken, removeToken } from '@/lib/auth-token';
import type { Usuario, LoginCredentials, AuthContextType } from '../types/auth.types';
import { useToast } from '@/shared/hooks/use-toast';
import { mockUsuarios } from '@/lib/mock-data/mock-data';

// MODO DEMO - Activar para usar datos mock sin backend
const USE_MOCK_DATA = true;

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  // Verificar si hay sesión activa al cargar la app
  useEffect(() => {
    const checkAuth = async () => {
      const token = getToken();
      if (token) {
        if (USE_MOCK_DATA) {
          // Modo mock: recuperar usuario desde localStorage
          const mockUserData = localStorage.getItem('mockUser');
          if (mockUserData) {
            setUsuario(JSON.parse(mockUserData));
          } else {
            removeToken();
          }
        } else {
          try {
            const response = await apiClient.get<{ success: boolean; data: Usuario }>('/auth/me');
            setUsuario(response.data);
          } catch (error) {
            removeToken();
            setUsuario(null);
          }
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      if (USE_MOCK_DATA) {
        // Modo mock: buscar usuario en datos mock
        const user = mockUsuarios.find(
          (u) => u.email === credentials.email && credentials.password === 'admin123'
        );

        if (!user) {
          toast.error('Credenciales inválidas');
          throw new Error('Credenciales inválidas');
        }

        // Guardar token y usuario mock
        saveToken('mock-token-' + user._id);
        localStorage.setItem('mockUser', JSON.stringify(user));
        setUsuario(user);
        toast.success(`Bienvenido ${user.nombre}! (Modo Demo)`);
      } else {
        const response = await apiClient.post<{
          success: boolean;
          data: { token: string; usuario: Usuario };
        }>('/auth/login', credentials);

        saveToken(response.data.token);
        setUsuario(response.data.usuario);
        toast.success('Sesión iniciada correctamente');
      }
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Error al iniciar sesión';
      toast.error(message);
      throw error;
    }
  };

  const logout = () => {
    removeToken();
    localStorage.removeItem('mockUser');
    setUsuario(null);
    toast.info('Sesión cerrada');
    window.location.href = '/login';
  };

  const value: AuthContextType = {
    usuario,
    isAuthenticated: !!usuario,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
