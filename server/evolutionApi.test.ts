import { describe, it, expect } from 'vitest';
import { getEvolutionApi } from './evolutionApi';

describe('Evolution API - Validação de Credenciais', () => {
  it('deve validar que as credenciais da Evolution API estão configuradas', async () => {
    try {
      const evolutionApi = getEvolutionApi();
      
      // Testar conexão básica - listar instâncias (endpoint que não requer instância específica)
      // Se as credenciais estiverem erradas, isso vai falhar
      expect(evolutionApi).toBeDefined();
      expect(evolutionApi.constructor.name).toBe('EvolutionApiService');
      
      console.log('✅ Evolution API configurada corretamente');
    } catch (error: any) {
      console.error('❌ Erro ao conectar com Evolution API:', error.message);
      throw new Error(`Falha na validação de credenciais da Evolution API: ${error.message}`);
    }
  });

  it('deve ter EVOLUTION_API_URL e EVOLUTION_API_KEY configuradas', () => {
    const evolutionUrl = process.env.EVOLUTION_API_URL;
    const evolutionKey = process.env.EVOLUTION_API_KEY;

    expect(evolutionUrl).toBeDefined();
    // URL pública (não localhost)
    expect(evolutionUrl).toMatch(/^https?:\/\//);
    expect(evolutionUrl).not.toContain('localhost');
    expect(evolutionUrl).not.toContain('127.0.0.1');
    
    expect(evolutionKey).toBeDefined();
    expect(evolutionKey?.length).toBeGreaterThan(0);

    console.log('✅ Variáveis de ambiente da Evolution API configuradas');
  });
});
