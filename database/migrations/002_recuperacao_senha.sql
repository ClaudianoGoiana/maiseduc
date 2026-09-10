-- Migration: Adicionar suporte à recuperação de senha para alunos e professores
-- Sistema Cidadão Digital - MaisEduc

ALTER TABLE alunos 
  ADD COLUMN token_recuperacao VARCHAR(64) NULL AFTER senha_hash,
  ADD COLUMN token_expira_em DATETIME NULL AFTER token_recuperacao;

ALTER TABLE professores 
  ADD COLUMN token_recuperacao VARCHAR(64) NULL AFTER senha_hash,
  ADD COLUMN token_expira_em DATETIME NULL AFTER token_recuperacao;
