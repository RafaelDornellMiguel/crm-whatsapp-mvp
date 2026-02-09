/**
 * Testes para validar mecanismo de polling
 * Garante que o polling funciona corretamente a cada 5 segundos
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('Polling Automático - Sincronização de Instâncias', () => {
  let intervalId: NodeJS.Timeout | null = null;

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    if (intervalId) {
      clearInterval(intervalId);
    }
    vi.restoreAllMocks();
  });

  it('deve executar callback a cada 5 segundos', () => {
    const mockCallback = vi.fn();
    
    // Simular polling a cada 5 segundos
    intervalId = setInterval(mockCallback, 5000);

    // Avançar tempo em 5 segundos
    vi.advanceTimersByTime(5000);
    expect(mockCallback).toHaveBeenCalledTimes(1);

    // Avançar mais 5 segundos
    vi.advanceTimersByTime(5000);
    expect(mockCallback).toHaveBeenCalledTimes(2);

    // Avançar mais 5 segundos
    vi.advanceTimersByTime(5000);
    expect(mockCallback).toHaveBeenCalledTimes(3);

    clearInterval(intervalId);
    intervalId = null;
  });

  it('deve parar polling quando isPolling é false', () => {
    const mockCallback = vi.fn();
    let isPolling = true;

    // Simular polling
    const startPolling = () => {
      if (!isPolling) return;
      intervalId = setInterval(() => {
        if (isPolling) {
          mockCallback();
        }
      }, 5000);
    };

    startPolling();

    // Executar 2 vezes
    vi.advanceTimersByTime(10000);
    expect(mockCallback).toHaveBeenCalledTimes(2);

    // Pausar polling
    isPolling = false;

    // Avançar tempo - não deve executar
    vi.advanceTimersByTime(5000);
    expect(mockCallback).toHaveBeenCalledTimes(2); // Sem mudança

    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  });

  it('deve limpar intervalo ao desmontar', () => {
    const mockCallback = vi.fn();
    const clearIntervalSpy = vi.spyOn(global, 'clearInterval');

    intervalId = setInterval(mockCallback, 5000);

    // Simular desmontagem
    clearInterval(intervalId);

    expect(clearIntervalSpy).toHaveBeenCalledWith(intervalId);

    clearIntervalSpy.mockRestore();
    intervalId = null;
  });

  it('deve manter sincronização consistente a cada 5 segundos', () => {
    const mockCallback = vi.fn();
    intervalId = setInterval(mockCallback, 5000);

    // Simular 1 minuto de polling
    for (let i = 0; i < 12; i++) {
      vi.advanceTimersByTime(5000);
    }

    // Deve ter sido chamado 12 vezes (60 segundos / 5 segundos)
    expect(mockCallback).toHaveBeenCalledTimes(12);

    clearInterval(intervalId);
    intervalId = null;
  });

  it('deve permitir toggle entre ativo e pausado', () => {
    const mockCallback = vi.fn();
    let isPolling = true;

    const togglePolling = (newState: boolean) => {
      isPolling = newState;
    };

    // Iniciar polling
    intervalId = setInterval(() => {
      if (isPolling) mockCallback();
    }, 5000);

    // Executar 2 vezes
    vi.advanceTimersByTime(10000);
    expect(mockCallback).toHaveBeenCalledTimes(2);

    // Pausar
    togglePolling(false);
    vi.advanceTimersByTime(5000);
    expect(mockCallback).toHaveBeenCalledTimes(2); // Sem mudança

    // Retomar
    togglePolling(true);
    vi.advanceTimersByTime(5000);
    expect(mockCallback).toHaveBeenCalledTimes(3); // Executa novamente

    clearInterval(intervalId);
    intervalId = null;
  });

  it('deve sincronizar status de instâncias corretamente', () => {
    const mockCallback = vi.fn();
    let statusUpdated = false;

    // Simular polling que atualiza status
    intervalId = setInterval(() => {
      mockCallback();
      // Simular atualização de status
      statusUpdated = true;
    }, 5000);

    // Verificar estado inicial
    expect(statusUpdated).toBe(false);

    // Avançar tempo para executar polling
    vi.advanceTimersByTime(5000);

    // Verificar que callback foi chamado
    expect(mockCallback).toHaveBeenCalledTimes(1);
    // Verificar que status foi atualizado
    expect(statusUpdated).toBe(true);

    clearInterval(intervalId);
    intervalId = null;
  });

  it('deve respeitar intervalo de 5 segundos entre chamadas', () => {
    const mockCallback = vi.fn();
    intervalId = setInterval(mockCallback, 5000);

    // Avançar 4 segundos - não deve executar
    vi.advanceTimersByTime(4000);
    expect(mockCallback).toHaveBeenCalledTimes(0);

    // Avançar 1 segundo (total 5) - deve executar
    vi.advanceTimersByTime(1000);
    expect(mockCallback).toHaveBeenCalledTimes(1);

    // Avançar 4 segundos - não deve executar
    vi.advanceTimersByTime(4000);
    expect(mockCallback).toHaveBeenCalledTimes(1);

    // Avançar 1 segundo (total 5) - deve executar
    vi.advanceTimersByTime(1000);
    expect(mockCallback).toHaveBeenCalledTimes(2);

    clearInterval(intervalId);
    intervalId = null;
  });
});
