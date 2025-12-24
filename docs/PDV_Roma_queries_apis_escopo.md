# PDV Roma — Escopo técnico (Queries SQL e HTTP Requests)
Fonte: export do Appsmith (`actionList`) contendo 26 actions (22 DB/Postgres + 4 REST).
## Convenções do Appsmith usadas neste artefato
- **DB actions (Postgres plugin):** o SQL fica em `actionConfiguration.body`.
- **API actions (REST plugin):** `httpMethod`, `path`, `headers`, `queryParameters`, `body`.
- **Bindings dinâmicos:** expressões `{{ ... }}` são avaliadas pelo Appsmith.
- **Parâmetros de execução:** `this.params.<campo>` (passados ao chamar `Action.run({ ... })`).
- **Store:** `appsmith.store` para estado persistente do front.
- **Run behaviour:** `AUTOMATIC` roda ao carregar a página; `MANUAL` somente quando chamado.

## Índice das actions
| Action | Tipo | Run | Timeout (ms) | Descrição (inferida) |
|---|---:|---:|---:|---|
| `BuscarClientePorIdGC` | DB | MANUAL | 10000 | Busca pontual por chave (código/id/email) para preencher contexto na UI. |
| `buscarPlacasPorPrefixo` | DB | AUTOMATIC | 10000 | Busca pontual por chave (código/id/email) para preencher contexto na UI. |
| `buscarPorCodigo` | DB | MANUAL | 10000 | Busca pontual por chave (código/id/email) para preencher contexto na UI. |
| `buscarPorPlaca` | DB | MANUAL | 10000 | Busca pontual por chave (código/id/email) para preencher contexto na UI. |
| `buscarUsuarioPorEmail` | DB | MANUAL | 10000 | Busca pontual por chave (código/id/email) para preencher contexto na UI. |
| `buscarVendas` | DB | AUTOMATIC | 10000 | Busca pontual por chave (código/id/email) para preencher contexto na UI. |
| `confirmarCarregamento` | DB | MANUAL | 10000 | Confirmação de etapa/ação (finalização de fluxo). |
| `criarCarregamentoEmEspera` | DB | MANUAL | 10000 | Ação específica do fluxo do PDV. |
| `getCarregamentoDetalhe` | DB | MANUAL | 10000 | Carrega detalhes/parametrização para a UI ou para montagem de payload. |
| `getParametrosPesagem` | DB | ON_PAGE_LOAD | 10000 | Carrega detalhes/parametrização para a UI ou para montagem de payload. |
| `getProdutoVendaBasico` | DB | MANUAL | 10000 | Carrega detalhes/parametrização para a UI ou para montagem de payload. |
| `inserirLogAcao` | DB | MANUAL | 10000 | Persistência (INSERT) de registro operacional/auditoria. |
| `listarMotoristasDaVenda` | DB | MANUAL | 10000 | Listagem com filtros (autocomplete/lookup). |
| `listarMotoristasPorPlaca` | DB | AUTOMATIC | 10000 | Listagem com filtros (autocomplete/lookup). |
| `listarPlacasDaVenda` | DB | MANUAL | 10000 | Listagem com filtros (autocomplete/lookup). |
| `listarPlacasRecentes` | DB | AUTOMATIC | 10000 | Listagem com filtros (autocomplete/lookup). |
| `listarPlacasTodos` | DB | AUTOMATIC | 10000 | Listagem com filtros (autocomplete/lookup). |
| `listarProdutosDaVenda` | DB | AUTOMATIC | 10000 | Listagem com filtros (autocomplete/lookup). |
| `listarTransportadorasDaVenda` | DB | MANUAL | 10000 | Listagem com filtros (autocomplete/lookup). |
| `listarTransportadorasPorPlaca` | DB | AUTOMATIC | 10000 | Listagem com filtros (autocomplete/lookup). |
| `qWebhooks` | DB | AUTOMATIC | 10000 | Ação específica do fluxo do PDV. |
| `splitCarregamento` | DB | MANUAL | 10000 | Ação específica do fluxo do PDV. |
| `confirmarWebhook` | API | MANUAL | 10000 | Confirmação de etapa/ação (finalização de fluxo). |
| `confirmarWebhookSplit` | API | MANUAL | 10000 | Confirmação de etapa/ação (finalização de fluxo). |
| `httpSyncGC` | API | MANUAL | 20000 | Ação específica do fluxo do PDV. |
| `n8n_ImprimirTicket` | API | MANUAL | 10000 | Chamada HTTP para n8n (integração externa). |

---

## Actions DB (Postgres)

### `BuscarClientePorIdGC`
- **Página:** `Início`
- **Datasource:** `pdv`
- **Run:** `MANUAL` | **Timeout:** `10000ms`
- **Tipo SQL:** `SELECT`
- **Bindings/inputs dinâmicos (jsonPathKeys):**
  - `{{ this.params.id_gc }}`
  - `{{ this.params.codigo }}`
- **Tabelas/aliases referenciados (heurístico):** `public.vendas`

```sql
SELECT nome_cliente
FROM public.vendas
WHERE
  (CASE WHEN {{ this.params.id_gc }} <> '' THEN id_gc = {{ this.params.id_gc }} ELSE FALSE END)
  OR
  (CASE WHEN {{ this.params.codigo }} <> '' THEN codigo = {{ this.params.codigo }} ELSE FALSE END)
LIMIT 1;
```
**Notas técnicas**
- Esta query é **read-only** (retorna dataset para UI/controle de fluxo).
- Depende de parâmetros em `this.params`; ao chamar `Action.run`, enviar exatamente as chaves esperadas.
- Possui `LIMIT`; adequado para autocomplete/listagem. Ajustar caso precise paginação.

### `buscarPlacasPorPrefixo`
- **Página:** `Início`
- **Datasource:** `pdv`
- **Run:** `AUTOMATIC` | **Timeout:** `10000ms`
- **Tipo SQL:** `SELECT`
- **Bindings/inputs dinâmicos (jsonPathKeys):**
  - `{{ this.params.placa_search }}`
- **Tabelas/aliases referenciados (heurístico):** `placas`

```sql
SELECT id, placa
FROM placas
WHERE placa ILIKE {{this.params.placa_search}} || '%'
ORDER BY placa
LIMIT 20;
```
**Notas técnicas**
- Esta query é **read-only** (retorna dataset para UI/controle de fluxo).
- Possui `LIMIT`; adequado para autocomplete/listagem. Ajustar caso precise paginação.

### `buscarPorCodigo`
- **Página:** `Início`
- **Datasource:** `Ajuste`
- **Run:** `MANUAL` | **Timeout:** `10000ms`
- **Tipo SQL:** `SELECT`
- **Bindings/inputs dinâmicos (jsonPathKeys):**
  - `{{ input_busca.text }}`
- **Tabelas/aliases referenciados (heurístico):** `produtos_venda`, `vendas`

```sql
SELECT v.id_gc, v.codigo, v.data, v.nome_cliente, v.situacao,
       STRING_AGG(p.nome_produto, ', ') AS produtos
FROM vendas v
JOIN produtos_venda p ON p.venda_id = v.id_gc
WHERE v.codigo = {{input_busca.text}}
GROUP BY v.id_gc, v.codigo, v.data, v.nome_cliente, v.situacao
LIMIT 10;
```
**Notas técnicas**
- Esta query é **read-only** (retorna dataset para UI/controle de fluxo).
- Possui `LIMIT`; adequado para autocomplete/listagem. Ajustar caso precise paginação.

### `buscarPorPlaca`
- **Página:** `Início`
- **Datasource:** `Ajuste`
- **Run:** `MANUAL` | **Timeout:** `10000ms`
- **Tipo SQL:** `SELECT`
- **Bindings/inputs dinâmicos (jsonPathKeys):**
  - `{{ input_busca.text }}`
- **Tabelas/aliases referenciados (heurístico):** `carregamentos`, `produtos_venda`, `vendas`

```sql
SELECT v.id_gc, v.codigo, v.data, v.nome_cliente, v.situacao,
       STRING_AGG(p.nome_produto, ', ') AS produtos
FROM vendas v
JOIN produtos_venda p ON p.venda_id = v.id_gc
WHERE v.id_gc IN (
    SELECT DISTINCT venda_id
    FROM carregamentos
    WHERE placa = {{input_busca.text}}
)
GROUP BY v.id_gc, v.codigo, v.data, v.nome_cliente, v.situacao
LIMIT 10;
```
**Notas técnicas**
- Esta query é **read-only** (retorna dataset para UI/controle de fluxo).
- Possui `LIMIT`; adequado para autocomplete/listagem. Ajustar caso precise paginação.

