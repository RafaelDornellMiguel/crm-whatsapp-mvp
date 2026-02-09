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
- [x] Carregar conversas reais do banco PostgreSQL
- [x] Enviar/receber mensagens reais via Evolution API
- [x] Carregar leads reais do banco
- [x] Sincronizar contatos reais
- [x] Procedures tRPC para Chat, Inbox e Leads
- [x] Páginas React com UI moderna e responsiva

## Fase 4: Notificações em Tempo Real
- [x] WebSocket funcionando
- [x] Atualizar chat quando nova mensagem chegar
- [x] Atualizar inbox com novas conversas
- [x] Notificações visuais no frontend
- [x] Hook useWebSocket para conexão em tempo real
- [x] Eventos de digitando/parou de digitar

## Fase 5: Testes e Validação
- [x] Testes de polling (7 testes)
- [x] Testes de configuração de URL pública (4 testes)
- [x] Testes de credenciais Evolution API (2 testes)
- [x] Testes de whatsappRouter (11 testes)
- [x] Testes de controle de acesso (15 testes)
- [x] Testar envio/recebimento de mensagens
- [x] Testar criação de leads e pedidos
- [x] Validar fluxo completo

## Fase 6: Entrega
- [x] Sistema 100% funcional
- [x] Sem mocks
- [x] Tudo real com API e banco

## Fase 7: Controle de Acesso
- [x] Apenas Gerentes e Donos podem acessar Dashboard
- [x] Apenas Gerentes e Donos podem acessar Inbox/Chat
- [x] Apenas Gerentes e Donos podem acessar Leads
- [x] Apenas Gerentes e Donos podem acessar Conexões
- [x] Redirecionamento automático para usuários sem permissão
- [x] Testes de controle de acesso

## SISTEMA 100% COMPLETO ✅
- [x] Todas as fases implementadas
- [x] 40 testes passando
- [x] Sem mocks - tudo real com API e banco
- [x] WebSocket para notificações em tempo real
- [x] Controle de acesso (admin only)
- [x] UI/UX moderna e responsiva
- [x] Integração Evolution API 100% funcional



## Fase 8: Menu Lateral Responsivo
- [x] Refatorar menu lateral com scroll
- [x] Design responsivo e bonito
- [x] Animações suaves
- [x] Indicador de página ativa
- [x] Agrupamento por seção (Comunicação, Vendas, Operações, Administração)

## Fase 9: Login com Google OAuth
- [x] Página de login inspirada na imagem
- [x] Integração Google OAuth (já existente)
- [x] Redirecionamento automático após login
- [x] Logout funcional
- [x] Design moderno com gradiente

## Fase 10: Autenticação Inteligente por Email
- [x] Detectar email do Google
- [x] Configurar automaticamente role/departamento
- [x] Sistema de mapeamento email->departamento
- [x] Testes de autenticação
- [x] emailAuthRouter com procedures tRPC

## Fase 11: Painel Admin de Departamentos
- [ ] Gerenciar usuários por departamento
- [ ] Configurar acessos por departamento
- [ ] Visualizar permissões de cada usuário
- [ ] Testes de gerenciamento de acessos

## SISTEMA COMPLETO COM LOGIN E AUTENTICAÇÃO ✅
- [x] Menu lateral responsivo e bonito
- [x] Página de Login com Google OAuth
- [x] Autenticação inteligente por email
- [x] Configuração automática de role/departamento
- [x] 40 testes passando
- [x] WebSocket para notificações em tempo real
- [x] Controle de acesso (admin only)
- [x] Integração Evolution API 100% funcional
