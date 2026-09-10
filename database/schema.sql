-- Banco de Dados: cidadao_digital_game
-- Engine: InnoDB | Charset: utf8mb4

-- Selecione/crie o banco no phpMyAdmin antes de importar este arquivo.
-- A Hostinger restringe a criação de bancos ao painel de hospedagem.

-- =========================================================
-- Tabela: professores
-- =========================================================
CREATE TABLE IF NOT EXISTS professores (
  id_professor       INT AUTO_INCREMENT PRIMARY KEY,
  nome               VARCHAR(120) NOT NULL,
  email              VARCHAR(150) NOT NULL UNIQUE,
  senha_hash         VARCHAR(255) NOT NULL, -- password_hash() (bcrypt/argon2)
  token_recuperacao  VARCHAR(64) NULL,
  token_expira_em    DATETIME NULL,
  escola             VARCHAR(150),
  criado_em          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =========================================================
-- Tabela: turmas (liga alunos a um professor/sala)
-- =========================================================
CREATE TABLE IF NOT EXISTS turmas (
  id_turma           INT AUTO_INCREMENT PRIMARY KEY,
  id_professor       INT NOT NULL,
  nome_turma         VARCHAR(100) NOT NULL,
  codigo_acesso      VARCHAR(20) NOT NULL UNIQUE, -- código que o aluno usa para entrar
  criado_em          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_professor) REFERENCES professores(id_professor)
    ON DELETE CASCADE
) ENGINE=InnoDB;

-- =========================================================
-- Tabela: alunos
-- =========================================================
CREATE TABLE IF NOT EXISTS alunos (
  id_aluno           INT AUTO_INCREMENT PRIMARY KEY,
  id_turma           INT NULL,
  nome               VARCHAR(120) NOT NULL,
  email              VARCHAR(150) NOT NULL UNIQUE,
  whatsapp           VARCHAR(20) NULL,
  senha_hash         VARCHAR(255) NOT NULL,
  token_recuperacao  VARCHAR(64) NULL,
  token_expira_em    DATETIME NULL,
  avatar             VARCHAR(50) DEFAULT 'hacker_default',
  xp_etica           DECIMAL(10,1) NOT NULL DEFAULT 0.0,
  xp_logica          DECIMAL(10,1) NOT NULL DEFAULT 0.0,
  xp_seguranca       DECIMAL(10,1) NOT NULL DEFAULT 0.0,
  xp_linguagens      DECIMAL(10,1) NOT NULL DEFAULT 0.0,
  nivel              INT DEFAULT 1,
  criado_em          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_turma) REFERENCES turmas(id_turma)
    ON DELETE SET NULL
) ENGINE=InnoDB;

-- =========================================================
-- Tabela: progresso_linguagens (progresso no jogo de linguagens por card/módulo)
-- =========================================================
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

-- =========================================================
-- Tabela: log_missoes_linguagens (histórico pedagógico de cada questão de linguagem)
-- =========================================================
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

-- =========================================================
-- Tabela: fases (catálogo estático das fases do jogo)
-- =========================================================
CREATE TABLE IF NOT EXISTS fases (
  id_fase            INT AUTO_INCREMENT PRIMARY KEY,
  codigo             VARCHAR(50) NOT NULL UNIQUE, -- ex: 'fase_1_bolha'
  titulo             VARCHAR(150) NOT NULL,
  competencia_bncc   VARCHAR(255), -- referência curricular ligada ao livro
  ordem              INT NOT NULL
) ENGINE=InnoDB;

-- =========================================================
-- Tabela: progresso_fases (estado de cada aluno em cada fase)
-- =========================================================
CREATE TABLE IF NOT EXISTS progresso_fases (
  id_progresso       INT AUTO_INCREMENT PRIMARY KEY,
  id_aluno           INT NOT NULL,
  id_fase            INT NOT NULL,
  status             ENUM('nao_iniciado','em_andamento','concluido') DEFAULT 'nao_iniciado',
  pontuacao_fase     INT DEFAULT 0,
  tentativas         INT DEFAULT 0,
  iniciado_em        TIMESTAMP NULL,
  concluido_em       TIMESTAMP NULL,
  UNIQUE KEY uq_aluno_fase (id_aluno, id_fase),
  FOREIGN KEY (id_aluno) REFERENCES alunos(id_aluno) ON DELETE CASCADE,
  FOREIGN KEY (id_fase) REFERENCES fases(id_fase) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =========================================================
-- Tabela: log_decisoes (rastreabilidade pedagógica p/ o professor)
-- Cada escolha do aluno em um dilema narrativo é registrada aqui.
-- =========================================================
CREATE TABLE IF NOT EXISTS log_decisoes (
  id_log             INT AUTO_INCREMENT PRIMARY KEY,
  id_aluno           INT NOT NULL,
  id_fase            INT NOT NULL,
  id_decisao         VARCHAR(50) NOT NULL,      -- ex: 'fase1_escolha_b'
  categoria          ENUM('etica','logica','seguranca') NOT NULL,
  classificacao      ENUM('correta','neutra','catastrofica') NOT NULL,
  pontos_ganhos      INT NOT NULL DEFAULT 0,
  texto_escolha      VARCHAR(255) NOT NULL,     -- snapshot do texto exibido ao aluno
  feedback_exibido   TEXT,                      -- snapshot do feedback dado
  criado_em          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_aluno) REFERENCES alunos(id_aluno) ON DELETE CASCADE,
  FOREIGN KEY (id_fase) REFERENCES fases(id_fase) ON DELETE CASCADE,
  INDEX idx_professor_analise (id_fase, classificacao)
) ENGINE=InnoDB;

