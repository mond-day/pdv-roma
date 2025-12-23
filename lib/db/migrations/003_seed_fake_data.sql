-- Seed data para desenvolvimento
-- Execute este arquivo após a migração inicial para popular o banco com dados de teste
-- Para executar: psql -U postgres -d pdv_roma -f lib/db/migrations/003_seed_fake_data.sql
-- Ou use os scripts: seed-fake-data.ps1 (Windows) ou seed-fake-data.sh (Linux/Mac)

-- Transportadoras fake (precisa existir antes de vendas e carregamentos)
INSERT INTO transportadoras (
  id_gc,
  nome,
  cpf_cnpj,
  tipo_pessoa,
  email,
  telefone
) VALUES
  ('TRANS-001', 'Transportadora Alpha Ltda', '12.345.678/0001-90', 'juridica', 'contato@alpha.com', '(11) 98765-4321'),
  ('TRANS-002', 'Transportadora Beta S.A', '98.765.432/0001-10', 'juridica', 'contato@beta.com', '(11) 91234-5678')
ON CONFLICT (id_gc) DO NOTHING;

-- Motoristas fake (precisa existir antes dos carregamentos)
INSERT INTO motoristas (
  nome,
  cpf,
  transportadora_id
) VALUES
  ('João Silva', '123.456.789-00', 'TRANS-001'),
  ('Maria Santos', '987.654.321-00', 'TRANS-002')
ON CONFLICT DO NOTHING;

-- Vendas/Contratos fake (precisa existir antes dos carregamentos)
INSERT INTO vendas (
  id_gc,
  codigo,
  nome_cliente,
  situacao,
  transportadora_id,
  data
) VALUES
  ('GC-001', 'CT-001', 'Cliente A Ltda', 'ativo', 'TRANS-001', CURRENT_DATE),
  ('GC-002', 'CT-002', 'Cliente B S.A', 'ativo', 'TRANS-002', CURRENT_DATE),
  ('GC-003', 'CT-003', 'Cliente C EIRELI', 'ativo', 'TRANS-001', CURRENT_DATE),
  ('GC-004', 'CT-004', 'Cliente D ME', 'ativo', 'TRANS-002', CURRENT_DATE - INTERVAL '1 day'),
  ('GC-005', 'CT-005', 'Cliente E Ltda', 'cancelado', 'TRANS-001', CURRENT_DATE),
  ('GC-006', 'CT-006', 'Cliente F S.A', 'ativo', 'TRANS-002', CURRENT_DATE),
  ('GC-007', 'CT-007', 'Cliente G EIRELI', 'ativo', 'TRANS-001', CURRENT_DATE),
  ('GC-008', 'CT-008', 'Cliente H ME', 'ativo', 'TRANS-002', CURRENT_DATE - INTERVAL '2 days'),
  ('GC-009', 'CT-009', 'Cliente I Ltda', 'ativo', 'TRANS-001', CURRENT_DATE),
  ('GC-010', 'CT-010', 'Cliente J S.A', 'ativo', 'TRANS-002', CURRENT_DATE),
  ('GC-011', 'CT-011', 'Cliente K Ltda', 'ativo', 'TRANS-001', CURRENT_DATE - INTERVAL '3 days'),
  ('GC-012', 'CT-012', 'Cliente L S.A', 'ativo', 'TRANS-002', CURRENT_DATE - INTERVAL '4 days'),
  ('GC-013', 'CT-013', 'Cliente M EIRELI', 'ativo', 'TRANS-001', CURRENT_DATE - INTERVAL '5 days'),
  ('GC-014', 'CT-014', 'Cliente N ME', 'ativo', 'TRANS-002', CURRENT_DATE - INTERVAL '6 days'),
  ('GC-015', 'CT-015', 'Cliente O Ltda', 'cancelado', 'TRANS-001', CURRENT_DATE - INTERVAL '7 days')
ON CONFLICT (id_gc) DO NOTHING;

