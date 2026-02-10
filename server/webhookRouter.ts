/**
 * Webhook Router - Procedures tRPC para gerenciar webhooks da Evolution API
 */

import { router, protectedProcedure, adminProcedure } from './_core/trpc';
import { z } from 'zod';
import { getEvolutionApi } from './evolutionApi';
import { getDb } from './db';
import { numerosWhatsapp } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

export const webhookRouter = router({
  /**
   * Registrar webhook em uma instância
   */
  registerWebhook: adminProcedure
    .input(
      z.object({
        instanceName: z.string(),
        webhookUrl: z.string().url(),
        events: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const { instanceName, webhookUrl, events = ['messages.upsert', 'connection.update', 'contacts.upsert'] } = input;

        // Registrar webhook na Evolution API
        const api = getEvolutionApi();
        const response = await api.setWebhook(instanceName, webhookUrl, events);

        console.log('[Webhook Router] Webhook registrado:', { instanceName, webhookUrl, events });

        return {
          success: true,
          message: 'Webhook registrado com sucesso',
          data: response,
        };
      } catch (error) {
        console.error('[Webhook Router] Erro ao registrar webhook:', error);
        throw new Error('Erro ao registrar webhook na Evolution API');
      }
    }),

  /**
   * Registrar webhooks em todas as instâncias
   */
  registerWebhooksAll: adminProcedure
    .input(
      z.object({
        webhookUrl: z.string().url(),
        events: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) {
          throw new Error('Banco de dados não disponível');
        }

        const { webhookUrl, events = ['messages.upsert', 'connection.update', 'contacts.upsert'] } = input;

        // Buscar todas as instâncias ativas
        const instances = await db
          .select()
          .from(numerosWhatsapp)
          .where(eq(numerosWhatsapp.ativo, true));

        const results: Array<{ instanceName: string; success: boolean; data?: any; error?: string }> = [];

        // Registrar webhook em cada instância
        for (const instance of instances) {
          try {
            const api = getEvolutionApi();
            const response = await api.setWebhook(instance.numero, webhookUrl, events);
            results.push({
              instanceName: instance.numero,
              success: true,
              data: response,
            });
          } catch (error) {
            results.push({
              instanceName: instance.numero,
              success: false,
              error: String(error),
            });
          }
        }

        console.log('[Webhook Router] Webhooks registrados em todas as instâncias:', results);

        return {
          success: true,
          message: 'Webhooks registrados em todas as instâncias',
          results,
        };
      } catch (error) {
        console.error('[Webhook Router] Erro ao registrar webhooks em todas as instâncias:', error);
        throw new Error('Erro ao registrar webhooks em todas as instâncias');
      }
    }),

  /**
   * Obter webhook URL configurada
   */
  getWebhookUrl: protectedProcedure
    .query(async () => {
      try {
        // Retornar URL do webhook configurada
        const webhookUrl = process.env.WEBHOOK_URL || `${process.env.APP_URL || 'http://localhost:3000'}/api/webhook/evolution`;

        return {
          success: true,
          webhookUrl,
        };
      } catch (error) {
        console.error('[Webhook Router] Erro ao obter URL do webhook:', error);
        throw new Error('Erro ao obter URL do webhook');
      }
    }),
});
