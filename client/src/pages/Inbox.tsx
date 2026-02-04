/**
 * Inbox - Lista de conversas estilo Whaticket
 * Design Philosophy: Minimalismo Corporativo
 * Inspirado no Whaticket com tabs e filtros avançados
 */

import { useState } from 'react';
import { useLocation } from 'wouter';
import { useCRMStore } from '@/store';
import { StatusBadge } from '@/components/StatusBadge';
import { TagBadge } from '@/components/TagBadge';
import { Search, MessageCircle, CheckCircle2, Filter, Users, Lock } from 'lucide-react';
import type { TicketStatus } from '@/types';

type TabType = 'abertos' | 'resolvidos' | 'busca';

export default function Inbox() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<TabType>('abertos');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'todos' | 'meus' | 'espera'>('todos');
  
  const { contacts, leads, messages, setSelectedLeadId, currentVendedorId, updateLead } = useCRMStore();

  // Função para contar mensagens não lidas
  const getUnreadCount = (leadId: string) => {
    const leadMessages = messages.filter((m) => m.leadId === leadId && m.sender === 'contact' && !m.read);
    return leadMessages.length;
  };

  // Criar lista de conversas com informações combinadas
  const allConversations = contacts.map((contact) => {
    const lead = leads.find((l) => l.contactId === contact.id);
    const leadMessages = messages.filter((m) => m.leadId === lead?.id);
    const lastMessage = leadMessages.length > 0 
      ? leadMessages.sort((a, b) => {
          const timeA = a.timestamp instanceof Date ? a.timestamp.getTime() : new Date(a.timestamp as any).getTime();
          const timeB = b.timestamp instanceof Date ? b.timestamp.getTime() : new Date(b.timestamp as any).getTime();
          return timeB - timeA;
        })[0]
      : null;

    const unreadCount = lead ? getUnreadCount(lead.id) : 0;

    return {
      contact,
      lead,
      lastMessage,
      unreadCount,
    };
  });

  // Filtrar por tab
  const filteredByTab = allConversations.filter((conv) => {
    if (!conv.lead) return false;
    
    const ticketStatus = conv.lead.ticketStatus || 'aberto';
    
    if (activeTab === 'abertos') {
      return ticketStatus === 'aberto';
    } else if (activeTab === 'resolvidos') {
      return ticketStatus === 'resolvido';
    } else {
      // busca
      return true;
    }
  });

  // Filtrar por tipo
  const filteredByType = filteredByTab.filter((conv) => {
    if (filterType === 'meus') {
      return conv.lead?.vendedorId === currentVendedorId;
    } else if (filterType === 'espera') {
      return conv.unreadCount > 0;
    }
    return true;
  });

  // Filtrar por busca
  const conversations = filteredByType.filter((conv) => {
    if (!searchTerm) return true;
    return (
      conv.contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.contact.phone.includes(searchTerm)
    );
  });

  const handleSelectConversation = (leadId: string | undefined) => {
    if (leadId) {
      setSelectedLeadId(leadId);
      setLocation('/chat');
    }
  };

  const handleResolveTicket = (leadId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const lead = leads.find((l) => l.id === leadId);
    if (lead) {
      updateLead(leadId, { ticketStatus: lead.ticketStatus === 'resolvido' ? 'aberto' : 'resolvido' });
    }
  };

  // Contadores
  const abertosCount = allConversations.filter((c) => (c.lead?.ticketStatus || 'aberto') === 'aberto').length;
  const resolvidosCount = allConversations.filter((c) => c.lead?.ticketStatus === 'resolvido').length;
  const esperaCount = allConversations.filter((c) => c.unreadCount > 0).length;

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header com Tabs */}
      <div className="border-b border-border">
        <div className="p-4 md:p-6">
          <h1 className="text-2xl font-bold text-foreground mb-4">Conversas</h1>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 px-4 md:px-6">
          <button
            onClick={() => setActiveTab('abertos')}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
              activeTab === 'abertos'
                ? 'border-primary text-primary font-semibold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            <span>ABERTOS</span>
            {abertosCount > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-primary text-primary-foreground rounded-full text-xs font-bold">
                {abertosCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('resolvidos')}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
              activeTab === 'resolvidos'
                ? 'border-primary text-primary font-semibold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>RESOLVIDOS</span>
            {resolvidosCount > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-green-600 text-white rounded-full text-xs font-bold">
                {resolvidosCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('busca')}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
              activeTab === 'busca'
                ? 'border-primary text-primary font-semibold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>BUSCA</span>
          </button>
        </div>

        {/* Search e Filtros */}
        <div className="p-4 md:px-6 md:py-3 space-y-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Nome, número ou email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
            </div>
            <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
              <Filter className="w-5 h-5 text-muted-foreground" />
            </button>
            <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
              <Users className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Filtros Rápidos */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterType('todos')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filterType === 'todos'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-foreground hover:bg-secondary/80'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterType('meus')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filterType === 'meus'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-foreground hover:bg-secondary/80'
              }`}
            >
              Meus chats
            </button>
            <button
              onClick={() => setFilterType('espera')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filterType === 'espera'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-foreground hover:bg-secondary/80'
              }`}
            >
              Em espera
              {esperaCount > 0 && (
                <span className="px-1.5 py-0.5 bg-red-600 text-white rounded-full text-xs font-bold">
                  {esperaCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <MessageCircle className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-foreground font-semibold mb-1">Nada aqui!</p>
            <p className="text-sm text-muted-foreground">
              {searchTerm ? 'Nenhum chat encontrado com esses filtros ou termo pesquisado' : 'Nenhuma conversa ainda'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {conversations.map((conv) => (
              <button
                key={conv.contact.id}
                onClick={() => handleSelectConversation(conv.lead?.id)}
                className="w-full p-4 hover:bg-secondary/50 transition-colors text-left relative"
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-primary">
                      {conv.contact.name.charAt(0).toUpperCase()}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-foreground truncate">
                        {conv.contact.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        {conv.lead && (
                          <StatusBadge status={conv.lead.status} size="sm" />
                        )}
                        {conv.lead && conv.lead.id && (
                          <button
                            onClick={(e) => handleResolveTicket(conv.lead!.id, e)}
                            className="p-1 hover:bg-secondary rounded transition-colors"
                            title={conv.lead.ticketStatus === 'resolvido' ? 'Reabrir' : 'Resolver'}
                          >
                            {conv.lead.ticketStatus === 'resolvido' ? (
                              <CheckCircle2 className="w-4 h-4 text-green-600" />
                            ) : (
                              <Lock className="w-4 h-4 text-muted-foreground" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {conv.contact.phone}
                    </p>
                    
                    {/* Tags */}
                    {conv.lead?.tags && conv.lead.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {conv.lead.tags.map((tag) => (
                          <TagBadge key={tag} tag={tag} size="sm" />
                        ))}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground truncate flex-1">
                        {conv.lastMessage
                          ? conv.lastMessage.content
                          : 'Nenhuma mensagem'}
                      </p>
                      {conv.unreadCount > 0 && (
                        <span className="ml-2 px-2 py-0.5 bg-green-600 text-white rounded-full text-xs font-bold">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                    {conv.lastMessage && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(conv.lastMessage.timestamp).toLocaleDateString('pt-BR')} às{' '}
                        {new Date(conv.lastMessage.timestamp).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
