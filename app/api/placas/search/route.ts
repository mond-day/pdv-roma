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
    const rawQuery = searchParams.get("q")?.trim() || "";
    const query = rawQuery.toUpperCase();

    // Se não houver query, retornar últimas placas utilizadas
    if (!query) {
      console.log("API /api/placas/search - Buscando todas as placas (sem query)");
      let result = await pool.query(
        `
        SELECT DISTINCT
          p.placa,
          ARRAY_AGG(DISTINCT pm.motorista_id) FILTER (WHERE pm.motorista_id IS NOT NULL) as motorista_ids,
          ARRAY_AGG(DISTINCT m.nome) FILTER (WHERE m.nome IS NOT NULL) as motorista_nomes,
          ARRAY_AGG(DISTINCT pt.transportadora_id) FILTER (WHERE pt.transportadora_id IS NOT NULL) as transportadora_ids,
          ARRAY_AGG(DISTINCT t.nome) FILTER (WHERE t.nome IS NOT NULL) as transportadora_nomes
        FROM placas p
        LEFT JOIN placas_motoristas pm ON pm.placa_id = p.id
        LEFT JOIN motoristas m ON m.id = pm.motorista_id
        LEFT JOIN placas_transportadoras pt ON pt.placa_id = p.id
        LEFT JOIN transportadoras t ON t.id_gc = pt.transportadora_id
        GROUP BY p.placa
        ORDER BY p.placa
        LIMIT 20
        `
      );

      console.log("API /api/placas/search - Total de placas encontradas na tabela placas (sem query):", result.rows.length);

      // Se não encontrou resultados na tabela placas, buscar de carregamentos como fallback
      if (result.rows.length === 0) {
        console.log("API /api/placas/search - Nenhum resultado na tabela placas, buscando em carregamentos...");
        result = await pool.query(
          `
          SELECT DISTINCT
            c.placa,
            ARRAY_AGG(DISTINCT c.motorista_id) FILTER (WHERE c.motorista_id IS NOT NULL) as motorista_ids,
            ARRAY_AGG(DISTINCT m.nome) FILTER (WHERE m.nome IS NOT NULL) as motorista_nomes,
            ARRAY_AGG(DISTINCT c.transportadora_id::text) FILTER (WHERE c.transportadora_id IS NOT NULL) as transportadora_ids,
            ARRAY_AGG(DISTINCT t.nome) FILTER (WHERE t.nome IS NOT NULL) as transportadora_nomes
          FROM carregamentos c
          LEFT JOIN motoristas m ON m.id = c.motorista_id
          LEFT JOIN transportadoras t ON t.id_gc = c.transportadora_id::text
          GROUP BY c.placa
          ORDER BY c.placa
          LIMIT 20
          `
        );
        console.log("API /api/placas/search - Total de placas encontradas na tabela carregamentos (sem query):", result.rows.length);
      }

      return successResponse({
        ok: true,
        items: result.rows.map(row => ({
          placa: row.placa,
          motorista_ids: row.motorista_ids || [],
          motorista_nomes: row.motorista_nomes || [],
          transportadora_ids: row.transportadora_ids || [],
          transportadora_nomes: row.transportadora_nomes || [],
        })),
      });
    }

    // Buscar placas que correspondam à query
    // Remover hífens e converter para maiúsculo para busca case-insensitive
    const queryNormalized = query.replace(/-/g, '');
    console.log("API /api/placas/search - Query recebida:", query, "Normalizada:", queryNormalized);
    
    // Primeiro, tentar buscar da tabela placas
    let result = await pool.query(
      `
      SELECT DISTINCT
        p.placa,
        ARRAY_AGG(DISTINCT pm.motorista_id) FILTER (WHERE pm.motorista_id IS NOT NULL) as motorista_ids,
        ARRAY_AGG(DISTINCT m.nome) FILTER (WHERE m.nome IS NOT NULL) as motorista_nomes,
        ARRAY_AGG(DISTINCT pt.transportadora_id) FILTER (WHERE pt.transportadora_id IS NOT NULL) as transportadora_ids,
        ARRAY_AGG(DISTINCT t.nome) FILTER (WHERE t.nome IS NOT NULL) as transportadora_nomes
      FROM placas p
      LEFT JOIN placas_motoristas pm ON pm.placa_id = p.id
      LEFT JOIN motoristas m ON m.id = pm.motorista_id
      LEFT JOIN placas_transportadoras pt ON pt.placa_id = p.id
      LEFT JOIN transportadoras t ON t.id_gc = pt.transportadora_id
      WHERE REPLACE(UPPER(p.placa), '-', '') LIKE $1 || '%'
      GROUP BY p.placa
      ORDER BY p.placa
      LIMIT 10
      `,
      [queryNormalized]
    );

    console.log("API /api/placas/search - Resultados da tabela placas:", result.rows.length);

    // Se não encontrou resultados na tabela placas, buscar de carregamentos como fallback
    if (result.rows.length === 0) {
      console.log("API /api/placas/search - Nenhum resultado na tabela placas, buscando em carregamentos...");
      result = await pool.query(
        `
        SELECT DISTINCT
          c.placa,
          ARRAY_AGG(DISTINCT c.motorista_id) FILTER (WHERE c.motorista_id IS NOT NULL) as motorista_ids,
          ARRAY_AGG(DISTINCT m.nome) FILTER (WHERE m.nome IS NOT NULL) as motorista_nomes,
          ARRAY_AGG(DISTINCT c.transportadora_id::text) FILTER (WHERE c.transportadora_id IS NOT NULL) as transportadora_ids,
          ARRAY_AGG(DISTINCT t.nome) FILTER (WHERE t.nome IS NOT NULL) as transportadora_nomes
        FROM carregamentos c
        LEFT JOIN motoristas m ON m.id = c.motorista_id
        LEFT JOIN transportadoras t ON t.id_gc = c.transportadora_id::text
        WHERE REPLACE(UPPER(c.placa), '-', '') LIKE $1 || '%'
        GROUP BY c.placa
        ORDER BY c.placa
        LIMIT 10
        `,
        [queryNormalized]
      );
      console.log("API /api/placas/search - Resultados da tabela carregamentos:", result.rows.length);
    }

    if (result.rows.length > 0) {
      console.log("API /api/placas/search - Primeiro resultado:", result.rows[0]);
    }

    const items = result.rows.map(row => ({
      placa: row.placa,
      motorista_ids: row.motorista_ids || [],
      motorista_nomes: row.motorista_nomes || [],
      transportadora_ids: row.transportadora_ids || [],
      transportadora_nomes: row.transportadora_nomes || [],
    }));

    console.log("API /api/placas/search - Items formatados:", items);

    return successResponse({
      ok: true,
      items: items,
    });
  } catch (error) {
    console.error("Erro ao buscar placas:", error);
    return errorResponse("Erro ao buscar placas", 500, error);
  }
}
