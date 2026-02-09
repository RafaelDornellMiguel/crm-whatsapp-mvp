/**
 * Manager Dashboard - Acesso restrito para ADM
 * Gerenciamento de departamentos e métricas
 */

import { useState } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, BarChart3, Users } from 'lucide-react';
import DepartmentsManager from './DepartmentsManager';

type Tab = 'overview' | 'departments' | 'metrics';

export default function ManagerDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  // Verificar se é ADM
  if (user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="w-full max-w-md">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-2">Acesso Restrito</p>
            <p className="text-sm text-muted-foreground">
              Apenas ADM podem acessar o painel de gerenciamento
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border p-6">
        <h1 className="text-3xl font-bold text-foreground">Painel de Gerenciamento</h1>
        <p className="text-muted-foreground mt-1">Administre departamentos, usuários e métricas do sistema</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-border px-6 pt-4">
        <div className="flex gap-2">
          <Button
            variant={activeTab === 'overview' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('overview')}
            className="gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            Visão Geral
          </Button>
          <Button
            variant={activeTab === 'departments' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('departments')}
            className="gap-2"
          >
            <Users className="w-4 h-4" />
            Departamentos
          </Button>
          <Button
            variant={activeTab === 'metrics' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('metrics')}
            className="gap-2"
          >
            <Settings className="w-4 h-4" />
            Configurações
          </Button>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'overview' && (
        <div className="p-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Bem-vindo ao Painel de Gerenciamento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Você está logado como <strong>{user?.name}</strong> ({user?.email})
              </p>
              <p className="text-muted-foreground">
                Use as abas acima para gerenciar departamentos, usuários e configurações do sistema.
              </p>
              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Funcionalidades Disponíveis:</h3>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>✓ Criar, editar e deletar departamentos</li>
                  <li>✓ Atrelar conexões WhatsApp a departamentos</li>
                  <li>✓ Gerenciar usuários e permissões</li>
                  <li>✓ Visualizar métricas e performance</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'departments' && <DepartmentsManager />}

      {activeTab === 'metrics' && (
        <div className="p-6">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Configurações em desenvolvimento</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
