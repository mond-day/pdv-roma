import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth/session";
import { listMotoristas } from "@/lib/db/queries/motoristas";
import { successResponse, errorResponse, unauthorizedResponse } from "@/lib/utils/response";

export async function GET(request: NextRequest) {
  try {
    const user = await getSession();
    if (!user) {
      return unauthorizedResponse();
    }

    const items = await listMotoristas();

    return successResponse({
      ok: true,
      items,
    });
  } catch (error) {
    console.error("Erro ao listar motoristas:", error);
    return errorResponse("Erro ao listar motoristas", 500, error);
  }
}

