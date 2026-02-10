/**
 * Webhook Handler para Evolution API
 * Recebe eventos do WhatsApp (mensagens, status de conexão, contatos, etc)
 * Integrado com WebSocket para notificações em tempo real
 */

import { Request, Response } from 'express';
import { getDb } from './db';
import { mensagens, contatos, numerosWhatsapp } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

interface WebhookPayload {
  event: string;
  instance: string;
  data: any;
}

/**
 * Extrair texto da mensagem
 */
function extractMessageText(message: any): string {
  if (message.conversation) {
    return message.conversation;
  }
  if (message.extendedTextMessage?.text) {
    return message.extendedTextMessage.text;
  }
  if (message.imageMessage?.caption) {
    return message.imageMessage.caption;
  }
  if (message.videoMessage?.caption) {
    return message.videoMessage.caption;
  }
  if (message.documentMessage?.fileName) {
    return `Documento: ${message.documentMessage.fileName}`;
  }
  if (message.audioMessage) {
    return '[Áudio]';
  }
  return '[Mensagem sem texto]';
}

/**
 * Extrair tipo de mídia
 */
function extractMediaType(message: any): 'text' | 'image' | 'video' | 'audio' | 'document' {
  if (message.imageMessage) return 'image';
  if (message.videoMessage) return 'video';
  if (message.audioMessage) return 'audio';
  if (message.documentMessage) return 'document';
  return 'text';
}

/**
 * Extrair URL de mídia
 */
function extractMediaUrl(message: any): string | null {
  if (message.imageMessage?.url) return message.imageMessage.url;
  if (message.videoMessage?.url) return message.videoMessage.url;
  if (message.audioMessage?.url) return message.audioMessage.url;
  if (message.documentMessage?.url) return message.documentMessage.url;
  return null;
}

/**
 * Handler principal do webhook
 */
export async function handleWebhook(req: Request, res: Response) {
  try {
    const payload: WebhookPayload = req.body;

    console.log('[Webhook] Evento recebido:', payload.event);
    console.log('[Webhook] Instância:', payload.instance);

    // Processar diferentes tipos de eventos
    switch (payload.event) {
      case 'messages.upsert':
        await processIncomingMessage(payload);
        break;
      case 'messages.update':
        await processMessageUpdate(payload);
        break;
      case 'connection.update':
        await processConnectionUpdate(payload);
        break;
      case 'contacts.upsert':
        await processContactUpdate(payload);
        break;
      case 'qr.updated':
        await processQRUpdate(payload);
        break;
      default:
        console.log('[Webhook] Evento desconhecido:', payload.event);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('[Webhook] Erro ao processar webhook:', error);
    res.status(500).json({ success: false, error: 'Erro ao processar webhook' });
  }
}

/**
 * Processar mensagem recebida
 */
async function processIncomingMessage(payload: WebhookPayload) {
  const db = await getDb();
  if (!db) {
    console.warn('[Webhook] Banco de dados não disponível');
    return;
  }

  const { data, instance } = payload;
  const { key, message, messageTimestamp, pushName } = data;

  // Ignorar mensagens enviadas por nós
  if (key.fromMe) {
    console.log('[Webhook] Mensagem enviada por nós, ignorando');
    return;
  }

  // Extrair número do contato (remover @s.whatsapp.net)
  const phoneNumber = key.remoteJid.replace('@s.whatsapp.net', '');

  // Verificar se contato existe, senão criar
  let contact = await db
    .select()
    .from(contatos)
    .where(eq(contatos.telefone, phoneNumber))
    .limit(1);

  if (contact.length === 0) {
    // Criar novo contato
    await db.insert(contatos).values({
      tenantId: 1,
      nome: pushName || phoneNumber,
      telefone: phoneNumber,
      status: 'novo',
      ticketStatus: 'aberto',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Buscar contato recém-criado
    contact = await db
      .select()
      .from(contatos)
      .where(eq(contatos.telefone, phoneNumber))
      .limit(1);
  }

  if (contact.length === 0) {
    console.error('[Webhook] Erro ao criar/buscar contato');
    return;
  }

  const contactId = contact[0].id;

  // Extrair informações da mensagem
  const messageText = extractMessageText(message);
  const mediaType = extractMediaType(message);
  const mediaUrl = extractMediaUrl(message);

  // Salvar mensagem no banco
  await db.insert(mensagens).values({
    tenantId: 1,
    contatoId: contactId,
    vendedorId: null,
    remetente: 'contato',
    conteudo: messageText,
    tipo: mediaType === 'text' ? 'texto' : mediaType === 'image' ? 'imagem' : mediaType === 'audio' ? 'audio' : 'arquivo',
    arquivoUrl: mediaUrl,
    lida: false,
    createdAt: new Date(),
  });

  console.log('[Webhook] Mensagem salva no banco:', {
    contactId,
    phoneNumber,
    messageText,
    mediaType,
  });
}

/**
 * Processar atualização de status de mensagem
 */
async function processMessageUpdate(payload: WebhookPayload) {
  const { data } = payload;
  const { key, status } = data;

  console.log('[Webhook] Atualização de status de mensagem:', {
    messageId: key.id,
    status,
  });

  // TODO: Atualizar status da mensagem no banco
}

/**
 * Processar atualização de conexão
 */
async function processConnectionUpdate(payload: WebhookPayload) {
  const db = await getDb();
  if (!db) {
    console.warn('[Webhook] Banco de dados não disponível');
    return;
  }

  const { data, instance } = payload;
  const { connection, lastDisconnect } = data;

  console.log('[Webhook] Atualização de conexão:', {
    instance,
    connection,
    lastDisconnect,
  });

  // Atualizar status da instância no banco
  const statusMap: Record<string, 'conectado' | 'desconectado' | 'aguardando'> = {
    'open': 'conectado',
    'close': 'desconectado',
  };
  const newStatus = statusMap[connection] || 'aguardando';

  await db
    .update(numerosWhatsapp)
    .set({
      status: newStatus,
      updatedAt: new Date(),
    })
    .where(eq(numerosWhatsapp.numero, instance));

  console.log('[Webhook] Status da conexão atualizado:', { instance, newStatus });
}

/**
 * Processar atualização de contatos
 */
async function processContactUpdate(payload: WebhookPayload) {
  const db = await getDb();
  if (!db) {
    console.warn('[Webhook] Banco de dados não disponível');
    return;
  }

  const { data } = payload;
  const contacts = Array.isArray(data) ? data : [data];

  for (const contact of contacts) {
    const phoneNumber = contact.id.replace('@s.whatsapp.net', '');

    // Verificar se contato existe
    const existingContact = await db
      .select()
      .from(contatos)
      .where(eq(contatos.telefone, phoneNumber))
      .limit(1);

    if (existingContact.length === 0) {
      // Criar novo contato
      await db.insert(contatos).values({
        tenantId: 1,
        nome: contact.notify || phoneNumber,
        telefone: phoneNumber,
        status: 'novo',
        ticketStatus: 'aberto',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      console.log('[Webhook] Novo contato sincronizado:', phoneNumber);
    }
  }
}

/**
 * Processar atualização de QR Code
 */
async function processQRUpdate(payload: WebhookPayload) {
  const { data, instance } = payload;
  const { qrcode } = data;

  console.log('[Webhook] QR Code atualizado para instância:', instance);

  // TODO: Salvar QR Code no banco para exibir no frontend
}
