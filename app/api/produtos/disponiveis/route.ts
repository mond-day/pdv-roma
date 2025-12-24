import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth/session";
import { listProdutosComDisponibilidade } from "@/lib/db/queries/produtos";
import { successResponse, errorResponse, unauthorizedResponse } from "@/lib/utils/response";

/**
 * GET /api/produtos/disponiveis?venda_id=GC-001
 * Retorna produtos de uma venda com quantidade disponível
 * Formato: "Produto X (XX,XXX TON disponível)"
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getSession();
    if (!user) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    const venda_id = searchParams.get("venda_id");

    if (!venda_id) {
      return errorResponse("venda_id é obrigatório", 400);
    }

    const produtos = await listProdutosComDisponibilidade(venda_id);

    return successResponse({
      ok: true,
      items: produtos,
    });
  } catch (error) {
    console.error("Erro ao buscar produtos disponíveis:", error);
    return errorResponse("Erro ao buscar produtos disponíveis", 500, error);
  }
}
