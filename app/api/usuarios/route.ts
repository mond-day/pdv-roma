import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth/session";
import { requireAdmin } from "@/lib/auth/rbac";
import {
  ListUsuariosResponseSchema,
  CreateUsuarioBodySchema,
  UsuarioResponseSchema,
} from "@/lib/validators/usuarios";
import { listUsuarios, createUsuario } from "@/lib/db/queries/usuarios";
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
      return forbiddenResponse("Apenas administradores podem listar usuários");
    }

    const items = await listUsuarios();

    const response = ListUsuariosResponseSchema.parse({
      ok: true,
      items,
    });

    return successResponse(response);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return errorResponse("Erro de validação", 400, error);
    }
    console.error("Erro ao listar usuários:", error);
    return errorResponse("Erro ao listar usuários", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSession();
    if (!user) {
      return unauthorizedResponse();
    }

    try {
      requireAdmin(user);
    } catch {
      return forbiddenResponse("Apenas administradores podem criar usuários");
    }

    const body = await request.json();
    const validated = CreateUsuarioBodySchema.parse(body);

    const item = await createUsuario(validated);

    await createLog({
      acao: "criar_usuario",
      detalhes: `Usuário criado: ${item.email} (${item.role})`,
      user_id: user.id,
    });

    const response = UsuarioResponseSchema.parse({
      ok: true,
      item,
    });

    return successResponse(response);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return errorResponse("Dados inválidos", 400, error);
    }
    console.error("Erro ao criar usuário:", error);
    return errorResponse("Erro ao criar usuário", 500);
  }
}

