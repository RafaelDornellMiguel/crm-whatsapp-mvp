-- ============================================
-- ADICIONAR TABELA DE DEPARTAMENTOS
-- ============================================

-- Criar tabela de departamentos
CREATE TABLE IF NOT EXISTS `departamentos` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `tenantId` INT NOT NULL,
  `nome` VARCHAR(100) NOT NULL,
  `descricao` TEXT,
  `cor` VARCHAR(7) DEFAULT '#3B82F6',
  `ativo` BOOLEAN DEFAULT true NOT NULL,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  UNIQUE KEY `unique_tenant_nome` (`tenantId`, `nome`),
  FOREIGN KEY (`tenantId`) REFERENCES `empresas`(`id`) ON DELETE CASCADE
);

-- Adicionar coluna departamento_id na tabela de usuários
ALTER TABLE `users` ADD COLUMN `departamentoId` INT AFTER `setor`;
ALTER TABLE `users` ADD FOREIGN KEY (`departamentoId`) REFERENCES `departamentos`(`id`) ON DELETE SET NULL;

-- Adicionar coluna departamento_id na tabela de números WhatsApp
ALTER TABLE `numeros_whatsapp` ADD COLUMN `departamentoId` INT AFTER `vendedorId`;
ALTER TABLE `numeros_whatsapp` ADD FOREIGN KEY (`departamentoId`) REFERENCES `departamentos`(`id`) ON DELETE SET NULL;

-- Adicionar coluna departamento_id na tabela de mensagens
ALTER TABLE `mensagens` ADD COLUMN `departamentoId` INT AFTER `tenantId`;
ALTER TABLE `mensagens` ADD FOREIGN KEY (`departamentoId`) REFERENCES `departamentos`(`id`) ON DELETE SET NULL;

-- Adicionar coluna departamento_id na tabela de pedidos
ALTER TABLE `pedidos` ADD COLUMN `departamentoId` INT AFTER `tenantId`;
ALTER TABLE `pedidos` ADD FOREIGN KEY (`departamentoId`) REFERENCES `departamentos`(`id`) ON DELETE SET NULL;

-- Adicionar coluna departamento_id na tabela de contatos
ALTER TABLE `contatos` ADD COLUMN `departamentoId` INT AFTER `tenantId`;
ALTER TABLE `contatos` ADD FOREIGN KEY (`departamentoId`) REFERENCES `departamentos`(`id`) ON DELETE SET NULL;

-- Criar índices para performance
CREATE INDEX `idx_departamentos_tenant` ON `departamentos`(`tenantId`);
CREATE INDEX `idx_users_departamento` ON `users`(`departamentoId`);
CREATE INDEX `idx_numeros_whatsapp_departamento` ON `numeros_whatsapp`(`departamentoId`);
CREATE INDEX `idx_mensagens_departamento` ON `mensagens`(`departamentoId`);
CREATE INDEX `idx_pedidos_departamento` ON `pedidos`(`departamentoId`);
CREATE INDEX `idx_contatos_departamento` ON `contatos`(`departamentoId`);
