/**
 * Hook useWebSocket - Conexão em Tempo Real com Servidor
 * Gerencia notificações de mensagens, inbox e eventos em tempo real
 */

import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './useAuth';
import { useQueryClient } from '@tanstack/react-query';

interface WebSocketMessage {
  id: number;
  contatoId: number;
  contatoNome?: string;
  conteudo: string;
  tipo: 'texto' | 'imagem' | 'audio' | 'documento';
  direcao: 'entrada' | 'saida';
  createdAt: Date;
}

interface InboxUpdate {
  contatoId: number;
  ultimaMensagem?: string;
  ultimaMensagemEm?: Date;
  todasLidas?: boolean;
}

export function useWebSocket() {
  const socketRef = useRef<Socket | null>(null);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Conectar ao WebSocket
  useEffect(() => {
    if (!user) return;

    // Evitar múltiplas conexões
    if (socketRef.current?.connected) {
      return;
    }

    const socket = io(window.location.origin, {
      auth: {
        userId: user.id,
        tenantId: user.tenantId || 1,
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    // Evento: Conectado
    socket.on('connect', () => {
      console.log('[WebSocket] Conectado ao servidor');
    });

    // Evento: Nova mensagem
    socket.on('chat:mensagem-nova', (msg: WebSocketMessage) => {
      console.log('[WebSocket] Nova mensagem:', msg);

      // Invalidar query de conversa para recarregar
      queryClient.invalidateQueries({
        queryKey: ['chat', 'getConversa', { contatoId: msg.contatoId }],
      });

      // Notificar usuário
      if (msg.direcao === 'entrada') {
        notificarUsuario(msg.contatoNome || 'Novo contato', msg.conteudo);
      }
    });

    // Evento: Atualizar inbox
    socket.on('inbox:atualizar', (data: InboxUpdate) => {
      console.log('[WebSocket] Atualizar inbox:', data);

      // Invalidar query de inbox
      queryClient.invalidateQueries({
        queryKey: ['chat', 'getInbox'],
      });
    });

    // Evento: Usuário digitando
    socket.on('chat:usuario-digitando', (data: { contatoId: number; userId: number }) => {
      console.log('[WebSocket] Usuário digitando:', data);
      // Poderia mostrar indicador "digitando..." aqui
    });

    // Evento: Usuário parou de digitar
    socket.on('chat:usuario-parou-digitar', (data: { contatoId: number; userId: number }) => {
      console.log('[WebSocket] Usuário parou de digitar:', data);
    });

    // Evento: Erro
    socket.on('erro', (error: { message: string }) => {
      console.error('[WebSocket] Erro:', error);
    });

    // Evento: Desconectado
    socket.on('disconnect', () => {
      console.log('[WebSocket] Desconectado do servidor');
    });

    socketRef.current = socket;

    // Cleanup
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [user, queryClient]);

  // Enviar mensagem
  const enviarMensagem = useCallback(
    (contatoId: number, conteudo: string) => {
      if (!socketRef.current?.connected) {
        console.error('[WebSocket] Socket não conectado');
        return;
      }

      socketRef.current.emit('mensagem:enviar', {
        contatoId,
        conteudo,
      });
    },
    []
  );

  // Marcar como lido
  const marcarComoLido = useCallback((contatoId: number) => {
    if (!socketRef.current?.connected) {
      console.error('[WebSocket] Socket não conectado');
      return;
    }

    socketRef.current.emit('mensagem:marcar-lido', {
      contatoId,
    });
  }, []);

  // Notificar usuário (digitando)
  const notificarDigitando = useCallback((contatoId: number) => {
    if (!socketRef.current?.connected) {
      return;
    }

    socketRef.current.emit('chat:digitando', {
      contatoId,
    });
  }, []);

  // Notificar que parou de digitar
  const notificarParouDigitar = useCallback((contatoId: number) => {
    if (!socketRef.current?.connected) {
      return;
    }

    socketRef.current.emit('chat:parou-digitar', {
      contatoId,
    });
  }, []);

  return {
    socket: socketRef.current,
    isConnected: socketRef.current?.connected || false,
    enviarMensagem,
    marcarComoLido,
    notificarDigitando,
    notificarParouDigitar,
  };
}

// Função para notificar usuário (usando Notification API)
function notificarUsuario(titulo: string, mensagem: string) {
  if (!('Notification' in window)) {
    return;
  }

  if (Notification.permission === 'granted') {
    new Notification(titulo, {
      body: mensagem,
      icon: '/logo.png',
      tag: 'crm-whatsapp',
    });
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        new Notification(titulo, {
          body: mensagem,
          icon: '/logo.png',
          tag: 'crm-whatsapp',
        });
      }
    });
  }
}
