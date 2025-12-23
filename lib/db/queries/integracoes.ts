import { pool } from "../pool";
import { getConfigValue } from "./configuracoes";

export async function getIntegracaoByCarregamentoId(carregamento_id: number) {
  const result = await pool.query(
    `
    SELECT 
      id,
      carregamento_id,
      idempotency_key,
      status,
      tentativas,
      ultima_mensagem,
      ultimo_envio_em::text,
      payload
    FROM integracoes_n8n
    WHERE carregamento_id = $1
    `,
    [carregamento_id]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];
  return {
    id: row.id,
    carregamento_id: row.carregamento_id,
    idempotency_key: row.idempotency_key,
    status: row.status,
    tentativas: row.tentativas,
    ultima_mensagem: row.ultima_mensagem,
    ultimo_envio_em: row.ultimo_envio_em,
    payload: row.payload,
  };
}

export async function getIntegracoesPendentes(limit = 10) {
  const result = await pool.query(
    `
    SELECT 
      id,
      carregamento_id,
      idempotency_key,
      status,
      tentativas,
      payload
    FROM integracoes_n8n
    WHERE status IN ('pendente', 'erro')
      AND tentativas < 5
      AND (updated_at < NOW() - INTERVAL '30 seconds' OR updated_at IS NULL)
    ORDER BY updated_at ASC NULLS FIRST
    LIMIT $1
    `,
    [limit]
  );

  return result.rows.map((row) => ({
    id: row.id,
    carregamento_id: row.carregamento_id,
    idempotency_key: row.idempotency_key,
    status: row.status,
    tentativas: row.tentativas,
    payload: row.payload,
  }));
}

export async function updateIntegracaoStatus(
  id: number,
  status: "pendente" | "enviado" | "erro",
  mensagem?: string | null
) {
  await pool.query(
    `
    UPDATE integracoes_n8n
    SET 
      status = $1,
      ultima_mensagem = $2,
      tentativas = tentativas + 1,
      ultimo_envio_em = CASE WHEN $1 = 'enviado' THEN NOW() ELSE ultimo_envio_em END,
      updated_at = NOW()
    WHERE id = $3
    `,
    [status, mensagem, id]
  );
}

export async function resetIntegracaoTentativas(carregamento_id: number) {
  const result = await pool.query(
    `
    UPDATE integracoes_n8n
    SET 
      status = 'pendente',
      tentativas = 0,
      ultima_mensagem = NULL,
      updated_at = NOW()
    WHERE carregamento_id = $1 AND tentativas < 5
    RETURNING id, status
    `,
    [carregamento_id]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return {
    id: result.rows[0].id,
    status: result.rows[0].status,
  };
}

