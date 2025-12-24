-- Migration 009: Fix Schema Alignment (Idempotent)
-- Corrige problemas da migration 008 que falhou parcialmente
-- Esta migration é IDEMPOTENTE - pode ser executada múltiplas vezes sem problemas

SET client_encoding = 'UTF8';

DO $$
BEGIN
  -- ========================================
  -- CARREGAMENTOS: Adicionar colunas faltantes
  -- ========================================

  -- Adicionar detalhes_produto se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'carregamentos' AND column_name = 'detalhes_produto'
  ) THEN
    ALTER TABLE carregamentos ADD COLUMN detalhes_produto TEXT;
    RAISE NOTICE 'Coluna detalhes_produto criada';
  ELSE
    RAISE NOTICE 'Coluna detalhes_produto já existe';
  END IF;

  -- Adicionar tara_total se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'carregamentos' AND column_name = 'tara_total'
  ) THEN
    ALTER TABLE carregamentos ADD COLUMN tara_total NUMERIC(12,3);
    RAISE NOTICE 'Coluna tara_total criada';
  ELSE
    RAISE NOTICE 'Coluna tara_total já existe';
  END IF;

  -- Adicionar peso_final_total se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'carregamentos' AND column_name = 'peso_final_total'
  ) THEN
    ALTER TABLE carregamentos ADD COLUMN peso_final_total NUMERIC(12,3);
    RAISE NOTICE 'Coluna peso_final_total criada';
  ELSE
    RAISE NOTICE 'Coluna peso_final_total já existe';
  END IF;

  -- Adicionar qtd_desejada se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'carregamentos' AND column_name = 'qtd_desejada'
  ) THEN
    ALTER TABLE carregamentos ADD COLUMN qtd_desejada TEXT;
    RAISE NOTICE 'Coluna qtd_desejada criada';
  ELSE
    RAISE NOTICE 'Coluna qtd_desejada já existe';
  END IF;

  -- ========================================
  -- CARREGAMENTOS: Renomear colunas antigas
  -- ========================================

  -- Renomear tara_eixos_kg para tara_eixos (se necessário)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'carregamentos' AND column_name = 'tara_eixos_kg'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'carregamentos' AND column_name = 'tara_eixos'
  ) THEN
    ALTER TABLE carregamentos RENAME COLUMN tara_eixos_kg TO tara_eixos;
    RAISE NOTICE 'Coluna tara_eixos_kg renomeada para tara_eixos';
  ELSE
    RAISE NOTICE 'Renomeação de tara_eixos_kg não necessária';
  END IF;

  -- Se tara_eixos não existe mas tara_eixos_kg também não, criar tara_eixos
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'carregamentos' AND column_name = 'tara_eixos'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'carregamentos' AND column_name = 'tara_eixos_kg'
  ) THEN
    ALTER TABLE carregamentos ADD COLUMN tara_eixos JSONB;
    RAISE NOTICE 'Coluna tara_eixos criada';
  END IF;

  -- Renomear final_eixos_kg para peso_final_eixos (se necessário)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'carregamentos' AND column_name = 'final_eixos_kg'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'carregamentos' AND column_name = 'peso_final_eixos'
  ) THEN
    ALTER TABLE carregamentos RENAME COLUMN final_eixos_kg TO peso_final_eixos;
    RAISE NOTICE 'Coluna final_eixos_kg renomeada para peso_final_eixos';
  ELSE
    RAISE NOTICE 'Renomeação de final_eixos_kg não necessária';
  END IF;

  -- Se peso_final_eixos não existe mas final_eixos_kg também não, criar peso_final_eixos
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'carregamentos' AND column_name = 'peso_final_eixos'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'carregamentos' AND column_name = 'final_eixos_kg'
  ) THEN
    ALTER TABLE carregamentos ADD COLUMN peso_final_eixos JSONB;
    RAISE NOTICE 'Coluna peso_final_eixos criada';
  END IF;

  -- ========================================
  -- MOTORISTAS: Adicionar cpf
  -- ========================================

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'motoristas' AND column_name = 'cpf'
  ) THEN
    ALTER TABLE motoristas ADD COLUMN cpf TEXT;
    RAISE NOTICE 'Coluna cpf em motoristas criada';
  ELSE
    RAISE NOTICE 'Coluna cpf em motoristas já existe';
  END IF;

  -- ========================================
  -- TRANSPORTADORAS: Adicionar colunas extras
  -- ========================================

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transportadoras' AND column_name = 'cpf_cnpj'
  ) THEN
    ALTER TABLE transportadoras ADD COLUMN cpf_cnpj TEXT;
    RAISE NOTICE 'Coluna cpf_cnpj em transportadoras criada';
  ELSE
    RAISE NOTICE 'Coluna cpf_cnpj em transportadoras já existe';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transportadoras' AND column_name = 'tipo_pessoa'
  ) THEN
    ALTER TABLE transportadoras ADD COLUMN tipo_pessoa TEXT;
    RAISE NOTICE 'Coluna tipo_pessoa em transportadoras criada';
  ELSE
    RAISE NOTICE 'Coluna tipo_pessoa em transportadoras já existe';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transportadoras' AND column_name = 'email'
  ) THEN
    ALTER TABLE transportadoras ADD COLUMN email TEXT;
    RAISE NOTICE 'Coluna email em transportadoras criada';
  ELSE
    RAISE NOTICE 'Coluna email em transportadoras já existe';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transportadoras' AND column_name = 'telefone'
  ) THEN
    ALTER TABLE transportadoras ADD COLUMN telefone TEXT;
    RAISE NOTICE 'Coluna telefone em transportadoras criada';
  ELSE
    RAISE NOTICE 'Coluna telefone em transportadoras já existe';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transportadoras' AND column_name = 'cadastrado_em'
  ) THEN
    ALTER TABLE transportadoras ADD COLUMN cadastrado_em TIMESTAMP WITH TIME ZONE;
    RAISE NOTICE 'Coluna cadastrado_em em transportadoras criada';
  ELSE
    RAISE NOTICE 'Coluna cadastrado_em em transportadoras já existe';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'transportadoras' AND column_name = 'modificado_em'
  ) THEN
    ALTER TABLE transportadoras ADD COLUMN modificado_em TIMESTAMP WITH TIME ZONE;
    RAISE NOTICE 'Coluna modificado_em em transportadoras criada';
  ELSE
    RAISE NOTICE 'Coluna modificado_em em transportadoras já existe';
  END IF;

  -- ========================================
  -- PRODUTOS_VENDA: Adicionar colunas de valores
  -- ========================================

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'produtos_venda' AND column_name = 'valor_unitario'
  ) THEN
    ALTER TABLE produtos_venda ADD COLUMN valor_unitario NUMERIC;
    RAISE NOTICE 'Coluna valor_unitario em produtos_venda criada';
  ELSE
    RAISE NOTICE 'Coluna valor_unitario em produtos_venda já existe';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'produtos_venda' AND column_name = 'valor_total'
  ) THEN
    ALTER TABLE produtos_venda ADD COLUMN valor_total NUMERIC;
    RAISE NOTICE 'Coluna valor_total em produtos_venda criada';
  ELSE
    RAISE NOTICE 'Coluna valor_total em produtos_venda já existe';
  END IF;

