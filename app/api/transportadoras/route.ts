import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth/session";
import { listTransportadoras } from "@/lib/db/queries/transportadoras";
import { successResponse, errorResponse, unauthorizedResponse } from "@/lib/utils/response";

export async function GET(request: NextRequest) {
  try {
    const user = await getSession();
    if (!user) {
      return unauthorizedResponse();
    }

    const items = await listTransportadoras();

    return successResponse({
      ok: true,
      items,
    });
  } catch (error) {
    console.error("Erro ao listar transportadoras:", error);
    return errorResponse("Erro ao listar transportadoras", 500, error);
  }
}

