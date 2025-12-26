-- Migration para normalizar status de carregamentos
-- Corrige status antigos para os padrões corretos

-- Garantir que o banco está usando UTF-8
SET client_encoding = 'UTF8';

-- Corrigir status 'stand-by' para 'standby'
UPDATE carregamentos
SET status = 'standby'
WHERE status = 'stand-by';

-- Corrigir status 'concluido' para 'finalizado'
UPDATE carregamentos
SET status = 'finalizado'
WHERE status = 'concluido';

-- Corrigir status 'pendente' para 'standby' (se houver)
UPDATE carregamentos
SET status = 'standby'
WHERE status = 'pendente';

-- Verificar e reportar quantos registros foram corrigidos
DO $$
DECLARE
  stand_by_count INTEGER;
  concluido_count INTEGER;
  pendente_count INTEGER;
  total_corrigido INTEGER;
BEGIN
  SELECT COUNT(*) INTO stand_by_count FROM carregamentos WHERE status = 'stand-by';
  SELECT COUNT(*) INTO concluido_count FROM carregamentos WHERE status = 'concluido';
  SELECT COUNT(*) INTO pendente_count FROM carregamentos WHERE status = 'pendente';
  
  total_corrigido := stand_by_count + concluido_count + pendente_count;
  
  IF total_corrigido > 0 THEN
    RAISE NOTICE 'Ainda existem % carregamentos com status antigos:', total_corrigido;
    RAISE NOTICE '  - stand-by: %', stand_by_count;
    RAISE NOTICE '  - concluido: %', concluido_count;
    RAISE NOTICE '  - pendente: %', pendente_count;
  ELSE
    RAISE NOTICE 'Todos os status foram normalizados com sucesso!';
  END IF;
END $$;

-- Verificar distribuição final de status
DO $$
DECLARE
  rec RECORD;
BEGIN
  RAISE NOTICE 'Distribuição final de status:';
  FOR rec IN 
    SELECT status, COUNT(*) as total
    FROM carregamentos
    GROUP BY status
    ORDER BY status
  LOOP
    RAISE NOTICE '  - %: %', rec.status, rec.total;
  END LOOP;
END $$;

-- Comentário
COMMENT ON COLUMN carregamentos.status IS 'Status do carregamento: standby, finalizado ou cancelado';


