import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth/session";
import { DashboardQuerySchema, DashboardResponseSchema } from "@/lib/validators/dashboard";
import { getDashboardData } from "@/lib/db/queries/dashboard";
import { successResponse, errorResponse, unauthorizedResponse } from "@/lib/utils/response";
import { todayISO } from "@/lib/utils/dates";

export async function GET(request: NextRequest) {
  try {
    const user = await getSession();
    if (!user) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date") || todayISO();

    const validated = DashboardQuerySchema.parse({ date });
    const data = await getDashboardData(validated.date);

    const response = DashboardResponseSchema.parse({
      ok: true,
      date: validated.date,
      ...data,
    });

    return successResponse(response);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return errorResponse("Parâmetros inválidos", 400, error);
    }
    console.error("Erro no dashboard:", error);
    return errorResponse("Erro ao buscar dados do dashboard", 500);
  }
}

