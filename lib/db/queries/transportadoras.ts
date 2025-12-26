import { pool } from "../pool";

export async function listTransportadoras() {
  const result = await pool.query(
    `SELECT id_gc, nome, cpf_cnpj, tipo_pessoa FROM transportadoras ORDER BY nome`
  );

  return result.rows.map((row) => ({
    id_gc: row.id_gc,
    nome: row.nome,
    cpf_cnpj: row.cpf_cnpj,
    tipo_pessoa: row.tipo_pessoa,
  }));
}

