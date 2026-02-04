/**
 * Leads - Funil de vendas com etiquetas personalizadas
 * Design Philosophy: Minimalismo Corporativo
 */

import { useCRMStore } from '@/store';
import { TagBadge, TagSelector } from '@/components/TagBadge';
import { Gift, MessageCircle, Tag } from 'lucide-react';
import { useLocation } from 'wouter';
import type { LeadStatus, LeadTag } from '@/types';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const statuses: LeadStatus[] = ['novo', 'atendimento', 'convertido', 'perdido'];

export default function Leads() {
  const [, setLocation] = useLocation();
  const { leads, contacts, updateLeadStatus, updateLeadTags, setSelectedLeadId } = useCRMStore();
  const [editingLeadId, setEditingLeadId] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<LeadTag[]>([]);

  const getLeadsByStatus = (status: LeadStatus) => {
    return leads.filter((l) => l.status === status);
  };

  const handleSelectLead = (leadId: string) => {
    setSelectedLeadId(leadId);
    setLocation('/chat');
  };

  const handleStatusChange = (leadId: string, newStatus: LeadStatus) => {
    updateLeadStatus(leadId, newStatus);
  };

  const openTagEditor = (leadId: string, currentTags: LeadTag[] = []) => {
    setEditingLeadId(leadId);
    setSelectedTags(currentTags);
  };

  const saveTagChanges = () => {
    if (editingLeadId) {
      updateLeadTags(editingLeadId, selectedTags);
      setEditingLeadId(null);
      setSelectedTags([]);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-border">
        <h1 className="text-2xl font-bold text-foreground">Leads & Funil de Vendas</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Acompanhe a conversão de leads através do funil
        </p>
      </div>

      {/* Kanban View */}
      <div className="flex-1 overflow-x-auto p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 min-w-max md:min-w-full">
          {statuses.map((status) => {
            const statusLeads = getLeadsByStatus(status);
            const statusLabels = {
              novo: 'Novo',
              atendimento: 'Em Atendimento',
              convertido: 'Convertido',
              perdido: 'Perdido',
            };

            return (
              <div key={status} className="flex flex-col bg-secondary rounded-lg p-4 min-h-[600px] max-w-sm">
                {/* Column Header */}
                <div className="mb-4">
                  <h2 className="font-bold text-foreground">{statusLabels[status]}</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {statusLeads.length} lead{statusLeads.length !== 1 ? 's' : ''}
                  </p>
                </div>

                {/* Cards */}
                <div className="space-y-3 flex-1">
                  {statusLeads.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p className="text-sm">Nenhum lead</p>
                    </div>
                  ) : (
                    statusLeads.map((lead) => {
                      const contact = contacts.find((c) => c.id === lead.contactId);
                      if (!contact) return null;

                      return (
                        <div
                          key={lead.id}
                          className="bg-card rounded-lg p-4 border border-border hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => handleSelectLead(lead.id)}
                        >
                          {/* Header */}
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="font-semibold text-foreground text-sm">
                                {contact.name}
                              </h3>
                              <p className="text-xs text-muted-foreground mt-1">
                                {contact.phone}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {lead.origin === 'indicacao' && (
                                <div className="relative group">
                                  <Gift className="w-4 h-4 text-yellow-600" />
                                  <span className="absolute bottom-full left-0 bg-foreground text-background text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">Indicação</span>
                                </div>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openTagEditor(lead.id, lead.tags);
                                }}
                                className="p-1 hover:bg-secondary rounded"
                              >
                                <Tag className="w-4 h-4 text-muted-foreground" />
                              </button>
                            </div>
                          </div>

                          {/* Tags */}
                          {lead.tags && lead.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {lead.tags.map((tag) => (
                                <TagBadge key={tag} tag={tag} size="sm" />
                              ))}
                            </div>
                          )}

                          {/* Status Selector */}
                          <div className="mb-3">
                            <label className="text-xs text-muted-foreground block mb-1">
                              Alterar Status
                            </label>
                            <select
                              value={lead.status}
                              onChange={(e) =>
                                handleStatusChange(lead.id, e.target.value as LeadStatus)
                              }
                              onClick={(e) => e.stopPropagation()}
                              className="w-full text-xs bg-background border border-border rounded px-2 py-1 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                              {statuses.map((s) => (
                                <option key={s} value={s}>
                                  {s.charAt(0).toUpperCase() + s.slice(1)}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Origin */}
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <MessageCircle className="w-3 h-3" />
                            <span>
                              {lead.origin === 'whatsapp' ? 'WhatsApp' : 'Indicação'}
                            </span>
                          </div>

                          {/* Created Date */}
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(lead.createdAt).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tag Editor Dialog */}
      <Dialog open={!!editingLeadId} onOpenChange={() => setEditingLeadId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Etiquetas</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <TagSelector selectedTags={selectedTags} onChange={setSelectedTags} />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEditingLeadId(null)}>
              Cancelar
            </Button>
            <Button onClick={saveTagChanges}>Salvar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
