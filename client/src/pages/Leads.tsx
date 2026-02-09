/**
 * Leads - Gerenciamento de Leads com Dados Reais
 * UI Moderna, Responsiva e Funcional
 */

import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Users, TrendingUp, Search, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

type StatusFilter = 'novo' | 'em_atendimento' | 'convertido' | 'perdido' | 'todos';

export default function Leads() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Queries
  const leadsQuery = trpc.chat.getLeads.useQuery(
    statusFilter === 'todos' ? {} : { status: statusFilter as any }
  );
  const statsQuery = trpc.chat.getLeadStats.useQuery();
  const searchQuery_trpc = trpc.chat.searchLeads.useQuery(
    { nome: searchQuery },
    { enabled: !!searchQuery && searchQuery.length > 0 }
  );
  const updateStatusMutation = trpc.chat.updateLeadStatus.useMutation();

  const leads = searchQuery && searchQuery.length > 0 ? searchQuery_trpc.data?.leads || [] : leadsQuery.data?.leads || [];
  const stats = statsQuery.data;
  const isLoading = leadsQuery.isLoading || statsQuery.isLoading || (searchQuery && searchQuery.length > 0 && searchQuery_trpc.isLoading);

  const handleUpdateStatus = async (leadId: number, newStatus: string) => {
    try {
      await updateStatusMutation.mutateAsync({
        contatoId: leadId,
        status: newStatus as any,
      });
      await leadsQuery.refetch();
      toast.success('Status atualizado!');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'novo':
        return 'bg-blue-100 text-blue-800';
      case 'em_atendimento':
        return 'bg-yellow-100 text-yellow-800';
      case 'convertido':
        return 'bg-green-100 text-green-800';
      case 'perdido':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      novo: 'Novo',
      em_atendimento: 'Em Atendimento',
      convertido: 'Convertido',
      perdido: 'Perdido',
    };
    return labels[status] || status;
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="p-6 border-b border-border bg-card">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">Leads</h1>
          <p className="text-muted-foreground">Gerencie e acompanhe seus leads em tempo real</p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <Card className="p-4">
              <p className="text-sm text-muted-foreground mb-1">Total</p>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            </Card>
            <Card className="p-4 border-blue-200">
              <p className="text-sm text-blue-600 mb-1">Novo</p>
              <p className="text-2xl font-bold text-blue-700">{stats.novo}</p>
            </Card>
            <Card className="p-4 border-yellow-200">
              <p className="text-sm text-yellow-600 mb-1">Em Atendimento</p>
              <p className="text-2xl font-bold text-yellow-700">{stats.em_atendimento}</p>
            </Card>
            <Card className="p-4 border-green-200">
              <p className="text-sm text-green-600 mb-1">Convertido</p>
              <p className="text-2xl font-bold text-green-700">{stats.convertido}</p>
            </Card>
            <Card className="p-4 border-red-200">
              <p className="text-sm text-red-600 mb-1">Taxa Conversão</p>
              <p className="text-2xl font-bold text-red-700">{stats.taxa_conversao}%</p>
            </Card>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3 items-center">
          <div className="flex-1 relative w-full">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por nome..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
            {(['todos', 'novo', 'em_atendimento', 'convertido', 'perdido'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status as StatusFilter)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  statusFilter === status
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {status === 'todos' ? 'Todos' : getStatusLabel(status)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Leads List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : leads.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <Users className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
            <p className="text-muted-foreground text-lg">Nenhum lead encontrado</p>
            <p className="text-muted-foreground text-sm mt-2">Comece adicionando novos leads</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {leads.map((lead: any) => (
              <Card
                key={lead.id}
                onClick={() => {
                  setSelectedLead(lead);
                  setShowModal(true);
                }}
                className="rounded-none border-0 border-b border-border cursor-pointer hover:bg-muted/50 transition-colors p-4 md:p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Avatar and Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-lg font-semibold text-primary">
                          {lead.nome.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate text-lg">{lead.nome}</h3>
                        <p className="text-sm text-muted-foreground">{lead.telefone}</p>
                        {lead.email && (
                          <p className="text-sm text-muted-foreground truncate">{lead.email}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status and Actions */}
                  <div className="flex flex-col items-end gap-3 flex-shrink-0">
                    <Badge className={`${getStatusColor(lead.status)} border-0`}>
                      {getStatusLabel(lead.status)}
                    </Badge>

                    {/* Status Change Buttons */}
                    <div className="flex gap-1">
                      {lead.status !== 'convertido' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateStatus(lead.id, 'convertido');
                          }}
                          className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                        >
                          Converter
                        </button>
                      )}
                      {lead.status !== 'perdido' && lead.status !== 'convertido' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateStatus(lead.id, 'perdido');
                          }}
                          className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                        >
                          Perder
                        </button>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground">
                      {new Date(lead.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Detalhes */}
      {showModal && selectedLead && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-xl font-bold text-foreground">{selectedLead.nome}</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Telefone</p>
                  <p className="text-foreground font-medium">{selectedLead.telefone}</p>
                </div>
                {selectedLead.email && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Email</p>
                    <p className="text-foreground font-medium">{selectedLead.email}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Status</p>
                  <Badge className={`${getStatusColor(selectedLead.status)} border-0`}>
                    {getStatusLabel(selectedLead.status)}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Criado em</p>
                  <p className="text-foreground font-medium">
                    {new Date(selectedLead.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>

              {/* Status Change Buttons */}
              <div className="space-y-2">
                {(['novo', 'em_atendimento', 'convertido', 'perdido'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      handleUpdateStatus(selectedLead.id, status);
                      setShowModal(false);
                    }}
                    className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedLead.status === status
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {getStatusLabel(status)}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="w-full mt-4 px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors"
              >
                Fechar
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
