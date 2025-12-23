-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'faturador')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Carregamentos
CREATE TABLE carregamentos (
  id SERIAL PRIMARY KEY,
  status VARCHAR(20) NOT NULL CHECK (status IN ('standby', 'finalizado', 'cancelado')) DEFAULT 'standby',
  
  -- Identificação
  placa VARCHAR(10) NOT NULL,
  cliente_nome VARCHAR(255) NOT NULL,
  contrato_codigo VARCHAR(100),
  id_gc VARCHAR(100),
  
  -- Relacionamentos (podem ser NULL se não houver tabelas separadas)
  transportadora_id INTEGER,
  motorista_id INTEGER,
  
  -- Produto
  produto_venda_id INTEGER,
  produto_nome VARCHAR(255),
  qtd_desejada_ton DECIMAL(10, 2),
  
  -- Pesos
  tara_kg INTEGER,
  bruto_kg INTEGER,
  liquido_kg INTEGER,
  
  -- Eixos
  eixos INTEGER,
  tara_eixos_kg JSONB,
  final_eixos_kg JSONB,
  
  -- Metadados
  observacoes TEXT,
  data_carregamento DATE NOT NULL DEFAULT CURRENT_DATE,
  finalizado_em TIMESTAMP WITH TIME ZONE,
  cancelado_em TIMESTAMP WITH TIME ZONE,
  cancelamento_motivo TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Integrações n8n
CREATE TABLE integracoes_n8n (
  id SERIAL PRIMARY KEY,
  carregamento_id INTEGER NOT NULL REFERENCES carregamentos(id) ON DELETE CASCADE,
  idempotency_key VARCHAR(255) UNIQUE NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('pendente', 'enviado', 'erro')) DEFAULT 'pendente',
  tentativas INTEGER NOT NULL DEFAULT 0,
  ultima_mensagem TEXT,
  ultimo_envio_em TIMESTAMP WITH TIME ZONE,
  payload JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Configurações
CREATE TABLE configuracoes (
  id SERIAL PRIMARY KEY,
  key VARCHAR(100) UNIQUE NOT NULL,
  value_encrypted TEXT,
  value_plain TEXT, -- para valores não sensíveis
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Logs de ação (imutáveis)
-- user_id pode ser NULL ou um UUID válido (sem FK para permitir logs do sistema)
CREATE TABLE logs_acao (
  id SERIAL PRIMARY KEY,
  data TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  acao VARCHAR(100) NOT NULL,
  detalhes TEXT,
  request_id VARCHAR(255),
  carregamento_id INTEGER REFERENCES carregamentos(id) ON DELETE SET NULL,
  user_id UUID, -- Sem FK para permitir logs do sistema
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Notificações
CREATE TABLE notificacoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('integracao', 'sistema', 'aviso')) DEFAULT 'integracao',
  titulo VARCHAR(255) NOT NULL,
  mensagem TEXT NOT NULL,
  carregamento_id INTEGER REFERENCES carregamentos(id) ON DELETE SET NULL,
  lida BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_carregamentos_status_finalizado ON carregamentos(status, finalizado_em);
CREATE INDEX idx_carregamentos_placa ON carregamentos(placa);
CREATE INDEX idx_carregamentos_cliente ON carregamentos(cliente_nome);
CREATE INDEX idx_carregamentos_contrato ON carregamentos(contrato_codigo);
CREATE INDEX idx_carregamentos_data ON carregamentos(data_carregamento);

CREATE INDEX idx_integracoes_status_updated ON integracoes_n8n(status, updated_at);
CREATE INDEX idx_integracoes_carregamento ON integracoes_n8n(carregamento_id);

CREATE INDEX idx_notificacoes_user_lida ON notificacoes(user_id, lida, created_at);
CREATE INDEX idx_notificacoes_carregamento ON notificacoes(carregamento_id);

CREATE INDEX idx_logs_data ON logs_acao(data);
CREATE INDEX idx_logs_user ON logs_acao(user_id);
CREATE INDEX idx_logs_carregamento ON logs_acao(carregamento_id);
CREATE INDEX idx_logs_acao ON logs_acao(acao);

-- Seed: Admin padrão (senha: admin123 - DEVE SER ALTERADA)
-- Hash gerado com bcrypt para senha "admin123"
INSERT INTO users (name, email, password_hash, role) VALUES
  ('Administrador', 'admin@pdvroma.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'admin');

-- Config keys base
INSERT INTO configuracoes (key, value_plain) VALUES
  ('EMPRESA_LOGO_URL', ''),
  ('N8N_WEBHOOK_URL', ''),
  ('N8N_TOKEN', ''),
  ('NIBO_TOKEN', ''),
  ('GC_TOKEN', ''),
  ('SMTP_HOST', ''),
  ('SMTP_PORT', '587'),
  ('SMTP_USER', ''),
  ('SMTP_PASS', ''),
  ('SMTP_FROM', ''),
  ('EMAIL_ON_INTEGRACAO_ERRO', 'true'),
  ('EMAIL_ON_INTEGRACAO_SUCESSO', 'false');

