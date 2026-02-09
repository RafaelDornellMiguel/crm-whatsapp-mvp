/**
 * AdminGuard - Componente que protege rotas
 * Apenas Gerentes e Donos (role === 'admin') podem acessar
 */

import { useAuth } from '@/_core/hooks/useAuth';
import { useLocation } from 'wouter';
import { useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

interface AdminGuardProps {
  children: React.ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Se ainda está carregando, não faz nada
    if (loading) return;

    // Se não está autenticado, redireciona para login
    if (!user) {
      setLocation('/');
      return;
    }

    // Se não é admin, redireciona para home
    if (user.role !== 'admin') {
      setLocation('/');
      return;
    }
  }, [user, loading, setLocation]);

  // Enquanto carrega, mostra loading
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // Se não é admin, mostra mensagem de acesso negado
  if (!user || user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-full bg-background p-4">
        <Card className="w-full max-w-md">
          <div className="p-6 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Acesso Negado</h1>
            <p className="text-muted-foreground mb-6">
              Apenas Gerentes e Donos podem acessar esta página.
            </p>
            <button
              onClick={() => setLocation('/')}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              Voltar ao Início
            </button>
          </div>
        </Card>
      </div>
    );
  }

  // Se é admin, renderiza o conteúdo
  return <>{children}</>;
}