### `buscarUsuarioPorEmail`
- **Página:** `Início`
- **Datasource:** `pdv`
- **Run:** `MANUAL` | **Timeout:** `10000ms`
- **Tipo SQL:** `SELECT`
- **Bindings/inputs dinâmicos (jsonPathKeys):**
  - `{{ this.params.email }}`
- **Tabelas/aliases referenciados (heurístico):** `usuarios`

```sql
SELECT id, nome, email
FROM usuarios
WHERE email = {{ this.params.email }}
LIMIT 1;
```
**Notas técnicas**
- Esta query é **read-only** (retorna dataset para UI/controle de fluxo).
- Depende de parâmetros em `this.params`; ao chamar `Action.run`, enviar exatamente as chaves esperadas.
- Possui `LIMIT`; adequado para autocomplete/listagem. Ajustar caso precise paginação.

### `buscarVendas`
- **Página:** `Início`
- **Datasource:** `pdv`
- **Run:** `AUTOMATIC` | **Timeout:** `10000ms`
- **Tipo SQL:** `WITH/SELECT`
- **Bindings/inputs dinâmicos (jsonPathKeys):**
  - `{{ input_busca.text }}`
- **Tabelas/aliases referenciados (heurístico):** `carregamentos`, `carregamentos_linhas`, `catalogo`, `catalogo_raw`, `contrato`, `filtro`, `produtos_carregamento`, `produtos_venda`, `vendas`, `vendas_alvo`

```sql
WITH filtro AS (
  SELECT trim(upper({{input_busca.text}})) AS entrada
),
tipos AS (
  SELECT
    entrada,
    (entrada ~ '^[A-Z]{3}[0-9]{4}$')           AS eh_placa_antiga,
    (entrada ~ '^[A-Z]{3}[0-9][A-Z][0-9]{2}$') AS eh_placa_mercosul,
    (entrada ~ '^[0-9]+$')                     AS eh_numerico,
    -- Novo: detecta se é texto livre (não é placa nem numérico)
    NOT (entrada ~ '^[A-Z]{3}[0-9]{4}$' OR entrada ~ '^[A-Z]{3}[0-9][A-Z][0-9]{2}$' OR entrada ~ '^[0-9]+$') AS eh_texto_livre
  FROM filtro
),
vendas_alvo AS (
  SELECT v.id_gc AS venda_id FROM vendas v, tipos t WHERE t.eh_numerico AND v.codigo::text = t.entrada
  UNION
  SELECT c.venda_id FROM carregamentos c, tipos t 
  WHERE t.eh_numerico AND c.id::text = t.entrada
    AND c.status NOT IN ('concluido', 'cancelado')  -- FILTRO: excluir concluídos e cancelados
  UNION
  SELECT c2.venda_id FROM carregamentos c2, tipos t
  WHERE (t.eh_placa_antiga OR t.eh_placa_mercosul)
    AND replace(upper(coalesce(c2.placa,'')),'-','') = replace(t.entrada,'-','')
    AND c2.status NOT IN ('concluido', 'cancelado')  -- FILTRO: excluir concluídos e cancelados
  UNION
  -- Novo: busca por nome do cliente
  SELECT v.id_gc AS venda_id FROM vendas v, tipos t
  WHERE t.eh_texto_livre 
    AND upper(v.nome_cliente) LIKE '%' || t.entrada || '%'
),
catalogo_raw AS (
  SELECT COALESCE(pv.produto_id, pv.nome_produto) AS codigo, pv.nome_produto AS nome FROM produtos_venda pv
  UNION ALL
  SELECT pc.produto_id, pc.nome_produto FROM produtos_carregamento pc
),
catalogo AS (
  SELECT codigo,
         COALESCE(MAX(nome) FILTER (WHERE nome !~ '^[Pp][0-9]{3}$'), MAX(nome)) AS nome
  FROM catalogo_raw GROUP BY codigo
),

/* CONTRATO */
contrato AS (
  SELECT
    v.id_gc, v.codigo, v.data, v.nome_cliente, v.situacao,
    NULL::bigint  AS carregamento_id,
    NULL::text    AS placa,
    NULL::text    AS placa_display,
    (SELECT STRING_AGG(DISTINCT COALESCE(cat.nome, p.nome_produto), ', ')
       FROM produtos_venda p
       LEFT JOIN catalogo cat ON cat.codigo = COALESCE(p.produto_id, p.nome_produto)
      WHERE p.venda_id = v.id_gc) AS produto_display,
    (SELECT STRING_AGG(DISTINCT COALESCE(cat.nome, p2.nome_produto), ', ')
       FROM produtos_venda p2
       LEFT JOIN catalogo cat ON cat.codigo = COALESCE(p2.produto_id, p2.nome_produto)
      WHERE p2.venda_id = v.id_gc) AS produtos,
    'Contrato (sem carregamento)' AS tag_label,
    'contrato'                    AS tag_key,
    'contrato'                    AS linha_tipo,
    FALSE                         AS is_carregamento,
    v.situacao                    AS status_item,
    0.00::numeric                 AS tara_total_kg,
    0::smallint                   AS eixos,
    NULL::jsonb                   AS tara_eixos,
    NULL::integer                 AS motorista_id,
    NULL::bigint                  AS transportadora_id,
    NULL::bigint                  AS produto_venda_id,
    v.data::timestamp             AS ordenacao_data
  FROM vendas v
  WHERE EXISTS (SELECT 1 FROM vendas_alvo va WHERE va.venda_id = v.id_gc)
),

/* CARREGAMENTOS (apenas não concluídos e não cancelados) */
carregamentos_linhas AS (
  SELECT
    v.id_gc, v.codigo, v.data, v.nome_cliente, v.situacao,
    c.id                                  AS carregamento_id,
    c.placa,
    upper(replace(coalesce(c.placa,''),'-','')) AS placa_display,
    COALESCE(
      STRING_AGG(DISTINCT COALESCE(pc.nome_produto, cat_pc.nome), ', '),
      COALESCE(cat_pv.nome, pv.nome_produto)
    ) AS produto_display,
    COALESCE(
      STRING_AGG(DISTINCT COALESCE(pc.nome_produto, cat_pc.nome), ', '),
      COALESCE(cat_pv.nome, pv.nome_produto)
    ) AS produtos,
    'Carregamento (tara registrada)'      AS tag_label,
    'carreg_tara'                         AS tag_key,
    'carregamento'                        AS linha_tipo,
    TRUE                                  AS is_carregamento,
    c.status                              AS status_item,
    COALESCE(c.tara_total, 0.00)          AS tara_total_kg,
    c.eixos,
    c.tara_eixos,
    c.motorista_id,
    c.transportadora_id,
    c.produto_venda_id,
    COALESCE(c.data_carregamento, v.data::timestamp) AS ordenacao_data
  FROM carregamentos c
  JOIN vendas v                   ON v.id_gc = c.venda_id
  LEFT JOIN produtos_carregamento pc ON pc.carregamento_id = c.id
  LEFT JOIN produtos_venda pv        ON pv.id = c.produto_venda_id
  LEFT JOIN catalogo cat_pc          ON cat_pc.codigo = pc.produto_id
  LEFT JOIN catalogo cat_pv          ON cat_pv.codigo = COALESCE(pv.produto_id, pv.nome_produto)
  WHERE c.venda_id IN (SELECT venda_id FROM vendas_alvo)
    AND c.status NOT IN ('concluido', 'cancelado')  -- FILTRO: excluir concluídos e cancelados
  GROUP BY
    v.id_gc, v.codigo, v.data, v.nome_cliente, v.situacao,
    c.id, c.placa, c.data_carregamento,
    pv.nome_produto, cat_pv.nome, c.status, c.tara_total,
    c.eixos, c.tara_eixos, c.motorista_id, c.transportadora_id, c.produto_venda_id
)

SELECT
  id_gc, codigo, data, nome_cliente, situacao,
  carregamento_id, placa, placa_display,
  produto_display, produtos,
  tag_label, tag_key,
  linha_tipo, is_carregamento, status_item,
  tara_total_kg,
  eixos, tara_eixos, motorista_id, transportadora_id, produto_venda_id,
  ordenacao_data
FROM carregamentos_linhas

UNION ALL

SELECT
  id_gc, codigo, data, nome_cliente, situacao,
  carregamento_id, placa, placa_display,
  produto_display, produtos,
  tag_label, tag_key,
  linha_tipo, is_carregamento, status_item,
  tara_total_kg,
  eixos, tara_eixos, motorista_id, transportadora_id, produto_venda_id,
  ordenacao_data
FROM contrato

ORDER BY ordenacao_data DESC
LIMIT 30;
```
**Notas técnicas**
- Esta query é **read-only** (retorna dataset para UI/controle de fluxo).
- Possui `LIMIT`; adequado para autocomplete/listagem. Ajustar caso precise paginação.
- Usa `UNION/UNION ALL`; atenção a compatibilidade de tipos/ordem de colunas entre selects.
- Usa CTE (`WITH`); facilita composição de dataset (contratos + carregamentos etc.).

