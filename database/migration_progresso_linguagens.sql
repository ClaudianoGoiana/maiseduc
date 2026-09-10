-- =========================================================
-- Migration: Sincronização de Progresso de Linguagens e XP
-- Sistema Cidadão Digital - MaisEduc
-- =========================================================

-- 1. Garantir que as colunas de XP suportem casas decimais (ex: 11.8)
ALTER TABLE alunos 
  MODIFY COLUMN xp_etica DECIMAL(10,1) NOT NULL DEFAULT 0.0,
  MODIFY COLUMN xp_logica DECIMAL(10,1) NOT NULL DEFAULT 0.0,
  MODIFY COLUMN xp_seguranca DECIMAL(10,1) NOT NULL DEFAULT 0.0;

-- 2. Adicionar coluna dedicada para XP de linguagens (caso não exista)
-- Se o MySQL for 8.0.29+, suporta ADD COLUMN IF NOT EXISTS.
-- Em versões anteriores, execute a linha abaixo diretamente:
ALTER TABLE alunos 
  ADD COLUMN xp_linguagens DECIMAL(10,1) NOT NULL DEFAULT 0.0 AFTER xp_seguranca;

-- 3. Tabela para registrar o progresso por módulo das trilhas de linguagens
CREATE TABLE IF NOT EXISTS progresso_linguagens (
  id_progresso_linguagem INT AUTO_INCREMENT PRIMARY KEY,
  id_aluno INT NOT NULL,
  linguagem VARCHAR(30) NOT NULL,
  id_modulo VARCHAR(100) NOT NULL,
  missoes_concluidas TINYINT UNSIGNED NOT NULL DEFAULT 0,
  nota_modulo DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  vezes_concluido INT UNSIGNED NOT NULL DEFAULT 0,
  atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_aluno_linguagem_modulo (id_aluno, linguagem, id_modulo),
  CONSTRAINT fk_progresso_linguagens_aluno
    FOREIGN KEY (id_aluno) REFERENCES alunos(id_aluno) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 4. Tabela de auditoria pedagógica para cada missão resolvida pelo aluno
CREATE TABLE IF NOT EXISTS log_missoes_linguagens (
  id_log_missao INT AUTO_INCREMENT PRIMARY KEY,
  id_aluno INT NOT NULL,
  linguagem VARCHAR(30) NOT NULL,
  id_modulo VARCHAR(100) NOT NULL,
  numero_missao TINYINT UNSIGNED NOT NULL,
  resposta_escolhida VARCHAR(255) NOT NULL,
  resposta_correta VARCHAR(255) NOT NULL,
  correta BOOLEAN NOT NULL,
  tentativa TINYINT UNSIGNED NOT NULL,
  pontos_obtidos DECIMAL(4,2) NOT NULL DEFAULT 0.00,
  criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_log_missao_aluno_data (id_aluno, criado_em),
  INDEX idx_log_missao_trilha (linguagem, id_modulo, numero_missao),
  CONSTRAINT fk_log_missoes_linguagens_aluno
    FOREIGN KEY (id_aluno) REFERENCES alunos(id_aluno) ON DELETE CASCADE
) ENGINE=InnoDB;
