import { NextResponse } from "next/server";

export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}

export function errorResponse(
  message: string,
  status = 400,
  details?: unknown
) {
  const response: { ok: boolean; error: string; details?: unknown } = {
    ok: false,
    error: message,
  };
  if (details !== undefined && details !== null) {
    response.details = details;
  }
  return NextResponse.json(response, {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}

export function unauthorizedResponse(message = "Não autorizado") {
  return errorResponse(message, 401);
}

export function forbiddenResponse(message = "Acesso negado") {
  return errorResponse(message, 403);
}

export function notFoundResponse(message = "Recurso não encontrado") {
  return errorResponse(message, 404);
}

export function serverErrorResponse(
  message = "Erro interno do servidor",
  details?: unknown
) {
  return errorResponse(message, 500, details);
}

