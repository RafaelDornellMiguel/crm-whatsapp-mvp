/**
 * Department Router - Gerenciamento de Departamentos
 * Apenas ADM/Gestores podem gerenciar departamentos
 */

import { z } from 'zod';
import { adminProcedure, router } from './_core/trpc';
import { getDb } from './db';
import { departamentos, users, numerosWhatsapp } from '../drizzle/schema';
import { eq, and } from 'drizzle-orm';

export const departmentRouter = router({
  /**
   * Criar novo departamento
   * Apenas admin pode fazer isso
   */
  create: adminProcedure
    .input(
      z.object({
        nome: z.string().min(1).max(100),
        descricao: z.string().optional(),
        cor: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) {
        throw new Error('Usuário não autenticado');
      }

      try {
        const db = await getDb();
        if (!db) {
          throw new Error('Database not available');
        }

        // Inserir departamento
        await db.insert(departamentos).values({
          tenantId: ctx.user.tenantId,
          nome: input.nome,
          descricao: input.descricao,
          cor: input.cor || '#3B82F6',
          ativo: true,
        });

        return {
          success: true,
          message: `Departamento "${input.nome}" criado com sucesso`,
        };
      } catch (error: any) {
        console.error('[Department] Erro ao criar departamento:', error);
        throw new Error(`Erro ao criar departamento: ${error.message}`);
      }
    }),

  /**
   * Listar todos os departamentos da empresa
   */
  list: adminProcedure.query(async ({ ctx }) => {
    if (!ctx.user) {
      throw new Error('Usuário não autenticado');
    }

    try {
      const db = await getDb();
      if (!db) {
        throw new Error('Database not available');
      }

      const depts = await db
        .select()
        .from(departamentos)
        .where(eq(departamentos.tenantId, ctx.user.tenantId));

      // Buscar usuários e conexões por departamento
      const deptsWithData = await Promise.all(
        depts.map(async (dept) => {
          const deptUsers = await db
            .select()
            .from(users)
            .where(eq(users.departamentoId, dept.id));

          const deptConnections = await db
            .select()
            .from(numerosWhatsapp)
            .where(eq(numerosWhatsapp.departamentoId, dept.id));

          return {
            ...dept,
            usuariosCount: deptUsers.length,
            conexoesCount: deptConnections.length,
          };
        })
      );

      return {
        success: true,
        departamentos: deptsWithData,
      };
    } catch (error: any) {
      console.error('[Department] Erro ao listar departamentos:', error);
      throw new Error(`Erro ao listar departamentos: ${error.message}`);
    }
  }),

  /**
   * Atualizar departamento
   */
  update: adminProcedure
    .input(
      z.object({
        id: z.number(),
        nome: z.string().min(1).max(100).optional(),
        descricao: z.string().optional(),
        cor: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
        ativo: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) {
        throw new Error('Usuário não autenticado');
      }

      try {
        const db = await getDb();
        if (!db) {
          throw new Error('Database not available');
        }

        // Verificar se departamento pertence à empresa
        const dept = await db
          .select()
          .from(departamentos)
          .where(
            and(
              eq(departamentos.id, input.id),
              eq(departamentos.tenantId, ctx.user.tenantId)
            )
          );

        if (dept.length === 0) {
          throw new Error('Departamento não encontrado');
        }

        // Atualizar departamento
        await db
          .update(departamentos)
          .set({
            nome: input.nome,
            descricao: input.descricao,
            cor: input.cor,
            ativo: input.ativo,
          })
          .where(eq(departamentos.id, input.id));

        return {
          success: true,
          message: `Departamento atualizado com sucesso`,
        };
      } catch (error: any) {
        console.error('[Department] Erro ao atualizar departamento:', error);
        throw new Error(`Erro ao atualizar departamento: ${error.message}`);
      }
    }),

  /**
   * Deletar departamento
   * Apenas se não tiver usuários ou conexões atreladas
   */
  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) {
        throw new Error('Usuário não autenticado');
      }

      try {
        const db = await getDb();
        if (!db) {
          throw new Error('Database not available');
        }

        // Verificar se departamento pertence à empresa
        const dept = await db
          .select()
          .from(departamentos)
          .where(
            and(
              eq(departamentos.id, input.id),
              eq(departamentos.tenantId, ctx.user.tenantId)
            )
          );

        if (dept.length === 0) {
          throw new Error('Departamento não encontrado');
        }

        // Verificar se tem usuários ou conexões
        const deptUsers = await db
          .select()
          .from(users)
          .where(eq(users.departamentoId, input.id));

        const deptConnections = await db
          .select()
          .from(numerosWhatsapp)
          .where(eq(numerosWhatsapp.departamentoId, input.id));

        if (deptUsers.length > 0 || deptConnections.length > 0) {
          throw new Error(
            `Não é possível deletar departamento com ${deptUsers.length} usuários e ${deptConnections.length} conexões`
          );
        }

        // Deletar departamento
        await db.delete(departamentos).where(eq(departamentos.id, input.id));

        return {
          success: true,
          message: `Departamento deletado com sucesso`,
        };
      } catch (error: any) {
        console.error('[Department] Erro ao deletar departamento:', error);
        throw new Error(`Erro ao deletar departamento: ${error.message}`);
      }
    }),

  /**
   * Atrelar usuário a departamento
   */
  assignUser: adminProcedure
    .input(
      z.object({
        userId: z.number(),
        departamentoId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) {
        throw new Error('Usuário não autenticado');
      }

      try {
        const db = await getDb();
        if (!db) {
          throw new Error('Database not available');
        }

        // Atualizar usuário
        await db
          .update(users)
          .set({
            departamentoId: input.departamentoId,
          })
          .where(eq(users.id, input.userId));

        return {
          success: true,
          message: `Usuário atrelado ao departamento com sucesso`,
        };
      } catch (error: any) {
        console.error('[Department] Erro ao atrelar usuário:', error);
        throw new Error(`Erro ao atrelar usuário: ${error.message}`);
      }
    }),

  /**
   * Atrelar conexão WhatsApp a departamento
   */
  assignConnection: adminProcedure
    .input(
      z.object({
        connectionId: z.number(),
        departamentoId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) {
        throw new Error('Usuário não autenticado');
      }

      try {
        const db = await getDb();
        if (!db) {
          throw new Error('Database not available');
        }

        // Atualizar conexão
        await db
          .update(numerosWhatsapp)
          .set({
            departamentoId: input.departamentoId,
          })
          .where(eq(numerosWhatsapp.id, input.connectionId));

        return {
          success: true,
          message: `Conexão atrelada ao departamento com sucesso`,
        };
      } catch (error: any) {
        console.error('[Department] Erro ao atrelar conexão:', error);
        throw new Error(`Erro ao atrelar conexão: ${error.message}`);
      }
    }),

  /**
   * Obter departamento com usuários e conexões
   */
  getDetail: adminProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      if (!ctx.user) {
        throw new Error('Usuário não autenticado');
      }

      try {
        const db = await getDb();
        if (!db) {
          throw new Error('Database not available');
        }

        const dept = await db
          .select()
          .from(departamentos)
          .where(
            and(
              eq(departamentos.id, input.id),
              eq(departamentos.tenantId, ctx.user.tenantId)
            )
          );

        if (dept.length === 0) {
          throw new Error('Departamento não encontrado');
        }

        const deptUsers = await db
          .select()
          .from(users)
          .where(eq(users.departamentoId, input.id));

        const deptConnections = await db
          .select()
          .from(numerosWhatsapp)
          .where(eq(numerosWhatsapp.departamentoId, input.id));

        return {
          success: true,
          departamento: dept[0],
          usuarios: deptUsers,
          conexoes: deptConnections,
        };
      } catch (error: any) {
        console.error('[Department] Erro ao obter departamento:', error);
        throw new Error(`Erro ao obter departamento: ${error.message}`);
      }
    }),
});
