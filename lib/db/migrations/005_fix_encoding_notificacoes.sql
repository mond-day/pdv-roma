-- Migration para corrigir encoding UTF-8 nas notificações
-- Esta migração corrige textos que foram salvos com encoding incorreto
-- O problema ocorre quando dados UTF-8 são salvos como Latin1 ou vice-versa

-- Garantir que o banco está usando UTF-8
SET client_encoding = 'UTF8';

-- Verificar encoding do banco
DO $$
DECLARE
  db_encoding TEXT;
BEGIN
  SELECT pg_encoding_to_char(encoding) INTO db_encoding
  FROM pg_database
  WHERE datname = current_database();
  
  IF db_encoding != 'UTF8' THEN
    RAISE WARNING 'O banco de dados está usando encoding % ao invés de UTF8. Isso pode causar problemas.', db_encoding;
  ELSE
    RAISE NOTICE 'Banco de dados está usando UTF8 corretamente.';
  END IF;
END $$;

-- Corrigir títulos e mensagens com encoding incorreto
-- Aplicar múltiplas correções em cascata para garantir que todos os casos sejam corrigidos
DO $$
BEGIN
  -- Corrigir títulos
  UPDATE notificacoes
  SET titulo = 
    REPLACE(
      REPLACE(
        REPLACE(titulo, 'integraÃ§Ã£o', 'integração'),
        'IntegraÃ§Ã£o', 'Integração'
      ),
      'integraÃ§Ã£o', 'integração'
    )
  WHERE titulo LIKE '%Ã§Ã£%' OR titulo LIKE '%Ã§Ã£%';
  
  -- Corrigir mensagens - múltiplas passadas para garantir todas as correções
  UPDATE notificacoes
  SET mensagem = 
    REPLACE(
      REPLACE(
        REPLACE(
          REPLACE(
            REPLACE(
              REPLACE(
                REPLACE(
                  REPLACE(
                    REPLACE(mensagem, 'integraÃ§Ã£o', 'integração'),
                    'IntegraÃ§Ã£o', 'Integração'
                  ),
                  'estÃ¡', 'está'
                ),
                'EstÃ¡', 'Está'
              ),
              'hÃ¡', 'há'
            ),
            'HÃ¡', 'Há'
          ),
          'aguardando integraÃ§Ã£o', 'aguardando integração'
        ),
        'Aguardando integraÃ§Ã£o', 'Aguardando integração'
      ),
      'Carregamento ', 'Carregamento '
    )
  WHERE mensagem LIKE '%Ã§Ã£%' 
     OR mensagem LIKE '%Ã¡%'
     OR mensagem LIKE '%Ã£%';
  
  -- Segunda passada para garantir correções aninhadas
  UPDATE notificacoes
  SET mensagem = 
    REPLACE(
      REPLACE(
        REPLACE(mensagem, 'integraÃ§Ã£o', 'integração'),
        'estÃ¡', 'está'
      ),
      'hÃ¡', 'há'
    )
  WHERE mensagem LIKE '%Ã%';
    
END $$;

-- Verificar e reportar quantas linhas foram corrigidas
DO $$
DECLARE
  corrected_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO corrected_count
  FROM notificacoes
  WHERE titulo LIKE '%Ã%' OR mensagem LIKE '%Ã%';
  
  IF corrected_count > 0 THEN
    RAISE NOTICE 'Ainda existem % notificações com encoding incorreto. Verifique manualmente.', corrected_count;
  ELSE
    RAISE NOTICE 'Todas as notificações foram corrigidas com sucesso!';
  END IF;
END $$;

-- Comentário
COMMENT ON TABLE notificacoes IS 'Tabela de notificações com encoding UTF-8 corrigido';

