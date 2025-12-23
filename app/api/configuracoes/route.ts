import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth/session";
import { requireAdmin } from "@/lib/auth/rbac";
import {
  GetConfiguracoesResponseSchema,
  PutConfiguracoesBodySchema,
  PutConfiguracoesResponseSchema,
} from "@/lib/validators/configuracoes";
import { getConfiguracoes, setConfiguracoes } from "@/lib/db/queries/configuracoes";
import { createLog } from "@/lib/db/queries/logs";
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  forbiddenResponse,
} from "@/lib/utils/response";

export async function GET(request: NextRequest) {
  try {
    const user = await getSession();
    if (!user) {
      return unauthorizedResponse();
    }

    try {
      requireAdmin(user);
    } catch {
      return forbiddenResponse("Apenas administradores podem acessar configurações");
    }

    const items = await getConfiguracoes();

    const response = GetConfiguracoesResponseSchema.parse({
      ok: true,
      items,
    });

    return successResponse(response);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return errorResponse("Erro de validação", 400, error);
    }
    console.error("Erro ao buscar configurações:", error);
    return errorResponse("Erro ao buscar configurações", 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getSession();
    if (!user) {
      return unauthorizedResponse();
    }

    try {
      requireAdmin(user);
    } catch {
      return forbiddenResponse("Apenas administradores podem alterar configurações");
    }

    const body = await request.json();
    const validated = PutConfiguracoesBodySchema.parse(body);

    const updated = await setConfiguracoes(validated.items);

    await createLog({
      acao: "alterar_configuracoes",
      detalhes: `${updated} configuração(ões) alterada(s)`,
      user_id: user.id,
    });

    const response = PutConfiguracoesResponseSchema.parse({
      ok: true,
      updated,
    });

    return successResponse(response);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return errorResponse("Dados inválidos", 400, error);
    }
    console.error("Erro ao atualizar configurações:", error);
    return errorResponse("Erro ao atualizar configurações", 500);
  }
}

