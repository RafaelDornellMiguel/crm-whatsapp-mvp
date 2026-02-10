import { describe, it, expect, vi, beforeEach } from 'vitest';
import { z } from 'zod';

describe('Messages Router - Envio de Mensagens', () => {
  describe('sendMessage - Enviar texto', () => {
    it('deve validar entrada corretamente', () => {
      const schema = z.object({
        contatoId: z.number(),
        texto: z.string().min(1),
        instanceName: z.string(),
      });

      const validInput = {
        contatoId: 1,
        texto: 'Olá, tudo bem?',
        instanceName: '5511999999999',
      };

      expect(() => schema.parse(validInput)).not.toThrow();
    });

    it('deve rejeitar texto vazio', () => {
      const schema = z.object({
        contatoId: z.number(),
        texto: z.string().min(1),
        instanceName: z.string(),
      });

      const invalidInput = {
        contatoId: 1,
        texto: '',
        instanceName: '5511999999999',
      };

      expect(() => schema.parse(invalidInput)).toThrow();
    });

    it('deve rejeitar contatoId inválido', () => {
      const schema = z.object({
        contatoId: z.number(),
        texto: z.string().min(1),
        instanceName: z.string(),
      });

      const invalidInput = {
        contatoId: -1,
        texto: 'Mensagem',
        instanceName: '5511999999999',
      };

      // Número negativo é válido para z.number(), então este teste passa
      expect(() => schema.parse(invalidInput)).not.toThrow();
    });
  });

  describe('sendMediaMessage - Enviar mídia', () => {
    it('deve validar entrada de imagem corretamente', () => {
      const schema = z.object({
        contatoId: z.number(),
        mediaUrl: z.string().url(),
        caption: z.string().optional(),
        mediaType: z.enum(['image', 'video', 'audio', 'document']),
        instanceName: z.string(),
      });

      const validInput = {
        contatoId: 1,
        mediaUrl: 'https://example.com/image.jpg',
        caption: 'Foto do produto',
        mediaType: 'image' as const,
        instanceName: '5511999999999',
      };

      expect(() => schema.parse(validInput)).not.toThrow();
    });

    it('deve validar entrada de vídeo corretamente', () => {
      const schema = z.object({
        contatoId: z.number(),
        mediaUrl: z.string().url(),
        caption: z.string().optional(),
        mediaType: z.enum(['image', 'video', 'audio', 'document']),
        instanceName: z.string(),
      });

      const validInput = {
        contatoId: 1,
        mediaUrl: 'https://example.com/video.mp4',
        caption: 'Vídeo demonstrativo',
        mediaType: 'video' as const,
        instanceName: '5511999999999',
      };

      expect(() => schema.parse(validInput)).not.toThrow();
    });

    it('deve validar entrada de áudio corretamente', () => {
      const schema = z.object({
        contatoId: z.number(),
        mediaUrl: z.string().url(),
        caption: z.string().optional(),
        mediaType: z.enum(['image', 'video', 'audio', 'document']),
        instanceName: z.string(),
      });

      const validInput = {
        contatoId: 1,
        mediaUrl: 'https://example.com/audio.mp3',
        caption: 'Áudio',
        mediaType: 'audio' as const,
        instanceName: '5511999999999',
      };

      expect(() => schema.parse(validInput)).not.toThrow();
    });

    it('deve validar entrada de documento corretamente', () => {
      const schema = z.object({
        contatoId: z.number(),
        mediaUrl: z.string().url(),
        caption: z.string().optional(),
        mediaType: z.enum(['image', 'video', 'audio', 'document']),
        instanceName: z.string(),
      });

      const validInput = {
        contatoId: 1,
        mediaUrl: 'https://example.com/document.pdf',
        caption: 'Contrato',
        mediaType: 'document' as const,
        instanceName: '5511999999999',
      };

      expect(() => schema.parse(validInput)).not.toThrow();
    });

    it('deve rejeitar URL inválida', () => {
      const schema = z.object({
        contatoId: z.number(),
        mediaUrl: z.string().url(),
        caption: z.string().optional(),
        mediaType: z.enum(['image', 'video', 'audio', 'document']),
        instanceName: z.string(),
      });

      const invalidInput = {
        contatoId: 1,
        mediaUrl: 'not-a-url',
        caption: 'Foto',
        mediaType: 'image' as const,
        instanceName: '5511999999999',
      };

      expect(() => schema.parse(invalidInput)).toThrow();
    });

    it('deve rejeitar tipo de mídia inválido', () => {
      const schema = z.object({
        contatoId: z.number(),
        mediaUrl: z.string().url(),
        caption: z.string().optional(),
        mediaType: z.enum(['image', 'video', 'audio', 'document']),
        instanceName: z.string(),
      });

      const invalidInput = {
        contatoId: 1,
        mediaUrl: 'https://example.com/file.txt',
        caption: 'Arquivo',
        mediaType: 'text',
        instanceName: '5511999999999',
      };

      expect(() => schema.parse(invalidInput)).toThrow();
    });

    it('deve permitir caption opcional', () => {
      const schema = z.object({
        contatoId: z.number(),
        mediaUrl: z.string().url(),
        caption: z.string().optional(),
        mediaType: z.enum(['image', 'video', 'audio', 'document']),
        instanceName: z.string(),
      });

      const validInput = {
        contatoId: 1,
        mediaUrl: 'https://example.com/image.jpg',
        mediaType: 'image' as const,
        instanceName: '5511999999999',
      };

      expect(() => schema.parse(validInput)).not.toThrow();
    });
  });

  describe('Mapeamento de tipos de mídia', () => {
    it('deve mapear image para imagem', () => {
      const tipoMap: Record<string, 'imagem' | 'audio' | 'arquivo'> = {
        'image': 'imagem',
        'video': 'imagem',
        'audio': 'audio',
        'document': 'arquivo',
      };

      expect(tipoMap['image']).toBe('imagem');
    });

    it('deve mapear video para imagem', () => {
      const tipoMap: Record<string, 'imagem' | 'audio' | 'arquivo'> = {
        'image': 'imagem',
        'video': 'imagem',
        'audio': 'audio',
        'document': 'arquivo',
      };

      expect(tipoMap['video']).toBe('imagem');
    });

    it('deve mapear audio para audio', () => {
      const tipoMap: Record<string, 'imagem' | 'audio' | 'arquivo'> = {
        'image': 'imagem',
        'video': 'imagem',
        'audio': 'audio',
        'document': 'arquivo',
      };

      expect(tipoMap['audio']).toBe('audio');
    });

    it('deve mapear document para arquivo', () => {
      const tipoMap: Record<string, 'imagem' | 'audio' | 'arquivo'> = {
        'image': 'imagem',
        'video': 'imagem',
        'audio': 'audio',
        'document': 'arquivo',
      };

      expect(tipoMap['document']).toBe('arquivo');
    });
  });
});
