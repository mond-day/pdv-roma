import { pool } from "../pool";

export async function getRelatorio(params: {
  de: string;
  ate: string;
  groupBy: "cliente" | "transportadora" | "motorista";
}) {
  let groupColumn: string;
  switch (params.groupBy) {
    case "cliente":
      groupColumn = "v.nome_cliente";
      break;
    case "transportadora":
      groupColumn = "c.transportadora_id::text";
      break;
    case "motorista":
      groupColumn = "c.motorista_id::text";
      break;
    default:
      groupColumn = "v.nome_cliente";
  }

  const result = await pool.query(
    `
    SELECT 
      ${groupColumn} as group_key,
      COUNT(*)::int as total_carregamentos,
      COALESCE(SUM((c.peso_final_total - c.tara_total) * 1000), 0)::int as total_liquido_kg
    FROM carregamentos c
    LEFT JOIN vendas v ON v.id_gc = c.venda_id
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

