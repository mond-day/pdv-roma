import { pool } from "../pool";

export async function createNotificacao(data: {
  user_id: string;
  tipo: "integracao" | "sistema" | "aviso";
  titulo: string;
  mensagem: string;
  carregamento_id?: number | null;
}) {
  const result = await pool.query(
    `
    INSERT INTO notificacoes (user_id, tipo, titulo, mensagem, carregamento_id)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, created_at::text, lida
    `,
    [
      data.user_id,
      data.tipo,
      data.titulo,
      data.mensagem,
      data.carregamento_id,
    ]
  );

  return {
    id: result.rows[0].id,
    created_at: result.rows[0].created_at,
    lida: result.rows[0].lida,
  };
}

export async function listNotificacoes(params: {
  user_id: string;
  status?: "abertas" | "lidas";
  carregamento_id?: number;
  page: number;
  pageSize: number;
}) {
  const offset = (params.page - 1) * params.pageSize;
  const conditions: string[] = ["user_id = $1"];
  const values: unknown[] = [params.user_id];
  let paramIndex = 2;

  if (params.status === "abertas") {
    conditions.push(`lida = false`);
  } else if (params.status === "lidas") {
    conditions.push(`lida = true`);
  }

  if (params.carregamento_id) {
    conditions.push(`carregamento_id = $${paramIndex}`);
    values.push(params.carregamento_id);
    paramIndex++;
  }

  const whereClause = conditions.join(" AND ");

  const countQuery = `SELECT COUNT(*) FROM notificacoes WHERE ${whereClause}`;
  const dataQuery = `
    SELECT 
      id,
      created_at::text,
      titulo,
      mensagem,
      tipo,
      carregamento_id,
      lida
    FROM notificacoes
    WHERE ${whereClause}
    ORDER BY created_at DESC
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
      created_at: row.created_at,
      // Garantir que os textos sejam strings UTF-8 válidas
      titulo: String(row.titulo || ''),
      mensagem: String(row.mensagem || ''),
      tipo: row.tipo,
      carregamento_id: row.carregamento_id,
      lida: row.lida,
    })),
  };
}

export async function marcarNotificacaoLida(id: string, user_id: string) {
  const result = await pool.query(
    `
    UPDATE notificacoes
    SET lida = true
    WHERE id = $1 AND user_id = $2
    RETURNING id, lida
    `,
    [id, user_id]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return {
    id: result.rows[0].id,
    lida: result.rows[0].lida,
  };
}

export async function getNotificacoesNaoLidasCount(user_id: string) {
  const result = await pool.query(
    `SELECT COUNT(*) FROM notificacoes WHERE user_id = $1 AND lida = false`,
    [user_id]
  );

  return parseInt(result.rows[0].count, 10);
}