### `confirmarCarregamento`
- **Página:** `Início`
- **Datasource:** `pdv`
- **Run:** `MANUAL` | **Timeout:** `10000ms`
- **Tipo SQL:** `WITH/SELECT`
- **Bindings/inputs dinâmicos (jsonPathKeys):**
  - `{{ this.params.produto_id }}`
  - `{{ this.params.quantidade_liquida }}`
  - `{{ this.params.produto_nome }}`
  - `{{ this.params.carregamento_id }}`
  - `{{ this.params.peso_final_eixos }}`
- **Tabelas/aliases referenciados (heurístico):** `_ctx`, `carregamentos`, `ins_produto`, `produtos_carregamento`, `produtos_venda`, `upd_saldo`

```sql
-- SQL com conversão de KG para TON
WITH _ctx AS (
  SELECT
    {{ this.params.carregamento_id }}::int AS carregamento_id,
    {{ this.params.produto_id }}::text AS produto_id,
    COALESCE(
      NULLIF('{{ this.params.produto_nome }}'::text, 'null'),
      NULLIF('{{ this.params.produto_nome }}'::text, ''),
      'Produto ID: ' || '{{ this.params.produto_id }}'::text
    ) AS nome_produto,
    -- CONVERSÃO: KG -> TON
    ({{ this.params.quantidade_liquida }}::numeric / 1000) AS quantidade_ton,
    'TON' AS unidade,  -- Forçar unidade para TON
    COALESCE(
      NULLIF('{{ this.params.peso_final_eixos }}'::text, 'null'),
      NULLIF('{{ this.params.peso_final_eixos }}'::text, ''),
      '[]'
    )::jsonb AS peso_final_eixos
),
ins_produto AS (
  INSERT INTO produtos_carregamento (
    carregamento_id, produto_id, nome_produto, quantidade, unidade
  )
  SELECT ctx.carregamento_id, ctx.produto_id, ctx.nome_produto, ctx.quantidade_ton, ctx.unidade
  FROM _ctx ctx
  JOIN carregamentos c ON c.id = ctx.carregamento_id
  JOIN produtos_venda pv ON pv.id = c.produto_venda_id
  WHERE pv.quantidade >= ctx.quantidade_ton  -- Comparação em TON
  RETURNING id
),
upd_carregamento AS (
  UPDATE carregamentos 
  SET 
    peso_final_total = ctx.quantidade_ton,  -- Armazenar em TON
    peso_final_eixos = ctx.peso_final_eixos,
    finalizado_em = CURRENT_TIMESTAMP,
    status = 'concluido'
  FROM _ctx ctx
  WHERE carregamentos.id = ctx.carregamento_id
    AND EXISTS (SELECT 1 FROM ins_produto)
  RETURNING carregamentos.id
),
upd_saldo AS (
  UPDATE produtos_venda 
  SET quantidade = GREATEST(0, produtos_venda.quantidade - ctx.quantidade_ton)
  FROM _ctx ctx
  JOIN carregamentos c ON c.id = ctx.carregamento_id
  WHERE produtos_venda.id = c.produto_venda_id
    AND EXISTS (SELECT 1 FROM ins_produto)
  RETURNING produtos_venda.id, produtos_venda.quantidade AS novo_saldo
)
SELECT 
  (SELECT id FROM ins_produto) AS item_carregamento_id,
  (SELECT COUNT(*) FROM ins_produto) > 0 AS sucesso,
  (SELECT novo_saldo FROM upd_saldo) AS novo_saldo_contrato;
```
**Notas técnicas**
- Esta query é **read-only** (retorna dataset para UI/controle de fluxo).
- Depende de parâmetros em `this.params`; ao chamar `Action.run`, enviar exatamente as chaves esperadas.
- Usa CTE (`WITH`); facilita composição de dataset (contratos + carregamentos etc.).

### `criarCarregamentoEmEspera`
- **Página:** `Início`
- **Datasource:** `pdv`
- **Run:** `MANUAL` | **Timeout:** `10000ms`
- **Tipo SQL:** `WITH/SELECT`
- **Bindings/inputs dinâmicos (jsonPathKeys):**
  - `{{ this.params.produto_venda_id }}`
  - `{{ this.params.placa_norm }}`
  - `{{ this.params.motorista_id }}`
  - `{{ this.params.transportadora_id }}`
  - `{{ this.params.eixos_in }}`
  - `{{ this.params.venda_id_txt }}`
  - `{{ this.params.observacoes }}`
  - `{{ this.params.qtd_desejada }}`
  - `{{ this.params.tara_total }}`
  - `{{ this.params.detalhes_produto }}`
  - `{{ this.params.tara_eixos_raw }}`
- **Tabelas/aliases referenciados (heurístico):** `calc`, `checks`, `diag`, `existente`, `ins`, `jsonb_array_elements`, `map_venda`, `params`, `public.carregamentos`, `public.produtos_venda`, `public.vendas`, `raw`, `upd`

