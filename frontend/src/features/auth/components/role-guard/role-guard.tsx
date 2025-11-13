import { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthContext } from '../../context/auth-context';
import type { Rol } from '@/types/enums';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: Rol[];
}

export const RoleGuard = ({ children, allowedRoles }: RoleGuardProps) => {
  const { usuario } = useAuthContext();

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(usuario.rol)) {
    // Redirigir al dashboard correspondiente según el rol
    const redirectPath = usuario.rol === 'ADMIN' ? '/admin/dashboard' : '/delegado/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};
