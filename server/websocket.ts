/**
 * WebSocket Handler - Notificações em Tempo Real
 * Atualiza Chat e Inbox quando novas mensagens chegam
 */

import type { Server as SocketIOServer } from 'socket.io';
import { Server as SocketIOServerImpl } from 'socket.io';
import { Server } from 'http';
import { getDb } from './db';

interface SocketUser {
  userId: number;
  tenantId: number;
}

const socketUsers = new Map<string, SocketUser>();

export function initializeWebSocket(httpServer: Server): SocketIOServerImpl {
  let io: SocketIOServerImpl;
  
  io = new SocketIOServerImpl(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || '*',
      credentials: true,
    },
  });

  // Middleware de autenticação
  io.use((socket, next) => {
    const userId = socket.handshake.auth.userId;
    const tenantId = socket.handshake.auth.tenantId;

    if (!userId || !tenantId) {
      return next(new Error('Autenticação necessária'));
    }

    socketUsers.set(socket.id, { userId, tenantId });
    next();
  });

  io.on('connection', (socket) => {
    const user = socketUsers.get(socket.id);
    if (!user) return;

    console.log(`[WebSocket] Usuário ${user.userId} conectado`);

    // Inscrever em sala de tenant
    socket.join(`tenant:${user.tenantId}`);

    // Inscrever em sala de usuário
    socket.join(`user:${user.userId}`);

    // Evento: Nova mensagem recebida
    socket.on('mensagem:nova', async (data) => {
      try {
        const { contatoId, conteudo, tipo = 'texto' } = data;

        // Salvar mensagem no banco
        // Salvar mensagem no banco (será feito via tRPC)
        // Aqui apenas notificamos via WebSocket
        const novaMsg = {
          id: Math.random(),
          contatoId,
          conteudo,
          tipo,
          direcao: 'entrada' as const,
          createdAt: new Date(),
        };

        // Buscar contato para obter nome
        const contato = { nome: 'Contato' };

        // Notificar todos os usuários do tenant
        io.to(`tenant:${user.tenantId}`).emit('chat:mensagem-nova', {
          id: novaMsg.id,
          contatoId,
          contatoNome: contato?.nome,
          conteudo,
          tipo,
          direcao: 'entrada',
          createdAt: novaMsg.createdAt,
        });

        // Notificar Inbox
        io.to(`tenant:${user.tenantId}`).emit('inbox:atualizar', {
          contatoId,
          ultimaMensagem: conteudo,
          ultimaMensagemEm: novaMsg.createdAt,
        });
      } catch (error) {
        console.error('[WebSocket] Erro ao processar mensagem:', error);
        socket.emit('erro', { message: 'Erro ao processar mensagem' });
      }
    });

    // Evento: Enviar mensagem
    socket.on('mensagem:enviar', async (data) => {
      try {
        const { contatoId, conteudo } = data;

        // Salvar mensagem no banco
        // Salvar mensagem no banco (será feito via tRPC)
        const novaMsg = {
          id: Math.random(),
          contatoId,
          conteudo,
          tipo: 'texto',
          direcao: 'saida' as const,
          createdAt: new Date(),
        };

        // Buscar contato
        const contato = { nome: 'Contato' };

        // Notificar todos os usuários do tenant
        io.to(`tenant:${user.tenantId}`).emit('chat:mensagem-nova', {
          id: novaMsg.id,
          contatoId,
          contatoNome: contato?.nome,
          conteudo,
          tipo: 'texto',
          direcao: 'saida',
          createdAt: novaMsg.createdAt,
        });

        // Confirmar envio
        socket.emit('mensagem:enviada', {
          id: novaMsg.id,
          contatoId,
        });
      } catch (error) {
        console.error('[WebSocket] Erro ao enviar mensagem:', error);
        socket.emit('erro', { message: 'Erro ao enviar mensagem' });
      }
    });

    // Evento: Marcar como lido
    socket.on('mensagem:marcar-lido', async (data) => {
      try {
        const { contatoId } = data;

        // Atualizar todas as mensagens não lidas do contato (será feito via tRPC)
        // Aqui apenas notificamos via WebSocket

        // Notificar todos os usuários
        io.to(`tenant:${user.tenantId}`).emit('inbox:atualizar', {
          contatoId,
          todasLidas: true,
        });
      } catch (error) {
        console.error('[WebSocket] Erro ao marcar como lido:', error);
      }
    });

    // Evento: Digitando
    socket.on('chat:digitando', (data) => {
      const { contatoId } = data;

      io.to(`tenant:${user.tenantId}`).emit('chat:usuario-digitando', {
        contatoId,
        userId: user.userId,
      });
    });

    // Evento: Parou de digitar
    socket.on('chat:parou-digitar', (data) => {
      const { contatoId } = data;

      io.to(`tenant:${user.tenantId}`).emit('chat:usuario-parou-digitar', {
        contatoId,
        userId: user.userId,
      });
    });

    // Desconexão
    socket.on('disconnect', () => {
      socketUsers.delete(socket.id);
      console.log(`[WebSocket] Usuário desconectado`);
    });
  });

  return io as SocketIOServerImpl;
}

// Função para emitir notificação de nova mensagem (chamada de webhooks)
export function notificarNovaMensagem(
  io: SocketIOServerImpl,
  tenantId: number,
  contatoId: number,
  conteudo: string,
  contatoNome: string
) {
  io.to(`tenant:${tenantId}`).emit('chat:mensagem-nova', {
    contatoId,
    contatoNome,
    conteudo,
    tipo: 'texto',
    direcao: 'entrada',
    createdAt: new Date(),
  });
}