```sql
WITH raw AS (
  SELECT
    {{ this.params.venda_id_txt }}::text        AS venda_key_in,
    {{ this.params.motorista_id }}::text        AS motorista_id_in,
    {{ this.params.transportadora_id }}::text   AS transportadora_id_in,
    {{ this.params.placa_norm }}::text          AS placa_norm_in,
    {{ this.params.eixos_in }}::text            AS eixos_in_txt,
    {{ this.params.tara_eixos_raw }}::text      AS tara_eixos_raw_txt,
    {{ this.params.tara_total }}::text          AS tara_total_txt,
    {{ this.params.produto_venda_id }}::text    AS produto_venda_id_txt,
    {{ this.params.observacoes }}::text         AS observacoes_in,
    {{ this.params.detalhes_produto }}::text    AS detalhes_produto_in,
    {{ this.params.qtd_desejada }}::text        AS qtd_desejada_in
),
params AS (
  SELECT
    COALESCE(TRIM(venda_key_in), '') AS venda_key_in,

    CASE WHEN TRIM(motorista_id_in) ~ '^\d+$'
         THEN TRIM(motorista_id_in)::int ELSE NULL END              AS motorista_id,

    CASE WHEN TRIM(COALESCE(transportadora_id_in,'')) ~ '^\d+$'
           AND TRIM(transportadora_id_in) <> '0'
         THEN TRIM(transportadora_id_in)::bigint ELSE NULL END      AS transportadora_id,

    REGEXP_REPLACE(UPPER(COALESCE(placa_norm_in,'')),'-','','g')    AS placa_norm,

    CASE WHEN TRIM(eixos_in_txt) ~ '^\d+$'
         THEN TRIM(eixos_in_txt)::smallint ELSE NULL END            AS eixos_in,

    CASE
      WHEN TRIM(COALESCE(tara_eixos_raw_txt,'')) ~ '^\s*\[.*\]\s*$'
      THEN TRIM(COALESCE(tara_eixos_raw_txt,''))::jsonb
      ELSE '[]'::jsonb
    END                                                             AS tara_eixos_raw,

    CASE WHEN TRIM(COALESCE(tara_total_txt,'')) ~ '^\d+(\.\d+)?$'
         THEN TRIM(tara_total_txt)::numeric(12,3) ELSE NULL END     AS tara_total,

    CASE WHEN TRIM(produto_venda_id_txt) ~ '^\d+$'
         THEN TRIM(produto_venda_id_txt)::int ELSE NULL END         AS produto_venda_id,
         
    COALESCE(TRIM(observacoes_in), '')                              AS observacoes,
    COALESCE(TRIM(detalhes_produto_in), '')                         AS detalhes_produto,
    COALESCE(TRIM(qtd_desejada_in), '')                             AS qtd_desejada
  FROM raw
),

map_venda AS (
  SELECT
    p.motorista_id,
    p.transportadora_id,
    p.placa_norm,
    p.eixos_in,
    p.tara_eixos_raw,
    p.tara_total,
    p.produto_venda_id,
    p.observacoes,
    p.detalhes_produto,
    p.qtd_desejada,
    COALESCE(v1.id_gc::text, v2.id_gc::text) AS venda_id_gc
  FROM params p
  LEFT JOIN public.vendas v1 ON TRIM(v1.id_gc::text)  = TRIM(p.venda_key_in)
  LEFT JOIN public.vendas v2 ON TRIM(v2.codigo::text) = TRIM(p.venda_key_in)
),

existente AS (
  SELECT
    cx.id, cx.venda_id, cx.placa, cx.eixos, cx.tara_total, cx.status
  FROM public.carregamentos cx
  JOIN map_venda mv ON mv.venda_id_gc IS NOT NULL
  WHERE cx.venda_id = mv.venda_id_gc
    AND replace(upper(coalesce(cx.placa,'')),'-','') = mv.placa_norm
    AND cx.status = 'pendente'
  ORDER BY cx.id DESC
  LIMIT 1
),

calc AS (
  SELECT
    mv.venda_id_gc,
    mv.motorista_id,
    mv.transportadora_id,
    mv.placa_norm,
    mv.eixos_in,
    mv.tara_eixos_raw,
    mv.tara_total,
    mv.produto_venda_id,
    mv.observacoes,
    mv.detalhes_produto,
    mv.qtd_desejada,
    CASE
      WHEN mv.eixos_in = 1 THEN 1
      WHEN mv.eixos_in BETWEEN 2 AND 5 THEN mv.eixos_in
      ELSE NULL
    END AS eixos_ok,
    CASE
      WHEN mv.eixos_in = 1 THEN NULL::jsonb
      ELSE (
        SELECT jsonb_agg(val)
        FROM jsonb_array_elements(mv.tara_eixos_raw) WITH ORDINALITY t(val, ord)
        WHERE ord <= mv.eixos_in
      )
    END AS tara_eixos_ok
  FROM map_venda mv
),

checks AS (
  SELECT
    c.venda_id_gc,
    c.motorista_id,
    c.transportadora_id,
    c.placa_norm,
    c.eixos_ok,
    c.tara_eixos_ok,
    c.tara_total,
    c.produto_venda_id,
    c.observacoes,
    c.detalhes_produto,
    c.qtd_desejada,

    v.id_gc IS NOT NULL                                 AS ok_venda,
    pv.id IS NOT NULL                                   AS ok_produto_na_venda,
    c.motorista_id IS NOT NULL                          AS ok_motorista,
    c.placa_norm <> ''                                  AS ok_placa,
    (c.eixos_ok BETWEEN 1 AND 5)                        AS ok_eixos,
    CASE
      WHEN c.eixos_ok = 1
        THEN COALESCE(c.tara_total,0) > 0
      WHEN c.eixos_ok BETWEEN 2 AND 5
        THEN jsonb_array_length(c.tara_eixos_ok) = c.eixos_ok
      ELSE FALSE
    END                                                 AS ok_tara,

    EXISTS (SELECT 1 FROM existente)                    AS existe_em_espera,

    array_remove(ARRAY[
      CASE WHEN v.id_gc IS NULL THEN 'venda inválida' END,
      CASE WHEN pv.id IS NULL THEN 'produto não pertence à venda' END,
      CASE WHEN c.motorista_id IS NULL THEN 'motorista não informado' END,
      CASE WHEN c.placa_norm = '' THEN 'placa não informada' END,
      CASE WHEN NOT (c.eixos_ok BETWEEN 1 AND 5) THEN 'nº de eixos inválido (1..5)' END,
      CASE
        WHEN c.eixos_ok = 1 AND NOT (COALESCE(c.tara_total,0) > 0) THEN 'tara total inválida (modo único)'
        WHEN c.eixos_ok BETWEEN 2 AND 5 AND NOT (jsonb_array_length(c.tara_eixos_ok) = c.eixos_ok) THEN 'tara por eixo inválida'
        ELSE NULL
      END
    ], NULL) AS erros
  FROM calc c
  LEFT JOIN public.vendas v
    ON v.id_gc = c.venda_id_gc
  LEFT JOIN public.produtos_venda pv
    ON pv.id = c.produto_venda_id
   AND pv.venda_id = v.id_gc
),

upd AS (
  UPDATE public.carregamentos
  SET
    motorista_id = k.motorista_id,
    transportadora_id = k.transportadora_id,
    eixos = k.eixos_ok,
    tara_eixos = CASE WHEN k.eixos_ok = 1 THEN NULL ELSE k.tara_eixos_ok END,
    tara_total = k.tara_total,
    produto_venda_id = k.produto_venda_id,
    observacoes = CASE WHEN k.observacoes = '' THEN NULL ELSE k.observacoes END,
    detalhes_produto = CASE WHEN k.detalhes_produto = '' THEN NULL ELSE k.detalhes_produto END,
    qtd_desejada = CASE WHEN k.qtd_desejada = '' THEN NULL ELSE k.qtd_desejada END
  FROM checks k, existente e
  WHERE carregamentos.id = e.id
    AND k.existe_em_espera
    AND k.ok_venda
    AND k.ok_produto_na_venda
    AND k.ok_motorista
    AND k.ok_placa
    AND k.ok_eixos
    AND k.ok_tara
  RETURNING 
    carregamentos.id, 
    carregamentos.venda_id, 
    carregamentos.placa, 
    carregamentos.eixos, 
    carregamentos.tara_total, 
    carregamentos.status, 
    'EXISTENTE'::text AS origem, 
    ''::text AS motivo
),

ins AS (
  INSERT INTO public.carregamentos (
    venda_id, motorista_id, transportadora_id, placa, eixos,
    produto_venda_id, tara_eixos, tara_total, data_carregamento, status, 
    observacoes, detalhes_produto, qtd_desejada
  )
  SELECT
    k.venda_id_gc,
    k.motorista_id,
    k.transportadora_id,
    k.placa_norm,
    k.eixos_ok,
    k.produto_venda_id,
    CASE WHEN k.eixos_ok = 1 THEN NULL ELSE k.tara_eixos_ok END,
    k.tara_total,
    now(),
    'pendente',
    CASE WHEN k.observacoes = '' THEN NULL ELSE k.observacoes END,
    CASE WHEN k.detalhes_produto = '' THEN NULL ELSE k.detalhes_produto END,
    CASE WHEN k.qtd_desejada = '' THEN NULL ELSE k.qtd_desejada END
  FROM checks k
  WHERE NOT k.existe_em_espera
    AND k.ok_venda
    AND k.ok_produto_na_venda
    AND k.ok_motorista
    AND k.ok_placa
    AND k.ok_eixos
    AND k.ok_tara
  RETURNING id, venda_id, placa, eixos, tara_total, status, 'NOVO'::text AS origem, ''::text AS motivo
),

diag AS (
  SELECT
    NULL::bigint AS id,
    k.venda_id_gc AS venda_id,
    k.placa_norm  AS placa,
    k.eixos_ok    AS eixos,
    k.tara_total  AS tara_total,
    'FALHA'::text AS status,
    'DIAGNOSTICO'::text AS origem,
    CASE
      WHEN k.existe_em_espera THEN 'já existe pendente para esta venda/placa'
      ELSE COALESCE(array_to_string(k.erros, '; '), 'regras não atendidas')
    END AS motivo
  FROM checks k
  WHERE NOT EXISTS (SELECT 1 FROM ins)
    AND NOT EXISTS (SELECT 1 FROM upd)
  LIMIT 1
)

SELECT * FROM upd
UNION ALL
SELECT * FROM ins
UNION ALL
SELECT * FROM diag
LIMIT 1;
```
**Notas técnicas**
- Esta query é **read-only** (retorna dataset para UI/controle de fluxo).
- Depende de parâmetros em `this.params`; ao chamar `Action.run`, enviar exatamente as chaves esperadas.
- Possui `LIMIT`; adequado para autocomplete/listagem. Ajustar caso precise paginação.
- Usa `UNION/UNION ALL`; atenção a compatibilidade de tipos/ordem de colunas entre selects.
- Usa CTE (`WITH`); facilita composição de dataset (contratos + carregamentos etc.).

