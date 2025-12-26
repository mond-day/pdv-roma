import { pool } from "../pool";

export async function listMotoristas() {
  const result = await pool.query(
    `SELECT id, nome, cpf, transportadora_id FROM motoristas ORDER BY nome`
  );

  return result.rows.map((row) => ({
    id: row.id,
    nome: row.nome,
    cpf: row.cpf,
    transportadora_id: row.transportadora_id,
  }));
}

