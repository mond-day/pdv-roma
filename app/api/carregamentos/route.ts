import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth/session";
import {
  CarregamentosListQuerySchema,
  CarregamentosListResponseSchema,
  CarregamentoResumoSchema,
  CreateCarregamentoBodySchema,
  CreateCarregamentoResponseSchema,
} from "@/lib/validators/carregamentos";
import { listCarregamentos, createCarregamento } from "@/lib/db/queries/carregamentos";
import { createLog } from "@/lib/db/queries/logs";
import { successResponse, errorResponse, unauthorizedResponse } from "@/lib/utils/response";
import { z } from "zod";

export async function GET(request: NextRequest) {
  try {
    const user = await getSession();
    if (!user) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date");
    const params = {
      ...(dateParam && dateParam !== "" ? { date: dateParam } : {}), // Só inclui se não for vazio
      dateFim: searchParams.get("dateFim") || undefined,
      status: searchParams.get("status") || undefined,
      cliente: searchParams.get("cliente") || undefined,
      transportadora: searchParams.get("transportadora") || undefined,
      motorista: searchParams.get("motorista") || undefined,
      placa: searchParams.get("placa") || undefined,
      contrato: searchParams.get("contrato") || undefined,
      page: searchParams.get("page") || "1",
      pageSize: searchParams.get("pageSize") || "50",
    };

    console.log("GET /api/carregamentos - Params:", params);

    const validated = CarregamentosListQuerySchema.parse(params);
    const result = await listCarregamentos(validated);

    console.log("GET /api/carregamentos - Result:", {
      total: result.total,
      itemsCount: result.items.length,
    });
    
    if (result.items.length > 0) {
      console.log("GET /api/carregamentos - Primeiro item:", JSON.stringify(result.items[0], null, 2));
    }

    // Validar cada item individualmente para identificar problemas
    const validatedItems = result.items.map((item, index) => {
      try {
        // Garantir que campos obrigatórios tenham valores padrão
        const itemToValidate = {
          ...item,
          cliente_nome: item.cliente_nome || "",
          contrato_codigo: item.contrato_codigo || null,
          produto_nome: item.produto_nome || "",
        };
        return CarregamentoResumoSchema.parse(itemToValidate);
      } catch (error) {
        console.error(`❌ Erro ao validar item ${index}:`, error);
        if (error instanceof Error && error.name === "ZodError") {
          console.error("Erros de validação:", (error as any).errors);
        }
        console.error("Item problemático:", JSON.stringify(item, null, 2));
        // Em vez de lançar erro, retornar item com valores padrão para não quebrar a lista
        return {
          id: item.id,
          data_carregamento: item.data_carregamento || "",
          placa: item.placa || "",
          cliente_nome: item.cliente_nome || "",
          contrato_codigo: item.contrato_codigo || null,
          produto_nome: item.produto_nome || "",
          liquido_kg: item.liquido_kg || null,
          status: (item.status as any) || "pendente",
          integracao_status: item.integracao_status || null,
        };
      }
    });

    const response = CarregamentosListResponseSchema.parse({
      ok: true,
      page: validated.page,
      pageSize: validated.pageSize,
      total: result.total,
      items: validatedItems,
    });

    return successResponse(response);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      console.error("Erro de validação Zod:", error);
      return errorResponse("Parâmetros inválidos", 400, error);
    }
    console.error("Erro ao listar carregamentos:", error);
    if (error instanceof Error) {
      console.error("Stack trace:", error.stack);
    }
    return errorResponse("Erro ao listar carregamentos", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSession();
    if (!user) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const validated = CreateCarregamentoBodySchema.parse(body);

    const item = await createCarregamento(validated);

    await createLog({
      acao: "criar_carregamento_espera",
      detalhes: `Carregamento ${item.id} criado em standby - Placa: ${item.placa}`,
      carregamento_id: item.id,
      user_id: user.id,
    });

    const response = CreateCarregamentoResponseSchema.parse({
      ok: true,
      item,
    });

    return successResponse(response);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return errorResponse("Dados inválidos", 400, error);
    }
    console.error("Erro ao criar carregamento:", error);
    return errorResponse("Erro ao criar carregamento", 500);
  }
}