### `getCarregamentoDetalhe`
- **Página:** `Início`
- **Datasource:** `pdv`
- **Run:** `MANUAL` | **Timeout:** `10000ms`
- **Tipo SQL:** `SELECT`
- **Bindings/inputs dinâmicos (jsonPathKeys):**
  - `{{ this.params.carregamento_id }}`
- **Tabelas/aliases referenciados (heurístico):** `carregamentos`

```sql
-- getCarregamentoDetalhe
SELECT
  c.id,
  c.venda_id,
  c.placa,
  c.eixos,
  c.motorista_id,
  c.transportadora_id,
  c.tara_total,
  c.tara_eixos,
  c.status,
  c.produto_venda_id,
  c.observacoes,
  c.detalhes_produto,
  c.qtd_desejada
FROM carregamentos c
WHERE c.id = {{ this.params.carregamento_id }}::int;
```
**Notas técnicas**
- Esta query é **read-only** (retorna dataset para UI/controle de fluxo).
- Depende de parâmetros em `this.params`; ao chamar `Action.run`, enviar exatamente as chaves esperadas.

### `getParametrosPesagem`
- **Página:** `Início`
- **Datasource:** `Ajuste`
- **Run:** `ON_PAGE_LOAD` | **Timeout:** `10000ms`
- **Tipo SQL:** `SELECT`
- **Tabelas/aliases referenciados (heurístico):** `parametros_pesagem`

```sql
SELECT * FROM parametros_pesagem ORDER BY id DESC LIMIT 1;
```
**Notas técnicas**
- Esta query é **read-only** (retorna dataset para UI/controle de fluxo).
- Possui `LIMIT`; adequado para autocomplete/listagem. Ajustar caso precise paginação.

### `getProdutoVendaBasico`
- **Página:** `Início`
- **Datasource:** `pdv`
- **Run:** `MANUAL` | **Timeout:** `10000ms`
- **Tipo SQL:** `SELECT`
- **Bindings/inputs dinâmicos (jsonPathKeys):**
  - `{{ this.params.produto_venda_id }}`
- **Tabelas/aliases referenciados (heurístico):** `produtos_venda`

```sql
-- getProdutoVendaBasico
SELECT
  pv.id                                   AS produto_venda_id,
  pv.produto_id,                          -- id do produto (catálogo) -> vira produto_value no Select
  COALESCE(NULLIF(pv.nome_produto, ''), 'Produto') AS nome_produto,
  COALESCE(pv.quantidade, 0)::numeric     AS quantidade             -- quantidade do contrato
FROM produtos_venda pv
WHERE pv.id = {{ this.params.produto_venda_id }}::int
LIMIT 1;
```
**Notas técnicas**
- Esta query é **read-only** (retorna dataset para UI/controle de fluxo).
- Depende de parâmetros em `this.params`; ao chamar `Action.run`, enviar exatamente as chaves esperadas.
- Possui `LIMIT`; adequado para autocomplete/listagem. Ajustar caso precise paginação.

### `inserirLogAcao`
- **Página:** `Início`
- **Datasource:** `pdv`
- **Run:** `MANUAL` | **Timeout:** `10000ms`
- **Tipo SQL:** `INSERT`
- **Bindings/inputs dinâmicos (jsonPathKeys):**
  - `{{ this.params.acao }}`
  - `{{ this.params.carregamento_id }}`
  - `{{ this.params.usuario_id }}`
- **Tabelas/aliases referenciados (heurístico):** `logs_acao`

```sql
INSERT INTO logs_acao (
  carregamento_id, 
  usuario_id, 
  acao
) VALUES (
  {{ this.params.carregamento_id }},
  {{ this.params.usuario_id }},
  {{ this.params.acao }}
)
RETURNING id, data;
```
**Notas técnicas**
- Esta query **altera estado** no banco. Garanta que o chamador trate erros e que exista transação lógica no fluxo do Appsmith.
- Depende de parâmetros em `this.params`; ao chamar `Action.run`, enviar exatamente as chaves esperadas.

### `listarMotoristasDaVenda`
- **Página:** `Início`
- **Datasource:** `Ajuste`
- **Run:** `MANUAL` | **Timeout:** `10000ms`
- **Tipo SQL:** `WITH/SELECT`
- **Bindings/inputs dinâmicos (jsonPathKeys):**
  - `{{ appsmith.store.vendaSelecionada.id_gc }}`
- **Tabelas/aliases referenciados (heurístico):** `carregamentos`, `m_hist`, `m_por_t`, `motoristas`, `t_ids`, `venda_sel`, `vendas`

```sql
WITH venda_sel AS (
  SELECT {{ appsmith.store.vendaSelecionada.id_gc }}::text AS vid
),
t_ids AS (
  SELECT v.transportadora_id AS id_gc
  FROM vendas v JOIN venda_sel vs ON vs.vid = v.id_gc
  WHERE v.transportadora_id IS NOT NULL
  UNION
  SELECT DISTINCT c.transportadora_id
  FROM carregamentos c JOIN venda_sel vs ON vs.vid = c.venda_id
  WHERE c.transportadora_id IS NOT NULL
),
m_por_t AS (
  SELECT m.id, m.nome, 0 AS prioridade
  FROM motoristas m
  JOIN t_ids t ON t.id_gc = m.transportadora_id
),
m_hist AS (
  SELECT DISTINCT m.id, m.nome, -1 AS prioridade
  FROM carregamentos c
  JOIN venda_sel vs ON vs.vid = c.venda_id
  JOIN motoristas m  ON m.id = c.motorista_id
  WHERE c.motorista_id IS NOT NULL
)
SELECT DISTINCT id, nome
FROM (SELECT * FROM m_hist UNION ALL SELECT * FROM m_por_t) x
ORDER BY MIN(x.prioridade) OVER (PARTITION BY x.id), nome;
```
**Notas técnicas**
- Esta query é **read-only** (retorna dataset para UI/controle de fluxo).
- Usa `UNION/UNION ALL`; atenção a compatibilidade de tipos/ordem de colunas entre selects.
- Usa CTE (`WITH`); facilita composição de dataset (contratos + carregamentos etc.).

### `listarMotoristasPorPlaca`
- **Página:** `Início`
- **Datasource:** `Ajuste`
- **Run:** `AUTOMATIC` | **Timeout:** `10000ms`
- **Tipo SQL:** `WITH/SELECT`
- **Bindings/inputs dinâmicos (jsonPathKeys):**
  - `{{ (appsmith.store.placa_norm || selecaoPlaca.selectedOptionValue || '') }}`
- **Tabelas/aliases referenciados (heurístico):** `carregamentos`, `historico`, `motoristas`, `placa_norm`, `placas`, `placas_motoristas`, `src`, `vinculo`

```sql
WITH placa_norm AS (
  SELECT replace(upper({{ (appsmith.store.placa_norm || selecaoPlaca.selectedOptionValue || '') }}),'-','') AS pn
),
vinculo AS (
  SELECT m.id, m.nome, 0 AS prioridade
  FROM placas p
  JOIN placas_motoristas pm ON pm.placa_id = p.id
  JOIN motoristas m        ON m.id = pm.motorista_id
  JOIN placa_norm x        ON replace(upper(p.placa),'-','') = x.pn
),
historico AS (
  SELECT m.id, m.nome, -1 AS prioridade
  FROM carregamentos c
  JOIN motoristas m  ON m.id = c.motorista_id
  JOIN placa_norm x  ON replace(upper(c.placa),'-','') = x.pn
  WHERE c.motorista_id IS NOT NULL
),
src AS (
  SELECT * FROM historico
  UNION ALL
  SELECT * FROM vinculo
)
SELECT id, nome, MIN(prioridade) AS prioridade
FROM src
GROUP BY id, nome
ORDER BY prioridade, nome;
```
**Notas técnicas**
- Esta query é **read-only** (retorna dataset para UI/controle de fluxo).
- Usa `UNION/UNION ALL`; atenção a compatibilidade de tipos/ordem de colunas entre selects.
- Usa CTE (`WITH`); facilita composição de dataset (contratos + carregamentos etc.).

