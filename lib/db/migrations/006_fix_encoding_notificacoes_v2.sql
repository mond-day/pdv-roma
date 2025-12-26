-- Migration adicional para corrigir encoding UTF-8 nas notificações
-- Esta migração usa uma abordagem diferente para corrigir os dados restantes
-- Tenta converter os dados usando a função convert do PostgreSQL

-- Garantir que o banco está usando UTF-8
SET client_encoding = 'UTF8';

-- Primeiro, vamos ver quais notificações ainda têm problemas
DO $$
DECLARE
  problem_count INTEGER;
  rec RECORD;
BEGIN
  SELECT COUNT(*) INTO problem_count
  FROM notificacoes
  WHERE titulo LIKE '%Ã%' OR mensagem LIKE '%Ã%';
  
  RAISE NOTICE 'Encontradas % notificações com encoding incorreto', problem_count;
  
  -- Tentar corrigir usando múltiplas estratégias
  -- Estratégia 1: Tentar converter de LATIN1 para UTF8 usando convert
  -- Isso funciona se os dados foram salvos como LATIN1 mas deveriam ser UTF8
  FOR rec IN 
    SELECT id, titulo, mensagem
    FROM notificacoes
    WHERE titulo LIKE '%Ã%' OR mensagem LIKE '%Ã%'
  LOOP
    BEGIN
      -- Tentar converter usando convert (LATIN1 -> UTF8)
      UPDATE notificacoes
      SET 
        titulo = convert(convert(titulo, 'UTF8', 'LATIN1'), 'UTF8', 'UTF8'),
        mensagem = convert(convert(mensagem, 'UTF8', 'LATIN1'), 'UTF8', 'UTF8')
      WHERE id = rec.id;
      
      -- Se ainda tiver problemas, tentar substituições mais específicas
      UPDATE notificacoes
      SET 
        titulo = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
          titulo,
          'Ã§', 'ç'),
          'Ã£', 'ã'),
          'Ã¡', 'á'),
          'Ã©', 'é'),
          'Ã­', 'í'),
          'Ã³', 'ó'),
          'Ãº', 'ú'),
          'Ã', 'ã'),
        mensagem = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
          mensagem,
          'Ã§', 'ç'),
          'Ã£', 'ã'),
          'Ã¡', 'á'),
          'Ã©', 'é'),
          'Ã­', 'í'),
          'Ã³', 'ó'),
          'Ãº', 'ú'),
          'Ã', 'ã')
      WHERE id = rec.id 
        AND (titulo LIKE '%Ã%' OR mensagem LIKE '%Ã%');
        
    EXCEPTION WHEN OTHERS THEN
      -- Se a conversão falhar, tentar apenas substituições
      UPDATE notificacoes
      SET 
        titulo = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
          titulo,
          'Ã§', 'ç'),
          'Ã£', 'ã'),
          'Ã¡', 'á'),
          'Ã©', 'é'),
          'Ã­', 'í'),
          'Ã³', 'ó'),
          'Ãº', 'ú'),
          'Ã', 'ã'),
        mensagem = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
          mensagem,
          'Ã§', 'ç'),
          'Ã£', 'ã'),
          'Ã¡', 'á'),
          'Ã©', 'é'),
          'Ã­', 'í'),
          'Ã³', 'ó'),
          'Ãº', 'ú'),
          'Ã', 'ã')
      WHERE id = rec.id;
    END;
  END LOOP;
  
  -- Verificar resultado final
  SELECT COUNT(*) INTO problem_count
  FROM notificacoes
  WHERE titulo LIKE '%Ã%' OR mensagem LIKE '%Ã%';
  
  IF problem_count > 0 THEN
    RAISE NOTICE 'Ainda restam % notificações com encoding incorreto após correção', problem_count;
    RAISE NOTICE 'Essas notificações podem precisar ser deletadas e recriadas manualmente';
  ELSE
    RAISE NOTICE 'Todas as notificações foram corrigidas com sucesso!';
  END IF;
END $$;

-- Exibir exemplos das notificações que ainda têm problemas (se houver)
DO $$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN 
    SELECT id, LEFT(titulo, 50) as titulo, LEFT(mensagem, 50) as mensagem
    FROM notificacoes
    WHERE titulo LIKE '%Ã%' OR mensagem LIKE '%Ã%'
    LIMIT 5
  LOOP
    RAISE NOTICE 'ID: %, Título: %, Mensagem: %', rec.id, rec.titulo, rec.mensagem;
  END LOOP;
END $$;


