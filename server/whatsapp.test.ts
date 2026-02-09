/**
 * Testes para whatsappRouter
 * Testa procedures de gerenciamento de instâncias WhatsApp
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { whatsappRouter } from './whatsappRouter';
import { getEvolutionApi } from './evolutionApi';

// Mock da Evolution API
vi.mock('./evolutionApi', () => ({
  getEvolutionApi: vi.fn(),
}));

describe('whatsappRouter', () => {
  let mockApi: any;

  beforeEach(() => {
    mockApi = {
      createInstance: vi.fn(),
      listInstances: vi.fn(),
      connectInstance: vi.fn(),
      deleteInstance: vi.fn(),
      logoutInstance: vi.fn(),
      sendTextMessage: vi.fn(),
      fetchContacts: vi.fn(),
      fetchMessages: vi.fn(),
      markMessageAsRead: vi.fn(),
      setWebhook: vi.fn(),
    };

    vi.mocked(getEvolutionApi).mockReturnValue(mockApi);
  });

  describe('getInstances', () => {
    it('deve retornar lista vazia quando nenhuma instância existe', async () => {
      mockApi.listInstances.mockResolvedValue([]);

      const caller = whatsappRouter.createCaller({
        user: { id: '123', role: 'admin' },
        session: null,
      } as any);

      const result = await caller.getInstances();

      expect(result.instances).toEqual([]);
      expect(mockApi.listInstances).toHaveBeenCalled();
    });

    it('deve retornar instâncias com status correto', async () => {
      mockApi.listInstances.mockResolvedValue([
        {
          instanceName: 'vendedor-1',
          status: 'open',
          createdAt: new Date('2026-02-08'),
        },
        {
          instanceName: 'vendedor-2',
          status: 'close',
          createdAt: new Date('2026-02-07'),
        },
      ]);

      const caller = whatsappRouter.createCaller({
        user: { id: '123', role: 'admin' },
        session: null,
      } as any);

      const result = await caller.getInstances();

      expect(result.instances).toHaveLength(2);
      expect(result.instances[0].instanceName).toBe('vendedor-1');
      expect(result.instances[0].status).toBe('open');
      expect(result.instances[1].instanceName).toBe('vendedor-2');
      expect(result.instances[1].status).toBe('close');
    });

    it('deve converter resposta em formato array ou objeto', async () => {
      // Teste com resposta em formato objeto
      mockApi.listInstances.mockResolvedValue({
        instances: [
          {
            instanceName: 'test',
            status: 'open',
          },
        ],
      });

      const caller = whatsappRouter.createCaller({
        user: { id: '123', role: 'admin' },
        session: null,
      } as any);

      const result = await caller.getInstances();

      expect(result.instances).toHaveLength(1);
      expect(result.instances[0].instanceName).toBe('test');
    });

    it('deve lançar erro quando Evolution API falha', async () => {
      mockApi.listInstances.mockRejectedValue(
        new Error('Conexão recusada')
      );

      const caller = whatsappRouter.createCaller({
        user: { id: '123', role: 'admin' },
        session: null,
      } as any);

      await expect(caller.getInstances()).rejects.toThrow();
    });
  });

  describe('getQRCode', () => {
    it('deve retornar QR Code válido', async () => {
      const qrBase64 = 'data:image/png;base64,iVBORw0KGgo...';
      mockApi.connectInstance.mockResolvedValue({
        base64: qrBase64,
        code: 'TEST_CODE_123',
      });

      const caller = whatsappRouter.createCaller({
        user: { id: '123', role: 'admin' },
        session: null,
      } as any);

      const result = await caller.getQRCode({ instanceName: 'vendedor-1' });

      expect(result.qrCode).toBe(qrBase64);
      expect(result.code).toBe('TEST_CODE_123');
      expect(mockApi.connectInstance).toHaveBeenCalledWith('vendedor-1');
    });

    it('deve lançar erro quando instância não existe', async () => {
      mockApi.connectInstance.mockRejectedValue(
        new Error('Instância não encontrada')
      );

      const caller = whatsappRouter.createCaller({
        user: { id: '123', role: 'admin' },
        session: null,
      } as any);

      await expect(
        caller.getQRCode({ instanceName: 'inexistente' })
      ).rejects.toThrow();
    });

    it('deve validar nome da instância', async () => {
      const caller = whatsappRouter.createCaller({
        user: { id: '123', role: 'admin' },
        session: null,
      } as any);

      await expect(
        caller.getQRCode({ instanceName: '' })
      ).rejects.toThrow();
    });
  });

  describe('createInstance', () => {
    it('deve criar nova instância com sucesso', async () => {
      mockApi.createInstance.mockResolvedValue({
        instanceName: 'vendedor-1',
        status: 'close',
      });

      const caller = whatsappRouter.createCaller({
        user: { id: '123', role: 'admin' },
        session: null,
      } as any);

      const result = await caller.createInstance({
        instanceName: 'vendedor-1',
      });

      expect(result.success).toBe(true);
      expect(mockApi.createInstance).toHaveBeenCalledWith({
        instanceName: 'vendedor-1',
        token: undefined,
        qrcode: true,
      });
    });

    it('deve validar nome da instância', async () => {
      const caller = whatsappRouter.createCaller({
        user: { id: '123', role: 'admin' },
        session: null,
      } as any);

      await expect(
        caller.createInstance({ instanceName: '' })
      ).rejects.toThrow();
    });
  });

  describe('deleteInstance', () => {
    it('deve deletar instância com sucesso', async () => {
      mockApi.deleteInstance.mockResolvedValue({ success: true });

      const caller = whatsappRouter.createCaller({
        user: { id: '123', role: 'admin' },
        session: null,
      } as any);

      const result = await caller.deleteInstance({
        instanceName: 'vendedor-1',
      });

      expect(result.success).toBe(true);
      expect(mockApi.deleteInstance).toHaveBeenCalledWith('vendedor-1');
    });
  });

  describe('logoutInstance', () => {
    it('deve desconectar instância com sucesso', async () => {
      mockApi.logoutInstance.mockResolvedValue({ success: true });

      const caller = whatsappRouter.createCaller({
        user: { id: '123', role: 'admin' },
        session: null,
      } as any);

      const result = await caller.logoutInstance({
        instanceName: 'vendedor-1',
      });

      expect(result.success).toBe(true);
      expect(mockApi.logoutInstance).toHaveBeenCalledWith('vendedor-1');
    });
  });
});
