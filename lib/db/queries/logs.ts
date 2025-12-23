import { pool } from "../pool";

export async function createLog(data: {
  acao: string;
  detalhes?: string | null | object;
  request_id?: string | null;
  carregamento_id?: number | null;
  user_id?: number | string | null; // Aceita number ou string (UUID)
}) {
  // Converter detalhes para JSONB se for string ou objeto
  let detalhesJsonb = null;
  if (data.detalhes) {
    if (typeof data.detalhes === 'string') {
      detalhesJsonb = JSON.stringify({ mensagem: data.detalhes });
    } else if (typeof data.detalhes === 'object') {
      detalhesJsonb = JSON.stringify(data.detalhes);
    }
  }

  await pool.query(
    `
    INSERT INTO logs_acao (acao, detalhes, carregamento_id, usuario_id)
    VALUES ($1, $2::jsonb, $3, $4)
    `,
    [
      data.acao,
      detalhesJsonb,
      data.carregamento_id || null,
      data.user_id || null, // usuario_id
    ]
  );
}

export async function listLogs(params: {
  de?: string;
  ate?: string;
  acao?: string;
  user_id?: string;
  carregamento_id?: number;
  page: number;
  pageSize: number;
}) {
  const offset = (params.page - 1) * params.pageSize;
  const conditions: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (params.de) {
    conditions.push(`data >= $${paramIndex}`);
    values.push(params.de);
    paramIndex++;
  }

  if (params.ate) {
    conditions.push(`data <= $${paramIndex}`);
    values.push(params.ate);
    paramIndex++;
  }

  if (params.acao) {
    conditions.push(`acao ILIKE $${paramIndex}`);
    values.push(`%${params.acao}%`);
    paramIndex++;
  }

  if (params.user_id) {
    conditions.push(`usuario_id = $${paramIndex}`);
    values.push(params.user_id);
    paramIndex++;
  }

  if (params.carregamento_id) {
    conditions.push(`carregamento_id = $${paramIndex}`);
    values.push(params.carregamento_id);
    paramIndex++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const countQuery = `SELECT COUNT(*) FROM logs_acao ${whereClause}`;
  const dataQuery = `
    SELECT 
      l.id,
      l.data::text,
      l.acao,
      l.detalhes,
      l.request_id,
      l.carregamento_id,
      CASE 
        WHEN l.usuario_id IS NOT NULL THEN
          jsonb_build_object(
            'id', u.id,
            'name', u.nome,
            'email', u.email
          )
        ELSE
          jsonb_build_object(
            'id', 'system',
            'name', 'Sistema',
            'email', NULL
          )
      END as user
    FROM logs_acao l
    LEFT JOIN usuarios u ON u.id = l.usuario_id
    ${whereClause}
    ORDER BY l.data DESC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;

  const [countResult, dataResult] = await Promise.all([
    pool.query(countQuery, values),
    pool.query(dataQuery, [...values, params.pageSize, offset]),
  ]);

  return {
    total: parseInt(countResult.rows[0].count, 10),
    items: dataResult.rows.map((row) => ({
      id: row.id,
      data: row.data,
      acao: row.acao,
      detalhes: row.detalhes,
      request_id: row.request_id,
      carregamento_id: row.carregamento_id,
      user: row.user,
    })),
  };
}

export async function getLogsByCarregamento(carregamento_id: number) {
  const result = await pool.query(
    `
    SELECT 
      l.id,
      l.data::text,
      l.acao,
      l.detalhes,
      l.request_id,
      jsonb_build_object(
        'id', u.id,
        'name', u.nome
      ) as user
    FROM logs_acao l
    JOIN usuarios u ON u.id = l.usuario_id
    WHERE l.carregamento_id = $1
    ORDER BY l.data DESC
    `,
    [carregamento_id]
  );

  return result.rows.map((row) => ({
    id: row.id,
    data: row.data,
    acao: row.acao,
    detalhes: row.detalhes,
    request_id: row.request_id,
    user: row.user,
  }));
}

