import { pool } from "../pool";

export async function getRelatorio(params: {
  de: string;
  ate: string;
  groupBy: "cliente" | "transportadora" | "motorista";
}) {
  let groupColumn: string;
  let joins: string;

  switch (params.groupBy) {
    case "cliente":
      groupColumn = "COALESCE(v.nome_cliente, c.cliente_nome)";
      joins = "LEFT JOIN vendas v ON v.id_gc = c.id_gc";
      break;
    case "transportadora":
      groupColumn = "COALESCE(t.nome, 'Sem Transportadora')";
      joins = `
        LEFT JOIN vendas v ON v.id_gc = c.id_gc
        LEFT JOIN transportadoras t ON t.id_gc = c.transportadora_id::text
      `;
      break;
    case "motorista":
      groupColumn = "COALESCE(m.nome, 'Sem Motorista')";
      joins = `
        LEFT JOIN vendas v ON v.id_gc = c.id_gc
        LEFT JOIN motoristas m ON m.id = c.motorista_id
      `;
      break;
    default:
      groupColumn = "COALESCE(v.nome_cliente, c.cliente_nome)";
      joins = "LEFT JOIN vendas v ON v.id_gc = c.id_gc";
  }

  const result = await pool.query(
    `
    SELECT
      ${groupColumn} as group_key,
      COUNT(*)::int as total_carregamentos,
      COALESCE(SUM(c.peso_final_total - c.tara_total), 0)::int as total_liquido_kg
    FROM carregamentos c
    ${joins}
    WHERE
      CAST(c.data_carregamento AS DATE) >= CAST($1 AS DATE)
      AND CAST(c.data_carregamento AS DATE) <= CAST($2 AS DATE)
      AND c.status = 'finalizado'
    GROUP BY ${groupColumn}
    ORDER BY total_liquido_kg DESC
    `,
    [params.de, params.ate]
  );

  return result.rows.map((row) => ({
    groupKey: row.group_key || "N/A",
    total_carregamentos: row.total_carregamentos,
    total_liquido_kg: row.total_liquido_kg,
  }));
}

