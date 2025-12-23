import { pool } from "../pool";

export async function getDashboardData(date: string) {
  // KPIs do dia - Aceitar tanto 'finalizado' quanto 'concluido' para compatibilidade
  // Aceitar tanto 'standby' quanto 'stand-by' para compatibilidade
  const kpisResult = await pool.query(
    `
    SELECT
      COUNT(*)::int as total,
      COUNT(*) FILTER (WHERE status IN ('standby', 'stand-by'))::int as standby,
      COUNT(*) FILTER (WHERE status IN ('finalizado', 'concluido'))::int as finalizado,
      COUNT(*) FILTER (WHERE status = 'cancelado')::int as cancelado
    FROM carregamentos
    WHERE data_carregamento::date = $1::date
    `,
    [date]
  );

  const kpis = kpisResult.rows[0] || {
    total: 0,
    standby: 0,
    finalizado: 0,
    cancelado: 0,
  };

  // Integrações pendentes/erro
  const integracoesResult = await pool.query(
    `
    SELECT 
      COUNT(*) FILTER (WHERE i.status = 'pendente')::int as pendentes,
      COUNT(*) FILTER (WHERE i.status = 'erro')::int as erros
    FROM integracoes_n8n i
    JOIN carregamentos c ON c.id = i.carregamento_id
    WHERE c.data_carregamento::date = $1::date
    `,
    [date]
  );

  const integracoes = integracoesResult.rows[0] || {
    pendentes: 0,
    erros: 0,
  };

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
          'id', u.id::text,
          'name', u.name
        ),
        jsonb_build_object('id', NULL, 'name', 'Sistema')
      ) as user
    FROM logs_acao l
    LEFT JOIN users u ON u.id = l.user_id
    WHERE l.data::date = $1::date
    ORDER BY l.data DESC
    LIMIT 10
    `,
    [date]
  );

  return {
    kpis: {
      total: Number(kpis.total) || 0,
      standby: Number(kpis.standby) || 0,
      finalizado: Number(kpis.finalizado) || 0,
      cancelado: Number(kpis.cancelado) || 0,
    },
    integracoes: {
      pendentes: Number(integracoes.pendentes) || 0,
      erros: Number(integracoes.erros) || 0,
    },
    ultimosLogs: logsResult.rows.map((row) => ({
      id: Number(row.id),
      data: String(row.data),
      acao: String(row.acao),
      detalhes: row.detalhes ? String(row.detalhes) : null,
      user: row.user,
      carregamento_id: row.carregamento_id ? Number(row.carregamento_id) : null,
    })),
  };
}