-- Produtos das vendas fake
-- Nota: produtos_venda tem valor_unitario e valor_total também
INSERT INTO produtos_venda (
  venda_id,
  produto_id,
  nome_produto,
  quantidade,
  valor_unitario,
  valor_total
) VALUES
  ('GC-001', 'PROD-001', 'Soja', 100.0, 150.00, 15000.00),
  ('GC-002', 'PROD-002', 'Milho', 120.0, 140.00, 16800.00),
  ('GC-003', 'PROD-003', 'Trigo', 80.0, 160.00, 12800.00),
  ('GC-004', 'PROD-001', 'Soja', 140.0, 150.00, 21000.00),
  ('GC-005', 'PROD-002', 'Milho', 90.0, 140.00, 12600.00),
  ('GC-006', 'PROD-003', 'Trigo', 112.0, 160.00, 17920.00),
  ('GC-007', 'PROD-001', 'Soja', 160.0, 150.00, 24000.00),
  ('GC-008', 'PROD-002', 'Milho', 72.0, 140.00, 10080.00),
  ('GC-009', 'PROD-003', 'Trigo', 128.0, 160.00, 20480.00),
  ('GC-010', 'PROD-001', 'Soja', 110.0, 150.00, 16500.00),
  ('GC-011', 'PROD-002', 'Milho', 96.0, 140.00, 13440.00),
  ('GC-012', 'PROD-003', 'Trigo', 76.0, 160.00, 12160.00),
  ('GC-013', 'PROD-001', 'Soja', 132.0, 150.00, 19800.00),
  ('GC-014', 'PROD-002', 'Milho', 88.0, 140.00, 12320.00),
  ('GC-015', 'PROD-003', 'Trigo', 84.0, 160.00, 13440.00)
ON CONFLICT DO NOTHING;

-- Carregamentos fake
-- Nota: venda_id é obrigatório e deve referenciar vendas.id_gc
-- Status: 'pendente', 'stand-by', 'concluido', 'cancelado'
-- tara_eixos e peso_final_eixos são JSONB (arrays na ordem dos eixos)
INSERT INTO carregamentos (
  venda_id,
  placa,
  cliente_nome,
  contrato_codigo,
  eixos,
  status,
  data_carregamento,
  tara_total,
  tara_eixos,
  peso_final_total,
  peso_final_eixos,
  finalizado_em,
  qtd_desejada,
  observacoes,
  detalhes_produto
) VALUES
  ('GC-001', 'ABC-1234', 'Cliente A Ltda', 'CT-001', 3, 'standby', CURRENT_DATE, 25.000, '[8500, 8200, 8300]'::jsonb, NULL, NULL, NULL, '25.5', 'Carregamento em espera', 'Soja'),
  ('GC-002', 'XYZ-5678', 'Cliente B S.A', 'CT-002', 4, 'finalizado', CURRENT_DATE, 36.300, '[9200, 9000, 9100, 9000]'::jsonb, 49.200, '[12500, 12300, 12400, 12200]'::jsonb, CURRENT_DATE, '30.0', 'Carregamento finalizado', 'Milho'),
  ('GC-003', 'DEF-9012', 'Cliente C EIRELI', 'CT-003', 2, 'standby', CURRENT_DATE, 15.800, '[7800, 8000]'::jsonb, NULL, NULL, NULL, '20.0', 'Aguardando pesagem final', 'Trigo'),
  ('GC-005', 'JKL-7890', 'Cliente E Ltda', 'CT-005', 3, 'cancelado', CURRENT_DATE, 26.400, '[8800, 8700, 8900]'::jsonb, NULL, NULL, NULL, '22.5', 'Cancelado por motivo X', 'Milho'),
  ('GC-006', 'MNO-2468', 'Cliente F S.A', 'CT-006', 4, 'standby', CURRENT_DATE, 38.000, '[9500, 9400, 9600, 9500]'::jsonb, NULL, NULL, NULL, '28.0', 'Em processo', 'Trigo'),
  ('GC-007', 'PQR-1357', 'Cliente G EIRELI', 'CT-007', 5, 'finalizado', CURRENT_DATE, 54.500, '[11000, 10800, 10900, 11000, 10800]'::jsonb, 74.500, '[15000, 14800, 14900, 15000, 14800]'::jsonb, CURRENT_DATE, '40.0', 'Carregamento completo', 'Soja'),
  ('GC-009', 'VWX-8642', 'Cliente I Ltda', 'CT-009', 4, 'finalizado', CURRENT_DATE, 39.200, '[9800, 9700, 9900, 9800]'::jsonb, 54.000, '[13500, 13400, 13600, 13500]'::jsonb, CURRENT_DATE, '32.0', 'Finalizado hoje', 'Trigo'),
  ('GC-010', 'YZA-7531', 'Cliente J S.A', 'CT-010', 3, 'standby', CURRENT_DATE, 27.000, '[9000, 8900, 9100]'::jsonb, NULL, NULL, NULL, '27.5', 'Em standby', 'Soja'),
  -- Carregamentos de outros dias (para histórico)
  ('GC-004', 'GHI-3456', 'Cliente D ME', 'CT-004', 5, 'finalizado', CURRENT_DATE - INTERVAL '1 day', 50.500, '[10000, 9800, 9900, 10000, 9800]'::jsonb, 70.500, '[14000, 13800, 13900, 14000, 13800]'::jsonb, CURRENT_DATE - INTERVAL '1 day', '35.0', 'Finalizado ontem', 'Soja'),
  ('GC-008', 'STU-9753', 'Cliente H ME', 'CT-008', 2, 'standby', CURRENT_DATE - INTERVAL '2 days', 15.200, '[7500, 7700]'::jsonb, NULL, NULL, NULL, '18.0', 'Aguardando desde anteontem', 'Milho');

