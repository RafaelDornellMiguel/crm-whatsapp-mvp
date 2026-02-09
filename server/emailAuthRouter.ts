/**
 * Email Auth Router - Sistema Inteligente de Autenticação
 * Detecta email do Google e configura automaticamente role/departamento
 */

import { z } from 'zod';
import { protectedProcedure, router, adminProcedure } from './_core/trpc';
import { getDb } from './db';
import { users, empresas } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

/**
 * Mapeamento de emails para departamentos
 * Pode ser configurado pelo admin depois
 */
const emailDepartmentMap: Record<string, { role: 'admin' | 'user'; setor: string }> = {
  // Exemplo: admin@empresa.com -> admin
  // Será preenchido dinamicamente
};

export const emailAuthRouter = router({
  /**
   * Configurar mapeamento de email para departamento
   * Apenas admin pode fazer isso
   */
  setEmailDepartment: adminProcedure
    .input(
      z.object({
        email: z.string().email(),
        role: z.enum(['admin', 'user']),
        setor: z.enum(['vendas', 'logistica', 'financeiro', 'admin']),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) {
        throw new Error('Usuário não autenticado');
      }

      try {
        // Salvar no banco de dados
        const db = await getDb();
        if (!db) {
          throw new Error('Database not available');
        }

        // Buscar usuário pelo email
        const [existingUser] = await db
          .select()
          .from(users)
          .where(eq(users.email, input.email));

        if (existingUser) {
          // Atualizar usuário existente
          await db
            .update(users)
            .set({
              role: input.role,
              setor: input.setor,
            })
            .where(eq(users.email, input.email));

          return {
            success: true,
            message: `Usuário ${input.email} atualizado com sucesso`,
            user: {
              email: input.email,
              role: input.role,
              setor: input.setor,
            },
          };
        } else {
          return {
            success: false,
            message: `Usuário ${input.email} não encontrado. Ele precisa fazer login primeiro.`,
          };
        }
      } catch (error: any) {
        console.error('[Email Auth] Erro ao configurar departamento:', error);
        throw new Error(`Erro ao configurar departamento: ${error.message}`);
      }
    }),

  /**
   * Listar mapeamentos de email para departamento
   * Apenas admin pode fazer isso
   */
  getEmailDepartments: adminProcedure.query(async ({ ctx }) => {
    if (!ctx.user) {
      throw new Error('Usuário não autenticado');
    }

    try {
      const db = await getDb();
      if (!db) {
        throw new Error('Database not available');
      }

      // Buscar todos os usuários
      const allUsers = await db.select().from(users);

      return {
        success: true,
        users: allUsers.map((user) => ({
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          setor: user.setor,
        })),
      };
    } catch (error: any) {
      console.error('[Email Auth] Erro ao listar departamentos:', error);
      throw new Error(`Erro ao listar departamentos: ${error.message}`);
    }
  }),

  /**
   * Detectar e configurar automaticamente role/departamento ao fazer login
   * Chamado automaticamente após autenticação Google
   */
  autoConfigureUserAccess: protectedProcedure.mutation(async ({ ctx }) => {
    if (!ctx.user) {
      throw new Error('Usuário não autenticado');
    }

    try {
      const db = await getDb();
      if (!db) {
        throw new Error('Database not available');
      }

      // Se o usuário já tem role configurado, não faz nada
      if (ctx.user.role && ctx.user.role !== 'user') {
        return {
          success: true,
          message: 'Usuário já configurado',
          user: {
            email: ctx.user.email,
            role: ctx.user.role,
            setor: ctx.user.setor,
          },
        };
      }

      // Lógica inteligente para detectar role pelo email
      const email = ctx.user.email || '';
      let detectedRole: 'admin' | 'user' = 'user';
      let detectedSetor: string = 'vendas';

      // Padrões de detecção automática
      if (email.includes('admin') || email.includes('gerente')) {
        detectedRole = 'admin';
        detectedSetor = 'admin';
      } else if (email.includes('vendas')) {
        detectedRole = 'user';
        detectedSetor = 'vendas';
      } else if (email.includes('logistica')) {
        detectedRole = 'user';
        detectedSetor = 'logistica';
      } else if (email.includes('financeiro')) {
        detectedRole = 'user';
        detectedSetor = 'financeiro';
      }

      // Atualizar usuário no banco
      await db
        .update(users)
        .set({
          role: detectedRole,
          setor: detectedSetor as 'vendas' | 'logistica' | 'financeiro' | 'admin',
        })
        .where(eq(users.id, ctx.user.id));

      return {
        success: true,
        message: 'Acesso configurado automaticamente',
        user: {
          email: ctx.user.email,
          role: detectedRole,
          setor: detectedSetor,
        },
      };
    } catch (error: any) {
      console.error('[Email Auth] Erro ao configurar acesso automaticamente:', error);
      throw new Error(`Erro ao configurar acesso: ${error.message}`);
    }
  }),

  /**
   * Buscar configuração de acesso do usuário atual
   */
  getMyAccess: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) {
      throw new Error('Usuário não autenticado');
    }

    return {
      success: true,
      user: {
        id: ctx.user.id,
        email: ctx.user.email,
        name: ctx.user.name,
        role: ctx.user.role,
        setor: ctx.user.setor,
        permissions: getPermissionsByRole(ctx.user.role, ctx.user.setor),
      },
    };
  }),

  /**
   * Remover mapeamento de email
   * Apenas admin pode fazer isso
   */
  removeEmailDepartment: adminProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) {
        throw new Error('Usuário não autenticado');
      }

      try {
        const db = await getDb();
        if (!db) {
          throw new Error('Database not available');
        }

        // Resetar para role padrão
        await db
          .update(users)
          .set({
            role: 'user' as const,
            setor: 'vendas' as const,
          })
          .where(eq(users.email, input.email));

        return {
          success: true,
          message: `Acesso de ${input.email} foi resetado para padrão`,
        };
      } catch (error: any) {
        console.error('[Email Auth] Erro ao remover departamento:', error);
        throw new Error(`Erro ao remover departamento: ${error.message}`);
      }
    }),
});

/**
 * Função auxiliar para determinar permissões baseado em role e setor
 */
function getPermissionsByRole(
  role: string | undefined,
  setor: string | undefined
): Record<string, boolean> {
  const permissions: Record<string, boolean> = {
    // Todos podem acessar
    view_conversations: true,
    view_contacts: true,

    // Admin pode fazer tudo
    manage_connections: role === 'admin',
    manage_leads: role === 'admin',
    manage_users: role === 'admin',
    manage_departments: role === 'admin',
    view_dashboard: role === 'admin',
    view_manager: role === 'admin',

    // Permissões por setor
    view_sales: (setor === 'vendas' || setor === 'admin') || role === 'admin',
    view_logistics: (setor === 'logistica' || setor === 'admin') || role === 'admin',
    view_finance: (setor === 'financeiro' || setor === 'admin') || role === 'admin',
  };

  return permissions;
}
