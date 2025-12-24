import { pool } from "../pool";

export async function getRelatorio(params: {
  de: string;
  ate: string;
  groupBy: "cliente" | "transportadora" | "motorista";
}) {
  let groupColumn: string;
  switch (params.groupBy) {
    case "cliente":
      groupColumn = "COALESCE(v.nome_cliente, c.cliente_nome)";
      break;
    case "transportadora":
      // Temporariamente desabilitado devido a incompatibilidade de schema
      groupColumn = "'N/A'";
      break;
    case "motorista":
      // Temporariamente desabilitado devido a incompatibilidade de schema
      groupColumn = "'N/A'";
      break;
    default:
      groupColumn = "COALESCE(v.nome_cliente, c.cliente_nome)";
  }

  const result = await pool.query(
    `
    SELECT
      ${groupColumn} as group_key,
      COUNT(*)::int as total_carregamentos,
      COALESCE(SUM(c.liquido_kg), 0)::int as total_liquido_kg
    FROM carregamentos c
    LEFT JOIN vendas v ON v.id_gc = c.id_gc
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

