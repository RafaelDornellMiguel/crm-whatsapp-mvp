/**
 * Inbox - Lista de conversas estilo WhatsApp
 * Design Philosophy: Minimalismo Corporativo
 * - Layout familiar ao WhatsApp
 * - Status visual claro
 * - Clique abre o chat
 */

import { useState } from 'react';
import { useLocation } from 'wouter';
import { useCRMStore } from '@/store';
import { StatusBadge } from '@/components/StatusBadge';
import { Search, MessageCircle } from 'lucide-react';

export default function Inbox() {
  const [location, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  
  const { contacts, leads, messages, setSelectedLeadId } = useCRMStore();

  // Criar lista de conversas com informações combinadas
  const conversations = contacts.map((contact) => {
    const lead = leads.find((l) => l.contactId === contact.id);
    const lastMessage = messages
      .filter((m) => m.leadId === lead?.id)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];

    return {
      contact,
      lead,
      lastMessage,
    };
  }).filter((conv) => {
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

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-border">
        <h1 className="text-2xl font-bold text-foreground mb-4">Inbox</h1>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por nome ou telefone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <MessageCircle className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {searchTerm ? 'Nenhuma conversa encontrada' : 'Nenhuma conversa ainda'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {conversations.map((conv) => (
              <button
                key={conv.contact.id}
                onClick={() => handleSelectConversation(conv.lead?.id)}
                className="w-full p-4 hover:bg-secondary transition-colors text-left"
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
                      {conv.lead && (
                        <StatusBadge status={conv.lead.status} size="sm" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {conv.contact.phone}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {conv.lastMessage
                        ? conv.lastMessage.content
                        : 'Nenhuma mensagem'}
                    </p>
                    {conv.lastMessage && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(conv.lastMessage.timestamp).toLocaleDateString('pt-BR')}
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
