import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth/session";
import { MarcarNotificacaoLidaResponseSchema } from "@/lib/validators/notificacoes";
import { marcarNotificacaoLida } from "@/lib/db/queries/notificacoes";
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

    const result = await marcarNotificacaoLida(params.id, user.id);

    if (!result) {
      return notFoundResponse("Notificação não encontrada");
    }

    const response = MarcarNotificacaoLidaResponseSchema.parse({
      ok: true,
      id: result.id,
      lida: result.lida,
    });

    return successResponse(response);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return errorResponse("Erro de validação", 400, error);
    }
    console.error("Erro ao marcar notificação como lida:", error);
    return errorResponse("Erro ao marcar notificação como lida", 500);
  }
}