END $$;

-- ========================================
-- Atualizar constraint de status
-- ========================================
DO $$
BEGIN
  -- Remover constraint antiga se existir
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'carregamentos_status_check'
    AND conrelid = 'carregamentos'::regclass
  ) THEN
    ALTER TABLE carregamentos DROP CONSTRAINT carregamentos_status_check;
    RAISE NOTICE 'Constraint carregamentos_status_check removida';
  END IF;

  -- Remover constraint chk_carreg_status se existir
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'chk_carreg_status'
    AND conrelid = 'carregamentos'::regclass
  ) THEN
    ALTER TABLE carregamentos DROP CONSTRAINT chk_carreg_status;
    RAISE NOTICE 'Constraint chk_carreg_status removida';
  END IF;

  -- Adicionar constraint atualizada
  ALTER TABLE carregamentos ADD CONSTRAINT chk_carreg_status
    CHECK (status IS NULL OR status IN ('pendente', 'stand-by', 'standby', 'concluido', 'finalizado', 'cancelado'));

  RAISE NOTICE 'Constraint chk_carreg_status criada com sucesso';
END $$;

COMMENT ON COLUMN carregamentos.detalhes_produto IS 'Nome do produto sendo carregado';
COMMENT ON COLUMN carregamentos.tara_total IS 'Peso da tara total em gramas (NUMERIC)';
COMMENT ON COLUMN carregamentos.peso_final_total IS 'Peso final total em gramas (NUMERIC)';
COMMENT ON COLUMN carregamentos.qtd_desejada IS 'Quantidade desejada em formato texto (ex: 25,500)';
COMMENT ON COLUMN carregamentos.tara_eixos IS 'Array JSONB com pesos da tara de cada eixo';
COMMENT ON COLUMN carregamentos.peso_final_eixos IS 'Array JSONB com pesos finais de cada eixo';