### `listarPlacasDaVenda`
- **Página:** `Início`
- **Datasource:** `pdv`
- **Run:** `MANUAL` | **Timeout:** `10000ms`
- **Tipo SQL:** `WITH/SELECT`
- **Bindings/inputs dinâmicos (jsonPathKeys):**
  - `{{ appsmith.store.vendaSelecionada.id_gc }}`
- **Tabelas/aliases referenciados (heurístico):** `carregamentos`, `m_ids`, `motoristas`, `placas`, `placas_hist`, `placas_motoristas`, `placas_por_motorista`, `placas_por_transportadora`, `placas_transportadoras`, `t_ids`, `venda_sel`, `vendas`

```sql
WITH venda_sel AS (
  SELECT {{ appsmith.store.vendaSelecionada.id_gc }}::text AS vid
),
t_ids AS (
  SELECT v.transportadora_id AS id_gc
  FROM vendas v JOIN venda_sel vs ON vs.vid = v.id_gc
  WHERE v.transportadora_id IS NOT NULL
  UNION
  SELECT DISTINCT c.transportadora_id
  FROM carregamentos c JOIN venda_sel vs ON vs.vid = c.venda_id
  WHERE c.transportadora_id IS NOT NULL
),
m_ids AS (
  SELECT DISTINCT m.id
  FROM carregamentos c
  JOIN venda_sel vs ON vs.vid = c.venda_id
  JOIN motoristas m  ON m.id = c.motorista_id
  WHERE c.motorista_id IS NOT NULL
  UNION
  SELECT DISTINCT m.id
  FROM motoristas m
  JOIN t_ids t ON t.id_gc = m.transportadora_id
),
placas_hist AS (
  SELECT DISTINCT c.placa FROM carregamentos c
  JOIN venda_sel vs ON vs.vid = c.venda_id
  WHERE c.placa IS NOT NULL
),
placas_por_motorista AS (
  SELECT DISTINCT p.placa
  FROM placas_motoristas pm
  JOIN m_ids m ON m.id = pm.motorista_id
  JOIN placas p ON p.id = pm.placa_id
),
placas_por_transportadora AS (
  SELECT DISTINCT p.placa
  FROM placas_transportadoras pt
  JOIN t_ids t ON t.id_gc = pt.transportadora_id
  JOIN placas p ON p.id = pt.placa_id
)
SELECT DISTINCT placa
FROM (
  SELECT * FROM placas_hist
  UNION ALL
  SELECT * FROM placas_por_motorista
  UNION ALL
  SELECT * FROM placas_por_transportadora
) x
ORDER BY placa;
```
**Notas técnicas**
- Esta query é **read-only** (retorna dataset para UI/controle de fluxo).
- Usa `UNION/UNION ALL`; atenção a compatibilidade de tipos/ordem de colunas entre selects.
- Usa CTE (`WITH`); facilita composição de dataset (contratos + carregamentos etc.).

### `listarPlacasRecentes`
- **Página:** `Início`
- **Datasource:** `pdv`
- **Run:** `AUTOMATIC` | **Timeout:** `10000ms`
- **Tipo SQL:** `(SELECT`
- **Bindings/inputs dinâmicos (jsonPathKeys):**
  - `{{ appsmith.store.placa_norm || 'IMPOSSIVEL' }}`
- **Tabelas/aliases referenciados (heurístico):** `placas`

```sql
(SELECT placa, 1 as ordem
FROM placas 
WHERE placa = {{appsmith.store.placa_norm || 'IMPOSSIVEL'}})
UNION ALL
(SELECT placa, 2 as ordem
FROM placas 
ORDER BY placa 
LIMIT 50)
ORDER BY ordem, placa;
```
**Notas técnicas**
- Esta query é **read-only** (retorna dataset para UI/controle de fluxo).
- Possui `LIMIT`; adequado para autocomplete/listagem. Ajustar caso precise paginação.
- Usa `UNION/UNION ALL`; atenção a compatibilidade de tipos/ordem de colunas entre selects.

### `listarPlacasTodos`
- **Página:** `Início`
- **Datasource:** `pdv`
- **Run:** `AUTOMATIC` | **Timeout:** `10000ms`
- **Tipo SQL:** `SELECT`
- **Tabelas/aliases referenciados (heurístico):** `placas`

```sql
SELECT placa FROM placas ORDER BY placa;
```
**Notas técnicas**
- Esta query é **read-only** (retorna dataset para UI/controle de fluxo).

### `listarProdutosDaVenda`
- **Página:** `Início`
- **Datasource:** `pdv`
- **Run:** `AUTOMATIC` | **Timeout:** `10000ms`
- **Tipo SQL:** `SELECT`
- **Bindings/inputs dinâmicos (jsonPathKeys):**
  - `{{ appsmith.store.vendaSelecionada.codigo }}`
- **Tabelas/aliases referenciados (heurístico):** `produtos_venda`, `vendas`

```sql
SELECT
  pv.id::text AS produto_value,
  pv.produto_id::text AS produto_id_gc,
  pv.id AS produto_venda_id,
  NULL::int AS id_item_carreg,
  pv.nome_produto,
  pv.quantidade,
  NULL::text AS unidade,
  'VENDA' AS origem
FROM produtos_venda pv
JOIN vendas v ON pv.venda_id = v.id_gc
WHERE v.codigo = '{{ appsmith.store.vendaSelecionada.codigo }}'
ORDER BY pv.nome_produto;
```
**Notas técnicas**
- Esta query é **read-only** (retorna dataset para UI/controle de fluxo).

### `listarTransportadorasDaVenda`
- **Página:** `Início`
- **Datasource:** `Ajuste`
- **Run:** `MANUAL` | **Timeout:** `10000ms`
- **Tipo SQL:** `WITH/SELECT`
- **Bindings/inputs dinâmicos (jsonPathKeys):**
  - `{{ appsmith.store.vendaSelecionada.id_gc }}`
- **Tabelas/aliases referenciados (heurístico):** `carregamentos`, `direta`, `historico`, `transportadoras`, `venda_sel`, `vendas`

```sql
WITH venda_sel AS (
  SELECT {{ appsmith.store.vendaSelecionada.id_gc }}::text AS vid
),
direta AS (
  SELECT t.id_gc, t.nome
  FROM vendas v
  JOIN venda_sel vs ON vs.vid = v.id_gc
  JOIN transportadoras t ON t.id_gc = v.transportadora_id
  WHERE v.transportadora_id IS NOT NULL
),
historico AS (
  SELECT DISTINCT t.id_gc, t.nome
  FROM carregamentos c
  JOIN venda_sel vs ON vs.vid = c.venda_id
  JOIN transportadoras t ON t.id_gc = c.transportadora_id
  WHERE c.transportadora_id IS NOT NULL
)
SELECT DISTINCT id_gc, nome
FROM (SELECT * FROM direta UNION ALL SELECT * FROM historico) x
ORDER BY nome;
```
**Notas técnicas**
- Esta query é **read-only** (retorna dataset para UI/controle de fluxo).
- Usa `UNION/UNION ALL`; atenção a compatibilidade de tipos/ordem de colunas entre selects.
- Usa CTE (`WITH`); facilita composição de dataset (contratos + carregamentos etc.).

### `listarTransportadorasPorPlaca`
- **Página:** `Início`
- **Datasource:** `Ajuste`
- **Run:** `AUTOMATIC` | **Timeout:** `10000ms`
- **Tipo SQL:** `WITH/SELECT`
- **Bindings/inputs dinâmicos (jsonPathKeys):**
  - `{{ (appsmith.store.placa_norm || selecaoPlaca.selectedOptionValue || '') }}`
- **Tabelas/aliases referenciados (heurístico):** `carregamentos`, `historico`, `placa_norm`, `placas`, `placas_transportadoras`, `src`, `transportadoras`, `vinculo`

