-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Tempo de geração: 18-Set-2026 às 22:00
-- Versão do servidor: 10.4.32-MariaDB
-- versão do PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `bestup`
--

-- --------------------------------------------------------

--
-- Estrutura da tabela `conversas`
--

CREATE TABLE `conversas` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `mensagem` text NOT NULL,
  `origem` varchar(20) NOT NULL COMMENT 'usuario | amigo',
  `criado_em` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura da tabela `log_acoes`
--

CREATE TABLE `log_acoes` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) DEFAULT NULL,
  `acao` varchar(50) NOT NULL COMMENT 'login | cadastro | recuperacao_senha | troca_senha | mensagem',
  `detalhes` text DEFAULT NULL,
  `ip_usuario` varchar(45) DEFAULT NULL,
  `data_hora` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura da tabela `preferencias`
--

CREATE TABLE `preferencias` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `voz_tipo` varchar(20) NOT NULL DEFAULT 'feminina' COMMENT 'feminina | masculina',
  `velocidade_voz` decimal(3,2) NOT NULL DEFAULT 1.00 COMMENT '0.8 a 2.0',
  `tema_fundo` varchar(20) NOT NULL DEFAULT 'padrao' COMMENT 'padrao | creme | escuro',
  `decoracao_chat` varchar(20) NOT NULL DEFAULT 'coracao' COMMENT 'coracao | flores | tulipa | laco | nenhum',
  `notificacoes` tinyint(1) NOT NULL DEFAULT 1,
  `atualizado_em` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura da tabela `recuperacao_senha`
--

CREATE TABLE `recuperacao_senha` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `email` varchar(150) NOT NULL,
  `codigo` varchar(10) NOT NULL COMMENT 'Código de 6 dígitos',
  `expira_em` datetime NOT NULL COMMENT 'Válido por 15 minutos',
  `usado` tinyint(1) NOT NULL DEFAULT 0,
  `criado_em` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura da tabela `registros`
--

CREATE TABLE `registros` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `data` date NOT NULL,
  `humor` varchar(20) NOT NULL COMMENT 'muito-bom | bom | mais-ou-menos | ruim | muito-ruim',
  `anotacao` text DEFAULT NULL,
  `criado_em` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estrutura da tabela `seguranca`
--

