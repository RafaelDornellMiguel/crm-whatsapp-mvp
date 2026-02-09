# TODO - Sistema 100% Real (Sem Mocks)

## Fase 1: Remover Mocks
- [x] Remover localStorage do store.ts
- [x] Remover dados mockados de contatos, mensagens, leads, pedidos
- [x] Remover simulações de envio de mensagem
- [x] Remover QR Code simulado

## Fase 2: Conexões Reais
- [x] Buscar instâncias reais da Evolution API
- [x] Gerar QR Code real funcionando
- [x] Conectar/desconectar números WhatsApp reais
- [x] Exibir status real de conexão

## Fase 2.5: Polling Automático
- [x] Implementar polling a cada 5 segundos
- [x] Sincronizar status das instâncias em tempo real
- [x] Botão para pausar/retomar sincronização
- [x] Indicador visual de sincronização ativa
- [x] Testes vitest para polling (7 testes)

## Fase 3: Chat, Inbox e Leads Reais
- [ ] Carregar conversas reais do banco PostgreSQL
- [ ] Enviar/receber mensagens reais via Evolution API
- [ ] Carregar leads reais do banco
- [ ] Sincronizar contatos reais

## Fase 4: Notificações em Tempo Real
- [ ] WebSocket funcionando
- [ ] Atualizar chat quando nova mensagem chegar
- [ ] Atualizar inbox com novas conversas
- [ ] Notificações visuais no frontend

## Fase 5: Testes e Validação
- [x] Testes de polling (7 testes)
- [x] Testes de configuração de URL pública (4 testes)
- [x] Testes de credenciais Evolution API (2 testes)
- [x] Testes de whatsappRouter (11 testes)
- [ ] Testar envio/recebimento de mensagens
- [ ] Testar criação de leads e pedidos
- [ ] Validar fluxo completo

## Fase 6: Entrega
- [ ] Sistema 100% funcional
- [ ] Sem mocks
- [ ] Tudo real com API e banco
