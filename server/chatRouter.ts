/**
 * Chat Router - Procedures tRPC para Chat, Inbox e Leads
 * Integração com banco PostgreSQL real
 */

import { z } from 'zod';
import { publicProcedure, router } from './_core/trpc';
import {
  getInboxByTenantId,
  getConversaWithMessages,
  getLeadsByTenantId,
  updateContatoStatus,
  createMensagem,
  markMensagensAsRead,
  searchContatosByName,
  getContatosUnreadCount,
} from './db';

export const chatRouter = router({
  // ============================================
  // INBOX
  // ============================================

  /**
   * Listar conversas do inbox (últimas conversas ativas)
   */
  getInbox: publicProcedure
    .input(z.object({
      limit: z.number().default(50),
    }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new Error('Usuário não autenticado');
      }

      try {
        const conversas = await getInboxByTenantId(ctx.user.tenantId, input.limit);
        
        // Contar mensagens não lidas
        const unreadCount = await getContatosUnreadCount(ctx.user.tenantId);

        return {
          conversas,
          unreadCount,
          total: conversas.length,
        };
      } catch (error: any) {
        console.error('[Chat] Erro ao listar inbox:', error);
        throw new Error(`Erro ao listar conversas: ${error.message}`);
      }
    }),

  /**
   * Obter conversa com histórico de mensagens
   */
  getConversa: publicProcedure
    .input(z.object({
      contatoId: z.number(),
    }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new Error('Usuário não autenticado');
      }

      try {
        const conversa = await getConversaWithMessages(input.contatoId);

        // Marcar mensagens como lidas
        await markMensagensAsRead(input.contatoId);

        return {
          contato: conversa.contato,
          mensagens: conversa.mensagens,
          total: conversa.mensagens.length,
        };
      } catch (error: any) {
        console.error('[Chat] Erro ao obter conversa:', error);
        throw new Error(`Erro ao obter conversa: ${error.message}`);
      }
    }),

  /**
   * Enviar mensagem
   */
  sendMensagem: publicProcedure
    .input(z.object({
      contatoId: z.number(),
      conteudo: z.string().min(1),
      tipo: z.enum(['texto', 'imagem', 'audio', 'arquivo', 'sistema']).default('texto'),
      arquivoUrl: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new Error('Usuário não autenticado');
      }

      try {
        const mensagem = await createMensagem({
          tenantId: ctx.user.tenantId,
          contatoId: input.contatoId,
          vendedorId: ctx.user.id,
          remetente: 'usuario',
          conteudo: input.conteudo,
          tipo: input.tipo,
          arquivoUrl: input.arquivoUrl,
          lida: true,
        });

        return {
          success: true,
          mensagem,
        };
      } catch (error: any) {
        console.error('[Chat] Erro ao enviar mensagem:', error);
        throw new Error(`Erro ao enviar mensagem: ${error.message}`);
      }
    }),

  // ============================================
  // LEADS
  // ============================================

  /**
   * Listar leads com filtro opcional de status
   */
  getLeads: publicProcedure
    .input(z.object({
      status: z.enum(['novo', 'em_atendimento', 'convertido', 'perdido']).optional(),
    }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new Error('Usuário não autenticado');
      }

      try {
        const leads = await getLeadsByTenantId(ctx.user.tenantId, input.status);

        // Agrupar por status
        const grouped = {
          novo: leads.filter(l => l.status === 'novo'),
          em_atendimento: leads.filter(l => l.status === 'em_atendimento'),
          convertido: leads.filter(l => l.status === 'convertido'),
          perdido: leads.filter(l => l.status === 'perdido'),
        };

        return {
          leads,
          grouped,
          total: leads.length,
          stats: {
            novo: grouped.novo.length,
            em_atendimento: grouped.em_atendimento.length,
            convertido: grouped.convertido.length,
            perdido: grouped.perdido.length,
          },
        };
      } catch (error: any) {
        console.error('[Chat] Erro ao listar leads:', error);
        throw new Error(`Erro ao listar leads: ${error.message}`);
      }
    }),

  /**
   * Atualizar status de um lead
   */
  updateLeadStatus: publicProcedure
    .input(z.object({
      contatoId: z.number(),
      status: z.enum(['novo', 'em_atendimento', 'convertido', 'perdido']),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new Error('Usuário não autenticado');
      }

      try {
        await updateContatoStatus(input.contatoId, input.status);

        return {
          success: true,
          message: `Lead atualizado para ${input.status}`,
        };
      } catch (error: any) {
        console.error('[Chat] Erro ao atualizar lead:', error);
        throw new Error(`Erro ao atualizar lead: ${error.message}`);
      }
    }),

  /**
   * Buscar leads por nome
   */
  searchLeads: publicProcedure
    .input(z.object({
      nome: z.string().min(1),
    }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new Error('Usuário não autenticado');
      }

      try {
        const leads = await searchContatosByName(ctx.user.tenantId, input.nome);

        return {
          leads,
          total: leads.length,
        };
      } catch (error: any) {
        console.error('[Chat] Erro ao buscar leads:', error);
        throw new Error(`Erro ao buscar leads: ${error.message}`);
      }
    }),

  /**
   * Obter estatísticas de leads
   */
  getLeadStats: publicProcedure
    .query(async ({ ctx }) => {
      if (!ctx.user) {
        throw new Error('Usuário não autenticado');
      }

      try {
        const leads = await getLeadsByTenantId(ctx.user.tenantId);

        const stats = {
          total: leads.length,
          novo: leads.filter(l => l.status === 'novo').length,
          em_atendimento: leads.filter(l => l.status === 'em_atendimento').length,
          convertido: leads.filter(l => l.status === 'convertido').length,
          perdido: leads.filter(l => l.status === 'perdido').length,
          taxa_conversao: leads.length > 0 
            ? ((leads.filter(l => l.status === 'convertido').length / leads.length) * 100).toFixed(2)
            : '0.00',
        };

        return stats;
      } catch (error: any) {
        console.error('[Chat] Erro ao obter estatísticas:', error);
        throw new Error(`Erro ao obter estatísticas: ${error.message}`);
      }
    }),
});