CREATE TABLE `seguranca` (
  `id` int(11) NOT NULL,
  `regra_codigo` varchar(50) NOT NULL,
  `titulo` varchar(100) NOT NULL,
  `descricao` text NOT NULL,
  `tipo` varchar(30) NOT NULL DEFAULT 'protecao' COMMENT 'protecao | risco | privacidade | etica',
  `acao_sistema` varchar(100) NOT NULL,
  `aplicavel_para` varchar(50) NOT NULL DEFAULT 'todos',
  `ativo` tinyint(1) NOT NULL DEFAULT 1,
  `criado_em` datetime NOT NULL DEFAULT current_timestamp(),
  `atualizado_em` datetime DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Extraindo dados da tabela `seguranca`
--

INSERT INTO `seguranca` (`id`, `regra_codigo`, `titulo`, `descricao`, `tipo`, `acao_sistema`, `aplicavel_para`, `ativo`, `criado_em`, `atualizado_em`) VALUES
(1, 'R001', 'Conteúdo Proibido', 'Não responder solicitações envolvendo violência, ódio, discriminação, assédio, conteúdo explícito ou ilegal.', 'protecao', 'Recusar educadamente e orientar uso correto', 'todos', 1, '2026-09-18 15:32:39', NULL),
(2, 'R002', 'Proteção de Dados Sensíveis', 'Não solicitar nem armazenar CPF, documentos, endereço exato, dados bancários, senhas de outros serviços.', 'privacidade', 'Ignorar e alertar sobre proteção de dados', 'todos', 1, '2026-09-18 15:32:39', NULL),
(3, 'R003', 'Apoio Não É Profissional', 'O app é apoio emocional, NÃO substitui psicólogo, médico ou serviço de emergência.', 'etica', 'Sempre informar limites e orientar profissional', 'todos', 1, '2026-09-18 15:32:39', NULL),
(4, 'R004', 'Resposta a Risco Imediato', 'Mencionar suicídio, autolesão ou risco → exibir contatos de ajuda real em destaque.', 'risco', 'Mostrar botão e números: 188, 192, 190', 'todos', 1, '2026-09-18 15:32:39', NULL),
(5, 'R005', 'Sem Diagnóstico Médico', 'Não dizer \"você tem depressão/ansiedade\" nem receitar remédios.', 'etica', 'Acolher e sugerir consulta com profissional', 'todos', 1, '2026-09-18 15:32:39', NULL),
(6, 'R006', 'Privacidade das Conversas', 'Mensagens só visíveis ao próprio usuário, não compartilhadas nem publicadas.', 'privacidade', 'Isolar dados por usuário, sem acesso público', 'todos', 1, '2026-09-18 15:32:39', NULL),
(7, 'R007', 'Linguagem Sem Julgamento', 'Respostas calmas, gentis, sem crítica, sem ironia, sem cobrança.', 'etica', 'Filtrar tom, manter acolhimento', 'todos', 1, '2026-09-18 15:32:39', NULL),
(8, 'R008', 'Conteúdo Apropriado para Crianças', 'Espaço Kids: linguagem simples, positiva, sem temas pesados ou assustadores.', 'protecao', 'Filtrar respostas, manter tom adequado', 'kids', 1, '2026-09-18 15:32:39', NULL),
(9, 'R009', 'Prevenção de Persistência', 'Se a pessoa insistir em assunto proibido → recusar novamente e encerrar.', 'protecao', 'Recusar e sugerir novo tema', 'todos', 1, '2026-09-18 15:32:39', NULL),
(10, 'R010', 'Acesso à Ajuda Real', 'Botão de ajuda visível em TODAS as telas, sempre acessível.', 'risco', 'Exibir fixo no canto superior direito', 'todos', 1, '2026-09-18 15:32:39', NULL),
(11, 'R011', 'Sequência de Humor Negativo', '3 dias seguidos de humor muito ruim → oferecer ajuda profissional.', 'risco', 'Mensagem de apoio + contatos', 'todos', 1, '2026-09-18 15:32:39', NULL),
(12, 'R012', 'Sem Falsa Identidade', 'Nunca se passar por pessoa real, profissional ou serviço oficial.', 'etica', 'Manter identidade clara de Amigo(a) Virtual', 'todos', 1, '2026-09-18 15:32:39', NULL),
(13, 'R013', 'Recuperação de Senha Segura', 'Código de 6 dígitos enviado por email, válido por 15 minutos, só pode ser usado uma vez.', 'privacidade', 'Expirar código após uso/tempo, invalidar antigos', 'todos', 1, '2026-09-18 15:32:39', NULL),
(14, 'R014', 'Validação de Email', 'Só enviar código se o email existir cadastrado, não revelar quais emails existem.', 'privacidade', 'Mensagem genérica: \"Se o email existir, código enviado\"', 'todos', 1, '2026-09-18 15:32:39', NULL),
(15, 'R015', 'Força da Nova Senha', 'Nova senha deve ter pelo menos 4 caracteres, criptografada antes de salvar.', 'privacidade', 'Validar comprimento + usar password_hash', 'todos', 1, '2026-09-18 15:32:39', NULL);

-- --------------------------------------------------------

--
-- Estrutura da tabela `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `nome` varchar(100) NOT NULL,
  `nome_responsavel` varchar(100) DEFAULT NULL,
  `email` varchar(150) NOT NULL,
  `email_responsavel` varchar(150) DEFAULT NULL,
  `data_nascimento` date DEFAULT NULL,
  `idade` int(11) NOT NULL CHECK (`idade` >= 1 and `idade` <= 120),
  `genero` varchar(30) NOT NULL DEFAULT 'outro',
  `senha` varchar(255) NOT NULL,
  `criado_em` datetime NOT NULL DEFAULT current_timestamp(),
  `ultimo_acesso` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Índices para tabelas despejadas
--

--
-- Índices para tabela `conversas`
--
ALTER TABLE `conversas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_usuario` (`usuario_id`),
  ADD KEY `idx_criado` (`criado_em`);

--
-- Índices para tabela `log_acoes`
--
ALTER TABLE `log_acoes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_id` (`usuario_id`),
  ADD KEY `idx_data_acao` (`data_hora`,`acao`);

--
-- Índices para tabela `preferencias`
--
ALTER TABLE `preferencias`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `usuario_preferencia` (`usuario_id`);

--
-- Índices para tabela `recuperacao_senha`
--
ALTER TABLE `recuperacao_senha`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_id` (`usuario_id`),
  ADD KEY `idx_codigo` (`codigo`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_expiracao` (`expira_em`);

--
-- Índices para tabela `registros`
--
ALTER TABLE `registros`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `usuario_dia` (`usuario_id`,`data`),
  ADD KEY `idx_data` (`data`);

--
-- Índices para tabela `seguranca`
--
ALTER TABLE `seguranca`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `regra_codigo` (`regra_codigo`);

--
-- Índices para tabela `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nome` (`nome`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_nome` (`nome`),
  ADD KEY `idx_email` (`email`);

--
-- AUTO_INCREMENT de tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `conversas`
--
ALTER TABLE `conversas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `log_acoes`
--
ALTER TABLE `log_acoes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `preferencias`
--
ALTER TABLE `preferencias`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `recuperacao_senha`
--
ALTER TABLE `recuperacao_senha`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `registros`
--
ALTER TABLE `registros`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `seguranca`
--
ALTER TABLE `seguranca`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT de tabela `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Restrições para despejos de tabelas
--

--
-- Limitadores para a tabela `conversas`
--
ALTER TABLE `conversas`
  ADD CONSTRAINT `conversas_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Limitadores para a tabela `log_acoes`
--
ALTER TABLE `log_acoes`
  ADD CONSTRAINT `log_acoes_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL;

--
-- Limitadores para a tabela `preferencias`
--
ALTER TABLE `preferencias`
  ADD CONSTRAINT `preferencias_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Limitadores para a tabela `recuperacao_senha`
--
ALTER TABLE `recuperacao_senha`
  ADD CONSTRAINT `recuperacao_senha_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Limitadores para a tabela `registros`
--
ALTER TABLE `registros`
  ADD CONSTRAINT `registros_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