```sql
WITH placa_norm AS (
  SELECT replace(upper({{ (appsmith.store.placa_norm || selecaoPlaca.selectedOptionValue || '') }}),'-','') AS pn
),
-- vínculo direto: placa → placas_transportadoras → transportadoras
vinculo AS (
  SELECT t.id_gc, t.nome, 0 AS prioridade
  FROM placas p
  JOIN placas_transportadoras pt ON pt.placa_id = p.id
  JOIN transportadoras t         ON t.id_gc = pt.transportadora_id   -- ambos text
  JOIN placa_norm x              ON replace(upper(p.placa),'-','') = x.pn
),
-- histórico: carregamentos dessa placa → transportadoras usadas
historico AS (
  SELECT t.id_gc, t.nome, -1 AS prioridade
  FROM carregamentos c
  JOIN transportadoras t ON t.id_gc = c.transportadora_id::text      -- <<< CAST necessário
  JOIN placa_norm x      ON replace(upper(c.placa),'-','') = x.pn
  WHERE c.transportadora_id IS NOT NULL
),
src AS (
  SELECT * FROM historico
  UNION ALL
  SELECT * FROM vinculo
)
SELECT id_gc, nome, MIN(prioridade) AS prioridade
FROM src
GROUP BY id_gc, nome
ORDER BY prioridade, nome;
```
**Notas técnicas**
- Esta query é **read-only** (retorna dataset para UI/controle de fluxo).
- Usa `UNION/UNION ALL`; atenção a compatibilidade de tipos/ordem de colunas entre selects.
- Usa CTE (`WITH`); facilita composição de dataset (contratos + carregamentos etc.).

### `qWebhooks`
- **Página:** `Início`
- **Datasource:** `Ajuste`
- **Run:** `AUTOMATIC` | **Timeout:** `10000ms`
- **Tipo SQL:** `SELECT`
- **Tabelas/aliases referenciados (heurístico):** `webhooks_config`

```sql
SELECT * FROM webhooks_config LIMIT 1;
```
**Notas técnicas**
- Esta query é **read-only** (retorna dataset para UI/controle de fluxo).
- Possui `LIMIT`; adequado para autocomplete/listagem. Ajustar caso precise paginação.

### `splitCarregamento`
- **Página:** `Início`
- **Datasource:** `pdv`
- **Run:** `MANUAL` | **Timeout:** `10000ms`
- **Tipo SQL:** `WITH/SELECT`
- **Bindings/inputs dinâmicos (jsonPathKeys):**
  - `{{ this.params.peso_primeiro }}`
  - `{{ this.params.produto_id }}`
  - `{{ this.params.peso_total }}`
  - `{{ this.params.carregamento_original_id }}`
  - `{{ this.params.peso_segundo }}`
  - `{{ this.params.peso_final_eixos }}`
  - `{{ this.params.produto_nome }}`
- **Tabelas/aliases referenciados (heurístico):** `atualizar_original`, `atualizar_produto_original`, `atualizar_saldo`, `carregamento_original`, `carregamentos`, `novo_carregamento`, `novo_produto`, `produtos_carregamento`, `produtos_venda`

```sql
-- Query: splitCarregamento
-- Versão otimizada: atualiza original + cria apenas um novo

WITH carregamento_original AS (
  SELECT c.*, pv.quantidade as saldo_disponivel
  FROM carregamentos c
  JOIN produtos_venda pv ON pv.id = c.produto_venda_id
  WHERE c.id = {{ this.params.carregamento_original_id }}
    AND pv.quantidade >= ({{ this.params.peso_total }} / 1000.0)
),
-- Atualizar carregamento original com primeiro peso
atualizar_original AS (
  UPDATE carregamentos 
  SET 
    peso_final_total = {{ this.params.peso_primeiro }}::numeric,
    peso_final_eixos = CASE 
      WHEN COALESCE(eixos, 1) = 1 THEN peso_final_eixos  -- mantém original se só 1 eixo
      ELSE '{{ this.params.peso_final_eixos }}'::jsonb    -- atualiza se múltiplos eixos
    END,
    finalizado_em = CURRENT_TIMESTAMP,
    status = 'concluido'
  WHERE id = {{ this.params.carregamento_original_id }}
    AND EXISTS (SELECT 1 FROM carregamento_original)
  RETURNING id
),
-- Atualizar produto do carregamento original
atualizar_produto_original AS (
  UPDATE produtos_carregamento 
  SET quantidade = {{ this.params.peso_primeiro }}::numeric
  WHERE carregamento_id = {{ this.params.carregamento_original_id }}
  RETURNING id
),
-- Criar novo carregamento com segundo peso
novo_carregamento AS (
  INSERT INTO carregamentos (
    venda_id, placa, motorista_id, 
    transportadora_id,  -- incluído conforme solicitado
    produto_venda_id,
    peso_final_total, 
    peso_final_eixos,   -- incluído conforme solicitado
    finalizado_em, status, data_carregamento, 
    eixos, tara_total,
    observacoes         -- incluído conforme solicitado
  )
  SELECT 
    co.venda_id,
    co.placa,
    co.motorista_id,
    co.transportadora_id,  -- pode ser NULL
    co.produto_venda_id,
    {{ this.params.peso_segundo }}::numeric,
    CASE 
      WHEN COALESCE(co.eixos, 1) = 1 THEN co.peso_final_eixos  -- mantém original se só 1 eixo
      ELSE '{{ this.params.peso_final_eixos }}'::jsonb         -- atualiza se múltiplos eixos
    END,
    CURRENT_TIMESTAMP,
    'concluido',
    CURRENT_TIMESTAMP,
    COALESCE(co.eixos, 1),
    COALESCE(co.tara_total, 0),
    co.observacoes
  FROM carregamento_original co
  WHERE EXISTS (SELECT 1 FROM atualizar_original)
  RETURNING id
),
-- Criar produto para novo carregamento
novo_produto AS (
  INSERT INTO produtos_carregamento (
    carregamento_id, produto_id, nome_produto, quantidade, unidade
  )
  SELECT 
    nc.id,
    '{{ this.params.produto_id }}',
    '{{ this.params.produto_nome }}',
    {{ this.params.peso_segundo }}::numeric,
    'kg'
  FROM novo_carregamento nc
  RETURNING id
),
-- Atualizar saldo do produto_venda (descontar total)
atualizar_saldo AS (
  UPDATE produtos_venda 
  SET quantidade = quantidade - ({{ this.params.peso_total }} / 1000.0)
  WHERE id = (SELECT produto_venda_id FROM carregamento_original LIMIT 1)
    AND EXISTS (SELECT 1 FROM atualizar_original)
    AND EXISTS (SELECT 1 FROM novo_carregamento)
  RETURNING id, quantidade
)
SELECT 
  (SELECT id FROM atualizar_original) AS primeiro_carregamento_id,  -- carregamento original atualizado
  (SELECT id FROM novo_carregamento) AS segundo_carregamento_id,    -- novo carregamento criado
  (SELECT id FROM atualizar_original) AS carregamento_original_id,  -- mesmo ID do original
  (SELECT id FROM atualizar_produto_original) AS primeiro_produto_id,
  (SELECT id FROM novo_produto) AS segundo_produto_id,
  (SELECT id FROM atualizar_original) IS NOT NULL 
    AND (SELECT id FROM novo_carregamento) IS NOT NULL AS sucesso,
  (SELECT quantidade FROM atualizar_saldo) AS novo_saldo_contrato,
  'Split realizado com sucesso' AS mensagem;
```
**Notas técnicas**
- Esta query é **read-only** (retorna dataset para UI/controle de fluxo).
- Depende de parâmetros em `this.params`; ao chamar `Action.run`, enviar exatamente as chaves esperadas.
- Possui `LIMIT`; adequado para autocomplete/listagem. Ajustar caso precise paginação.
- Usa CTE (`WITH`); facilita composição de dataset (contratos + carregamentos etc.).

---

## Actions API (HTTP Requests)

### `confirmarWebhook`
- **Página:** `Início`
- **Datasource:** `DEFAULT_REST_DATASOURCE` (REST)
- **Run:** `MANUAL` | **Timeout:** `10000ms`
- **Método:** `POST`
- **Path (relativo ao datasource URL):** `{{ Urls.get('confirmacao') }}`
- **Bindings/inputs dinâmicos (jsonPathKeys):**
  - `{{ Urls.get('confirmacao') }}`
  - `{{ this.params.body }}`
