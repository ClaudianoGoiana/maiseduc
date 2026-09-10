-- Execute uma única vez em bancos de dados criados antes desta alteração.
ALTER TABLE alunos
  ADD COLUMN whatsapp VARCHAR(20) NULL AFTER email;