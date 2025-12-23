import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth/session";
import { RelatoriosQuerySchema } from "@/lib/validators/relatorios";
import { getRelatorio } from "@/lib/db/queries/relatorios";
import { errorResponse, unauthorizedResponse } from "@/lib/utils/response";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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

    // Gerar PDF
    const doc = new jsPDF();
    
    // Cabeçalho
    doc.setFontSize(18);
    doc.text("Relatório de Carregamentos", 14, 20);
    
    doc.setFontSize(12);
    doc.text(`Período: ${validated.de} a ${validated.ate}`, 14, 30);
    doc.text(`Agrupado por: ${validated.groupBy}`, 14, 36);

    // Tabela
    autoTable(doc, {
      startY: 45,
      head: [["Agrupador", "Total Carregamentos", "Total Líquido (kg)"]],
      body: rows.map((row) => [
        row.groupKey,
        row.total_carregamentos.toString(),
        row.total_liquido_kg.toString(),
      ]),
      styles: { fontSize: 10 },
      headStyles: { fillColor: [66, 139, 202] },
    });

    const filename = `relatorio_${validated.de}_${validated.ate}.pdf`;
    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));

    return new Response(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return errorResponse("Parâmetros inválidos", 400, error);
    }
    console.error("Erro ao exportar PDF:", error);
    return errorResponse("Erro ao exportar PDF", 500);
  }
}

