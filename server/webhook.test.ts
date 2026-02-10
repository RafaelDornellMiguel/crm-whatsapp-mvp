import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleWebhook } from './webhookHandler';
import { Request, Response } from 'express';
import { getDb } from './db';

vi.mock('./db');

describe('Webhook Handler', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    mockReq = {
      body: {},
    };
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
  });

  it('deve processar webhook de mensagem recebida', async () => {
    mockReq.body = {
      event: 'messages.upsert',
      instance: '5511999999999',
      data: {
        key: {
          remoteJid: '5511999999999@s.whatsapp.net',
          fromMe: false,
          id: 'msg123',
        },
        message: {
          conversation: 'Olá, tudo bem?',
        },
        messageTimestamp: Date.now(),
        pushName: 'João Silva',
      },
    };

    await handleWebhook(mockReq as Request, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({ success: true });
  });

  it('deve ignorar mensagens enviadas por nós', async () => {
    mockReq.body = {
      event: 'messages.upsert',
      instance: '5511999999999',
      data: {
        key: {
          remoteJid: '5511999999999@s.whatsapp.net',
          fromMe: true, // Mensagem enviada por nós
          id: 'msg123',
        },
        message: {
          conversation: 'Resposta automática',
        },
      },
    };

    await handleWebhook(mockReq as Request, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  it('deve processar webhook de atualização de conexão', async () => {
    mockReq.body = {
      event: 'connection.update',
      instance: '5511999999999',
      data: {
        connection: 'open',
        lastDisconnect: null,
      },
    };

    await handleWebhook(mockReq as Request, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  it('deve processar webhook de novo contato', async () => {
    mockReq.body = {
      event: 'contacts.upsert',
      instance: '5511999999999',
      data: [
        {
          id: '5511999999999@s.whatsapp.net',
          notify: 'João Silva',
        },
      ],
    };

    await handleWebhook(mockReq as Request, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  it('deve processar webhook de atualização de QR Code', async () => {
    mockReq.body = {
      event: 'qr.updated',
      instance: '5511999999999',
      data: {
        qrcode: 'data:image/png;base64,...',
      },
    };

    await handleWebhook(mockReq as Request, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  it('deve retornar erro 500 em caso de exceção', async () => {
    mockReq.body = null; // Vai causar erro

    await handleWebhook(mockReq as Request, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(500);
  });

  it('deve processar webhook de atualização de status de mensagem', async () => {
    mockReq.body = {
      event: 'messages.update',
      instance: '5511999999999',
      data: {
        key: {
          id: 'msg123',
        },
        status: 'delivered',
      },
    };

    await handleWebhook(mockReq as Request, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(200);
  });

  it('deve ignorar eventos desconhecidos', async () => {
    mockReq.body = {
      event: 'unknown.event',
      instance: '5511999999999',
      data: {},
    };

    await handleWebhook(mockReq as Request, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(200);
  });
});
