import { pool } from "../pool";

export async function getDashboardData(date: string) {
  // KPIs do dia
  const kpisResult = await pool.query(
    `
    SELECT 
      COUNT(*)::int as total,
      COUNT(*) FILTER (WHERE status = 'stand-by')::int as standby,
      COUNT(*) FILTER (WHERE status = 'concluido')::int as finalizado,
      COUNT(*) FILTER (WHERE status = 'cancelado')::int as cancelado
    FROM carregamentos
    WHERE CAST(data_carregamento AS DATE) = CAST($1 AS DATE)
    `,
    [date]
  );

  const kpis = kpisResult.rows[0];

  // Integrações pendentes/erro
  const integracoesResult = await pool.query(
    `
    SELECT 
      COUNT(*) FILTER (WHERE status = 'pendente')::int as pendentes,
      COUNT(*) FILTER (WHERE status = 'erro')::int as erros
    FROM integracoes_n8n i
    JOIN carregamentos c ON c.id = i.carregamento_id
    WHERE CAST(c.data_carregamento AS DATE) = CAST($1 AS DATE)
    `,
    [date]
  );

  const integracoes = integracoesResult.rows[0];

  // Últimos logs
  const logsResult = await pool.query(
    `
    SELECT 
      l.id,
      l.data::text,
      l.acao,
      l.detalhes,
      l.carregamento_id,
      COALESCE(
        jsonb_build_object(
          'id', u.id,
          'name', u.name
        ),
        jsonb_build_object('id', NULL, 'name', 'Sistema')
      ) as user
    FROM logs_acao l
    LEFT JOIN usuarios u ON u.id = l.usuario_id
    WHERE DATE(l.data) = $1
    ORDER BY l.data DESC
    LIMIT 10
    `,
    [date]
  );

  return {
    kpis: {
      total: kpis.total,
      standby: kpis.standby,
      finalizado: kpis.finalizado,
      cancelado: kpis.cancelado,
    },
    integracoes: {
      pendentes: integracoes.pendentes,
      erros: integracoes.erros,
    },
    ultimosLogs: logsResult.rows.map((row) => ({
      id: row.id,
      data: row.data,
      acao: row.acao,
      detalhes: row.detalhes,
      user: row.user,
      carregamento_id: row.carregamento_id,
    })),
  };
}

