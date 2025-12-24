
-- ===============================================
-- SAMPLE DATA (2 rows) FROM: public.carregamentos
-- ===============================================
INSERT INTO public.carregamentos (id, venda_id, id_gc, placa, data_carregamento, status, tara_total, eixos, tara_eixos, motorista_id, transportadora_id, produto_venda_id, finalizado_em, peso_final_total, peso_final_eixos, observacoes, detalhes_produto, qtd_desejada) VALUES (121, '318588699', '318755900', 'RHM7E80', '2025-10-01 11:40:04.995065', 'concluido', 25720.000, 1, NULL, 486395, 481447, 760, '2025-10-01 12:32:36.582476', 48392.000, NULL, 'null', 'BRITA 1', '65,000');
INSERT INTO public.carregamentos (id, venda_id, id_gc, placa, data_carregamento, status, tara_total, eixos, tara_eixos, motorista_id, transportadora_id, produto_venda_id, finalizado_em, peso_final_total, peso_final_eixos, observacoes, detalhes_produto, qtd_desejada) VALUES (127, '318588699', '318755984', 'RHM7E80', '2025-10-01 12:32:36.582476', 'concluido', 25720.000, 1, NULL, 486395, 481447, 760, '2025-10-01 12:32:36.582476', 9288.000, NULL, 'null', NULL, NULL);

-- ===============================================
-- SAMPLE DATA (2 rows) FROM: public.logs_acao
-- ===============================================
INSERT INTO public.logs_acao (id, carregamento_id, usuario_id, acao, data, detalhes) VALUES (83, 88, NULL, 'criar_carregamento_espera', '2025-09-30 17:23:22.052421', NULL);
INSERT INTO public.logs_acao (id, carregamento_id, usuario_id, acao, data, detalhes) VALUES (84, 89, NULL, 'criar_carregamento_espera', '2025-09-30 17:32:18.608932', NULL);

-- ===============================================
-- SAMPLE DATA (2 rows) FROM: public.motoristas
-- ===============================================
INSERT INTO public.motoristas (id, nome, cpf, transportadora_id) VALUES (487306, 'BRUNO ANDRADE DA SILVA', '029.120.671-97', NULL);
INSERT INTO public.motoristas (id, nome, cpf, transportadora_id) VALUES (487307, 'BRUNO TEIXEIRA DE OLIVEIRA', '085.709.486-62', NULL);

-- ===============================================
-- SAMPLE DATA (2 rows) FROM: public.parametros_pesagem
-- ===============================================
INSERT INTO public.parametros_pesagem (id, peso_maximo_eixo, tolerancia_peso, permitir_excesso, criado_em) VALUES (1, 17000, 5, true, '2025-08-03 22:58:21.767602');

-- ===============================================
-- SAMPLE DATA (2 rows) FROM: public.pesagem_eixos
-- ===============================================
-- (sem linhas ou sem permissão)

-- ===============================================
-- SAMPLE DATA (2 rows) FROM: public.placas
-- ===============================================
INSERT INTO public.placas (id, placa) VALUES (316, 'RAY9A98');
INSERT INTO public.placas (id, placa) VALUES (194, 'SPI0B90');

-- ===============================================
-- SAMPLE DATA (2 rows) FROM: public.placas_motoristas
-- ===============================================
INSERT INTO public.placas_motoristas (id, placa_id, motorista_id) VALUES (1, 1, 487444);
INSERT INTO public.placas_motoristas (id, placa_id, motorista_id) VALUES (3, 8, 486701);

-- ===============================================
-- SAMPLE DATA (2 rows) FROM: public.placas_transportadoras
-- ===============================================
INSERT INTO public.placas_transportadoras (id, placa_id, transportadora_id) VALUES (1, 125, '485792');
INSERT INTO public.placas_transportadoras (id, placa_id, transportadora_id) VALUES (7, 16, '466648');

-- ===============================================
-- SAMPLE DATA (2 rows) FROM: public.produtos_carregamento
-- ===============================================
INSERT INTO public.produtos_carregamento (id, carregamento_id, produto_id, nome_produto, quantidade, unidade, criado_em) VALUES (81, 88, '861', 'Brita 2', 33.2300000000000000, 'TON', '2025-09-30 17:23:59.485063');
INSERT INTO public.produtos_carregamento (id, carregamento_id, produto_id, nome_produto, quantidade, unidade, criado_em) VALUES (82, 90, '831', 'Brita 1', 28.8800000000000000, 'TON', '2025-09-30 18:31:25.536264');

