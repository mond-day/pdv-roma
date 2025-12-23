-- Migration para corrigir encoding UTF-8 nas notificações
-- Esta migração corrige textos que foram salvos com encoding incorreto

-- Corrigir títulos e mensagens com encoding incorreto
UPDATE notificacoes
SET 
  titulo = CASE
    WHEN titulo LIKE '%integraÃ§Ã£o%' THEN REPLACE(titulo, 'integraÃ§Ã£o', 'integração')
    WHEN titulo LIKE '%IntegraÃ§Ã£o%' THEN REPLACE(titulo, 'IntegraÃ§Ã£o', 'Integração')
    ELSE titulo
  END,
  mensagem = CASE
    WHEN mensagem LIKE '%integraÃ§Ã£o%' THEN REPLACE(mensagem, 'integraÃ§Ã£o', 'integração')
    WHEN mensagem LIKE '%IntegraÃ§Ã£o%' THEN REPLACE(mensagem, 'IntegraÃ§Ã£o', 'Integração')
    WHEN mensagem LIKE '%estÃ¡%' THEN REPLACE(mensagem, 'estÃ¡', 'está')
    WHEN mensagem LIKE '%EstÃ¡%' THEN REPLACE(mensagem, 'EstÃ¡', 'Está')
    WHEN mensagem LIKE '%hÃ¡%' THEN REPLACE(mensagem, 'hÃ¡', 'há')
    WHEN mensagem LIKE '%HÃ¡%' THEN REPLACE(mensagem, 'HÃ¡', 'Há')
    WHEN mensagem LIKE '%aguardando integraÃ§Ã£o%' THEN REPLACE(mensagem, 'aguardando integraÃ§Ã£o', 'aguardando integração')
    WHEN mensagem LIKE '%Aguardando integraÃ§Ã£o%' THEN REPLACE(mensagem, 'Aguardando integraÃ§Ã£o', 'Aguardando integração')
    ELSE mensagem
  END
WHERE 
  titulo LIKE '%Ã§Ã£%' 
  OR mensagem LIKE '%Ã§Ã£%'
  OR mensagem LIKE '%Ã¡%';

-- Comentário
COMMENT ON TABLE notificacoes IS 'Tabela de notificações com encoding UTF-8 corrigido';

