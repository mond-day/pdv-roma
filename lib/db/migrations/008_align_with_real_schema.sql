-- Migration para alinhar schema local com schema real do banco de produção
-- Baseado em docs/pdv_schema.sql

-- 1. Adicionar colunas faltantes em carregamentos (se não existirem)
DO $$
BEGIN
  -- Adicionar detalhes_produto se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'carregamentos' AND column_name = 'detalhes_produto') THEN
    ALTER TABLE carregamentos ADD COLUMN detalhes_produto TEXT;
  END IF;

  -- Adicionar tara_total se não existir (em gramas, NUMERIC)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'carregamentos' AND column_name = 'tara_total') THEN
    ALTER TABLE carregamentos ADD COLUMN tara_total NUMERIC(12,3);
  END IF;

  -- Adicionar peso_final_total se não existir (em gramas, NUMERIC)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'carregamentos' AND column_name = 'peso_final_total') THEN
    ALTER TABLE carregamentos ADD COLUMN peso_final_total NUMERIC(12,3);
  END IF;

  -- Adicionar peso_final_eixos se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'carregamentos' AND column_name = 'peso_final_eixos') THEN
    ALTER TABLE carregamentos ADD COLUMN peso_final_eixos JSONB;
  END IF;

  -- Renomear tara_eixos_kg para tara_eixos se necessário
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_name = 'carregamentos' AND column_name = 'tara_eixos_kg') THEN
    ALTER TABLE carregamentos RENAME COLUMN tara_eixos_kg TO tara_eixos;
  ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'carregamentos' AND column_name = 'tara_eixos') THEN
    ALTER TABLE carregamentos ADD COLUMN tara_eixos JSONB;
  END IF;

  -- Renomear final_eixos_kg para peso_final_eixos se necessário
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_name = 'carregamentos' AND column_name = 'final_eixos_kg') THEN
    ALTER TABLE carregamentos RENAME COLUMN final_eixos_kg TO peso_final_eixos;
  END IF;

  -- Alterar tipo de transportadora_id para BIGINT se necessário
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_name = 'carregamentos' AND column_name = 'transportadora_id' AND data_type = 'integer') THEN
    ALTER TABLE carregamentos ALTER COLUMN transportadora_id TYPE BIGINT;
  ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'carregamentos' AND column_name = 'transportadora_id') THEN
    ALTER TABLE carregamentos ADD COLUMN transportadora_id BIGINT;
  END IF;

  -- Alterar tipo de venda_id para TEXT se necessário
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_name = 'carregamentos' AND column_name = 'venda_id' AND data_type != 'text') THEN
    ALTER TABLE carregamentos ALTER COLUMN venda_id TYPE TEXT USING venda_id::text;
  ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'carregamentos' AND column_name = 'venda_id') THEN
    ALTER TABLE carregamentos ADD COLUMN venda_id TEXT;
  END IF;

  -- Adicionar qtd_desejada se não existir (TEXT, não DECIMAL)
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_name = 'carregamentos' AND column_name = 'qtd_desejada_ton') THEN
    ALTER TABLE carregamentos RENAME COLUMN qtd_desejada_ton TO qtd_desejada;
    ALTER TABLE carregamentos ALTER COLUMN qtd_desejada TYPE TEXT;
  ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'carregamentos' AND column_name = 'qtd_desejada') THEN
    ALTER TABLE carregamentos ADD COLUMN qtd_desejada TEXT;
  END IF;
END $$;

-- 2. Adicionar colunas faltantes em motoristas
DO $$
BEGIN
  -- Adicionar cpf se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'motoristas' AND column_name = 'cpf') THEN
    ALTER TABLE motoristas ADD COLUMN cpf TEXT;
  END IF;

  -- Alterar transportadora_id para TEXT se necessário
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_name = 'motoristas' AND column_name = 'transportadora_id' AND data_type != 'text') THEN
    ALTER TABLE motoristas ALTER COLUMN transportadora_id TYPE TEXT USING transportadora_id::text;
  END IF;
END $$;

-- 3. Adicionar colunas faltantes em transportadoras
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'transportadoras' AND column_name = 'cpf_cnpj') THEN
    ALTER TABLE transportadoras ADD COLUMN cpf_cnpj TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'transportadoras' AND column_name = 'tipo_pessoa') THEN
    ALTER TABLE transportadoras ADD COLUMN tipo_pessoa TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'transportadoras' AND column_name = 'email') THEN
    ALTER TABLE transportadoras ADD COLUMN email TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'transportadoras' AND column_name = 'telefone') THEN
    ALTER TABLE transportadoras ADD COLUMN telefone TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'transportadoras' AND column_name = 'cadastrado_em') THEN
    ALTER TABLE transportadoras ADD COLUMN cadastrado_em TIMESTAMP;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'transportadoras' AND column_name = 'modificado_em') THEN
    ALTER TABLE transportadoras ADD COLUMN modificado_em TIMESTAMP;
  END IF;
END $$;

-- 4. Adicionar colunas faltantes em produtos_venda
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'produtos_venda' AND column_name = 'valor_unitario') THEN
    ALTER TABLE produtos_venda ADD COLUMN valor_unitario NUMERIC;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'produtos_venda' AND column_name = 'valor_total') THEN
    ALTER TABLE produtos_venda ADD COLUMN valor_total NUMERIC;
  END IF;
END $$;

-- 5. Atualizar constraint de status em carregamentos para incluir todos os valores
DO $$
BEGIN
  -- Remover constraint antiga se existir
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints
             WHERE table_name = 'carregamentos' AND constraint_name LIKE '%status%') THEN
    ALTER TABLE carregamentos DROP CONSTRAINT IF EXISTS carregamentos_status_check;
  END IF;

  -- Adicionar nova constraint
  ALTER TABLE carregamentos ADD CONSTRAINT chk_carreg_status
    CHECK (status IS NULL OR status IN ('pendente', 'stand-by', 'standby', 'concluido', 'finalizado', 'cancelado'));
END $$;

COMMENT ON COLUMN carregamentos.tara_total IS 'Tara total em gramas (NUMERIC)';
COMMENT ON COLUMN carregamentos.peso_final_total IS 'Peso final total em gramas (NUMERIC)';
COMMENT ON COLUMN carregamentos.qtd_desejada IS 'Quantidade desejada em TON (TEXT formatado)';
COMMENT ON COLUMN carregamentos.detalhes_produto IS 'Nome/descrição do produto carregado';
