import { NextRequest } from "next/server";
import { deleteSessionCookie, getSession } from "@/lib/auth/session";
import { successResponse, unauthorizedResponse } from "@/lib/utils/response";
import { createLog } from "@/lib/db/queries/logs";

export async function POST(request: NextRequest) {
  const user = await getSession();

  if (user) {
    await createLog({
      acao: "logout",
      detalhes: `Logout realizado: ${user.email}`,
      user_id: user.id,
    });
  }

  await deleteSessionCookie();

  return successResponse({ ok: true });
}