-- Integrações fake (algumas pendentes, algumas com erro)
-- Nota: Verificando se a tabela integracoes_n8n existe
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'integracoes_n8n') THEN
    INSERT INTO integracoes_n8n (carregamento_id, idempotency_key, status, tentativas, payload)
    SELECT 
      c.id,
      'idemp-' || c.id || '-' || EXTRACT(EPOCH FROM NOW())::bigint,
      CASE 
        WHEN c.id % 3 = 0 THEN 'pendente'
        WHEN c.id % 3 = 1 THEN 'enviado'
        ELSE 'erro'
      END,
      CASE WHEN c.id % 3 = 2 THEN 2 ELSE 0 END,
      jsonb_build_object(
        'carregamento_id', c.id,
        'placa', c.placa,
        'venda_id', c.venda_id,
        'status', c.status
      )
    FROM carregamentos c
    WHERE c.status = 'finalizado'
    LIMIT 5;
  END IF;
END $$;

-- Notificações fake (se a tabela existir)
-- Nota: Verificando se a tabela notificacoes existe antes de inserir
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notificacoes') THEN
    INSERT INTO notificacoes (user_id, tipo, titulo, mensagem, carregamento_id, lida)
    SELECT 
      (SELECT id FROM users LIMIT 1),
      CASE WHEN i.status = 'erro' THEN 'aviso' ELSE 'integracao' END,
      CASE 
        WHEN i.status = 'erro' THEN 'Erro na integração n8n'
        ELSE 'Integração pendente'
      END,
      CASE 
        WHEN i.status = 'erro' THEN 'Falha ao enviar carregamento ' || c.id || ' para n8n'
        ELSE 'Carregamento ' || c.id || ' aguardando integração'
      END,
      c.id,
      false
    FROM carregamentos c
    LEFT JOIN integracoes_n8n i ON i.carregamento_id = c.id
    WHERE i.status IN ('pendente', 'erro')
    LIMIT 3;
  END IF;
END $$;

