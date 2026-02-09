/**
 * Teste para validar configuração de EVOLUTION_API_URL
 * Garante que a URL pública está configurada (não localhost)
 */

import { describe, it, expect } from 'vitest';
import { getEvolutionApi } from './evolutionApi';

describe('Evolution API - Configuração de URL Pública', () => {
  it('deve estar configurada com URL pública (não localhost)', () => {
    const api = getEvolutionApi();
    
    // Acessar a baseUrl através de uma chamada que falha mas revela a URL
    try {
      // Tentar fazer uma chamada que vai falhar, mas vamos capturar a URL
      const client = (api as any).client;
      const baseUrl = client.defaults.baseURL;
      
      // Validações
      expect(baseUrl).toBeDefined();
      expect(baseUrl).not.toContain('localhost');
      expect(baseUrl).not.toContain('127.0.0.1');
      expect(baseUrl).toMatch(/^https?:\/\//);
      
      console.log(`✅ EVOLUTION_API_URL configurada corretamente: ${baseUrl}`);
    } catch (error) {
      console.error('❌ Erro ao validar URL:', error);
      throw error;
    }
  });

  it('deve ter API Key configurada', () => {
    const apiKey = process.env.EVOLUTION_API_KEY;
    
    expect(apiKey).toBeDefined();
    expect(apiKey).not.toBe('');
    expect(apiKey?.length).toBeGreaterThan(0);
    
    console.log(`✅ EVOLUTION_API_KEY configurada (${apiKey?.length} caracteres)`);
  });

  it('deve usar HTTPS para URL pública', () => {
    const baseUrl = process.env.EVOLUTION_API_URL || 'http://localhost:8080';
    
    if (baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1')) {
      console.warn('⚠️ URL é localhost (aceitável apenas em desenvolvimento)');
    } else {
      expect(baseUrl).toMatch(/^https:\/\//);
      console.log(`✅ URL pública usa HTTPS: ${baseUrl}`);
    }
  });

  it('não deve conter porta padrão na URL pública', () => {
    const baseUrl = process.env.EVOLUTION_API_URL || '';
    
    // URL pública não deve expor porta
    if (baseUrl.includes('trycloudflare.com') || baseUrl.includes('tunnel')) {
      expect(baseUrl).not.toMatch(/:8080|:8083|:3000/);
      console.log(`✅ URL pública sem porta exposta: ${baseUrl}`);
    }
  });
});
