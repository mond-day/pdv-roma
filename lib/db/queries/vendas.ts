import { pool } from "../pool";

/**
 * Busca unificada de vendas e carregamentos para Nova Pesagem
 * Similar ao Appsmith - retorna vendas sem carregamento + carregamentos em andamento
 */
export async function searchVendasECarregamentos(params: {
  searchText?: string;
}) {
  const searchText = params.searchText?.trim().toUpperCase() || '';

  // Se não houver busca, retornar apenas carregamentos em standby
  if (!searchText) {
    const result = await pool.query(
      `
      SELECT
        v.id_gc,
        v.codigo,
        v.data,
        v.nome_cliente,
        v.situacao,
        c.id AS carregamento_id,
        c.placa,
        c.detalhes_produto AS produto_display,
        'Carregamento (em espera)' AS tag_label,
        'carreg_standby' AS tag_key,
        'carregamento' AS linha_tipo,
        TRUE AS is_carregamento,
        c.status AS status_item,
        c.tara_total,
        c.eixos,
        c.tara_eixos,
        c.motorista_id,
        c.transportadora_id,
        c.produto_venda_id,
        COALESCE(c.data_carregamento, v.data::timestamp) AS ordenacao_data
      FROM carregamentos c
      JOIN vendas v ON v.id_gc = c.venda_id
      WHERE c.status IN ('standby', 'stand-by', 'pendente')
      ORDER BY ordenacao_data DESC
      LIMIT 30
      `
    );

    return result.rows;
  }

  // Detecção de tipo de busca
  const ehPlacaAntiga = /^[A-Z]{3}[0-9]{4}$/.test(searchText);
  const ehPlacaMercosul = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/.test(searchText);
  const ehNumerico = /^[0-9]+$/.test(searchText);
  const ehTextoLivre = !ehPlacaAntiga && !ehPlacaMercosul && !ehNumerico;

  const result = await pool.query(
    `
    WITH vendas_alvo AS (
      -- Busca por código de venda (numérico)
      SELECT v.id_gc AS venda_id
      FROM vendas v
      WHERE $2 AND v.codigo::text = $1

      UNION

      -- Busca por ID de carregamento (numérico)
      SELECT c.venda_id
      FROM carregamentos c
      WHERE $2 AND c.id::text = $1
        AND c.status NOT IN ('concluido', 'finalizado', 'cancelado')

      UNION

      -- Busca por placa
      SELECT c2.venda_id
      FROM carregamentos c2
      WHERE ($3 OR $4)
        AND REPLACE(UPPER(COALESCE(c2.placa, '')), '-', '') = REPLACE($1, '-', '')
        AND c2.status NOT IN ('concluido', 'finalizado', 'cancelado')

      UNION

      -- Busca por nome do cliente (texto livre)
      SELECT v.id_gc AS venda_id
      FROM vendas v
      WHERE $5 AND UPPER(v.nome_cliente) LIKE '%' || $1 || '%'
    ),

    /* VENDAS/CONTRATOS (sem carregamento ativo) */
    contratos AS (
      SELECT
        v.id_gc,
        v.codigo,
        v.data,
        v.nome_cliente,
        v.situacao,
        NULL::bigint AS carregamento_id,
        NULL::text AS placa,
        (
          SELECT STRING_AGG(DISTINCT pv.nome_produto, ', ')
          FROM produtos_venda pv
          WHERE pv.venda_id = v.id_gc
        ) AS produto_display,
        'Contrato (sem carregamento)' AS tag_label,
        'contrato' AS tag_key,
        'contrato' AS linha_tipo,
        FALSE AS is_carregamento,
        v.situacao AS status_item,
        NULL::numeric AS tara_total,
        NULL::smallint AS eixos,
        NULL::jsonb AS tara_eixos,
        NULL::integer AS motorista_id,
        NULL::bigint AS transportadora_id,
        NULL::bigint AS produto_venda_id,
        v.data::timestamp AS ordenacao_data
      FROM vendas v
      WHERE EXISTS (SELECT 1 FROM vendas_alvo va WHERE va.venda_id = v.id_gc)
        AND v.situacao IN ('Contrato Valor', 'Contrato Qtd')  -- Apenas contratos válidos para carregamento
        -- Excluir vendas que já têm carregamento ativo
        AND NOT EXISTS (
          SELECT 1 FROM carregamentos c
          WHERE c.venda_id = v.id_gc
            AND c.status NOT IN ('concluido', 'finalizado', 'cancelado')
        )
    ),

    /* CARREGAMENTOS (em andamento) */
    carregamentos_linhas AS (
      SELECT
        v.id_gc,
        v.codigo,
        v.data,
        v.nome_cliente,
        v.situacao,
        c.id AS carregamento_id,
        c.placa,
        COALESCE(c.detalhes_produto, pv.nome_produto) AS produto_display,
        CASE
          WHEN c.status IN ('standby', 'stand-by') THEN 'Carregamento (em espera)'
          WHEN c.status = 'pendente' THEN 'Carregamento (pendente)'
          ELSE 'Carregamento'
        END AS tag_label,
        'carreg_tara' AS tag_key,
        'carregamento' AS linha_tipo,
        TRUE AS is_carregamento,
        c.status AS status_item,
        c.tara_total,
        c.eixos,
        c.tara_eixos,
        c.motorista_id,
        c.transportadora_id,
        c.produto_venda_id,
        COALESCE(c.data_carregamento, v.data::timestamp) AS ordenacao_data
      FROM carregamentos c
      JOIN vendas v ON v.id_gc = c.venda_id
      LEFT JOIN produtos_venda pv ON pv.id = c.produto_venda_id
      WHERE c.venda_id IN (SELECT venda_id FROM vendas_alvo)
        AND c.status NOT IN ('concluido', 'finalizado', 'cancelado')
    )

    SELECT * FROM carregamentos_linhas
    UNION ALL
    SELECT * FROM contratos
    ORDER BY ordenacao_data DESC
    LIMIT 30
    `,
    [
      searchText,
      ehNumerico,
      ehPlacaAntiga,
      ehPlacaMercosul,
      ehTextoLivre
    ]
  );

  return result.rows;
}

/**
 * Lista apenas vendas disponíveis (sem carregamento ativo)
 */
export async function listVendasDisponiveis() {
  const result = await pool.query(
    `
    SELECT
      v.id_gc,
      v.codigo,
      v.data,
      v.nome_cliente,
      v.situacao,
      (
        SELECT STRING_AGG(DISTINCT pv.nome_produto, ', ')
        FROM produtos_venda pv
        WHERE pv.venda_id = v.id_gc
      ) AS produtos
    FROM vendas v
    WHERE v.situacao IN ('Contrato Valor', 'Contrato Qtd')  -- Apenas contratos válidos para carregamento
      -- Excluir vendas que já têm carregamento ativo
      AND NOT EXISTS (
        SELECT 1 FROM carregamentos c
        WHERE c.venda_id = v.id_gc
          AND c.status NOT IN ('concluido', 'finalizado', 'cancelado')
      )
    ORDER BY v.data DESC, v.codigo DESC
    LIMIT 50
    `
  );

  return result.rows;
}