-- =========================================================
-- Tabela: perfil_aluno (análise de tipo de cidadão digital ao longo do jogo)
-- Rastreia a evolução do perfil do aluno a cada milestone (ex: a cada 5 fases)
-- =========================================================
CREATE TABLE IF NOT EXISTS perfil_aluno (
  id_perfil          INT AUTO_INCREMENT PRIMARY KEY,
  id_aluno           INT NOT NULL,
  fase_alcancada     INT NOT NULL,                -- em qual fase o perfil foi calculated
  tipo_aluno         VARCHAR(50) NOT NULL,       -- critico, etico, ativista, hacker, engenheiro, passivo, pragmatico, investigador
  confianca_score    INT DEFAULT 0,              -- 0-100, quanto o tipo dominante diferencia dos outros
  score_critico      INT DEFAULT 0,
  score_passivo      INT DEFAULT 0,
  score_etico        INT DEFAULT 0,
  score_pragmatico   INT DEFAULT 0,
  score_investigador INT DEFAULT 0,
  score_ativista     INT DEFAULT 0,
  score_hacker       INT DEFAULT 0,
  score_engenheiro   INT DEFAULT 0,
  criado_em          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_aluno) REFERENCES alunos(id_aluno) ON DELETE CASCADE,
  INDEX idx_aluno_fase (id_aluno, fase_alcancada)
) ENGINE=InnoDB;

-- =========================================================
-- Tabela: recomendacoes_professor (insights pedagógicos para o professor)
-- O sistema gera insights baseado no perfil do aluno
-- =========================================================
CREATE TABLE IF NOT EXISTS recomendacoes_professor (
  id_recomendacao    INT AUTO_INCREMENT PRIMARY KEY,
  id_aluno           INT NOT NULL,
  id_professor       INT,
  tipo_aluno         VARCHAR(50),
  recomendacao_texto TEXT,
  risco_desvio       VARCHAR(150),     -- ex: "Paralisia analítica", "Ativismo impulsivo"
  sugestao_estrategia VARCHAR(255),    -- ex: "Debates estruturados", "Projetos de impacto social"
  criado_em          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_aluno) REFERENCES alunos(id_aluno) ON DELETE CASCADE,
  FOREIGN KEY (id_professor) REFERENCES professores(id_professor) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Seed de 20 fases (Unidade I a V)
INSERT IGNORE INTO fases (codigo, titulo, competencia_bncc, ordem) VALUES
('fase_1_bolha', 'Prisioneiro da Bolha', 'Cidadania Digital / Letramento Informacional', 1),
('fase_2_manchetes', 'Verdadeiro ou Falso?', 'Pensamento Crítico', 2),
('fase_3_engajamento', 'Algoritmo de Engajamento', 'Pensamento Computacional - Decomposição', 3),
('fase_4_bolha_boss', 'Confronto: ECO-9 Desperta', 'Cidadania Digital', 4),
('fase_5_viés', 'Reconhecimento Facial Enviesado', 'Justiça e Equidade Digital', 5),
('fase_6_dataset', 'Análise de Dataset Enviesado', 'Pensamento Crítico - Padrões', 6),
('fase_7_algoritmo_justo', 'Desenhando um Algoritmo Justo', 'Pensamento Computacional - Abstração', 7),
('fase_8_viés_boss', 'Dilema da IA: Lucro vs Justiça', 'Ética Computacional', 8),
('fase_9_deepfake', 'Vídeo Deepfake Viral', 'Letramento de Mídia', 9),
('fase_10_artefatos_gan', 'Detectando Artefatos de GAN', 'Pensamento Crítico - Análise Visual', 10),
('fase_11_deteccao_forensica', 'Análise Forense Digital', 'Pensamento Computacional - Algoritmos', 11),
('fase_12_deepfake_boss', 'Guerra de Informação: Qual é a Verdade?', 'Cidadania Digital Avançada', 12),
('fase_13_privacidade', 'Rastreamento: Você está sendo Vigiado', 'Privacidade Digital', 13),
('fase_14_senha_fraca', 'Quebrando Senhas Fracas', 'Pensamento Computacional - Padrões', 14),
('fase_15_criptografia', 'Cifra de César → Criptografia Moderna', 'Pensamento Computacional - Algoritmos', 15),
('fase_16_privacidade_boss', 'Segredo Perigoso: Guardião de Dados', 'Ética de Dados', 16),
('fase_17_monopolio_tech', 'Monopólio das Big Techs', 'Pensamento Crítico - Estruturas de Poder', 17),
('fase_18_teia_corporativa', 'Conectando a Teia de Poder', 'Pensamento Crítico - Análise Sistêmica', 18),
('fase_19_codigo_aberto', 'Software Livre vs Proprietário', 'Pensamento Computacional - Escolha Consciente', 19),
('fase_20_final_boss', 'O Grande Dilema: ECO-9 Oferece um Trato', 'Síntese: Cidadania Digital', 20);
