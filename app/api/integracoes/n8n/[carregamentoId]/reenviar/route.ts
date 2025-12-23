import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth/session";
import { requireAdmin } from "@/lib/auth/rbac";
import { ReenviarIntegracaoResponseSchema } from "@/lib/validators/integracoes";
import { resetIntegracaoTentativas, getIntegracaoByCarregamentoId } from "@/lib/db/queries/integracoes";
import { createLog } from "@/lib/db/queries/logs";
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
} from "@/lib/utils/response";

export async function POST(
  request: NextRequest,
  { params }: { params: { carregamentoId: string } }
) {
  try {
    const user = await getSession();
    if (!user) {
      return unauthorizedResponse();
    }

    try {
      requireAdmin(user);
    } catch {
      return forbiddenResponse("Apenas administradores podem reenviar integrações");
    }

    const carregamentoId = parseInt(params.carregamentoId, 10);
    if (isNaN(carregamentoId)) {
      return errorResponse("ID inválido", 400);
    }

    const integracao = await getIntegracaoByCarregamentoId(carregamentoId);
    if (!integracao) {
      return notFoundResponse("Integração não encontrada");
    }

    if (integracao.tentativas >= 5) {
      return errorResponse("Limite de tentativas excedido (5)", 400);
    }

    const result = await resetIntegracaoTentativas(carregamentoId);
    if (!result) {
      return errorResponse("Não foi possível reenviar. Limite de tentativas excedido.", 400);
    }

    await createLog({
      acao: "reenviar_integracao_n8n",
      detalhes: `Reenvio solicitado para carregamento ${carregamentoId}`,
      carregamento_id: carregamentoId,
      user_id: user.id,
    });

    const response = ReenviarIntegracaoResponseSchema.parse({
      ok: true,
      carregamento_id: carregamentoId,
      integracao_status: result.status as "pendente" | "enviado" | "erro",
      message: "Integração marcada para reenvio",
    });

    return successResponse(response);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return errorResponse("Erro de validação", 400, error);
    }
    console.error("Erro ao reenviar integração:", error);
    return errorResponse("Erro ao reenviar integração", 500);
  }
}

