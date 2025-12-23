import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth/session";
import { RelatoriosQuerySchema, RelatoriosResponseSchema } from "@/lib/validators/relatorios";
import { getRelatorio } from "@/lib/db/queries/relatorios";
import { successResponse, errorResponse, unauthorizedResponse } from "@/lib/utils/response";

export async function GET(request: NextRequest) {
  try {
    const user = await getSession();
    if (!user) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    const params = {
      de: searchParams.get("de") || "",
      ate: searchParams.get("ate") || "",
      groupBy: searchParams.get("groupBy") || "cliente",
    };

    const validated = RelatoriosQuerySchema.parse(params);
    const rows = await getRelatorio(validated);

    const response = RelatoriosResponseSchema.parse({
      ok: true,
      params: validated,
      rows,
    });

    return successResponse(response);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return errorResponse("Parâmetros inválidos", 400, error);
    }
    console.error("Erro ao gerar relatório:", error);
    return errorResponse("Erro ao gerar relatório", 500);
  }
}

