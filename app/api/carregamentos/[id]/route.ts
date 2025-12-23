import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth/session";
import { CarregamentoDetailResponseSchema } from "@/lib/validators/carregamentos";
import { getCarregamentoById } from "@/lib/db/queries/carregamentos";
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  notFoundResponse,
} from "@/lib/utils/response";

export async function GET(
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

    const carregamento = await getCarregamentoById(id);

    if (!carregamento) {
      return notFoundResponse("Carregamento não encontrado");
    }

    const response = CarregamentoDetailResponseSchema.parse({
      ok: true,
      item: carregamento,
    });

    return successResponse(response);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return errorResponse("Erro de validação", 400, error);
    }
    console.error("Erro ao buscar carregamento:", error);
    return errorResponse("Erro ao buscar carregamento", 500);
  }
}

