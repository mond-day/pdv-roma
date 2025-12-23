import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth/session";
import { HistoricoQuerySchema, HistoricoResponseSchema } from "@/lib/validators/historico";
import { listCarregamentos } from "@/lib/db/queries/carregamentos";
import { successResponse, errorResponse, unauthorizedResponse } from "@/lib/utils/response";

export async function GET(request: NextRequest) {
  try {
    const user = await getSession();
    if (!user) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    const params = {
      date: searchParams.get("date") || searchParams.get("dateInicio") || "",
      dateFim: searchParams.get("dateFim") || undefined,
      status: searchParams.get("status") || undefined,
      cliente: searchParams.get("cliente") || undefined,
      transportadora: searchParams.get("transportadora") || undefined,
      motorista: searchParams.get("motorista") || undefined,
      placa: searchParams.get("placa") || undefined,
      contrato: searchParams.get("contrato") || undefined,
      page: searchParams.get("page") || "1",
      pageSize: searchParams.get("pageSize") || "50",
    };

    const validated = HistoricoQuerySchema.parse(params);
    const result = await listCarregamentos(validated);

    const response = HistoricoResponseSchema.parse({
      ok: true,
      page: validated.page,
      pageSize: validated.pageSize,
      total: result.total,
      items: result.items,
    });

    return successResponse(response);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return errorResponse("Parâmetros inválidos", 400, error);
    }
    console.error("Erro ao listar histórico:", error);
    return errorResponse("Erro ao listar histórico", 500);
  }
}