-- ===============================================
-- SAMPLE DATA (2 rows) FROM: public.produtos_venda
-- ===============================================
INSERT INTO public.produtos_venda (id, venda_id, produto_id, nome_produto, quantidade, valor_unitario, valor_total) VALUES (840, '318330734', '74474584', 'Brita 1', 6.1, 113, 689.3);
INSERT INTO public.produtos_venda (id, venda_id, produto_id, nome_produto, quantidade, valor_unitario, valor_total) VALUES (794, '311116378', '74474592', 'Pedrisco', 170.3, 4, 681.2);

-- ===============================================
-- SAMPLE DATA (2 rows) FROM: public.transportadoras
-- ===============================================
INSERT INTO public.transportadoras (id_gc, nome, cpf_cnpj, tipo_pessoa, email, telefone, cadastrado_em, modificado_em) VALUES ('448548', 'ROMA MINERACAO LTDA', '41.778.613/0001-31', 'PJ', '', '', '2025-03-24 10:47:47', '2025-10-28 16:39:05');
INSERT INTO public.transportadoras (id_gc, nome, cpf_cnpj, tipo_pessoa, email, telefone, cadastrado_em, modificado_em) VALUES ('516840', 'CONSTRUA PRE MOLDADOS', '61.841.781/0001-31', 'PJ', 'construapremoldados@gmail.com', '(66)9965-7020', '2025-12-09 14:06:47', '2025-12-09 14:42:05');

-- ===============================================
-- SAMPLE DATA (2 rows) FROM: public.usuarios
-- ===============================================
INSERT INTO public.usuarios (id, nome, email, senha_hash, permissao, ativo, pode_editar, pode_cancelar, pode_duplicar) VALUES (7, 'Lucas Silva', 'lucas.fisconorte@gmail.com', '$2a$08$PLO92G.czoRcErFOp7qV9e/0Cq8OiOhXmqwdsrCqcRGErRgCEIOeO', 'supervisor', true, true, true, true);

-- ===============================================
-- SAMPLE DATA (2 rows) FROM: public.vendas
-- ===============================================
INSERT INTO public.vendas (id_gc, codigo, cliente_id, nome_cliente, vendedor_id, nome_vendedor, data, situacao, valor_total, observacoes, transportadora_id, forma_pagamento, status_financeiro, status_estoque, nota_fiscal_id, hash, modificado_em, data_cadastro) VALUES ('323241916', '19101', '47971022', 'SINOPTUBOS ARTEFATOS DE CIMENTO LTDA', '1167157', 'Samuel Kenji', '2025-12-23', 'Contrato Qtd', 7236.84, '', '', 'parcelado', '0', '0', '', 'QNX5rM0', '2025-12-23 04:01:40', '2025-10-21 08:28:45');
INSERT INTO public.vendas (id_gc, codigo, cliente_id, nome_cliente, vendedor_id, nome_vendedor, data, situacao, valor_total, observacoes, transportadora_id, forma_pagamento, status_financeiro, status_estoque, nota_fiscal_id, hash, modificado_em, data_cadastro) VALUES ('334814513', '22636', '52746869', 'SANORTE SANEAMENTO AMBIENTAL LTDA', '1167157', 'Samuel Kenji', '2025-12-20', 'Contrato Finalizado', 3278.6, '', '', 'parcelado', '0', '0', '', '6WpjKMl', '2025-12-20 08:51:34', '2025-12-10 07:48:42');

-- ===============================================
-- SAMPLE DATA (2 rows) FROM: public.webhooks_config
-- ===============================================
INSERT INTO public.webhooks_config (id, busca_placa, busca_codigo, confirmacao, cancelamento, ticket, duplicacao) VALUES (1, 'https://webhook.romamineracao.com.br/webhook/puxa-placa', 'https://n8n.romamineracao.com.br/webhook-test/puxa-contratos', 'https://webhook.romamineracao.com.br/webhook/gera-venda', 'https://webhook.romamineracao.com.br/webhook/cancela-venda', 'https://webhook.romamineracao.com.br/webhook/imprimir-ticket', 'https://n8n.seuservidor.com/webhook/duplicar-carregamento');
