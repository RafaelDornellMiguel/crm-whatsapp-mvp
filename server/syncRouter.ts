/**
 * Sync Router - tRPC procedures para sincronização com Evolution API
 * Sincroniza contatos, mensagens e status em tempo real
 */

import { z } from 'zod';
import { router, protectedProcedure, adminProcedure } from './_core/trpc';
import { TRPCError } from '@trpc/server';
import { getEvolutionApi } from './evolutionApi';
import { getContatoByTelefone, createContato, getDb } from './db';
import { contatos, mensagens, numerosWhatsapp } from '../drizzle/schema';
import { eq, and } from 'drizzle-orm';

export const syncRouter = router({
  /**
   * Sincronizar contatos da Evolution API com banco de dados
   * Busca todos os contatos de uma instância e salva/atualiza no banco
   */
  syncContatos: protectedProcedure
    .input(
      z.object({
        instanceName: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user.tenantId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Usuário não possui empresa associada',
        });
      }

      try {
        const evolutionApi = getEvolutionApi();
        const db = await getDb();

        if (!db) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Banco de dados não disponível',
          });
        }

        // Buscar contatos da Evolution API
        const contatosEvolution = await evolutionApi.fetchContacts(input.instanceName);

        if (!contatosEvolution || contatosEvolution.length === 0) {
          return {
            success: true,
            sincronizados: 0,
            atualizados: 0,
            erros: [],
          };
        }

        let sincronizados = 0;
        let atualizados = 0;
        const erros: string[] = [];

        // Sincronizar cada contato
        for (const contatoEvo of contatosEvolution) {
          try {
            const telefone = contatoEvo.jid?.replace('@s.whatsapp.net', '') || contatoEvo.number;

            // Verificar se contato já existe
            const contatoExistente = await db
              .select()
              .from(contatos)
              .where(eq(contatos.telefone, telefone))
              .limit(1);

            if (contatoExistente.length > 0) {
              // Atualizar contato existente
              await db
                .update(contatos)
                .set({
                  nome: contatoEvo.name || contatoExistente[0].nome,
                  avatar: contatoEvo.profilePicUrl || contatoExistente[0].avatar,
                  updatedAt: new Date(),
                })
                .where(eq(contatos.id, contatoExistente[0].id));

              atualizados++;
            } else {
              // Criar novo contato
              await db.insert(contatos).values({
                tenantId: ctx.user.tenantId,
                nome: contatoEvo.name || telefone,
                telefone,
                avatar: contatoEvo.profilePicUrl,
                status: 'novo',
                ticketStatus: 'aberto',
                vendedorId: ctx.user.id,
              });

              sincronizados++;
            }
          } catch (error: any) {
            erros.push(`Erro ao sincronizar contato ${contatoEvo.name}: ${error.message}`);
          }
        }

        return {
          success: true,
          sincronizados,
          atualizados,
          erros,
        };
      } catch (error: any) {
        console.error('Erro ao sincronizar contatos:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Erro ao sincronizar contatos',
        });
      }
    }),

  /**
   * Sincronizar status de uma instância
   */
  syncStatus: protectedProcedure
    .input(
      z.object({
        instanceName: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      if (!ctx.user.tenantId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Usuário não possui empresa associada',
        });
      }

      try {
        const evolutionApi = getEvolutionApi();
        const status = await evolutionApi.getConnectionState(input.instanceName);

        return {
          instanceName: input.instanceName,
          status: status.state || 'desconectado',
          conectado: status.state === 'open',
        };
      } catch (error: any) {
        console.error('Erro ao sincronizar status:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Erro ao sincronizar status',
        });
      }
    }),

  /**
   * Sincronizar status de uma instância (alternativo)
   */
  getInstanceStatus: protectedProcedure
    .input(
      z.object({
        instanceName: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      if (!ctx.user.tenantId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Usuário não possui empresa associada',
        });
      }

      try {
        const evolutionApi = getEvolutionApi();
        const info = await evolutionApi.getInstanceInfo(input.instanceName);

        return {
          instanceName: input.instanceName,
          status: info.instance?.status || 'desconectado',
          conectado: info.instance?.status === 'open',
        };
      } catch (error: any) {
        console.error('Erro ao obter status:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message || 'Erro ao obter status',
        });
      }
    }),

  /**
   * Configurar webhook para uma instância
   */
  setupWebhook: adminProcedure
    .input(
      z.object({
        instanceName: z.string(),
        webhookUrl: z.string().url(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const evolutionApi = getEvolutionApi();

        // Configurar webhook na Evolution API
        await evolutionApi.setWebhook(input.instanceName, input.webhookUrl, [
          'messages.upsert',
          'messages.update',
          'connection.update',
          'presence.update',
        ]);

        console.log(`[Webhook] Configurado para ${input.instanceName}: ${input.webhookUrl}`);

        return {
          success: true,
          message: 'Webhook configurado com sucesso',
        };
      } catch (error: any) {
        console.error('[Webhook] Erro ao configurar:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Erro ao configurar webhook: ${error.message}`,
        });
      }
    }),

  /**
   * Sincronizar status de todas as instâncias
   */
  syncAllStatus: adminProcedure.mutation(async ({ ctx }) => {
    if (!ctx.user.tenantId) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Usuário não possui empresa associada',
      });
    }

    try {
      const evolutionApi = getEvolutionApi();
      const db = await getDb();

      if (!db) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Banco de dados não disponível',
        });
      }

      // Buscar todas as instâncias
      const result = await evolutionApi.listInstances();
      const instances = Array.isArray(result) ? result : result.instances || [];

      console.log(`[Sync] Sincronizando ${instances.length} instâncias`);

      let updatedCount = 0;

      // Atualizar status de cada instância
      for (const inst of instances) {
        try {
          const instanceName = inst.instanceName || inst.name;
          const status = inst.status || 'close';

          // Buscar número WhatsApp no banco
          const existing = await db
            .select()
            .from(numerosWhatsapp)
            .where(
              and(
                eq(numerosWhatsapp.tenantId, ctx.user.tenantId),
                eq(numerosWhatsapp.nome, instanceName)
              )
            )
            .limit(1);

          if (existing.length > 0) {
            await db
              .update(numerosWhatsapp)
              .set({
                status: status === 'open' ? 'conectado' : 'desconectado',
              })
              .where(eq(numerosWhatsapp.id, existing[0].id));
            updatedCount++;
          }
        } catch (error: any) {
          console.error('[Sync] Erro ao atualizar status:', error.message);
        }
      }

      return {
        success: true,
        message: `Sincronizados ${updatedCount} status`,
        updatedCount,
      };
    } catch (error: any) {
      console.error('[Sync] Erro ao sincronizar status:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Erro ao sincronizar status: ${error.message}`,
      });
    }
  }),
});
