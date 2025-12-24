import { pool } from "../pool";

/**
 * Calcula quantidade disponível de um produto em uma venda
 * Quantidade disponível = Total do contrato - Já carregado (finalizados)
 */
export async function getQuantidadeDisponivel(params: {
  venda_id: string;
  produto_venda_id?: number;
}): Promise<{
  produto_venda_id: number;
  nome_produto: string;
  quantidade_total: number;
  quantidade_carregada: number;
  quantidade_disponivel: number;
  unidade: string;
}[]> {
  let whereClause = 'WHERE pv.venda_id = $1';
  const queryParams: any[] = [params.venda_id];

  if (params.produto_venda_id) {
    whereClause += ' AND pv.id = $2';
    queryParams.push(params.produto_venda_id);
  }

  const result = await pool.query(
    `
    SELECT
      pv.id as produto_venda_id,
      pv.nome_produto,
      COALESCE(pv.quantidade, 0) as quantidade_total,
      COALESCE(
        (
          SELECT SUM((c.peso_final_total - c.tara_total) / 1000.0)
          FROM carregamentos c
          WHERE c.venda_id = pv.venda_id
            AND c.produto_venda_id = pv.id
            AND c.status IN ('finalizado', 'concluido')
        ),
        0
      ) as quantidade_carregada,
      COALESCE(pv.quantidade, 0) - COALESCE(
        (
          SELECT SUM((c.peso_final_total - c.tara_total) / 1000.0)
          FROM carregamentos c
          WHERE c.venda_id = pv.venda_id
            AND c.produto_venda_id = pv.id
            AND c.status IN ('finalizado', 'concluido')
        ),
        0
      ) as quantidade_disponivel,
      'TON' as unidade
    FROM produtos_venda pv
    ${whereClause}
    ORDER BY pv.id
    `,
    queryParams
  );

  return result.rows.map(row => ({
    produto_venda_id: row.produto_venda_id,
    nome_produto: row.nome_produto,
    quantidade_total: parseFloat(row.quantidade_total) || 0,
    quantidade_carregada: parseFloat(row.quantidade_carregada) || 0,
    quantidade_disponivel: parseFloat(row.quantidade_disponivel) || 0,
    unidade: row.unidade,
  }));
}

/**
 * Lista todos os produtos de uma venda com quantidades disponíveis
 * Formato para exibição: "Produto X (XX,XXX TON disponível)"
 */
export async function listProdutosComDisponibilidade(venda_id: string) {
  const produtos = await getQuantidadeDisponivel({ venda_id });

  return produtos.map(p => ({
    ...p,
    display: `${p.nome_produto} (${p.quantidade_disponivel.toLocaleString('pt-BR', {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3
    })} TON disponível)`,
  }));
}

/**
 * Valida se quantidade desejada está disponível
 * Lança erro se não houver quantidade suficiente
 */
export async function validarQuantidadeDisponivel(params: {
  venda_id: string;
  produto_venda_id: number;
  quantidade_desejada: number;
}): Promise<void> {
  const [produto] = await getQuantidadeDisponivel({
    venda_id: params.venda_id,
    produto_venda_id: params.produto_venda_id,
  });

  if (!produto) {
    throw new Error(`Produto não encontrado no contrato`);
  }

  if (params.quantidade_desejada > produto.quantidade_disponivel) {
    throw new Error(
      `Quantidade excede disponível. ` +
      `Solicitado: ${params.quantidade_desejada.toFixed(3)} TON | ` +
      `Disponível: ${produto.quantidade_disponivel.toFixed(3)} TON`
    );
  }
}