-- Mais carregamentos fake (para ter mais dados)
INSERT INTO carregamentos (
  venda_id,
  placa,
  cliente_nome,
  contrato_codigo,
  eixos,
  status,
  data_carregamento,
  tara_total,
  tara_eixos,
  peso_final_total,
  peso_final_eixos,
  finalizado_em,
  qtd_desejada,
  observacoes,
  detalhes_produto,
  transportadora_id,
  motorista_id
) VALUES
  ('GC-011', 'BCC-1111', 'Cliente K Ltda', 'CT-011', 4, 'standby', CURRENT_DATE - INTERVAL '3 days', 36.800, '[9200, 9100, 9300, 9200]'::jsonb, NULL, NULL, NULL, '28.0', 'Aguardando há 3 dias', 'Soja', 'TRANS-001', 1),
  ('GC-012', 'CDD-2222', 'Cliente L S.A', 'CT-012', 3, 'finalizado', CURRENT_DATE - INTERVAL '4 days', 25.800, '[8600, 8500, 8700]'::jsonb, 36.000, '[12000, 11900, 12100]'::jsonb, CURRENT_DATE - INTERVAL '4 days', '24.0', 'Finalizado há 4 dias', 'Milho', 'TRANS-002', 2),
  ('GC-013', 'DEE-3333', 'Cliente M EIRELI', 'CT-013', 2, 'standby', CURRENT_DATE - INTERVAL '5 days', 16.200, '[8000, 8200]'::jsonb, NULL, NULL, NULL, '19.5', 'Aguardando há 5 dias', 'Trigo', 'TRANS-001', 1),
  ('GC-014', 'EFF-4444', 'Cliente N ME', 'CT-014', 5, 'finalizado', CURRENT_DATE - INTERVAL '6 days', 50.500, '[10200, 10000, 10100, 10200, 10000]'::jsonb, 70.500, '[14200, 14000, 14100, 14200, 14000]'::jsonb, CURRENT_DATE - INTERVAL '6 days', '33.0', 'Finalizado há 6 dias', 'Soja', 'TRANS-002', 2),
  ('GC-015', 'FGG-5555', 'Cliente O Ltda', 'CT-015', 3, 'cancelado', CURRENT_DATE - INTERVAL '7 days', 25.200, '[8400, 8300, 8500]'::jsonb, NULL, NULL, NULL, '21.0', 'Cancelado há 7 dias', 'Milho', 'TRANS-001', 1);

-- Logs fake (auditoria)
-- Nota: logs_acao usa user_id (não usuario_id) e detalhes é JSONB
INSERT INTO logs_acao (acao, detalhes, carregamento_id, user_id, data)
SELECT 
  CASE 
    WHEN c.status = 'standby' THEN 'criar_carregamento_espera'
    WHEN c.status = 'finalizado' THEN 'finalizar_carregamento'
    ELSE 'cancelar_carregamento'
  END,
  jsonb_build_object(
    'mensagem', 'Ação realizada no carregamento ' || c.id || ' - ' || c.placa,
    'venda_id', c.venda_id,
    'status', c.status
  ),
  c.id,
  (SELECT id FROM users LIMIT 1),
  c.data_carregamento
FROM carregamentos c
ORDER BY c.id
LIMIT 15;

-- Mais logs de auditoria (ações de usuário)
INSERT INTO logs_acao (acao, detalhes, user_id, data)
SELECT 
  CASE (row_num % 4)
    WHEN 0 THEN 'alterar_usuario_permissao'
    WHEN 1 THEN 'alterar_configuracoes'
    WHEN 2 THEN 'integracao_n8n_enviar'
    ELSE 'integracao_n8n_sucesso'
  END,
  jsonb_build_object(
    'mensagem', CASE (row_num % 4)
      WHEN 0 THEN 'Permissões do usuário ID ' || row_num || ' foram alteradas'
      WHEN 1 THEN 'Configuração N8N_WEBHOOK_URL foi atualizada'
      WHEN 2 THEN 'Tentativa de envio de integração n8n para carregamento ' || row_num
      ELSE 'Integração n8n concluída com sucesso para carregamento ' || row_num
    END,
    'row_num', row_num
  ),
  (SELECT id FROM users LIMIT 1),
  CURRENT_TIMESTAMP - (row_num || ' hours')::INTERVAL
FROM (
  SELECT generate_series(1, 10) as row_num
) s;

-- Mais notificações (se a tabela existir)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notificacoes') THEN
    INSERT INTO notificacoes (user_id, tipo, titulo, mensagem, carregamento_id, lida, created_at)
    SELECT 
      (SELECT id FROM users LIMIT 1),
      'aviso',
      'Carregamento ' || c.id || ' aguardando ação',
      'O carregamento ' || c.id || ' (' || c.placa || ') está em stand-by há mais de 24 horas',
      c.id,
      false,
      c.data_carregamento - INTERVAL '1 day'
    FROM carregamentos c
    WHERE c.status = 'standby'
    LIMIT 5;
  END IF;
END $$;

