import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth/session";
import { searchVendasECarregamentos } from "@/lib/db/queries/vendas";
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
} from "@/lib/utils/response";

export async function GET(request: NextRequest) {
  try {
    const user = await getSession();
    if (!user) {
      return unauthorizedResponse();
    }

    const searchParams = request.nextUrl.searchParams;
    const searchText = searchParams.get("q") || "";

    const items = await searchVendasECarregamentos({ searchText });

    return successResponse({
      ok: true,
      items,
    });
  } catch (error) {
    console.error("Erro ao buscar vendas e carregamentos:", error);
    return errorResponse("Erro ao buscar vendas e carregamentos", 500);
  }
}
