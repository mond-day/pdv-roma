import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth/session";
import { pool } from "@/lib/db/pool";
import { successResponse, errorResponse, unauthorizedResponse } from "@/lib/utils/response";

/**
 * GET /api/placas/search
 * Busca dinâmica de placas com informações de motorista e transportadora
 * Similar ao Appsmith - retorna placas já utilizadas com seus dados associados
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getSession();
    if (!user) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim().toUpperCase() || "";

    // Se não houver query, retornar últimas placas utilizadas
    if (!query) {
      const result = await pool.query(
        `
        SELECT DISTINCT ON (c.placa)
          c.placa,
          c.motorista_id,
          c.transportadora_id,
          m.nome as motorista_nome,
          t.nome as transportadora_nome,
          MAX(c.data_carregamento) as ultima_utilizacao
        FROM carregamentos c
        LEFT JOIN motoristas m ON m.id = c.motorista_id
        LEFT JOIN transportadoras t ON t.id_gc = c.transportadora_id::text
        WHERE c.placa IS NOT NULL
        GROUP BY c.placa, c.motorista_id, c.transportadora_id, m.nome, t.nome
        ORDER BY c.placa, ultima_utilizacao DESC
        LIMIT 20
        `
      );

      return successResponse({
        ok: true,
        items: result.rows.map(row => ({
          placa: row.placa,
          motorista_id: row.motorista_id,
          motorista_nome: row.motorista_nome,
          transportadora_id: row.transportadora_id,
          transportadora_nome: row.transportadora_nome,
          ultima_utilizacao: row.ultima_utilizacao,
        })),
      });
    }

    // Buscar placas que correspondam à query
    const result = await pool.query(
      `
      SELECT DISTINCT ON (c.placa)
        c.placa,
        c.motorista_id,
        c.transportadora_id,
        m.nome as motorista_nome,
        t.nome as transportadora_nome,
        MAX(c.data_carregamento) as ultima_utilizacao
      FROM carregamentos c
      LEFT JOIN motoristas m ON m.id = c.motorista_id
      LEFT JOIN transportadoras t ON t.id_gc = c.transportadora_id::text
      WHERE c.placa IS NOT NULL
        AND REPLACE(UPPER(c.placa), '-', '') LIKE REPLACE($1, '-', '') || '%'
      GROUP BY c.placa, c.motorista_id, c.transportadora_id, m.nome, t.nome
      ORDER BY c.placa, ultima_utilizacao DESC
      LIMIT 10
      `,
      [query]
    );

    return successResponse({
      ok: true,
      items: result.rows.map(row => ({
        placa: row.placa,
        motorista_id: row.motorista_id,
        motorista_nome: row.motorista_nome,
        transportadora_id: row.transportadora_id,
        transportadora_nome: row.transportadora_nome,
        ultima_utilizacao: row.ultima_utilizacao,
      })),
    });
  } catch (error) {
    console.error("Erro ao buscar placas:", error);
    return errorResponse("Erro ao buscar placas", 500, error);
  }
}
