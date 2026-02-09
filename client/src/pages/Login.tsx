/**
 * Login Page - Autenticação com Google OAuth
 * Design inspirado em Clinicorp
 * - Layout moderno com gradiente
 * - Login via Google
 * - Redirecionamento automático após autenticação
 */

import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { getLoginUrl } from '@/const';
import { useAuth } from '@/_core/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MessageCircle, Loader } from 'lucide-react';

export default function Login() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Se já está autenticado, redireciona para home
  useEffect(() => {
    if (user && !loading) {
      setIsRedirecting(true);
      setTimeout(() => {
        setLocation('/');
      }, 500);
    }
  }, [user, loading, setLocation]);

  const handleGoogleLogin = () => {
    window.location.href = getLoginUrl();
  };

  if (loading || isRedirecting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left side - Branding */}
        <div className="flex flex-col items-start justify-center space-y-8">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <MessageCircle className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">GRUPO</h1>
              <p className="text-sm text-muted-foreground">EVOLUTION</p>
            </div>
          </div>

          {/* Welcome message */}
          <div className="space-y-3">
            <h2 className="text-4xl lg:text-5xl font-bold text-foreground leading-tight">
              Bem-vindo ao CRM WhatsApp
            </h2>
            <p className="text-lg text-muted-foreground">
              Gerencie suas conversas, leads e vendas em um único lugar
            </p>
          </div>

          {/* Features */}
          <div className="space-y-4 pt-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-xs font-bold text-primary">✓</span>
              </div>
              <div>
                <p className="font-medium text-foreground">Sincronização em Tempo Real</p>
                <p className="text-sm text-muted-foreground">Receba notificações instantâneas de novas mensagens</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-xs font-bold text-primary">✓</span>
              </div>
              <div>
                <p className="font-medium text-foreground">Gerenciamento de Leads</p>
                <p className="text-sm text-muted-foreground">Acompanhe e converta seus leads em clientes</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-xs font-bold text-primary">✓</span>
              </div>
              <div>
                <p className="font-medium text-foreground">Controle de Acesso</p>
                <p className="text-sm text-muted-foreground">Configure permissões por departamento</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Login Card */}
        <div className="flex items-center justify-center">
          <Card className="w-full max-w-sm shadow-2xl border-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur">
            <div className="p-8 space-y-6">
              {/* Card Header */}
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-bold text-foreground">Fazer Login</h3>
                <p className="text-sm text-muted-foreground">
                  Use sua conta Google para continuar
                </p>
              </div>

              {/* Google Login Button */}
              <Button
                onClick={handleGoogleLogin}
                className="w-full h-12 bg-white hover:bg-slate-50 text-foreground border border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:border-slate-700 shadow-sm transition-all duration-200"
              >
                <svg
                  className="w-5 h-5 mr-3"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continuar com Google
              </Button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-slate-900 text-muted-foreground">ou</span>
                </div>
              </div>

              {/* Info Text */}
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Ao fazer login, você concorda com nossos{' '}
                  <a href="#" className="text-primary hover:underline font-medium">
                    Termos de Serviço
                  </a>
                </p>
              </div>

              {/* Status Message */}
              <div className="text-center">
                <p className="text-xs text-muted-foreground">
                  Seu acesso será determinado automaticamente com base no seu email
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
