import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth/session";
import { requireAdmin } from "@/lib/auth/rbac";
import {
  UpdateUsuarioBodySchema,
  UsuarioResponseSchema,
  DeleteUsuarioResponseSchema,
} from "@/lib/validators/usuarios";
import { updateUsuario, deleteUsuario, getUserById } from "@/lib/db/queries/usuarios";
import { createLog } from "@/lib/db/queries/logs";
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
} from "@/lib/utils/response";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSession();
    if (!user) {
      return unauthorizedResponse();
    }

    try {
      requireAdmin(user);
    } catch {
      return forbiddenResponse("Apenas administradores podem atualizar usuários");
    }

    const body = await request.json();
    const validated = UpdateUsuarioBodySchema.parse(body);

    const item = await updateUsuario(params.id, validated);

    if (!item) {
      return notFoundResponse("Usuário não encontrado");
    }

    await createLog({
      acao: "alterar_usuario_permissao",
      detalhes: `Usuário ${params.id} atualizado`,
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
    console.error("Erro ao atualizar usuário:", error);
    return errorResponse("Erro ao atualizar usuário", 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSession();
    if (!user) {
      return unauthorizedResponse();
    }

    try {
      requireAdmin(user);
    } catch {
      return forbiddenResponse("Apenas administradores podem deletar usuários");
    }

    if (params.id === user.id) {
      return errorResponse("Não é possível deletar seu próprio usuário", 400);
    }

    const existing = await getUserById(params.id);
    if (!existing) {
      return notFoundResponse("Usuário não encontrado");
    }

    await deleteUsuario(params.id);

    await createLog({
      acao: "deletar_usuario",
      detalhes: `Usuário ${params.id} deletado`,
      user_id: user.id,
    });

    const response = DeleteUsuarioResponseSchema.parse({
      ok: true,
      id: params.id,
    });

    return successResponse(response);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return errorResponse("Erro de validação", 400, error);
    }
    console.error("Erro ao deletar usuário:", error);
    return errorResponse("Erro ao deletar usuário", 500);
  }
}

