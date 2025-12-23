import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth/session";
import {
  NotificacoesListQuerySchema,
  NotificacoesListResponseSchema,
} from "@/lib/validators/notificacoes";
import { listNotificacoes } from "@/lib/db/queries/notificacoes";
import { successResponse, errorResponse, unauthorizedResponse } from "@/lib/utils/response";

export async function GET(request: NextRequest) {
  try {
    const user = await getSession();
    if (!user) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    const params = {
      status: searchParams.get("status") || "abertas",
      carregamento_id: searchParams.get("carregamento_id") || undefined,
      page: searchParams.get("page") || "1",
      pageSize: searchParams.get("pageSize") || "50",
    };

    const validated = NotificacoesListQuerySchema.parse(params);
    const result = await listNotificacoes({
      ...validated,
      user_id: user.id,
    });

    const response = NotificacoesListResponseSchema.parse({
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
    console.error("Erro ao listar notificações:", error);
    return errorResponse("Erro ao listar notificações", 500);
  }
}