- **Headers:**
  - `content-type`: `application/json`

**Body:**
```json
{{ this.params.body }}
```
**Notas técnicas**
- `path` é resolvido via `Urls.get(...)` (JSObject/constante). O datasource base está vazio no export; em runtime deve estar configurado.
- `this.params.body` indica que a action espera receber um payload pronto do chamador (`Action.run({ body: <obj/string> })`).
- Requisição com método de escrita; tratar timeouts e replays (idempotência) no servidor n8n/webhook.
- Recomenda-se logar requestId/timestamp no payload para rastreabilidade.

### `confirmarWebhookSplit`
- **Página:** `Início`
- **Datasource:** `DEFAULT_REST_DATASOURCE` (REST)
- **Run:** `MANUAL` | **Timeout:** `10000ms`
- **Método:** `POST`
- **Path (relativo ao datasource URL):** `{{ Urls.get('confirmacao') }}`
- **Bindings/inputs dinâmicos (jsonPathKeys):**
  - `{{ Urls.get('confirmacao') }}`
  - `{{ this.params.body }}`
- **Headers:**
  - `content-type`: `application/json`

**Body:**
```json
{{ this.params.body }}
```
**Notas técnicas**
- `path` é resolvido via `Urls.get(...)` (JSObject/constante). O datasource base está vazio no export; em runtime deve estar configurado.
- `this.params.body` indica que a action espera receber um payload pronto do chamador (`Action.run({ body: <obj/string> })`).
- Requisição com método de escrita; tratar timeouts e replays (idempotência) no servidor n8n/webhook.
- Recomenda-se logar requestId/timestamp no payload para rastreabilidade.

### `httpSyncGC`
- **Página:** `Início`
- **Datasource:** `DEFAULT_REST_DATASOURCE` (REST)
- **Run:** `MANUAL` | **Timeout:** `20000ms`
- **Método:** `POST`
- **Path (relativo ao datasource URL):** `{{ Urls.get('busca_placa') }}`
- **Bindings/inputs dinâmicos (jsonPathKeys):**
  - `{{ Urls.get('busca_placa') }}`
  - `{{ selecaoPlaca.filterText }}`
  - `{{ appsmith.user.email }}`
- **Headers:**
  - `content-type`: `text/plain`

**Body:**
```json
{
  "acao": "sync_motorista",
  "contexto": {
    "placa_digitada": "{{selecaoPlaca.filterText}}",
    "usuario": "{{appsmith.user.email}}"
  }
}
```
**Notas técnicas**
- `path` é resolvido via `Urls.get(...)` (JSObject/constante). O datasource base está vazio no export; em runtime deve estar configurado.
- Requisição com método de escrita; tratar timeouts e replays (idempotência) no servidor n8n/webhook.
- Recomenda-se logar requestId/timestamp no payload para rastreabilidade.

### `n8n_ImprimirTicket`
- **Página:** `Início`
- **Datasource:** `DEFAULT_REST_DATASOURCE` (REST)
- **Run:** `MANUAL` | **Timeout:** `10000ms`
- **Método:** `POST`
- **Path (relativo ao datasource URL):** `{{ Urls.get('ticket') }}`
- **Bindings/inputs dinâmicos (jsonPathKeys):**
  - `{{ appsmith.user ? appsmith.user.email : "" }}`
  - `{{ ImpressaoController.motoristaNome() }}`
  - `{{ ImpressaoController.vendaCodigo() }}`
  - `{{ ImpressaoController.motoristaId() }}`
  - `{{ ImpressaoController.taraTotalKg() }}`
  - `{{ ImpressaoController.vendaIdGC() }}`
  - `{{ ImpressaoController.vendaPlaca() }}`
  - `{{ new Date().toISOString() }}`
  - `{{ ImpressaoController.faseAtual() }}`
  - `{{ ImpressaoController.produtoVendaSelecionadoId() }}`
  - `{{ ImpressaoController.vendaCliente() }}`
  - `{{ ImpressaoController.observacoesCompletas() }}`
  - `{{ ImpressaoController.transportadoraId() }}`
  - `{{ ImpressaoController.transportadoraNome() }}`
  - `{{ ImpressaoController.pesosTara() }}`
  - `{{ ImpressaoController.liquidoKg() }}`
  - `{{ ImpressaoController.vendaCarregamentoId() }}`
  - `{{ ImpressaoController.pesosFinal() }}`
  - `{{ ImpressaoController.eixosSelecionados() }}`
  - `{{ ImpressaoController.produtoNome() }}`
  - `{{ ImpressaoController.vendaProdutos() }}`
  - `{{ ImpressaoController.finalTotalKg() }}`
  - `{{ appsmith.store.qtd_desejada || "" }}`
  - `{{ Urls.get('ticket') }}`
- **Headers:**
  - `Content-Type`: `application/json`

**Body (parcial; truncado para legibilidade):**
```json
{
  "acao": "imprimir_ticket",
  "pdv": "appsmith",
  "venda": {
    "codigo": {{ ImpressaoController.vendaCodigo() }},
    "id_gc": {{ ImpressaoController.vendaIdGC() }},
    "cliente": {{ ImpressaoController.vendaCliente() }},
    "placa": {{ ImpressaoController.vendaPlaca() }},
    "carregamento_id": {{ ImpressaoController.vendaCarregamentoId() }},
    "produtos": {{ ImpressaoController.vendaProdutos() }},
    "produto_venda_id": {{ ImpressaoController.produtoVendaSelecionadoId() }},
    "produto_nome": {{ ImpressaoController.produtoNome() }},
    "motorista_id": {{ ImpressaoController.motoristaId() }},
    "motorista_nome": {{ ImpressaoController.motoristaNome() }},
    "transportadora_id": {{ ImpressaoController.transportadoraId() }},
    "transportadora_nome": {{ ImpressaoController.transportadoraNome() }}
  },
  "pesagem": {
    "fase": {{ ImpressaoController.faseAtual() }},
    "eixos": {{ ImpressaoController.eixosSelecionados() }},
    "pesos_tara": {{ ImpressaoController.pesosTara() }},
    "pesos_final": {{ ImpressaoController.pesosFinal() }},
    "tara_total_kg": {{ ImpressaoController.taraTotalKg() }},
    "final_total_kg": {{ ImpressaoController.finalTotalKg() }},
    "observacoes": {{ ImpressaoController.observacoesCompletas() }},
    "qtd_desejada": {{ appsmith.store.qtd_desejada || "" }},
    "liquido_kg": {{ ImpressaoController.liquidoKg() }}
  },
  "usuario": {{ appsmith.user ? appsmith.user.email : "" }},
  "timestamp": "{{ new Date().toISOString() }}",
  "logo_data_url": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAfcAAAHwCAYAAAC7cCafAAAQAElEQVR4AexdB4AeRdl+3tny9es1uUvvvZFA6B1RAREQQRRUUFT4QREFC8EGqKAioiiCoqIGBRFFQAULIGgA6b2G9ORy7au7O/M/s3cXklAEAUnCt9lnp7d3yjPvzN1FofpUJVCVQFUCVQlUJVCVwDYlgSq5b1PdWW1MVQJVCVQlUJVAVQLAa0PuVUlWJVCVQFUCVQlUJVCVwBYjgSq5bzFdUa1IVQJVCVQlUJVAVQKvjQS2JHJ/bVpUzaUqgaoEqhKoSqAqgTe5BKrk/iYfANXmVyVQlUBVAlUJbHsS2PbIfdvro2qLqhKoSqAqgaoEqhJ4RRKokvsrElc1clUCz0nAGCMbQdHuboxrrrkmvc879mk54IADhhGtO731rfVvectbEosWLfKXGOMxroVN49C+Ia/n
...<truncado>...
```
- Observação: body contém payload grande (ex.: `logo_data_url` base64). No Appsmith isso é enviado integralmente.
**Notas técnicas**
- `path` é resolvido via `Urls.get(...)` (JSObject/constante). O datasource base está vazio no export; em runtime deve estar configurado.
- Requisição com método de escrita; tratar timeouts e replays (idempotência) no servidor n8n/webhook.
- Recomenda-se logar requestId/timestamp no payload para rastreabilidade.
