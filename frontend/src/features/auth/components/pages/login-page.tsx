import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../context/auth-context';
import { Input } from '@/shared/components/ui/input/input';
import { Button } from '@/shared/components/ui/button/button';
import { Card, CardHeader, CardContent, CardFooter } from '@/shared/components/ui/card/card';
import { Alert } from '@/shared/components/feedback/alert/alert';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, usuario } = useAuthContext();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Si ya está autenticado, redirigir
  if (isAuthenticated && usuario) {
    const redirectPath = usuario.rol === 'ADMIN' ? '/admin/dashboard' : '/delegado/dashboard';
    navigate(redirectPath, { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login({ email, password });
      // La redirección se maneja arriba con el useEffect
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Credenciales inválidas');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <span className="text-6xl">⚽</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Torneo Vallejo</h1>
          <p className="text-gray-600 mt-2">Inicia sesión en tu cuenta</p>
        </CardHeader>

        <CardContent>
          {error && (
            <Alert variant="danger" className="mb-4">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Correo Electrónico"
              type="email"
              placeholder="correo@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />

            <Input
              label="Contraseña"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </form>

          {/* Demo Credentials Info */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs font-medium text-blue-900 mb-2">🔧 Credenciales de prueba:</p>
            <div className="space-y-1 text-xs text-blue-800">
              <p><strong>Admin:</strong> admin@torneo.com / admin123</p>
              <p><strong>Delegado:</strong> delegado@torneo.com / delegado123</p>
            </div>
          </div>
        </CardContent>

        <CardFooter className="text-center text-sm text-gray-600">
          <a href="/" className="text-blue-600 hover:text-blue-700">
            ← Volver al inicio
          </a>
        </CardFooter>
      </Card>
    </div>
  );
};
