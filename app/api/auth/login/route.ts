import { NextRequest } from "next/server";
import { LoginBodySchema, LoginResponseSchema } from "@/lib/validators/auth";
import { getUserByEmail } from "@/lib/db/queries/usuarios";
import { verifyPassword } from "@/lib/auth/password";
import { createSession, setSessionCookie } from "@/lib/auth/session";
import { successResponse, errorResponse } from "@/lib/utils/response";
import { createLog } from "@/lib/db/queries/logs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = LoginBodySchema.parse(body);

    const user = await getUserByEmail(validated.email);

    if (!user || !user.is_active) {
      return errorResponse("Email ou senha inválidos", 401);
    }

    const isValid = await verifyPassword(validated.password, user.password_hash);

    if (!isValid) {
      return errorResponse("Email ou senha inválidos", 401);
    }

    const sessionUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as "admin" | "faturador",
    };

    const token = await createSession(sessionUser);
    await setSessionCookie(token);

    await createLog({
      acao: "login",
      detalhes: `Login realizado: ${user.email}`,
      user_id: user.id,
    });

    const response = LoginResponseSchema.parse({
      ok: true,
      user: sessionUser,
    });

    return successResponse(response);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return errorResponse("Dados inválidos", 400, error);
    }
    console.error("Erro no login:", error);
    return errorResponse("Erro ao fazer login", 500);
  }
}

