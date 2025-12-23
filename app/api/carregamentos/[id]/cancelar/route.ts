import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth/session";
import {
  CancelarBodySchema,
  CancelarResponseSchema,
} from "@/lib/validators/carregamentos";
import { cancelarCarregamento } from "@/lib/db/queries/carregamentos";
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

    const body = await request.json();
    const validated = CancelarBodySchema.parse(body);

    const result = await cancelarCarregamento(id, validated.motivo);

    if (!result) {
      return notFoundResponse("Carregamento não encontrado ou não pode ser cancelado");
    }

    await createLog({
      acao: "cancelar_carregamento",
      detalhes: `Carregamento ${id} cancelado. Motivo: ${validated.motivo}`,
      request_id: validated.request_id,
      carregamento_id: id,
      user_id: user.id,
    });

    const response = CancelarResponseSchema.parse({
      ok: true,
      carregamento_id: result.id,
      status: result.status,
    });

    return successResponse(response);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return errorResponse("Dados inválidos", 400, error);
    }
    console.error("Erro ao cancelar carregamento:", error);
    return errorResponse("Erro ao cancelar carregamento", 500);
  }
}

