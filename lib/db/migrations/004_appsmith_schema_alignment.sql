-- Migration para alinhar schema com Appsmith
-- Adiciona tabelas e campos faltantes baseados no schema do Appsmith

-- 1. Tabela user_auth (separada de users para autenticação)
CREATE TABLE IF NOT EXISTS user_auth (
  email VARCHAR(255) PRIMARY KEY,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'operador', 'supervisor')),
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 2. Tabela vendas (contratos/vendas do Gestão Click)
CREATE TABLE IF NOT EXISTS vendas (
  id_gc VARCHAR(100) PRIMARY KEY,
  codigo VARCHAR(100) UNIQUE NOT NULL,
  nome_cliente VARCHAR(255) NOT NULL,
  situacao VARCHAR(50),
  transportadora_id VARCHAR(100),
  data DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_vendas_codigo ON vendas(codigo);
CREATE INDEX idx_vendas_cliente ON vendas(nome_cliente);

-- 3. Tabela produtos_venda (produtos do contrato)
CREATE TABLE IF NOT EXISTS produtos_venda (
  id SERIAL PRIMARY KEY,
  venda_id VARCHAR(100) NOT NULL REFERENCES vendas(id_gc) ON DELETE CASCADE,
  produto_id VARCHAR(100),
  nome_produto VARCHAR(255) NOT NULL,
  quantidade DECIMAL(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_produtos_venda_venda_id ON produtos_venda(venda_id);
CREATE INDEX idx_produtos_venda_produto_id ON produtos_venda(produto_id);

-- 4. Tabela motoristas
CREATE TABLE IF NOT EXISTS motoristas (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  transportadora_id VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_motoristas_transportadora ON motoristas(transportadora_id);

-- 5. Tabela transportadoras
CREATE TABLE IF NOT EXISTS transportadoras (
  id_gc VARCHAR(100) PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_transportadoras_nome ON transportadoras(nome);

-- 6. Tabela placas
CREATE TABLE IF NOT EXISTS placas (
  id SERIAL PRIMARY KEY,
  placa VARCHAR(10) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_placas_placa ON placas(placa);

-- 7. Tabela placas_motoristas (relação N-N)
CREATE TABLE IF NOT EXISTS placas_motoristas (
  placa_id INTEGER NOT NULL REFERENCES placas(id) ON DELETE CASCADE,
  motorista_id INTEGER NOT NULL REFERENCES motoristas(id) ON DELETE CASCADE,
  PRIMARY KEY (placa_id, motorista_id)
);

CREATE INDEX idx_placas_motoristas_placa ON placas_motoristas(placa_id);
CREATE INDEX idx_placas_motoristas_motorista ON placas_motoristas(motorista_id);

-- 8. Tabela placas_transportadoras (relação N-N)
CREATE TABLE IF NOT EXISTS placas_transportadoras (
  placa_id INTEGER NOT NULL REFERENCES placas(id) ON DELETE CASCADE,
  transportadora_id VARCHAR(100) NOT NULL REFERENCES transportadoras(id_gc) ON DELETE CASCADE,
  PRIMARY KEY (placa_id, transportadora_id)
);

CREATE INDEX idx_placas_transportadoras_placa ON placas_transportadoras(placa_id);
CREATE INDEX idx_placas_transportadoras_transportadora ON placas_transportadoras(transportadora_id);

-- 9. Tabela produtos_carregamento (produtos do carregamento)
CREATE TABLE IF NOT EXISTS produtos_carregamento (
  id SERIAL PRIMARY KEY,
  carregamento_id INTEGER NOT NULL REFERENCES carregamentos(id) ON DELETE CASCADE,
  produto_id VARCHAR(100),
  nome_produto VARCHAR(255) NOT NULL,
  quantidade DECIMAL(10, 2) NOT NULL,
  unidade VARCHAR(10) DEFAULT 'TON',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_produtos_carregamento_carregamento ON produtos_carregamento(carregamento_id);

-- 10. Tabela parametros_pesagem
CREATE TABLE IF NOT EXISTS parametros_pesagem (
  id SERIAL PRIMARY KEY,
  tolerancia_peso DECIMAL(10, 2) DEFAULT 0,
  peso_maximo_eixo INTEGER DEFAULT 6000,
  permitir_excesso BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Seed: Parâmetros padrão
INSERT INTO parametros_pesagem (tolerancia_peso, peso_maximo_eixo, permitir_excesso)
VALUES (0, 6000, false)
ON CONFLICT DO NOTHING;

-- 11. Tabela webhooks_config (substitui configurações genéricas)
CREATE TABLE IF NOT EXISTS webhooks_config (
  id SERIAL PRIMARY KEY,
  confirmacao TEXT,
  cancelamento TEXT,
  duplicacao TEXT,
  ticket TEXT,
  busca_codigo TEXT,
  busca_placa TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Seed: Webhooks vazios
INSERT INTO webhooks_config (confirmacao, cancelamento, duplicacao, ticket, busca_codigo, busca_placa)
VALUES (NULL, NULL, NULL, NULL, NULL, NULL)
ON CONFLICT DO NOTHING;

-- 12. Adicionar campos faltantes em usuarios (se não existirem)
DO $$ 
BEGIN
  -- Adicionar permissao se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'permissao') THEN
    ALTER TABLE users ADD COLUMN permissao VARCHAR(20) CHECK (permissao IN ('operador', 'supervisor'));
  END IF;

  -- Adicionar pode_editar se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'pode_editar') THEN
    ALTER TABLE users ADD COLUMN pode_editar BOOLEAN DEFAULT true;
  END IF;

  -- Adicionar pode_duplicar se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'pode_duplicar') THEN
    ALTER TABLE users ADD COLUMN pode_duplicar BOOLEAN DEFAULT false;
  END IF;

  -- Adicionar pode_cancelar se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'pode_cancelar') THEN
    ALTER TABLE users ADD COLUMN pode_cancelar BOOLEAN DEFAULT false;
  END IF;
END $$;

-- 13. Adicionar campos faltantes em carregamentos
DO $$ 
BEGIN
  -- Adicionar detalhes_produto se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'carregamentos' AND column_name = 'detalhes_produto') THEN
    ALTER TABLE carregamentos ADD COLUMN detalhes_produto TEXT;
  END IF;

  -- Renomear/mapear campos se necessário
  -- tara_eixos já existe como JSONB
  -- peso_final_eixos -> final_eixos_kg (já existe)
  -- tara_total pode ser calculado, mas adicionamos se necessário
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'carregamentos' AND column_name = 'tara_total') THEN
    ALTER TABLE carregamentos ADD COLUMN tara_total DECIMAL(10, 2);
  END IF;

  -- peso_final_total -> bruto_kg (já existe)
  -- status já existe, mas vamos garantir valores corretos
  -- Adicionar campo pendente se necessário (standby = pendente no Appsmith)
END $$;

-- 14. Atualizar carregamentos para referenciar vendas
DO $$ 
BEGIN
  -- Se venda_id não existir como FK, adicionamos como texto (id_gc)
  -- Já temos id_gc, mas vamos garantir que venda_id também existe
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'carregamentos' AND column_name = 'venda_id') THEN
    ALTER TABLE carregamentos ADD COLUMN venda_id VARCHAR(100) REFERENCES vendas(id_gc) ON DELETE SET NULL;
    CREATE INDEX idx_carregamentos_venda_id ON carregamentos(venda_id);
  END IF;
END $$;

-- Comentários
COMMENT ON TABLE vendas IS 'Vendas/contratos do Gestão Click';
COMMENT ON TABLE produtos_venda IS 'Produtos disponíveis em cada venda/contrato';
COMMENT ON TABLE motoristas IS 'Motoristas vinculados a transportadoras';
COMMENT ON TABLE transportadoras IS 'Transportadoras do sistema';
COMMENT ON TABLE placas IS 'Catálogo de placas de veículos';
COMMENT ON TABLE placas_motoristas IS 'Relação N-N entre placas e motoristas';
COMMENT ON TABLE placas_transportadoras IS 'Relação N-N entre placas e transportadoras';
COMMENT ON TABLE produtos_carregamento IS 'Produtos carregados em cada carregamento';
COMMENT ON TABLE parametros_pesagem IS 'Parâmetros globais de validação de pesagem';
COMMENT ON TABLE webhooks_config IS 'Configuração de URLs de webhooks (n8n)';

