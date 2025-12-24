import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth/session";
import { pool } from "@/lib/db/pool";
import { successResponse, errorResponse, unauthorizedResponse } from "@/lib/utils/response";
import { z } from "zod";

const WebhooksConfigSchema = z.object({
  id: z.number().int().optional(),
  busca_placa: z.string().optional().nullable(),
  busca_codigo: z.string().optional().nullable(),
  confirmacao: z.string().optional().nullable(),
  cancelamento: z.string().optional().nullable(),
  ticket: z.string().optional().nullable(),
  duplicacao: z.string().optional().nullable(),
});

/**
 * GET /api/webhooks-config
 * Retorna as configurações de webhooks
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getSession();
    if (!user) {
      return unauthorizedResponse();
    }

    const result = await pool.query(`
      SELECT id, busca_placa, busca_codigo, confirmacao, cancelamento, ticket, duplicacao
      FROM webhooks_config
      LIMIT 1
    `);

    if (result.rows.length === 0) {
      // Se não existe configuração, criar uma vazia
      const createResult = await pool.query(`
        INSERT INTO webhooks_config (busca_placa, busca_codigo, confirmacao, cancelamento, ticket, duplicacao)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, busca_placa, busca_codigo, confirmacao, cancelamento, ticket, duplicacao
      `, ['', '', '', '', '', '']);

      return successResponse({
        ok: true,
        config: createResult.rows[0],
      });
    }

    return successResponse({
      ok: true,
      config: result.rows[0],
    });
  } catch (error) {
    console.error("Erro ao buscar configurações de webhooks:", error);
    return errorResponse("Erro ao buscar configurações de webhooks", 500, error);
  }
}

/**
 * PUT /api/webhooks-config
 * Atualiza as configurações de webhooks
 */
export async function PUT(request: NextRequest) {
  try {
    const user = await getSession();
    if (!user) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const validated = WebhooksConfigSchema.parse(body);

    // Buscar ID da configuração existente
    const existingResult = await pool.query(`SELECT id FROM webhooks_config LIMIT 1`);

    let result;
    if (existingResult.rows.length > 0) {
      // Atualizar configuração existente
      const id = existingResult.rows[0].id;
      result = await pool.query(
        `
        UPDATE webhooks_config
        SET
          busca_placa = $1,
          busca_codigo = $2,
          confirmacao = $3,
          cancelamento = $4,
          ticket = $5,
          duplicacao = $6
        WHERE id = $7
        RETURNING id, busca_placa, busca_codigo, confirmacao, cancelamento, ticket, duplicacao
        `,
        [
          validated.busca_placa || '',
          validated.busca_codigo || '',
          validated.confirmacao || '',
          validated.cancelamento || '',
          validated.ticket || '',
          validated.duplicacao || '',
          id,
        ]
      );
    } else {
      // Criar nova configuração
      result = await pool.query(
        `
        INSERT INTO webhooks_config (busca_placa, busca_codigo, confirmacao, cancelamento, ticket, duplicacao)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, busca_placa, busca_codigo, confirmacao, cancelamento, ticket, duplicacao
        `,
        [
          validated.busca_placa || '',
          validated.busca_codigo || '',
          validated.confirmacao || '',
          validated.cancelamento || '',
          validated.ticket || '',
          validated.duplicacao || '',
        ]
      );
    }

    return successResponse({
      ok: true,
      config: result.rows[0],
    });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return errorResponse("Dados inválidos", 400, error);
    }
    console.error("Erro ao atualizar configurações de webhooks:", error);
    return errorResponse("Erro ao atualizar configurações de webhooks", 500, error);
  }
}
