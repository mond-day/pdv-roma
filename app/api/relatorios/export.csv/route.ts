import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth/session";
import { RelatoriosQuerySchema } from "@/lib/validators/relatorios";
import { getRelatorio } from "@/lib/db/queries/relatorios";
import { errorResponse, unauthorizedResponse } from "@/lib/utils/response";

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

    // Gerar CSV
    const headers = ["Agrupador", "Total Carregamentos", "Total Líquido (kg)"];
    const csvRows = [
      headers.join(","),
      ...rows.map((row) =>
        [
          `"${row.groupKey}"`,
          row.total_carregamentos,
          row.total_liquido_kg,
        ].join(",")
      ),
    ];

    const csv = csvRows.join("\n");
    const filename = `relatorio_${validated.de}_${validated.ate}.csv`;

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return errorResponse("Parâmetros inválidos", 400, error);
    }
    console.error("Erro ao exportar CSV:", error);
    return errorResponse("Erro ao exportar CSV", 500);
  }
}

