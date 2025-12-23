import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth/session";
import {
  FinalizarBodySchema,
  FinalizarResponseSchema,
} from "@/lib/validators/carregamentos";
import { finalizarCarregamento, getCarregamentoById } from "@/lib/db/queries/carregamentos";
import { createLog } from "@/lib/db/queries/logs";
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  notFoundResponse,
} from "@/lib/utils/response";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSession();
    if (!user) {
      return unauthorizedResponse();
    }

    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return errorResponse("ID inválido", 400);
    }

    // Verificar se carregamento existe e está em standby
    const carregamento = await getCarregamentoById(id);
    if (!carregamento) {
      return notFoundResponse("Carregamento não encontrado");
    }

    if (carregamento.status !== "stand-by" && carregamento.status !== "standby") {
      return errorResponse("Carregamento não está em stand-by", 400);
    }

    const body = await request.json();
    const validated = FinalizarBodySchema.parse(body);

    const result = await finalizarCarregamento(id, {
      bruto_kg: validated.bruto_kg,
      liquido_kg: validated.liquido_kg,
      final_eixos_kg: validated.final_eixos_kg,
      idempotency_key: validated.idempotency_key,
      n8n_payload: validated.n8n_payload,
    });

    await createLog({
      acao: "finalizar_carregamento",
      detalhes: `Carregamento ${id} finalizado. Líquido: ${validated.liquido_kg}kg`,
      request_id: validated.idempotency_key,
      carregamento_id: id,
      user_id: user.id,
    });

    const response = FinalizarResponseSchema.parse({
      ok: true,
      carregamento_id: id,
      status: result.status,
      integracao_status: result.integracao_status,
    });

    return successResponse(response);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return errorResponse("Dados inválidos", 400, error);
    }
    console.error("Erro ao finalizar carregamento:", error);
    return errorResponse("Erro ao finalizar carregamento", 500);
  }
}

