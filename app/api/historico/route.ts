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
    const dateParam = searchParams.get("date") || searchParams.get("dateInicio");
    const dateFimParam = searchParams.get("dateFim");
    const params = {
      date: dateParam && dateParam.trim() !== "" ? dateParam : undefined,
      dateFim: dateFimParam && dateFimParam.trim() !== "" ? dateFimParam : undefined,
      status: searchParams.get("status") || undefined,
      cliente: searchParams.get("cliente") || undefined,
      transportadora: searchParams.get("transportadora") || undefined,
      motorista: searchParams.get("motorista") || undefined,
      placa: searchParams.get("placa") || undefined,
      contrato: searchParams.get("contrato") || undefined,
      page: searchParams.get("page") || "1",
      pageSize: searchParams.get("pageSize") || "50",
    };

    console.log("GET /api/historico - Raw params:", params);
    console.log("GET /api/historico - Raw params JSON:", JSON.stringify(params, null, 2));
    
    let validated;
    try {
      validated = HistoricoQuerySchema.parse(params);
      console.log("GET /api/historico - Validated params:", validated);
    } catch (validationError) {
      console.error("GET /api/historico - Validation error:", validationError);
      if (validationError instanceof Error) {
        console.error("Validation error message:", validationError.message);
      }
      throw validationError;
    }
    const result = await listCarregamentos(validated);
    console.log("GET /api/historico - Result:", { total: result.total, itemsCount: result.items.length });

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
      console.error("Erro de validação Zod:", error);
      return errorResponse("Parâmetros inválidos", 400, error);
    }
    console.error("Erro ao listar histórico:", error);
    if (error instanceof Error) {
      console.error("Mensagem de erro:", error.message);
      console.error("Stack trace:", error.stack);
    }
    return errorResponse("Erro ao listar histórico", 500, error);
  }
}

