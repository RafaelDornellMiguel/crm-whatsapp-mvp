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
- [x] Gerenciar usuários por departamento
- [x] Configurar acessos por departamento
- [x] Visualizar permissões de cada usuário
- [x] Testes de gerenciamento de acessos
- [x] CRUD de departamentos (criar, editar, deletar)
- [x] Página de Gerenciamento de Departamentos
- [x] Atrelar conexões WhatsApp a departamentos

## Fase 12: Autenticação ADM Automática
- [x] Detectar automaticamente se email é ADM
- [x] Liberar acesso ao Gerenciamento apenas para ADM
- [x] Validar role=admin no backend
- [x] Testar acesso restrito

## Fase 13: Painel de Departamentos no Gerenciamento
- [x] CRUD de departamentos (criar, editar, excluir)
- [x] Apenas gestor pode gerenciar
- [x] Listar departamentos com usuários
- [x] Atrelar usuários a departamentos
- [x] Testes de gerenciamento

## Fase 14: Atrelar Departamentos com Conexões WhatsApp
- [x] Adicionar campo departamento_id em conexões
- [x] Atrelar cada conexão a um departamento
- [x] Listar conexões por departamento
- [x] Validar permissão de acesso
- [x] Testes de atrelamento

## Fase 15: Correção Evolution API
- [x] QR Code gerando corretamente
- [x] Sincronização de instâncias em tempo real
- [x] Sincronização de contatos do WhatsApp
- [x] Webhooks configurados e funcionando
- [x] Conexão em tempo real via polling
- [x] Tudo 100% real com API e banco de dados
- [x] 40 testes passando

## SISTEMA 100% FUNCIONAL E REAL ✅
- [x] QR Code real funcionando
- [x] Sincronização de contatos real
- [x] Webhooks reais
- [x] Sistema de departamentos completo
- [x] Dashboard com gráficos (Chat, Inbox, Leads)
- [x] Tudo conectado com banco de dados real (PostgreSQL)
- [x] Sem mocks - 100% real e funcional
- [x] Menu lateral responsivo
- [x] Login com Google OAuth
- [x] Autenticação inteligente por email
- [x] Controle de acesso (admin only)
- [x] Integração Evolution API 100% funcional

## Fase 16: Webhooks da Evolution API
- [x] Criar endpoint /api/webhook para receber eventos
- [x] Implementar handlers para mensagens
- [x] Implementar handlers para contatos
- [x] Implementar handlers para status de conexão
- [x] Registrar webhooks nas instâncias
- [x] Integrar WebSocket para notificar frontend
- [x] Testes de webhooks (8 testes)
- [x] webhookRouter com procedures tRPC
- [x] Sincronização automática de contatos
- [x] Sincronização automática de status de conexão

## Fase 17: Envio de Mensagens Real
- [x] Adicionar métodos de envio no EvolutionApiService
- [x] Criar procedures tRPC para enviar mensagens
- [x] Envio de texto (sendMessage)
- [x] Envio de mídia - imagem, vídeo, áudio, documento (sendMediaMessage)
- [x] Tratamento de erros e feedback visual
- [x] Testes de envio de mensagens (14 testes)
- [x] Sincronização com banco de dados (PostgreSQL)
- [x] Tudo 100% real com Evolution API

## Fase 18: Interface de Envio no Chat
- [x] Refatorar página Chat com histórico de mensagens
- [x] Campo de texto para digitar mensagens
- [x] Botão de enviar com ícone
- [x] Botão de anexar mídia
- [x] Indicador de digitação (3 pontinhos animados)
- [x] Feedback visual (enviado ✓, entregue ✓✓, lido)
- [x] Upload de imagem, vídeo, áudio, documento
- [x] Preview de mídia antes de enviar
- [x] Auto scroll para última mensagem
- [x] Design moderno e responsivo
- [x] Integração com Evolution API real
